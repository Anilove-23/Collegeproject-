/**
 * sockets/allocation.socket.js - Pusher singleton
 *
 * Architecture rules:
 *   - connect() is called ONCE by AllocationLayout on mount.
 *   - disconnect() is called ONCE by AllocationLayout on unmount.
 *   - joinHostel(hostelId) is called whenever the active hostel changes.
 *   - Individual hooks ONLY call .on() / .off() - never connect/disconnect.
 */
import Pusher from 'pusher-js';
import { WS_EVENTS } from './events.js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const GLOBAL_CHANNEL = import.meta.env.VITE_PUSHER_GLOBAL_CHANNEL ?? 'allocation-global';

function hostelChannelName(hostelId) {
    return `hostel-${hostelId}`;
}

class AllocationSocket {
    constructor() {
        this._pusher = null;
        this._globalChannel = null;
        this._hostelChannel = null;
        this._hostelId = null;
        this._handlers = new Map();
    }

    connect() {
        if (this._pusher) return this;

        if (!PUSHER_KEY || !PUSHER_CLUSTER) {
            console.warn('[AllocationSocket] Missing VITE_PUSHER_KEY or VITE_PUSHER_CLUSTER. Realtime disabled.');
            return this;
        }

        this._pusher = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER,
        });

        this._pusher.connection.bind('connected', () => {
            console.info('[AllocationSocket] Connected to Pusher');
        });

        this._pusher.connection.bind('error', (err) => {
            const msg = err?.error?.message ?? 'Unknown Pusher error';
            console.warn('[AllocationSocket] Connection error:', msg);
        });

        this._pusher.connection.bind('disconnected', () => {
            console.info('[AllocationSocket] Disconnected from Pusher');
        });

        this._globalChannel = this._pusher.subscribe(GLOBAL_CHANNEL);
        this._bindAllHandlersToChannel(this._globalChannel);

        if (this._hostelId) {
            this._subscribeHostelChannel(this._hostelId);
        }

        return this;
    }

    joinHostel(hostelId) {
        if (hostelId === this._hostelId) return this;

        if (this._hostelChannel && this._pusher) {
            this._unbindAllHandlersFromChannel(this._hostelChannel);
            this._pusher.unsubscribe(this._hostelChannel.name);
            this._hostelChannel = null;
        }

        this._hostelId = hostelId;

        if (this._pusher && hostelId) {
            this._subscribeHostelChannel(hostelId);
        }

        return this;
    }

    disconnect() {
        if (!this._pusher) return;

        if (this._hostelChannel) {
            this._unbindAllHandlersFromChannel(this._hostelChannel);
        }

        if (this._globalChannel) {
            this._unbindAllHandlersFromChannel(this._globalChannel);
        }

        this._pusher.disconnect();
        this._pusher = null;
        this._globalChannel = null;
        this._hostelChannel = null;
    }

    on(event, handler) {
        if (!this._handlers.has(event)) {
            this._handlers.set(event, new Set());
        }

        this._handlers.get(event).add(handler);

        if (this._globalChannel) {
            this._globalChannel.bind(event, handler);
        }

        if (this._hostelChannel) {
            this._hostelChannel.bind(event, handler);
        }

        return () => this.off(event, handler);
    }

    off(event, handler) {
        const listeners = this._handlers.get(event);
        if (listeners) {
            listeners.delete(handler);
            if (listeners.size === 0) {
                this._handlers.delete(event);
            }
        }

        this._globalChannel?.unbind(event, handler);
        this._hostelChannel?.unbind(event, handler);
    }

    get isConnected() {
        return this._pusher?.connection?.state === 'connected';
    }

    _subscribeHostelChannel(hostelId) {
        const channel = this._pusher.subscribe(hostelChannelName(hostelId));
        this._hostelChannel = channel;
        this._bindAllHandlersToChannel(channel);
    }

    _bindAllHandlersToChannel(channel) {
        for (const [event, handlers] of this._handlers.entries()) {
            for (const handler of handlers) {
                channel.bind(event, handler);
            }
        }
    }

    _unbindAllHandlersFromChannel(channel) {
        for (const [event, handlers] of this._handlers.entries()) {
            for (const handler of handlers) {
                channel.unbind(event, handler);
            }
        }
    }
}

export const allocationSocket = new AllocationSocket();
export { WS_EVENTS };

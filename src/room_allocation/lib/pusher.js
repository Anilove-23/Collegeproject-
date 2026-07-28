/**
 * lib/pusher.js
 *
 * Re-exports the existing singleton AllocationSocket so that TanStack Query
 * hooks can reference it without importing from the sockets/ directory directly.
 *
 * The AllocationSocket is still the authoritative Pusher manager — this file
 * is just a convenience re-export for the hooks in this lib-aware layer.
 */
export { allocationSocket } from '../sockets/allocation.socket.js';
export { WS_EVENTS }       from '../sockets/events.js';

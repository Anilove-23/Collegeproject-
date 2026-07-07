/**
 * hooks/useRoundState.js
 *
 * Tracks the current round number and the exact time the round closes.
 *
 * Priority:
 *   1. Real-time: ROUND_OPENED socket event { roundNumber, roundEndsAt }
 *   2. Seed: allocState.roundNumber + allocState.batchStartTime from useActiveBatch
 *      (falls back to 10-min windows only when no socket event has arrived yet)
 *
 * This means the very first render uses the DB-derived approximation,
 * but the moment the backend emits ROUND_OPENED the timer snaps to
 * the authoritative server timestamp.
 */
import { useState, useEffect, useRef } from 'react';
import { allocationSocket, WS_EVENTS } from '../sockets/allocation.socket.js';

/**
 * @param {object|null} allocState  - from useActiveBatch()
 * @returns {{ roundNumber: number|null, roundEndsAt: string|null, source: 'socket'|'derived'|null }}
 */
export function useRoundState(allocState) {
    const [socketRound, setSocketRound] = useState(null); // { roundNumber, roundEndsAt }
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        const handler = (payload) => {
            if (!mountedRef.current) return;
            const roundNumber = payload?.roundNumber ?? payload?.round_number;
            const roundEndsAt = payload?.roundEndsAt ?? payload?.round_ends_at;
            if (roundNumber != null && roundEndsAt) {
                setSocketRound({ roundNumber, roundEndsAt });
            }
        };

        const unsub = allocationSocket.on(WS_EVENTS.ROUND_OPENED, handler);
        return unsub;
    }, []);

    // If we got a live event, prefer it
    if (socketRound) {
        return { ...socketRound, source: 'socket' };
    }

    // Fallback: derive from allocState (uses whatever the server last reported)
    if (allocState?.roundNumber != null && allocState?.batchStartTime) {
        const ROUND_MS = 10 * 60 * 1000;
        const start = new Date(allocState.batchStartTime).getTime();
        const roundEndsAt = new Date(start + allocState.roundNumber * ROUND_MS).toISOString();
        return {
            roundNumber: allocState.roundNumber,
            roundEndsAt,
            source: 'derived',
        };
    }

    return { roundNumber: null, roundEndsAt: null, source: null };
}

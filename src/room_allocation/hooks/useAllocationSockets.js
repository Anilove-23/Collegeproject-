/**
 * hooks/useAllocationSockets.js
 *
 * Centralized Pusher integration for the Room Allocation module.
 *
 * RULES:
 *  - Mount this hook ONCE near the Room Allocation root (AllocationLayout).
 *  - All Pusher subscriptions MUST live here. No component-level subscriptions.
 *  - On each event: invalidate the relevant TanStack Query cache entry.
 *  - Cleanup (unbind/unsubscribe) runs when the component unmounts.
 *
 * Event → Query invalidation map:
 *   ROOM_MAP_UPDATED   → roomKeys.list(hostelId)
 *   ROUND_OPENED       → roomKeys.list(hostelId)
 *   GROUP_UPDATED      → groupKeys.detail(groupId)
 *   GROUP_MEMBERS_UPDATED → groupKeys.members(groupId)
 *   PREFERENCES_UPDATED → preferenceKeys.detail(groupId)
 *   PHASE_CHANGED      → phaseKeys.current(studentId), batchKeys.current(studentId)
 *   BATCH_STARTED      → batchKeys.current(studentId), roomKeys.list(hostelId)
 *   BATCH_ENDED        → batchKeys.current(studentId)
 *   EVALUATION_DONE    → batchKeys.current(studentId), groupKeys.detail(groupId)
 *   ROUND_CYCLE_DONE   → batchKeys.current(studentId)
 *   SYSTEM_PAUSED      → phaseKeys.current(studentId)
 *   SYSTEM_RESUMED     → phaseKeys.current(studentId)
 */
import { useEffect } from 'react';
import { allocationSocket, WS_EVENTS } from '../lib/pusher.js';
import { queryClient } from '../lib/queryClient.js';
import { roomKeys, groupKeys, preferenceKeys, phaseKeys, batchKeys } from './queryKeys.js';

/**
 * @param {object} params
 * @param {string|null} params.studentId  — current student
 * @param {string|null} params.hostelId   — hostel the student belongs to
 * @param {string|null} params.groupId    — current group (if any)
 * @param {Function}    params.navigate   — react-router navigate fn
 */
export function useAllocationSockets({ studentId, hostelId, groupId, navigate } = {}) {
    useEffect(() => {
        // ── ROOM_MAP_UPDATED ──────────────────────────────────────────
        const onRoomMapUpdated = (payload) => {
            const targetHostel = payload?.hostelId ?? hostelId;
            if (targetHostel) {
                queryClient.invalidateQueries({ queryKey: roomKeys.list(targetHostel) });
            }
        };

        // ── ROUND_OPENED ──────────────────────────────────────────────
        const onRoundOpened = () => {
            if (hostelId) {
                queryClient.invalidateQueries({ queryKey: roomKeys.list(hostelId) });
            }
            // A new round also means preferences window is open — reset pref cache
            if (groupId) {
                queryClient.invalidateQueries({ queryKey: preferenceKeys.detail(groupId) });
            }
        };

        // ── ROUND_FROZEN ──────────────────────────────────────────────
        const onRoundFrozen = () => {
            if (hostelId) {
                queryClient.invalidateQueries({ queryKey: roomKeys.list(hostelId) });
            }
        };

        // ── EVALUATION_DONE ───────────────────────────────────────────
        const onEvaluationDone = (payload) => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
                queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
                queryClient.invalidateQueries({ queryKey: batchKeys.result(studentId) });
            }
            if (groupId) {
                queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
                queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
            }

            // ── Shatter redirect ─────────────────────────────────────
            // If this event is a shatter and the current student is one
            // of the affected members, navigate them immediately.
            if (
                payload?.type === 'SHATTERED' &&
                navigate &&
                studentId
            ) {
                const memberIds = payload.memberIds ?? [];
                // memberIds from backend are integers; studentId may be string
                const isAffected = memberIds.some(
                    (id) => String(id) === String(studentId)
                );
                if (isAffected) {
                    navigate('/allocation/shattered', {
                        replace: true,
                        state: { reason: payload.reason },
                    });
                }
            }
        };

        // ── ROUND_CYCLE_DONE ──────────────────────────────────────────
        const onRoundCycleDone = () => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
                queryClient.invalidateQueries({ queryKey: batchKeys.result(studentId) });
            }
            if (hostelId) {
                queryClient.invalidateQueries({ queryKey: roomKeys.list(hostelId) });
            }
        };

        // ── PHASE_CHANGED ─────────────────────────────────────────────
        const onPhaseChanged = () => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            }
            if (groupId) {
                queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
            }
        };

        // ── BATCH_STARTED ─────────────────────────────────────────────
        const onBatchStarted = () => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            }
            if (hostelId) {
                queryClient.invalidateQueries({ queryKey: roomKeys.list(hostelId) });
            }
        };

        // ── BATCH_ENDED ───────────────────────────────────────────────
        const onBatchEnded = () => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
                queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
            }
        };

        // ── NEXT_BATCH_READY ──────────────────────────────────────────
        const onNextBatchReady = () => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            }
        };

        // ── SYSTEM_PAUSED / SYSTEM_RESUMED ────────────────────────────
        const onSystemControl = () => {
            if (studentId) {
                queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
                queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            }
        };

        // ── Bind all listeners ────────────────────────────────────────
        const cleanups = [
            allocationSocket.on(WS_EVENTS.ROOM_MAP_UPDATED,  onRoomMapUpdated),
            allocationSocket.on(WS_EVENTS.ROUND_OPENED,      onRoundOpened),
            allocationSocket.on(WS_EVENTS.ROUND_FROZEN,      onRoundFrozen),
            allocationSocket.on(WS_EVENTS.ROUND_EXECUTED,    onRoundOpened),   // also refreshes rooms
            allocationSocket.on(WS_EVENTS.EVALUATION_DONE,   onEvaluationDone),
            allocationSocket.on(WS_EVENTS.ROUND_CYCLE_DONE,  onRoundCycleDone),
            allocationSocket.on(WS_EVENTS.PHASE_CHANGED,     onPhaseChanged),
            allocationSocket.on(WS_EVENTS.BATCH_STARTED,     onBatchStarted),
            allocationSocket.on(WS_EVENTS.BATCH_ENDED,       onBatchEnded),
            allocationSocket.on(WS_EVENTS.NEXT_BATCH_READY,  onNextBatchReady),
            allocationSocket.on(WS_EVENTS.SYSTEM_PAUSED,     onSystemControl),
            allocationSocket.on(WS_EVENTS.SYSTEM_RESUMED,    onSystemControl),
        ];

        // ── Cleanup: unbind all listeners on unmount ───────────────────
        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [studentId, hostelId, groupId]);
}

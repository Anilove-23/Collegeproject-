/**
 * hooks/usePhase.js
 *
 * TanStack Query hook for fetching the current hostel phase and allocation state.
 * Wraps getAllocationState which already normalises the full backend payload.
 *
 * staleTime: 60 s — phase changes are infrequent but critical;
 *   Pusher PHASE_CHANGED invalidates immediately for all clients.
 */
import { useQuery } from '@tanstack/react-query';
import { phaseKeys } from './queryKeys.js';
import { getAllocationState } from '../api/phase.api.js';

/**
 * @param {string|null} studentId  — current logged-in student
 *
 * Returns the full normalised allocation state object (phase, hostelId, squad
 * info, batch info, etc.) — same shape as getAllocationState().
 */
export function usePhase(studentId) {
    return useQuery({
        queryKey: phaseKeys.current(studentId),
        queryFn:  () => getAllocationState(studentId),
        enabled:  !!studentId,
        staleTime: 60_000,
    });
}

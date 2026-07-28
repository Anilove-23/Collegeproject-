/**
 * hooks/useActiveBatch.js
 *
 * TanStack Query hook for the current student's full allocation / batch state.
 *
 * This is the primary hook for WaitingRoomPage and similar pages that need to
 * know the student's batch number, round, submission status, etc.
 *
 * staleTime: 30 s
 * Pusher BATCH_STARTED / BATCH_ENDED / EVALUATION_DONE / ROUND_CYCLE_DONE
 * events will invalidate immediately via useAllocationSockets.
 */
import { useQuery } from '@tanstack/react-query';
import { batchKeys } from './queryKeys.js';
import { getAllocationState } from '../api/phase.api.js';

/**
 * @param {string|null} studentId
 */
export function useActiveBatch(studentId) {
    return useQuery({
        queryKey: batchKeys.current(studentId),
        queryFn:  () => getAllocationState(studentId),
        enabled:  !!studentId,
        staleTime: 30_000,
    });
}

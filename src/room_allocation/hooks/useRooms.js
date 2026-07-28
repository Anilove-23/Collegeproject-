/**
 * hooks/useRooms.js
 *
 * TanStack Query hook for fetching all rooms for a hostel.
 *
 * staleTime: 30 s — rooms change during LIVE_BATCHES rounds;
 *   Pusher ROOM_MAP_UPDATED / ROUND_OPENED events will invalidate sooner.
 */
import { useQuery } from '@tanstack/react-query';
import { roomKeys } from './queryKeys.js';
import { getAvailableRooms } from '../api/rooms.api.js';

/**
 * @param {string|null} hostelId
 * @param {string|null} [studentId]
 */
export function useRooms(hostelId, studentId = null) {
    return useQuery({
        queryKey: roomKeys.list(hostelId),
        queryFn:  () => getAvailableRooms(hostelId, studentId),
        enabled:  !!hostelId,
        staleTime: 30_000,
    });
}

/**
 * hooks/useRoom.js
 *
 * TanStack Query hook for fetching a single room's details.
 *
 * staleTime: 30 s
 */
import { useQuery } from '@tanstack/react-query';
import { roomKeys } from './queryKeys.js';
import { getRoomDetails } from '../api/rooms.api.js';

/**
 * @param {string|null} roomId
 */
export function useRoom(roomId) {
    return useQuery({
        queryKey: roomKeys.detail(roomId),
        queryFn:  () => getRoomDetails(roomId),
        enabled:  !!roomId,
        staleTime: 30_000,
    });
}

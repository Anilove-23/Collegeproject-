import { useQuery } from '@tanstack/react-query';
import { roomKeys } from './queryKeys.js';
import { getRoomFilters } from '../api/rooms.api.js';

export function useRoomFilters(hostelId) {
    return useQuery({
        queryKey: roomKeys.filters(hostelId),
        queryFn: () => getRoomFilters(hostelId),
        enabled: !!hostelId,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

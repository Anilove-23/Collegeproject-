/**
 * hooks/useGroup.js
 *
 * TanStack Query hook for fetching a single group's details
 * (from v_housing_group_with_size on the backend).
 *
 * staleTime: 30 s
 * Pusher GROUP_UPDATED will invalidate immediately for all connected clients.
 */
import { useQuery } from '@tanstack/react-query';
import { groupKeys } from './queryKeys.js';
import { getGroupMembers } from '../api/groups.api.js';

/**
 * Returns { group, members } shaped exactly like group.service.getGroupMembers().
 * @param {string|null} groupId
 */
export function useGroup(groupId) {
    return useQuery({
        queryKey: groupKeys.detail(groupId),
        queryFn:  () => getGroupMembers(groupId),
        enabled:  !!groupId,
        staleTime: 30_000,
        select:   (data) => data?.group ?? null,
    });
}

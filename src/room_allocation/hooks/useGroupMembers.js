/**
 * hooks/useGroupMembers.js
 *
 * TanStack Query hook for fetching the member list of a group.
 * Shares the same underlying API call as useGroup but selects only the members array.
 *
 * Having a separate hook allows components that only need the member list to
 * subscribe to a more targeted cache key (groupKeys.members) and receive
 * targeted Pusher GROUP_MEMBERS_UPDATED invalidations.
 *
 * staleTime: 30 s
 */
import { useQuery } from '@tanstack/react-query';
import { groupKeys } from './queryKeys.js';
import { getGroupMembers } from '../api/groups.api.js';

/**
 * @param {string|null} groupId
 */
export function useGroupMembers(groupId) {
    return useQuery({
        queryKey: groupKeys.members(groupId),
        queryFn:  () => getGroupMembers(groupId),
        enabled:  !!groupId,
        staleTime: 30_000,
        select:   (data) => data?.members ?? [],
    });
}

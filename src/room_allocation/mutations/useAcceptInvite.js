/**
 * mutations/useAcceptInvite.js
 *
 * Accepts an incoming group invite or outgoing application.
 *
 * On success:
 *   1. Invalidate group detail + members (current student joined a group).
 *   2. Invalidate pending requests list.
 *   3. Invalidate allocation state (groupId is now set for the student).
 */
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { groupKeys, batchKeys, phaseKeys } from '../hooks/queryKeys.js';
import { acceptInvite } from '../api/groups.api.js';

/**
 * @param {object} context
 * @param {string} context.studentId
 * @param {string|null} [context.groupId]  — the group being joined (for targeted invalidation)
 */
export function useAcceptInvite({ studentId, groupId = null }) {
    return useMutation({
        mutationFn: (requestId) => acceptInvite(requestId),
        onSuccess: () => {
            // Group membership changed
            if (groupId) {
                queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
                queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
            }
            // Refresh full groups list and pending requests
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
            queryClient.invalidateQueries({ queryKey: groupKeys.requests });
            // Allocation state now includes groupId
            queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
        },
    });
}

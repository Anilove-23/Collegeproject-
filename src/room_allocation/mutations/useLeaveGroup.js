/**
 * mutations/useLeaveGroup.js
 *
 * Removes the current student from their group.
 *
 * On success:
 *   1. Invalidate the group detail + members (student is removed).
 *   2. Invalidate allocation state (groupId is now null).
 *   3. Invalidate public groups (slot count may change).
 */
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { groupKeys, batchKeys, phaseKeys } from '../hooks/queryKeys.js';
import { leaveGroup } from '../api/groups.api.js';

/**
 * @param {object} context
 * @param {string} context.studentId
 * @param {string|null} [context.groupId]  — for targeted invalidation
 */
export function useLeaveGroup({ studentId, groupId = null }) {
    return useMutation({
        mutationFn: () => leaveGroup(studentId),
        onSuccess: () => {
            if (groupId) {
                queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
                queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
            }
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
            queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
        },
    });
}

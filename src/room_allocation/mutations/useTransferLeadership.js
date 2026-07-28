/**
 * mutations/useTransferLeadership.js
 *
 * Transfers the group leader title to another member.
 *
 * On success:
 *   1. Invalidate group detail (primary_applicant_id changes).
 *   2. Invalidate allocation state (isLeader flag changes for both students).
 */
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { groupKeys, batchKeys, phaseKeys } from '../hooks/queryKeys.js';
import { transferLeadership } from '../api/groups.api.js';

/**
 * @param {object} context
 * @param {string} context.studentId  — current leader (used to invalidate their state)
 * @param {string} context.groupId
 */
export function useTransferLeadership({ studentId, groupId }) {
    return useMutation({
        /**
         * @param {string} newLeaderId
         */
        mutationFn: (newLeaderId) => transferLeadership(groupId, newLeaderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
            queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
            queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
        },
    });
}

/**
 * mutations/useCreateGroup.js
 *
 * Creates a new housing group for the current student.
 * On success: invalidates batchKeys.current (allocation state includes groupId).
 */
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { batchKeys, groupKeys, phaseKeys } from '../hooks/queryKeys.js';
import { createGroup } from '../api/groups.api.js';

/**
 * @param {string} studentId  — used to know which cache keys to invalidate
 */
export function useCreateGroup(studentId) {
    return useMutation({
        mutationFn: () => createGroup(studentId),
        onSuccess: () => {
            // The allocation state now includes a groupId — refresh it
            queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
            queryClient.invalidateQueries({ queryKey: phaseKeys.current(studentId) });
            // Also refresh the public groups list (new group appears)
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        },
    });
}

/**
 * mutations/useSubmitPreferences.js
 *
 * Submits the student's ranked preference list for the current round.
 *
 * On success:
 *   1. Invalidate preferenceKeys.detail(groupId) — cached prefs are now stale.
 *   2. Invalidate batchKeys.current(studentId)   — submitted flag changes.
 *
 * Note: Do NOT wait for Pusher. The acting user should see the update immediately.
 */
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { preferenceKeys, batchKeys } from '../hooks/queryKeys.js';
import { submitPreferences } from '../api/preferences.api.js';

/**
 * @param {object} context
 * @param {string} context.studentId
 * @param {string} context.groupId
 */
export function useSubmitPreferences({ studentId, groupId }) {
    return useMutation({
        /**
         * @param {{ groupId, batchId, roundNumber, submittedBy, preferences: string[] }} payload
         */
        mutationFn: (payload) => submitPreferences(payload),
        onSuccess: () => {
            // Immediately mark local preference cache as stale
            queryClient.invalidateQueries({ queryKey: preferenceKeys.detail(groupId) });
            // Refresh allocation state (submitted flag)
            queryClient.invalidateQueries({ queryKey: batchKeys.current(studentId) });
        },
    });
}

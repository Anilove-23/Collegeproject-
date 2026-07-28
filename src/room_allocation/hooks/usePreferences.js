/**
 * hooks/usePreferences.js
 *
 * TanStack Query hook for fetching a group's submitted preferences.
 *
 * staleTime: Infinity
 *   Preferences are immutable within a round — the backend only accepts one
 *   submission per round.  The cache is invalidated explicitly by
 *   useSubmitPreferences.onSuccess and by Pusher PREFERENCES_UPDATED.
 */
import { useQuery } from '@tanstack/react-query';
import { preferenceKeys } from './queryKeys.js';
import { getAllocationHistory } from '../api/preferences.api.js';

/**
 * @param {string|null} batchId  — we proxy via getAllocationHistory (batchId)
 *
 * Note: the backend doesn't expose a dedicated GET /preferences/:groupId endpoint yet.
 * Until one exists, we read submitted history from the batch results endpoint.
 * Replace queryFn when a dedicated endpoint is added.
 */
export function usePreferences(batchId) {
    return useQuery({
        queryKey: preferenceKeys.detail(batchId),
        queryFn:  () => getAllocationHistory(batchId),
        enabled:  !!batchId,
        staleTime: Infinity,
    });
}

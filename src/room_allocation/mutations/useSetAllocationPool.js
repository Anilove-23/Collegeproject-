/**
 * mutations/useSetAllocationPool.js
 *
 * Saves the room pool configuration for a FROM hostel.
 *
 * On success:
 *   1. Invalidate adminKeys.pool(fromHostelId)  — pool config is now stale.
 *   2. Invalidate adminKeys.hostels()           — allocation_date / lobby_opens_at changed.
 *   3. Invalidate roomKeys.list(hostelId) for each TO hostel — rooms cache busted
 *      (mirrors the server-side Redis invalidation on the backend).
 */
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { adminKeys } from '../hooks/queryKeys.js';
import { roomKeys } from '../hooks/queryKeys.js';
import { setAllocationPool } from '../api/admin.api.js';

/**
 * @param {object} [opts]
 * @param {function} [opts.onSuccess]  — extra callback after successful save
 */
export function useSetAllocationPool({ onSuccess } = {}) {
    return useMutation({
        mutationFn: (payload) => setAllocationPool(payload),

        onSuccess: (data, variables) => {
            const { fromHostelId, hostels: toHostelEntries = [] } = variables;

            // Pool config for this source hostel is stale
            queryClient.invalidateQueries({ queryKey: adminKeys.pool(fromHostelId) });

            // Admin hostel list (allocation_date updated)
            queryClient.invalidateQueries({ queryKey: adminKeys.hostels() });

            // Bust room cache for every TO hostel — consistent with backend Redis invalidation
            for (const { hostelId } of toHostelEntries) {
                queryClient.invalidateQueries({ queryKey: roomKeys.list(hostelId) });
            }

            onSuccess?.(data);
        },
    });
}

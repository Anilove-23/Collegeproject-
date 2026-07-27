/**
 * lib/queryClient.js
 *
 * Single QueryClient instance for the entire Room Allocation module.
 * Import this directly in hooks/mutations — never create a new one.
 *
 * Defaults chosen for Room Allocation:
 *   staleTime          30 s  – data is "fresh" for 30 s; no background refetch in that window
 *   retry              1     – one retry on network failure, then throw
 *   refetchOnWindowFocus false – no surprise re-fetches when user switches tabs
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime:           30_000,  // 30 seconds
            retry:               1,
            refetchOnWindowFocus: false,
        },
    },
});

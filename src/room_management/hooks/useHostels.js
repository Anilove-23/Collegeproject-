import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

export const useHostels = () => {
  return useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const body = await apiFetch('/api/hostels');
      if (!body?.success) throw new Error(body?.message || 'Failed to load hostels');
      return body.hostels;
    },
    staleTime: 5 * 60 * 1000,
  });
};

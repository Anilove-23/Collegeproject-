import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

export const useStudentSearch = (query) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['student-search', trimmed],
    queryFn: async () => {
      const body = await apiFetch(`/api/students/search?q=${encodeURIComponent(trimmed)}&scope=all`);
      if (!body?.success) throw new Error(body?.message || 'Search failed');
      return body.students;
    },
    enabled: trimmed.length >= 2,
    staleTime: 10_000,
  });
};

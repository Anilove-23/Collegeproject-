import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

export const useStudentDirectory = (query) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['student-directory', trimmed],
    queryFn: async () => {
      const body = await apiFetch(`/api/students/directory?q=${encodeURIComponent(trimmed)}`);
      if (!body?.success) throw new Error(body?.message || 'Search failed');
      return body.students;
    },
    enabled: trimmed.length >= 2,
    staleTime: 10_000,
  });
};

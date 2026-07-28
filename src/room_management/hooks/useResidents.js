import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

export const useResidents = (hostelId) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['rooms', hostelId] });
    // Prefix match (no second key segment) invalidates every cached search string.
    queryClient.invalidateQueries({ queryKey: ['student-directory'] });
    queryClient.invalidateQueries({ queryKey: ['student-search'] });
  };

  const assignResidentMutation = useMutation({
    mutationFn: ({ roomId, studentId }) =>
      apiFetch(`/api/v1/hostels/${hostelId}/rooms/${roomId}/residents`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      }),
    onSuccess: invalidate,
  });

  const removeResidentMutation = useMutation({
    mutationFn: ({ roomId, studentId }) =>
      apiFetch(`/api/v1/hostels/${hostelId}/rooms/${roomId}/residents/${studentId}`, {
        method: 'DELETE',
      }),
    onSuccess: invalidate,
  });

  return {
    handleAssignResident: (roomId, studentId) => assignResidentMutation.mutateAsync({ roomId, studentId }),
    handleRemoveResident: (roomId, studentId) => removeResidentMutation.mutateAsync({ roomId, studentId }),
  };
};

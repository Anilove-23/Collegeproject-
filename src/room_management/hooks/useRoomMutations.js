import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

export const useRoomMutations = (hostelId) => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['rooms', hostelId] });

  const addRoomMutation = useMutation({
    mutationFn: (newRoom) =>
      apiFetch(`/api/v1/hostels/${hostelId}/rooms`, {
        method: 'POST',
        body: JSON.stringify(newRoom),
      }),
    onSuccess: invalidate,
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ roomId, updatedData }) =>
      apiFetch(`/api/v1/hostels/${hostelId}/rooms/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      }),
    onSuccess: invalidate,
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId) =>
      apiFetch(`/api/v1/hostels/${hostelId}/rooms/${roomId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (roomsArray) =>
      apiFetch(`/api/v1/hostels/${hostelId}/rooms/bulk`, {
        method: 'POST',
        body: JSON.stringify({ rooms: roomsArray }),
      }),
    onSuccess: invalidate,
  });

  return {
    handleAddRoom: (data) => addRoomMutation.mutateAsync(data),
    handleUpdateRoom: (roomId, data) => updateRoomMutation.mutateAsync({ roomId, updatedData: data }),
    handleDeleteRoom: (roomId) => deleteRoomMutation.mutateAsync(roomId),
    handleBulkUpload: (rooms) => bulkUploadMutation.mutateAsync(rooms),
  };
};

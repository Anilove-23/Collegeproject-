import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

export const useRooms = (hostelId) => {
  return useQuery({
    queryKey: ['rooms', hostelId],
    queryFn: () => apiFetch(`/api/v1/hostels/${hostelId}/rooms`),
    enabled: !!hostelId, // Sirf tabhi call karo jab hostelId available ho
  });
};

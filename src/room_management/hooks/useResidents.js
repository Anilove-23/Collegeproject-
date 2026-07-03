import { useQueryClient } from '@tanstack/react-query';
import { mockRooms } from '../api/mockData';

export const useResidents = () => {
  const queryClient = useQueryClient();

  const handleUpdateResidents = (roomId, updatedResidentsArray, setSelectedRoomForResidents) => {
    const roomIndex = mockRooms.findIndex(r => r.id === roomId);
    if (roomIndex > -1) {
      mockRooms[roomIndex].residents = updatedResidentsArray;
      
      // Update the modal's state instantly
      setSelectedRoomForResidents({ ...mockRooms[roomIndex] });
      
      // Refresh the background cards
      queryClient.invalidateQueries(['rooms']);
    }
  };

  return { handleUpdateResidents };
};
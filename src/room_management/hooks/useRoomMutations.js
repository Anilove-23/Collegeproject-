import { useQueryClient } from '@tanstack/react-query';
import { mockRooms } from '../api/mockData';

export const useRoomMutations = () => {
  const queryClient = useQueryClient();

  const handleAddRoom = (newRoomData) => {
    const newRoom = {
      id: `r${Math.random()}`,
      roomNumber: newRoomData.roomNumber,
      capacity: parseInt(newRoomData.capacity),
      status: newRoomData.status,
      hostelId: "Hostel A", 
      residents: [],
    };
    mockRooms.push(newRoom);
    queryClient.invalidateQueries(['rooms']);
  };

  const handleBulkUpload = (newRoomsArray) => {
    const formattedNewRooms = newRoomsArray.map(room => ({
      id: `r${Math.random()}`,
      roomNumber: room.roomNumber,
      capacity: room.capacity || 2,
      status: room.status || 'STUDENT',
      hostelId: "Hostel A",
      residents: [],
    }));
    mockRooms.push(...formattedNewRooms);
    queryClient.invalidateQueries(['rooms']);
  };

  const handleUpdateRoom = (updatedRoom) => {
    const roomIndex = mockRooms.findIndex(r => r.id === updatedRoom.id);
    if (roomIndex > -1) {
      mockRooms[roomIndex] = updatedRoom;
      queryClient.invalidateQueries(['rooms']);
    }
  };

  const handleDeleteRoom = (roomId) => {
    const roomIndex = mockRooms.findIndex(r => r.id === roomId);
    if (roomIndex > -1) {
      mockRooms.splice(roomIndex, 1);
      queryClient.invalidateQueries(['rooms']);
    }
  };

  return { handleAddRoom, handleBulkUpload, handleUpdateRoom, handleDeleteRoom };
};
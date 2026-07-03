// src/room_management/hooks/useRooms.js
import { useQuery } from '@tanstack/react-query';
import { mockRooms } from '../api/mockData';

// Fake API call that simulates network delay
const fetchRooms = async (hostelId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // If a specific hostel is requested, filter it. Otherwise, return all.
      const data = hostelId 
        ? mockRooms.filter(room => room.hostelId === hostelId)
        : mockRooms;
      resolve(data);
    }, 1000); // 1 second fake delay
  });
};

export const useRooms = (hostelId = null) => {
  return useQuery({
    queryKey: ['rooms', hostelId], // Cache key
    queryFn: () => fetchRooms(hostelId),
  });
};
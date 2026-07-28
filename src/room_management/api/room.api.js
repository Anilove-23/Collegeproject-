import axios from 'axios';

// Create a dedicated Axios instance for the Room Management module
// You will update this baseURL once the backend server is running
const roomApi = axios.create({
  baseURL: '/api/v1/hostels', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the auth token to every request
roomApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================================
   ROOM CRUD OPERATIONS
========================================= */

// GET: Fetch all rooms for a specific hostel
export const fetchRoomsAPI = async (hostelId) => {
  const { data } = await roomApi.get(`/${hostelId}/rooms`);
  return data;
};

// POST: Create a single new room
export const createRoomAPI = async (hostelId, roomData) => {
  const { data } = await roomApi.post(`/${hostelId}/rooms`, roomData);
  return data;
};

// PUT: Update room details (Capacity, Status)
export const updateRoomAPI = async (hostelId, roomId, roomData) => {
  const { data } = await roomApi.put(`/${hostelId}/rooms/${roomId}`, roomData);
  return data;
};

// DELETE: Remove a room entirely
export const deleteRoomAPI = async (hostelId, roomId) => {
  const { data } = await roomApi.delete(`/${hostelId}/rooms/${roomId}`);
  return data;
};

/* =========================================
   BULK & RESIDENT OPERATIONS
========================================= */

// POST: Upload an array of rooms from the CSV parser
export const bulkUploadRoomsAPI = async (hostelId, roomsArray) => {
  const { data } = await roomApi.post(`/${hostelId}/rooms/bulk`, { rooms: roomsArray });
  return data;
};

// PUT: Update the residents list (Evict or Assign)
export const updateResidentsAPI = async (hostelId, roomId, updatedResidents) => {
  const { data } = await roomApi.put(`/${hostelId}/rooms/${roomId}/residents`, { residents: updatedResidents });
  return data;
};
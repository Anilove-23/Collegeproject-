/**
 * api/room.api.js - Room data REST calls
 *
 * Supports both legacy snake_case and current camelCase backend payloads.
 */
import client from './client.js';

/**
 * Parse block and floor from room number, e.g. "C-302" -> block:"C", floor:3.
 */
function normaliseRoom(r) {
  const roomNumber = r.roomNumber ?? r.room_number ?? String(r.id ?? '');
  const capacity = Number(r.capacity ?? r.max_capacity ?? r.maxCapacity ?? 0);
  const occupancy = Number(r.occupancy ?? r.current_occupancy ?? r.currentOccupancy ?? 0);

  const parts = roomNumber.split('-');
  const block = parts[0] ?? '?';
  const num = parts[1] ?? '';
  const floor = num.length >= 1 ? parseInt(num[0], 10) : 0;

  return {
    id: r.id,
    roomNo: roomNumber,
    block,
    floor,
    type:
      capacity === 4
        ? '4-Seater'
        : capacity === 3
          ? '3-Seater'
          : capacity === 2
            ? '2-Seater'
            : '1-Seater',
    total: capacity,
    occupied: occupancy,
    available: r.available ?? occupancy < capacity,
    remainingBeds: r.remainingBeds ?? Math.max(0, capacity - occupancy),
  };
}

/**
 * Fetch the live room map for a hostel (available rooms only).
 */
export const getAvailableRooms = async (hostelId, studentId = null) => {
  const url = studentId ? `/allocation/rooms/${hostelId}?studentId=${studentId}` : `/allocation/rooms/${hostelId}`;
  const data = await client.get(url);
  const rooms = data.rooms ?? data.data ?? data ?? [];
  return rooms.map(normaliseRoom);
};

/** Get full details of one room. */
export const getRoomDetails = async (id) => {
  const data = await client.get(`/rooms/${id}`);
  return normaliseRoom(data.room ?? data);
};

/** Get occupancy for one room (lightweight). */
export const getRoomOccupancy = async (id) => {
  const data = await client.get(`/rooms/${id}`);
  const r = normaliseRoom(data.room ?? data);
  return { id, occupied: r.occupied, total: r.total };
};

/** Get room filters (cached from backend). */
export const getRoomFilters = async (hostelId) => {
  const data = await client.get(`/allocation/filters/${hostelId}`);
  return {
    availableTypes: data.availableTypes || [],
    availableBlocks: data.availableBlocks || [],
  };
};
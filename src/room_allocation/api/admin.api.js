/**
 * api/admin.api.js — Admin allocation pool REST calls
 *
 * All functions use the shared client (auth headers, error throwing)
 * and return plain JS values ready for TanStack Query.
 */
import client from './client.js';

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all hostels (admin view — name, phase, dates).
 * Used by AllocationAdminPage to populate the From-Hostel selector
 * and the status table.
 */
export const getAdminHostels = async () => {
    const data = await client.get('/admin/hostels');
    return data.hostels ?? [];
};

/**
 * Fetch all hostels with their rooms, grouped for the pool configurator.
 * Returns: [{ id, name, type, rooms: [{ id, room_number, block, ... }] }]
 */
export const getHostelsWithRooms = async () => {
    const data = await client.get('/admin/hostels-with-rooms');
    return data.hostels ?? [];
};

/**
 * Fetch all allocation events.
 */
export const getEvents = async () => {
    const data = await client.get('/admin/events');
    return data.events ?? [];
};

/**
 * Fetch the current room pool for an event.
 * Returns: { eventId, totalRooms, hostels: [{ hostelId, hostelName, rooms: [] }] }
 */
export const getEventPool = async (eventId) => {
    if (!eventId) return { eventId, totalRooms: 0, hostels: [] };
    const data = await client.get(`/admin/events/${eventId}/pool`);
    
    // Map backend snake_case to frontend camelCase
    const hostels = (data.pool || []).map(h => ({
        hostelId: h.hostel_id,
        hostelName: h.hostel_name,
        rooms: h.rooms || []
    }));
    
    const totalRooms = hostels.reduce((sum, h) => sum + h.rooms.length, 0);

    return { eventId, totalRooms, hostels };
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new allocation event.
 */
export const createEvent = async ({ targetYear, allocationDate }) => {
    const data = await client.post('/admin/events', { targetYear, allocationDate });
    return data;
};

/**
 * Update event allocation date.
 */
export const updateEventDate = async (eventId, { allocationDate }) => {
    const data = await client.patch(`/admin/events/${eventId}/date`, { allocationDate });
    return data;
};

/**
 * Save (replace) the room pool for an event.
 *
 * @param {{ hostels: [{ hostelId, rooms: string[]|'ALL' }] }} payload
 */
export const setEventRooms = async (eventId, payload) => {
    const data = await client.patch(`/admin/events/${eventId}/rooms`, payload);
    return data;
};

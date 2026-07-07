/**
 * api/rooms.api.js — Room data REST calls (TanStack Query API layer)
 *
 * Re-exports the existing room.api.js functions under the names expected by
 * the new query hooks.  This avoids duplicating the normaliseRoom logic.
 */
export {
    getAvailableRooms,
    getRoomDetails,
    getRoomOccupancy,
    getRoomFilters,
} from './room.api.js';

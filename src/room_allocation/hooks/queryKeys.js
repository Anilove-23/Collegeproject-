/**
 * hooks/queryKeys.js — Centralized query key factory
 *
 * ALL query invalidations and useQuery calls must reference these factories.
 * Never construct query keys inline inside a component or hook.
 *
 * Key shape conventions:
 *   - Lists   use a single-element array, e.g. ['rooms']
 *   - Details use a two-element array, e.g. ['room', id]
 *   - Sub-collections use three elements, e.g. ['group-members', groupId]
 */

// ── Rooms ─────────────────────────────────────────────────────────────────────
export const roomKeys = {
    /** All rooms for a hostel: roomKeys.list(hostelId) */
    list:   (hostelId) => ['rooms', hostelId],
    /** Single room: roomKeys.detail(roomId) */
    detail: (roomId)   => ['room', roomId],
    /** Filters for a hostel: roomKeys.filters(hostelId) */
    filters: (hostelId) => ['room-filters', hostelId],
};

// ── Groups / Squads ───────────────────────────────────────────────────────────
export const groupKeys = {
    /** All public groups */
    all:     ['groups'],
    /** Single group detail: groupKeys.detail(groupId) */
    detail:  (groupId) => ['group', groupId],
    /** Member list for a group: groupKeys.members(groupId) */
    members: (groupId) => ['group-members', groupId],
    /** Pending requests (inbox + outbox) for the current student */
    requests: ['group-requests'],
};

// ── Preferences ───────────────────────────────────────────────────────────────
export const preferenceKeys = {
    /** Submitted preferences for a group: preferenceKeys.detail(groupId) */
    detail: (groupId) => ['preferences', groupId],
};

// ── Phase ─────────────────────────────────────────────────────────────────────
export const phaseKeys = {
    /** Current phase for a hostel: phaseKeys.current(hostelId) */
    current: (hostelId) => ['phase', hostelId],
};

// ── Active Batch / Allocation State ───────────────────────────────────────────
export const batchKeys = {
    /** Full allocation state for a student: batchKeys.current(studentId) */
    current: (studentId) => ['active-batch', studentId],
    /** Final allocation result: batchKeys.result(studentId) */
    result:  (studentId) => ['final-allocation', studentId],
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminKeys = {
    /** All hostels list (admin view): adminKeys.hostels() */
    hostels: () => ['admin-hostels'],
    /** All hostels with their rooms (pool configurator): adminKeys.hostelsWithRooms() */
    hostelsWithRooms: () => ['admin-hostels-with-rooms'],
    /** Current pool config for a FROM hostel: adminKeys.pool(fromHostelId) */
    pool: (fromHostelId) => ['admin-pool', fromHostelId],
};

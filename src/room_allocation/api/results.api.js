/**
 * api/results.api.js — Final allocation result for a student
 *
 * Uses GET /allocation/status/:studentId (same endpoint as state).
 * When isAllocated=true, the response includes room + roommates.
 */
import client from './client.js';

/**
 * Get the final allocation result for the current student.
 * Returns null if not yet allocated.
 */
export const getFinalAllocation = async (studentId) => {
  if (!studentId) return null;
  const data = await client.get(`/allocation/status/${studentId}`);
  const r = data.result ?? data;

  if (!r.is_allotted || !r.allocated_room_id) return null;

  return {
    status:      'ALLOCATED',
    room: {
      id:      r.allocated_room_id,
      roomNo:  r.room_number ?? null,
      block:   r.room_block  ?? null,
      floor:   r.room_floor  ?? null,
      type:    r.room_type   ?? null,
      hostel:  r.hostel_name ?? null,
    },
    method:      r.assigned_by ?? 'ALGORITHM',
    round:       r.allocated_round ?? null,
    batch:       r.allocated_batch ?? null,
    allocatedAt: r.allocated_at    ?? null,
    roommates:   (r.roommates ?? []).map((rm) => ({
      id:       rm.id,
      name:     rm.name,
      cgpa:     rm.cgpa,
      initials: rm.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??',
    })),
  };
};

/**
 * Download the allotment letter PDF.
 * Backend should return a signed URL or stream.
 * TODO: implement when backend adds this endpoint.
 */
export const downloadAllotmentLetter = async (studentId) => {
  // Placeholder — endpoint doesn't exist yet
  console.warn('[results.api] downloadAllotmentLetter: endpoint not implemented');
  return { url: '#' };
};
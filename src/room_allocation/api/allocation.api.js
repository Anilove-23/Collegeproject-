/**
 * api/allocation.api.js — Allocation state and preference submission
 */
import client from './client.js';

/**
 * Normalise the backend /allocation/status response into the shape
 * the frontend hooks expect.
 */
function normaliseStatus(raw) {
  const r = raw.result ?? raw;
  const phase = r.hostel_phase ?? 'ADMIN_MODE';

  // Derive batch_is_active
  const batchIsActive = r.batch_is_active ?? (r.batch_status === 'ACTIVE');

  return {
    // Phase
    phase,
    eventId:             r.event_id ?? null,
    hostelId:            r.hostel_id ?? null,
    hostelName:          r.hostel_name ?? null,
    isPaused:            r.is_paused ?? false,
    allocationDate:      r.allocation_date ?? null,
    lobbyOpensAt:        r.lobby_opens_at ?? null,
    // Target hostel — the hostel whose rooms this student sees and is allocated into
    targetHostelId:      r.target_hostel_id ?? null,
    targetHostelName:    r.target_hostel_name ?? null,

    // Squad / group state
    hasSquad:            !!r.group_id,
    groupId:             r.group_id ?? null,
    groupStatus:         r.group_status ?? null,
    isLeader:            r.is_leader ?? false,
    groupRank:           r.group_rank ?? null,
    rolloverCount:       r.rollover_count ?? 0,
    cgpa:                r.cgpa ?? null,
    individualRank:      r.individual_rank ?? null,

    // Batch state
    batchId:             r.batch_id ?? null,
    batchNumber:         r.batch_number ?? r.batchNumber ?? null,
    batchActive:         batchIsActive,
    batchStartTime:      r.batch_start_time ?? null,
    batchEndTime:        r.batch_end_time ?? null,
    waitingForBatch:     phase === 'SOFT_LOCK' || (phase === 'LIVE_BATCHES' && !batchIsActive),
    roundNumber:         r.current_round ?? null,

    // Submission state
    submitted:           r.submitted_this_round ?? false,
    isRollover:          r.is_rollover_priority ?? false,

    // Outcome
    isAllocated:         r.is_allotted ?? false,
    isPenalized:         r.group_status === 'PENALIZED',
    allocatedRoomId:     r.allocated_room_id ?? null,
    allocatedRoomNumber: r.allocated_room_number ?? null,
    allocatedRoomType:   r.allocated_room_type ?? null,
    roommates:           r.roommates ?? [],
    assignedBy:          r.assigned_by ?? null,
  };
}

/** Get the current student's full allocation state. */
export const getAllocationState = async (studentId) => {
  if (!studentId) return null;
  const data = await client.get(`/allocation/status/${studentId}`);
  return normaliseStatus(data);
};

/** Alias used by some components. */
export const getCurrentBatch = async (studentId) => {
  const state = await getAllocationState(studentId);
  return {
    batchId:     state.batchId,
    batchNumber: state.batchNumber,
    rank:        state.groupRank,
    rollover:    state.isRollover,
    round:       state.roundNumber,
    hostelId:    state.hostelId,
  };
};

/**
 * Submit a ranked list of room preferences for the current round.
 *
 * @param {{ groupId, batchId, roundNumber, submittedBy, preferences: string[] }} payload
 *   preferences: ordered array of room UUIDs (max 10)
 */
export const submitPreferences = async (payload) => {
  const data = await client.post('/allocation/submit-preferences', payload);
  return data.result ?? data;
};

// DEV ONLY
export const triggerDevPhase = async (hostelId, targetPhase) => {
  return await client.post('/allocation/dev/advance-phase', { hostelId, targetPhase });
};

export const triggerResetPhase = async (hostelId) => {
  return await client.post('/allocation/dev/reset-phase', { hostelId });
};

export const getBatches = async (hostelId) => {
  return await client.get(`/allocation/batches/${hostelId}`);
};

/** Get the submission history for a batch. */
export const getAllocationHistory = async (batchId) => {
  if (!batchId) return [];
  const data = await client.get(`/allocation/results/${batchId}`);
  const submissions = data.result?.submissions ?? [];
  return submissions.map((s) => ({
    batchId:  s.batch_id,
    round:    s.round_number,
    result:   s.allocation_result,
    room:     s.room_number ?? null,
    ts:       s.submitted_at,
  }));
};

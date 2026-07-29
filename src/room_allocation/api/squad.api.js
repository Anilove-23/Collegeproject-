/**
 * api/squad.api.js - Group/Squad REST calls
 *
 * Maps frontend "squad" terminology to backend "group" endpoints.
 * All functions return parsed JSON from api/client.js.
 */
import client from './client.js';

/** Create a new squad. `leaderId` = current user's student ID. */
export const createSquad = (studentId) =>
  client.post('/groups/create', { leaderId: studentId });

/** Leave the current squad. */
export const leaveSquad = (studentId) =>
  client.post('/groups/leave', { studentId });

/** Transfer leader title to another squad member. */
export const transferLeadership = (groupId, newLeaderId) =>
  client.post('/groups/transfer-leadership', { groupId, newLeaderId });

/** Kick a member from the group. */
export const kickMember = (groupId, leaderId, memberId) =>
  client.post('/groups/kick', { groupId, leaderId, memberId });

/**
 * Accept an incoming invite/request.
 * Backend endpoint: POST /groups/accept-invite
 */
export const acceptInvite = (requestId) =>
  client.post('/groups/accept-invite', { requestId });

/**
 * Reject an incoming invite/request.
 * Current backend uses the same endpoint with a status field.
 */
export const rejectInvite = (requestId) =>
  client.post('/groups/accept-invite', { requestId, status: 'REJECTED' });

/**
 * Send an invite to a student (leader -> student: INVITE_FROM_PRIMARY)
 * or a student applying to a group (APPLICATION_FROM_STUDENT).
 */
export const sendInvite = ({ groupId, studentId, requestType = 'INVITE_FROM_PRIMARY' }) =>
  client.post('/groups/invite', { groupId, studentId, requestType });

/** Get all pending group requests for inbox/sent state. */
export const getPendingRequests = () =>
  client.get('/groups/requests');

/** Get the members of a specific group. */
export const getGroupMembers = (groupId) =>
  client.get(`/groups/${groupId}/members`);

/** Get all groups (used for browse/public squads view). */
export const getAllGroups = (eventId) => {
  const url = eventId ? `/groups/?eventId=${eventId}` : '/groups/';
  return client.get(url);
};

/** Search students by name or roll number (privacy-safe response). */
export const searchStudents = (q) => {
  if (!q || q.length < 2) return Promise.resolve({ students: [] });
  return client.get(`/students/search?q=${encodeURIComponent(q)}`);
};

/** Get group members with cgpa for lobby/member cards. */
export const getGroupMembersWithCgpa = (groupId) =>
  client.get(`/students/group-members/${groupId}`);

/** Dev helper for quickly filling a squad. */
export const addBotToSquad = (groupId) =>
  client.post('/allocation/dev/add-bot', { groupId });

/** Backward-compatible alias used by some older screens. */
export const removeMember = (memberId, groupId, leaderId) =>
  kickMember(groupId, leaderId, memberId);

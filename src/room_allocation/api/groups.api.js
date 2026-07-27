/**
 * api/groups.api.js — Group / Squad REST calls (TanStack Query API layer)
 *
 * Re-exports squad.api.js functions under unified group-centric names.
 * Also imports from allocation.api.js for the combined getAllocationState.
 */
export {
    createSquad      as createGroup,
    leaveSquad       as leaveGroup,
    transferLeadership,
    kickMember,
    acceptInvite,
    rejectInvite,
    sendInvite,
    getPendingRequests,
    getGroupMembers,
    getAllGroups,
    searchStudents,
    getGroupMembersWithCgpa,
    addBotToSquad,
} from './squad.api.js';

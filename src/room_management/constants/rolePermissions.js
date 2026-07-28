// src/room_management/constants/rolePermissions.js

export const ROLES = {
  ADMIN: 'admin',
  CHIEF_WARDEN: 'chief_warden',
  WARDEN: 'warden',
  STUDENT: 'student', // Added for consistency with your App.jsx
  GUARD: 'guard'      // Added for consistency with your App.jsx
};

/**
 * Utility to check if a user can edit a specific hostel's data
 * @param {String} userRole - The role of the logged-in user (e.g., 'warden')
 * @param {String} targetHostelId - The ID of the hostel being viewed/edited
 * @param {String} assignedHostelId - The ID of the hostel the warden is assigned to
 * @returns {Boolean}
 */
export const hasEditPermission = (userRole, targetHostelId, assignedHostelId) => {
  if (!userRole) return false;
  
  if (userRole === ROLES.ADMIN) return true;
  
  if (userRole === ROLES.CHIEF_WARDEN) return false; // View only for all
  
  // If Warden, they can only edit if it's their assigned hostel
  if (userRole === ROLES.WARDEN) {
    return assignedHostelId === targetHostelId;
  }
  
  return false;
};
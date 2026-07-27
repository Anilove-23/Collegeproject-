import React from 'react';

export default function AccessWrapper({ children, targetHostelId }) {
  // Get the role that was saved during login in your App.jsx
  const role = localStorage.getItem('role');
  
  // In a real app, this would come from your backend/auth context. 
  // We mock it here assuming this warden is assigned to Hostel A.
  const assignedHostelId = "Hostel A"; 

  // 1. Admin can see and do everything
  if (role === 'admin') {
    return <>{children}</>;
  }

  // 2. Chief Warden is VIEW ONLY. They cannot see edit/add buttons.
  if (role === 'chief_warden') {
    return null; 
  }

  // 3. Warden can only edit if the target hostel matches their assigned hostel
  if (role === 'warden') {
    if (targetHostelId === assignedHostelId) {
      return <>{children}</>;
    } else {
      return null; // Hide buttons if they are viewing another hostel
    }
  }

  // Default fallback (hide if role is unknown)
  return null;
}
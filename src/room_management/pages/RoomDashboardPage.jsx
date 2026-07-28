import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHostels } from '../hooks/useHostels';
import RoomManagementPanel from '../components/RoomManagementPanel';
import WardenLayout from '../layouts/WardenLayout';

// authority_level: 1 = view-only (any hostel), 2 = warden (own hostel only),
// 3 = other admin (any hostel) — see backend roomAccess.js for the enforced side.
function useCurrentAdmin() {
  return useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
}

// Standalone Room Management page — reached from the Admin Panel (Super
// Admin / Chief Warden / view-only levels) and from Student Search's "View
// Room" links. Level-2 Wardens use the Room Management tab embedded in
// their own dashboard (WardenAllocationPage) instead of this route.
export default function RoomDashboardPage() {
  const admin = useCurrentAdmin();
  const isScopedWarden = admin.authority_level === 2;

  const { data: hostels, isLoading: hostelsLoading } = useHostels();
  const [searchParams] = useSearchParams();
  const [pickedHostelId, setPickedHostelId] = useState(null);

  const ownHostel = isScopedWarden ? hostels?.find((h) => h.name === admin.hostel) : null;
  const hostelId = isScopedWarden
    ? ownHostel?.id
    : (pickedHostelId ?? searchParams.get('hostelId') ?? hostels?.[0]?.id);

  if (hostelsLoading) {
    return (
      <WardenLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </WardenLayout>
    );
  }

  if (isScopedWarden && !ownHostel) {
    return (
      <WardenLayout>
        <div className="text-red-500 text-center mt-20 font-bold">
          Your account isn't assigned to a hostel yet. Contact a Super Admin.
        </div>
      </WardenLayout>
    );
  }

  const currentHostelName = isScopedWarden ? admin.hostel : hostels?.find((h) => h.id === hostelId)?.name;

  return (
    <WardenLayout>
      {!isScopedWarden && hostels?.length > 0 && (
        <div className="mb-4 flex justify-end">
          <select
            value={hostelId || ''}
            onChange={(e) => setPickedHostelId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-[13px] font-semibold text-gray-700 focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none bg-white"
          >
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}
      <RoomManagementPanel hostelId={hostelId} hostelName={currentHostelName} />
    </WardenLayout>
  );
}

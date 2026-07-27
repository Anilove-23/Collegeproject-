import React, { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useRoomMutations } from '../hooks/useRoomMutations';
import { useResidents } from '../hooks/useResidents';
import ManageRoomCard from './room_grid/ManageRoomCard';
import AddEditRoomModal from './modals/AddEditRoomModal';
import ManageResidentsModal from './modals/ManageResidentsModal';
import EditRoomModal from './modals/EditRoomModal';
import BulkUploadModal from './modals/BulkUploadModal';

// Content-only Room Management UI — no outer page layout/sidebar of its own,
// so it can be embedded inside any existing dashboard shell (the standalone
// /room-management page, or a tab inside the Warden's own dashboard) without
// nesting a second sidebar. Hostel selection is the caller's responsibility.
export default function RoomManagementPanel({ hostelId, hostelName }) {
  const { data: rooms, isLoading, isError } = useRooms(hostelId);

  const { handleAddRoom, handleBulkUpload, handleUpdateRoom, handleDeleteRoom } = useRoomMutations(hostelId);
  const { handleAssignResident, handleRemoveResident } = useResidents(hostelId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoomIdForResidents, setSelectedRoomIdForResidents] = useState(null);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Derived live from `rooms` (not a stale snapshot) so the modal reflects
  // residents added/removed after it was opened, once the list refetches.
  const liveRoomForResidents = rooms?.find((r) => r.id === selectedRoomIdForResidents) ?? null;
  const liveRoomForEdit = rooms?.find((r) => r.id === selectedRoomForEdit?.id) ?? selectedRoomForEdit;

  if (hostelId && isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) return <div className="text-red-500 text-center mt-20 font-bold">Failed to load rooms.</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Room Grid</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage room statuses, capacity, and current allocations.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-white text-[#6d0f16] border border-[#6d0f16] px-5 py-2 rounded-md shadow-sm hover:bg-red-50 transition font-bold text-[13px] tracking-wide"
          >
            BULK UPLOAD CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#6d0f16] text-white px-5 py-2 rounded-md shadow-sm hover:bg-[#530b11] transition font-bold text-[13px] tracking-wide border border-[#6d0f16]"
          >
            + ADD NEW ROOM
          </button>
        </div>
      </div>

      {rooms?.length === 0 && (
        <div className="text-center text-gray-400 mt-20 italic font-medium">
          No rooms found in {hostelName || 'this hostel'}. Click "+ ADD NEW ROOM" to create one!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms?.map((room) => (
          <ManageRoomCard
            key={room.id}
            room={room}
            onManageClick={(clickedRoom) => setSelectedRoomIdForResidents(clickedRoom.id)}
            onEditClick={(clickedRoom) => setSelectedRoomForEdit(clickedRoom)}
          />
        ))}
      </div>

      <AddEditRoomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddRoom} />
      <ManageResidentsModal
        isOpen={!!selectedRoomIdForResidents}
        onClose={() => setSelectedRoomIdForResidents(null)}
        room={liveRoomForResidents}
        hostelName={hostelName}
        onAssignResident={handleAssignResident}
        onRemoveResident={handleRemoveResident}
      />
      <EditRoomModal
        isOpen={!!selectedRoomForEdit}
        onClose={() => setSelectedRoomForEdit(null)}
        room={liveRoomForEdit}
        hostelName={hostelName}
        onUpdate={handleUpdateRoom}
        onDelete={handleDeleteRoom}
        onAssignResident={handleAssignResident}
        onRemoveResident={handleRemoveResident}
      />
      <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onBulkSubmit={handleBulkUpload} />
    </div>
  );
}

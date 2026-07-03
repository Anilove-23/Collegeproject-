import React, { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useRoomMutations } from '../hooks/useRoomMutations';
import { useResidents } from '../hooks/useResidents';
import ManageRoomCard from '../components/room_grid/ManageRoomCard';
import AddEditRoomModal from '../components/modals/AddEditRoomModal';
import ManageResidentsModal from '../components/modals/ManageResidentsModal';
import EditRoomModal from '../components/modals/EditRoomModal';
import BulkUploadModal from '../components/modals/BulkUploadModal';
import WardenLayout from '../layouts/WardenLayout'; 
import AccessWrapper from '../components/shared/AccessWrapper';

export default function RoomDashboardPage() {
  // 1. Fetching Data
  const { data: rooms, isLoading, isError } = useRooms();
  
  // 2. Importing the Logic Hooks
  const { handleAddRoom, handleBulkUpload, handleUpdateRoom, handleDeleteRoom } = useRoomMutations();
  const { handleUpdateResidents } = useResidents();
  
  // 3. UI State (Modals)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoomForResidents, setSelectedRoomForResidents] = useState(null);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  if (isLoading) {
    return (
      <WardenLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </WardenLayout>
    );
  }

  if (isError) return <WardenLayout><div className="text-red-500 text-center mt-20 font-bold">Failed to load rooms.</div></WardenLayout>;

  return (
    <WardenLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Room Grid</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage room statuses, capacity, and current allocations.</p>
        </div>
        
        <AccessWrapper targetHostelId="Hostel A">
          <div className="flex gap-3">
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
        </AccessWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms?.map((room) => (
          <ManageRoomCard 
            key={room.id} 
            room={room} 
            onManageClick={(clickedRoom) => setSelectedRoomForResidents(clickedRoom)}
            onEditClick={(clickedRoom) => setSelectedRoomForEdit(clickedRoom)}
          />
        ))}
      </div>

      <AddEditRoomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddRoom} />
      <ManageResidentsModal 
        isOpen={!!selectedRoomForResidents} 
        onClose={() => setSelectedRoomForResidents(null)} 
        room={selectedRoomForResidents} 
        onUpdateResidents={(roomId, residents) => handleUpdateResidents(roomId, residents, setSelectedRoomForResidents)} 
      />
      <EditRoomModal isOpen={!!selectedRoomForEdit} onClose={() => setSelectedRoomForEdit(null)} room={selectedRoomForEdit} onUpdate={handleUpdateRoom} onDelete={handleDeleteRoom} />
      <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onBulkSubmit={handleBulkUpload} />
    </WardenLayout>
  );
}
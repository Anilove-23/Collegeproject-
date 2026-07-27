import React from 'react';
import ResidentsManager from '../shared/ResidentsManager';

export default function ManageResidentsModal({ isOpen, onClose, room, hostelName, onAssignResident, onRemoveResident }) {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">

        <div className="bg-[#6d0f16] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Room {room.roomNumber}</h2>
            <p className="text-sm opacity-90">{room.residents.length} / {room.capacity} Occupied</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 font-bold text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <ResidentsManager
            room={room}
            hostelName={hostelName}
            onAssignResident={onAssignResident}
            onRemoveResident={onRemoveResident}
          />
        </div>

      </div>
    </div>
  );
}

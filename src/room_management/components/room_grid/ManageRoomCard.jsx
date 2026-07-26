import React from 'react';

export default function ManageRoomCard({ room, onManageClick, onEditClick }) {
  // Generate an array based on capacity to render the checkboxes
  const beds = Array.from({ length: room.capacity });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-5 shadow-sm">
      
      {/* Top Section: Room Title & Occupancy Info */}
      <div>
        <h3 className="text-[18px] font-bold text-gray-900 leading-tight">Room {room.roomNumber}</h3>
        <p className="text-[13px] text-gray-500 mt-1">{room.capacity}-Seater</p>
        <p className="text-[13px] text-gray-500 mt-0.5">{room.residents.length}/{room.capacity} occupied</p>
      </div>
      
      {/* Middle Section: Checkboxes and Status */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {beds.map((_, index) => {
            const isOccupied = index < room.residents.length;
            return (
              <div 
                key={index} 
                className={`w-6 h-6 rounded flex items-center justify-center border ${
                  isOccupied 
                    ? 'bg-green-50 border-green-200 text-green-500' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {isOccupied && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {room.status}
        </span>
      </div>

      {/* Bottom Section: Action Buttons (ACCESS WRAPPER REMOVED!) */}
      <div className="flex gap-2 mt-auto pt-1">
        <button 
          onClick={() => onManageClick(room)}
          className="flex-1 bg-white border border-[#6d0f16] text-[#6d0f16] py-1.5 rounded-md text-[13px] font-semibold hover:bg-red-50 transition"
        >
          Manage
        </button>
        <button 
          onClick={() => onEditClick(room)}
          className="px-5 bg-white border border-gray-200 text-gray-600 py-1.5 rounded-md text-[13px] font-semibold hover:bg-gray-50 transition"
        >
          Edit
        </button>
      </div>

    </div>
  );
}
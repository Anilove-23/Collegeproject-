import React, { useState } from 'react';

export default function ManageResidentsModal({ isOpen, onClose, room, onUpdateResidents }) {
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentName, setNewStudentName] = useState(''); // New state for Name

  if (!isOpen || !room) return null;

  const isRoomFull = room.residents.length >= room.capacity;

  const handleRemove = (studentId) => {
    const updatedResidents = room.residents.filter(student => student.id !== studentId);
    onUpdateResidents(room.id, updatedResidents);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (isRoomFull) return;

    const newStudent = {
      id: `s${Math.random()}`,
      name: newStudentName || "Unknown Student", // Use the entered name
      rollNo: newStudentRoll.toUpperCase(),
      branch: "CSE", // Placeholder until backend is connected
    };

    onUpdateResidents(room.id, [...room.residents, newStudent]);
    setNewStudentRoll(''); 
    setNewStudentName(''); // Clear name input
  };

  return (
    // Removed bg-black and bg-opacity-50 here
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      {/* Added pointer-events-auto to the modal box itself so it can be clicked */}
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
          <h3 className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Current Residents</h3>
          
          <div className="space-y-3">
            {room.residents.length > 0 ? (
              room.residents.map((student) => (
                <div key={student.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-[14px]">{student.name}</p>
                    <p className="text-[12px] text-gray-500">{student.rollNo} • {student.branch}</p>
                  </div>
                  <button 
                    onClick={() => handleRemove(student.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-md transition text-[12px] font-semibold border border-transparent hover:border-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-[13px] text-gray-500 italic">This room is currently empty.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Add Resident</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            {/* Added Name Input */}
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              disabled={isRoomFull}
              placeholder={isRoomFull ? "Room is full" : "Enter Student Name"}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none disabled:bg-gray-100"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
                disabled={isRoomFull}
                placeholder={isRoomFull ? "Room is full" : "Roll No (e.g. BT001)"}
                className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none disabled:bg-gray-100"
                required
              />
              <button 
                type="submit"
                disabled={isRoomFull}
                className="bg-[#6d0f16] text-white px-5 py-2 rounded-md font-bold text-[13px] hover:bg-[#530b11] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ADD
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
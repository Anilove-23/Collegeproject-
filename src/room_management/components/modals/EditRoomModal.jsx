import React, { useState, useEffect } from 'react';

export default function EditRoomModal({ isOpen, onClose, room, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: 2,
    status: 'STUDENT',
  });

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        status: room.status,
      });
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...room, ...formData, capacity: parseInt(formData.capacity) });
    onClose();
  };

  return (
    // Removed bg-black and bg-opacity-50 here
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Added heavy shadow to separate it from the background since we removed the dark overlay */}
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-md overflow-hidden pointer-events-auto">
        
        <div className="bg-[#6d0f16] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Room {room.roomNumber}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300 font-bold text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1">Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1">Capacity</label>
              <select
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none bg-white"
              >
                <option value={1}>1-Seater</option>
                <option value={2}>2-Seater</option>
                <option value={3}>3-Seater</option>
                <option value={4}>4-Seater</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none bg-white"
              >
                <option value="STUDENT">Student</option>
                <option value="GUEST">Guest</option>
                <option value="STAFF">Staff</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={() => {
                onDelete(room.id);
                onClose();
              }}
              className="px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition"
            >
              Delete Room
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-[13px] font-bold text-white bg-[#6d0f16] hover:bg-[#530b11] rounded-md transition"
              >
                Save Updates
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
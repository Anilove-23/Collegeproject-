import React, { useState } from 'react';

export default function AddEditRoomModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: 2,
    status: 'STUDENT',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ roomNumber: '', capacity: 2, status: 'STUDENT' }); 
    onClose(); 
  };

  return (
    // Replaced bg-black overlay with transparent pointer-events-none layer
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      {/* Added heavy drop shadow and pointer-events-auto */}
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-md overflow-hidden pointer-events-auto">
        
        <div className="bg-[#6d0f16] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Add New Room</h2>
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
              placeholder="e.g., 104"
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

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
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
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
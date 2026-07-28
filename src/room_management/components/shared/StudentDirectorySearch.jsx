import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudentDirectory } from '../../hooks/useStudentDirectory';
import { useResidents } from '../../hooks/useResidents';

function useCurrentAdmin() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

// Mirrors the backend's roomAccess.js scoping: level 1 = view-only anywhere,
// level 2 = mutate only their own hostel, level 3 = mutate anywhere.
function canModify(admin, allocation) {
  if (!allocation || admin.authority_level === 1) return false;
  if (admin.authority_level === 3) return true;
  if (admin.authority_level === 2) return allocation.hostelName === admin.hostel;
  return false;
}

function StudentRow({ student, onRemoved }) {
  const admin = useCurrentAdmin();
  const { allocation } = student;
  const { handleRemoveResident } = useResidents(allocation?.hostelId);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmRemove = async () => {
    setError('');
    try {
      await handleRemoveResident(allocation.roomId, student.id);
      setConfirming(false);
      onRemoved?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
      <div>
        <p className="font-bold text-gray-900 text-[14px]">{student.name}</p>
        <p className="text-[12px] text-gray-500">{student.rollNo} • {student.department}</p>
        {allocation ? (
          <p className="text-[12px] text-[#6d0f16] font-semibold mt-1">
            {allocation.hostelName} • Room {allocation.roomNumber} • {allocation.roomStatus}
          </p>
        ) : (
          <p className="text-[12px] text-gray-400 italic mt-1">Not Currently Allocated</p>
        )}
        {error && <p className="text-[12px] text-red-600 font-semibold mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        {allocation && (
          <Link
            to={`/room-management?hostelId=${allocation.hostelId}`}
            className="text-[12px] font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition"
          >
            View Room
          </Link>
        )}
        {canModify(admin, allocation) && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-[12px] font-semibold text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md border border-transparent hover:border-red-100 hover:bg-red-50 transition"
          >
            Remove from Room
          </button>
        )}
        {confirming && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-600">Evict {student.name} from Room {allocation.roomNumber}?</span>
            <button onClick={handleConfirmRemove} className="text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition">
              Confirm
            </button>
            <button onClick={() => setConfirming(false)} className="text-[12px] font-semibold text-gray-500 px-2 py-1.5">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDirectorySearch() {
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data: students, isFetching, isError } = useStudentDirectory(debounced);

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search student by name or roll number..."
        className="w-full max-w-md border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none"
      />

      {debounced.trim().length >= 2 && (
        <div className="mt-4 space-y-2 max-w-2xl">
          {isFetching ? (
            <p className="text-[13px] text-gray-400 italic">Searching...</p>
          ) : isError ? (
            <p className="text-[13px] text-red-500">Search failed.</p>
          ) : students?.length > 0 ? (
            students.map((s) => <StudentRow key={s.id} student={s} />)
          ) : (
            <p className="text-[13px] text-gray-400 italic">No students found.</p>
          )}
        </div>
      )}
    </div>
  );
}

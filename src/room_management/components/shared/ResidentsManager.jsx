import React, { useState, useEffect } from 'react';
import { useStudentSearch } from '../../hooks/useStudentSearch';
import { apiFetch } from '../../../utils/api';

const emptyNewStudent = { name: '', rollNo: '', email: '', phone: '', department: '' };

// Current-residents list (with confirm-before-evict) + search/select/create
// resident-add flow. Shared by ManageResidentsModal and EditRoomModal so the
// two entry points don't duplicate this logic.
export default function ResidentsManager({ room, hostelName, onAssignResident, onRemoveResident }) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [error, setError] = useState('');
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudent, setNewStudent] = useState(emptyNewStudent);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: searchResults, isFetching: isSearching } = useStudentSearch(debouncedQuery);

  if (!room) return null;

  const isRoomFull = room.residents.length >= room.capacity;

  const handleConfirmRemove = async (student) => {
    setError('');
    try {
      await onRemoveResident(room.id, student.id);
      setConfirmingRemoval(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectStudent = async (student) => {
    setError('');
    try {
      await onAssignResident(room.id, student.id);
      setSearchInput('');
      setDebouncedQuery('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateAndAssign = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      // Reuses the existing student signup endpoint rather than a separate
      // "create student" API. A random password is generated since this flow
      // has no password input — the student can reset it later if needed.
      const randomPassword = crypto.randomUUID();
      const signupResult = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          role: 'student',
          name: newStudent.name,
          email: newStudent.email,
          password: randomPassword,
          phone: newStudent.phone,
          department: newStudent.department,
          rollno: newStudent.rollNo,
          hostel: hostelName,
        }),
      });

      await onAssignResident(room.id, signupResult.user.id);
      setNewStudent(emptyNewStudent);
      setShowCreateForm(false);
      setSearchInput('');
      setDebouncedQuery('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Current Residents</h3>

      <div className="space-y-3">
        {room.residents.length > 0 ? (
          room.residents.map((student) => (
            <div key={student.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900 text-[14px]">{student.name}</p>
                  <p className="text-[12px] text-gray-500">{student.rollNo} • {student.branch}</p>
                </div>
                {confirmingRemoval !== student.id && (
                  <button
                    onClick={() => setConfirmingRemoval(student.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-md transition text-[12px] font-semibold border border-transparent hover:border-red-100"
                  >
                    Remove
                  </button>
                )}
              </div>
              {confirmingRemoval === student.id && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[12px] text-gray-600">
                    Evict <strong>{student.name}</strong> from Room {room.roomNumber}?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmRemove(student)}
                      className="text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmingRemoval(null)}
                      className="text-[12px] font-semibold text-gray-500 px-2 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-[13px] text-gray-500 italic">This room is currently empty.</p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-gray-200">
        <h3 className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Add Resident</h3>

        {error && <p className="text-[12px] text-red-600 font-semibold mb-2">{error}</p>}

        {!showCreateForm ? (
          <>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={isRoomFull}
              placeholder={isRoomFull ? "Room is full" : "Search by name or roll no..."}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:ring-1 focus:ring-[#6d0f16] focus:border-[#6d0f16] outline-none disabled:bg-gray-100"
            />

            {!isRoomFull && debouncedQuery.trim().length >= 2 && (
              <div className="mt-2 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto">
                {isSearching ? (
                  <p className="text-[12px] text-gray-400 italic p-3">Searching...</p>
                ) : searchResults?.length > 0 ? (
                  searchResults.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 border-b border-gray-100 last:border-0 transition"
                    >
                      <p className="font-bold text-gray-900 text-[13px]">{student.name}</p>
                      <p className="text-[12px] text-gray-500">{student.roll_no} • {student.department}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-3">
                    <p className="text-[12px] text-gray-400 italic mb-2">No matching students found.</p>
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setNewStudent((s) => ({ ...s, name: searchInput }));
                      }}
                      className="text-[12px] font-bold text-[#6d0f16] hover:underline"
                    >
                      + Create New Student
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleCreateAndAssign} className="space-y-2">
            <input
              type="text" required placeholder="Full name" value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#6d0f16]"
            />
            <input
              type="text" required placeholder="Roll number" value={newStudent.rollNo}
              onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#6d0f16]"
            />
            <input
              type="email" required placeholder="Email" value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#6d0f16]"
            />
            <input
              type="text" required placeholder="Phone" value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#6d0f16]"
            />
            <input
              type="text" required placeholder="Department" value={newStudent.department}
              onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#6d0f16]"
            />
            <p className="text-[11px] text-gray-400">Will be created in {hostelName || 'this hostel'} and assigned to Room {room.roomNumber}.</p>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="bg-[#6d0f16] text-white px-4 py-2 rounded-md font-bold text-[13px] hover:bg-[#530b11] transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create & Assign'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setNewStudent(emptyNewStudent); }}
                className="px-4 py-2 rounded-md font-semibold text-[13px] text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

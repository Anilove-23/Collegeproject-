import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

export default function WardenRoomGridTab() {
  const { rooms, unallocatedStudents, notifications, setNotifications, selectedHostel, refreshData } = useOutletContext();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchRoom, setSearchRoom] = useState('');

  const handleManualAssign = async () => {
    if (!assignStudentId || !selectedRoom) return;
    
    if (!window.confirm(`Are you sure you want to assign this student to Room ${selectedRoom.roomNumber}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/warden/manual-assign`, {
        method: 'POST',
        body: JSON.stringify({
          hostelId: selectedHostel,
          studentId: assignStudentId,
          roomId: selectedRoom.id
        })
      });
      if (res.success) {
        setNotifications([{ type: 'success', message: 'Assigned successfully.' }, ...notifications]);
        setAssignStudentId('');
        refreshData();
      } else {
        setNotifications([{ type: 'error', message: res.message || 'Assignment failed.' }, ...notifications]);
      }
    } catch (err) {
      setNotifications([{ type: 'error', message: err.message }, ...notifications]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRoom = async () => {
    if (!selectedRoom || selectedRoom.occupancy === 0) return;
    
    if (!window.confirm(`Are you sure you want to clear Room ${selectedRoom.roomNumber}? This will unassign all students in this room.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/warden/rollback`, {
        method: 'POST',
        body: JSON.stringify({
          hostelId: selectedHostel,
          roomIds: [selectedRoom.id]
        })
      });
      if (res.success) {
        setNotifications([{ type: 'success', message: `Room ${selectedRoom.roomNumber} cleared.` }, ...notifications]);
        refreshData();
      } else {
        setNotifications([{ type: 'error', message: res.message || 'Failed to clear room.' }, ...notifications]);
      }
    } catch (err) {
      setNotifications([{ type: 'error', message: err.message }, ...notifications]);
    } finally {
      setIsLoading(false);
    }
  };

  // When room data refreshes, update the selectedRoom context to reflect new occupancy
  useEffect(() => {
    if (selectedRoom) {
      const updated = rooms.find(r => r.id === selectedRoom.id);
      if (updated) setSelectedRoom(updated);
    }
  }, [rooms, selectedRoom]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
        <h1 className="text-[24px] font-black text-text-primary m-0">Room Grid & Manual Assignment</h1>
        <div className="relative w-full md:w-[250px]">
          <input 
            type="text" 
            placeholder="Search Room Number..." 
            value={searchRoom}
            onChange={(e) => setSearchRoom(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded text-[12px] focus:outline-none focus:border-crimson transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rooms.filter(r => !searchRoom || r.roomNumber.toLowerCase().includes(searchRoom.toLowerCase())).map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="text-left p-4 bg-card border border-border rounded shadow-sm hover:border-crimson transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <p className="text-[13px] font-bold text-text-primary">Room {room.roomNumber}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${room.occupancy === room.capacity ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {room.occupancy === room.capacity ? 'FULL' : 'OPEN'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{room.capacity}-Seater</p>
              <p className="text-[11px] text-text-secondary mt-0.5">{room.occupancy}/{room.capacity} occupied</p>
              <div className="flex gap-1.5 mt-3">
                {Array(room.capacity).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded border border-border text-[8px] flex items-center justify-center ${
                      i < room.occupancy ? 'bg-green-100 border-green-300 text-green-700' : 'bg-canvas'
                    }`}
                  >
                    {i < room.occupancy ? '✓' : ''}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {selectedRoom && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Room {selectedRoom.roomNumber}</h3>
                  <p className="text-[12px] text-text-secondary mt-1">{selectedRoom.capacity}-Seater • {selectedRoom.occupancy}/{selectedRoom.capacity} occupied</p>
                </div>
                <div className="flex items-center gap-4">
                  {selectedRoom.occupancy > 0 && (
                    <button
                      onClick={handleClearRoom}
                      disabled={isLoading}
                      className="text-[11px] font-bold px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded cursor-pointer disabled:opacity-50"
                    >
                      CLEAR ROOM
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="text-text-muted cursor-pointer border-0 bg-transparent text-[20px] font-bold hover:text-crimson"
                  >✕</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {Array(selectedRoom.capacity).fill(0).map((_, idx) => {
                  const occupant = selectedRoom.occupants && selectedRoom.occupants[idx];
                  return (
                    <div key={idx} className={`border border-border rounded p-4 flex flex-col h-[130px] ${occupant ? 'bg-green-50/30 border-green-200' : 'bg-canvas'}`}>
                      <p className="text-[12px] font-bold text-text-secondary shrink-0">BED {idx + 1}</p>
                      {occupant ? (
                        <div className="flex flex-col justify-center flex-1 w-full overflow-hidden mt-1 gap-1">
                          <p className="text-[16px] text-green-800 font-black truncate" title={occupant.name}>{occupant.name}</p>
                          <p className="text-[14px] text-green-700 font-mono font-bold">{occupant.roll_no}</p>
                          <p className="text-[13px] text-green-600 font-semibold truncate" title={occupant.branch}>{occupant.branch}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center flex-1 w-full mt-2 border-2 border-dashed border-border rounded">
                          <p className="text-[13px] text-text-muted font-bold">Empty</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedRoom.occupancy < selectedRoom.capacity && (
                <div className="bg-canvas border border-border rounded p-4 mt-2">
                  <p className="text-[12px] font-bold text-text-primary mb-2">Manual Assign</p>
                  <div className="flex gap-3">
                    <select
                      value={assignStudentId}
                      onChange={(e) => setAssignStudentId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-border rounded text-[12px] cursor-pointer"
                    >
                      <option value="">Select an unallocated student...</option>
                      {unallocatedStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.roll_no} - {s.branch} ({s.state_category.substring(0,4)})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleManualAssign}
                      disabled={!assignStudentId || isLoading}
                      className="px-4 py-2 bg-slate-800 text-white text-[12px] font-bold rounded cursor-pointer hover:bg-slate-700 disabled:opacity-50"
                    >
                      ASSIGN
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

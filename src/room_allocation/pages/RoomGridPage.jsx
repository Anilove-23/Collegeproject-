import { useState, useMemo } from 'react';
import AllocationLayout from '../layouts/AllocationLayout';
import { useActiveBatch } from '../hooks/useActiveBatch';
import { useRooms } from '../hooks/useRooms';
import { useRoomFilters } from '../hooks/useRoomFilters';
import RoomFilters from '../components/live_selection/RoomFilters';

export default function RoomGridPage() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  const { data: allocState, isLoading: stateLoading } = useActiveBatch(studentId);
  const { data: rooms = [], isLoading: loading } = useRooms(allocState?.hostelId ?? null, studentId);

  const [filters, setFilters] = useState({
    type: 'All Types',
    block: 'All Blocks',
    status: 'All Rooms',
    search: '',
  });

  const { data: filtersData } = useRoomFilters(allocState?.hostelId ?? null);
  const availableTypes = filtersData?.availableTypes || [];
  const availableBlocks = filtersData?.availableBlocks || [];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.search && !room.roomNo.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.type !== 'All Types' && room.type !== filters.type) return false;
      if (filters.block !== 'All Blocks' && room.block !== filters.block) return false;
      if (filters.status === 'Available Only' && room.occupied >= room.total) return false;
      return true;
    });
  }, [rooms, filters]);

  const groupedRooms = useMemo(() => {
    const groups = {};
    filteredRooms.forEach((room) => {
      const key = `Block ${room.block} - Floor ${room.floor || 0}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(room);
    });
    return groups;
  }, [filteredRooms]);

  if (stateLoading || (allocState?.hostelId && loading)) {
    return (
      <AllocationLayout phase="Loading..." batch="">
        <div className="flex justify-center items-center h-64 text-text-muted">Loading room map...</div>
      </AllocationLayout>
    );
  }

  if (!allocState?.hostelId) {
    return (
      <AllocationLayout phase="Unknown" batch="">
        <div className="flex justify-center items-center h-64 text-crimson">Hostel ID not found.</div>
      </AllocationLayout>
    );
  }

  return (
    <AllocationLayout
      phase={allocState.phase}
      batch={`Batch ${allocState.batchNumber || 'TBD'}`}
      hostelId={allocState.hostelId}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded border border-border shadow-sm">
          <div>
            <h1 className="text-[20px] font-black text-text-primary tracking-tight">Live Room Grid</h1>
            <p className="text-[12px] text-text-muted mt-1">Interactive map of all rooms and their real-time availability.</p>
          </div>
          <RoomFilters 
            filters={filters} 
            onChange={setFilters} 
            availableTypes={availableTypes}
            availableBlocks={availableBlocks}
          />
        </div>

        {Object.keys(groupedRooms).length === 0 ? (
          <div className="bg-card border border-border rounded-xl shadow-sm px-8 py-16 flex flex-col items-center text-center">
            <h2 className="text-lg font-bold text-text-secondary">No rooms match your filters.</h2>
          </div>
        ) : (
          Object.keys(groupedRooms)
            .sort()
            .map((groupKey) => (
              <div key={groupKey} className="bg-card border border-border rounded shadow-sm overflow-hidden">
                <div className="bg-canvas border-b border-border px-4 py-3">
                  <h3 className="text-[14px] font-extrabold text-text-primary tracking-tight">{groupKey}</h3>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {groupedRooms[groupKey].map((room) => {
                    const isAvailable = room.occupied < room.total;
                    const isEmpty = room.occupied === 0;

                    return (
                      <div
                        key={room.id}
                        className={`relative flex flex-col border rounded p-3 transition-colors ${
                          isAvailable
                            ? isEmpty
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-amber-50/50 border-amber-200'
                            : 'bg-red-50/50 border-red-200 opacity-70'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[15px] font-black tracking-tight text-text-primary">{room.roomNo}</span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isAvailable ? (isEmpty ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-red-500'
                            }`}
                          />
                        </div>

                        <div className="text-[11px] font-semibold text-text-secondary">{room.type}</div>

                        <div className="mt-2 text-[10px] font-bold tracking-[0.06em] uppercase flex justify-between items-end text-text-muted">
                          <span>{room.occupied} Occupied</span>
                          <span className={isAvailable ? 'text-emerald-600 font-extrabold text-[12px]' : 'text-crimson'}>
                            {Math.max(room.total - room.occupied, 0)} Left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </AllocationLayout>
  );
}
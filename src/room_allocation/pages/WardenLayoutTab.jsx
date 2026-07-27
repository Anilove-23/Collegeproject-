import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const STUDENT_CATEGORIES = ['HOME_STATE', 'OTHER_STATE', 'ANY'];

const DiceIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/><circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>;

export default function WardenLayoutTab() {
  const { selectedHostel, analytics, rooms, notifications, setNotifications } = useOutletContext();
  const availableRooms = analytics?.availableRooms || [];
  
  // Extract unique branches from analytics
  const branches = useMemo(() => {
    if (!analytics?.studentPool) return ['ANY'];
    const unique = [...new Set(analytics.studentPool.map(s => s.branch))];
    return ['ANY', ...unique];
  }, [analytics]);

  // Transform analytics room data into dropdown options
  const roomTypes = useMemo(() => {
    if (availableRooms.length === 0) return ['2-Seater'];
    return availableRooms.map(r => `${r.capacity}-Seater`);
  }, [availableRooms]);

  const [selectedRoomType, setSelectedRoomType] = useState('2-Seater');
  
  // Dynamic layout configuration state
  const [layoutConfig, setLayoutConfig] = useState({
    '2-Seater': Array(2).fill({ state: 'ANY', branch: 'ANY' }),
    '3-Seater': Array(3).fill({ state: 'ANY', branch: 'ANY' }),
    '4-Seater': Array(4).fill({ state: 'ANY', branch: 'ANY' }),
    '5-Seater': Array(5).fill({ state: 'ANY', branch: 'ANY' }),
    '6-Seater': Array(6).fill({ state: 'ANY', branch: 'ANY' }),
  });

  const [diversityConfig, setDiversityConfig] = useState({
    '2-Seater': 'ALLOW_SAME',
    '3-Seater': 'ALLOW_SAME',
    '4-Seater': 'ALLOW_SAME',
    '5-Seater': 'ALLOW_SAME',
    '6-Seater': 'ALLOW_SAME',
  });

  // Saved layouts map
  const [savedLayouts, setSavedLayouts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync selected room type to available types if it disappears
  useEffect(() => {
    if (roomTypes.length > 0 && !roomTypes.includes(selectedRoomType)) {
      setSelectedRoomType(roomTypes[0]);
    }
  }, [roomTypes, selectedRoomType]);

  const handleSlotChange = (slotIndex, field, value) => {
    const newConfig = [...(layoutConfig[selectedRoomType] || [])];
    newConfig[slotIndex] = { ...newConfig[slotIndex], [field]: value };
    setLayoutConfig({
      ...layoutConfig,
      [selectedRoomType]: newConfig,
    });
  };

  const handleSaveLayout = () => {
    setSavedLayouts(prev => ({
      ...prev,
      [selectedRoomType]: {
        capacity: parseInt(selectedRoomType.split('-')[0], 10),
        nodes: layoutConfig[selectedRoomType],
        diversity: diversityConfig[selectedRoomType]
      }
    }));
    setNotifications([{ type: 'success', message: `${selectedRoomType} layout saved.` }, ...notifications]);
  };

  const handleRunAllocation = async () => {
    if (!selectedHostel) return;
    
    const layoutsToRun = Object.values(savedLayouts);
    if (layoutsToRun.length === 0) {
      setNotifications([{ type: 'error', message: 'No layouts saved yet.' }, ...notifications]);
      return;
    }

    if (!window.confirm(`Are you sure you want to execute these ${layoutsToRun.length} saved layout(s)? This will permanently assign students.`)) {
      return;
    }

    setIsLoading(true);

    try {
      let totalStudentsAllocated = 0;
      let totalRoomsAllocated = 0;

      // Run iteratively for each saved layout type
      for (const layout of layoutsToRun) {
        const capacity = layout.capacity;
        
        // Find empty rooms for this capacity that aren't occupied
        const emptyRooms = rooms.filter(r => r.occupancy === 0 && r.capacity === capacity);
        if (emptyRooms.length === 0) continue;

        const nodes = layout.nodes.map((n, idx) => ({
          id: `bed_${idx + 1}`,
          state: n.state,
          branch: n.branch === 'ANY' ? null : n.branch
        }));

        const payload = {
          hostelId: selectedHostel,
          targetRoomIds: emptyRooms.map(r => r.id),
          layoutConfig: {
            capacity,
            branchDiversity: layout.diversity || 'ALLOW_SAME',
            nodes
          }
        };

        const allocateRes = await apiFetch(`/api/warden/allocate`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (allocateRes.success) {
          totalStudentsAllocated += allocateRes.result?.studentsAllocated || 0;
          totalRoomsAllocated += allocateRes.result?.roomsAllocated || 0;
        } else {
          throw new Error(allocateRes.message || 'Validation or matching failed.');
        }
      }

      setNotifications([{ type: 'success', message: `Execution Complete. Allocated ${totalStudentsAllocated} students to ${totalRoomsAllocated} rooms.` }, ...notifications]);
      
      // Clear saved layouts after run
      setSavedLayouts({});

    } catch (err) {
      console.error(err);
      setNotifications([{ type: 'error', message: err.message || 'Network error executing allocation.' }, ...notifications]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomAllocation = async () => {
    if (!selectedHostel) return;

    if (!window.confirm("Are you sure you want to run FULL RANDOM allocation? This will indiscriminately assign students to all remaining empty rooms!")) {
      return;
    }

    setIsLoading(true);
    
    try {
      let totalStudentsAllocated = 0;
      let totalRoomsAllocated = 0;
      
      const availableCapacities = [...new Set(rooms.filter(r => r.occupancy === 0).map(r => r.capacity))];
      
      for (const capacity of availableCapacities) {
        const emptyRooms = rooms.filter(r => r.occupancy === 0 && r.capacity === capacity);
        if (emptyRooms.length === 0) continue;

        const payload = {
          hostelId: selectedHostel,
          targetRoomIds: emptyRooms.map(r => r.id),
          layoutConfig: {
            capacity,
            branchDiversity: 'ALLOW_SAME',
            nodes: Array(capacity).fill({ state: 'ANY', branch: null }).map((n, i) => ({ id: `bed_${i}`, ...n }))
          }
        };

        const allocateRes = await apiFetch(`/api/warden/allocate`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (allocateRes.success) {
          totalStudentsAllocated += allocateRes.result?.studentsAllocated || 0;
          totalRoomsAllocated += allocateRes.result?.roomsAllocated || 0;
        } else {
          throw new Error(allocateRes.message || 'Validation or matching failed.');
        }
      }
      
      setNotifications([{ type: 'success', message: `Random Allocation Complete. Allocated ${totalStudentsAllocated} students to ${totalRoomsAllocated} rooms.` }, ...notifications]);
    } catch (err) {
      setNotifications([{ type: 'error', message: err.message || 'Random allocation failed.' }, ...notifications]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentConfig = layoutConfig[selectedRoomType] || Array(parseInt(selectedRoomType.split('-')[0], 10)).fill({ state: 'ANY', branch: 'ANY' });
  const projectedBeds = Object.values(savedLayouts).reduce((sum, layout) => sum + (layout.capacity * rooms.filter(r => r.occupancy === 0 && r.capacity === layout.capacity).length), 0);
  const unallocatedCount = analytics?.studentPool?.reduce((sum, g) => sum + g.count, 0) || 0;

  return (
    <div>
      <h1 className="text-[24px] font-black text-text-primary mb-5">Layout Builder</h1>
      <div className="flex gap-5">
        <div className="flex-1 flex flex-col gap-5">
          {/* Room Type Selection */}
          <div className="bg-card border border-border rounded shadow-sm px-5 py-4 flex justify-between items-center">
            <div>
              <label className="text-[12px] font-bold text-text-primary mb-1 block">SELECT ROOM TYPE TO CONFIGURE</label>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="px-3 py-1.5 bg-canvas border border-border rounded text-[12px] text-text-primary cursor-pointer min-w-[200px]"
              >
                {roomTypes.length > 0 ? roomTypes.map(type => (
                  <option key={type} value={type}>{type} (Empty: {rooms.filter(r => r.occupancy === 0 && r.capacity === parseInt(type)).length})</option>
                )) : <option value="2-Seater">No empty rooms available</option>}
              </select>
            </div>
            <button
              onClick={handleRandomAllocation}
              disabled={isLoading || roomTypes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-[12px] font-bold rounded cursor-pointer hover:bg-slate-700 disabled:opacity-50"
            >
              <DiceIcon /> FULL RANDOM ALLOCATION
            </button>
          </div>

          {/* Visual Layout Builder */}
          <div className="bg-card border border-border rounded shadow-sm px-6 py-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-bold text-text-primary">Define Constraints - {selectedRoomType}</h3>
              <select 
                value={diversityConfig[selectedRoomType] || 'ALLOW_SAME'}
                onChange={(e) => setDiversityConfig({ ...diversityConfig, [selectedRoomType]: e.target.value })}
                className="px-3 py-1.5 bg-canvas border border-border rounded text-[11px] text-text-primary cursor-pointer"
              >
                <option value="ALLOW_SAME">ALLOW SAME BRANCH</option>
                <option value="MUST_BE_UNIQUE">UNIQUE BRANCHES ONLY</option>
                <option value="EXACT_MATCH">EXACT MATCH (ALL SAME)</option>
              </select>
            </div>
            
            <div className="flex gap-4 justify-center mb-6 flex-wrap">
              {currentConfig.map((node, idx) => (
                <div key={idx} className="flex flex-col items-center bg-canvas p-3 rounded border border-border min-w-[140px]">
                  <div className="w-16 h-16 border-2 border-border-dark rounded-full bg-white flex items-center justify-center mb-3 text-[24px] shadow-sm">
                    🛏️
                  </div>
                  <label className="text-[10px] font-bold text-text-secondary mb-1 w-full">STATE CONSTRAINT</label>
                  <select
                    value={node.state}
                    onChange={(e) => handleSlotChange(idx, 'state', e.target.value)}
                    className="w-full px-2 py-1 mb-2 bg-white border border-border rounded text-[11px] text-text-primary cursor-pointer"
                  >
                    {STUDENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  
                  <label className="text-[10px] font-bold text-text-secondary mb-1 w-full">BRANCH CONSTRAINT</label>
                  <select
                    value={node.branch}
                    onChange={(e) => handleSlotChange(idx, 'branch', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-border rounded text-[11px] text-text-primary cursor-pointer"
                  >
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveLayout}
                disabled={isLoading || roomTypes.length === 0}
                className={`px-6 py-2 text-[12px] font-bold tracking-[0.06em] rounded transition-colors cursor-pointer border border-border bg-white text-text-primary hover:border-crimson`}
              >
                SAVE ROOM LAYOUT
              </button>
            </div>
          </div>
        </div>

        {/* Saved Layouts Panel */}
        <div className="w-[300px] shrink-0 flex flex-col gap-4">
          <div className="bg-card border border-border rounded shadow-sm px-5 py-5 flex flex-col h-full">
            <h3 className="text-[14px] font-black text-text-primary mb-1">Stashed Layouts</h3>
            <p className="text-[11px] text-text-secondary mb-4 border-b border-border pb-3">Save layouts for different room capacities, then run them together.</p>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {Object.entries(savedLayouts).length === 0 ? (
                <p className="text-[12px] text-text-muted italic text-center mt-5">No layouts saved yet.</p>
              ) : (
                Object.entries(savedLayouts).map(([type, layout]) => (
                  <div key={type} className="border border-border rounded p-3 bg-canvas relative group">
                    <button 
                      onClick={() => {
                        const newSaved = {...savedLayouts};
                        delete newSaved[type];
                        setSavedLayouts(newSaved);
                      }}
                      className="absolute top-2 right-2 text-text-muted hover:text-crimson text-[14px] cursor-pointer"
                    >✕</button>
                    <p className="text-[12px] font-bold text-text-primary">{type}</p>
                    <p className="text-[10px] text-text-secondary mt-1">{layout.diversity}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {layout.nodes.map((n, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white border border-border rounded text-[9px] font-medium">
                          {n.state.substring(0,4)} • {n.branch.substring(0,6)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-[11px] font-bold text-text-secondary mb-1">
                <span>PROJECTED BEDS:</span>
                <span className="text-text-primary">{projectedBeds}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-text-secondary mb-4">
                <span>REMAINING STUDENTS:</span>
                <span className={unallocatedCount - projectedBeds < 0 ? 'text-crimson' : 'text-green-600'}>
                  {Math.max(0, unallocatedCount - projectedBeds)}
                </span>
              </div>
              
              <button
                onClick={handleRunAllocation}
                disabled={isLoading || Object.keys(savedLayouts).length === 0}
                className={`w-full py-2.5 text-[12px] font-bold tracking-[0.06em] rounded transition-colors cursor-pointer ${
                  isLoading || Object.keys(savedLayouts).length === 0 ? 'bg-canvas text-text-muted cursor-not-allowed' : 'bg-crimson text-white hover:bg-crimson-dark shadow-sm'
                }`}
              >
                {isLoading ? 'EXECUTING...' : 'RUN SAVED LAYOUTS'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

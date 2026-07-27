import { useState, useEffect, useMemo } from 'react';
import { allocationSocket, WS_EVENTS } from '../sockets/allocation.socket.js';
import { apiFetch } from '../../utils/api';
import RoomManagementPanel from '../../room_management/components/RoomManagementPanel';

/* ── Icons ────────────────────────────────────────────────── */
const GridIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>;
const LayoutIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>;
const UserIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-2.761 1.791-5 4-5s4 2.239 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const ClockIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const DiceIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/><circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>;

/* ── Shared Styles ────────────────────────────────────────────── */
const navBase = 'flex items-center gap-2.5 px-2.5 py-[9px] rounded text-[11px] font-semibold tracking-[0.06em] w-full text-left transition-colors duration-150 border-0 cursor-pointer no-underline';
const navActive = 'bg-crimson text-white';
const navIdle = 'text-text-secondary bg-transparent hover:bg-canvas hover:text-text-primary';

const STUDENT_CATEGORIES = ['HOME_STATE', 'OTHER_STATE', 'ANY'];

/* ── Layout Builder Component ────────────────────────────────────────────── */
function LayoutBuilder({ selectedHostel, analytics, rooms, notifications, setNotifications }) {
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
  
  // Dynamic layout configuration state (Working draft)
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
            branchDiversity: layout.diversity,
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
      
      // For every empty room, create a random ANY/ANY layout
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
  );
}

/* ── Remaining Students Component ────────────────────────────────────────────── */
function RemainingStudents({ students, selectedHostel, notifications, setNotifications }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomAllocation = async () => {
    if (!selectedHostel) return;
    setIsLoading(true);
    try {
      const payload = {
        hostelId: selectedHostel,
        targetRoomIds: [], // Not passing this triggers an empty room grab in the backend, wait... 
        // Our backend POST /allocate requires targetRoomIds. So random here is tricky without rooms array.
        // I will just note that full random is on layout builder for now, or I can fetch rooms here.
      };
      setNotifications([{ type: 'error', message: 'Random allocation from this tab requires room map. Use Full Random in Layout Builder.' }, ...notifications]);
    } catch (err) {
      setNotifications([{ type: 'error', message: err.message }, ...notifications]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-border bg-canvas">
        <h3 className="text-[14px] font-bold text-text-primary">Unallocated Pool ({students.length})</h3>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-canvas sticky top-0 border-b border-border shadow-sm">
            <tr>
              <th className="text-[10px] font-bold text-text-secondary px-5 py-3 tracking-[0.05em]">ROLL NO</th>
              <th className="text-[10px] font-bold text-text-secondary px-5 py-3 tracking-[0.05em]">BRANCH</th>
              <th className="text-[10px] font-bold text-text-secondary px-5 py-3 tracking-[0.05em]">STATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.length > 0 ? students.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-[12px] font-medium text-text-primary">{s.roll_no}</td>
                <td className="px-5 py-3 text-[12px] text-text-secondary">{s.branch}</td>
                <td className="px-5 py-3 text-[12px] text-text-secondary">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.state_category === 'HOME_STATE' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {s.state_category === 'HOME_STATE' ? 'HP' : 'OTHER'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-5 py-8 text-center text-[12px] text-text-muted italic">
                  No unallocated students left!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────── */
export default function WardenAllocationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  
  // Real Data State
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [unallocatedStudents, setUnallocatedStudents] = useState([]);

  // Fetch Hostels on Mount
  useEffect(() => {
    async function init() {
      try {
        const data = await apiFetch(`/api/hostels`);
        const loadedHostels = data.hostels || [];
        setHostels(loadedHostels);
        if (loadedHostels.length > 0) {
          setSelectedHostel(loadedHostels[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch hostels:", err);
      }
    }
    init();

    // Init Pusher Socket
    allocationSocket.connect();
    return () => allocationSocket.disconnect();
  }, []);

  const fetchHostelData = async (hostelId) => {
    if (!hostelId) return;
    try {
      // 1. Fetch Analytics
      const analyticsData = await apiFetch(`/api/warden/analytics/${hostelId}`);
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // 2. Fetch Room Grid
      const roomsData = await apiFetch(`/api/allocation/rooms/${hostelId}`);
      setRooms(roomsData.rooms || roomsData || []);

      // 3. Fetch Unallocated Students array
      const unallocatedData = await apiFetch(`/api/warden/unallocated/${hostelId}`);
      setUnallocatedStudents(unallocatedData.students || []);

    } catch (err) {
      console.error("Failed to fetch hostel data:", err);
    }
  };

  // Fetch Data & Join Socket when Hostel changes
  useEffect(() => {
    if (selectedHostel) {
      allocationSocket.joinHostel(selectedHostel);
      fetchHostelData(selectedHostel);

      // Listen for Pusher Updates
      const cleanup = allocationSocket.on(WS_EVENTS.ROOM_MAP_UPDATED, () => {
        // Silently refresh data without full page reload
        fetchHostelData(selectedHostel);
      });

      return cleanup;
    }
  }, [selectedHostel]);

  const handleRollback = async () => {
    if (!selectedHostel) return;
    if (!confirm("Are you sure you want to rollback ALL allocations for this hostel? This will detach all students from rooms.")) return;
    
    try {
      const roomIds = rooms.filter(r => r.occupancy > 0).map(r => r.id);
      if (roomIds.length === 0) return;

      const res = await apiFetch(`/api/warden/rollback`, {
        method: 'POST',
        body: JSON.stringify({ hostelId: selectedHostel, roomIds })
      });
      if (res.success) {
        setNotifications([{ type: 'success', message: res.message }, ...notifications]);
      }
    } catch (err) {
      setNotifications([{ type: 'error', message: err.message }, ...notifications]);
    }
  };

  const NAV_ITEMS = [
    { label: 'Overview', id: 'overview', Icon: GridIcon },
    { label: 'Layout Builder', id: 'layout-builder', Icon: LayoutIcon },
    { label: 'Remaining', id: 'remaining', Icon: UserIcon },
    { label: 'Room Management', id: 'room-management', Icon: LayoutIcon },
  ];

  // Derived computations for overview
  const totalStudents = analytics?.studentPool?.reduce((sum, group) => sum + group.count, 0) || 0;
  const totalEmptyRooms = analytics?.availableRooms?.reduce((sum, group) => sum + group.count, 0) || 0;
  const totalRooms = rooms.length;
  const currentOccupied = rooms.reduce((sum, r) => sum + r.occupancy, 0);

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* ── Top Nav ────────────────────────────────────────────── */}
      <header className="flex items-center gap-10 px-8 h-[52px] bg-card border-b border-border sticky top-0 z-50 shrink-0">
        <div className="text-[13px] font-black tracking-[0.05em] text-crimson whitespace-nowrap shrink-0">
          FIRST YEAR ROOM ALLOCATION
        </div>
        <nav className="flex gap-7 flex-1 justify-between items-center">
          <span className="text-xs font-medium tracking-[0.02em] pb-[3px] border-b-2 border-transparent text-text-secondary">Warden Portal</span>
          {activeTab === 'overview' && currentOccupied > 0 && (
            <button 
              onClick={handleRollback}
              className="text-[11px] font-bold bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded"
            >
              ROLLBACK ALLOCATIONS
            </button>
          )}
        </nav>
      </header>

      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="w-[200px] shrink-0 bg-card border-r border-border flex flex-col sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
          <div className="px-4 pt-5 pb-4 border-b border-border">
            <div className="w-[52px] h-[52px] rounded bg-[#eeeeec] border border-border-dark flex items-center justify-center text-text-muted mb-2.5 text-[20px]">
              👨‍⚖️
            </div>
            <p className="text-[13px] font-bold text-text-primary leading-tight">Warden Portal</p>
            <p className="text-[11px] text-text-muted mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap">
              {hostels.find(h => h.id === selectedHostel)?.name || 'Loading...'}
            </p>
          </div>

          <nav className="flex flex-col gap-0.5 p-2.5 flex-1">
            {NAV_ITEMS.map(({ label, id, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`${navBase} ${activeTab === id ? navActive : navIdle}`}
              >
                <span className="shrink-0"><Icon /></span>
                {label.toUpperCase()}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content Area ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 pt-5 pb-8">
            {notifications.length > 0 && (
              <div className="mb-5 space-y-2">
                {notifications.slice(0, 3).map((notif, idx) => (
                  <div key={idx} className={`border rounded px-4 py-3 flex justify-between items-center ${
                    notif.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'
                  }`}>
                    <p className="text-[12px]">{notif.message}</p>
                    <button
                      onClick={() => setNotifications(notifications.filter((_, i) => i !== idx))}
                      className="cursor-pointer border-0 bg-transparent text-[16px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6">
              <label className="text-[12px] font-bold text-text-primary mr-3">ACTIVE HOSTEL:</label>
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="px-3 py-1.5 bg-white border border-border rounded text-[12px] text-text-primary cursor-pointer max-w-xs"
              >
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-5">
                <h1 className="text-[24px] font-black text-text-primary">Allocation Dashboard</h1>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded shadow-sm px-5 py-5">
                    <p className="text-[11px] font-bold text-text-muted tracking-[0.08em]">UNALLOCATED (1ST YR)</p>
                    <p className="text-[28px] font-black text-amber-600 mt-2">{totalStudents}</p>
                  </div>
                  <div className="bg-card border border-border rounded shadow-sm px-5 py-5">
                    <p className="text-[11px] font-bold text-text-muted tracking-[0.08em]">OCCUPIED BEDS</p>
                    <p className="text-[28px] font-black text-green-600 mt-2">{currentOccupied}</p>
                  </div>
                  <div className="bg-card border border-border rounded shadow-sm px-5 py-5">
                    <p className="text-[11px] font-bold text-text-muted tracking-[0.08em]">TOTAL ROOMS</p>
                    <p className="text-[28px] font-black text-text-primary mt-2">{totalRooms}</p>
                  </div>
                  <div className="bg-card border border-border rounded shadow-sm px-5 py-5">
                    <p className="text-[11px] font-bold text-text-muted tracking-[0.08em]">EMPTY ROOMS</p>
                    <p className="text-[28px] font-black text-crimson mt-2">{totalEmptyRooms}</p>
                  </div>
                </div>
                
                {/* Breakdown view of student pool */}
                <div className="bg-card border border-border rounded shadow-sm px-6 py-5">
                  <h2 className="text-[16px] font-bold text-text-primary mb-4">Unassigned Student Pool Breakdown</h2>
                  {analytics?.studentPool?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {analytics.studentPool.map((group, i) => (
                        <div key={i} className="flex justify-between p-3 border border-border rounded bg-canvas">
                          <span className="text-[12px] font-bold">{group.state} • {group.branch}</span>
                          <span className="text-[14px] text-crimson font-black">{group.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-text-secondary">No unallocated students found.</p>
                  )}
                </div>
              </div>
            )}

            {/* Layout Builder Tab */}
            {activeTab === 'layout-builder' && (
              <div>
                <h1 className="text-[24px] font-black text-text-primary mb-5">Layout Builder</h1>
                <LayoutBuilder 
                  selectedHostel={selectedHostel}
                  analytics={analytics}
                  rooms={rooms}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </div>
            )}

            {activeTab === 'remaining' && (
              <div>
                <h1 className="text-[24px] font-black text-text-primary mb-5">Remaining Students</h1>
                <RemainingStudents
                  students={unallocatedStudents}
                  selectedHostel={selectedHostel}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </div>
            )}

            {/* Room Management Tab — reuses the same Room Management module/
                components/APIs as the standalone page, embedded here so
                Wardens don't need a separate page or sidebar. */}
            {activeTab === 'room-management' && (
              <RoomManagementPanel
                hostelId={selectedHostel}
                hostelName={hostels.find(h => h.id === selectedHostel)?.name}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

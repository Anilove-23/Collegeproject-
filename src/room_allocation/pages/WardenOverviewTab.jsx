import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import StudentImportModal from '../components/admin/StudentImportModal';

// ─── Tab ──────────────────────────────────────────────────────────────────────
export default function WardenOverviewTab() {
  const { analytics, rooms, hostels, selectedHostel, unallocatedStudents, refreshData } = useOutletContext();
  const [isImportModalOpen, setIsImportModalOpen]     = useState(false);

  const totalStudents   = analytics?.studentPool?.reduce((sum, g) => sum + g.count, 0) || 0;
  const totalEmptyRooms = analytics?.availableRooms?.reduce((sum, g) => sum + g.count, 0) || 0;
  const totalRooms      = rooms?.length || 0;
  const currentOccupied = rooms?.reduce((sum, r) => sum + r.occupancy, 0) || 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-black text-text-primary">Allocation Dashboard</h1>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors"
        >
          Import CSV
        </button>
      </div>

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

      {/* Scrollable unallocated students table */}
      <div className="bg-card border border-border rounded shadow-sm overflow-hidden flex flex-col h-[400px]">
        <div className="px-6 py-4 border-b border-border bg-canvas shrink-0">
          <h2 className="text-[16px] font-bold text-text-primary">Unallocated Students</h2>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-canvas text-text-secondary sticky top-0 shadow-sm z-10">
              <tr>
                <th className="text-left px-6 py-3 border-b border-border">Roll No</th>
                <th className="text-left px-6 py-3 border-b border-border">Name</th>
                <th className="text-left px-6 py-3 border-b border-border">Gender</th>
                <th className="text-left px-6 py-3 border-b border-border">Branch</th>
                <th className="text-left px-6 py-3 border-b border-border">State</th>
              </tr>
            </thead>
            <tbody>
              {unallocatedStudents && unallocatedStudents.length > 0 ? (
                unallocatedStudents.map((s, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-canvas/50">
                    <td className="px-6 py-2 font-mono">{s.roll_no}</td>
                    <td className="px-6 py-2 font-semibold text-text-primary">{s.name}</td>
                    <td className="px-6 py-2">{s.gender}</td>
                    <td className="px-6 py-2">{s.branch}</td>
                    <td className="px-6 py-2">{s.state}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                    No unallocated students.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={refreshData}
        hostels={hostels}
        activeHostelId={selectedHostel}
      />
    </div>
  );
}

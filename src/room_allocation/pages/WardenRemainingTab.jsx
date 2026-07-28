import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function WardenRemainingTab() {
  const { unallocatedStudents, selectedHostel, notifications, setNotifications } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomAllocation = async () => {
    if (!selectedHostel) return;
    setIsLoading(true);
    try {
      setNotifications([{ type: 'error', message: 'Random allocation from this tab requires room map. Use Full Random in Layout Builder.' }, ...notifications]);
    } catch (err) {
      setNotifications([{ type: 'error', message: err.message }, ...notifications]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-[24px] font-black text-text-primary mb-5">Remaining Students</h1>
      <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-border bg-canvas">
          <h3 className="text-[14px] font-bold text-text-primary">Unallocated Pool ({unallocatedStudents.length})</h3>
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
              {unallocatedStudents.length > 0 ? unallocatedStudents.map(s => (
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
    </div>
  );
}

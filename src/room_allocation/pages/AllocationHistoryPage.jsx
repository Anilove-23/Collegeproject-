import { useState, useEffect } from 'react';
import AllocationLayout from '../layouts/AllocationLayout';
import { getAllocationHistory } from '../api/allocation.api';
import { formatDateTime } from '../utils/formatters';

/** Maps allocation_result_enum → display label + colour */
const RESULT_STYLE = {
  ALLOCATED:   { label: 'ALLOCATED',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  ROLLED_OVER: { label: 'ROLLED OVER', cls: 'bg-amber-100  text-amber-700  border-amber-300'    },
  FAILED:      { label: 'FAILED',      cls: 'bg-red-100    text-red-700    border-red-300'       },
  PENALIZED:   { label: 'PENALIZED',   cls: 'bg-red-200    text-red-800    border-red-400'       },
  PENDING:     { label: 'PENDING',     cls: 'bg-canvas     text-text-muted border-border'        },
};

export default function AllocationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllocationHistory().then(setHistory).finally(() => setLoading(false));
  }, []);

  return (
    <AllocationLayout phase="History" batch="All Submissions">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-[22px] font-black text-text-primary tracking-tight mb-1">Allocation History</h1>
          <p className="text-[13px] text-text-secondary">A record of all your batch submissions and outcomes.</p>
        </div>

        {loading ? (
          <p className="text-[13px] text-text-muted py-10 text-center">Loading history…</p>
        ) : (
          <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
            <div className="grid grid-cols-[auto_auto_1fr_auto] text-[10px] font-bold tracking-[0.1em] text-text-muted px-5 py-3 border-b border-border bg-canvas">
              <span className="w-28">BATCH</span>
              <span className="w-24">ROUND</span>
              <span>ROOM</span>
              <span>RESULT</span>
            </div>
            {history.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-10">No allocation history yet.</p>
            ) : history.map((h, i) => {
              const s = RESULT_STYLE[h.result] ?? RESULT_STYLE.PENDING;
              return (
                <div key={i} className="grid grid-cols-[auto_auto_1fr_auto] items-center px-5 py-4 border-b border-border last:border-0 gap-4">
                  <span className="w-28 text-[13px] font-bold text-text-primary">Batch #{h.batchId ?? '—'}</span>
                  <span className="w-24 text-[13px] text-text-secondary">{h.round ? `Round ${h.round}` : '—'}</span>
                  <span className="text-[13px] font-semibold text-text-primary">{h.room ?? '—'}</span>
                  <span className={`text-[10px] font-bold tracking-[0.06em] px-2.5 py-1 rounded border ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {[
              ['TOTAL ROUNDS', history.length],
              ['ALLOCATIONS',  history.filter(h => h.result === 'ALLOCATED').length],
              ['ROLLED OVER',  history.filter(h => h.result === 'ROLLED_OVER').length],
            ].map(([l, v]) => (
              <div key={l} className="bg-card border border-border rounded shadow-sm px-4 py-4 flex flex-col gap-1">
                <span className="text-[9.5px] font-bold tracking-[0.1em] text-text-muted">{l}</span>
                <span className="text-[24px] font-black text-text-primary">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AllocationLayout>
  );
}

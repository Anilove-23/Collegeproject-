import AllocationLayout from '../layouts/AllocationLayout';
import { useBatchCountdown } from '../hooks/useBatchCountdown';

const SUBMITTED_PREFS = [
  { rank: 1, roomId: 'C-302', type: '4-Seater' },
  { rank: 2, roomId: 'B-118', type: '2-Seater' },
  { rank: 3, roomId: 'D-414', type: '4-Seater' },
];

export default function SelectionLockedPage() {
  const { display } = useBatchCountdown(734); // ~12 mins until results

  return (
    <AllocationLayout phase="Selection Locked" batch="Batch #12">
      <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-4">

        {/* Success header */}
        <div className="bg-card border border-border rounded shadow-sm px-6 py-8 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h1 className="text-[22px] font-black text-text-primary tracking-tight mb-1">Preferences Submitted</h1>
            <p className="text-[13px] text-text-secondary">Your selections have been locked in. No further changes are allowed while evaluation runs.</p>
          </div>
        </div>

        {/* Submitted preferences snapshot */}
        <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">YOUR SUBMITTED PREFERENCES</p>
          </div>
          {SUBMITTED_PREFS.map(p => (
            <div key={p.rank} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 bg-canvas">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-[11px] font-black flex items-center justify-center shrink-0">{p.rank}</span>
              <span className="text-[13px] font-bold text-text-primary flex-1">{p.roomId}</span>
              <span className="text-[11px] text-text-muted">{p.type}</span>
            </div>
          ))}
        </div>

        {/* Processing state */}
        <div className="bg-card border border-border rounded shadow-sm px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-crimson animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <div>
              <p className="text-[13px] font-bold text-text-primary">Evaluating allocation…</p>
              <p className="text-[11.5px] text-text-secondary">Processing your preferences against available rooms</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold tracking-[0.08em] text-text-muted">RESULTS IN</p>
            <p className="text-[22px] font-black text-crimson tabular-nums">{display}</p>
          </div>
        </div>

        <p className="text-[12px] text-text-muted text-center">
          This page will automatically update when your allocation result is ready.
        </p>
      </div>
    </AllocationLayout>
  );
}

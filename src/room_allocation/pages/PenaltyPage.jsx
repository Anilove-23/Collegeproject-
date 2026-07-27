import AllocationLayout from '../layouts/AllocationLayout';
import PenaltyBanner from '../components/results/PenaltyBanner';

const MOCK_PENALTY = {
  batchMissed: 'Batch #08',
  window: '10:30 PM — 11:30 PM',
  newRank: 412,
  recoveryBatch: 'Batch #24',
};

const TIMELINE = [
  { label: 'Penalty Applied',   date: 'May 11, 2026',  done: true  },
  { label: 'Review Period',     date: 'May 12–13',     done: false },
  { label: 'Queue Re-entry',    date: 'May 14, 2026',  done: false },
  { label: 'Recovery Batch',    date: 'Batch #24',     done: false },
];

export default function PenaltyPage() {
  return (
    <AllocationLayout phase="Penalty" batch="Ghost Penalty Active">
      <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-4">
        <PenaltyBanner newRank={MOCK_PENALTY.newRank} recoveryBatch={MOCK_PENALTY.recoveryBatch} />

        {/* Explanation */}
        <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">WHAT HAPPENED?</p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Your squad's batch window was <strong className="text-text-primary">{MOCK_PENALTY.batchMissed}</strong> at <strong className="text-text-primary">{MOCK_PENALTY.window}</strong>.
              No preferences were submitted within the allocated time window.
            </p>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              As a result, a <strong className="text-text-primary">Ghost Penalty</strong> has been applied.
              Your queue position has been reset and you will re-enter at a lower priority batch.
            </p>
          </div>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-3 gap-3">
          {[['MISSED BATCH', MOCK_PENALTY.batchMissed], ['NEW RANK', `#${MOCK_PENALTY.newRank}`], ['RECOVERY', MOCK_PENALTY.recoveryBatch]].map(([l,v]) => (
            <div key={l} className="bg-card border border-border rounded shadow-sm px-4 py-4 flex flex-col gap-1">
              <span className="text-[9.5px] font-bold tracking-[0.1em] text-text-muted">{l}</span>
              <span className="text-[18px] font-black text-text-primary">{v}</span>
            </div>
          ))}
        </div>

        {/* Recovery timeline */}
        <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">RECOVERY TIMELINE</p>
          </div>
          <div className="relative flex flex-col px-5 py-4">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex items-start gap-3 py-2 relative">
                {i < TIMELINE.length - 1 && <div className="absolute left-[5px] top-[18px] w-px h-full bg-border" />}
                <div className={`w-3 h-3 rounded-full shrink-0 mt-1 z-10 relative ${t.done ? 'bg-crimson' : 'border-2 border-border-dark bg-card'}`} />
                <div>
                  <p className={`text-[12.5px] font-bold ${t.done ? 'text-text-primary' : 'text-text-secondary'}`}>{t.label}</p>
                  <p className="text-[11px] text-text-muted">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AllocationLayout>
  );
}

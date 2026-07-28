import { useBatchCountdown } from '../../hooks/useBatchCountdown';

/** Large central countdown before batch begins */
export default function BatchCountdown({ initialSeconds = 1421, batchId = 'Batch #12' }) {
  const { display, isExpired } = useBatchCountdown(initialSeconds);

  return (
    <div className="flex flex-col items-center text-center px-8 py-10 bg-card border border-border rounded shadow-sm">
      <p className="text-[11px] font-bold tracking-[0.1em] text-text-muted mb-3">
        TIME UNTIL {batchId} BEGINS
      </p>
      <p className={`text-[64px] font-black tracking-[-0.02em] leading-none tabular-nums mb-2 ${isExpired ? 'text-red-500 animate-pulse' : 'text-crimson'}`}>
        {display}
      </p>
      {isExpired && (
        <p className="text-[13px] font-bold text-red-500 mt-2 animate-pulse">BATCH IS STARTING…</p>
      )}
    </div>
  );
}

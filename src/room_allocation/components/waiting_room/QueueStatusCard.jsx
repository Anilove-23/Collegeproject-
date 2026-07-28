/** Queue status card — shows batch position and ETA */
export default function QueueStatusCard({ batchId = 'Batch #12', rank = 1, rollover = true, upcomingBatch = 'Batch #13', upcomingEta = '01:15:00' }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'YOUR BATCH',     value: batchId,      accent: true  },
        { label: 'RANK IN BATCH',  value: `#${rank}`,   accent: true  },
        { label: 'ROLLOVER',       value: rollover ? 'PROTECTED' : 'NONE', accent: rollover },
      ].map(({ label, value, accent }) => (
        <div key={label} className="bg-card border border-border rounded shadow-sm px-4 py-4 flex flex-col gap-1">
          <span className="text-[9.5px] font-bold tracking-[0.1em] text-text-muted">{label}</span>
          <span className={`text-[18px] font-black tracking-tight ${accent ? 'text-crimson' : 'text-text-primary'}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

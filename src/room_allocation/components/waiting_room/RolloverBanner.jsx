/** Banner shown when squad has rolled over from a previous batch */
export default function RolloverBanner({ batchId = 'Batch #12', rank = 1 }) {
  return (
    <div className="flex items-center justify-between bg-crimson rounded px-5 py-3.5 gap-4">
      <div className="flex items-center gap-2.5">
        <span className="text-white font-black text-base opacity-90">!</span>
        <span className="text-white text-[13px] font-extrabold tracking-[0.08em]">ROLLOVER ACTIVE</span>
      </div>
      <div className="px-3.5 py-1.5 border-[1.5px] border-white/50 rounded text-white text-[12px] font-semibold tracking-[0.02em] whitespace-nowrap">
        You enter {batchId} as RANK #{rank} — Rollover Priority
      </div>
    </div>
  );
}

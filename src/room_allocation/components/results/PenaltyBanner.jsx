/** Ghost penalty warning banner */
export default function PenaltyBanner({ newRank = 412, recoveryBatch = 'Batch #24' }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded px-5 py-4">
      <svg className="text-red-500 mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div>
        <p className="text-[13px] font-extrabold text-red-800 mb-1">Ghost Penalty Active</p>
        <p className="text-[12px] text-red-700 leading-relaxed">
          You missed your participation window. Your queue position has been reset to <strong>#{newRank}</strong>.
          Re-entry available at <strong>{recoveryBatch}</strong>.
        </p>
      </div>
    </div>
  );
}

/** ShatterAlert — full-width critical banner for Shatter & Unlock protocol */
export default function ShatterAlert({ onRegroup }) {
  return (
    <div className="bg-red-600 border border-red-700 rounded shadow-lg px-6 py-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <svg className="text-white mt-0.5 shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <p className="text-white text-[15px] font-black tracking-[0.04em] mb-1">SHATTER PROTOCOL ACTIVE</p>
          <p className="text-white/85 text-[13px] leading-relaxed">
            No valid rooms remain for your current squad configuration. Your squad has been automatically disbanded.
            You must regroup or create a new squad to continue allocation.
          </p>
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          onClick={onRegroup}
          className="px-5 py-2.5 bg-white text-red-700 text-[12px] font-black tracking-[0.06em] rounded hover:bg-red-50 transition-colors border-0 cursor-pointer"
        >
          REGROUP NOW
        </button>
        <button className="px-5 py-2.5 bg-transparent text-white text-[12px] font-bold tracking-[0.06em] rounded border-[1.5px] border-white/50 hover:border-white transition-colors cursor-pointer">
          EMERGENCY MATCH
        </button>
      </div>
    </div>
  );
}

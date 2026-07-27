import { useNavigate, useLocation } from 'react-router-dom';
import AllocationLayout from '../layouts/AllocationLayout';
import { useActiveBatch } from '../hooks/useActiveBatch';

export default function ShatteredPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr  = localStorage.getItem('user');
  const user     = userStr ? JSON.parse(userStr) : null;
  const { data: state } = useActiveBatch(user?.id ?? null);

  // Reason injected by the socket redirect (most specific) or a default
  const shatterReason = location.state?.reason
    ?? 'Your squad size exceeded the capacity of all remaining available rooms.';

  return (
    <AllocationLayout phase="Squad Shattered" batch="Re-enter as Solo">
      <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-4">

        {/* Header banner */}
        <div className="bg-card border border-border rounded shadow-sm border-l-4 border-l-amber-500 pl-5 pr-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-amber-500 mb-1">SQUAD SHATTERED</p>
            <h1 className="text-[22px] font-black text-text-primary tracking-tight mb-1.5">
              Your Squad Was Disbanded
            </h1>
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-lg">
              Your squad failed to meet the minimum conditions required to proceed through allocation.
              All members have been released and will re-enter the pool as solo allocators.
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-bold tracking-[0.1em] text-text-muted">STATUS</span>
            <span className="text-[22px] font-extrabold tracking-[0.04em] text-amber-500">SHATTERED</span>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">WHAT HAPPENED?</p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              The <strong className="text-text-primary">Shatter Protocol</strong> was triggered for your squad:
            </p>
            <p className="text-[13px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded px-3 py-2 leading-relaxed">
              {shatterReason}
            </p>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Your squad members have each been returned to the solo pool with their original
              individual ranks. You are now eligible to re-enter the queue independently.
            </p>
          </div>
        </div>

        {/* Status chips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['YOUR RANK',    state?.groupRank ? `#${state.groupRank}` : 'Restored'],
            ['BATCH STATUS', 'Queued as Solo'],
            ['NEXT STEP',    'Join or Wait'],
          ].map(([label, value]) => (
            <div key={label} className="bg-card border border-border rounded shadow-sm px-4 py-4 flex flex-col gap-1">
              <span className="text-[9.5px] font-bold tracking-[0.1em] text-text-muted">{label}</span>
              <span className="text-[18px] font-black text-text-primary">{value}</span>
            </div>
          ))}
        </div>

        {/* Recovery options */}
        <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">YOUR OPTIONS</p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {[
              {
                title: 'Re-join a Squad',
                desc:  'Find another squad to join before the next available batch begins.',
                action: () => navigate('/allocation/squad'),
                label: 'GO TO SQUADS',
              },
              {
                title: 'Continue as Solo',
                desc:  'Proceed individually — you will be placed in the next available batch.',
                action: () => navigate('/allocation/waiting-room'),
                label: 'VIEW TIMELINE',
              },
            ].map((opt) => (
              <div key={opt.title} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="text-[13px] font-bold text-text-primary">{opt.title}</p>
                  <p className="text-[11.5px] text-text-secondary mt-0.5">{opt.desc}</p>
                </div>
                <button
                  onClick={opt.action}
                  className="shrink-0 px-4 py-2 border border-border text-[11px] font-bold tracking-[0.06em] rounded hover:bg-canvas transition-colors cursor-pointer bg-transparent text-text-primary"
                >
                  {opt.label}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AllocationLayout>
  );
}

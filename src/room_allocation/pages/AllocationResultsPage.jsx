import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AllocationLayout from '../layouts/AllocationLayout';
import AllocationResultCard from '../components/results/AllocationResultCard';
import RoommateList from '../components/results/RoommateList';
import LoadingScreen from '../components/shared/LoadingScreen';
import { getFinalAllocation, downloadAllotmentLetter } from '../api/results.api';
import { useActiveBatch } from '../hooks/useActiveBatch';
import { batchKeys } from '../hooks/queryKeys';

export default function AllocationResultsPage() {
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  // ── TanStack Query: allocation state (replaces useAllocationState) ──
  const { data: allocationState, isLoading: stateLoading } = useActiveBatch(studentId);

  // ── TanStack Query: final allocation result (replaces useEffect + getFinalAllocation) ──
  const { data: result, isLoading: resultLoading } = useQuery({
    queryKey: batchKeys.result(studentId),
    queryFn:  () => getFinalAllocation(studentId),
    enabled:  !!studentId,
    staleTime: 60_000,
  });

  if (stateLoading || resultLoading) return <LoadingScreen label="Fetching your allocation result…" />;

  /* ── STATE C: Waiting for results (No result yet) ── */
  if (!result || !result.room) {
    const isBeforeLive = allocationState?.phase === 'LOBBY' || allocationState?.phase === 'SOFT_LOCK' || allocationState?.phase === 'ADMIN_MODE';
    const isLive = allocationState?.phase === 'LIVE_BATCHES';
    
    return (
      <AllocationLayout phase="Results" batch={allocationState?.batchNumber ? `Batch ${allocationState.batchNumber}` : 'Batch TBD'}>
        <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-4">
          <div className="bg-card border border-border rounded shadow-sm px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-canvas border border-border flex items-center justify-center text-text-muted text-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <h1 className="text-[20px] font-black text-text-primary mb-1.5">Results Not Available Yet</h1>
              <p className="text-[13px] text-text-secondary leading-relaxed max-w-sm mx-auto">
                {isBeforeLive 
                  ? 'The allocation process has not started yet. Please wait until your batch becomes active.' 
                  : isLive 
                  ? 'Allocations are currently in progress. Your result will appear here once your batch has been processed.'
                  : allocationState?.phase === 'FINAL_SWEEP'
                  ? 'The final sweep is currently processing. Unallocated students are being assigned to the remaining beds.'
                  : 'Your allocation result is still pending. Please check back later.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/allocation/waiting-room')}
              className="mt-2 px-6 py-2.5 border border-border text-[11px] font-bold tracking-[0.1em] rounded hover:bg-canvas transition-colors cursor-pointer bg-transparent text-text-primary"
            >
              GO TO TIMELINE
            </button>
          </div>
        </div>
      </AllocationLayout>
    );
  }

  /* ── STATE B: Rollover ── */
  if (result.status === 'ROLLOVER') {
    return (
      <AllocationLayout phase="Results" batch="Allocation Complete">
        <div className="max-w-2xl mx-auto flex flex-col gap-5 pt-4">
          <div className="bg-card border border-border rounded shadow-sm px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 text-2xl">↩</div>
            <div>
              <h1 className="text-[20px] font-black text-text-primary mb-1.5">No Room Available</h1>
              <p className="text-[13px] text-text-secondary leading-relaxed max-w-sm">
                No valid room was available in your batch. You have been granted rollover protection and will be prioritised in the next batch.
              </p>
            </div>
          </div>
        </div>
      </AllocationLayout>
    );
  }

  /* ── STATE A: Successful allocation ── */
  return (
    <AllocationLayout phase="Results" batch="Allocation Complete">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pt-4">
        <AllocationResultCard result={result} />

        <div className="grid grid-cols-[1fr_260px] gap-5 items-start">
          <RoommateList roommates={result?.roommates || []} />

          <div className="flex flex-col gap-4">
            {/* Move-in window */}
            <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[10.5px] font-bold tracking-[0.1em] text-crimson">MOVE-IN SCHEDULE</p>
              </div>
              <div className="px-4 py-4 flex flex-col gap-2">
                {[['Window Opens', 'May 15, 2026'], ['Window Closes', 'May 20, 2026'], ['Physical Block', result?.room?.block ? `Block ${result.room.block} Hostel` : 'Unassigned']].map(([l,v]) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold tracking-[0.08em] text-text-muted">{l}</p>
                    <p className="text-[13px] font-bold text-text-primary">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => downloadAllotmentLetter()}
              className="w-full py-3 bg-crimson text-white text-[12px] font-black tracking-[0.06em] rounded hover:bg-crimson-dark transition-colors border-0 cursor-pointer"
            >
              DOWNLOAD ALLOTMENT LETTER
            </button>
          </div>
        </div>
      </div>
    </AllocationLayout>
  );
}

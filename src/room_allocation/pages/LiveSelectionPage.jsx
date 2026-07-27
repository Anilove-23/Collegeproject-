import { useNavigate } from 'react-router-dom';
import AllocationLayout from '../layouts/AllocationLayout';
import { useActiveBatch } from '../hooks/useActiveBatch';
import { useRoundState } from '../hooks/useRoundState';
import LiveRoundTimer from '../components/live_selection/LiveRoundTimer';
import PreferenceBuilder from '../components/live_selection/PreferenceBuilder';

export default function LiveSelectionPage() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  const { data: allocationState, isLoading: loading } = useActiveBatch(studentId);
  const { roundNumber, roundEndsAt } = useRoundState(allocationState);
  const isLeader = allocationState?.isLeader ?? false;

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <LiveRoundTimer round={roundNumber ?? 1} targetDate={roundEndsAt} isLeader={isLeader} />

      <AllocationLayout
        phase="Live Selection"
        batch={`Batch #${allocationState?.batchNumber ?? 'TBD'} - Round ${allocationState?.roundNumber ?? 1}`}
        hostelId={allocationState?.hostelId}
      >
        <div className="flex flex-col gap-4 min-h-full pb-8">
          <PreferenceBuilder 
            studentId={studentId} 
            allocationState={allocationState} 
            isLiveMode={true} 
          />
        </div>
      </AllocationLayout>
    </div>
  );
}

import { Navigate } from 'react-router-dom';
import AllocationLayout from '../layouts/AllocationLayout';
import PreferenceBuilder from '../components/live_selection/PreferenceBuilder';
import { useActiveBatch } from '../hooks/useActiveBatch';

export default function PreferencesPage() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  const { data: allocationState } = useActiveBatch(studentId);
  const isLiveTurn = allocationState?.batchActive && !allocationState?.submitted && !allocationState?.isAllocated;

  if (allocationState?.isAllocated) {
    return <Navigate to="/allocation/results" replace />;
  }

  if (allocationState?.submitted) {
    return <Navigate to="/allocation/selection/locked" replace />;
  }

  return (
    <AllocationLayout phase="Selection Phase" batch="Preferences">
      <div className="max-w-6xl mx-auto flex flex-col gap-5 pt-4 min-h-full pb-8">
        <PreferenceBuilder 
          studentId={studentId} 
          allocationState={allocationState} 
          isLiveMode={isLiveTurn} 
        />
      </div>
    </AllocationLayout>
  );
}

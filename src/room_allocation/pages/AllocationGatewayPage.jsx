import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveBatch } from '../hooks/useActiveBatch';
import LoadingScreen from '../components/shared/LoadingScreen';
import ErrorState from '../components/shared/ErrorState';
import { ROUTES } from '../constants/routes';
import AllocationLayout from '../layouts/AllocationLayout';
import PreLobbyPage from './PreLobbyPage';

function resolveRoute(state) {
  if (!state)                                       return null;
  if (state.isPenalized)                            return ROUTES.PENALTY;
  if (state.groupStatus === 'SHATTERED')            return ROUTES.SHATTERED;
  if (state.isAllocated || state.phase === 'FINAL_SWEEP') return ROUTES.RESULTS;
  if (state.submitted)                              return ROUTES.LOCKED;
  if (state.batchActive)                            return ROUTES.LIVE;
  if (state.waitingForBatch)                        return ROUTES.WAITING_ROOM;
  if (state.hasSquad)                               return ROUTES.SQUAD;
  return ROUTES.SQUAD_SOLO;
}

export default function AllocationGatewayPage() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [targetRoute, setTargetRoute] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user ? user.id : null;

  const { data: state, isLoading: loading, error } = useActiveBatch(studentId);

  useEffect(() => {
    if (!loading && !error && state) {
      const phase = state.phase;

      // Pre-lobby phases — don't redirect, show PreLobbyPage
      if (phase === 'ADMIN_MODE') return;

      const target = resolveRoute(state);
      if (!target) return;

      // Redirect instantly instead of forcing an artificial delay
      navigate(target, { replace: true });
    }
  }, [state, loading, error, navigate]);

  if (!studentId) {
    return (
      <AllocationLayout>
        <ErrorState
          title="Authentication Required"
          message="No active student session found. Please login first."
          onRetry={() => navigate('/')}
        />
      </AllocationLayout>
    );
  }

  if (loading) return <LoadingScreen label="Checking your allocation status…" />;

  if (error) {
    return (
      <AllocationLayout>
        <ErrorState
          title="Could not load allocation state"
          message={error.message}
          onRetry={() => window.location.reload()}
        />
      </AllocationLayout>
    );
  }

  // Pre-lobby: allocation not yet scheduled
  if (state && state.phase === 'ADMIN_MODE') {
    return (
      <PreLobbyPage
        allocationDate={state.allocationDate}
        lobbyOpensAt={state.lobbyOpensAt}
      />
    );
  }

  // Fallback (should not normally be reached)
  return <LoadingScreen label="Setting up your allocation portal…" />;
}

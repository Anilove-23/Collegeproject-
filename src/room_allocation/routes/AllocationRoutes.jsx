import { Route, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import AllocationGatewayPage  from '../pages/AllocationGatewayPage';
import SquadLobbyPage         from '../pages/SquadLobbyPage';
import WaitingRoomPage        from '../pages/WaitingRoomPage';
import LiveSelectionPage      from '../pages/LiveSelectionPage';
import SelectionLockedPage    from '../pages/SelectionLockedPage';
import AllocationResultsPage  from '../pages/AllocationResultsPage';
import PenaltyPage            from '../pages/PenaltyPage';
import ShatteredPage          from '../pages/ShatteredPage';
import AllocationHistoryPage  from '../pages/AllocationHistoryPage';
import RoomGridPage           from '../pages/RoomGridPage';
import PreferencesPage        from '../pages/PreferencesPage';
import AllocationAdminPage    from '../pages/AllocationAdminPage';
import ErrorBoundary          from '../components/shared/ErrorBoundary';

/**
 * AllocationRoutes — renders all room_allocation module routes.
 * Usage: embed inside a parent <Routes> in main.jsx.
 */

function AllocationRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

const AllocationRoutes = [
  {
    element: <AllocationRoot />,
    children: [
      { path: "/allocation", element: <AllocationGatewayPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/squad", element: <SquadLobbyPage hasGroup={true} />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/squad-solo", element: <SquadLobbyPage hasGroup={false} />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/waiting-room", element: <WaitingRoomPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/selection/live", element: <LiveSelectionPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/selection/locked", element: <SelectionLockedPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/results", element: <AllocationResultsPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/penalty", element: <PenaltyPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/shattered", element: <ShatteredPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/history", element: <AllocationHistoryPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/room-grid", element: <RoomGridPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/preferences", element: <PreferencesPage />, errorElement: <ErrorBoundary /> },
      { path: "/allocation/admin", element: <AllocationAdminPage />, errorElement: <ErrorBoundary /> },
    ]
  }
];

export default AllocationRoutes;

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import StatusBar from './components/StatusBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import AppHeader from './components/AppHeader.jsx';
import Overview from './pages/Overview.jsx';
import Today from './pages/Today.jsx';
import Work from './pages/Work.jsx';
import Stats from './pages/Stats.jsx';
import Me from './pages/Me.jsx';
import Workout from './pages/Workout.jsx';

export default function App() {
  const location = useLocation();
  const isWorkout = location.pathname === '/workout';
  const isOverview = location.pathname === '/overview';

  return (
    <div className="page-bg">
      <div className="phone-shell flex flex-col">
        <StatusBar />
        {!isWorkout && <AppHeader />}

        <main
          key={location.pathname}
          className={`route-enter flex-1 min-h-0 flex flex-col ${isOverview ? 'overflow-y-auto no-scrollbar' : ''}`}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/today" element={<Today />} />
            <Route path="/work" element={<Work />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/me" element={<Me />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>

        {!isWorkout && <BottomNav />}
      </div>
    </div>
  );
}

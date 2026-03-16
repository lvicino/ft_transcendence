// src/App.tsx
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';

import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Play from './pages/Play';
import GameCreate from './pages/GameCreate';
import GameJoin from './pages/GameJoin';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import GameFinished from './pages/GameFinished';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

import { useAuth } from './store';

import { SessionHydrator } from './components/auth/SessionHydrator';
import { Toaster } from './components/Toaster';
import ChatSidebar from './components/ChatSidebar';

function RequireAuthShell() {
  const { isAuthenticated, authStatus } = useAuth();

  if (authStatus === 'checking') return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <>
      <Outlet />

      <ChatSidebar />
    </>
  );
}

function RequireGuest() {
  const { isAuthenticated, authStatus } = useAuth();
  const location = useLocation();

  const forceAuthMock =
    location.pathname === '/auth' &&
    new URLSearchParams(location.search).get('forceAuthMock') === '1';

  if (authStatus === 'checking') return <Outlet />;
  return isAuthenticated && !forceAuthMock ? <Navigate to="/play" replace /> : <Outlet />;
}

export default function App() {
  return (
    <>
      <SessionHydrator />
      <Routes>
        <Route element={<MainLayout />}>

          <Route element={<RequireGuest />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
          </Route>


          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route element={<RequireAuthShell />}>
            <Route path="/play" element={<Play />} />

            <Route path="/me" element={<Profile />} />
            <Route path="/users/:id" element={<Profile />} />
            <Route path="/profile" element={<Navigate to="/me" replace />} />

            <Route path="/game/create" element={<GameCreate />} />
            <Route path="/game/join" element={<GameJoin />} />

            <Route path="/lobby" element={<Lobby />} />
            <Route path="/lobby/:matchId" element={<Lobby />} />

            <Route path="/game" element={<Game />} />
            <Route path="/game/:matchId" element={<Game />} />
            <Route path="/game/finished" element={<GameFinished />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <Toaster />
    </>
  );
}

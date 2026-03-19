// src/App.tsx
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
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
import { Loader } from './components/ui/Loader';

function AuthGateLoader() {
  return <Loader variant="full-page" size="lg" />;
}

function RequireAuthShell() {
  const { isAuthenticated, authStatus } = useAuth();

  if (authStatus === 'checking') return <AuthGateLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <>
      <Outlet />

      <ChatSidebar />
    </>
  );
}

export default function App() {
  return (
    <>
      <SessionHydrator />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />


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

// src/App.tsx
import { useEffect, useState } from 'react';
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

import { useAuth, useAuthStore, useChatStore } from './store';

import { Toaster } from './components/Toaster';
import ChatSidebar from './components/ChatSidebar';
import { Loader } from './components/ui/Loader';

function RequireAuthShell() {
  const { isAuthenticated } = useAuth();

  // Auto-connect chat WebSocket as soon as the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      useChatStore.getState().connect();
    }
    return () => {
      useChatStore.getState().disconnect();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <>
      <Outlet />
      <ChatSidebar />
    </>
  );
}

function RequireGuest() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const forceAuthMock =
    location.pathname === '/auth' &&
    new URLSearchParams(location.search).get('forceAuthMock') === '1';

  return isAuthenticated && !forceAuthMock ? <Navigate to="/play" replace /> : <Outlet />;
}

// Session restoration: check if the user has a valid JWT cookie on app load
function useSessionRestore() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Clear the flag so it doesn't persist across future navigations
    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    if (justLoggedOut) sessionStorage.removeItem('just_logged_out');

    const restore = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          useAuthStore.getState().actions.login('cookie', {
            id: String(data.id),
            username: data.username,
            email: '',
          });
        }
      } catch {
        // no valid session — that's fine
      } finally {
        setIsReady(true);
      }
    };

    // Only restore if the auth store doesn't already have a user
    if (!useAuthStore.getState().user) {
      restore();
    } else {
      setIsReady(true);
    }
  }, []);

  return isReady;
}

export default function App() {
  const isReady = useSessionRestore();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg">
        <Loader size="lg" label="Restoring session…" />
      </div>
    );
  }

  return (
    <>
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

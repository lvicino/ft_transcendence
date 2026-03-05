// src/App.tsx
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';

import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
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

import { Toaster } from './components/Toaster';
import ChatSidebar from './components/ChatSidebar';

/**
 * Защита приватных роутов + тут же подключаем приватные оверлеи (чат).
 * Если токена нет — отправляем на /auth.
 */
function RequireAuthShell() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <>
      <Outlet />
      {/* ✅ Чат доступен только авторизованным */}
      <ChatSidebar />
    </>
  );
}

/**
 * Публичные роуты (Landing, Auth).
 * Если юзер уже вошёл — отправляем его в Dashboard.
 * Но можно форсить показ /auth через ?forceAuthMock=1 (для вёрстки).
 */
function RequireGuest() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const forceAuthMock =
    location.pathname === '/auth' &&
    new URLSearchParams(location.search).get('forceAuthMock') === '1';

  return isAuthenticated && !forceAuthMock ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          {/* --- ПУБЛИЧНЫЕ --- */}
          <Route element={<RequireGuest />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
          </Route>

          {/* Всегда доступны */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* --- ЗАЩИЩЕННЫЕ --- */}
          <Route element={<RequireAuthShell />}>
            <Route path="/dashboard" element={<Dashboard />} />

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

          {/* --- 404 --- */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Глобальные уведомления можно оставить для всех страниц */}
      <Toaster />
    </>
  );
}

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { apiUrl } from '@/net/http';
import { useAuthStore } from '@/store';
import type { User } from '@/lib/types';

type SessionResponse = {
  user: User;
};

export function SessionHydrator() {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setChecking = useAuthStore((state) => state.setChecking);
  const location = useLocation();
  const lastCheckedPathRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (authStatus === 'authenticated' && user) return;
      if (lastCheckedPathRef.current === location.pathname) return;

      lastCheckedPathRef.current = location.pathname;
      setChecking();

      try {
        const res = await fetch(apiUrl('/auth/session'), {
          credentials: 'include',
        });
        if (res.status === 401) {
          if (!cancelled) {
            logout();
          }
          return;
        }
        if (!res.ok) {
          throw new Error(`Session request failed with ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          const session = data as SessionResponse;
          login(session.user);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authStatus, location.pathname, login, logout, setChecking, user]);

  return null;
}

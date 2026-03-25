import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../lib/types';

interface AuthState {
  token: string | null;
  user: User | null;
  actions: {
    login: (token: string, user: User) => void;
    logout: () => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      actions: {
        login: (token, user) => set({ token, user }),
        logout: () => {
          set({ token: null, user: null });
          try { localStorage.removeItem('auth-storage'); } catch {}
        },
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({ token: state.token, user: state.user }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted && typeof persisted === 'object' ? persisted : {}),
        // Never let persisted data overwrite live action functions
        actions: current.actions,
      }),
    }
  )
);

export const useAuth = () => {
  const { token, user, actions } = useAuthStore();
  return {
    isAuthenticated: !!token,
    user,
    ...actions,
  };
};
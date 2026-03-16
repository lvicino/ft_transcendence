import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  authStatus: 'checking' | 'authenticated' | 'guest';
  login: (user: User) => void;
  logout: () => void;
  setChecking: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authStatus: 'checking',
      login: (user) => set({ user, authStatus: 'authenticated' }),
      logout: () => {
        set({ user: null, authStatus: 'guest' });
      },
      setChecking: () => set({ authStatus: 'checking' }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export const useAuth = () => {
  const { user, authStatus, login, logout } = useAuthStore();
  return {
    isAuthenticated: authStatus === 'authenticated' && !!user,
    authStatus,
    user,
    login,
    logout,
  };
};

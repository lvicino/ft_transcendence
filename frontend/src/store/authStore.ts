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
        },
      },
    }),
    { name: 'auth-storage' }
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
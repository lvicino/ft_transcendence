import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '../lib/types';
import { useMatchmakingStore } from './gameStore';

type AuthStoreState = {
  token: string | null;
  user: User | null;
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: ({ token, user }) => set({ token, user }),
      logout: () => {
        useMatchmakingStore.getState().cancelMatchmaking();
        set({ token: null, user: null });
      },
    }),
    {
      name: 'ft_transcendence_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return { isAuthenticated: Boolean(token), user, login, logout };
}

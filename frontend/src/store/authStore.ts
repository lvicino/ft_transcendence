import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '../lib/types';

type AuthStoreState = {
  user: User | null;
  login: (payload: { user: User }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      login: ({ user }) => set({ user }),
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'ft_transcendence_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return { isAuthenticated: Boolean(user), user, login, logout };
}

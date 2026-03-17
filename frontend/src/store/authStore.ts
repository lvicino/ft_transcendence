import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  authStatus: 'checking' | 'authenticated' | 'guest';
  login: (user: User) => void;
  updateProfile: (username: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  logout: () => void;
  setChecking: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authStatus: 'checking',
      login: (user) => set({ user, authStatus: 'authenticated' }),
      updateProfile: async (username: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, username } : state.user,
        }));
      },
      uploadAvatar: async (file: File) => {
        const avatar = URL.createObjectURL(file);
        set((state) => ({
          user: state.user ? { ...state.user, avatar } : state.user,
        }));
      },
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
  const { user, authStatus, login, updateProfile, uploadAvatar, logout } = useAuthStore();
  return {
    isAuthenticated: authStatus === 'authenticated' && !!user,
    authStatus,
    user,
    login,
    updateProfile,
    uploadAvatar,
    logout,
  };
};

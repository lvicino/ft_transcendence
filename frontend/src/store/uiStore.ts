import { create } from 'zustand';

import type { Toast, ToastType } from '../lib/types';

type UIStoreState = {
  isChatOpen: boolean;
  isVignetteActive: boolean;
  toasts: Toast[];
  toggleChat: () => void;
  closeChat: () => void;
  setVignetteActive: (active: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
};

const generateId = () => Math.random().toString(36).slice(2, 9);

export const useUIStore = create<UIStoreState>((set, get) => ({
  isChatOpen: false,
  isVignetteActive: true,
  toasts: [],

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  closeChat: () => set({ isChatOpen: false }),
  setVignetteActive: (active) => set({ isVignetteActive: active }),

  addToast: (toast) => {
    const id = generateId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

export function useUI() {
  const isChatOpen = useUIStore((state) => state.isChatOpen);
  const isVignetteActive = useUIStore((state) => state.isVignetteActive);
  const toggleChat = useUIStore((state) => state.toggleChat);
  const closeChat = useUIStore((state) => state.closeChat);
  const setVignetteActive = useUIStore((state) => state.setVignetteActive);

  return { isChatOpen, isVignetteActive, toggleChat, closeChat, setVignetteActive };
}

export function useToast() {
  const toasts = useUIStore((state) => state.toasts);
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  return {
    toasts,
    dismiss: removeToast,
    toast: (msg: string, type: ToastType = 'info') => addToast({ message: msg, type }),
    success: (msg: string) => addToast({ message: msg, type: 'success' }),
    error: (msg: string) => addToast({ message: msg, type: 'error' }),
  };
}

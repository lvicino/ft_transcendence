import { create } from 'zustand';
import type { GameStatus, GameplayState } from '../lib/types';

type MatchmakingStoreState = {
  status: GameStatus;
  matchId: string | null;
  queueTimer: number;

  beginMatchmaking: () => void;
  cancelMatchmaking: () => void;
  setMatchFound: (matchId: string) => void;

  // ✅ добавили для UI-flow
  startMatch: () => void;
  finishMatch: () => void;
};

const generateId = () => Math.random().toString(36).slice(2, 9);

let mockInterval: ReturnType<typeof setInterval> | null = null;

export const useMatchmakingStore = create<MatchmakingStoreState>((set, get) => ({
  status: 'idle',
  matchId: null,
  queueTimer: 0,

  beginMatchmaking: () => {
    const { status } = get();
    if (status !== 'idle') return;

    set({ status: 'searching', queueTimer: 0 });
    get().cancelMatchmaking();
    set({ status: 'searching', queueTimer: 0 });

    const start = Date.now();
    mockInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      set({ queueTimer: elapsed });

      if (elapsed > 3) {
        get().setMatchFound(`match_${generateId()}`);
      }
    }, 1000);
  },

  cancelMatchmaking: () => {
    if (mockInterval) clearInterval(mockInterval);
    mockInterval = null;
    set({ status: 'idle', matchId: null, queueTimer: 0 });
  },

  setMatchFound: (matchId) => {
    if (mockInterval) clearInterval(mockInterval);
    mockInterval = null;
    set({ status: 'lobby', matchId });
  },

  // ✅ минимально: лобби -> игра
  startMatch: () => {
    const { status, matchId } = get();
    if (status !== 'lobby' || !matchId) return;
    set({ status: 'playing' });
  },

  // ✅ минимально: игра -> конец
  finishMatch: () => {
    const { status } = get();
    if (status !== 'playing') return;
    set({ status: 'finished' });
  },
}));

export const useGameStore = create<GameplayState>((set) => ({
  ball: { x: 50, y: 50 },
  paddles: { left: 50, right: 50 },
  score: { left: 0, right: 0 },

  updateGame: (data) => set((state) => ({ ...state, ...data })),
  resetGame: () =>
    set({
      ball: { x: 50, y: 50 },
      paddles: { left: 50, right: 50 },
      score: { left: 0, right: 0 },
    }),
}));

export function useMatchmaking() {
  const status = useMatchmakingStore((s) => s.status);
  const matchId = useMatchmakingStore((s) => s.matchId);
  const queueTimer = useMatchmakingStore((s) => s.queueTimer);
  const beginMatchmaking = useMatchmakingStore((s) => s.beginMatchmaking);
  const cancelMatchmaking = useMatchmakingStore((s) => s.cancelMatchmaking);
  const setMatchFound = useMatchmakingStore((s) => s.setMatchFound);

  // ✅ новое
  const startMatch = useMatchmakingStore((s) => s.startMatch);
  const finishMatch = useMatchmakingStore((s) => s.finishMatch);

  return {
    status,
    matchId,
    queueTimer,
    beginMatchmaking,
    cancelMatchmaking,
    setMatchFound,
    startMatch,
    finishMatch,
  };
}

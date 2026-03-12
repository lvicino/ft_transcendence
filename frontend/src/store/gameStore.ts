// src/store/gameStore.ts
import { create } from 'zustand';
import type { GameStatus, GameTheme, GameplayState } from '../lib/types';


type GameFlowState = {
  status: GameStatus;
  matchId: string | null;
  theme: GameTheme;
  powerUps: boolean;
  maxScore: number;

  enterLobby: (matchId: string) => void;
  leaveLobby: () => void;
  startMatch: () => void;
  finishMatch: () => void;
  setTheme: (theme: GameTheme) => void;
  togglePowerUps: () => void;
  setMaxScore: (maxScore: number) => void;
};

export const useGameFlowStore = create<GameFlowState>((set, get) => ({
  status: 'idle',
  matchId: null,
  theme: 'classic',
  powerUps: false,
  maxScore: 5,

  enterLobby: (matchId) => set({ status: 'lobby', matchId }),

  leaveLobby: () => set({ status: 'idle', matchId: null }),

  startMatch: () => {
    const { status, matchId } = get();
    if (status !== 'lobby' || !matchId) return;
    set({ status: 'playing' });
  },

  finishMatch: () => {
    const { status } = get();
    if (status !== 'playing') return;
    set({ status: 'finished' });
  },

  setTheme: (theme) => set({ theme }),

  togglePowerUps: () => set((s) => ({ powerUps: !s.powerUps })),

  setMaxScore: (maxScore) => set({ maxScore }),
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

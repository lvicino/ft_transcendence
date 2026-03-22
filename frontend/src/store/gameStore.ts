// src/store/gameStore.ts
import { create } from 'zustand';
import type { GameStatus, GameTheme, GameplayState } from '../lib/types';


type GameFlowState = {
  status: GameStatus;
  matchId: number | null;
  password: string | null;
  theme: GameTheme;
  ballSpeed: number;
  paddleSpeed: number;
  maxScore: number;

  setStatus: (status: GameStatus) => void;
  enterLobby: (matchId: number) => void;
  leaveLobby: () => void;
  startMatch: () => void;
  finishMatch: () => void;
  setTheme: (theme: GameTheme) => void;
  setBallSpeed: (ballSpeed: number) => void;
  setPaddleSpeed: (paddleSpeed: number) => void;
  setMaxScore: (maxScore: number) => void;
  setmatchId: (matchId: number) => void;
  setpassword: (password: string) => void;
};

export const useGameFlowStore = create<GameFlowState>((set, get) => ({
  status: 'idle',
  matchId: null,
  password: null,
  theme: 'classic',
  ballSpeed: 5,
  paddleSpeed: 5,
  maxScore: 5,


  setStatus: (status) => set({status}),

  enterLobby: (matchId) => set({ status: 'lobby', matchId }), // a supp ?

  leaveLobby: () => set({ status: 'idle', matchId: null }), // a supp ?

  startMatch: () => { // a metre dans use game Store ?
    const { status, matchId } = get();
    if (status !== 'lobby' || !matchId) return;
    set({ status: 'playing' });
  },

  finishMatch: () => { // a metre dans use game Store ?
    const { status } = get();
    if (status !== 'playing') return;
    set({ status: 'finished' });
  },

  setTheme: (theme) => set({ theme }),

  setBallSpeed: (ballSpeed) => set({ ballSpeed }),

  setPaddleSpeed: (paddleSpeed) => set({ paddleSpeed }),

  setMaxScore: (maxScore) => set({ maxScore }),

  setmatchId: (matchId) => set({ matchId }),

  setpassword: (password) => set({ password }),
}));

export const useGameStore = create<GameplayState>((set) => ({
  ball: { x: 50, y: 50 },
  paddles: { left: 50, right: 50 },
  score: { left: 0, right: 0 },

  updateGame: (data) => set((state) => ({ ...state, ...data })),

  resetGame: () => // pas besoin car c'est le backend qui le fait non ?
    set({
      ball: { x: 50, y: 50 },
      paddles: { left: 50, right: 50 },
      score: { left: 0, right: 0 },
    }),
}));

import { create } from 'zustand';
import type { GameStatus, GameplayState, GameCreationInfo, BackendGameState } from '../lib/types';

type GameFlowStoreState = {
  status: GameStatus;
  gameId: number | null;
  gamePassword: string | null;
  playerCount: string | null;

  setGameCreated: (info: GameCreationInfo) => void;
  setGameJoinInfo: (gameId: number, password: string) => void;
  setPlayerCount: (count: string) => void;
  startMatch: () => void;
  finishMatch: () => void;
  reset: () => void;
};

export const useGameFlowStore = create<GameFlowStoreState>((set, get) => ({
  status: 'idle',
  gameId: null,
  gamePassword: null,
  playerCount: null,

  setGameCreated: (info) => {
    set({
      status: 'lobby',
      gameId: info.gameId,
      gamePassword: info.gamePassword,
      playerCount: null,
    });
  },

  setGameJoinInfo: (gameId, password) => {
    set({
      status: 'lobby',
      gameId,
      gamePassword: password,
      playerCount: null,
    });
  },

  setPlayerCount: (count) => {
    set({ playerCount: count });
  },

  startMatch: () => {
    const { status } = get();
    if (status !== 'lobby') return;
    set({ status: 'playing' });
  },

  finishMatch: () => {
    const { status } = get();
    if (status !== 'playing') return;
    set({ status: 'finished' });
  },

  reset: () => {
    set({
      status: 'idle',
      gameId: null,
      gamePassword: null,
      playerCount: null,
    });
  },
}));

export const useGameStore = create<GameplayState>((set) => ({
  gameState: null,
  score: { left: 0, right: 0 },

  updateGameState: (data: BackendGameState) => set({ gameState: data }),
  incrementScore: (team: number) =>
    set((state) => ({
      score: {
        left: team === 1 ? state.score.left + 1 : state.score.left,
        right: team === 0 ? state.score.right + 1 : state.score.right,
      },
    })),
  resetGame: () =>
    set({
      gameState: null,
      score: { left: 0, right: 0 },
    }),
}));

export function useGameFlow() {
  const status = useGameFlowStore((s) => s.status);
  const gameId = useGameFlowStore((s) => s.gameId);
  const gamePassword = useGameFlowStore((s) => s.gamePassword);
  const playerCount = useGameFlowStore((s) => s.playerCount);
  const setGameCreated = useGameFlowStore((s) => s.setGameCreated);
  const setGameJoinInfo = useGameFlowStore((s) => s.setGameJoinInfo);
  const setPlayerCount = useGameFlowStore((s) => s.setPlayerCount);
  const startMatch = useGameFlowStore((s) => s.startMatch);
  const finishMatch = useGameFlowStore((s) => s.finishMatch);
  const reset = useGameFlowStore((s) => s.reset);

  return {
    status,
    gameId,
    gamePassword,
    playerCount,
    setGameCreated,
    setGameJoinInfo,
    setPlayerCount,
    startMatch,
    finishMatch,
    reset,
  };
}

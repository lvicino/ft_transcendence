import { create } from 'zustand';
import type { GameStatus, GameplayState, GameCreationInfo, BackendGameState } from '../lib/types';
import { connectGameSocket } from '@/net';
import type { GameSocket } from '@/net';

type GameFlowStoreState = {
  status: GameStatus;
  gameId: number | null;
  gamePassword: string | null;
  playerCount: string | null;
  socket: GameSocket | null;

  setGameCreated: (info: GameCreationInfo) => void;
  setGameJoinInfo: (gameId: number, password: string) => void;
  setPlayerCount: (count: string) => void;
  startMatch: () => void;
  finishMatch: () => void;
  reset: () => void;

  /** Connect WebSocket and join game. Called from Lobby.tsx once. */
  connectAndJoin: (callbacks: {
    onGameState: (state: BackendGameState) => void;
    onInfo: (message: string, playerCount: string) => void;
    onError: (message: string) => void;
    onGameStop: (reason: number) => void;
  }) => void;

  /** Send input through the global socket */
  sendInput: (moove: -1 | 0 | 1) => void;

  /** Close the socket and reset everything */
  disconnectAndReset: () => void;
};

export const useGameFlowStore = create<GameFlowStoreState>((set, get) => ({
  status: 'idle',
  gameId: null,
  gamePassword: null,
  playerCount: null,
  socket: null,

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
    const { status, socket } = get();
    if (status !== 'playing') return;
    // Close socket on finish but don't reset game info (for score display)
    if (socket) {
      socket.close();
    }
    set({ status: 'finished', socket: null });
  },

  reset: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
    set({
      status: 'idle',
      gameId: null,
      gamePassword: null,
      playerCount: null,
      socket: null,
    });
  },

  connectAndJoin: (callbacks) => {
    const { gameId, gamePassword, socket: existingSocket } = get();
    if (gameId === null || gamePassword === null) return;

    // Don't reconnect if socket already exists and is open
    if (existingSocket?.isOpen()) return;

    const socket = connectGameSocket({
      onOpen: () => {
        // Send the join message immediately on connect
        socket.join(gameId, gamePassword);
      },
      onInfo: (message, playerCount) => {
        callbacks.onInfo(message, playerCount);
      },
      onGameState: (state) => {
        callbacks.onGameState(state);
      },
      onGameStop: (reason) => {
        callbacks.onGameStop(reason);
      },
      onError: (message) => {
        callbacks.onError(message);
      },
      onClose: () => {
        // Only set socket to null if it's still the same one
        const current = get().socket;
        if (current === socket) {
          set({ socket: null });
        }
      },
    });

    set({ socket });
  },

  sendInput: (moove) => {
    const { socket } = get();
    if (socket?.isOpen()) {
      socket.sendInput(moove);
    }
  },

  disconnectAndReset: () => {
    get().reset();
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
  const socket = useGameFlowStore((s) => s.socket);
  const setGameCreated = useGameFlowStore((s) => s.setGameCreated);
  const setGameJoinInfo = useGameFlowStore((s) => s.setGameJoinInfo);
  const setPlayerCount = useGameFlowStore((s) => s.setPlayerCount);
  const startMatch = useGameFlowStore((s) => s.startMatch);
  const finishMatch = useGameFlowStore((s) => s.finishMatch);
  const reset = useGameFlowStore((s) => s.reset);
  const connectAndJoin = useGameFlowStore((s) => s.connectAndJoin);
  const sendInput = useGameFlowStore((s) => s.sendInput);
  const disconnectAndReset = useGameFlowStore((s) => s.disconnectAndReset);

  return {
    status,
    gameId,
    gamePassword,
    playerCount,
    socket,
    setGameCreated,
    setGameJoinInfo,
    setPlayerCount,
    startMatch,
    finishMatch,
    reset,
    connectAndJoin,
    sendInput,
    disconnectAndReset,
  };
}

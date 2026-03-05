export type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export type PresenceStatus = 'online' | 'ingame' | 'offline';

export type GameStatus = 'idle' | 'searching' | 'lobby' | 'playing' | 'finished';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

export interface AuthState {
  token: string | null;
  user: User | null;
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
}

export interface MatchmakingState {
  status: GameStatus;
  matchId: string | null;
  queueTimer: number;
  beginMatchmaking: () => void;
  cancelMatchmaking: () => void;
  setMatchFound: (matchId: string) => void;
}

export interface UIState {
  isChatOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
}

export interface ToastState {
  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export type AppStore = AuthState & MatchmakingState & UIState & ToastState;

export interface GameplayState {
  ball: { x: number; y: number };
  paddles: { left: number; right: number };
  score: { left: number; right: number };
  updateGame: (data: Partial<GameplayState>) => void;
  resetGame: () => void;
}

export interface GameState {
  score: { p1: number; p2: number };
  status: 'idle' | 'playing' | 'paused' | 'finished';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderLogin?: string;
  senderAvatar?: string | null;
  text: string;
  timestampISO: string;
}

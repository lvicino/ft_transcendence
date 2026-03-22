export type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export type PresenceStatus = 'online' | 'ingame' | 'offline';

export type GameStatus = 'idle' | 'created' | 'lobby' | 'playing' | 'finished';
export type GameTheme = 'classic' | '42' | 'pokemon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

export interface AuthState {
  user: User | null;
  authStatus: 'checking' | 'authenticated' | 'guest';
  login: (user: User) => void;
  logout: () => void;
}

export interface GameFlowState {
  status: GameStatus;
  matchId: string | null;
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

export type AppStore = AuthState & GameFlowState & UIState & ToastState;

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

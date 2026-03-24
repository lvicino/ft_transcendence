export type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export type PresenceStatus = 'online' | 'ingame' | 'offline';

export type GameStatus = 'idle' | 'created' | 'lobby' | 'playing' | 'finished' | 'error';
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

export interface Player {
  x: number;
  y: number;
  speed: number;
  h: number;
  w: number;
  team: number; // 0 = left, 1 = right
  move: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
}

export interface GameFrame {
  gameWide: number;
  gameHeight: number;
  ball: Ball;
  players: Player[];
}

export interface GameplayState {
  frame: GameFrame | null;
  scoreLeft: number;
  scoreRight: number;
  updateGame: (frame: GameFrame) => void;
  resetGame: () => void;
  setscoreLeft: (scoreLeft: number) => void;
  setscoreRight: (scoreRight: number) => void;
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

export type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export type PresenceStatus = 'online' | 'ingame' | 'offline';

export type GameStatus = 'idle' | 'lobby' | 'playing' | 'finished';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

export interface AuthState {
  user: User | null;
  login: (payload: { user: User }) => void;
  logout: () => void;
}

export interface GameCreationInfo {
  gameId: number;
  gamePassword: string;
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

export interface BackendBall {
  x: number;
  y: number;
  radius: number;
}

export interface BackendPlayer {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  team: number;
  move: number;
}

export interface BackendGameState {
  gameWide: number;
  gameHeight: number;
  ball: BackendBall;
  players: BackendPlayer[];
}

export interface GameplayState {
  gameState: BackendGameState | null;
  score: { left: number; right: number };
  updateGameState: (data: BackendGameState) => void;
  incrementScore: (team: number) => void;
  resetGame: () => void;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderLogin?: string;
  senderAvatar?: string | null;
  text: string;
  timestampISO: string;
}

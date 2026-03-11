import type { BackendGameState } from '@/lib/types';

const DEFAULT_WS_BASE_URL = `wss://${window.location.host}/api/games/ws`;
const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL as string | undefined) ?? DEFAULT_WS_BASE_URL;

export type WsIncomingMessage =
  | { type: 'info'; message: string; player: string }
  | { type: 'error'; message: string }
  | { type: 'Game Stop'; reason: number }
  | BackendGameState; // game state frames have no "type" field

export type WsOutgoingInput = {
  type: 'input';
  moove: -1 | 0 | 1;
};

export type WsJoinMessage = {
  gameid: number;
  password: string;
};

function parseJsonSafe(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export type GameSocketCallbacks = {
  onInfo: (message: string, playerCount: string) => void;
  onGameState: (state: BackendGameState) => void;
  onGameStop: (reason: number) => void;
  onError: (message: string) => void;
  onOpen: () => void;
  onClose: () => void;
};

export type GameSocket = {
  join: (gameid: number, password: string) => void;
  sendInput: (moove: -1 | 0 | 1) => void;
  close: () => void;
  isOpen: () => boolean;
};

export function connectGameSocket(callbacks: GameSocketCallbacks): GameSocket {
  const ws = new WebSocket(WS_BASE_URL);

  ws.onopen = () => {
    callbacks.onOpen();
  };

  ws.onclose = () => {
    callbacks.onClose();
  };

  ws.onerror = () => {
    callbacks.onError('WebSocket connection error');
  };

  ws.onmessage = (event) => {
    const data = parseJsonSafe(event.data as string);
    if (data === null) return;

    const msg = data as Record<string, unknown>;

    // Check if it's a typed message (info, error, Game Stop)
    if (typeof msg.type === 'string') {
      if (msg.type === 'info') {
        callbacks.onInfo(
          String(msg.message ?? ''),
          String(msg.player ?? ''),
        );
        return;
      }
      if (msg.type === 'error') {
        callbacks.onError(String(msg.message ?? 'Unknown error'));
        return;
      }
      if (msg.type === 'Game Stop') {
        callbacks.onGameStop(Number(msg.reason ?? 0));
        return;
      }
    }

    // Otherwise it's a game state frame (has gameWide, gameHeight, ball, players)
    if ('gameWide' in msg && 'ball' in msg && 'players' in msg) {
      callbacks.onGameState(msg as unknown as BackendGameState);
    }
  };

  return {
    join: (gameid: number, password: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ gameid, password }));
      }
    },
    sendInput: (moove: -1 | 0 | 1) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', moove }));
      }
    },
    close: () => {
      ws.close(1000, 'client-close');
    },
    isOpen: () => ws.readyState === WebSocket.OPEN,
  };
}

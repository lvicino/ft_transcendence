import { z } from 'zod';

import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const DEFAULT_WS_BASE_URL = 'ws://localhost:3000/ws';
const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL as string | undefined) ?? DEFAULT_WS_BASE_URL;

const IdSchema = z.string().trim().min(1);
const LoginSchema = z.string().trim().min(1).max(64);

export const LobbyPlayerSchema = z.object({
  id: IdSchema,
  login: LoginSchema,
  avatar: z.string().url().nullable().optional(),
});

export const MatchScoreSchema = z.object({
  p1: z.number().int().nonnegative(),
  p2: z.number().int().nonnegative(),
});

export const GameFrameSchema = z.object({
  matchId: IdSchema,
  tick: z.number().int().nonnegative(),
  score: MatchScoreSchema,
  ball: z.object({
    x: z.number(),
    y: z.number(),
  }),
  paddles: z.object({
    leftY: z.number(),
    rightY: z.number(),
  }),
  status: z.enum(['idle', 'playing', 'paused', 'finished']),
});

export const WsServerEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('lobby.snapshot'),
    payload: z.object({
      matchId: IdSchema,
      players: z.array(LobbyPlayerSchema).min(1).max(2),
      readyPlayerIds: z.array(IdSchema),
    }),
  }),
  z.object({
    type: z.literal('lobby.player_ready'),
    payload: z.object({
      matchId: IdSchema,
      playerId: IdSchema,
    }),
  }),
  z.object({
    type: z.literal('match.started'),
    payload: z.object({
      matchId: IdSchema,
    }),
  }),
  z.object({
    type: z.literal('game.state'),
    payload: GameFrameSchema,
  }),
  z.object({
    type: z.literal('system.error'),
    payload: z.object({
      message: z.string().min(1),
      code: z.string().optional(),
    }),
  }),
]);

export const WsClientEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('lobby.ready'),
    payload: z.object({
      matchId: IdSchema,
    }),
  }),
  z.object({
    type: z.literal('lobby.leave'),
    payload: z.object({
      matchId: IdSchema,
    }),
  }),
  z.object({
    type: z.literal('game.input'),
    payload: z.object({
      matchId: IdSchema,
      up: z.boolean(),
      down: z.boolean(),
    }),
  }),
]);

export type LobbyPlayer = z.infer<typeof LobbyPlayerSchema>;
export type GameFrame = z.infer<typeof GameFrameSchema>;
export type WsServerEvent = z.infer<typeof WsServerEventSchema>;
export type WsClientEvent = z.infer<typeof WsClientEventSchema>;

type RealtimeConnectOptions = {
  matchId?: string;
  onEvent: (event: WsServerEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

type RealtimeClient = {
  close: () => void;
  send: (event: WsClientEvent) => boolean;
  isOpen: () => boolean;
};

function parseJsonSafe(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function buildWsUrl(matchId?: string): string {
  const { token } = useAuthStore.getState();
  const url = new URL(WS_BASE_URL);
  if (token) url.searchParams.set('token', token);
  if (matchId) url.searchParams.set('matchId', matchId);
  return url.toString();
}

export function connectRealtime(options: RealtimeConnectOptions): RealtimeClient {
  const { addToast } = useUIStore.getState();
  const ws = new WebSocket(buildWsUrl(options.matchId));

  ws.onopen = () => {
    options.onOpen?.();
  };

  ws.onclose = () => {
    options.onClose?.();
  };

  ws.onerror = () => {
    addToast({ message: 'Realtime channel is unstable', type: 'warning', title: 'WebSocket' });
  };

  ws.onmessage = (message) => {
    const payload = parseJsonSafe(message.data);
    if (payload === null) {
      addToast({ message: 'Received non-JSON WebSocket payload', type: 'warning', title: 'Protocol Mismatch' });
      return;
    }

    const parsedEvent = WsServerEventSchema.safeParse(payload);
    if (!parsedEvent.success) {
      addToast({ message: 'Received invalid WebSocket event payload', type: 'warning', title: 'Protocol Mismatch' });
      return;
    }

    if (parsedEvent.data.type === 'system.error') {
      addToast({ message: parsedEvent.data.payload.message, type: 'error', title: 'Realtime Error' });
      return;
    }

    options.onEvent(parsedEvent.data);
  };

  return {
    close: () => ws.close(1000, 'client-close'),
    isOpen: () => ws.readyState === WebSocket.OPEN,
    send: (event) => {
      const parsedEvent = WsClientEventSchema.safeParse(event);
      if (!parsedEvent.success) {
        addToast({ message: 'Attempted to send invalid WebSocket payload', type: 'warning', title: 'Protocol Mismatch' });
        return false;
      }

      if (ws.readyState !== WebSocket.OPEN) {
        addToast({ message: 'Realtime connection is not ready yet', type: 'info', title: 'WebSocket' });
        return false;
      }

      ws.send(JSON.stringify(parsedEvent.data));
      return true;
    },
  };
}

// src/pages/Game.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { useGameFlow, useGameStore } from '../store';
import { useToast } from '../store';
import GameCanvas from '../components/GameCanvas';
import { connectGameSocket } from '@/net';
import type { GameSocket } from '@/net';

export default function Game() {
  const navigate = useNavigate();
  const { status, gameId, gamePassword, finishMatch } = useGameFlow();
  const { updateGameState, score } = useGameStore();
  const { error: toastError } = useToast();
  const socketRef = useRef<GameSocket | null>(null);
  const keysRef = useRef<{ up: boolean; down: boolean }>({ up: false, down: false });

  // Guard: if not playing, redirect
  useEffect(() => {
    if (status === 'finished') {
      navigate('/game/finished', { replace: true });
      return;
    }
    if (status !== 'playing') {
      navigate('/dashboard', { replace: true });
    }
  }, [status, navigate]);

  // Connect WebSocket for gameplay
  useEffect(() => {
    if (status !== 'playing' || gameId === null || gamePassword === null) return;

    const socket = connectGameSocket({
      onOpen: () => {
        // Send join message (reconnect scenario)
        socket.join(gameId, gamePassword);
      },
      onInfo: () => {
        // Already joined info
      },
      onGameState: (state) => {
        updateGameState(state);
      },
      onGameStop: () => {
        toastError('Game ended — opponent disconnected');
        finishMatch();
      },
      onError: (message) => {
        toastError(message);
      },
      onClose: () => {
        socketRef.current = null;
      },
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [status, gameId, gamePassword]);

  // Keyboard input handling
  const computeMovement = useCallback((): -1 | 0 | 1 => {
    const { up, down } = keysRef.current;
    if (up && !down) return -1;
    if (down && !up) return 1;
    return 0;
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') keysRef.current.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') keysRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Send input at 30fps
    const inputInterval = setInterval(() => {
      if (socketRef.current?.isOpen()) {
        socketRef.current.sendInput(computeMovement());
      }
    }, 1000 / 30);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(inputInterval);
    };
  }, [status, computeMovement]);

  function handleForfeit() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    finishMatch();
  }

  if (status !== 'playing') return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 animate-fade-in">
      
      {/* Scoreboard */}
      <div className="flex w-full max-w-4xl items-center justify-between px-8 text-4xl font-bold font-goonies tracking-widest text-brand-white drop-shadow-md">
        <div className="text-primary">{score.left}</div>
        <div className="text-sm font-sans tracking-widest text-white/50">
          GAME: {gameId ?? 'UNKNOWN'}
        </div>
        <div className="text-primary">{score.right}</div>
      </div>

      {/* Game Arena */}
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_0_40px_rgba(91,178,184,0.15)] backdrop-blur-sm">
        <GameCanvas />
      </div>

      {/* Controls */}
      <Button
        type="button"
        variant="outline"
        className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        onClick={handleForfeit}
      >
        Forfeit Match
      </Button>
    </div>
  );
}

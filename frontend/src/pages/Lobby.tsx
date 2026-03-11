import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useGameFlow, useToast } from '../store';
import { connectGameSocket } from '@/net';
import type { GameSocket } from '@/net';

export default function Lobby() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const { status, gameId, gamePassword, playerCount, setPlayerCount, startMatch, reset } = useGameFlow();
  const [uiError, setUiError] = useState<string | null>(null);
  const socketRef = useRef<GameSocket | null>(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    // Guard: must be in lobby with valid game info
    if (status !== 'lobby' || gameId === null || gamePassword === null) {
      if (status === 'idle') {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    // Connect WebSocket
    const socket = connectGameSocket({
      onOpen: () => {
        // Send join message
        if (!hasJoinedRef.current) {
          socket.join(gameId, gamePassword);
          hasJoinedRef.current = true;
        }
      },
      onInfo: (message, count) => {
        setPlayerCount(count);
        toastSuccess(message);
        if (count === '2/2') {
          // Game is starting
          startMatch();
        }
      },
      onGameState: () => {
        // If we receive a game state while still in lobby, transition to playing
        if (status === 'lobby') {
          startMatch();
        }
      },
      onGameStop: () => {
        toastError('Game was stopped');
        reset();
        navigate('/dashboard', { replace: true });
      },
      onError: (message) => {
        setUiError(message);
        toastError(message);
      },
      onClose: () => {
        // If still in lobby, disconnect means game was cancelled
        if (socketRef.current) {
          socketRef.current = null;
        }
      },
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
      hasJoinedRef.current = false;
    };
  }, [status, gameId, gamePassword]);

  // Navigate on status change
  useEffect(() => {
    if (status === 'playing') {
      navigate('/game', { replace: true });
      return;
    }
    if (status === 'finished') {
      navigate('/game/finished', { replace: true });
    }
  }, [status, navigate]);

  function handleLeave() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    reset();
    navigate('/dashboard', { replace: true });
  }

  return (
    <FlowPageCard
      title="Lobby"
      status={status}
      error={uiError}
      isLoading={status === 'lobby'}
      loadingLabel="Waiting for opponent..."
      actions={
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleLeave}
        >
          Leave Lobby
        </Button>
      }
    >
      <div className="space-y-2">
        <div className="text-sm text-white/60">
          Game ID: <span className="text-white font-mono">{gameId ?? 'n/a'}</span>
        </div>
        <div className="text-sm text-white/60">
          Password: <span className="text-white font-mono text-xs">{gamePassword ?? 'n/a'}</span>
        </div>
        {playerCount && (
          <div className="text-sm text-white/60">
            Players: <span className="text-white">{playerCount}</span>
          </div>
        )}
      </div>
    </FlowPageCard>
  );
}

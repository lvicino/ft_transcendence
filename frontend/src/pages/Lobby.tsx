import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useGameFlow, useGameStore, useToast } from '../store';

export default function Lobby() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const {
    status, gameId, gamePassword, playerCount,
    setPlayerCount, startMatch, disconnectAndReset, connectAndJoin,
  } = useGameFlow();
  const { updateGameState } = useGameStore();
  const [uiError, setUiError] = useState<string | null>(null);

  // Guard: must be in lobby with valid game info
  useEffect(() => {
    if (status === 'idle') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (status === 'playing') {
      navigate('/game', { replace: true });
      return;
    }
    if (status === 'finished') {
      navigate('/game/finished', { replace: true });
      return;
    }
  }, [status, navigate]);

  // Connect WebSocket once when entering lobby
  useEffect(() => {
    if (status !== 'lobby' || gameId === null || gamePassword === null) return;

    connectAndJoin({
      onInfo: (message, count) => {
        setPlayerCount(count);
        toastSuccess(message);
        if (count === '2/2') {
          startMatch();
        }
      },
      onGameState: (state) => {
        // If receiving game frames while in lobby, start the match
        updateGameState(state);
        startMatch();
      },
      onGameStop: () => {
        toastError('Game was stopped');
        disconnectAndReset();
      },
      onError: (message) => {
        setUiError(message);
        toastError(message);
      },
    });

    // NO cleanup here — the socket lives in the store and must survive
    // the route transition from /lobby → /game
  }, [status, gameId, gamePassword]);

  function handleLeave() {
    disconnectAndReset();
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

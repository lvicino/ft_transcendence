import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useMatchmaking } from '../store';

export default function Lobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isQuickMode = searchParams.get('mode') === 'quick';
  const { status, matchId, queueTimer, beginMatchmaking, startMatch, cancelMatchmaking } = useMatchmaking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (isQuickMode && status === 'idle') {
      beginMatchmaking();
      return;
    }

    if (status === 'idle' && !isQuickMode) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (status === 'playing') {
      setIsSubmitting(false);
      navigate(matchId ? `/game/${encodeURIComponent(matchId)}` : '/game', { replace: true });
      return;
    }
    if (status === 'finished') {
      setIsSubmitting(false);
      navigate('/game/finished', { replace: true });
    }
  }, [status, matchId, isQuickMode, beginMatchmaking, navigate]);

  const canStart = status === 'lobby' && Boolean(matchId);
  const isSearching = status === 'searching';
  const showQueue = isSearching;
  const showLobbyActions = status === 'lobby';

  return (
    <FlowPageCard
      title="Lobby (Mock Flow)"
      status={status}
      error={uiError}
      isLoading={isSearching || isSubmitting}
      loadingLabel={isSearching ? 'Searching' : 'Submitting'}
      actions={
        <>
          {isSearching ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                cancelMatchmaking();
                navigate('/dashboard', { replace: true });
              }}
            >
              Cancel
            </Button>
          ) : null}

          {showLobbyActions ? (
            <>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  if (status !== 'lobby') {
                    const msg = 'Match can be started only in lobby';
                    setUiError(msg);
                    return;
                  }
                  setUiError(null);
                  setIsSubmitting(true);
                  startMatch();
                }}
                disabled={!canStart}
              >
                Start Match
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  cancelMatchmaking();
                  navigate('/dashboard', { replace: true });
                }}
              >
                Leave Lobby
              </Button>
            </>
          ) : null}
        </>
      }
    >
      {showQueue ? (
        <div className="text-sm text-white/60">
          Queue: <span className="text-white">{queueTimer}s</span>
        </div>
      ) : null}
      {status === 'lobby' ? (
        <div className="text-sm text-white/60">
          Match ID: <span className="text-white">{matchId ?? 'n/a'}</span>
        </div>
      ) : null}
    </FlowPageCard>
  );
}

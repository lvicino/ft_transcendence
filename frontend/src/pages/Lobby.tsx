import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useGameFlowStore } from '../store/gameStore';

export default function Lobby() {
  const navigate = useNavigate();

  const status = useGameFlowStore((s) => s.status);
  const matchId = useGameFlowStore((s) => s.matchId);
  const startMatch = useGameFlowStore((s) => s.startMatch);
  const leaveLobby = useGameFlowStore((s) => s.leaveLobby);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      navigate('/play', { replace: true });
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
  }, [status, matchId, navigate]);

  const canStart = status === 'lobby' && Boolean(matchId);

  return (
    <FlowPageCard
      title="Lobby"
      status={status}
      error={uiError}
      isLoading={isSubmitting}
      loadingLabel="Starting match..."
      actions={
        <>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
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
              leaveLobby();
              navigate('/play', { replace: true });
            }}
          >
            Leave Lobby
          </Button>
        </>
      }
    >
      <div className="text-sm text-white/60">
        Match ID: <span className="text-white">{matchId ?? 'n/a'}</span>
      </div>
    </FlowPageCard>
  );
}

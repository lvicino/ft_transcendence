import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
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
    if (status !== 'lobby') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]);

  const canStart = status === 'lobby' && Boolean(matchId);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">
      <h1 className="text-3xl font-bold text-white">Lobby</h1>

      <div className="text-sm text-white/60">
        Status: <span className="text-white">{status}</span>
      </div>

      <div className="text-sm text-white/60">
        Match ID: <span className="text-white">{matchId ?? 'n/a'}</span>
      </div>

      {isSubmitting ? <Loader size="sm" label="Starting match..." className="w-full justify-start gap-2" /> : null}

      {uiError ? <p className="text-sm text-red-300">{uiError}</p> : null}

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
    </div>
  );
}

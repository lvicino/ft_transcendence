import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useGameFlowStore } from '../store';

export default function GameFinished() {
  const navigate = useNavigate();
  const status = useGameFlowStore((s) => s.status);
  const matchId = useGameFlowStore((s) => s.matchId);
  const leaveLobby = useGameFlowStore((s) => s.leaveLobby);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (status === 'searching') {
      navigate('/game/join', { replace: true });
      return;
    }
    if (status === 'lobby') {
      navigate(matchId ? `/lobby/${encodeURIComponent(matchId)}` : '/lobby', { replace: true });
      return;
    }
    if (status === 'playing') {
      navigate(matchId ? `/game/${encodeURIComponent(matchId)}` : '/game', { replace: true });
      return;
    }
    if (status === 'finished') {
      navigate('/game/finished', { replace: true });
    }
  }, [status, matchId, navigate]);

  return (
    <FlowPageCard
      title="Finished (Mock Flow)"
      status={status}
      error={uiError}
      actions={
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            if (status !== 'finished') {
              const msg = 'Reset is available only in finished state';
              setUiError(msg);
              return;
            }
            setUiError(null);
            leaveLobby();
          }}
          disabled={status !== 'finished'}
        >
          Back to Play
        </Button>
      }
    />
  );
}

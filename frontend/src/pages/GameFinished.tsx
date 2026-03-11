import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useGameFlow, useGameStore } from '../store';

export default function GameFinished() {
  const navigate = useNavigate();
  const { status, gameId, reset } = useGameFlow();
  const { score, resetGame } = useGameStore();
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (status === 'lobby') {
      navigate('/lobby', { replace: true });
      return;
    }
    if (status === 'playing') {
      navigate('/game', { replace: true });
    }
  }, [status, navigate]);

  function handleBackToDashboard() {
    if (status !== 'finished') {
      const msg = 'Reset is available only in finished state';
      setUiError(msg);
      return;
    }
    setUiError(null);
    resetGame();
    reset();
  }

  return (
    <FlowPageCard
      title="Game Finished"
      status={status}
      error={uiError}
      actions={
        <Button
          type="button"
          className="w-full"
          onClick={handleBackToDashboard}
          disabled={status !== 'finished'}
        >
          Back to Dashboard
        </Button>
      }
    >
      <div className="space-y-2 text-center">
        <div className="text-sm text-white/60">
          Game ID: <span className="text-white font-mono">{gameId ?? 'n/a'}</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {score.left} — {score.right}
        </div>
      </div>
    </FlowPageCard>
  );
}

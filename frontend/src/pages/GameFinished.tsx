import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { useGameFlowStore } from '../store';

export default function GameFinished() {
  const navigate = useNavigate();

  const status = useGameFlowStore((s) => s.status);
  const leaveLobby = useGameFlowStore((s) => s.leaveLobby);

  useEffect(() => {
    if (status !== 'finished') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">
      <h1 className="text-3xl font-bold text-white">Match Finished</h1>

      <div className="text-sm text-white/60">
        Status: <span className="text-white">{status}</span>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={() => {
          leaveLobby();
          navigate('/play');
        }}
      >
        Back to Play
      </Button>
    </div>
  );
}

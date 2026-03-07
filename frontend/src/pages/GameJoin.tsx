import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useGameFlowStore, useToast } from '../store';

export default function GameJoin() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const status = useGameFlowStore((s) => s.status);
  const enterLobby = useGameFlowStore((s) => s.enterLobby);

  const [matchId, setMatchId] = useState('');

  useEffect(() => {
    if (status !== 'idle') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">

      <h1 className="text-3xl font-bold text-white">
        Join Game
      </h1>

      <Input
        placeholder="Enter Match ID"
        value={matchId}
        onChange={(e) => setMatchId(e.target.value)}
      />

      <Button
        className="w-full"
        onClick={() => {
          if (!matchId.trim()) {
            toastError('Match ID required');
            return;
          }

          const id = matchId.trim();

          enterLobby(id);
          navigate(`/lobby/${encodeURIComponent(id)}`);
        }}
      >
        Join Lobby
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => navigate('/play')}
      >
        Back
      </Button>

    </div>
  );
}

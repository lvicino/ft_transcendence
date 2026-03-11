import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useGameFlow, useToast } from '../store';
import { apiFetch } from '@/net';

const CreateGameResponseSchema = z.object({
  id: z.number(),
  password: z.string(),
});

const DEFAULT_GAME_PARAMS = {
  gw: 800,
  gh: 400,
  ballRadius: 8,
  ballSpeed: 5,
  playerW: 10,
  playerH: 80,
  playerSpeed: 5,
  playerNumber: 2,
};

export default function GameCreate() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const { status, gameId, setGameCreated } = useGameFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'lobby' && gameId !== null) {
      setIsSubmitting(false);
      navigate('/lobby', { replace: true });
      return;
    }
    if (status === 'playing') {
      setIsSubmitting(false);
      navigate('/game', { replace: true });
      return;
    }
    if (status === 'finished') {
      setIsSubmitting(false);
      navigate('/game/finished', { replace: true });
    }
  }, [status, gameId, navigate]);

  async function handleCreate() {
    if (status !== 'idle') {
      const msg = 'Lobby can be created only from idle state';
      setUiError(msg);
      toastError(msg);
      return;
    }
    setUiError(null);
    setIsSubmitting(true);

    const result = await apiFetch('/games/', CreateGameResponseSchema, {
      method: 'POST',
      body: JSON.stringify({ gameParameter: DEFAULT_GAME_PARAMS }),
    });

    if (result) {
      setGameCreated({ gameId: result.id, gamePassword: result.password });
    } else {
      setIsSubmitting(false);
    }
  }

  return (
    <FlowPageCard
      title="Create Game"
      status={status}
      error={uiError}
      isLoading={isSubmitting}
      loadingLabel="Creating game..."
      actions={
        <>
          <Button
            type="button"
            className="w-full"
            onClick={handleCreate}
            disabled={status !== 'idle' || isSubmitting}
          >
            Create Lobby
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        </>
      }
    />
  );
}

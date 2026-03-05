import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useMatchmaking, useToast } from '../store';

const mockId = () => `match_${Math.random().toString(36).slice(2, 8)}`;

export default function GameCreate() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const { status, matchId, setMatchFound } = useMatchmaking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'lobby') {
      setIsSubmitting(false);
      navigate(matchId ? `/lobby/${encodeURIComponent(matchId)}` : '/lobby', { replace: true });
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

  return (
    <FlowPageCard
      title="Create (Mock Flow)"
      status={status}
      error={uiError}
      isLoading={isSubmitting}
      loadingLabel="Submitting"
      actions={
        <>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              if (status !== 'idle') {
                const msg = 'Lobby can be created only from idle state';
                setUiError(msg);
                toastError('Error (mock)');
                return;
              }
              setUiError(null);
              setIsSubmitting(true);
              setMatchFound(mockId());
            }}
            disabled={status !== 'idle'}
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { useGameFlowStore, useToast } from '../store';

const mockId = () => `match_${Math.random().toString(36).slice(2, 8)}`;

export default function GameCreate() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const status = useGameFlowStore((s) => s.status);
  const setMatchFound = useGameFlowStore((s) => s.setMatchFound);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'idle') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">
      <h1 className="text-3xl font-bold text-white">Create (Mock Flow)</h1>

      <div className="text-sm text-white/60">
        Status: <span className="text-white">{status}</span>
      </div>

      {isSubmitting ? <Loader size="sm" label="Submitting" className="w-full justify-start gap-2" /> : null}

      {uiError ? <p className="text-sm text-red-300">{uiError}</p> : null}

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
    </div>
  );
}

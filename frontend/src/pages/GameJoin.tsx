import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { useMatchmaking, useToast } from '../store';

export default function GameJoin() {
  const navigate = useNavigate();
  const { error: toastError, success } = useToast();
  const { status, matchId, queueTimer, beginMatchmaking, cancelMatchmaking } = useMatchmaking();
  const [uiError, setUiError] = useState<string | null>(null);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current === 'searching' && status === 'lobby') {
      success('Match found');
    }
    if (status === 'idle') {
      navigate('/dashboard', { replace: true });
      prevStatusRef.current = status;
      return;
    }
    if (status === 'searching') {
      prevStatusRef.current = status;
      return;
    }
    if (status === 'lobby') {
      navigate(matchId ? `/lobby/${encodeURIComponent(matchId)}` : '/lobby', { replace: true });
      prevStatusRef.current = status;
      return;
    }
    if (status === 'playing') {
      navigate(matchId ? `/game/${encodeURIComponent(matchId)}` : '/game', { replace: true });
      prevStatusRef.current = status;
      return;
    }
    if (status === 'finished') {
      navigate('/game/finished', { replace: true });
    }
    prevStatusRef.current = status;
  }, [status, matchId, navigate, success]);

  return (
    <FlowPageCard
      title="Join / Search (Mock Flow)"
      status={status}
      error={uiError}
      isLoading={status === 'searching'}
      loadingLabel="Searching"
      actions={
        <>
          {status === 'searching' ? (
            <Button type="button" variant="outline" className="w-full" onClick={cancelMatchmaking}>
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                if (status !== 'idle') {
                  const msg = 'Search can be started only from idle state';
                  setUiError(msg);
                  toastError('Error (mock)');
                  return;
                }
                setUiError(null);
                beginMatchmaking();
              }}
              disabled={status !== 'idle'}
            >
              Start Search
            </Button>
          )}
          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        </>
      }
    >
      <div className="text-sm text-white/60">
        Queue: <span className="text-white">{queueTimer}s</span>
      </div>
    </FlowPageCard>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FlowPageCard from '../components/FlowPageCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useGameFlow, useToast } from '../store';

export default function GameJoin() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const { status, setGameJoinInfo } = useGameFlow();
  const [gameIdInput, setGameIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [uiError, setUiError] = useState<string | null>(null);

  function handleJoin() {
    if (status !== 'idle') {
      const msg = 'Can only join from idle state';
      setUiError(msg);
      toastError(msg);
      return;
    }

    const id = Number(gameIdInput.trim());
    const pwd = passwordInput.trim();

    if (isNaN(id) || id <= 0) {
      setUiError('Please enter a valid game ID');
      return;
    }
    if (!pwd) {
      setUiError('Please enter the game password');
      return;
    }

    setUiError(null);
    setGameJoinInfo(id, pwd);
    navigate('/lobby', { replace: true });
  }

  return (
    <FlowPageCard
      title="Join Game"
      status={status}
      error={uiError}
      actions={
        <>
          <Button
            type="button"
            className="w-full"
            onClick={handleJoin}
            disabled={status !== 'idle'}
          >
            Join Game
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-white/50">Game ID</label>
          <Input
            placeholder="Enter game ID"
            value={gameIdInput}
            onChange={(e) => setGameIdInput(e.target.value)}
            className="font-mono bg-black/50 border-white/10 focus:border-white/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-white/50">Password</label>
          <Input
            placeholder="Enter game password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="font-mono bg-black/50 border-white/10 focus:border-white/30"
          />
        </div>
      </div>
    </FlowPageCard>
  );
}

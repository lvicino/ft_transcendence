// src/pages/Game.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { useGameFlowStore, useGameStore } from '../store';
import GameCanvas from '../components/GameCanvas';

export default function Game() {
  const navigate = useNavigate();
  const { matchId: routeMatchId } = useParams();
  const { t } = useTranslation();

  const matchId = useGameFlowStore((s) => s.matchId);
  const finishMatch = useGameFlowStore((s) => s.finishMatch);

  const score = useGameStore((state) => state.score);

/*  --uncomment when backend is ready-- useEffect(() => {
    if (status !== 'playing') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]); 

  if (status !== 'playing') return null; */

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 animate-fade-in">
      
      {/* Scoreboard */}
      <div className="flex w-full max-w-4xl items-center justify-between px-8 text-4xl font-bold font-goonies tracking-widest text-brand-white drop-shadow-md">
        <div className="text-primary">{score.left}</div>

        <div className="text-sm font-sans tracking-widest text-white/50">
          {t("gameMatchLabel")}: {matchId || routeMatchId || t("unknown")}
        </div>

        <div className="text-primary">{score.right}</div>
      </div>

      {/* Game Area */}
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_0_40px_rgba(91,178,184,0.15)] backdrop-blur-sm">
        <GameCanvas />
      </div>

      {/* Controls */}
      <Button
        type="button"
        variant="outline"
        className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        onClick={() => {
          finishMatch();
          navigate('/game/finished');
        }}
      >
        {t("forfeitMatch")}
      </Button>
    </div>
  );
}

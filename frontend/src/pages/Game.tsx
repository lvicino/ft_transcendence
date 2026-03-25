// src/pages/Game.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { useGameFlowStore, useGameStore } from '../store';
import GameCanvas from '../components/GameCanvas';

export default function Game() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const matchId = useGameFlowStore((s) => s.matchId);
  const finishMatch = useGameFlowStore((s) => s.finishMatch);
  const status = useGameFlowStore((s) => s.status);
  const scoreLeft = useGameStore((s) => s.scoreLeft);
  const scoreRight = useGameStore((s) => s.scoreRight);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 animate-fade-in">
      
      {/* Scoreboard – TODO: add score when backend supports it */}
      <div className="flex w-full max-w-4xl items-center justify-between px-8 text-4xl font-bold font-goonies tracking-widest text-brand-white drop-shadow-md">
        <div className="text-primary">{scoreLeft}</div>

        <div className="text-sm font-sans tracking-widest text-white/50">
          {t("gameMatchLabel")}: {matchId || t("unknown")}
        </div>

        <div className="text-primary">{scoreRight}</div>
      </div>

      {/* Game Area */}
      <div className={`relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_0_40px_rgba(91,178,184,0.15)] backdrop-blur-sm ${status !== 'playing' ? 'block' : 'block'}`}>
        <GameCanvas />
      </div>

      {/* Controls */}
      {status !== 'finished' ?
      <Button
        type="button"
        variant="outline"
        className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        onClick={() => {
          finishMatch();
          navigate('/play '); // a changer
        }}
      >
        {t("forfeitMatch")}
      </Button>
      : null}

      {status === 'finished' ? <p>{scoreLeft >=3 ? "winer" : "loser"} | {scoreRight >=3 ? "winer" : "loser"}</p> : null}
    </div>
  );
}

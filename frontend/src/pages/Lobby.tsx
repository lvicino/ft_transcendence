// src/pages/Lobby.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { useGameFlowStore } from '../store/gameStore';

export default function Lobby() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const status = useGameFlowStore((s) => s.status);
  const matchId = useGameFlowStore((s) => s.matchId);
  const startMatch = useGameFlowStore((s) => s.startMatch);
  const leaveLobby = useGameFlowStore((s) => s.leaveLobby);

  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'lobby') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]);

  const canStart = status === 'lobby' && Boolean(matchId);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">
      <h1 className="text-3xl font-bold text-white">{t("lobbyTitle")}</h1>

      <div className="text-sm text-white/60">
        {t("status")}: <span className="text-white">{status}</span>
      </div>

      <div className="text-sm text-white/60">
        {t("matchId")}: <span className="text-white">{matchId ?? t("na")}</span>
      </div>

      {uiError ? <p className="text-sm text-red-300">{uiError}</p> : null}

      <Button
        type="button"
        className="w-full"
        onClick={() => {
          setUiError(null);
          startMatch();
          navigate(`/game/${matchId}`);
        }}
        disabled={!canStart}
      >
        {t("startMatch")}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          leaveLobby();
          navigate('/play', { replace: true });
        }}
      >
        {t("leaveLobby")}
      </Button>
    </div>
  );
}

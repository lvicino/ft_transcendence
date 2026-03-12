// src/pages/Lobby.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { useGameFlowStore } from '../store/gameStore';

export default function Lobby() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const matchId = useGameFlowStore((s) => s.matchId);
  const startMatch = useGameFlowStore((s) => s.startMatch);
  const leaveLobby = useGameFlowStore((s) => s.leaveLobby);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">

      <h1 className="text-3xl font-bold text-white">{t("lobbyTitle")}</h1>

      <div className="text-sm text-white/60">
        Match ID: <span className="text-white">{matchId}</span>
      </div>

      <Button
        className="w-full"
        onClick={() => {
          startMatch();
          navigate(`/game/${matchId}`);
        }}
      >
        {t("startMatch")}
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          leaveLobby();
          navigate('/play');
        }}
      >
        {t("leaveLobby")}
      </Button>

    </div>
  );
}

// src/pages/Lobby.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { useGameFlowStore } from '../store/gameStore';

import { Input } from "@/components/ui/Input";

export default function Lobby() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const matchId = useGameFlowStore((s) => s.matchId);
  const password = useGameFlowStore((s) => s.password);
  const startMatch = useGameFlowStore((s) => s.startMatch);
  const leaveLobby = useGameFlowStore((s) => s.leaveLobby);
  const setpassword = useGameFlowStore((s) => s.setpassword);
  const setmatchId = useGameFlowStore((s) => s.setmatchId);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">

      <h1 className="text-3xl font-bold text-white">{t("lobbyTitle")}</h1>

			<Input
				placeholder={"Match ID"}
				name="matchID"
				value={matchId ?? ""}
				onChange={(e) => !Number.isNaN(Number(e.target.value)) ? setmatchId(Number(e.target.value)) : null}
				className="font-mono text-center bg-black/50 border-white/10 focus:border-white/30"
			/>

			<Input
				placeholder={"Match password"}
				name="password"
				value={password ?? ""}
				onChange={(e) => setpassword(e.target.value)}
				className="font-mono text-center bg-black/50 border-white/10 focus:border-white/30"
			/>

      <Button
        className="w-full"
        onClick={() => {
          startMatch();
          navigate(`/game`);
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

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useGameFlowStore } from "../store/gameStore";
import type { GameTheme } from "../lib/types";



import { api } from "@/net/api";

const THEMES = [
  { id: "classic", labelKey: "gameThemeClassic" },
  { id: "42", labelKey: "gameTheme42" },
  { id: "pokemon", labelKey: "gameThemePokemon" },
] as const;

export default function GameCreate() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    status,
    matchId,
    password,
    theme,
    ballSpeed,
    paddleSpeed,
    maxScore,

    setStatus,
    setTheme,
    setBallSpeed,
    setPaddleSpeed,
    setMaxScore: _setMaxScore,
    setmatchId,
    setpassword,
  } = useGameFlowStore();

  const createGame = () => {
	  console.log({theme, ballSpeed, paddleSpeed, maxScore});

    api.gameApi.create({
      gameParameter: {
        gw: 500,
        gh: 100, 
        ballRadius: 4,
        ballSpeed: ballSpeed, 
        playerW: 5, 
        playerH: 20, 
        playerSpeed: paddleSpeed, 
        playerNumber: 2
      }
    }).then((data) => {
      console.log(data);
      setmatchId(data.id);
      setpassword(data.password);
      setStatus('created');
    });

    //navigate("/lobby");
  };



  return (
    <div className="max-w-xl mx-auto">
  
       <Card>
        <CardHeader>
          <CardTitle>{t("createGame")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Theme */}
          <div className="space-y-2">
            <p className="text-sm opacity-70">{t("gameTheme")}</p>

            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as GameTheme)}
                  className={`overflow-hidden rounded-lg border ${
                    theme === item.id ? "border-white" : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <div
                    data-theme={item.id}
                    className="relative h-20 bg-game-bg"
                  >
                    <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-game-lines" />
                    <div className="absolute left-2 top-1/2 h-8 w-[4px] -translate-y-1/2 bg-game-accent" />
                    <div className="absolute right-2 top-1/2 h-8 w-[4px] -translate-y-1/2 bg-game-accent" />
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-game-accent" />
                  </div>

                  <div className="py-1 text-xs">{t(item.labelKey)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-70">{t("gameBallSpeed")}</p>
              <span className="text-sm text-white/70">{ballSpeed}</span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={ballSpeed}
              onChange={(event) => setBallSpeed(Number(event.target.value))}
              className="w-full accent-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-70">{t("gamePaddleSpeed")}</p>
              <span className="text-sm text-white/70">{paddleSpeed}</span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={paddleSpeed}
              onChange={(event) => setPaddleSpeed(Number(event.target.value))}
              className="w-full accent-white"
            />
          </div>

          <Button className="w-full mt-4" onClick={createGame}>
            {t("createLobby")}
          </Button>

          {status === 'created' ? (
            <>
              <div className="space-y-2">
                id: {matchId}
              </div>
              <div className="space-y-2">
                password: {password}
              </div>
              
            <Button
              className="w-full"
              onClick={() => {
                // startMatch(); // pour quoi fair ?
                navigate(`/game`);
              }}
            >
              {t("startMatch")}
            </Button>
            </>
          ) : null}

        </CardContent>
      </Card>
    </div>
  );
}

// src/pages/GameCreate.tsx
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useGameFlowStore } from "../store/gameStore";

const THEMES = [
  { id: "classic", name: "Classic", bg: "bg-black" },
  { id: "42", name: "42", bg: "bg-slate-900" },
  { id: "pokemon", name: "Pokemon", bg: "bg-blue-900" },
] as const;

export default function GameCreate() {
  const navigate = useNavigate();

  const {
    theme,
    powerUps,
    maxScore,
    setTheme,
    togglePowerUps,
    setMaxScore,
  } = useGameFlowStore();

  const createGame = () => {
    navigate("/lobby");
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Game</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Theme */}
          <div className="space-y-2">
            <p className="text-sm opacity-70">Theme</p>

            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`overflow-hidden rounded-lg border ${
                    theme === item.id ? "border-white" : "border-white/20"
                  }`}
                >
                  <div className={`relative h-20 ${item.bg}`}>
                    <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/40" />
                    <div className="absolute left-2 top-1/2 h-8 w-[4px] -translate-y-1/2 bg-white" />
                    <div className="absolute right-2 top-1/2 h-8 w-[4px] -translate-y-1/2 bg-white" />
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                  </div>

                  <div className="py-1 text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Power ups */}
          <div className="flex items-center justify-between">
            <span>Power-ups</span>

            <Button
              variant={powerUps ? "default" : "outline"}
              onClick={togglePowerUps}
            >
              {powerUps ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Max score */}
          <div className="space-y-2">
            <p className="text-sm opacity-70">Max score</p>

            <select
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="border border-white/10 bg-black/40 rounded px-3 py-2"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          <Button className="w-full" onClick={createGame}>
            Create Lobby
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}

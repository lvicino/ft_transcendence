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
    ballSpeed,
    paddleSpeed,
    maxScore,
    setTheme,
    setBallSpeed,
    setPaddleSpeed,
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

          {/* Theme - ТВОЙ ОРИГИНАЛЬНЫЙ ДИЗАЙН */}
          <div className="space-y-2">
            <p className="text-sm opacity-70">Theme</p>

            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`overflow-hidden rounded-lg border ${
                    theme === item.id ? "border-white" : "border-white/20 hover:border-white/40"
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-70">Ball speed</p>
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
              <p className="text-sm opacity-70">Paddle speed</p>
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

          <div className="space-y-2">
            <p className="text-sm opacity-70">Max score</p>

            <div className="flex gap-2">
              {[3, 5, 10].map((score) => (
                <Button
                  key={score}
                  variant={maxScore === score ? "default" : "outline"}
                  onClick={() => setMaxScore(score)}
                  className="flex-1"
                >
                  {score}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4" onClick={createGame}>
            Create Lobby
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}

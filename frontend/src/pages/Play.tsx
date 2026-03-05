import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Play() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
          Play
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Create Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate("/game/create")}
            >
              Create
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Join Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate("/game/join")}
            >
              Join
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
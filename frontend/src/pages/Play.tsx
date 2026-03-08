import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Play() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
          {t("play")}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {t("createGame")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate("/game/create")}
            >
              {t("create")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {t("joinGame")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate("/game/join")}
            >
              {t("join")}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

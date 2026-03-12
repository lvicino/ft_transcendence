import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Globe } from "lucide-react";
import { Card } from "../components/ui/Card";
import { cn } from "../lib/utils";

export default function Play() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 py-8">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
          {t("play")}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Карточка создания игры */}
        <Card
          onClick={() => navigate("/game/create")}
          className={cn(
            "group flex min-h-[300px] cursor-pointer flex-col items-center justify-center p-8 transition-all duration-300",
            "border-2 border-white/20 bg-transparent text-white",
            "hover:-translate-y-1 hover:border-white hover:bg-white/5 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
          )}
        >
          <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
            <Plus className="h-16 w-16" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {t("createGame")}
          </h2>
        </Card>

        {/* Карточка присоединения к игре */}
        <Card
          onClick={() => navigate("/game/join")}
          className={cn(
            "group flex min-h-[300px] cursor-pointer flex-col items-center justify-center p-8 transition-all duration-300",
            "border-2 border-white/20 bg-transparent text-white",
            "hover:-translate-y-1 hover:border-white hover:bg-white/5 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
          )}
        >
          <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
            <Globe className="h-16 w-16" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {t("joinGame")}
          </h2>
        </Card>
      </div>
    </div>
  );
}
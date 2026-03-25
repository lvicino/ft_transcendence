import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "ru", label: "RU" },
  ] as const;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2 py-1">
      <Globe size={14} className="text-white/70" aria-hidden="true" />

      {languages.map((language) => {
        const isActive = i18n.language === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => i18n.changeLanguage(language.code)}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
              isActive
                // Активный язык: белый фон, черный текст (строгий B&W)
                ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                // Неактивный язык: тот самый hover, как у карточек (чуть-чуть фона и легкое свечение)
                : "text-white/70 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            )}
            aria-pressed={isActive}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { useGameFlowStore, useToast } from '../store';

const mockId = () => `match_${Math.random().toString(36).slice(2, 8)}`;

export default function GameCreate() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { error: toastError } = useToast();
  const status = useGameFlowStore((s) => s.status);
  const enterLobby = useGameFlowStore((s) => s.enterLobby);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'idle') {
      navigate('/play', { replace: true });
    }
  }, [status, navigate]);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">
      <h1 className="text-3xl font-bold text-white">{t("gameCreateTitle")}</h1>

      <div className="text-sm text-white/60">
        {t("status")}: <span className="text-white">{status}</span>
      </div>

      {uiError ? <p className="text-sm text-red-300">{uiError}</p> : null}

      <Button
        type="button"
        className="w-full"
        onClick={() => {
          if (status !== 'idle') {
            const msg = t("lobbyCreateOnlyIdle");
            setUiError(msg);
            toastError(t("errorMock"));
            return;
          }
          setUiError(null);
          const id = mockId();
          enterLobby(id);
          navigate(`/lobby/${encodeURIComponent(id)}`);
        }}
        disabled={status !== 'idle'}
      >
        {t("createLobby")}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
        {t("back")}
      </Button>
    </div>
  );
}

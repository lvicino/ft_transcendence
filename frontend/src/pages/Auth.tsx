// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Terminal } from "lucide-react";
import { apiFetch } from "@/net/http";
import { useAuthStore, useToast } from "@/store";

type LoginValues = {
  email: string;
  password: string;
};
type RegisterValues = {
  username: string;
  email: string;
  password: string;
};
type FieldErrors = Partial<Record<"username" | "email" | "password", string>>;

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? "";
function oAuth42Url(): string {
  const base = apiBase ? apiBase.replace(/\/+$/, "") : "";
  return base ? `${base}/auth/login/oauth` : "/api/auth/login/oauth";
}

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { error: toastError, success: toastSuccess } = useToast();

  const [loginValues, setLoginValues] = useState<LoginValues>({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState<RegisterValues>({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  const values = isLogin ? loginValues : registerValues;

  // Backend auth errors currently expose only localized message strings, so the UI maps them here.
  function getAuthErrorMessage(message: string) {
    if (message === "Identifiants invalides") return t("authErrorInvalidCredentials");
    if (message === "Cet email est déjà enregistré.") return t("authErrorEmailTaken");
    if (message === "Cet username est déjà utilisé.") return t("authErrorUsernameTaken");
    return t("authErrorGeneric");
  }

  async function syncSession() {
    const data = await apiFetch("/auth/session");
    const session = data as { user: { id: string; username: string; email: string } };
    login(session.user);
    return session.user;
  }

  function setField<K extends keyof (LoginValues & RegisterValues)>(key: K, value: string) {
    setErrors((p) => ({ ...p, [key as keyof FieldErrors]: undefined }));

    if (isLogin) {
      if (key === "email" || key === "password") {
        setLoginValues((v) => ({ ...v, [key]: value }));
      }
      return;
    }

    setRegisterValues((v) => ({ ...v, [key]: value }));
  }

  function validateCurrent(): boolean {
    setErrors({});
    const email = values.email.trim();
    const password = values.password;

    if (!isLogin) {
      const username = registerValues.username.trim();
      if (username.length < 2) {
        setErrors((p) => ({ ...p, username: t("validationMin2") }));
        return false;
      }
      if (username.length > 24) {
        setErrors((p) => ({ ...p, username: t("validationMax24") }));
        return false;
      }
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setErrors((p) => ({ ...p, email: t("validationInvalidEmail") }));
      return false;
    }

    if (password.length < 6) {
      setErrors((p) => ({ ...p, password: t("validationMin6") }));
      return false;
    }

    return true;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateCurrent()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: loginValues.email.trim(),
            password: loginValues.password,
          }),
        });
      } else {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: registerValues.username.trim(),
            email: registerValues.email.trim(),
            password: registerValues.password,
          }),
        });

        await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: registerValues.email.trim(),
            password: registerValues.password,
          }),
        });
      }

      await syncSession();
      if (!isLogin) {
        toastSuccess(t("authRegisterSuccess"));
      }
      navigate("/play", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      toastError(getAuthErrorMessage(message));
    } finally {
      setIsLoading(false);
    }
  };

  function toggleMode() {
    if (isLoading) return;
    setErrors({});
    setIsLogin((v) => !v);
  }

  function loginWith42() {
    if (isLoading) return;
    window.location.href = oAuth42Url();
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in border-white/10 bg-black/70 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Terminal className="text-white/80 w-6 h-6" />
              </div>
            </div>

            <CardTitle className="text-3xl text-white">
              {isLogin ? t("authSystemAccess") : t("authNewRegistration")}
            </CardTitle>

            <p className="text-xs text-white/40 font-mono uppercase tracking-[0.2em] mt-2">
              {t("authSecureConnection")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin ? (
                <div className="space-y-2">
                  <Input
                    placeholder={t("authCodenamePlaceholder")}
                    name="username"
                    value={registerValues.username}
                    onChange={(e) => setField("username", e.target.value)}
                    disabled={isLoading}
                    className="font-mono text-center bg-black/50 border-white/10 focus:border-white/30"
                    aria-invalid={Boolean(errors.username)}
                  />
                  {errors.username ? (
                    <div className="text-xs font-mono text-red-300 text-center">{errors.username}</div>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t("authEmailPlaceholder")}
                  name="email"
                  value={values.email}
                  onChange={(e) => setField("email", e.target.value)}
                  disabled={isLoading}
                  className="font-mono text-center bg-black/50 border-white/10 focus:border-white/30"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <div className="text-xs font-mono text-red-300 text-center">{errors.email}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t("authPasswordPlaceholder")}
                  name="password"
                  value={values.password}
                  onChange={(e) => setField("password", e.target.value)}
                  disabled={isLoading}
                  className="font-mono text-center bg-black/50 border-white/10 focus:border-white/30"
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password ? (
                  <div className="text-xs font-mono text-red-300 text-center">{errors.password}</div>
                ) : null}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full font-goonies text-lg tracking-widest"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? t("authProcessing") : isLogin ? t("authEstablishLink") : t("authCreateIdentity")}
                </Button>
              </div>

            </form>

            <div className="mt-7 flex items-center justify-between text-xs font-mono uppercase text-white/40">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-0 underline underline-offset-4"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {isLogin ? t("authNeedAccessRegister") : t("authHaveAccessLogin")}
              </Button>
            </div>

            {/* ✅ SSO внизу как “Continue with …” */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/35 font-mono">
                  {t("authOrContinueWith")}
                </div>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Button
                type="button"
                className="w-full font-mono tracking-widest"
                variant="secondary"
                onClick={loginWith42}
                disabled={isLoading}
              >
                {t("authLoginWith42Upper")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "@/store";
import { startAuthFlowMock } from "@/net";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Terminal } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(2, "Min 2 characters").max(24, "Max 24 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<"username" | "email" | "password", string>>;

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? "";
function oAuth42Url(): string {
  const base = apiBase ? apiBase.replace(/\/+$/, "") : "";
  return base ? `${base}/auth/42` : "/api/auth/42";
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [loginValues, setLoginValues] = useState<LoginValues>({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState<RegisterValues>({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const values = isLogin ? loginValues : registerValues;

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
    const parsed = isLogin
      ? loginSchema.safeParse(loginValues)
      : registerSchema.safeParse(registerValues);

    if (parsed.success) return true;

    const first = parsed.error.issues[0];
    const field = first?.path?.[0];
    const msg = first?.message ?? "Invalid input";

    if (field === "username" || field === "email" || field === "password") {
      setErrors((p) => ({ ...p, [field]: msg }));
    }
    return false;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateCurrent()) return;

    setIsLoading(true);
    setStatusMsg("Initializing uplink...");

    startAuthFlowMock({
      onStatus: (msg: string) => setStatusMsg(msg),
      onSuccess: (user, token) => {
        login({ user, token });
        navigate("/dashboard", { replace: true });
      },
    });
  };

  function toggleMode() {
    if (isLoading) return;
    setErrors({});
    setStatusMsg("");
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
              {isLogin ? "SYSTEM ACCESS" : "NEW REGISTRATION"}
            </CardTitle>

            <p className="text-xs text-white/40 font-mono uppercase tracking-[0.2em] mt-2">
              Secure Connection v19.0
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin ? (
                <div className="space-y-2">
                  <Input
                    placeholder="CODENAME (USERNAME)"
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
                  placeholder="EMAIL ADDRESS"
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
                  placeholder="ACCESS KEY (PASSWORD)"
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
                  {isLoading ? "PROCESSING..." : isLogin ? "ESTABLISH LINK" : "CREATE IDENTITY"}
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center font-mono text-xs text-white/60 animate-pulse">
                  {">"} {statusMsg}
                </div>
              ) : null}
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
                {isLogin ? "Need Access? Register" : "Have Access? Login"}
              </Button>
            </div>

            {/* ✅ SSO внизу как “Continue with …” */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/35 font-mono">
                  or continue with
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
                LOGIN WITH 42
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

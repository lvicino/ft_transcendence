import { apiFetch, apiUrl } from "./http";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface SessionResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthApi {
  login(payload: LoginPayload): Promise<void>;
  register(payload: RegisterPayload): Promise<void>;
  getSession(): Promise<SessionResponse>;
  logout(): Promise<void>;
  getOAuthLoginUrl(): string;
}

export function createAuthApi(): AuthApi {
  return {
    async login(payload) {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    async register(payload) {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    async getSession() {
      return (await apiFetch("/auth/session")) as SessionResponse;
    },

    async logout() {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    },

    getOAuthLoginUrl() {
      return apiUrl("/auth/login/oauth");
    },
  };
}

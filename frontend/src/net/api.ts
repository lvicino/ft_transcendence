import { createAuthApi, type AuthApi } from "./authApi";
import { createGameApi, type GameApi } from "./gameApi";
import i18n from "../i18n";

export interface ApiFacade {
  authApi: AuthApi;
  gameApi: GameApi;
}

export const api: ApiFacade = {
  authApi: createAuthApi(),
  gameApi: createGameApi(),
};

export function getErrorMessage(error: string): string {
  switch (error) {
    case "INVALID_CREDENTIALS":       return i18n.t("authErrorInvalidCredentials");
    case "EMAIL_ALREADY_REGISTERED":  return i18n.t("authErrorEmailTaken");
    case "USERNAME_ALREADY_TAKEN":    return i18n.t("authErrorUsernameTaken");
    case "USERNAME_REQUIRED":         return i18n.t("errUsernameRequired");
    case "USERNAME_LENGTH_INVALID":   return i18n.t("errUsernameLengthInvalid");
    case "NO_ACTIVE_SESSION":         return i18n.t("errNoActiveSession");
    case "INVALID_SESSION":           return i18n.t("errInvalidSession");
    case "USER_NOT_FOUND":            return i18n.t("errUserNotFound");
    case "API_ERROR":                 return i18n.t("errApiError");
    default:                          return i18n.t("authErrorGeneric");
  }
}

export function getWsMessage(code: string): string {
  switch (code) {
    case "GAME_JOIN_SUCCESS": return i18n.t("wsGameJoinSuccess");
    case "GAME_JOIN_FAILED":  return i18n.t("wsGameJoinFailed");
    case "WS_AUTH_TIMEOUT":   return i18n.t("wsAuthTimeout");
    default:                  return code;
  }
}

export default api;

import { createAuthApi, type AuthApi } from "./authApi";
import { createGameApi, type GameApi } from "./gameApi";
import { createUsersApi, type UsersApi } from "./usersApi";
import i18n from "../i18n";

export interface ApiFacade {
  authApi: AuthApi;
  usersApi: UsersApi;
  gameApi: GameApi;
}

export const api: ApiFacade = {
  authApi: createAuthApi(),
  usersApi: createUsersApi(),
  gameApi: createGameApi(),
};

export function getErrorMessage(error: string): string {
  if (error === "INVALID_CREDENTIALS") return i18n.t("authErrorInvalidCredentials");
  if (error === "EMAIL_ALREADY_REGISTERED") return i18n.t("authErrorEmailTaken");
  if (error === "USERNAME_ALREADY_TAKEN") return i18n.t("authErrorUsernameTaken");
  return i18n.t("authErrorGeneric");
}

export default api;

import { apiFetch } from "./http";

export interface GameParameters {
  gw: number;
  gh: number;
  ballRadius: number;
  ballSpeed: number;
  playerW: number;
  playerH: number;
  playerSpeed: number;
  playerNumber: number;
}

export interface CreateGamePayload {
  gameParameter: GameParameters;
  theme: string;
}

export interface CreateGameResponse {
  id: number;
  password: string;
  alreadyExiste: boolean;
}

export interface GameApi {
  create(payload: CreateGamePayload): Promise<CreateGameResponse>;
}

export function createGameApi(): GameApi {
  return {
    async create(payload) {
      return (await apiFetch("/games", {
        method: "POST",
        body: JSON.stringify(payload),
      })) as CreateGameResponse;
    },
  };
}

import { apiFetch } from "./http";

export interface UserProfile {
  id: string;
  login: string;
  avatar: string | null;
  status: "online" | "offline" | "ingame";
}

export interface UserStats {
  wins: number;
  losses: number;
  winrate: number;
  rating: number;
  gamesPlayed: number;
}

export interface RecentMatch {
  id: string;
  opponentLogin: string;
  opponentAvatar: string | null;
  score: string;
  result: "win" | "loss";
  playedAt: string;
}

export interface UserProfileResponse {
  user: UserProfile;
  stats: UserStats;
  recentMatches: RecentMatch[];
}

export interface UpdateMePayload {
  username: string;
}

export interface UpdateMeResponse {
  id: string;
  email: string;
  username: string;
}

export interface UsersApi {
  getById(userId: string): Promise<UserProfileResponse>;
  updateMe(payload: UpdateMePayload): Promise<UpdateMeResponse>;
}

export function createUsersApi(): UsersApi {
  return {
    async getById(userId) {
      return (await apiFetch(`/users/${userId}`)) as UserProfileResponse;
    },

    async updateMe(payload) {
      return (await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })) as UpdateMeResponse;
    },
  };
}

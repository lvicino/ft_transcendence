import { z } from 'zod';

import { apiFetch } from './http';

const UserProfileStatusSchema = z.enum(['online', 'ingame', 'offline']);

export const UserProfileResponseSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    login: z.string().min(1),
    avatar: z.string().url().nullable().optional(),
    status: UserProfileStatusSchema,
  }),
  stats: z.object({
    wins: z.number().int().nonnegative(),
    losses: z.number().int().nonnegative(),
    winrate: z.number().nonnegative(),
    rating: z.number().int().nonnegative(),
    gamesPlayed: z.number().int().nonnegative(),
  }),
  recentMatches: z.array(
    z.object({
      id: z.string().min(1),
      opponentLogin: z.string().min(1),
      opponentAvatar: z.string().url().nullable().optional(),
      result: z.enum(['win', 'loss']),
      score: z.string().min(1),
      playedAt: z.string().min(1),
    })
  ),
});

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

export async function fetchUserProfile(userId: string): Promise<UserProfileResponse | null> {
  return apiFetch(`/users/${encodeURIComponent(userId)}/profile`, UserProfileResponseSchema, {
    method: 'GET',
  });
}

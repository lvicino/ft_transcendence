// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function startViewTransitionSafely(fn: () => void) {
  const anyDoc = document as unknown as { startViewTransition?: (cb: () => void) => void };
  if (anyDoc.startViewTransition) anyDoc.startViewTransition(fn);
  else fn();
}

export function getRandomPokemonUrl(userId: string | number): string {
  const pokemonId = (Number(String(userId).length) % 151) + 1; 
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

/** Format a name as `username#id` for display */
export function displayTag(username: string | undefined | null, id: string | number | undefined | null): string {
  if (!username && !id) return 'Unknown';
  if (!id) return username ?? 'Unknown';
  if (!username) return `User#${id}`;
  return `${username}#${id}`;
}
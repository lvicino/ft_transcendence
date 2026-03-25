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
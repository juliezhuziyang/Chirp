import type { UserAvatar } from "./types";

export const BIRD_AVATAR_PRESETS = [
  { id: "lovebird", emoji: "🦜", label: "Lovebird", gradient: "from-green-400 to-emerald-500" },
  { id: "cockatoo", emoji: "🦢", label: "Cockatoo", gradient: "from-amber-300 to-yellow-400" },
  { id: "parrot", emoji: "🦜", label: "Parrot", gradient: "from-orange-400 to-red-500" },
  { id: "owl", emoji: "🦉", label: "Owl", gradient: "from-amber-600 to-orange-700" },
  { id: "humming", emoji: "🐦", label: "Songbird", gradient: "from-sky-400 to-blue-500" },
  { id: "penguin", emoji: "🐧", label: "Penguin", gradient: "from-slate-400 to-slate-600" },
  { id: "flamingo", emoji: "🦩", label: "Flamingo", gradient: "from-pink-400 to-rose-500" },
  { id: "eagle", emoji: "🦅", label: "Eagle", gradient: "from-yellow-600 to-amber-800" },
  { id: "duck", emoji: "🦆", label: "Duck", gradient: "from-teal-400 to-cyan-600" },
  { id: "peacock", emoji: "🦚", label: "Peacock", gradient: "from-indigo-400 to-violet-600" },
] as const;

export function pickRandomPresetId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % BIRD_AVATAR_PRESETS.length;
  return BIRD_AVATAR_PRESETS[idx].id;
}

export function getPreset(id: string | null | undefined) {
  return BIRD_AVATAR_PRESETS.find((p) => p.id === id) ?? BIRD_AVATAR_PRESETS[0];
}

export function defaultAvatar(userId: string): UserAvatar {
  return {
    type: "preset",
    presetId: pickRandomPresetId(userId),
    customUrl: null,
  };
}

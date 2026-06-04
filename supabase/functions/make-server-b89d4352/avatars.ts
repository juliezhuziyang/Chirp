export const BIRD_AVATAR_PRESETS = [
  "lovebird",
  "cockatoo",
  "parrot",
  "owl",
  "humming",
  "penguin",
  "flamingo",
  "eagle",
  "duck",
  "peacock",
] as const;

export function pickRandomPresetId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % BIRD_AVATAR_PRESETS.length;
  return BIRD_AVATAR_PRESETS[idx];
}

export interface UserAvatar {
  type: "preset" | "custom";
  presetId: string | null;
  customUrl: string | null;
}

export function defaultAvatar(userId: string): UserAvatar {
  return {
    type: "preset",
    presetId: pickRandomPresetId(userId),
    customUrl: null,
  };
}

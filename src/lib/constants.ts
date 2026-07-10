export const NEED_OPTION_IDS = [
  "care-advice",
  "understanding",
  "training",
  "behavior",
  "health",
  "emotion",
  "other",
] as const;

/** @deprecated Use useNeedOptions() for translated labels */
export const NEED_OPTIONS = NEED_OPTION_IDS.map((id) => ({
  id,
  label: id,
}));

export const PARROT_SPECIES = [
  "African Grey",
  "Amazon",
  "Budgerigar (Budgie)",
  "Cockatiel",
  "Cockatoo",
  "Conure",
  "Eclectus",
  "Lovebird",
  "Macaw",
  "Parakeet",
  "Quaker Parrot",
  "Ring-necked Parakeet",
  "Senegal Parrot",
  "Sun Conure",
  "Other",
] as const;

export const CONTRIBUTE_EMOTION_IDS = [
  "Happy",
  "Excited",
  "Playful",
  "Curious",
  "Relaxed",
  "Calm",
  "Content",
  "Affectionate",
  "Friendly",
  "Alert",
  "Energetic",
  "Interested",
  "Confident",
  "Vocal",
  "Seeking Attention",
  "Bored",
  "Lonely",
  "Anxious",
  "Nervous",
  "Stressed",
  "Frustrated",
  "Angry",
  "Fearful",
  "Defensive",
  "Aggressive",
  "Jealous",
  "Territorial",
  "Tired",
  "Sleepy",
  "Unwell",
  "Other",
] as const;

/** @deprecated Use useContributeEmotions() for translated labels */
export const CONTRIBUTE_EMOTIONS = CONTRIBUTE_EMOTION_IDS;

export const AUTH_TOKEN_KEY = "chirp_auth_token";

export const DASHBOARD_NAV = [
  { id: "sound", path: "/dashboard/sound", labelKey: "dashboard.soundEmotion", icon: "waves" },
  { id: "my-bird", path: "/dashboard/my-bird", labelKey: "dashboard.myBirdProfile", icon: "bird" },
  { id: "community", path: "/dashboard/community", labelKey: "dashboard.community", icon: "users" },
  { id: "friends", path: "/dashboard/friends", labelKey: "dashboard.friends", icon: "heart" },
  { id: "contribute", path: "/dashboard/contribute", labelKey: "dashboard.contribute", icon: "gift" },
] as const;

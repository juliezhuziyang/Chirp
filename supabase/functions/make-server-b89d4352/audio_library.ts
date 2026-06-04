import * as kv from "./kv_store.ts";

export const AUDIO_LIBRARY_KEY = "audio:library";

export type AudioEmotionLabel = "happy" | "socially_engaged" | "positive_vocalization";
export type AudioValidationStatus = "verified" | "pending" | "rejected";

export interface AudioLibraryClip {
  id: string;
  title: string;
  description: string;
  emotion_label: AudioEmotionLabel;
  validation_status: AudioValidationStatus;
  audioUrl: string;
  species: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

const POSITIVE_INTERVENTION_LABELS: AudioEmotionLabel[] = ["happy", "socially_engaged"];

/** Verified clips for the social-sound intervention feature. Replace URLs with your own library files. */
export const DEFAULT_VERIFIED_CLIPS: AudioLibraryClip[] = [
  {
    id: "intervention-happy-1",
    title: "Happy parrot calling",
    description: "Verified positive vocalization — social call",
    emotion_label: "happy",
    validation_status: "verified",
    audioUrl: "/audio/intervention/happy-call-1.wav",
    species: "Parrot",
    durationSeconds: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "intervention-social-1",
    title: "Socially engaged conversation",
    description: "Verified socially engaged parrot vocalization",
    emotion_label: "socially_engaged",
    validation_status: "verified",
    audioUrl: "/audio/intervention/social-chat-1.wav",
    species: "Parrot",
    durationSeconds: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "intervention-social-2",
    title: "Positive flock interaction",
    description: "Verified happy group vocalization",
    emotion_label: "socially_engaged",
    validation_status: "verified",
    audioUrl: "/audio/intervention/social-flock-1.wav",
    species: "Parrot",
    durationSeconds: 10,
    createdAt: new Date().toISOString(),
  },
];

async function getAllClips(): Promise<AudioLibraryClip[]> {
  const stored = (await kv.get(AUDIO_LIBRARY_KEY)) as AudioLibraryClip[] | null;
  return Array.isArray(stored) ? stored : [];
}

async function saveClips(clips: AudioLibraryClip[]) {
  await kv.set(AUDIO_LIBRARY_KEY, clips);
}

export async function ensureAudioLibrarySeeded() {
  const existing = await getAllClips();
  if (existing.length > 0) return existing;
  await saveClips(DEFAULT_VERIFIED_CLIPS);
  return DEFAULT_VERIFIED_CLIPS;
}

export async function listVerifiedPositiveClips(): Promise<AudioLibraryClip[]> {
  await ensureAudioLibrarySeeded();
  const clips = await getAllClips();
  return clips.filter(
    (c) =>
      c.validation_status === "verified" &&
      POSITIVE_INTERVENTION_LABELS.includes(c.emotion_label),
  );
}

export async function getRandomInterventionClip(excludeId?: string): Promise<AudioLibraryClip | null> {
  let pool = await listVerifiedPositiveClips();
  if (excludeId) {
    pool = pool.filter((c) => c.id !== excludeId);
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function addAudioClip(
  clip: Omit<AudioLibraryClip, "id" | "createdAt"> & { id?: string },
): Promise<AudioLibraryClip> {
  await ensureAudioLibrarySeeded();
  const clips = await getAllClips();
  const entry: AudioLibraryClip = {
    ...clip,
    id: clip.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  clips.push(entry);
  await saveClips(clips);
  return entry;
}

export async function updateClipValidation(
  clipId: string,
  validation_status: AudioValidationStatus,
): Promise<AudioLibraryClip | null> {
  const clips = await getAllClips();
  const idx = clips.findIndex((c) => c.id === clipId);
  if (idx < 0) return null;
  clips[idx] = { ...clips[idx], validation_status };
  await saveClips(clips);
  return clips[idx];
}

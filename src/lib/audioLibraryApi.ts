import { getStoredToken } from "./api";
import { edgeFunctionHeaders, SUPABASE_FUNCTIONS_BASE } from "./supabaseApi";
import type { AudioLibraryClip } from "./types";

const API_BASE = SUPABASE_FUNCTIONS_BASE;

async function audioRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...edgeFunctionHeaders(true, getStoredToken()),
      ...(options.headers as Record<string, string>),
    },
  });
  const text = await response.text();
  let data = {} as T & { error?: string };
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {} as T & { error?: string };
  }
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${response.status})`);
  }
  return data;
}

/** Fallback clips when edge API is unavailable (local dev). */
const LOCAL_FALLBACK_CLIPS: AudioLibraryClip[] = [
  {
    id: "local-happy-1",
    title: "Happy parrot calling",
    description: "Sample positive social vocalization",
    emotion_label: "happy",
    validation_status: "verified",
    audioUrl: "/audio/intervention/happy-call-1.wav",
    species: "Parrot",
    durationSeconds: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "local-social-1",
    title: "Socially engaged chatter",
    description: "Sample socially engaged vocalization",
    emotion_label: "socially_engaged",
    validation_status: "verified",
    audioUrl: "/audio/intervention/social-chat-1.wav",
    species: "Parrot",
    durationSeconds: 12,
    createdAt: new Date().toISOString(),
  },
];

function pickLocalClip(excludeId?: string): AudioLibraryClip {
  const pool = excludeId
    ? LOCAL_FALLBACK_CLIPS.filter((c) => c.id !== excludeId)
    : LOCAL_FALLBACK_CLIPS;
  return pool[Math.floor(Math.random() * pool.length)] ?? LOCAL_FALLBACK_CLIPS[0];
}

export function fetchInterventionClip(excludeId?: string) {
  const qs = excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : "";
  return audioRequest<{ clip: AudioLibraryClip }>(`/audio-library/intervention${qs}`).catch(
    () => ({ clip: pickLocalClip(excludeId) }),
  );
}

export function fetchPositiveAudioClips() {
  return audioRequest<{ clips: AudioLibraryClip[] }>("/audio-library/positive").catch(() => ({
    clips: LOCAL_FALLBACK_CLIPS,
  }));
}

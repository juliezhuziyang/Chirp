import type { EmotionInterpretation } from "./emotionInterpretation";
import type { MlEmotionScores } from "./types";

export type PlaybackMode = "rest" | "quiet" | "cheer" | "echo" | "companion";

const REST_STATES = new Set(["Serene and Restful", "Content but Low Energy"]);

const QUIET_STATES = new Set([
  "Stressed and Defensive",
  "Irritable and Agitated",
  "Uneasy and On Guard",
]);

const CHEER_STATES = new Set([
  "Withdrawn and Uncomfortable",
  "Distressed and Avoidant",
  "Lonely and Subdued",
  "Subdued and Low Spirit",
  "Wary but Coping",
]);

const ECHO_STATES = new Set([
  "Euphoric and Outgoing",
  "Playful and Enthusiastic",
  "Happy and Socially Engaged",
  "Cheerful and Conversational",
  "Upbeat and Interactive",
  "Vocal and Attention-Seeking",
  "Content and Companionable",
]);

function isLowMood(state: string, valence: number) {
  return CHEER_STATES.has(state) || valence < 0;
}

/**
 * What to do with playback after the report.
 * Rest wins when energy is nearly gone, including a sad bird that is too tired for sound.
 */
export function resolvePlaybackMode(
  scores: MlEmotionScores,
  interpretation: EmotionInterpretation,
): PlaybackMode {
  const { valence, arousal, socialEngagement } = scores;
  const state = interpretation.combinedState;
  const lowMood = isLowMood(state, valence);

  if (REST_STATES.has(state) || arousal < 0.8 || (lowMood && arousal < 1.4)) {
    return "rest";
  }

  if (QUIET_STATES.has(state) || (valence < -0.5 && arousal >= 3)) {
    return "quiet";
  }

  if (lowMood) {
    return "cheer";
  }

  if (ECHO_STATES.has(state) || (socialEngagement >= 1.8 && valence >= 0)) {
    return "echo";
  }

  return "companion";
}

export function playbackModePlaysAudio(
  mode: PlaybackMode,
): mode is "echo" | "cheer" | "companion" {
  return mode === "echo" || mode === "cheer" || mode === "companion";
}

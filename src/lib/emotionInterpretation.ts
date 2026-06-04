import type { MlEmotionScores } from "./types";

export interface DimensionInterpretation {
  label: string;
  description: string;
}

export interface EmotionInterpretation {
  valence: DimensionInterpretation;
  arousal: DimensionInterpretation;
  social: DimensionInterpretation;
  combinedState: string;
  summary: string;
  explanation: string;
  careAdvice: string[];
}

interface StateProfile {
  explanation: string;
  careAdvice: string[];
}

const COMBINED_STATES: Record<string, StateProfile> = {
  "Euphoric and Outgoing": {
    explanation: "Your bird sounds elated, highly energized, and strongly drawn to social contact.",
    careAdvice: [
      "Share in their enthusiasm with supervised play.",
      "Offer complex foraging and exploration tasks.",
      "Ensure rest time follows high-energy sessions.",
      "Rotate toys to keep stimulation healthy, not overwhelming.",
    ],
  },
  "Playful and Enthusiastic": {
    explanation: "Your bird sounds upbeat, energized, and eager to interact.",
    careAdvice: [
      "Offer enrichment activities and foraging toys.",
      "Provide supervised interaction and gentle play.",
      "Encourage exploration and positive training sessions.",
      "Ensure adequate rest after active periods.",
    ],
  },
  "Happy and Socially Engaged": {
    explanation: "Clear positive mood with active interest in social contact.",
    careAdvice: [
      "Encourage interaction when your bird approaches you.",
      "Offer enrichment toys and shared activities.",
      "Continue your current care routine.",
      "Rotate toys to sustain mental stimulation.",
    ],
  },
  "Cheerful and Conversational": {
    explanation: "Warm, positive vocalizing with a sociable, chatty quality.",
    careAdvice: [
      "Respond with calm, friendly speech to reinforce bonding.",
      "Offer mirror-time or gentle call-and-response.",
      "Keep a predictable daily interaction window.",
    ],
  },
  "Upbeat and Interactive": {
    explanation: "Positive energy with willingness to engage when invited.",
    careAdvice: [
      "Initiate short training or play when your bird is receptive.",
      "Use treats and praise for cooperative behavior.",
      "Avoid overstimulation from loud environments.",
    ],
  },
  "Content and Companionable": {
    explanation: "Settled happiness with a friendly, low-key social presence.",
    careAdvice: [
      "Sit nearby and offer quiet companionship.",
      "Maintain consistent feeding and sleep routines.",
      "Provide gentle head scratches if your bird solicits them.",
    ],
  },
  "Pleased and Attentive": {
    explanation: "Mildly positive mood with focused awareness of surroundings.",
    careAdvice: [
      "Offer a new perch view or safe window exposure.",
      "Introduce one new toy at a time.",
      "Keep interactions brief and positive.",
    ],
  },
  "Relaxed and Content": {
    explanation: "Your bird appears calm, comfortable, and at ease.",
    careAdvice: [
      "Maintain your current daily routine.",
      "Offer gentle interaction when your bird initiates.",
      "Continue positive reinforcement for calm behavior.",
      "Keep the environment quiet and predictable.",
    ],
  },
  "Serene and Restful": {
    explanation: "Very low stimulation with a peaceful, settled tone.",
    careAdvice: [
      "This may be normal rest—avoid disturbing sleep.",
      "Ensure 10–12 hours of dark, quiet time nightly.",
      "Monitor only if this follows a sudden behavior change.",
    ],
  },
  "Calm and Observant": {
    explanation: "Your bird seems settled, attentive, and mildly socially aware.",
    careAdvice: [
      "Maintain a steady, low-stress routine.",
      "Offer optional enrichment without pressure.",
      "Watch for cues before initiating interaction.",
      "Keep perches and sightlines comfortable.",
    ],
  },
  "Quietly Curious": {
    explanation: "Low-key alertness with gentle interest in the environment.",
    careAdvice: [
      "Place foraging items within easy reach.",
      "Allow your bird to explore at their own pace.",
      "Use soft speech rather than sudden approaches.",
    ],
  },
  "Mellow and Self-Sufficient": {
    explanation: "Comfortable mood while focused on solo activity.",
    careAdvice: [
      "Respect independent play time.",
      "Ensure toys and perches support solo enrichment.",
      "Check in periodically without forcing contact.",
    ],
  },
  "Bright and Attentive": {
    explanation: "Neutral-to-positive tone with engaged, watchful energy.",
    careAdvice: [
      "Offer puzzle feeders or shredding toys.",
      "Keep a consistent daily schedule.",
      "Reward calm alertness with a small treat.",
    ],
  },
  "Energetic but Self-Contained": {
    explanation: "High activity directed inward rather than toward social contact.",
    careAdvice: [
      "Channel energy into flying, climbing, or foraging.",
      "Let your bird choose when to engage socially.",
      "Ensure safe out-of-cage exercise if possible.",
    ],
  },
  "Alert but Reserved": {
    explanation: "Your bird is attentive but not strongly seeking interaction.",
    careAdvice: [
      "Respect personal space while staying nearby.",
      "Use soft speech and slow movements.",
      "Offer enrichment that can be used independently.",
      "Build trust with predictable routines.",
    ],
  },
  "Vocal and Attention-Seeking": {
    explanation: "Your bird is energized and actively calling for interaction.",
    careAdvice: [
      "Respond with brief positive attention to reinforce calm calls.",
      "Provide social time and training when appropriate.",
      "Ensure the bird is not bored or under-enriched.",
      "Avoid reinforcing excessive screaming with excitement.",
    ],
  },
  "Excited and Independent": {
    explanation: "High energy with a self-directed, less social focus.",
    careAdvice: [
      "Channel energy into foraging and puzzle toys.",
      "Avoid overstimulation from loud environments.",
      "Let your bird choose when to engage socially.",
      "Ensure plenty of out-of-cage exercise if safe.",
    ],
  },
  "Restless and Unsettled": {
    explanation: "Elevated arousal without a clear positive or negative emotional tone.",
    careAdvice: [
      "Check for boredom, hunger, or environmental changes.",
      "Offer a short flight or play session.",
      "Reduce cage-bound time if safe alternatives exist.",
    ],
  },
  "Stressed and Defensive": {
    explanation: "Vocalizations suggest tension, distress, and guarded behavior.",
    careAdvice: [
      "Reduce environmental stressors immediately.",
      "Lower noise levels and limit sudden movements.",
      "Give your bird space and avoid forced handling.",
      "Monitor for repeated stress signals over the next days.",
      "Consult an avian vet if stress persists.",
    ],
  },
  "Uneasy and On Guard": {
    explanation: "Mild negative tone with elevated alertness.",
    careAdvice: [
      "Identify and remove recent stress triggers.",
      "Speak softly and move slowly near the cage.",
      "Avoid sudden changes to diet or layout.",
      "Offer a covered retreat area.",
    ],
  },
  "Irritable and Agitated": {
    explanation: "Negative mood paired with high stimulation—possibly frustrated.",
    careAdvice: [
      "Pause handling and lower stimulation.",
      "Check for pain, illness, or hormonal triggers.",
      "Offer a quiet retreat and fresh water.",
      "Consult a vet if agitation persists.",
    ],
  },
  "Withdrawn and Uncomfortable": {
    explanation: "Your bird may feel low, withdrawn, or physically uncomfortable.",
    careAdvice: [
      "Observe carefully without forcing interaction.",
      "Check temperature, lighting, diet, and cage placement.",
      "Monitor appetite, droppings, and activity levels.",
      "Offer a quiet retreat space in the cage.",
      "Seek veterinary advice if withdrawal continues.",
    ],
  },
  "Distressed and Avoidant": {
    explanation: "Strong discomfort with active avoidance of contact.",
    careAdvice: [
      "Stop handling and give immediate space.",
      "Review for predators, drafts, or cage mates bullying.",
      "Keep interactions minimal until behavior improves.",
      "Contact an avian veterinarian if distress continues.",
    ],
  },
  "Lonely and Subdued": {
    explanation: "Low mood with reduced social engagement—possible loneliness.",
    careAdvice: [
      "Increase gentle, predictable companionship nearby.",
      "Consider safe social audio or mirrored enrichment.",
      "Avoid long isolation periods.",
      "Monitor for sustained withdrawal.",
    ],
  },
  "Subdued and Low Spirit": {
    explanation: "Muted emotional tone across valence and energy.",
    careAdvice: [
      "Review diet, sleep, and recent environmental changes.",
      "Offer favorite foods and low-pressure interaction.",
      "Schedule a vet visit if low spirit is new or worsening.",
    ],
  },
  "Balanced and Steady": {
    explanation: "Emotional signals are near neutral across all dimensions.",
    careAdvice: [
      "Continue consistent daily care.",
      "Note any shifts over time in recordings.",
      "Offer routine enrichment and fresh food.",
      "Maintain regular health checkups.",
    ],
  },
  "Neutral and Even-Tempered": {
    explanation: "Steady, middle-range signals without strong emotional peaks.",
    careAdvice: [
      "Keep routines consistent.",
      "Track recordings over time for subtle shifts.",
      "Offer routine enrichment.",
    ],
  },
  "Wary but Coping": {
    explanation: "Slightly negative tone with manageable arousal—monitor closely.",
    careAdvice: [
      "Reduce new stimuli temporarily.",
      "Use calm voice and predictable routines.",
      "Avoid forcing interaction until comfort improves.",
    ],
  },
  "Content but Low Energy": {
    explanation: "Generally positive mood with low stimulation.",
    careAdvice: [
      "This may be normal rest—monitor for sudden changes.",
      "Provide gentle enrichment at a comfortable pace.",
      "Ensure adequate sleep hours in a dark, quiet room.",
      "Schedule a vet check if lethargy is new or worsening.",
    ],
  },
};

/** Finer valence bands so clustered positive scores still read differently. */
export function interpretValence(v: number): DimensionInterpretation {
  if (v < -4) return { label: "Distressed", description: "Strong negative emotional tone." };
  if (v < -3) return { label: "Very Uncomfortable", description: "Clearly uncomfortable vocalization." };
  if (v < -2) return { label: "Upset", description: "Noticeably upset or agitated tone." };
  if (v < -1) return { label: "Uneasy", description: "Slightly negative or wary tone." };
  if (v < -0.3) return { label: "Slightly Wary", description: "Mild caution in vocal tone." };
  if (v < 0.3) return { label: "Settled", description: "Emotionally even and stable." };
  if (v < 1) return { label: "Mildly Positive", description: "Gently upbeat undertone." };
  if (v < 1.8) return { label: "Content", description: "Mildly positive and settled." };
  if (v < 2.5) return { label: "Pleased", description: "Comfortably positive vocalization." };
  if (v < 3.2) return { label: "Happy", description: "Positive, upbeat vocalization." };
  if (v < 4) return { label: "Very Happy", description: "Strongly positive emotional tone." };
  return { label: "Joyful / Thriving", description: "Highly positive, thriving vocalization." };
}

/** Finer arousal bands aligned with typical model output (~1–4). */
export function interpretArousal(a: number): DimensionInterpretation {
  if (a < 0.8) return { label: "Very Calm", description: "Low energy and minimal stimulation." };
  if (a < 1.4) return { label: "Relaxed", description: "Calm with gentle alertness." };
  if (a < 2) return { label: "Gentle", description: "Soft, unhurried activity level." };
  if (a < 2.6) return { label: "Alert", description: "Attentive and moderately active." };
  if (a < 3.2) return { label: "Engaged", description: "Actively responsive and animated." };
  if (a < 3.8) return { label: "Excited", description: "Elevated energy and responsiveness." };
  if (a < 4.4) return { label: "Highly Stimulated", description: "Very high energy vocalization." };
  return { label: "Intense", description: "Peak stimulation and vocal intensity." };
}

/** Finer social bands so mid-range engagement is not all labeled “Social”. */
export function interpretSocial(s: number): DimensionInterpretation {
  if (s < -4) return { label: "Avoidant", description: "Strongly avoiding social contact." };
  if (s < -3) return { label: "Withdrawn", description: "Pulling back from interaction." };
  if (s < -2) return { label: "Reserved", description: "Limited social interest." };
  if (s < -1) return { label: "Independent", description: "Self-focused, low social drive." };
  if (s < -0.3) return { label: "Detached", description: "Minimal orientation toward others." };
  if (s < 0.3) return { label: "Self-Focused", description: "Engaged with self rather than others." };
  if (s < 1) return { label: "Neutral", description: "Balanced social engagement." };
  if (s < 1.8) return { label: "Interested", description: "Mild curiosity toward others." };
  if (s < 2.5) return { label: "Sociable", description: "Comfortably engaging socially." };
  if (s < 3.2) return { label: "Social", description: "Actively engaging socially." };
  if (s < 4) return { label: "Very Social", description: "Strong desire for interaction." };
  return { label: "Attention-Seeking", description: "Actively seeking attention and contact." };
}

type Rule = { state: string; match: (v: number, a: number, s: number) => boolean };

/** Most specific rules first — uses raw scores, not coarse buckets. */
const COMBINED_STATE_RULES: Rule[] = [
  // Distress / negative
  { state: "Distressed and Avoidant", match: (v, a, s) => v < -2.5 && s < -2 },
  { state: "Stressed and Defensive", match: (v, a, s) => v < -1 && a >= 3 && s < 0 },
  { state: "Irritable and Agitated", match: (v, a, s) => v < -0.5 && a >= 3.5 },
  { state: "Uneasy and On Guard", match: (v, a, s) => v < -0.5 && a >= 2.5 && s < 1.5 },
  { state: "Wary but Coping", match: (v, a, s) => v < 0 && v >= -1.5 && a < 3.5 && s >= -1 },
  { state: "Withdrawn and Uncomfortable", match: (v, a, s) => v < -1 && a < 2 && s < -0.5 },
  { state: "Lonely and Subdued", match: (v, a, s) => v < 0.5 && s < -1 && a < 2.8 },
  { state: "Subdued and Low Spirit", match: (v, a, s) => v < 0.5 && a < 2 && Math.abs(s) < 1 },

  // High positive + social (split the former catch-all)
  { state: "Euphoric and Outgoing", match: (v, a, s) => v >= 3.5 && a >= 3.5 && s >= 3 },
  { state: "Playful and Enthusiastic", match: (v, a, s) => v >= 2.8 && a >= 3.2 && s >= 2.5 },
  { state: "Vocal and Attention-Seeking", match: (v, a, s) => v >= 1.5 && a >= 3.5 && s >= 3 },
  { state: "Happy and Socially Engaged", match: (v, a, s) => v >= 2.8 && a >= 2.5 && s >= 2.8 },
  { state: "Cheerful and Conversational", match: (v, a, s) => v >= 2.2 && a >= 2 && a < 3.5 && s >= 2 && s < 3.5 },
  { state: "Upbeat and Interactive", match: (v, a, s) => v >= 1.8 && a >= 2.5 && s >= 1.5 && s < 2.8 },
  { state: "Content and Companionable", match: (v, a, s) => v >= 1.5 && a < 2.6 && s >= 2 },

  // Positive / neutral mid-range (where most predictions cluster)
  { state: "Pleased and Attentive", match: (v, a, s) => v >= 1 && v < 2.5 && a >= 2 && a < 3.2 && s >= 0.5 && s < 2.5 },
  { state: "Bright and Attentive", match: (v, a, s) => v >= 0.3 && v < 2.2 && a >= 2.2 && s < 2 },
  { state: "Relaxed and Content", match: (v, a, s) => v >= 1 && a < 2 && s >= 0 && s < 2.5 },
  { state: "Serene and Restful", match: (v, a, s) => v >= -0.3 && a < 1.4 && s >= -0.5 },
  { state: "Content but Low Energy", match: (v, a, s) => v >= 1 && a < 2 && s < 1 },
  { state: "Calm and Observant", match: (v, a, s) => v >= -0.5 && v < 1.8 && a >= 1.4 && a < 2.8 && s >= -0.5 && s < 2 },
  { state: "Quietly Curious", match: (v, a, s) => v >= 0 && v < 2 && a >= 1.4 && a < 2.5 && s >= 0.5 && s < 2 },
  { state: "Mellow and Self-Sufficient", match: (v, a, s) => v >= 0.5 && a < 2.2 && s < 1 },
  { state: "Energetic but Self-Contained", match: (v, a, s) => v >= 0.5 && a >= 3 && s < 1.5 },
  { state: "Excited and Independent", match: (v, a, s) => v >= 0 && a >= 3.2 && s < 0.5 },
  { state: "Alert but Reserved", match: (v, a, s) => a >= 2.5 && s < 0.5 && v >= -0.5 && v < 2 },
  { state: "Restless and Unsettled", match: (v, a, s) => a >= 3.5 && v >= -0.5 && v < 1.5 && s < 1.5 },

  // Broad fallbacks
  { state: "Neutral and Even-Tempered", match: (v, a, s) => Math.abs(v) < 1 && a >= 1.5 && a < 2.8 && Math.abs(s) < 1.5 },
  { state: "Balanced and Steady", match: () => true },
];

function resolveCombinedState(v: number, a: number, s: number): string {
  for (const rule of COMBINED_STATE_RULES) {
    if (rule.match(v, a, s)) return rule.state;
  }
  return "Balanced and Steady";
}

function buildSummary(
  valence: DimensionInterpretation,
  arousal: DimensionInterpretation,
  social: DimensionInterpretation,
): string {
  const parts = [
    valence.label.toLowerCase(),
    arousal.label.toLowerCase(),
    social.label.toLowerCase(),
  ];
  return `${capitalize(parts[0])}, ${parts[1]}, and ${parts[2]}.`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function interpretEmotionScores(scores: MlEmotionScores): EmotionInterpretation {
  const valence = interpretValence(scores.valence);
  const arousal = interpretArousal(scores.arousal);
  const social = interpretSocial(scores.socialEngagement);

  const combinedState = resolveCombinedState(
    scores.valence,
    scores.arousal,
    scores.socialEngagement,
  );

  const profile = COMBINED_STATES[combinedState] ?? COMBINED_STATES["Balanced and Steady"];

  return {
    valence,
    arousal,
    social,
    combinedState,
    summary: buildSummary(valence, arousal, social),
    explanation: profile.explanation,
    careAdvice: profile.careAdvice,
  };
}

/** Normalize scores to 0–1 for radar chart display on each axis scale. */
export function radarChartValues(scores: MlEmotionScores) {
  return {
    valence: (scores.valence + 5) / 10,
    arousal: scores.arousal / 5,
    socialEngagement: (scores.socialEngagement + 5) / 10,
  };
}

const REST_COMBINED_STATES = new Set([
  "Relaxed and Content",
  "Content but Low Energy",
  "Calm and Observant",
  "Serene and Restful",
  "Mellow and Self-Sufficient",
  "Neutral and Even-Tempered",
]);

const DISTRESS_COMBINED_STATES = new Set([
  "Withdrawn and Uncomfortable",
  "Stressed and Defensive",
  "Distressed and Avoidant",
  "Uneasy and On Guard",
  "Irritable and Agitated",
  "Lonely and Subdued",
  "Subdued and Low Spirit",
  "Wary but Coping",
]);

const LOW_VALENCE_LABELS = new Set([
  "Distressed",
  "Very Uncomfortable",
  "Upset",
  "Uneasy",
  "Slightly Wary",
]);

const LOW_SOCIAL_LABELS = new Set([
  "Avoidant",
  "Withdrawn",
  "Reserved",
  "Independent",
  "Detached",
]);

/**
 * Whether to offer positive social parrot sounds after analysis.
 * Excludes tired/relaxed/low-energy rest states without emotional discomfort.
 */
export function shouldOfferSocialIntervention(
  scores: MlEmotionScores,
  interpretation: EmotionInterpretation,
): boolean {
  const { valence, arousal, socialEngagement } = scores;

  if (REST_COMBINED_STATES.has(interpretation.combinedState)) {
    return false;
  }

  const isLowEnergyRest =
    valence >= -1 && arousal < 2 && socialEngagement >= -1;
  if (isLowEnergyRest) {
    return false;
  }

  const relaxedArousalOnly =
    (interpretation.arousal.label === "Very Calm" ||
      interpretation.arousal.label === "Relaxed" ||
      interpretation.arousal.label === "Gentle") &&
    valence >= -1 &&
    socialEngagement >= -1;
  if (relaxedArousalOnly) {
    return false;
  }

  const distressedValence = valence < -1;
  const lowSocial = socialEngagement < -1;
  const negativeValenceLowSocial = valence < 0 && socialEngagement < 0;

  if (DISTRESS_COMBINED_STATES.has(interpretation.combinedState)) {
    return true;
  }

  if (interpretation.combinedState === "Alert but Reserved" && lowSocial) {
    return true;
  }

  if (
    LOW_VALENCE_LABELS.has(interpretation.valence.label) ||
    LOW_SOCIAL_LABELS.has(interpretation.social.label)
  ) {
    return true;
  }

  return distressedValence || lowSocial || negativeValenceLowSocial;
}

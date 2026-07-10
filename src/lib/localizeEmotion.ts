import type { TFunction } from "i18next";
import type { EmotionInterpretation } from "./emotionInterpretation";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function localizeDimension(
  t: TFunction,
  ns: "valence" | "arousal" | "social",
  dim: { label: string; description: string },
) {
  const key = slug(dim.label);
  return {
    label: t(`emotion:${ns}.${key}.label`, { defaultValue: dim.label }),
    description: t(`emotion:${ns}.${key}.description`, { defaultValue: dim.description }),
  };
}

export function localizeEmotionInterpretation(
  interpretation: EmotionInterpretation,
  t: TFunction,
): EmotionInterpretation {
  const stateKey = slug(interpretation.combinedState);
  const valence = localizeDimension(t, "valence", interpretation.valence);
  const arousal = localizeDimension(t, "arousal", interpretation.arousal);
  const social = localizeDimension(t, "social", interpretation.social);

  const careAdvice = interpretation.careAdvice.map((tip, i) =>
    t(`emotion:states.${stateKey}.careAdvice.${i}`, { defaultValue: tip }),
  );

  return {
    valence,
    arousal,
    social,
    combinedState: t(`emotion:states.${stateKey}.name`, {
      defaultValue: interpretation.combinedState,
    }),
    summary: t("emotion:summary", {
      valence: valence.label.toLowerCase(),
      arousal: arousal.label.toLowerCase(),
      social: social.label.toLowerCase(),
      defaultValue: interpretation.summary,
    }),
    explanation: t(`emotion:states.${stateKey}.explanation`, {
      defaultValue: interpretation.explanation,
    }),
    careAdvice,
  };
}

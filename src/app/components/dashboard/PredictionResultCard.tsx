import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { MlEmotionScores } from "../../../lib/types";
import {
  interpretEmotionScores,
  radarChartValues,
} from "../../../lib/emotionInterpretation";
import { localizeEmotionInterpretation } from "../../../lib/localizeEmotion";
import { EmotionRadarChart } from "./EmotionRadarChart";
import { AnalysisFeedback } from "./AnalysisFeedback";

export interface AnalysisAudioAttachment {
  blob: Blob;
  filename: string;
  mime: string;
}

interface PredictionResultCardProps {
  scores: MlEmotionScores;
  birdProbability?: number;
  analysisAudio?: AnalysisAudioAttachment | null;
}

export function PredictionResultCard({
  scores,
  birdProbability,
  analysisAudio,
}: PredictionResultCardProps) {
  const { t } = useTranslation();
  const raw = interpretEmotionScores(scores);
  const interpretation = localizeEmotionInterpretation(raw, t);
  const normalized = radarChartValues(scores);

  const dimensions = [
    {
      label: t("prediction.valence"),
      shortLabel: t("chart.valence"),
      value: scores.valence,
      fill: normalized.valence,
      detail: `${interpretation.valence.label} — ${interpretation.valence.description}`,
    },
    {
      label: t("prediction.arousal"),
      shortLabel: t("chart.arousal"),
      value: scores.arousal,
      fill: normalized.arousal,
      detail: `${interpretation.arousal.label} — ${interpretation.arousal.description}`,
    },
    {
      label: t("prediction.socialEngagement"),
      shortLabel: t("chart.social"),
      value: scores.socialEngagement,
      fill: normalized.socialEngagement,
      detail: `${interpretation.social.label} — ${interpretation.social.description}`,
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-left"
    >
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-4 border-b border-stone-200">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide uppercase text-stone-500">
            {t("prediction.detectedState")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mt-1 leading-tight">
            {interpretation.combinedState}
          </h2>
          <p className="text-stone-600 mt-2 max-w-2xl text-sm leading-relaxed">
            {interpretation.summary}
          </p>
        </div>
        <p className="text-sm text-stone-500 shrink-0">
          {t("prediction.birdDetected")}
          {birdProbability != null && (
            <span className="text-stone-700 font-medium">
              {" "}
              {t("prediction.confidence", { percent: Math.round(birdProbability * 100) })}
            </span>
          )}
        </p>
      </header>

      <div className="grid lg:grid-cols-[17rem_minmax(0,1fr)] gap-8 lg:gap-10 pt-5 items-start">
        <div>
          <EmotionRadarChart scores={scores} compact />
          <div className="mt-2 space-y-3">
            {dimensions.map((dim) => (
              <div key={dim.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-stone-600">{dim.shortLabel}</span>
                  <span className="tabular-nums font-medium text-stone-900">{dim.value.toFixed(1)}</span>
                </div>
                <div className="mt-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${Math.round(dim.fill * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <p className="text-sm text-stone-700 leading-relaxed">{interpretation.explanation}</p>
          <dl className="space-y-3">
            {dimensions.map((dim) => (
              <div key={dim.label} className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)] gap-x-4 gap-y-0.5">
                <dt className="text-sm font-medium text-stone-900">{dim.label}</dt>
                <dd className="text-sm text-stone-600 leading-relaxed">{dim.detail}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="text-sm font-medium text-stone-900 mb-2">{t("prediction.careAdvice")}</h3>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {interpretation.careAdvice.map((tip) => (
                <li key={tip} className="text-sm text-stone-600 leading-relaxed pl-3 border-l border-orange-300">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-stone-200">
        <AnalysisFeedback
          scores={scores}
          predictedState={interpretation.combinedState}
          birdProbability={birdProbability}
          analysisAudio={analysisAudio}
          embedded
        />
      </div>
    </motion.article>
  );
}

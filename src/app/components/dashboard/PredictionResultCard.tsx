import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Bird, Sparkles } from "lucide-react";
import type { MlEmotionScores } from "../../../lib/types";
import { interpretEmotionScores } from "../../../lib/emotionInterpretation";
import { localizeEmotionInterpretation } from "../../../lib/localizeEmotion";
import { EmotionRadarChart } from "./EmotionRadarChart";
import { SocialSoundIntervention } from "./SocialSoundIntervention";
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
  const interpretation = localizeEmotionInterpretation(interpretEmotionScores(scores), t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-5 text-left"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-800 text-sm font-semibold">
        <Bird className="w-4 h-4" />
        {t("prediction.birdDetected")}
        {birdProbability != null && (
          <span className="text-green-700 font-normal">
            {t("prediction.confidence", { percent: Math.round(birdProbability * 100) })}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-amber-50/80 p-4">
        <EmotionRadarChart scores={scores} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScoreTile label={t("prediction.valence")} value={scores.valence} range={t("prediction.rangeValence")} />
        <ScoreTile label={t("prediction.arousal")} value={scores.arousal} range={t("prediction.rangeArousal")} />
        <ScoreTile
          label={t("prediction.socialEngagement")}
          value={scores.socialEngagement}
          range={t("prediction.rangeSocial")}
        />
      </div>

      <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">{t("prediction.detectedState")}</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{interpretation.combinedState}</p>
        <p className="text-gray-600 mt-2 text-sm">{interpretation.summary}</p>
      </div>

      <div className="rounded-2xl bg-orange-50/70 border border-orange-100 p-5 space-y-3">
        <h4 className="font-semibold text-gray-900">{t("prediction.detailedInterpretation")}</h4>
        <p className="text-sm text-gray-700">{interpretation.explanation}</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>{t("prediction.dimensionValence")}</strong> {interpretation.valence.label} —{" "}
            {interpretation.valence.description}
          </li>
          <li>
            <strong>{t("prediction.dimensionArousal")}</strong> {interpretation.arousal.label} —{" "}
            {interpretation.arousal.description}
          </li>
          <li>
            <strong>{t("prediction.dimensionSocial")}</strong> {interpretation.social.label} —{" "}
            {interpretation.social.description}
          </li>
        </ul>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
        <h4 className="font-semibold text-amber-900 mb-3">{t("prediction.careAdvice")}</h4>
        <ul className="space-y-2">
          {interpretation.careAdvice.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm text-amber-950">
              <span className="text-orange-500 font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <SocialSoundIntervention scores={scores} />

      <AnalysisFeedback
        scores={scores}
        predictedState={interpretation.combinedState}
        birdProbability={birdProbability}
        analysisAudio={analysisAudio}
      />
    </motion.div>
  );
}

function ScoreTile({
  label,
  value,
  range,
}: {
  label: string;
  value: number;
  range: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-orange-100 p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toFixed(1)}</p>
      <p className="text-xs text-gray-400 mt-0.5">{range}</p>
    </div>
  );
}

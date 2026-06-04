import { motion } from "motion/react";
import { Bird, Sparkles } from "lucide-react";
import type { MlEmotionScores } from "../../../lib/types";
import { interpretEmotionScores } from "../../../lib/emotionInterpretation";
import { EmotionRadarChart } from "./EmotionRadarChart";
import { SocialSoundIntervention } from "./SocialSoundIntervention";

interface PredictionResultCardProps {
  scores: MlEmotionScores;
  birdProbability?: number;
}

export function PredictionResultCard({ scores, birdProbability }: PredictionResultCardProps) {
  const interpretation = interpretEmotionScores(scores);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-5 text-left"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-800 text-sm font-semibold">
        <Bird className="w-4 h-4" />
        Bird Sound Detected
        {birdProbability != null && (
          <span className="text-green-700 font-normal">
            ({Math.round(birdProbability * 100)}% confidence)
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-amber-50/80 p-4">
        <EmotionRadarChart scores={scores} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScoreTile label="Valence" value={scores.valence} range="-5 to +5" />
        <ScoreTile label="Arousal" value={scores.arousal} range="0 to 5" />
        <ScoreTile
          label="Social Engagement"
          value={scores.socialEngagement}
          range="-5 to +5"
        />
      </div>

      <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">Detected State</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{interpretation.combinedState}</p>
        <p className="text-gray-600 mt-2 text-sm">{interpretation.summary}</p>
      </div>

      <div className="rounded-2xl bg-orange-50/70 border border-orange-100 p-5 space-y-3">
        <h4 className="font-semibold text-gray-900">Detailed interpretation</h4>
        <p className="text-sm text-gray-700">{interpretation.explanation}</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>Valence:</strong> {interpretation.valence.label} —{" "}
            {interpretation.valence.description}
          </li>
          <li>
            <strong>Arousal:</strong> {interpretation.arousal.label} —{" "}
            {interpretation.arousal.description}
          </li>
          <li>
            <strong>Social:</strong> {interpretation.social.label} —{" "}
            {interpretation.social.description}
          </li>
        </ul>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
        <h4 className="font-semibold text-amber-900 mb-3">Care advice</h4>
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

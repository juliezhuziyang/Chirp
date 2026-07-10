import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { MessageCircle, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import type { MlEmotionScores } from "../../../lib/types";
import { useContributeEmotions } from "../../../lib/useTranslatedOptions";
import * as socialApi from "../../../lib/socialApi";

type Phase = "ask" | "thanks" | "correct" | "done";

interface AnalysisFeedbackProps {
  scores: MlEmotionScores;
  predictedState: string;
  birdProbability?: number;
}

export function AnalysisFeedback({
  scores,
  predictedState,
  birdProbability,
}: AnalysisFeedbackProps) {
  const { t } = useTranslation();
  const emotionOptions = useContributeEmotions();
  const [phase, setPhase] = useState<Phase>("ask");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [behaviorNotes, setBehaviorNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleEmotion = (id: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const submit = async (accurate: boolean, emotions?: string[], behavior?: string) => {
    setSubmitting(true);
    setError("");
    try {
      await socialApi.submitAnalysisFeedback({
        accurate,
        predictedState,
        scores,
        birdProbability,
        correctedEmotions: emotions,
        behaviorNotes: behavior,
      });
      setPhase(accurate ? "thanks" : "done");
    } catch {
      setError(t("analysisFeedback.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccurate = () => {
    void submit(true);
  };

  const handleInaccurate = () => {
    setPhase("correct");
  };

  const handleCorrectionSubmit = () => {
    if (selectedEmotions.length === 0) {
      setError(t("analysisFeedback.selectEmotion"));
      return;
    }
    void submit(false, selectedEmotions, behaviorNotes.trim() || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 text-orange-600 mb-4">
        <MessageCircle className="w-5 h-5" />
        <h4 className="font-semibold text-gray-900">{t("analysisFeedback.title")}</h4>
      </div>

      <AnimatePresence mode="wait">
        {phase === "ask" && (
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleAccurate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-50 border-2 border-green-200 text-green-800 font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <ThumbsUp className="w-4 h-4" />
                {t("analysisFeedback.accurate")}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleInaccurate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-50 border-2 border-orange-200 text-orange-800 font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                <ThumbsDown className="w-4 h-4" />
                {t("analysisFeedback.inaccurate")}
              </button>
            </div>
            {submitting && (
              <p className="text-sm text-gray-500 text-center">{t("analysisFeedback.submitting")}</p>
            )}
          </motion.div>
        )}

        {phase === "thanks" && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
          >
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{t("analysisFeedback.thanks")}</p>
          </motion.div>
        )}

        {phase === "correct" && (
          <motion.div
            key="correct"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <p className="font-medium text-gray-900">{t("analysisFeedback.correctionTitle")}</p>
              <p className="text-sm text-gray-500 mt-1">{t("analysisFeedback.correctionSubtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {emotionOptions.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEmotion(e.id)}
                  className={`px-3 py-2 rounded-xl text-sm border-2 transition-colors ${
                    selectedEmotions.includes(e.id)
                      ? "border-orange-500 bg-orange-50 text-orange-800 font-medium"
                      : "border-orange-100 text-gray-600 hover:border-orange-200"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("analysisFeedback.behaviorLabel")}
              </label>
              <textarea
                value={behaviorNotes}
                onChange={(e) => setBehaviorNotes(e.target.value)}
                placeholder={t("analysisFeedback.behaviorPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-400 focus:outline-none resize-none text-sm"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={handleCorrectionSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {submitting ? t("analysisFeedback.submitting") : t("analysisFeedback.submit")}
            </button>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
          >
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{t("analysisFeedback.correctionThanks")}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && phase === "ask" && (
        <p className="text-red-600 text-sm mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </motion.div>
  );
}

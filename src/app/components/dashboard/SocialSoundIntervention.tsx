import { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Heart, Music, RefreshCw } from "lucide-react";
import type { AudioLibraryClip, MlEmotionScores } from "../../../lib/types";
import {
  interpretEmotionScores,
  shouldOfferSocialIntervention,
} from "../../../lib/emotionInterpretation";
import { fetchInterventionClip } from "../../../lib/audioLibraryApi";
import { InterventionAudioPlayer } from "./InterventionAudioPlayer";

interface SocialSoundInterventionProps {
  scores: MlEmotionScores;
}

export function SocialSoundIntervention({ scores }: SocialSoundInterventionProps) {
  const { t } = useTranslation();
  const interpretation = interpretEmotionScores(scores);
  const show = shouldOfferSocialIntervention(scores, interpretation);

  const [clip, setClip] = useState<AudioLibraryClip | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const loadClip = async (excludeId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { clip: next } = await fetchInterventionClip(excludeId);
      setClip(next);
      setRevealed(true);
    } catch {
      setError(t("intervention.loadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 pt-6 border-t-2 border-dashed border-teal-200"
    >
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/90 to-emerald-50/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-teal-950">{t("intervention.title")}</h4>
            <p className="text-sm text-teal-900/80 mt-2 leading-relaxed">{t("intervention.description")}</p>
            <p className="text-xs text-teal-800/60 mt-2 italic">{t("intervention.disclaimer")}</p>

            {!revealed && (
              <button
                type="button"
                onClick={() => loadClip()}
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-md"
              >
                <Music className="w-4 h-4" />
                {loading ? t("common.loadingEllipsis") : t("intervention.playButton")}
              </button>
            )}

            {error && !revealed && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {revealed && clip && (
          <div className="mt-5 space-y-3">
            <InterventionAudioPlayer clip={clip} />
            <button
              type="button"
              onClick={() => loadClip(clip.id)}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {t("intervention.tryAnother")}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Bird, Github, Heart, Moon, Pause, Play, RefreshCw, VolumeX, Waves } from "lucide-react";
import type { MlEmotionScores } from "../../../lib/types";
import { interpretEmotionScores } from "../../../lib/emotionInterpretation";
import { localizeEmotionInterpretation } from "../../../lib/localizeEmotion";
import {
  playbackModePlaysAudio,
  resolvePlaybackMode,
  type PlaybackMode,
} from "../../../lib/playbackResponse";
import {
  pickPlaybackClip,
  poolForPlaybackMode,
  type PlaybackClip,
} from "../../../lib/playbackCatalog";

interface PlaybackResponseProps {
  scores: MlEmotionScores;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function initialClip(mode: PlaybackMode): PlaybackClip | null {
  if (!playbackModePlaysAudio(mode)) return null;
  return pickPlaybackClip(poolForPlaybackMode(mode));
}

export function PlaybackResponse({ scores }: PlaybackResponseProps) {
  const { t } = useTranslation();
  const raw = interpretEmotionScores(scores);
  const interpretation = localizeEmotionInterpretation(raw, t);
  const mode = resolvePlaybackMode(scores, raw);
  const plays = playbackModePlaysAudio(mode);

  const [clip, setClip] = useState<PlaybackClip | null>(() => initialClip(mode));
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    audioRef.current?.load();
  }, [clip?.id]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setError(t("playback.playError")));
    } else {
      audio.pause();
    }
  }, [t]);

  const tryAnother = () => {
    if (!playbackModePlaysAudio(mode) || !clip) return;
    setClip(pickPlaybackClip(poolForPlaybackMode(mode), clip.id));
  };

  const Icon =
    mode === "rest" ? Moon : mode === "quiet" ? VolumeX : mode === "cheer" ? Heart : mode === "echo" ? Waves : Bird;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-orange-200 bg-orange-50/80 overflow-hidden"
    >
      <header className="px-5 py-5 sm:px-6 border-b border-orange-100">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-xl bg-white text-orange-600 border border-orange-100 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide uppercase text-orange-700/80">
              {t("playback.kicker")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mt-1 leading-tight">
              {t(`playback.modes.${mode}.title`)}
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {t(`playback.modes.${mode}.reason`, { state: interpretation.combinedState })}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-5 sm:px-6 bg-white">
        {plays && clip ? (
          <div>
            <audio
              ref={audioRef}
              src={clip.audioUrl}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
              onEnded={() => setPlaying(false)}
              onError={() => setError(t("playback.audioUnavailable"))}
            />
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={togglePlay}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg inline-flex items-center justify-center shrink-0 hover:shadow-xl transition-shadow"
                aria-label={playing ? t("common.pause") : t("common.play")}
              >
                {playing ? <Pause className="w-8 h-8 sm:w-10 sm:h-10" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-stone-600 leading-relaxed">{t("playback.clipIntro")}</p>
                <p className="mt-1 text-sm font-medium text-stone-900">
                  {clip.bird}
                  <span className="font-normal text-stone-600">
                    {" · "}
                    {t(`playback.reactions.${clip.pool}`)}
                  </span>
                </p>
                <div className="mt-3 max-w-md">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => {
                      const audio = audioRef.current;
                      if (!audio) return;
                      const seekTime = Number(e.target.value);
                      audio.currentTime = seekTime;
                      setCurrentTime(seekTime);
                    }}
                    className="w-full h-1.5 accent-orange-500 cursor-pointer"
                    aria-label={t("playback.playbackProgress")}
                  />
                  <p className="mt-1 text-xs tabular-nums text-stone-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={tryAnother}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 hover:text-orange-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t("playback.tryAnother")}
                </button>
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        ) : (
          <p className="text-sm text-stone-700 leading-relaxed max-w-2xl pl-3 border-l border-orange-300">
            {t(`playback.modes.${mode}.body`)}
          </p>
        )}

        <p className="mt-5 text-xs leading-relaxed text-stone-400 max-w-2xl">{t("playback.disclaimer")}</p>
        <a
          href="https://github.com/juliezhuziyang/Chirp"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 hover:text-orange-800"
        >
          <Github className="w-4 h-4" />
          {t("playback.researchLink")}
        </a>
      </div>
    </motion.section>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Bird, Heart, Moon, Pause, Play, RefreshCw, VolumeX, Waves } from "lucide-react";
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const Icon =
    mode === "rest" ? Moon : mode === "quiet" ? VolumeX : mode === "cheer" ? Heart : mode === "echo" ? Waves : Bird;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[70vh] rounded-[2rem] overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 text-white shadow-2xl"
    >
      <div className="min-h-[70vh] flex flex-col justify-between px-6 py-10 sm:px-12 sm:py-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-orange-200/80">
            {t("playback.kicker")}
          </p>
          <div className="mt-6 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/10 text-orange-100 shrink-0">
              <Icon className="w-8 h-8" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
              {t(`playback.modes.${mode}.title`)}
            </h2>
          </div>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-stone-100">
            {t(`playback.modes.${mode}.reason`, { state: interpretation.combinedState })}
          </p>
        </div>

        {plays && clip ? (
          <div className="mt-12">
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
            <p className="text-sm text-orange-100/80">{t("playback.experimentClip")}</p>
            <p className="mt-1 text-2xl font-semibold">
              {clip.bird}
              <span className="text-orange-100/70 font-normal">
                {" · "}
                {t(`playback.clips.${clip.id}`)}
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={togglePlay}
                className="w-24 h-24 rounded-full bg-white text-stone-900 shadow-xl inline-flex items-center justify-center hover:bg-orange-50 transition-colors"
                aria-label={playing ? t("common.pause") : t("common.play")}
              >
                {playing ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </button>
              <div className="flex-1 min-w-[16rem] max-w-xl">
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
                  className="w-full h-2 accent-orange-300 cursor-pointer"
                  aria-label={t("playback.playbackProgress")}
                />
                <div className="mt-2 h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-orange-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-sm tabular-nums text-orange-100/80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={tryAnother}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-orange-100 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              {t("playback.tryAnother")}
            </button>
            {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
          </div>
        ) : (
          <p className="mt-12 max-w-2xl text-2xl sm:text-3xl font-medium leading-snug text-orange-50">
            {t(`playback.modes.${mode}.body`)}
          </p>
        )}

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-white/55">{t("playback.disclaimer")}</p>
      </div>
    </motion.section>
  );
}

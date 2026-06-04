import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { AudioLibraryClip } from "../../../lib/types";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface InterventionAudioPlayerProps {
  clip: AudioLibraryClip;
}

export function InterventionAudioPlayer({ clip }: InterventionAudioPlayerProps) {
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
    const audio = audioRef.current;
    if (audio) {
      audio.load();
    }
  }, [clip.id, clip.audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setError("Could not play this clip."));
    } else {
      audio.pause();
    }
  }, []);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => setError("Could not play this clip."));
  }, []);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-3">
      <audio
        ref={audioRef}
        src={clip.audioUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
        onError={() => setError("Audio file unavailable. Try another clip.")}
      />

      <div>
        <p className="text-sm font-semibold text-gray-900">{clip.title}</p>
        {clip.species && (
          <p className="text-xs text-gray-500 mt-0.5">{clip.species} · verified sample</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={onSeek}
          className="flex-1 h-2 accent-teal-600 cursor-pointer"
          aria-label="Playback progress"
        />
        <span className="text-xs text-gray-500 tabular-nums shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-teal-100 overflow-hidden">
        <div
          className="h-full bg-teal-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-300 text-teal-800 text-sm font-semibold hover:bg-teal-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Replay
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  POSE_FPS,
  cageVideoUrl,
  poseEndSeconds,
  type ClipPose,
  type PosePoint,
  type PoseTrack,
} from "../../../lib/playbackPose";

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [1, 6],
];

const TRACK_COLOR: Record<PoseTrack["side"], string> = {
  left: "#fb923c",
  right: "#2dd4bf",
};

function formatScore(value: number | null, missing: string) {
  if (value == null || !Number.isFinite(value)) return missing;
  const text = value.toFixed(1);
  return value > 0 ? `+${text}` : text;
}

function pointCount(frame: PosePoint[]) {
  return frame.reduce((count, point) => count + (point ? 1 : 0), 0);
}

function heldFrame(frames: PosePoint[][], index: number): PosePoint[] {
  const start = Math.max(0, index - 10);
  for (let i = index; i >= start; i -= 1) {
    if (pointCount(frames[i]) >= 2) return frames[i];
  }
  return frames[index] ?? [];
}

function sampleTrack(track: PoseTrack, time: number): PosePoint[] {
  const frames = track.frames;
  if (!frames.length) return [];
  const pos = Math.min(Math.max(time * POSE_FPS, 0), frames.length - 1);
  const i0 = Math.floor(pos);
  const i1 = Math.min(frames.length - 1, i0 + 1);
  const a = frames[i0];
  const b = frames[i1];
  if (pointCount(a) >= 2 && pointCount(b) >= 2) {
    const mix = pos - i0;
    return a.map((start, index) => {
      const end = b[index];
      if (!start) return end;
      if (!end) return start;
      return [start[0] + (end[0] - start[0]) * mix, start[1] + (end[1] - start[1]) * mix];
    });
  }
  return heldFrame(frames, i0);
}

function birdCrop(pose: ClipPose, frameWidth: number, frameHeight: number) {
  // Birds sit in the upper half. Follow the keypoints only when one is tracked lower,
  // so a bad cluster cannot crop the bird out of the picture.
  let bottom = frameHeight * 0.46;
  for (const track of pose.tracks) {
    for (const frame of track.frames) {
      for (const point of frame) {
        if (point) bottom = Math.max(bottom, point[1] + 70);
      }
    }
  }
  return { x: 0, y: 0, w: frameWidth, h: Math.min(frameHeight, bottom) };
}

function drawPose(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  pose: ClipPose,
  time: number,
  width: number,
  height: number,
  frameWidth: number,
  frameHeight: number,
) {
  const crop = birdCrop(pose, frameWidth, frameHeight);
  ctx.clearRect(0, 0, width, height);
  if (video.readyState >= 2) {
    ctx.drawImage(video, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#1c1917";
    ctx.fillRect(0, 0, width, height);
  }
  const scaleX = width / crop.w;
  const scaleY = height / crop.h;

  for (const track of pose.tracks) {
    const raw = sampleTrack(track, time);
    const placed = raw.filter((point): point is [number, number] => point != null);
    if (placed.length < 2) continue;
    const xs = placed.map((point) => point[0]);
    const ys = placed.map((point) => point[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    if (span < 70) continue;
    const pts = raw.map((point) =>
      point ? [(point[0] - crop.x) * scaleX, (point[1] - crop.y) * scaleY] : null,
    );
    const color = TRACK_COLOR[track.side] ?? "#ffffff";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const stroke = () => {
      ctx.beginPath();
      for (const [from, to] of EDGES) {
        const a = pts[from];
        const b = pts[to];
        if (!a || !b) continue;
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
    };
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 6;
    stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    stroke();
    for (const point of pts) {
      if (!point) continue;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(point[0], point[1], 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point[0], point[1], 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

interface PlaybackPoseViewProps {
  clipId: string;
  pose: ClipPose;
  time: number;
  playing: boolean;
  onTime: (time: number) => void;
  onEnded: () => void;
  onSeek: (time: number) => void;
}

export function PlaybackPoseView({
  clipId,
  pose,
  time,
  playing,
  onTime,
  onEnded,
  onSeek,
}: PlaybackPoseViewProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 720, height: 1280 });
  const [videoTick, setVideoTick] = useState(0);
  const end = poseEndSeconds(pose);
  const missing = t("playback.pose.missing");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - time) > 0.35) {
      video.currentTime = time;
    }
  }, [time, clipId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const video = videoRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx || !video) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPose(ctx, video, pose, time, width, height, frameSize.width, frameSize.height);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [pose, time, frameSize, videoTick]);

  const crop = birdCrop(pose, frameSize.width, frameSize.height);

  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/40 p-3 sm:p-4">
      <p className="text-sm font-medium text-stone-900">{t("playback.pose.title")}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">{t("playback.pose.note")}</p>
      <div className="mt-3 flex justify-center">
        <div className="relative w-full max-w-xl">
          <video
            ref={videoRef}
            src={cageVideoUrl(clipId)}
            className="pointer-events-none absolute h-8 w-8 opacity-0"
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              setFrameSize({
                width: video.videoWidth || 720,
                height: video.videoHeight || 1280,
              });
              if (Math.abs(video.currentTime - time) > 0.2) {
                video.currentTime = time;
              }
            }}
            onSeeked={() => setVideoTick((tick) => tick + 1)}
            onLoadedData={() => setVideoTick((tick) => tick + 1)}
            onTimeUpdate={(event) => onTime(event.currentTarget.currentTime)}
            onEnded={onEnded}
          />
          <canvas
            ref={canvasRef}
            className="block w-full rounded-xl bg-stone-900"
            style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
            role="img"
            aria-label={t("playback.pose.canvas")}
          />
        </div>
      </div>
      <label className="mt-3 block">
        <span className="text-xs text-stone-500">{t("playback.pose.progress")}</span>
        <input
          type="range"
          min={0}
          max={end}
          step={0.1}
          value={Math.min(Math.max(time, 0), end)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="mt-1 w-full h-1.5 accent-orange-500 cursor-pointer"
          aria-label={t("playback.pose.progress")}
        />
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {pose.tracks.map((track) => (
          <div key={track.side} className="rounded-xl bg-white border border-orange-100 px-3 py-2">
            <p className="text-xs font-medium" style={{ color: TRACK_COLOR[track.side] }}>
              {t(`playback.pose.sides.${track.side}`)}
            </p>
            <p className="mt-1 text-sm text-stone-700 tabular-nums">
              {t("playback.pose.movement")} {formatScore(track.miZ, missing)}
              <span className="text-stone-300"> · </span>
              {t("playback.pose.posture")} {formatScore(track.bpZ, missing)}
              <span className="text-stone-300"> · </span>
              {t("playback.pose.direction")} {formatScore(track.dZ, missing)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-400">{t("playback.pose.scale")}</p>
    </div>
  );
}

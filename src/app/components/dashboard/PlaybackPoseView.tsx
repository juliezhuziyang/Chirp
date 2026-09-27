import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  POSE_FPS,
  POSE_ONSET_S,
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
  left: "#e07a3d",
  right: "#0f766e",
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

function clipBounds(pose: ClipPose) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const track of pose.tracks) {
    for (const frame of track.frames) {
      for (const point of frame) {
        if (!point) continue;
        minX = Math.min(minX, point[0]);
        minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]);
        maxY = Math.max(maxY, point[1]);
      }
    }
  }
  if (!Number.isFinite(minX)) return { x0: 0, y0: 0, x1: 1, y1: 1 };
  const pad = 40;
  let x0 = minX - pad;
  let y0 = minY - pad;
  let x1 = maxX + pad;
  let y1 = maxY + pad;
  const minSpan = 180;
  if (x1 - x0 < minSpan) {
    const mid = (x0 + x1) / 2;
    x0 = mid - minSpan / 2;
    x1 = mid + minSpan / 2;
  }
  if (y1 - y0 < minSpan) {
    const mid = (y0 + y1) / 2;
    y0 = mid - minSpan / 2;
    y1 = mid + minSpan / 2;
  }
  return { x0, y0, x1, y1 };
}

function toCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: { x0: number; y0: number; x1: number; y1: number },
) {
  return [
    ((x - bounds.x0) / (bounds.x1 - bounds.x0)) * width,
    ((y - bounds.y0) / (bounds.y1 - bounds.y0)) * height,
  ];
}

function drawPose(ctx: CanvasRenderingContext2D, pose: ClipPose, time: number, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffaf5";
  ctx.fillRect(0, 0, width, height);

  const bounds = clipBounds(pose);
  for (const track of pose.tracks) {
    const pts = sampleTrack(track, time).map((point) =>
      point ? toCanvas(point[0], point[1], width, height, bounds) : null,
    );
    const color = TRACK_COLOR[track.side] ?? "#78716c";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const [from, to] of EDGES) {
      const a = pts[from];
      const b = pts[to];
      if (!a || !b) continue;
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    for (const point of pts) {
      if (!point) continue;
      ctx.beginPath();
      ctx.arc(point[0], point[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

interface PlaybackPoseViewProps {
  pose: ClipPose;
  time: number;
  onSeek: (time: number) => void;
}

export function PlaybackPoseView({ pose, time, onSeek }: PlaybackPoseViewProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const end = poseEndSeconds(pose);
  const missing = t("playback.pose.missing");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPose(ctx, pose, time, width, height);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [pose, time]);

  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/40 p-3 sm:p-4">
      <p className="text-sm font-medium text-stone-900">{t("playback.pose.title")}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">{t("playback.pose.note")}</p>
      <canvas
        ref={canvasRef}
        className="mt-3 h-52 w-full rounded-xl border border-orange-100 bg-[#fffaf5] sm:h-64"
        role="img"
        aria-label={t("playback.pose.canvas")}
      />
      <label className="mt-3 block">
        <span className="text-xs text-stone-500">{t("playback.pose.progress")}</span>
        <input
          type="range"
          min={POSE_ONSET_S}
          max={end}
          step={0.1}
          value={Math.min(Math.max(time, POSE_ONSET_S), end)}
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

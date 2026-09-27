import { useTranslation } from "react-i18next";
import type { ClipPose, PoseTrack } from "../../../lib/playbackPose";

const TRACK_COLOR: Record<PoseTrack["side"], string> = {
  left: "#fb923c",
  right: "#2dd4bf",
};

function formatScore(value: number | null, missing: string) {
  if (value == null || !Number.isFinite(value)) return missing;
  const text = value.toFixed(1);
  return value > 0 ? `+${text}` : text;
}

interface PlaybackPoseViewProps {
  pose: ClipPose;
}

export function PlaybackPoseView({ pose }: PlaybackPoseViewProps) {
  const { t } = useTranslation();
  const missing = t("playback.pose.missing");

  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/40 p-3 sm:p-4">
      <p className="text-sm font-medium text-stone-900">{t("playback.pose.title")}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">{t("playback.pose.note")}</p>
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

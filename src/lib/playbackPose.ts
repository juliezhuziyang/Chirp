import poseData from "../data/playbackPose.json";

/** Cage clip rate. Frame 0 is two seconds before the call. */
export const POSE_FPS = 10;
export const POSE_ONSET_S = 2;

export type PoseSide = "left" | "right";
export type PosePoint = [number, number] | null;

export interface PoseTrack {
  side: PoseSide;
  miZ: number | null;
  bpZ: number | null;
  dZ: number | null;
  frames: PosePoint[][];
}

export interface ClipPose {
  tracks: PoseTrack[];
}

const POSE = poseData as Record<string, ClipPose>;

export function poseForClip(id: string): ClipPose | null {
  return POSE[id] ?? null;
}

export function poseEndSeconds(pose: ClipPose): number {
  const frames = Math.max(...pose.tracks.map((track) => track.frames.length), 1);
  return (frames - 1) / POSE_FPS;
}

export function cageVideoUrl(id: string): string {
  return `/video/cage/${id}.mp4`;
}

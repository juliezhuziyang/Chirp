import poseData from "../data/playbackPose.json";

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


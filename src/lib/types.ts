export type BirdSex = "male" | "female" | "unsure";

export interface BirdProfile {
  name: string | null;
  species: string | null;
  sex: BirdSex | null;
  ageMonths: number | null;
}

export interface UserAvatar {
  type: "preset" | "custom";
  presetId: string | null;
  customUrl: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  ownsParrot: boolean | null;
  bird: BirdProfile | null;
  needs: string[];
  avatar: UserAvatar;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  ownsParrot: boolean;
  birdName?: string;
  species?: string;
  sex?: BirdSex;
  ageMonths?: number;
  needs: string[];
}

export type AnalysisStatus =
  | "idle"
  | "recording"
  | "uploading"
  | "analyzing"
  | "complete"
  | "error";

export type FriendRelationshipStatus =
  | "none"
  | "friends"
  | "pending_sent"
  | "pending_received";

export interface MlEmotionScores {
  valence: number;
  arousal: number;
  socialEngagement: number;
}

export interface MlAnalyzeResponse {
  birdDetected: boolean;
  birdProbability?: number;
  scores?: MlEmotionScores;
  message?: string;
  error?: string;
}

export interface PublicUserSummary {
  id: string;
  name: string;
  avatar: UserAvatar;
  birdName: string | null;
  birdSpecies: string | null;
  birdAgeMonths: number | null;
  ownsParrot: boolean | null;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: UserAvatar;
  birdName: string | null;
  text: string;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
  comments: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: UserAvatar;
  text: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  fromAvatar: UserAvatar;
  createdAt: string;
  seen?: boolean;
}

export interface FriendEntry {
  userId: string;
  name: string;
  avatar: UserAvatar;
  birdName: string | null;
  since: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: UserAvatar;
  date: string;
  createdAt: string;
  birdName: string;
  message: string;
  emotion: string | null;
  type?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export type AudioEmotionLabel = "happy" | "socially_engaged" | "positive_vocalization";
export type AudioValidationStatus = "verified" | "pending" | "rejected";

export interface AudioLibraryClip {
  id: string;
  title: string;
  description: string;
  emotion_label: AudioEmotionLabel;
  validation_status: AudioValidationStatus;
  audioUrl: string;
  species: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

import { getStoredToken } from "./api";
import { edgeFunctionHeaders, SUPABASE_FUNCTIONS_BASE } from "./supabaseApi";
import type {
  ActivityItem,
  ChatMessage,
  CommunityPost,
  FriendEntry,
  FriendRelationshipStatus,
  FriendRequest,
  PublicUserSummary,
} from "./types";

const API_BASE = SUPABASE_FUNCTIONS_BASE;

async function socialRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...edgeFunctionHeaders(true, getStoredToken()),
      ...(options.headers as Record<string, string>),
    },
  });
  const text = await response.text();
  let data = {} as T & { error?: string };
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {} as T & { error?: string };
  }
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${response.status})`);
  }
  return data;
}

export function fetchCommunityPosts() {
  return socialRequest<{ posts: CommunityPost[] }>("/community/posts");
}

export function createCommunityPost(body: {
  text: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
}) {
  return socialRequest<{ post: CommunityPost }>("/community/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function addPostComment(postId: string, text: string) {
  return socialRequest<{ comment: unknown }>(`/community/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function fetchFriendsState() {
  return socialRequest<{
    friends: FriendEntry[];
    incoming: FriendRequest[];
    outgoingCount: number;
    pendingCount: number;
    unreadMessageCount: number;
    unviewedRequestCount: number;
    hasFriendsNotification: boolean;
  }>("/friends");
}

export function markFriendRequestsSeen() {
  return socialRequest<{ success: boolean }>("/friends/mark-requests-seen", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function fetchFriendRelationship(otherUserId: string) {
  return socialRequest<{ status: FriendRelationshipStatus }>(
    `/friends/relationship/${otherUserId}`,
  );
}

export function sendFriendRequest(toUserId: string) {
  return socialRequest<{ success: boolean }>("/friends/request", {
    method: "POST",
    body: JSON.stringify({ toUserId }),
  });
}

export function respondFriendRequest(requestId: string, accept: boolean) {
  return socialRequest<{ success: boolean }>("/friends/respond", {
    method: "POST",
    body: JSON.stringify({ requestId, accept }),
  });
}

export function fetchActivity() {
  return socialRequest<{ activity: ActivityItem[] }>("/friends/activity");
}

export function logEmotionActivity(emotion: string) {
  return socialRequest<{ success: boolean }>("/friends/activity", {
    method: "POST",
    body: JSON.stringify({ type: "emotion_analysis", emotion }),
  });
}

export function fetchMessages(otherUserId: string) {
  return socialRequest<{ messages: ChatMessage[] }>(`/friends/messages/${otherUserId}`);
}

export function sendChatMessage(otherUserId: string, text: string) {
  return socialRequest<{ message: ChatMessage }>(`/friends/messages/${otherUserId}`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function fetchPublicProfile(userId: string) {
  return socialRequest<{ profile: PublicUserSummary }>(`/users/${userId}/public`);
}

export function submitContribution(payload: {
  emotions: string[];
  videoBase64?: string;
  videoFilename?: string;
  videoMime?: string;
}) {
  return socialRequest<{ success: boolean }>("/contribute", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitFeedback(text: string) {
  return socialRequest<{ success: boolean }>("/feedback", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

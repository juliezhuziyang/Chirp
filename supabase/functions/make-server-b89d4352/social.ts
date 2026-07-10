import * as kv from "./kv_store.ts";
import * as auth from "./auth.ts";
import { sendResendEmail } from "./mail.ts";
import type { UserAvatar } from "./avatars.ts";

const COMMUNITY_KEY = "community:posts";
const FEEDBACK_KEY = "feedback:entries";
const ANALYSIS_FEEDBACK_KEY = "feedback:analysis";
const ACTIVITY_KEY = "activity:feed";

function friendsKey(userId: string) {
  return `friends:${userId}`;
}

function messagesKey(a: string, b: string) {
  const sorted = [a, b].sort();
  return `messages:${sorted[0]}:${sorted[1]}`;
}

function toPublicUser(user: auth.SafeUser) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    birdName: user.bird?.name ?? null,
    birdSpecies: user.bird?.species ?? null,
    birdAgeMonths: user.bird?.ageMonths ?? null,
    ownsParrot: user.ownsParrot,
  };
}

interface IncomingRequest {
  id: string;
  fromUserId: string;
  createdAt: string;
  seen?: boolean;
}

interface FriendsData {
  friendIds: string[];
  incoming: IncomingRequest[];
  outgoing: { id: string; toUserId: string; createdAt: string }[];
  /** ISO timestamp of last read message per friend user id */
  lastReadAt?: Record<string, string>;
}

async function getFriendsData(userId: string): Promise<FriendsData> {
  const data = (await kv.get(friendsKey(userId))) as FriendsData | null;
  return data ?? { friendIds: [], incoming: [], outgoing: [] };
}

async function saveFriendsData(userId: string, data: FriendsData) {
  await kv.set(friendsKey(userId), data);
}

async function countUnreadMessages(userId: string, friendIds: string[]): Promise<number> {
  const data = await getFriendsData(userId);
  const lastRead = data.lastReadAt ?? {};
  let total = 0;
  for (const friendId of friendIds) {
    const key = messagesKey(userId, friendId);
    const msgs = (await kv.get(key)) as { senderId: string; createdAt: string }[] | null;
    const list = Array.isArray(msgs) ? msgs : [];
    const last = lastRead[friendId];
    for (const msg of list) {
      if (msg.senderId !== userId && (!last || msg.createdAt > last)) {
        total++;
      }
    }
  }
  return total;
}

export async function markMessagesRead(userId: string, otherUserId: string) {
  const data = await getFriendsData(userId);
  data.lastReadAt = {
    ...(data.lastReadAt ?? {}),
    [otherUserId]: new Date().toISOString(),
  };
  await saveFriendsData(userId, data);
}

export async function markFriendRequestsSeen(userId: string) {
  const data = await getFriendsData(userId);
  let changed = false;
  for (const req of data.incoming) {
    if (req.seen !== true) {
      req.seen = true;
      changed = true;
    }
  }
  if (changed) {
    await saveFriendsData(userId, data);
  }
  return { success: true };
}

function countUnviewedRequests(data: FriendsData): number {
  return data.incoming.filter((r) => r.seen !== true).length;
}

export async function getCommunityPosts() {
  const posts = (await kv.get(COMMUNITY_KEY)) as unknown[] | null;
  return Array.isArray(posts) ? posts : [];
}

export async function createCommunityPost(
  userId: string,
  body: { text: string; imageUrl?: string | null; audioUrl?: string | null },
) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const posts = await getCommunityPosts();
  const post = {
    id: crypto.randomUUID(),
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    birdName: user.bird?.name ?? null,
    text: body.text?.trim() || "",
    imageUrl: body.imageUrl ?? null,
    audioUrl: body.audioUrl ?? null,
    createdAt: new Date().toISOString(),
    comments: [] as unknown[],
  };
  posts.unshift(post);
  await kv.set(COMMUNITY_KEY, posts.slice(0, 200));

  const attachment = body.audioUrl
    ? " with an audio clip"
    : body.imageUrl
      ? " with a photo"
      : "";
  await recordActivity(userId, {
    type: "community_post",
    message: `${user.name} shared a post in Community${attachment}${
      user.bird?.name ? ` · ${user.bird.name}` : ""
    }.`,
  });

  return post;
}

export async function addComment(
  userId: string,
  postId: string,
  text: string,
) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  const posts = await getCommunityPosts();
  const idx = posts.findIndex((p: { id: string }) => p.id === postId);
  if (idx < 0) throw new Error("POST_NOT_FOUND");

  const post = posts[idx] as {
    id: string;
    comments: unknown[];
  };
  const comment = {
    id: crypto.randomUUID(),
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  post.comments = post.comments || [];
  (post.comments as unknown[]).push(comment);
  posts[idx] = post;
  await kv.set(COMMUNITY_KEY, posts);
  return comment;
}

export type FriendRelationshipStatus =
  | "none"
  | "friends"
  | "pending_sent"
  | "pending_received";

export async function getFriendRelationship(
  viewerId: string,
  targetUserId: string,
): Promise<{ status: FriendRelationshipStatus }> {
  if (viewerId === targetUserId) {
    return { status: "none" };
  }
  const viewer = await getFriendsData(viewerId);
  if (viewer.friendIds.includes(targetUserId)) {
    return { status: "friends" };
  }
  if (viewer.outgoing.some((r) => r.toUserId === targetUserId)) {
    return { status: "pending_sent" };
  }
  if (viewer.incoming.some((r) => r.fromUserId === targetUserId)) {
    return { status: "pending_received" };
  }
  return { status: "none" };
}

export async function getFriendsState(userId: string) {
  const data = await getFriendsData(userId);
  const friends = [];
  for (const fid of data.friendIds) {
    const u = await auth.getUserById(fid);
    if (u) {
      friends.push({
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        birdName: u.bird?.name ?? null,
        since: new Date().toISOString(),
      });
    }
  }

  const incoming = [];
  for (const req of data.incoming) {
    const u = await auth.getUserById(req.fromUserId);
    if (u) {
      incoming.push({
        id: req.id,
        fromUserId: u.id,
        toUserId: userId,
        fromName: u.name,
        fromAvatar: u.avatar,
        createdAt: req.createdAt,
        seen: req.seen === true,
      });
    }
  }

  const unreadMessageCount = await countUnreadMessages(userId, data.friendIds);
  const unviewedRequestCount = countUnviewedRequests(data);

  return {
    friends,
    incoming,
    outgoingCount: data.outgoing.length,
    pendingCount: data.incoming.length,
    unreadMessageCount,
    unviewedRequestCount,
    hasFriendsNotification: unreadMessageCount > 0 || unviewedRequestCount > 0,
  };
}

export async function sendFriendRequest(fromId: string, toId: string) {
  if (fromId === toId) throw new Error("INVALID_REQUEST");
  const toData = await getFriendsData(toId);
  if (toData.friendIds.includes(fromId)) throw new Error("ALREADY_FRIENDS");
  if (toData.incoming.some((r) => r.fromUserId === fromId)) {
    throw new Error("REQUEST_EXISTS");
  }

  const fromData = await getFriendsData(fromId);
  const reqId = crypto.randomUUID();
  toData.incoming.push({
    id: reqId,
    fromUserId: fromId,
    createdAt: new Date().toISOString(),
    seen: false,
  });
  fromData.outgoing.push({ id: reqId, toUserId: toId, createdAt: new Date().toISOString() });
  await saveFriendsData(toId, toData);
  await saveFriendsData(fromId, fromData);
  return { success: true };
}

export async function respondFriendRequest(
  userId: string,
  requestId: string,
  accept: boolean,
) {
  const data = await getFriendsData(userId);
  const req = data.incoming.find((r) => r.id === requestId);
  if (!req) throw new Error("REQUEST_NOT_FOUND");

  data.incoming = data.incoming.filter((r) => r.id !== requestId);
  const other = await getFriendsData(req.fromUserId);
  other.outgoing = other.outgoing.filter((r) => r.id !== requestId);

  if (accept) {
    if (!data.friendIds.includes(req.fromUserId)) {
      data.friendIds.push(req.fromUserId);
    }
    if (!other.friendIds.includes(userId)) {
      other.friendIds.push(userId);
    }
  }

  await saveFriendsData(userId, data);
  await saveFriendsData(req.fromUserId, other);

  if (accept) {
    const accepter = await auth.getUserById(userId);
    const requester = await auth.getUserById(req.fromUserId);
    if (accepter && requester) {
      await recordActivity(userId, {
        type: "friend_connected",
        message: `${accepter.name} and ${requester.name} are now friends.`,
      });
    }
  }

  return { success: true, accepted: accept };
}

export async function getActivityFeed(userId: string) {
  const global = (await kv.get(ACTIVITY_KEY)) as StoredActivity[] | null;
  const all = Array.isArray(global) ? global : [];
  const data = await getFriendsData(userId);
  const visibleUserIds = new Set([...data.friendIds, userId]);

  const sorted = [...all].sort(
    (a, b) =>
      new Date(b.createdAt ?? b.date ?? 0).getTime() -
      new Date(a.createdAt ?? a.date ?? 0).getTime(),
  );

  const enriched: EnrichedActivity[] = [];
  for (const raw of sorted) {
    if (!raw.userId || !visibleUserIds.has(raw.userId)) continue;
    const user = await auth.getUserById(raw.userId);
    if (!user) continue;

    const createdAt = raw.createdAt ?? (raw.date ? `${raw.date}T12:00:00.000Z` : new Date().toISOString());
    enriched.push({
      id: raw.id,
      userId: raw.userId,
      userName: user.name,
      userAvatar: user.avatar,
      birdName: user.bird?.name ?? raw.birdName ?? "their bird",
      message: raw.message,
      emotion: raw.emotion ?? null,
      type: raw.type ?? "unknown",
      createdAt,
      date: createdAt.slice(0, 10),
    });
    if (enriched.length >= 5) break;
  }

  return enriched;
}

type ActivityType =
  | "emotion_analysis"
  | "community_post"
  | "friend_connected"
  | "contribution";

interface StoredActivity {
  id: string;
  userId: string;
  userName?: string;
  friendName?: string;
  birdName: string;
  message: string;
  emotion: string | null;
  type?: ActivityType;
  createdAt?: string;
  date?: string;
}

export interface EnrichedActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: UserAvatar;
  birdName: string;
  message: string;
  emotion: string | null;
  type: string;
  createdAt: string;
  date: string;
}

export async function recordActivity(
  userId: string,
  params: {
    type: ActivityType;
    message?: string;
    emotion?: string | null;
  },
) {
  const user = await auth.getUserById(userId);
  if (!user) return null;

  const birdName = user.bird?.name ?? "their bird";
  let message = params.message?.trim() ?? "";

  if (!message) {
    switch (params.type) {
      case "emotion_analysis":
        message = `${user.name} analyzed ${birdName}'s vocalization${
          params.emotion ? ` — ${params.emotion}` : ""
        }.`;
        break;
      case "community_post":
        message = `${user.name} posted in Community · ${birdName}.`;
        break;
      case "friend_connected":
        message = `${user.name} connected with a new friend.`;
        break;
      case "contribution":
        message = `${user.name} contributed training data for ${birdName}.`;
        break;
    }
  }

  return addActivityEntry({
    userId,
    userName: user.name,
    birdName,
    message,
    emotion: params.emotion ?? null,
    type: params.type,
  });
}

async function addActivityEntry(item: {
  userId: string;
  userName: string;
  birdName: string;
  message: string;
  emotion: string | null;
  type: ActivityType;
}) {
  const global = (await kv.get(ACTIVITY_KEY)) as StoredActivity[] | null;
  const all = Array.isArray(global) ? global : [];
  const createdAt = new Date().toISOString();
  const entry: StoredActivity = {
    id: crypto.randomUUID(),
    userId: item.userId,
    userName: item.userName,
    birdName: item.birdName,
    message: item.message,
    emotion: item.emotion,
    type: item.type,
    createdAt,
    date: createdAt.slice(0, 10),
  };
  all.unshift(entry);
  await kv.set(ACTIVITY_KEY, all.slice(0, 500));
  return entry;
}

/** @deprecated use recordActivity */
export async function addActivity(item: {
  userId: string;
  friendName: string;
  birdName: string;
  message: string;
  emotion: string | null;
}) {
  return addActivityEntry({
    userId: item.userId,
    userName: item.friendName,
    birdName: item.birdName,
    message: item.message,
    emotion: item.emotion,
    type: "emotion_analysis",
  });
}

export async function getMessages(userId: string, otherUserId: string) {
  const key = messagesKey(userId, otherUserId);
  const msgs = (await kv.get(key)) as unknown[] | null;
  return Array.isArray(msgs) ? msgs : [];
}

export async function getMessagesAndMarkRead(userId: string, otherUserId: string) {
  const list = await getMessages(userId, otherUserId);
  await markMessagesRead(userId, otherUserId);
  return list;
}

export async function sendMessage(userId: string, otherUserId: string, text: string) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  const key = messagesKey(userId, otherUserId);
  const msgs = await getMessages(userId, otherUserId);
  const msg = {
    id: crypto.randomUUID(),
    senderId: userId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  msgs.push(msg);
  await kv.set(key, msgs.slice(-500));
  return msg;
}

export async function getPublicProfile(userId: string) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  return toPublicUser(user);
}

export async function saveFeedback(userId: string, text: string) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  const entries = (await kv.get(FEEDBACK_KEY)) as unknown[] | null;
  const all = Array.isArray(entries) ? entries : [];
  const entry = {
    id: crypto.randomUUID(),
    userId,
    userName: user.name,
    userEmail: user.email,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  all.unshift(entry);
  await kv.set(FEEDBACK_KEY, all.slice(0, 500));

  try {
    await sendResendEmail({
      subject: "Chirp Feedback",
      html: `<p><strong>${user.name}</strong> (${user.email})</p><p>${entry.text}</p>`,
    });
  } catch (e) {
    console.error("Feedback email failed:", e);
  }

  return entry;
}

export async function saveAnalysisFeedback(
  userId: string,
  data: {
    accurate: boolean;
    predictedState: string;
    scores: { valence: number; arousal: number; socialEngagement: number };
    birdProbability?: number;
    correctedEmotions?: string[];
    behaviorNotes?: string;
  },
) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const entry = {
    id: crypto.randomUUID(),
    userId,
    userName: user.name,
    userEmail: user.email,
    birdName: user.bird?.name ?? "—",
    birdSpecies: user.bird?.species ?? "—",
    accurate: data.accurate,
    predictedState: data.predictedState,
    scores: data.scores,
    birdProbability: data.birdProbability ?? null,
    correctedEmotions: data.correctedEmotions ?? [],
    behaviorNotes: data.behaviorNotes?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  const entries = (await kv.get(ANALYSIS_FEEDBACK_KEY)) as unknown[] | null;
  const all = Array.isArray(entries) ? entries : [];
  all.unshift(entry);
  await kv.set(ANALYSIS_FEEDBACK_KEY, all.slice(0, 500));

  const accuracyLabel = data.accurate ? "Confirmed accurate" : "User correction";
  const emotionBlock = data.accurate
    ? ""
    : `<p><strong>User-selected emotions:</strong> ${
        (data.correctedEmotions ?? []).join(", ") || "—"
      }</p>
       <p><strong>Behavior notes:</strong> ${entry.behaviorNotes || "—"}</p>`;

  try {
    await sendResendEmail({
      subject: `Chirp Analysis Feedback — ${accuracyLabel}`,
      html: `
        <h2>Analysis Feedback</h2>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Bird:</strong> ${entry.birdName} (${entry.birdSpecies})</p>
        <p><strong>Result accurate:</strong> ${data.accurate ? "Yes" : "No"}</p>
        <p><strong>Predicted state:</strong> ${data.predictedState}</p>
        <p><strong>Scores:</strong> Valence ${data.scores.valence.toFixed(2)}, Arousal ${data.scores.arousal.toFixed(2)}, Social ${data.scores.socialEngagement.toFixed(2)}</p>
        ${
          data.birdProbability != null
            ? `<p><strong>Bird detection confidence:</strong> ${Math.round(data.birdProbability * 100)}%</p>`
            : ""
        }
        ${emotionBlock}
      `,
    });
  } catch (e) {
    console.error("Analysis feedback email failed:", e);
  }

  return entry;
}

export async function submitContribution(
  userId: string,
  data: {
    emotions: string[];
    videoBase64?: string;
    videoFilename?: string;
    videoMime?: string;
  },
) {
  const user = await auth.getUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const record = {
    id: crypto.randomUUID(),
    userId,
    userName: user.name,
    userEmail: user.email,
    birdName: user.bird?.name ?? "—",
    emotions: data.emotions,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`contribution:${record.id}`, record);

  const attachments = [];
  if (data.videoBase64 && data.videoFilename) {
    attachments.push({
      filename: data.videoFilename,
      content: data.videoBase64,
    });
  }

  try {
    await sendResendEmail({
      subject: `Chirp Contribution from ${user.name}`,
      html: `
        <h2>New model contribution</h2>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Bird:</strong> ${record.birdName}</p>
        <p><strong>Emotions:</strong> ${data.emotions.join(", ")}</p>
      `,
      attachments: attachments.length ? attachments : undefined,
    });
  } catch (e) {
    console.error("Contribution email failed:", e);
    throw new Error("EMAIL_FAILED");
  }

  await recordActivity(userId, {
    type: "contribution",
    message: `${user.name} contributed model training data for ${record.birdName}.`,
  });

  return record;
}

export { toPublicUser };

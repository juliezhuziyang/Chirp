import { defaultAvatar } from "./avatars";
import type { BirdProfile, UserAvatar, UserProfile } from "./types";

const USERS_KEY = "chirp_local_users";
const SESSION_KEY = "chirp_local_session";

interface StoredUser extends UserProfile {
  passwordHash: string;
}

function loadUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password: string): string {
  return btoa(`chirp:${password}`);
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function stripPassword(user: StoredUser): UserProfile {
  const { passwordHash: _, ...safe } = user;
  if (!safe.avatar) safe.avatar = defaultAvatar(safe.id);
  if (safe.bird && safe.bird.name === undefined) {
    safe.bird = { ...safe.bird, name: null };
  }
  return safe;
}

export function localRegister(
  email: string,
  password: string,
  name: string,
): { user: UserProfile; token: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (Object.values(users).some((u) => u.email === normalizedEmail)) {
    throw new Error("EMAIL_EXISTS");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const user: StoredUser = {
    id,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: hashPassword(password),
    onboardingCompleted: false,
    ownsParrot: null,
    bird: null,
    needs: [],
    avatar: defaultAvatar(id),
    createdAt: now,
    updatedAt: now,
  };

  users[id] = user;
  saveUsers(users);

  const token = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, userId: id }));
  return { user: stripPassword(user), token };
}

export function localLogin(
  email: string,
  password: string,
): { user: UserProfile; token: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = Object.values(users).find((u) => u.email === normalizedEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, userId: user.id }));
  return { user: stripPassword(user), token };
}

export function localGetUser(token: string): UserProfile | null {
  const sessionRaw = localStorage.getItem(SESSION_KEY);
  if (!sessionRaw) return null;
  try {
    const session = JSON.parse(sessionRaw);
    if (session.token !== token) return null;
    const users = loadUsers();
    const user = users[session.userId];
    return user ? stripPassword(user) : null;
  } catch {
    return null;
  }
}

export function localLogout() {
  localStorage.removeItem(SESSION_KEY);
}

export function localUpdateProfile(
  userId: string,
  updates: Partial<
    Pick<UserProfile, "name" | "onboardingCompleted" | "ownsParrot" | "bird" | "needs" | "avatar">
  >,
): UserProfile {
  const users = loadUsers();
  const user = users[userId];
  if (!user) throw new Error("USER_NOT_FOUND");

  const patch = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  ) as typeof updates;

  const updated: StoredUser = {
    ...user,
    ...patch,
    bird: updates.bird !== undefined ? updates.bird : user.bird,
    needs: updates.needs !== undefined ? updates.needs : user.needs,
    avatar: updates.avatar !== undefined ? updates.avatar : (user.avatar ?? defaultAvatar(userId)),
    onboardingCompleted: user.onboardingCompleted,
    updatedAt: new Date().toISOString(),
  };

  users[userId] = updated;
  saveUsers(users);
  return stripPassword(updated);
}

export function formatAgeLabel(months: number): string {
  if (months < 12) {
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }
  return `${years}y ${rem}m`;
}

export { type BirdProfile };

import * as kv from "./kv_store.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import { defaultAvatar, type UserAvatar } from "./avatars.ts";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface BirdRecord {
  name: string | null;
  species: string | null;
  sex: "male" | "female" | "unsure" | null;
  ageMonths: number | null;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  onboardingCompleted: boolean;
  ownsParrot: boolean | null;
  bird: BirdRecord | null;
  needs: string[];
  avatar: UserAvatar;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<UserRecord, "passwordHash">;

function normalizeBird(bird: BirdRecord | null | undefined): BirdRecord | null {
  if (!bird) return null;
  return {
    name: bird.name ?? null,
    species: bird.species ?? null,
    sex: bird.sex ?? null,
    ageMonths: bird.ageMonths ?? null,
  };
}

function normalizeUser(user: UserRecord): UserRecord {
  return {
    ...user,
    onboardingCompleted: user.onboardingCompleted === true,
    bird: normalizeBird(user.bird),
    avatar: user.avatar ?? defaultAvatar(user.id),
    needs: user.needs ?? [],
  };
}

/** Spreading `{ onboardingCompleted: undefined }` would clear the flag — omit undefined keys */
function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}

export interface SessionRecord {
  userId: string;
  expiresAt: string;
}

function sanitizeUser(user: UserRecord): SafeUser {
  const normalized = normalizeUser(user);
  const { passwordHash: _, ...safe } = normalized;
  return safe;
}

export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = (await kv.get(`user:${userId}`)) as UserRecord | null;
  if (!user) return null;
  return sanitizeUser(user);
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<{ user: Omit<UserRecord, "passwordHash">; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existingId = await kv.get(`user:email:${normalizedEmail}`);
  if (existingId) {
    throw new Error("EMAIL_EXISTS");
  }

  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: userId,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: await hashPassword(password),
    onboardingCompleted: false,
    ownsParrot: null,
    bird: null,
    needs: [],
    avatar: defaultAvatar(userId),
    createdAt: now,
    updatedAt: now,
  };

  await kv.mset(
    [`user:${userId}`, `user:email:${normalizedEmail}`],
    [user, userId],
  );

  const token = await createSession(userId);
  return { user: sanitizeUser(user), token };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: Omit<UserRecord, "passwordHash">; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const userId = await kv.get(`user:email:${normalizedEmail}`);
  if (!userId) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = (await kv.get(`user:${userId}`)) as UserRecord | null;
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = await createSession(userId);
  return { user: sanitizeUser(user), token };
}

async function createSession(userId: string): Promise<string> {
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  const session: SessionRecord = {
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  await kv.set(`session:${token}`, session);
  return token;
}

export async function getUserFromToken(
  token: string | undefined,
): Promise<Omit<UserRecord, "passwordHash"> | null> {
  if (!token) return null;
  const session = (await kv.get(`session:${token}`)) as SessionRecord | null;
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await kv.del(`session:${token}`);
    return null;
  }
  const user = (await kv.get(`user:${session.userId}`)) as UserRecord | null;
  if (!user) return null;
  return sanitizeUser(user);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<
    Pick<UserRecord, "name" | "onboardingCompleted" | "ownsParrot" | "bird" | "needs" | "avatar">
  >,
): Promise<SafeUser> {
  const user = (await kv.get(`user:${userId}`)) as UserRecord | null;
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const patch = omitUndefined(updates as Record<string, unknown>);
  const updated: UserRecord = normalizeUser({
    ...user,
    ...patch,
    bird: updates.bird !== undefined ? normalizeBird(updates.bird) : user.bird,
    needs: updates.needs !== undefined ? updates.needs : user.needs,
    avatar: updates.avatar !== undefined ? updates.avatar : (user.avatar ?? defaultAvatar(userId)),
    updatedAt: new Date().toISOString(),
  });

  await kv.set(`user:${userId}`, updated);
  return sanitizeUser(updated);
}

export async function logoutUser(token: string): Promise<void> {
  await kv.del(`session:${token}`);
}

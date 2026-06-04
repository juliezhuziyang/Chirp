import { AUTH_TOKEN_KEY } from "./constants";
import * as localAuth from "./localAuth";
import {
  SUPABASE_FUNCTIONS_BASE,
  edgeFunctionHeaders,
} from "./supabaseApi";
import type { BirdProfile, OnboardingData, UserAvatar, UserProfile } from "./types";

const API_BASE = SUPABASE_FUNCTIONS_BASE;

let useLocalFallback = false;

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function buildHeaders(includeSession = false): Record<string, string> {
  return edgeFunctionHeaders(includeSession, getStoredToken());
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(authenticated),
      ...(options.headers as Record<string, string>),
    },
  });

  const text = await response.text();
  let data: T & { error?: string } = {} as T & { error?: string };
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {} as T & { error?: string };
  }

  if (!response.ok) {
    const err = new Error(
      (data as { error?: string }).error || `Request failed (${response.status})`,
    ) as Error & { isApiError?: boolean };
    err.isApiError = true;
    throw err;
  }

  return data;
}

async function tryRemote<T>(fn: () => Promise<T>): Promise<T> {
  if (useLocalFallback) {
    throw new Error("LOCAL_MODE");
  }
  try {
    return await fn();
  } catch (e) {
    if ((e as Error & { isApiError?: boolean }).isApiError) {
      throw e;
    }
    useLocalFallback = true;
    throw new Error("LOCAL_MODE");
  }
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<{ user: UserProfile; token: string }> {
  try {
    const result = await tryRemote(() =>
      apiRequest<{ user: UserProfile; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),
    );
    setStoredToken(result.token);
    return result;
  } catch (e) {
    const err = e as Error;
    if (err.message !== "LOCAL_MODE") throw e;
    try {
      const result = localAuth.localRegister(email, password, name);
      setStoredToken(result.token);
      return result;
    } catch (localErr) {
      if (localErr instanceof Error && localErr.message === "EMAIL_EXISTS") {
        throw new Error("An account with this email already exists");
      }
      throw localErr;
    }
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: UserProfile; token: string }> {
  try {
    const result = await tryRemote(() =>
      apiRequest<{ user: UserProfile; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    );
    setStoredToken(result.token);
    return result;
  } catch (e) {
    if ((e as Error).message !== "LOCAL_MODE") throw e;
    const result = localAuth.localLogin(email, password);
    setStoredToken(result.token);
    return result;
  }
}

export async function logout(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token && !useLocalFallback) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: buildHeaders(true),
      });
    }
  } catch {
    /* ignore */
  }
  localAuth.localLogout();
  setStoredToken(null);
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;

  if (useLocalFallback) {
    return localAuth.localGetUser(token);
  }

  try {
    const result = await apiRequest<{ user: UserProfile }>(
      "/auth/me",
      { method: "GET" },
      true,
    );
    return result.user;
  } catch {
    useLocalFallback = true;
    return localAuth.localGetUser(token);
  }
}

export async function saveOnboarding(data: OnboardingData): Promise<UserProfile> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");

  const bird =
    data.ownsParrot
      ? {
          name: data.birdName?.trim() || null,
          species: data.species ?? null,
          sex: data.sex ?? null,
          ageMonths: data.ageMonths ?? null,
        }
      : null;

  const payload = {
    ownsParrot: data.ownsParrot,
    bird,
    needs: data.needs,
  };

  if (useLocalFallback) {
    const current = localAuth.localGetUser(token);
    if (!current) throw new Error("Not authenticated");
    return localAuth.localUpdateProfile(current.id, {
      ...payload,
      onboardingCompleted: true,
    });
  }

  try {
    const result = await apiRequest<{ user: UserProfile }>(
      "/auth/onboarding",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    );
    return result.user;
  } catch {
    useLocalFallback = true;
    const current = localAuth.localGetUser(token);
    if (!current) throw new Error("Not authenticated");
    return localAuth.localUpdateProfile(current.id, {
      ...payload,
      onboardingCompleted: true,
    });
  }
}

export async function updateProfile(updates: {
  name?: string;
  ownsParrot?: boolean | null;
  bird?: BirdProfile | null;
  needs?: string[];
  avatar?: UserAvatar;
}): Promise<UserProfile> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");

  if (useLocalFallback) {
    const current = localAuth.localGetUser(token);
    if (!current) throw new Error("Not authenticated");
    return localAuth.localUpdateProfile(current.id, updates);
  }

  try {
    const result = await apiRequest<{ user: UserProfile }>(
      "/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
      true,
    );
    return result.user;
  } catch {
    useLocalFallback = true;
    const current = localAuth.localGetUser(token);
    if (!current) throw new Error("Not authenticated");
    return localAuth.localUpdateProfile(current.id, updates);
  }
}

export function isUsingLocalStorage(): boolean {
  return useLocalFallback;
}

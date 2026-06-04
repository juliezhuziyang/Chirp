import { projectId, publicAnonKey } from "@utils/supabase/info";

/** Deployed Edge Function slug — must match supabase/functions/<this-name>/ */
export const EDGE_FUNCTION_NAME = "make-server-b89d4352";

export const SUPABASE_FUNCTIONS_BASE = `https://${projectId}.supabase.co/functions/v1/${EDGE_FUNCTION_NAME}`;

export function edgeFunctionUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SUPABASE_FUNCTIONS_BASE}${normalized}`;
}

export function edgeFunctionHeaders(includeSession = false, sessionToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${publicAnonKey}`,
  };
  if (includeSession && sessionToken) {
    headers["X-Chirp-Session"] = sessionToken;
  }
  return headers;
}

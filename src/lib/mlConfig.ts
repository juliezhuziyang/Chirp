/**
 * ML API base URL.
 * - Production: set VITE_ML_SERVICE_URL to your Railway (or other hosted) ML service URL.
 * - Development: defaults to `/api/ml`, proxied by Vite to a local or remote target.
 */
export function getMlServiceBaseUrl(): string {
  const configured = import.meta.env.VITE_ML_SERVICE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return "/api/ml";
}

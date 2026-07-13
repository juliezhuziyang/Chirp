import { convertBlobToWav } from "./audioToWav";
import { getMlServiceBaseUrl } from "./mlConfig";
import type { MlAnalyzeResponse } from "./types";

export type AnalysisStep =
  | "uploading"
  | "extracting"
  | "detecting_bird"
  | "predicting"
  | "done";

/** Render free tier can take ~30–60s to wake; analysis itself may need more time. */
const HEALTH_TIMEOUT_MS = 90_000;
const ANALYZE_TIMEOUT_MS = 180_000;

function mlBaseUrl(): string {
  return getMlServiceBaseUrl();
}

function assertMlConfigured(): void {
  const base = mlBaseUrl();
  if (import.meta.env.PROD && (base === "/api/ml" || !base)) {
    throw new Error("ML_SERVICE_URL_MISSING");
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("ML_TIMEOUT");
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Best-effort wake for cold-started hosts (e.g. Render free). */
async function wakeMlService(base: string): Promise<void> {
  try {
    await fetchWithTimeout(`${base}/health`, { method: "GET" }, HEALTH_TIMEOUT_MS);
  } catch {
    // Analyze call will surface a clearer error if the service is still down.
  }
}

export async function analyzeBirdAudio(
  blob: Blob,
  onStep?: (step: AnalysisStep) => void,
): Promise<MlAnalyzeResponse> {
  assertMlConfigured();
  const base = mlBaseUrl();

  onStep?.("uploading");
  await wakeMlService(base);

  let uploadBlob = blob;
  let ext = "wav";
  if (!blob.type.includes("wav")) {
    try {
      uploadBlob = await convertBlobToWav(blob);
      ext = "wav";
    } catch {
      throw new Error(
        "Could not decode this audio format in your browser. Try uploading a WAV file.",
      );
    }
  }

  const file = new File([uploadBlob], `recording.${ext}`, {
    type: "audio/wav",
  });

  const form = new FormData();
  form.append("audio", file);

  onStep?.("extracting");

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${base}/analyze`,
      { method: "POST", body: form },
      ANALYZE_TIMEOUT_MS,
    );
  } catch (err) {
    if (err instanceof Error && err.message === "ML_TIMEOUT") {
      throw err;
    }
    throw new Error("Failed to fetch");
  }

  onStep?.("detecting_bird");

  let data: MlAnalyzeResponse & { detail?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from analysis service.");
  }

  if (!response.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : (data as { error?: string }).error || `Analysis failed (${response.status})`;
    throw new Error(detail);
  }

  if (data.birdDetected) {
    onStep?.("predicting");
  }
  onStep?.("done");

  return data;
}

export async function checkMlServiceHealth(): Promise<boolean> {
  try {
    assertMlConfigured();
    const res = await fetchWithTimeout(
      `${mlBaseUrl()}/health`,
      { method: "GET" },
      HEALTH_TIMEOUT_MS,
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.ok && data.modelsLoaded);
  } catch {
    return false;
  }
}

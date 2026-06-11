import { convertBlobToWav } from "./audioToWav";
import { getMlServiceBaseUrl } from "./mlConfig";
import type { MlAnalyzeResponse } from "./types";

const ML_BASE = getMlServiceBaseUrl();

export type AnalysisStep =
  | "uploading"
  | "extracting"
  | "detecting_bird"
  | "predicting"
  | "done";

export async function analyzeBirdAudio(
  blob: Blob,
  onStep?: (step: AnalysisStep) => void,
): Promise<MlAnalyzeResponse> {
  onStep?.("uploading");

  let uploadBlob = blob;
  let ext = "wav";
  if (!blob.type.includes("wav")) {
    try {
      uploadBlob = await convertBlobToWav(blob);
      ext = "wav";
    } catch (convErr) {
      // #region agent log
      fetch("http://127.0.0.1:7456/ingest/d1ed4e7d-8058-4fd1-84fd-9eb9e206300f", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d00018" },
        body: JSON.stringify({
          sessionId: "d00018",
          location: "mlApi.ts:analyzeBirdAudio",
          message: "wav conversion failed",
          data: {
            blobType: blob.type,
            error: convErr instanceof Error ? convErr.message : String(convErr),
          },
          timestamp: Date.now(),
          hypothesisId: "A",
          runId: "post-fix",
        }),
      }).catch(() => {});
      // #endregion
      throw new Error(
        "Could not decode this audio format in your browser. Try uploading a WAV file.",
      );
    }
  }

  const file = new File([uploadBlob], `recording.${ext}`, {
    type: "audio/wav",
  });

  // #region agent log
  fetch("http://127.0.0.1:7456/ingest/d1ed4e7d-8058-4fd1-84fd-9eb9e206300f", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d00018" },
    body: JSON.stringify({
      sessionId: "d00018",
      location: "mlApi.ts:analyzeBirdAudio",
      message: "upload payload",
      data: {
        originalBlobType: blob.type,
        originalSize: blob.size,
        uploadSize: uploadBlob.size,
        ext,
        filename: file.name,
        mlBase: ML_BASE,
      },
      timestamp: Date.now(),
      hypothesisId: "D",
      runId: "post-fix",
    }),
  }).catch(() => {});
  // #endregion

  const form = new FormData();
  form.append("audio", file);

  onStep?.("extracting");

  const response = await fetch(`${ML_BASE}/analyze`, {
    method: "POST",
    body: form,
  });

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
    // #region agent log
    fetch("http://127.0.0.1:7456/ingest/d1ed4e7d-8058-4fd1-84fd-9eb9e206300f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d00018" },
      body: JSON.stringify({
        sessionId: "d00018",
        location: "mlApi.ts:analyzeBirdAudio",
        message: "analyze error response",
        data: { status: response.status, detail, raw: data },
        timestamp: Date.now(),
        hypothesisId: "A",
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion
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
    const res = await fetch(`${ML_BASE}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.ok && data.modelsLoaded);
  } catch {
    return false;
  }
}

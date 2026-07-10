import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Mic, Upload, Square, Sparkles, Bird, AlertCircle } from "lucide-react";
import type { AnalysisStatus, MlEmotionScores } from "../../../lib/types";
import { analyzeBirdAudio, type AnalysisStep } from "../../../lib/mlApi";
import { interpretEmotionScores } from "../../../lib/emotionInterpretation";
import * as socialApi from "../../../lib/socialApi";
import { notifyActivityFeedUpdated } from "../../../lib/activityFeed";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { PredictionResultCard } from "./PredictionResultCard";

function translateAnalysisError(message: string, t: (key: string) => string): string {
  if (message.includes("Could not decode this audio format")) {
    return t("errors.audioDecodeFailed");
  }
  if (message.includes("Invalid response from analysis service")) {
    return t("errors.invalidResponse");
  }
  if (message.includes("models not loaded") || message.includes("503")) {
    return t("errors.modelsNotLoaded");
  }
  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return t("errors.networkError");
  }
  const statusMatch = message.match(/Analysis failed \((\d+)\)/);
  if (statusMatch) {
    return t("errors.analysisFailed", { status: statusMatch[1] });
  }
  return message;
}

export function RecordingArea() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep | null>(null);
  const [scores, setScores] = useState<MlEmotionScores | null>(null);
  const [birdProbability, setBirdProbability] = useState<number | undefined>();
  const [analysisAudio, setAnalysisAudio] = useState<{
    blob: Blob;
    filename: string;
    mime: string;
  } | null>(null);
  const [notBird, setNotBird] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetResults = () => {
    setAnalysisMessage("");
    setScores(null);
    setBirdProbability(undefined);
    setAnalysisAudio(null);
    setNotBird(false);
    setAnalysisStep(null);
  };

  const processAudio = useCallback(async (blob: Blob, sourceFilename?: string) => {
    setStatus("analyzing");
    resetResults();
    const audioMeta = {
      blob,
      filename: sourceFilename ?? `chirp-recording-${Date.now()}.webm`,
      mime: blob.type || "audio/webm",
    };
    setAnalysisAudio(audioMeta);
    try {
      const result = await analyzeBirdAudio(blob, setAnalysisStep);

      if (!result.birdDetected) {
        setNotBird(true);
        setAnalysisMessage(result.message || t("recording.notBirdDefault"));
        setStatus("complete");
        return;
      }

      if (result.scores) {
        setScores({
          valence: result.scores.valence,
          arousal: result.scores.arousal,
          socialEngagement: result.scores.socialEngagement,
        });
        setBirdProbability(result.birdProbability);
        const interpretation = interpretEmotionScores(result.scores);
        socialApi
          .logEmotionActivity(interpretation.combinedState)
          .then(() => notifyActivityFeedUpdated())
          .catch(() => {});
      }
      setStatus("complete");
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : t("errors.generic");
      setAnalysisMessage(translateAnalysisError(msg, t));
    }
  }, [t]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAudio(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      resetResults();
    } catch {
      setStatus("error");
      setAnalysisMessage(t("errors.microphoneDenied"));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    resetResults();
    void processAudio(file, file.name);
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const isRecording = status === "recording";
  const isBusy = status === "analyzing" || status === "uploading";

  const stepLabel = analysisStep
    ? t(`recording.steps.${analysisStep}`)
    : t("recording.analyzingDefault");

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative max-w-2xl mx-auto w-full"
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-[2rem] blur-2xl pointer-events-none" />

      <div className="relative bg-white/95 backdrop-blur-md rounded-[2rem] border-2 border-orange-200 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
          <Bird className="w-full h-full text-orange-500 translate-x-8 -translate-y-4" />
        </div>

        <div className="p-8 sm:p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">{t("recording.badge")}</span>
          </div>

          <motion.div
            className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-6 relative"
            animate={{
              boxShadow: isRecording
                ? ["0 0 0 0 rgba(249,115,22,0.4)", "0 0 0 20px rgba(249,115,22,0)"]
                : "0 8px 32px rgba(249,115,22,0.25)",
            }}
            transition={{ duration: 1.2, repeat: isRecording ? Infinity : 0 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 opacity-90" />
            <Mic
              className={`relative w-12 h-12 text-white ${isRecording ? "animate-pulse" : ""}`}
            />
          </motion.div>

          <WaveformVisualizer active={isRecording || isBusy} />

          <AnimatePresence mode="wait">
            {isBusy && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">{stepLabel}</p>
                <p className="text-sm text-gray-400">{t("recording.analyzingPipeline")}</p>
              </motion.div>
            )}

            {status === "complete" && notBird && (
              <motion.div
                key="not-bird"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                  <p className="text-sm leading-relaxed">{analysisMessage}</p>
                </div>
              </motion.div>
            )}

            {status === "complete" && scores && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PredictionResultCard
                  scores={scores}
                  birdProbability={birdProbability}
                  analysisAudio={analysisAudio}
                />
              </motion.div>
            )}

            {status === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-red-600 text-sm font-medium px-2"
              >
                {analysisMessage}
              </motion.p>
            )}
          </AnimatePresence>

          {!isBusy && status !== "complete" && (
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              {!isRecording ? (
                <motion.button
                  type="button"
                  onClick={startRecording}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <Mic className="w-5 h-5" />
                  {t("recording.startRecording")}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={stopRecording}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-500 text-white font-bold text-lg shadow-xl"
                >
                  <Square className="w-5 h-5 fill-current" />
                  {t("recording.stopRecording")}
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-orange-200 bg-white text-gray-800 font-bold text-lg hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50"
              >
                <Upload className="w-5 h-5 text-orange-500" />
                {t("recording.uploadAudio")}
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          )}

          {(status === "complete" || status === "error") && (
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                resetResults();
              }}
              className="mt-6 text-orange-600 font-semibold hover:underline"
            >
              {t("common.recordAgain")}
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}

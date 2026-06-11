import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Upload, Square, Sparkles, Bird, AlertCircle } from "lucide-react";
import type { AnalysisStatus, MlEmotionScores } from "../../../lib/types";
import { analyzeBirdAudio, type AnalysisStep } from "../../../lib/mlApi";
import { interpretEmotionScores } from "../../../lib/emotionInterpretation";
import * as socialApi from "../../../lib/socialApi";
import { notifyActivityFeedUpdated } from "../../../lib/activityFeed";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { PredictionResultCard } from "./PredictionResultCard";

const STEP_LABELS: Record<AnalysisStep, string> = {
  uploading: "Uploading audio…",
  extracting: "Extracting acoustic features…",
  detecting_bird: "Detecting bird vocalizations…",
  predicting: "Predicting emotional dimensions…",
  done: "Finalizing results…",
};

const NOT_BIRD_DEFAULT =
  "We couldn't confidently detect bird vocalizations in this recording. Try moving closer to your bird and reducing background noise.";

export function RecordingArea() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep | null>(null);
  const [scores, setScores] = useState<MlEmotionScores | null>(null);
  const [birdProbability, setBirdProbability] = useState<number | undefined>();
  const [notBird, setNotBird] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetResults = () => {
    setAnalysisMessage("");
    setScores(null);
    setBirdProbability(undefined);
    setNotBird(false);
    setAnalysisStep(null);
  };

  const processAudio = useCallback(async (blob: Blob) => {
    setStatus("analyzing");
    resetResults();
    try {
      const result = await analyzeBirdAudio(blob, setAnalysisStep);

      if (!result.birdDetected) {
        setNotBird(true);
        setAnalysisMessage(result.message || NOT_BIRD_DEFAULT);
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
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("models not loaded") || msg.includes("503")) {
        setAnalysisMessage(
          "The analysis service is not ready. Start the ML service (see ml-service/README.md) and run train_models.py.",
        );
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setAnalysisMessage(
          "Cannot reach the analysis service. Check that VITE_ML_SERVICE_URL is set for production, or start the local ML service for development.",
        );
      } else {
        setAnalysisMessage(msg);
      }
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAudio(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      resetResults();
    } catch {
      setStatus("error");
      setAnalysisMessage("Microphone access denied or unavailable.");
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
    void processAudio(file);
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const isRecording = status === "recording";
  const isBusy = status === "analyzing" || status === "uploading";

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
            <span className="text-sm font-semibold text-orange-700">Bird Sound Analysis</span>
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
                <p className="text-gray-600 font-medium">
                  {analysisStep ? STEP_LABELS[analysisStep] : "Analyzing bird vocalizations…"}
                </p>
                <p className="text-sm text-gray-400">Running ML pipeline on your recording</p>
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
                <PredictionResultCard scores={scores} birdProbability={birdProbability} />
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
                  Start Recording
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
                  Stop Recording
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
                Upload Audio
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
              Record again
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}

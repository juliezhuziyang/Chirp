import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Upload, CheckCircle, Bug } from "lucide-react";
import { CONTRIBUTE_EMOTIONS } from "../../../lib/constants";
import * as socialApi from "../../../lib/socialApi";
import { notifyActivityFeedUpdated } from "../../../lib/activityFeed";

export default function ContributePage() {
  const [emotions, setEmotions] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const toggleEmotion = (e: string) => {
    setEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  };

  const handleContribute = async () => {
    if (!videoFile) {
      setError("Please upload a video");
      return;
    }
    if (emotions.length === 0) {
      setError("Please select at least one emotion");
      return;
    }
    if (videoFile.size > 8 * 1024 * 1024) {
      setError("Video must be under 8MB for upload");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const videoBase64 = await socialApi.fileToBase64(videoFile);
      await socialApi.submitContribution({
        emotions,
        videoBase64,
        videoFilename: videoFile.name,
        videoMime: videoFile.type,
      });
      setSubmitted(true);
      setVideoFile(null);
      setEmotions([]);
      notifyActivityFeedUpdated();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Submission failed. Ensure RESEND_API_KEY is set on the server.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedback.trim()) return;
    setFeedbackLoading(true);
    try {
      await socialApi.submitFeedback(feedback.trim());
      setFeedbackSent(true);
      setFeedback("");
    } catch {
      setError("Failed to send feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-8 h-8 text-orange-500" />
          Contribute
        </h1>
        <p className="text-gray-500 mt-1">Help us improve bird emotion recognition</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border-2 border-green-200 p-10 text-center shadow-lg"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We&apos;ve received your contribution and truly appreciate your help in
              improving Chirp.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 text-orange-600 font-semibold hover:underline"
            >
              Submit another video
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-6">
            <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                We would greatly appreciate your help in improving our model. Please upload
                a short video of your bird.
              </p>
              <ul className="mt-4 text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Bird should be fully visible</li>
                <li>Preferably only one bird</li>
                <li>Minimize background noise</li>
                <li>Avoid multiple birds vocalizing simultaneously</li>
                <li>Clear video is preferred</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm space-y-4">
              <label className="block font-semibold text-gray-900">Upload video</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-200 rounded-2xl cursor-pointer hover:bg-orange-50/50 transition-colors">
                <Upload className="w-8 h-8 text-orange-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {videoFile ? videoFile.name : "Click to select video (max 8MB)"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What emotion do you think your bird is showing?
              </h3>
              <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {CONTRIBUTE_EMOTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEmotion(e)}
                    className={`px-3 py-2 rounded-xl text-sm border-2 transition-colors ${
                      emotions.includes(e)
                        ? "border-orange-500 bg-orange-50 text-orange-800 font-medium"
                        : "border-orange-100 text-gray-600 hover:border-orange-200"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="button"
              onClick={handleContribute}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit contribution"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bug className="w-5 h-5 text-orange-500" />
          <h2 className="font-bold text-gray-900">Feedback</h2>
        </div>
        <p className="text-gray-600 text-sm mb-2">Found a bug? We&apos;d love to hear about it.</p>
        <p className="text-gray-600 text-sm mb-4">
          If Chirp helped you understand your bird better, we&apos;d also love your encouragement
          and suggestions.
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-400 outline-none resize-none"
          placeholder="Your feedback..."
        />
        {feedbackSent && (
          <p className="text-green-600 text-sm mt-2">Thank you for your feedback!</p>
        )}
        <button
          type="button"
          onClick={handleFeedback}
          disabled={feedbackLoading || !feedback.trim()}
          className="mt-3 px-6 py-2 rounded-xl border-2 border-orange-200 font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50"
        >
          Submit Feedback
        </button>
      </section>
    </div>
  );
}

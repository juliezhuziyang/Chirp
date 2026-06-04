import { motion } from "motion/react";
import { Sparkles, Bird } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { RecordingArea } from "../../components/dashboard/RecordingArea";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { NEED_OPTIONS } from "../../../lib/constants";
import { formatAgeLabel } from "../../../lib/localAuth";

export default function SoundRecognitionPage() {
  const { user } = useAuth();
  const needLabels = user?.needs
    .map((id) => NEED_OPTIONS.find((n) => n.id === id)?.label)
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-8 sm:p-10 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {user && <UserAvatar avatar={user.avatar} size="xl" className="ring-4 ring-white/30" />}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Core feature
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Sound Emotion Recognition</h1>
            <p className="text-orange-50 text-lg max-w-xl">
              Record or upload your bird&apos;s vocalizations for AI-powered emotion analysis.
            </p>
          </div>
        </div>
      </motion.div>

      {user?.ownsParrot && user.bird && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur rounded-2xl border border-orange-100 px-5 py-4 shadow-sm"
        >
          <Bird className="w-5 h-5 text-orange-500" />
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {user.bird.name && (
              <span>
                <strong className="text-gray-900">{user.bird.name}</strong>
              </span>
            )}
            {user.bird.species && <span className="text-gray-600">{user.bird.species}</span>}
            {user.bird.ageMonths != null && (
              <span className="text-orange-600 font-medium">
                {formatAgeLabel(user.bird.ageMonths)}
              </span>
            )}
          </div>
          {needLabels && needLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 ml-auto">
              {needLabels.slice(0, 3).map((l) => (
                <span key={l} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  {l}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <RecordingArea />
    </div>
  );
}

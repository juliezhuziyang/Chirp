import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Bird } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { RecordingArea } from "../../components/dashboard/RecordingArea";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useNeedOptions } from "../../../lib/useTranslatedOptions";
import { formatAgeLabel } from "../../../lib/localAuth";

export default function SoundRecognitionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const needOptions = useNeedOptions();
  const needLabels = (user?.needs ?? [])
    .map((id) => needOptions.find((n) => n.id === id)?.label)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          {user && <UserAvatar avatar={user.avatar} size="md" />}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-stone-900">{t("soundPage.title")}</h1>
            <p className="text-sm text-stone-500 truncate">{t("soundPage.description")}</p>
          </div>
        </div>
        {user?.ownsParrot && user.bird && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
            <Bird className="w-4 h-4 text-orange-500" />
            {user.bird.name && <span className="font-medium text-stone-900">{user.bird.name}</span>}
            {user.bird.species && <span>{t(`species.${user.bird.species}`)}</span>}
            {user.bird.ageMonths != null && (
              <span className="text-orange-700">{formatAgeLabel(user.bird.ageMonths)}</span>
            )}
            {needLabels?.slice(0, 2).map((l) => (
              <span key={l} className="text-xs text-stone-500">
                {l}
              </span>
            ))}
          </div>
        )}
      </motion.header>

      <RecordingArea />
    </div>
  );
}

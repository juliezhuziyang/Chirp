import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const { t } = useTranslation();
  const percent = (current / total) * 100;

  return (
    <div className="w-full max-w-lg mx-auto px-6 pt-8 pb-4">
      <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
        <span>{t("onboarding.stepOf", { current, total })}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

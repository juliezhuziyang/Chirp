import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import type { MlEmotionScores } from "../../../lib/types";
import { radarChartValues } from "../../../lib/emotionInterpretation";

interface EmotionRadarChartProps {
  scores: MlEmotionScores;
}

export function EmotionRadarChart({ scores }: EmotionRadarChartProps) {
  const { t } = useTranslation();
  const [animated, setAnimated] = useState(false);
  const normalized = radarChartValues(scores);

  const data = [
    { dimension: t("chart.valence"), value: animated ? normalized.valence * 100 : 0, fullMark: 100 },
    {
      dimension: t("chart.arousal"),
      value: animated ? normalized.arousal * 100 : 0,
      fullMark: 100,
    },
    {
      dimension: t("chart.social"),
      value: animated ? normalized.socialEngagement * 100 : 0,
      fullMark: 100,
    },
  ];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [scores]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-72 sm:h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#fed7aa" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#9a3412", fontSize: 13, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={t("chart.emotion")}
            dataKey="value"
            stroke="#f97316"
            fill="url(#chirpRadarFill)"
            fillOpacity={0.55}
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
          <defs>
            <linearGradient id="chirpRadarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
        <span>{t("chart.legendValence")}</span>
        <span>{t("chart.legendArousal")}</span>
        <span>{t("chart.legendSocial")}</span>
      </div>
    </motion.div>
  );
}

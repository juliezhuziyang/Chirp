import { motion } from "motion/react";

interface WaveformVisualizerProps {
  active: boolean;
  bars?: number;
}

export function WaveformVisualizer({ active, bars = 24 }: WaveformVisualizerProps) {
  return (
    <div className="flex items-end justify-center gap-1 h-20 px-4">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 sm:w-2 rounded-full bg-gradient-to-t from-orange-500 to-amber-400"
          animate={
            active
              ? {
                  height: [12, 8 + Math.random() * 48, 16, 24 + Math.sin(i) * 20, 12],
                }
              : { height: 8 + (i % 5) * 3 }
          }
          transition={
            active
              ? {
                  duration: 0.6 + (i % 4) * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          style={{ height: active ? undefined : 8 + (i % 5) * 3 }}
        />
      ))}
    </div>
  );
}

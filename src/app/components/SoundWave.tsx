import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface SoundWaveProps {
  bars?: number;
  className?: string;
  color?: string;
}

export function SoundWave({ bars = 40, className = '', color = '#FF6B35' }: SoundWaveProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Initialize with random heights
    setHeights(Array.from({ length: bars }, () => Math.random()));

    const interval = setInterval(() => {
      setHeights(Array.from({ length: bars }, () => Math.random()));
    }, 150);

    return () => clearInterval(interval);
  }, [bars]);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="rounded-full"
          style={{
            width: '3px',
            backgroundColor: color,
            opacity: 0.3 + height * 0.7,
          }}
          animate={{
            height: `${20 + height * 60}px`,
          }}
          transition={{
            duration: 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

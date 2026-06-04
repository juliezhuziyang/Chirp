import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import logoImage from 'figma:asset/2c2fce460c7929b55577efe6720c0ce0c73a5838.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const duration = 2500; // 2.5 seconds total loading time
    const interval = 20; // Update every 20ms
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(() => {
          onCompleteRef.current();
        }, 500); // Wait 500ms after reaching 100% before transitioning
      } else {
        setProgress(Math.min(currentProgress, 100));
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 overflow-hidden"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      {/* Large background percentage */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-white font-bold" style={{ fontSize: '40vw', lineHeight: 1 }}>
          {Math.floor(progress)}%
        </div>
      </motion.div>

      {/* Animated circles in background */}
      <motion.div
        className="absolute w-96 h-96 border-4 border-white/20 rounded-full"
        animate={{ scale: [1, 1.5, 1], rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-64 h-64 border-4 border-white/30 rounded-full"
        animate={{ scale: [1, 1.3, 1], rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-12 inline-block"
        >
          <div className="bg-white p-12 rounded-3xl shadow-2xl">
            <img src={logoImage} alt="Chirp Logo" className="w-32 h-32" />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-8xl font-bold text-white mb-6"
        >
          Chirp
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/90 text-2xl mb-12 font-medium"
        >
          Understanding Your Lovebird's Voice
        </motion.p>
        
        {/* Progress percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-6"
        >
          <div className="text-6xl font-bold text-white">
            {Math.floor(progress)}%
          </div>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="w-96 h-2 bg-white/20 rounded-full mx-auto overflow-hidden backdrop-blur-sm"
        >
          <motion.div
            className="h-full bg-white rounded-full shadow-lg"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-white/70 text-sm mt-6 tracking-widest uppercase"
        >
          Loading Experience
        </motion.p>
      </div>
    </motion.div>
  );
}
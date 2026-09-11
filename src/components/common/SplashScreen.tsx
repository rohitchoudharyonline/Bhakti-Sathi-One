import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2600,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => onFinish?.(), motionQuery.matches ? 0 : 450);
    }, motionQuery.matches ? 1200 : duration);

    return () => window.clearTimeout(timer);
  }, [duration, onFinish]);

  const finish = () => {
    setIsVisible(false);
    window.setTimeout(() => onFinish?.(), reduceMotion ? 0 : 450);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="bhakti-sathi-splash"
          initial={{ opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.985, filter: 'blur(8px)' }
          }
          transition={{ duration: reduceMotion ? 0.15 : 0.55 }}
          onClick={finish}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#fffdf9] select-none md:hidden"
          role="status"
          aria-label="Loading Bhakti Sathi"
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-5 py-8">
            <motion.img
              src="/splash.png"
              alt="Sacred temple pencil sketch"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.035, y: 18 }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      scale: [1.035, 1, 1.018, 1],
                      y: [18, 0, -3, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : {
                      opacity: { duration: 0.8, ease: 'easeOut' },
                      scale: { duration: 2.6, ease: 'easeInOut' },
                      y: { duration: 2.6, ease: 'easeInOut' },
                    }
              }
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />

            <motion.img
              src="/logo-bhakti-sathi.png"
              alt="Bhakti Sathi"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.72, y: -18 }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      scale: [0.72, 1.06, 0.98, 1],
                      y: [-18, 0, -4, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : {
                      duration: 1.35,
                      delay: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              className="relative z-10 w-[min(58vw,250px)] object-contain mix-blend-multiply drop-shadow-[0_4px_12px_rgba(150,95,45,0.08)]"
              draggable={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

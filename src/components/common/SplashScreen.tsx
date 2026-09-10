import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const MOBILE_QUERY = '(max-width: 767px)';

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 2600 }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      setIsMobile(mobileQuery.matches);
      setReduceMotion(motionQuery.matches);
      setIsVisible(mobileQuery.matches);
      if (!mobileQuery.matches) onFinish?.();
    };

    sync();
    mobileQuery.addEventListener?.('change', sync);
    motionQuery.addEventListener?.('change', sync);
    return () => {
      mobileQuery.removeEventListener?.('change', sync);
      motionQuery.removeEventListener?.('change', sync);
    };
  }, [onFinish]);

  useEffect(() => {
    if (!isMobile || !isVisible) return;
    const timer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => onFinish?.(), reduceMotion ? 0 : 400);
    }, reduceMotion ? 1200 : duration);
    return () => window.clearTimeout(timer);
  }, [duration, isMobile, isVisible, onFinish, reduceMotion]);

  if (!isMobile) return null;

  const finish = () => {
    setIsVisible(false);
    window.setTimeout(() => onFinish?.(), reduceMotion ? 0 : 400);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="bhakti-sathi-mobile-splash"
          initial={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
          transition={{ duration: reduceMotion ? 0.15 : 0.55 }}
          onClick={finish}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#FFFDF9] select-none cursor-pointer"
          role="status"
          aria-label="Loading Bhakti Sathi"
        >
          <motion.img
            src="/bhakti-sathi-splash.webp"
            alt="Bhakti Sathi"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0.15 : 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

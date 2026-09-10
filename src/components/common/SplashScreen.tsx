import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

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
          <div className="relative flex h-full w-full max-w-md flex-col items-center justify-center px-6 pt-8">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0, y: -16 }}
              animate={reduceMotion ? undefined : { scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20"
            >
              <BrandLogo size="xl" imageClassName="mix-blend-multiply" />
            </motion.div>

            <motion.img
              src="/temple-splash-final.svg"
              alt=""
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0, y: 45, scale: 0.96 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute bottom-0 left-1/2 z-10 w-[118%] max-w-none -translate-x-1/2"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

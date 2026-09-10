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
      window.setTimeout(() => onFinish?.(), reduceMotion ? 0 : 300);
    }, reduceMotion ? 1200 : duration);
    return () => window.clearTimeout(timer);
  }, [duration, isMobile, isVisible, onFinish, reduceMotion]);

  if (!isMobile) return null;

  const finish = () => {
    setIsVisible(false);
    window.setTimeout(() => onFinish?.(), reduceMotion ? 0 : 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="bhakti-sathi-mobile-splash"
          initial={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
          transition={{ duration: reduceMotion ? 0.15 : 0.55 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F2EA] flex items-center justify-center p-6 select-none overflow-hidden"
          role="status"
          aria-label="Loading Bhakti Sathi"
        >
          <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-md text-center">
            <button
              type="button"
              onClick={finish}
              className="flex flex-col items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4B00] rounded-2xl"
              aria-label="Enter Bhakti Sathi"
            >
              <motion.div
                initial={reduceMotion ? false : { scale: 0.92, opacity: 0, y: -12 }}
                animate={reduceMotion ? undefined : { scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="[&_img]:mix-blend-multiply"
              >
                <BrandLogo size="xl" />
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.65 }}
                className="mt-3 px-4"
              >
                <span className="font-['Playfair_Display',serif] italic text-base font-semibold text-[#2C1D11] tracking-wide">
                  “Curating Pilgrimage Tours with Love and Devotion”
                </span>
                <span className="block text-[10px] font-bold tracking-[0.2em] text-[#EA580C] uppercase mt-1.5">
                  Sacred Yatra Journeys Across India
                </span>
              </motion.div>

              <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-[0.25em] mt-6">
                Tap to enter
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

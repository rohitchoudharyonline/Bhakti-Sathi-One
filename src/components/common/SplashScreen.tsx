import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface SplashScreenProps { onFinish?: () => void; duration?: number; }

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 2600 }) => {
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => onFinish?.(), media.matches ? 0 : 450);
    }, media.matches ? 1200 : duration);
    return () => window.clearTimeout(timer);
  }, [duration, onFinish]);

  const close = () => {
    setVisible(false);
    window.setTimeout(() => onFinish?.(), reduced ? 0 : 450);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bhakti-sathi-splash"
          onClick={close}
          role="status"
          aria-label="Loading Bhakti Sathi"
          initial={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: 'blur(7px)' }}
          transition={{ duration: reduced ? 0.15 : 0.55 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-white select-none md:hidden"
        >
          <div className="flex h-full w-full flex-col items-center justify-center px-4">
            <motion.img
              src="/logo-bhakti-sathi.png"
              alt="Bhakti Sathi"
              initial={reduced ? false : { opacity: 0, scale: 0.78, y: -20 }}
              animate={reduced ? undefined : { opacity: 1, scale: [0.78, 1.05, 0.98, 1], y: [-20, 0, -3, 0] }}
              transition={{ duration: reduced ? 0.15 : 1.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 mb-7 w-[min(78vw,320px)] object-contain"
              draggable={false}
            />

            <motion.img
              src="/temple-splash.svg"
              alt="Very light hand-drawn pencil sketch of an ornate Hindu temple"
              initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
              animate={reduced ? undefined : { opacity: 1, y: [28, 0, -2, 0], scale: [0.97, 1, 1.01, 1] }}
              transition={{ duration: reduced ? 0.15 : 1.8, delay: 0.2, ease: 'easeOut' }}
              className="w-[min(98vw,650px)] max-h-[55vh] object-contain"
              draggable={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

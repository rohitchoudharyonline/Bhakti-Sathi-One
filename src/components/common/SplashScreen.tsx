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
              : { opacity: 0, scale: 0.985, filter: 'blur(7px)' }
          }
          transition={{ duration: reduceMotion ? 0.15 : 0.55 }}
          onClick={finish}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-white select-none md:hidden"
          role="status"
          aria-label="Loading Bhakti Sathi"
        >
          <div className="flex h-full w-full flex-col items-center justify-center px-6 py-10">
            <motion.img
              src="/logo-bhakti-sathi.png"
              alt="Bhakti Sathi"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.78, y: -22 }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      scale: [0.78, 1.06, 0.98, 1],
                      y: [-22, 0, -4, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { duration: 1.35, ease: [0.16, 1, 0.3, 1] }
              }
              className="relative z-10 mb-8 h-auto w-[min(76vw,310px)] object-contain mix-blend-multiply"
              draggable={false}
            />

            <motion.svg
              viewBox="0 0 420 300"
              role="img"
              aria-label="Delicate pencil sketch of a sacred temple"
              className="w-full max-w-[420px] text-[#e8b38b]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.15 : 1.45, delay: 0.2 }}
            >
              <path d="M8 238 Q105 230 210 238 T412 238" opacity=".45" />
              <path d="M0 252 Q105 245 210 252 T420 252" opacity=".3" />
              <path d="M25 224 L85 180 L145 224 M275 224 L335 180 L395 224" opacity=".35" />
              <path d="M65 224 L65 238 L355 238 L355 224" />
              <path d="M100 224 L100 164 L138 164 L138 224 M282 224 L282 164 L320 164 L320 224" />
              <path d="M88 164 L119 123 L150 164 Z M270 164 L301 123 L332 164 Z" />
              <path d="M166 224 L166 118 L254 118 L254 224" />
              <path d="M150 118 L210 42 L270 118 Z" />
              <path d="M170 118 L210 64 L250 118" />
              <path d="M185 118 L185 91 L235 91 L235 118" />
              <path d="M196 91 L210 72 L224 91" />
              <path d="M210 42 L210 20 M210 20 L235 27 L210 35" />
              <path d="M179 224 L179 171 L241 171 L241 224" />
              <path d="M190 171 L210 146 L230 171" />
              <path d="M195 224 L195 198 Q210 182 225 198 L225 224" />
              <path d="M32 238 Q210 226 388 238" opacity=".3" />
              <path d="M72 264 L348 264 M112 276 L308 276 M150 288 L270 288" opacity=".28" />
              <path d="M40 132 Q49 124 58 132 M72 120 Q81 112 90 120 M330 120 Q339 112 348 120" opacity=".6" />
              <circle cx="340" cy="62" r="22" opacity=".28" />
              <path d="M120 78 Q132 66 144 78 Q132 90 120 78 M276 88 Q288 76 300 88 Q288 100 276 88" opacity=".45" />
            </motion.svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

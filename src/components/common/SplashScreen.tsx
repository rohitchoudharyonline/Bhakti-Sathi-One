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
          <div className="flex h-full w-full flex-col items-center justify-center px-5 pt-8">
            <motion.img
              src="/bhakti-sathi-splash.webp"
              alt="Bhakti Sathi"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0.15 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[360px] object-contain mix-blend-multiply"
              draggable={false}
            />

            <motion.svg
              viewBox="0 0 360 245"
              role="img"
              aria-label="Light pencil sketch of a sacred temple"
              className="mt-[-18px] w-full max-w-[390px] text-[#efbd91]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.15 : 1.5, delay: reduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <path d="M8 213 Q90 207 180 213 T352 213" opacity=".45" />
              <path d="M0 226 Q90 220 180 226 T360 226" opacity=".35" />
              <path d="M30 199 L78 166 L122 199 M238 199 L285 164 L333 199" opacity=".35" />
              <path d="M55 199 L55 211 L305 211 L305 199" />
              <path d="M92 199 L92 145 L122 145 L122 199 M238 199 L238 145 L268 145 L268 199" />
              <path d="M82 145 L107 111 L132 145 Z M228 145 L253 111 L278 145 Z" />
              <path d="M96 145 L96 132 L118 132 L118 145 M242 145 L242 132 L264 132 L264 145" />
              <path d="M148 199 L148 103 L212 103 L212 199" />
              <path d="M136 103 L180 45 L224 103 Z" />
              <path d="M151 103 L180 62 L209 103" />
              <path d="M163 103 L163 82 L197 82 L197 103" />
              <path d="M171 82 L180 68 L189 82" />
              <path d="M180 45 L180 27 M180 27 L199 33 L180 38" />
              <path d="M148 199 L148 188 L212 188 L212 199" />
              <path d="M157 199 L157 151 L203 151 L203 199" />
              <path d="M165 151 L180 133 L195 151" />
              <path d="M170 199 L170 174 Q180 165 190 174 L190 199" />
              <path d="M109 166 L109 153 M251 166 L251 153 M109 153 L119 156 L109 159 M251 153 L261 156 L251 159" />
              <path d="M38 215 Q180 205 322 215" opacity=".3" />
              <path d="M70 232 L290 232 M105 240 L255 240" opacity=".28" />
              <path d="M35 125 Q42 119 49 125 M62 116 Q69 110 76 116 M284 116 Q291 110 298 116" opacity=".6" />
              <circle cx="302" cy="55" r="17" opacity=".35" />
            </motion.svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

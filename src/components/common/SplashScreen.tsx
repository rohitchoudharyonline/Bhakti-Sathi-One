import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const MOBILE_QUERY = '(max-width: 767px)';

const TempleIllustration: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => (
  <motion.svg
    viewBox="0 0 520 270"
    className="w-[min(100%,520px)] h-auto"
    role="img"
    aria-label="Temple landscape"
    initial={reduceMotion ? false : { opacity: 0, y: 28 }}
    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    transition={{ delay: 0.45, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
  >
    <defs>
      <linearGradient id="temple-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFDF9" stopOpacity="0" />
        <stop offset="1" stopColor="#F4B183" stopOpacity="0.2" />
      </linearGradient>
    </defs>

    <circle cx="430" cy="52" r="24" fill="#F4B183" opacity="0.28" />

    <path
      d="M0 145 C45 116 78 120 116 143 C153 112 185 112 222 143 C260 108 294 110 332 141 C372 111 412 116 455 142 C478 128 500 126 520 138 V205 H0Z"
      fill="#F4B183"
      opacity="0.18"
    />
    <path
      d="M0 165 C43 139 78 145 119 164 C160 136 190 140 229 164 C270 132 304 136 342 163 C382 138 414 141 455 164 C480 151 500 151 520 159 V213 H0Z"
      fill="#F4B183"
      opacity="0.22"
    />

    <motion.g
      fill="#F29B5B"
      opacity="0.58"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={reduceMotion ? undefined : { opacity: 0.58, scale: 1 }}
      transition={{ delay: 0.7, duration: 0.9 }}
      style={{ transformOrigin: '260px 196px' }}
    >
      <rect x="178" y="178" width="164" height="54" rx="3" />
      <path d="M168 178 L190 158 L330 158 L352 178Z" />
      <path d="M204 158 L220 143 L300 143 L316 158Z" />
      <path d="M225 143 L237 129 L283 129 L295 143Z" />
      <path d="M244 129 L252 91 L268 91 L276 129Z" />
      <path d="M249 91 L260 69 L271 91Z" />
      <rect x="256" y="54" width="8" height="16" rx="2" />
      <path d="M260 54 C274 59 281 59 288 55 C279 67 270 66 260 62Z" />

      <path d="M184 178 L174 165 L194 147 L214 165 L204 178Z" />
      <path d="M316 178 L306 165 L326 147 L346 165 L336 178Z" />
      <path d="M173 147 L194 119 L215 147Z" />
      <path d="M325 147 L346 119 L367 147Z" />
      <path d="M189 119 L194 103 L199 119Z" />
      <path d="M341 119 L346 103 L351 119Z" />
      <rect x="191" y="101" width="6" height="8" rx="1" />
      <rect x="343" y="101" width="6" height="8" rx="1" />

      <rect x="205" y="187" width="16" height="45" rx="8" fill="#FFF7EC" opacity="0.72" />
      <rect x="238" y="187" width="16" height="45" rx="8" fill="#FFF7EC" opacity="0.72" />
      <rect x="266" y="187" width="16" height="45" rx="8" fill="#FFF7EC" opacity="0.72" />
      <rect x="299" y="187" width="16" height="45" rx="8" fill="#FFF7EC" opacity="0.72" />
      <path d="M232 232 L288 232 L278 215 L242 215Z" fill="#FFF7EC" opacity="0.72" />
    </motion.g>

    <path d="M0 220 Q100 204 200 221 T400 220 T520 219 V270 H0Z" fill="#F4B183" opacity="0.14" />
    <path d="M0 236 Q130 226 260 239 T520 236 V270 H0Z" fill="#F4B183" opacity="0.1" />

    <motion.g
      stroke="#EAA06A"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.45"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 0.45 }}
      transition={{ delay: 0.95, duration: 0.8 }}
    >
      <path d="M25 92 Q35 84 45 92 Q35 88 25 92" />
      <path d="M57 108 Q67 100 77 108 Q67 104 57 108" />
      <path d="M92 95 Q102 87 112 95 Q102 91 92 95" />
    </motion.g>

    <g stroke="#F29B5B" strokeWidth="1.5" opacity="0.25">
      <path d="M30 248 H490" />
      <path d="M75 258 H445" />
      <path d="M125 266 H395" />
    </g>

    <rect x="0" y="0" width="520" height="270" fill="url(#temple-haze)" />
  </motion.svg>
);

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
          className="fixed inset-0 z-[9999] bg-[#FFFDF9] flex items-center justify-center px-5 py-8 select-none overflow-hidden"
          role="status"
          aria-label="Loading Bhakti Sathi"
        >
          <button
            type="button"
            onClick={finish}
            className="relative flex h-full w-full max-w-md flex-col items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4B00] rounded-2xl"
            aria-label="Enter Bhakti Sathi"
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0, y: -14 }}
              animate={reduceMotion ? undefined : { scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 [&_img]:mix-blend-multiply"
            >
              <BrandLogo size="xl" />
            </motion.div>

            <motion.div
              className="mt-5 w-full"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <TempleIllustration reduceMotion={reduceMotion} />
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onFinish?.(), 700);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  const finish = () => {
    setIsVisible(false);
    setTimeout(() => onFinish?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="holidays-hunt-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99, filter: 'blur(12px)' }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 select-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,75,0,0.04)_0%,transparent_75%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <BrandLogo size="xl" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="mt-4 text-lg sm:text-xl font-bold italic tracking-wide text-[#FF4B00] font-serif"
            >
              Curating Premium Holidays
            </motion.h2>

            {/* Clean Progress Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.4, duration: 2.5, ease: 'easeInOut' }}
              className="w-48 h-1 bg-stone-100 rounded-full overflow-hidden mt-6"
            >
              <div className="h-full bg-gradient-to-r from-amber-500 to-[#FF4B00] animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.55, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-8 w-72 sm:w-80 h-44 sm:h-52"
            >
              <svg viewBox="0 0 400 240" className="w-full h-full" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="Kashmir Shikara ride on Dal Lake">
                <path d="M28 142 L92 78 L148 132 L205 62 L264 132 L320 82 L372 142" stroke="#D4D4D8" strokeWidth="2" />
                <path d="M28 164 Q100 157 172 164 T372 164" stroke="#E4E4E7" strokeWidth="2" />
                <path d="M42 190 Q110 184 180 190 T358 190" stroke="#E4E4E7" strokeWidth="1.5" />
                <path d="M55 166 Q120 184 205 184 Q290 184 345 160 Q310 181 205 180 Q110 180 55 166 Z" fill="#FFF7ED" stroke="#3F3F46" strokeWidth="2" />
                <path d="M55 166 C42 161 36 151 34 141" stroke="#FF4B00" strokeWidth="2.5" />
                <path d="M345 160 C359 154 367 145 370 136" stroke="#3F3F46" strokeWidth="2" />
                <path d="M124 116 Q200 99 276 116 L268 139 Q200 132 132 139 Z" fill="#FFF7ED" stroke="#3F3F46" strokeWidth="2" />
                <path d="M132 139 Q144 147 156 139 Q168 147 180 139 Q192 147 204 139 Q216 147 228 139 Q240 147 252 139 Q260 145 268 139" stroke="#FF4B00" strokeWidth="2" />
                <path d="M140 139 L140 174 M174 136 L174 177 M226 136 L226 177 M260 139 L260 173" stroke="#71717A" strokeWidth="1.5" />
                <rect x="148" y="160" width="96" height="13" rx="3" fill="#FFEDD5" stroke="#FF4B00" strokeWidth="1.5" />
                <circle cx="158" cy="166" r="3" fill="#FF4B00" />
                <circle cx="234" cy="166" r="3" fill="#FF4B00" />
                <circle cx="326" cy="136" r="5" fill="#FFF" stroke="#3F3F46" strokeWidth="1.5" />
                <path d="M326 141 L326 162 L317 175 M331 147 L354 195" stroke="#3F3F46" strokeWidth="2" />
                <path d="M351 190 Q344 195 349 202 Q357 205 357 196 Z" fill="#FF4B00" stroke="#FF4B00" strokeWidth="1.5" />
              </svg>
            </motion.div>

            <motion.button
              type="button"
              onClick={finish}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="mt-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-[0.3em] hover:text-stone-700 transition-colors"
            >
              Tap to enter
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

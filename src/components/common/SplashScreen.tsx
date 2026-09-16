import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onFinish?.();
      }, 700);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="professional-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.99,
            filter: 'blur(12px)',
          }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 select-none overflow-hidden"
        >
          {/* Subtle Warm Minimalist Radial Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,75,0,0.03)_0%,transparent_75%)] pointer-events-none" />

          {/* Main Visual Centerpiece Stack */}
          <div className="relative z-20 flex flex-col items-center justify-center max-w-md w-full text-center">
            
            {/* 1. Professional Kashmir Shikara Ride Master Line Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-72 sm:w-80 h-52 sm:h-60 flex flex-col items-center justify-center mb-4"
            >
              {/* Soft Warm Aura */}
              <motion.div
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-48 h-48 rounded-full bg-[#FF4B00]/10 blur-3xl pointer-events-none"
              />

              {/* Gentle Floating Motion */}
              <motion.div
                animate={{
                  y: [-3, 3, -3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full h-full flex items-center justify-center pointer-events-none"
              >
                <svg
                  viewBox="0 0 400 240"
                  className="w-full h-full"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Distant Himalayan Mountains */}
                  <path
                    d="M30 145 L90 85 L145 135 L190 70 L250 140 L310 80 L370 145"
                    stroke="#E4E4E7"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M190 70 L210 95 L225 80"
                    stroke="#D4D4D8"
                    strokeWidth="1"
                  />

                  {/* Water Ripples / Dal Lake */}
                  <path d="M40 195 Q100 190 160 195 T280 195 T360 195" stroke="#E4E4E7" strokeWidth="1" />
                  <path d="M70 205 Q140 200 210 205 T330 205" stroke="#F4F4F5" strokeWidth="1" />
                  <path d="M110 215 Q170 210 230 215 T310 215" stroke="#F4F4F5" strokeWidth="0.8" />

                  {/* Shikara Boat Hull */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.1 }}
                    d="M60 175 Q120 190 200 190 Q280 190 340 168 Q310 185 200 185 Q100 185 60 175 Z"
                    stroke="#3F3F46"
                    strokeWidth="1.5"
                    fill="#FFFFFF"
                  />
                  {/* Pointed Prow & Stern Curves */}
                  <path d="M60 175 C45 170 40 160 38 152" stroke="#FF4B00" strokeWidth="1.8" />
                  <path d="M340 168 C355 162 365 155 368 148" stroke="#3F3F46" strokeWidth="1.5" />

                  {/* Shikara Canopy Roof (Canopy with Scalloped Edge) */}
                  <path
                    d="M130 125 C150 118 250 118 270 125 L265 145 C245 140 155 140 135 145 Z"
                    stroke="#3F3F46"
                    strokeWidth="1.3"
                    fill="#FFF7ED"
                  />
                  <path d="M135 145 Q145 150 155 145 Q165 150 175 145 Q185 150 195 145 Q205 150 215 145 Q225 150 235 145 Q245 150 255 145 Q260 148 265 145" stroke="#FF4B00" strokeWidth="1.2" />

                  {/* Canopy Support Wooden Pillars */}
                  <line x1="145" y1="145" x2="145" y2="183" stroke="#71717A" strokeWidth="1.2" />
                  <line x1="175" y1="143" x2="175" y2="184" stroke="#A1A1AA" strokeWidth="0.8" />
                  <line x1="225" y1="143" x2="225" y2="184" stroke="#A1A1AA" strokeWidth="0.8" />
                  <line x1="255" y1="145" x2="255" y2="183" stroke="#71717A" strokeWidth="1.2" />

                  {/* Cushioned Seating Inside */}
                  <rect x="150" y="168" width="95" height="13" rx="3" stroke="#FF4B00" strokeWidth="1" fill="#FFEDD5" />
                  <circle cx="160" cy="172" r="2.5" fill="#FF4B00" />
                  <circle cx="235" cy="172" r="2.5" fill="#FF4B00" />

                  {/* Boatman / Oarsman Silhouette at the Stern */}
                  <circle cx="325" cy="148" r="4.5" stroke="#3F3F46" strokeWidth="1.2" fill="#FFFFFF" />
                  <path d="M325 153 L325 170 L318 180" stroke="#3F3F46" strokeWidth="1.2" />
                  {/* Heart-shaped Kashmir Shikara Paddle Oar */}
                  <line x1="330" y1="158" x2="350" y2="200" stroke="#71717A" strokeWidth="1.2" />
                  <path d="M348 196 C344 198 344 204 348 206 C352 208 356 204 352 198 Z" stroke="#FF4B00" strokeWidth="1.2" fill="#FF4B00" />
                </svg>
              </motion.div>
            </motion.div>

            {/* 2. Motion-Injected Brand Logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex justify-center items-center cursor-pointer mb-2"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onFinish?.(), 300);
              }}
            >
              <BrandLogo size="xl" />
            </motion.div>

            {/* 3. Refined Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 mb-6 flex flex-col items-center gap-1 px-4"
            >
              <span className="text-sm sm:text-base font-bold tracking-wide text-stone-700 font-['Plus_Jakarta_Sans',sans-serif]">
                Your Travel partner
              </span>
            </motion.div>

            {/* 4. Touch to Skip */}
            <motion.button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onFinish?.(), 300);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.25] }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
              className="text-[9px] font-extrabold text-stone-400 uppercase tracking-[0.3em] mt-4 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Tap to enter
            </motion.button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
            
            {/* 1. Professional Pencil-Style Master Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-72 sm:w-80 h-56 sm:h-64 flex flex-col items-center justify-center mb-4"
            >
              {/* Soft Golden Aura */}
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
                className="absolute w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
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
                  viewBox="0 0 400 300"
                  className="w-full h-full drop-shadow-sm"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Stylized Lotus Pedestal */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    d="M120 250 C140 235 180 230 200 230 C220 230 260 235 280 250 C260 258 230 262 200 262 C170 262 140 258 120 250 Z"
                    stroke="#D4D4D8"
                    strokeWidth="1.5"
                    fill="#FAFAFA"
                  />
                  <path d="M140 250 C155 242 175 238 200 238 C225 238 245 242 260 250" stroke="#E4E4E7" strokeWidth="1.2" />

                  {/* Multi-Tiered Sacred Architecture (Pencil Sketch Linework) */}
                  {/* Base Platform */}
                  <rect x="130" y="210" width="140" height="30" rx="2" stroke="#71717A" strokeWidth="1.8" fill="#FFFFFF" />
                  <line x1="135" y1="220" x2="265" y2="220" stroke="#A1A1AA" strokeWidth="1" strokeDasharray="4 2" />
                  <line x1="140" y1="230" x2="260" y2="230" stroke="#A1A1AA" strokeWidth="1" strokeDasharray="4 2" />

                  {/* Main Sanctum Garbhagriha */}
                  <rect x="150" y="140" width="100" height="70" rx="3" stroke="#52525B" strokeWidth="1.8" fill="#FDFBF7" />
                  
                  {/* Pencil Hatching Shading on Sanctum Sides */}
                  <line x1="156" y1="150" x2="166" y2="150" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="156" y1="160" x2="166" y2="160" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="156" y1="170" x2="166" y2="170" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="156" y1="180" x2="166" y2="180" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="156" y1="190" x2="166" y2="190" stroke="#D4D4D8" strokeWidth="1" />

                  <line x1="234" y1="150" x2="244" y2="150" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="234" y1="160" x2="244" y2="160" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="234" y1="170" x2="244" y2="170" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="234" y1="180" x2="244" y2="180" stroke="#D4D4D8" strokeWidth="1" />
                  <line x1="234" y1="190" x2="244" y2="190" stroke="#D4D4D8" strokeWidth="1" />

                  {/* Sacred Arch Entrance (Torana) */}
                  <path d="M178 210 V165 C178 152 222 152 222 165 V210" stroke="#52525B" strokeWidth="1.6" fill="#F4F4F5" />
                  <circle cx="200" cy="157" r="4" stroke="#FF4B00" strokeWidth="1.5" fill="#FFF7ED" />

                  {/* Shikhara Tower Tiers (Nagara Style Architectural Curves) */}
                  <path d="M150 140 L200 65 L250 140 Z" stroke="#52525B" strokeWidth="1.8" fill="#FAFAFA" />

                  {/* Shikhara Horizontal Layering Lines with Pencil Sketch Style */}
                  <path d="M158 128 H242 M164 116 H236 M170 104 H230 M177 92 H223 M184 80 H216 M191 69 H209" stroke="#A1A1AA" strokeWidth="1.2" />

                  {/* Vertical Center Groove */}
                  <line x1="200" y1="65" x2="200" y2="140" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Amalaka (Ribbed Crown Disk) */}
                  <ellipse cx="200" cy="63" rx="16" ry="6" stroke="#52525B" strokeWidth="1.6" fill="#E4E4E7" />

                  {/* Kalash (Sacred Pitcher Finial) */}
                  <path d="M197 55 C197 48 203 48 203 55 C203 45 197 45 197 55 Z" stroke="#52525B" strokeWidth="1.4" fill="#D4D4D8" />
                  <line x1="200" y1="45" x2="200" y2="30" stroke="#52525B" strokeWidth="1.8" />

                  {/* Sacred Flag (Dhwaja) with Gentle Wave Motion */}
                  <motion.path
                    animate={{
                      d: [
                        "M200 30 C218 24 225 34 200 38 Z",
                        "M200 30 C222 26 228 36 200 38 Z",
                        "M200 30 C218 24 225 34 200 38 Z"
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    fill="#FF4B00"
                    fillOpacity="0.85"
                    stroke="#C2410C"
                    strokeWidth="1.2"
                  />

                  {/* Sun / Divine Rays Motif behind spire */}
                  <g stroke="#E4E4E7" strokeWidth="1" opacity="0.6">
                    <line x1="200" y1="35" x2="200" y2="15" strokeDasharray="3 3" />
                    <line x1="215" y1="40" x2="228" y2="25" strokeDasharray="3 3" />
                    <line x1="185" y1="40" x2="172" y2="25" strokeDasharray="3 3" />
                  </g>
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

            {/* 3. Refined Typography & Slogan */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-1 mb-6 flex flex-col items-center gap-1.5 px-4"
            >
              <span className="font-['Playfair_Display',serif] italic text-base sm:text-lg font-medium text-stone-700 tracking-wide">
                “Curating Pilgrimage Tours with Love and Devotion”
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#FF4B00] uppercase font-['Outfit',sans-serif]">
                Sacred Yatra Journeys Across India
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

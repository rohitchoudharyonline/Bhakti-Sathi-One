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
                  className="w-full h-full"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Subtle Radiating Halo / Divine Aura */}
                  <circle cx="200" cy="130" r="95" stroke="#F4F4F5" strokeWidth="1" strokeDasharray="3 4" opacity="0.8" />
                  <circle cx="200" cy="130" r="115" stroke="#FAFAFA" strokeWidth="1" opacity="0.6" />

                  {/* Stylized Lotus Pedestal (Fine Line Art) */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.1 }}
                    d="M110 245 C135 232 170 228 200 228 C230 228 265 232 290 245 C270 254 235 258 200 258 C165 258 130 254 110 245 Z"
                    stroke="#A1A1AA"
                    strokeWidth="1.2"
                    fill="#FFFFFF"
                  />
                  <path d="M130 245 C150 238 175 235 200 235 C225 235 250 238 270 245" stroke="#D4D4D8" strokeWidth="1" />
                  <path d="M150 248 C165 244 182 242 200 242 C218 242 235 244 250 248" stroke="#E4E4E7" strokeWidth="0.8" />

                  {/* Sacred Temple Base Platform */}
                  <rect x="135" y="210" width="130" height="20" rx="1" stroke="#52525B" strokeWidth="1.2" fill="#FFFFFF" />
                  <line x1="140" y1="216" x2="260" y2="216" stroke="#D4D4D8" strokeWidth="0.8" />
                  <line x1="145" y1="222" x2="255" y2="222" stroke="#D4D4D8" strokeWidth="0.8" />

                  {/* Main Sanctum Garbhagriha */}
                  <rect x="155" y="145" width="90" height="65" rx="1.5" stroke="#3F3F46" strokeWidth="1.2" fill="#FFFFFF" />
                  
                  {/* Fine Architectural Pillars & Panels */}
                  <line x1="170" y1="145" x2="170" y2="210" stroke="#A1A1AA" strokeWidth="0.8" />
                  <line x1="230" y1="145" x2="230" y2="210" stroke="#A1A1AA" strokeWidth="0.8" />

                  {/* Sacred Arch Entrance (Torana) */}
                  <path d="M182 210 V168 C182 156 218 156 218 168 V210" stroke="#3F3F46" strokeWidth="1.2" fill="#FAFAFA" />
                  <circle cx="200" cy="160" r="3" stroke="#FF4B00" strokeWidth="1.2" fill="#FFF7ED" />

                  {/* Shikhara Tower (Nagara Architectural Curved Spire) */}
                  <path d="M155 145 Q200 85 200 55 Q200 85 245 145 Z" stroke="#3F3F46" strokeWidth="1.2" fill="#FFFFFF" />

                  {/* Shikhara Horizontal Architectural Banding (Fine Pencil Lines) */}
                  <path d="M161 135 H239 M166 125 H234 M172 115 H228 M178 105 H222 M184 95 H216 M190 85 H210 M195 75 H205" stroke="#A1A1AA" strokeWidth="0.8" />
                  
                  {/* Center Spire Vertical Axis */}
                  <line x1="200" y1="55" x2="200" y2="145" stroke="#E4E4E7" strokeWidth="0.8" strokeDasharray="2 2" />

                  {/* Amalaka (Ribbed Crown Disk) */}
                  <ellipse cx="200" cy="53" rx="14" ry="4.5" stroke="#3F3F46" strokeWidth="1.2" fill="#F4F4F5" />

                  {/* Kalash (Sacred Pitcher Finial) */}
                  <path d="M198 47 C198 42 202 42 202 47 C202 39 198 39 198 47 Z" stroke="#3F3F46" strokeWidth="1.2" fill="#E4E4E7" />
                  <line x1="200" y1="39" x2="200" y2="28" stroke="#3F3F46" strokeWidth="1.4" />

                  {/* Sacred Flag (Dhwaja) with Gentle Wave Motion */}
                  <motion.path
                    animate={{
                      d: [
                        "M200 28 C216 22 222 32 200 36 Z",
                        "M200 28 C220 24 226 34 200 36 Z",
                        "M200 28 C216 22 222 32 200 36 Z"
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    fill="#FF4B00"
                    fillOpacity="0.8"
                    stroke="#C2410C"
                    strokeWidth="1"
                  />
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

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 3600, // Balanced timing for a premium, cinematic experience
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
          key="masterpiece-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.99,
            filter: 'blur(12px)',
          }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F2EA] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
        >
          {/* Main Visual Centerpiece Stack */}
          <div className="relative z-20 flex flex-col items-center justify-center max-w-md w-full text-center">
            
            {/* 1. Motion-Injected Brand Logo (Elegant scale and upward float slide) */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0, y: -25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1], // Premium cinematic ease-out
              }}
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onFinish?.(), 300);
              }}
            >
              <BrandLogo size="xl" />
            </motion.div>

            {/* 2. Slogan: "Curating Pilgrimage Tours with Love and Devotion" */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.45,
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-3 mb-4 flex flex-col items-center gap-1.5 px-4"
            >
              <span className="font-['Playfair_Display',serif] italic text-base sm:text-lg font-semibold text-[#2C1D11] tracking-wide">
                “Curating Pilgrimage Tours with Love and Devotion”
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#EA580C] uppercase font-['Outfit',sans-serif]">
                Sacred Yatra Journeys Across India
              </span>
            </motion.div>

            {/* 3. Simple Pencil Illustration of Temple with 20% Opacity */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1, 
              }}
              transition={{
                delay: 0.65,
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-72 sm:w-84 h-56 sm:h-64 mt-1 flex flex-col items-center justify-center"
            >
              {/* Soft Golden Halo pulsing gently behind the sacred shikhara */}
              <motion.div
                animate={{
                  scale: [0.94, 1.06, 0.94],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-2 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-300/15 to-amber-200/10 blur-2xl pointer-events-none"
              />

              {/* Serene Floating Motion */}
              <motion.div
                animate={{
                  y: [-3, 3, -3],
                  scale: [0.995, 1.005, 0.995],
                }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full h-full flex items-center justify-center pointer-events-none"
              >
                {/* Simple Hand-Drawn Pencil Illustration of Temple with Opacity 20% */}
                <img
                  src="/simple_temple_sketch.png"
                  alt="Simple Temple Pencil Sketch Illustration"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain select-none mix-blend-multiply opacity-20 filter contrast-105"
                />
              </motion.div>

              {/* Devotional Light Sparks / Diya glow motes rising gently upward */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{
                      y: [0, -36, -72],
                      opacity: [0, 0.75, 0],
                      scale: [0.5, 1.1, 0.3],
                    }}
                    transition={{
                      duration: 3.2 + i * 0.6,
                      repeat: Infinity,
                      delay: 0.8 + i * 0.7,
                      ease: 'easeOut',
                    }}
                    className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_#F59E0B]"
                    style={{
                      left: `${26 + i * 24}%`,
                      bottom: '16%',
                    }}
                  />
                ))}
              </div>

              {/* Subtle sacred golden radiance at the foundation */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                <motion.div
                  animate={{
                    scaleX: [0.94, 1.06, 0.94],
                    opacity: [0.2, 0.45, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-48 h-2 rounded-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent blur-xs"
                />
              </div>
            </motion.div>

            {/* 4. Soft Touch-to-Skip hint at the bottom (No temple names) */}
            <motion.button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onFinish?.(), 300);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0.2] }}
              transition={{ delay: 1.8, duration: 2.2, repeat: Infinity }}
              className="text-[9px] font-extrabold text-stone-400 uppercase tracking-[0.25em] mt-6 hover:text-stone-600 transition-colors cursor-pointer"
            >
              Tap to enter
            </motion.button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

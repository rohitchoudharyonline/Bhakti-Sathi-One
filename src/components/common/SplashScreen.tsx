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
              className="relative z-10 mb-8 w-[min(78vw,320px)] object-contain"
              draggable={false}
            />

            <motion.svg
              viewBox="0 0 760 560"
              role="img"
              aria-label="Very light hand-drawn pencil sketch of an ornate Hindu temple"
              className="w-[min(98vw,650px)] max-h-[55vh]"
              fill="none"
              stroke="#e8cdb8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={reduced ? undefined : { opacity: 1, y: [24, 0, -2, 0] }}
              transition={{ duration: reduced ? 0.15 : 1.8, delay: 0.25, ease: 'easeOut' }}
            >
              <g opacity=".34" strokeWidth="1.2">
                <path d="M20 330 Q120 270 220 330 T420 330 T740 330" />
                <path d="M35 350 L145 255 255 350 M505 350 L615 255 725 350" />
                <path d="M70 320 L145 255 220 320 M550 320 L615 255 690 320" />
                <circle cx="625" cy="125" r="48" />
                <path d="M55 455 H705 M95 472 H665 M170 490 H590 M250 508 H510" />
              </g>

              <g>
                <path d="M125 420 H635 M145 420 V385 H615 V420" />
                <path d="M170 385 L220 320 270 385 Z M490 385 L540 320 590 385 Z" />
                <path d="M188 385 V420 M252 385 V420 M508 385 V420 M572 385 V420" />

                <path d="M275 385 V215 L380 70 485 215 V385" />
                <path d="M245 215 H515 L380 45 Z" />
                <path d="M380 45 V18 M380 18 L425 31 380 43" />
                <path d="M355 83 Q380 65 405 83 L420 115 H340 Z" />
                <path d="M330 115 Q380 90 430 115 L448 155 H312 Z" />
                <path d="M300 155 Q380 125 460 155 L480 195 H280 Z" />
                <path d="M280 195 Q380 160 480 195 L515 215 H245 Z" />

                <path d="M290 215 H470 V385 H290 Z" />
                <path d="M315 385 V285 Q380 210 445 285 V385" />
                <path d="M340 385 V315 Q380 275 420 315 V385" />
                <path d="M325 215 V180 H435 V215" />
                <path d="M340 180 L380 132 420 180" />

                <path d="M300 385 H460 L440 350 H320 Z" />
                <path d="M320 350 V315 H440 V350" />
                <path d="M335 315 L380 260 425 315" />
                <path d="M350 385 V345 Q380 315 410 345 V385" />

                <path d="M250 215 L225 240 H535 L510 215" />
                <path d="M255 240 V258 H505 V240 M255 258 H505 M255 276 H505 M255 294 H505" />
                <path d="M270 294 L245 320 H515 L490 294" />
                <path d="M280 320 H480 M290 338 H470 M300 356 H460 M310 374 H450" />
              </g>

              <g opacity=".55" strokeWidth="1.25">
                <path d="M105 420 V350 M655 420 V350" />
                <path d="M85 350 L105 325 125 350 M635 350 L655 325 675 350" />
                <path d="M105 325 V290 M655 325 V290" />
                <path d="M55 420 Q35 370 65 335 Q95 370 75 420 M685 420 Q665 370 695 335 Q725 370 705 420" />
                <path d="M35 430 Q380 415 725 430" />
              </g>

              <g opacity=".48" strokeWidth="1.4">
                <path d="M110 145 Q130 125 150 145 Q130 165 110 145 Z M205 185 Q225 165 245 185 Q225 205 205 185 Z M535 175 Q555 155 575 175 Q555 195 535 175 Z" />
                <path d="M120 115 Q132 103 144 115 M215 155 Q227 143 239 155 M545 145 Q557 133 569 145" />
                <path d="M300 105 Q315 90 330 105 M430 125 Q445 110 460 125" />
              </g>
            </motion.svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

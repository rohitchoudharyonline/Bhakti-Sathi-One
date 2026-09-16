import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAInstall } from './usePWAInstall';
import { Smartphone, Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed the installation banner in this session
    const dismissed = localStorage.getItem('holidays_hunt_pwa_dismissed') === 'true' || localStorage.getItem('bhakti_sathi_pwa_dismissed') === 'true';
    setIsBannerDismissed(dismissed);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBannerDismissed(true);
    localStorage.setItem('holidays_hunt_pwa_dismissed', 'true');
  };

  // If already installed, banner is dismissed, or neither iOS nor standard PWA is installable, hide the UI
  if (isInstalled || isBannerDismissed) {
    return null;
  }

  // Define a trigger action
  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsBannerDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const showPrompt = isInstallable || isIOS;

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-22 md:bottom-6 right-3 sm:right-6 z-[100] max-w-sm w-[92vw] sm:w-88 bg-white rounded-2xl shadow-[0_10px_30px_rgba(255,75,0,0.15)] border border-orange-100 p-4 overflow-hidden select-none"
        >
          {/* Subtle Decorative Gradient background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-xl -z-10 opacity-70" />
          
          <div className="flex gap-3">
            {/* Logo / App Icon representation */}
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0">
              <img 
                src="/icon-holidays-hunt-v3.png" 
                alt="Holidays Hunt Logo" 
                className="w-9 h-9 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FF4B00] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Install App
                </span>
                <button 
                  onClick={handleDismiss}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="text-xs font-black text-stone-900 mt-0.5 leading-tight">
                Add Holidays Hunt to Home Screen
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 font-medium leading-normal">
                Access sacred darshans, tours, & Jap counter instantly in full-screen. Updates automatically!
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3.5 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition text-xs font-bold text-center"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-[2] py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF4B00] to-orange-600 text-white hover:brightness-105 active:scale-98 transition shadow-sm font-black text-xs text-center flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Safari Guided Install Sheet */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
            {/* Backdrop click to dismiss */}
            <div className="absolute inset-0" onClick={() => setShowIOSGuide(false)} />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 text-stone-900 border-t border-orange-100"
            >
              <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#FF4B00]" />
                  <h3 className="text-sm font-black text-stone-950">Add Holidays Hunt to iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-stone-700 font-medium leading-relaxed">
                <p>
                  iOS Safari doesn't support automatic 1-click install buttons. Follow these 2 easy steps to install:
                </p>
                
                <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF4B00] flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    Tap the <strong className="text-stone-950 flex items-center gap-1 inline-flex">Share <Share className="w-3.5 h-3.5 text-blue-500 inline-block" /></strong> button in the Safari navigation bar.
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF4B00] flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    Scroll down the options list and tap <strong className="text-stone-950 flex items-center gap-1 inline-flex">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline-block text-stone-700" /></strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-stone-900 text-white font-black text-xs text-center hover:bg-black transition"
              >
                Got It, Thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

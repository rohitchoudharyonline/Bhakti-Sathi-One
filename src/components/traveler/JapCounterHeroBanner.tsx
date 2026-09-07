import React from 'react';
import { useTours } from '../../context/TourContext';
import { Sparkles, ArrowRight, Flame, Layers, FileDown } from 'lucide-react';

export const JapCounterHeroBanner: React.FC = () => {
  const { navigateToJapCounter, agencySettings } = useTours();
  const currentMantra = agencySettings?.sacredMantra || 'साम्ब सदाशिव';

  return (
    <div className="w-full max-w-6xl mx-auto mt-5 sm:mt-6">
      <div
        onClick={navigateToJapCounter}
        className="group relative bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-amber-500/30 hover:border-amber-500/70 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FF4B00]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Content */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            {/* Visual Round Mala Mini-Badge with Pulsing Beads */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#FF4B00] to-amber-500 text-white grid place-items-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Devotional Sadhana Tool
                </span>
                <span className="text-xs text-amber-200/90 font-serif font-black">
                  ॥ {currentMantra} ॥
                </span>
              </div>

              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight mt-1 group-hover:text-amber-200 transition-colors">
                Sacred 108 Japa Mala Counter
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 font-medium mt-0.5 line-clamp-1">
                Experience serene 108-bead counting with crystal bell chimes, daily stats, and downloadable PDF reports.
              </p>
            </div>
          </div>

          {/* Right Action Button & Feature Badges */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-stone-800 md:border-t-0">
            {/* Badges */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-stone-300">
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                108 Beads
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700 flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" />
                Streaks
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700 flex items-center gap-1">
                <FileDown className="w-3 h-3 text-[#FF4B00]" />
                PDF
              </span>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={navigateToJapCounter}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FF4B00] to-[#E04200] hover:from-[#FF5500] hover:to-[#FF4B00] text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md group-hover:shadow-lg transition cursor-pointer"
            >
              <span>Open Jap Counter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

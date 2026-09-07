import React from 'react';
import { useTours } from '../../context/TourContext';

export const SacredMantraCard: React.FC = () => {
  const { agencySettings } = useTours();
  const mantra = agencySettings?.sacredMantra || 'साम्ब सदाशिव';

  return (
    <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-amber-200 border-b border-amber-500/30 py-2 px-4 text-center relative overflow-hidden shadow-md">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="max-w-7xl mx-auto flex items-center justify-center relative z-10 text-center">
        <div className="text-sm sm:text-base md:text-lg font-black tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#FF5500] to-amber-300 drop-shadow-sm font-serif select-none">
          {mantra}
        </div>
      </div>
    </div>
  );
};

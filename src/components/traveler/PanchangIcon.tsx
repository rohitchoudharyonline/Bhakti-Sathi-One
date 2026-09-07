import React from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';

export const PanchangIcon: React.FC = () => {
  const openPanchang = () => {
    window.history.pushState({}, '', '/panchang');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-4 bottom-24 sm:right-6 sm:bottom-7 z-[80]">
      <button
        type="button"
        onClick={openPanchang}
        title="Panchang Calendar"
        aria-label="Open Panchang Calendar"
        className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#FF4B00] via-amber-500 to-[#FF7A18] text-white p-0.5 shadow-lg hover:shadow-xl hover:shadow-[#FF4B00]/35 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
      >
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-[#FF4B00] opacity-25 blur-sm group-hover:opacity-60 transition-opacity duration-300" />
        <div className="relative z-10 w-full h-full rounded-full bg-white flex items-center justify-center border border-amber-200 shadow-inner">
          <div className="relative">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF4B00] group-hover:scale-110 transition-transform" />
            <Sparkles className="absolute -right-2 -top-2 w-2.5 h-2.5 text-amber-500 fill-current" />
          </div>
        </div>
      </button>
    </div>
  );
};

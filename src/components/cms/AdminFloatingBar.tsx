import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useTours } from '../../context/TourContext';

export const AdminFloatingBar: React.FC = () => {
  const { activeView, setActiveView } = useTours();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      try {
        const token = localStorage.getItem('bs_cms_session_token');
        setIsAdminLoggedIn(Boolean(token && token.trim().length > 10));
      } catch {
        setIsAdminLoggedIn(false);
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 2000);
    return () => clearInterval(interval);
  }, []);

  // Only show when the user is logged in as CMS staff and is currently browsing the public traveler storefront
  if (!isAdminLoggedIn || activeView === 'cms' || dismissed) {
    return null;
  }

  const handleReturnToAdmin = () => {
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/admin-rudra-0712');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setActiveView('cms');
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9990] animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-2.5 bg-stone-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-stone-700/80 text-xs select-none">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <div className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-stone-200 hidden sm:inline">Admin Mode</span>
        </div>

        <button
          type="button"
          onClick={handleReturnToAdmin}
          className="flex items-center gap-1 bg-[#FF4B00] hover:bg-[#E03E00] text-white px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition shadow-xs cursor-pointer"
        >
          <span>Return to Admin Console</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-stone-400 hover:text-white p-1 transition cursor-pointer"
          title="Dismiss bar for now"
          aria-label="Dismiss admin bar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useTours } from '../../context/TourContext';
import {
  Luggage,
  MapPin,
  MessageCircle,
  Home,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    selectedPackageId,
    selectedDestinationSlug,
    isDestinationsExplorerOpen,
    isToursDirectoryOpen,
    isBlogHubOpen,
    activeBlogSlug,
    activeCustomPageSlug,
    activeInfoPage,
    packages,
    agencySettings,
    navigateToHome,
    navigateToAllTours,
    navigateToDestinationsExplorer,
  } = useTours();

  // Determine active tab
  const isHomeActive =
    activeView === 'traveler' &&
    !selectedPackageId &&
    !selectedDestinationSlug &&
    !isDestinationsExplorerOpen &&
    !isToursDirectoryOpen &&
    !isBlogHubOpen &&
    !activeBlogSlug &&
    !activeCustomPageSlug &&
    !activeInfoPage;

  const isToursActive = isToursDirectoryOpen || !!selectedPackageId;
  const isDestinationsActive = isDestinationsExplorerOpen || !!selectedDestinationSlug;

  const publishedCount = packages.filter((p) => p.status === 'published').length || packages.length;

  const handleWhatsApp = () => {
    const rawPhone = agencySettings.whatsappConciergeNumber || agencySettings.whatsapp || agencySettings.primaryPhone || '+919419915255';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      'Hi Bhakti Sathi! I would like to inquire about holiday packages and custom itineraries.'
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Only show in traveler view
  if (activeView !== 'traveler') return null;

  return (
    <nav
      id="mobile-bottom-app-nav"
      aria-label="Mobile Bottom App Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,8px)] transition-all duration-300"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {/* 1. Explore / Home */}
        <button
          type="button"
          onClick={navigateToHome}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] ${
            isHomeActive
              ? 'text-[#FF4B00] font-black'
              : 'text-stone-500 hover:text-stone-800 font-semibold'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 stroke-[2.5] text-[#FF4B00]' : 'stroke-2 text-stone-500'}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF4B00] shadow-2xs" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${isHomeActive ? 'font-black text-[#FF4B00]' : 'font-medium text-stone-500'}`}>
            Explore
          </span>
        </button>

        {/* 2. All Tours */}
        <button
          type="button"
          onClick={navigateToAllTours}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] ${
            isToursActive
              ? 'text-[#FF4B00] font-black'
              : 'text-stone-500 hover:text-stone-800 font-semibold'
          }`}
        >
          <div className="relative">
            <Luggage className={`w-5 h-5 transition-transform ${isToursActive ? 'scale-110 stroke-[2.5] text-[#FF4B00]' : 'stroke-2 text-stone-500'}`} />
            {publishedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#FF4B00] text-white border border-[#FF4B00]/40 text-[8px] font-black rounded-full leading-tight shadow-xs">
                {publishedCount}
              </span>
            )}
            {isToursActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF4B00] shadow-2xs" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${isToursActive ? 'font-black text-[#FF4B00]' : 'font-medium text-stone-500'}`}>
            Tours
          </span>
        </button>

        {/* 3. Destinations */}
        <button
          type="button"
          onClick={navigateToDestinationsExplorer}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] ${
            isDestinationsActive
              ? 'text-[#FF4B00] font-black'
              : 'text-stone-500 hover:text-stone-800 font-semibold'
          }`}
        >
          <div className="relative">
            <MapPin className={`w-5 h-5 transition-transform ${isDestinationsActive ? 'scale-110 stroke-[2.5] text-[#FF4B00]' : 'stroke-2 text-stone-500'}`} />
            {isDestinationsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF4B00] shadow-2xs" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${isDestinationsActive ? 'font-black text-[#FF4B00]' : 'font-medium text-stone-500'}`}>
            Destinations
          </span>
        </button>

        {/* 4. WhatsApp Support */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] text-emerald-600 hover:text-emerald-700 font-bold"
        >
          <div className="relative w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-black text-emerald-700 leading-none">
            Chat
          </span>
        </button>
      </div>
    </nav>
  );
};

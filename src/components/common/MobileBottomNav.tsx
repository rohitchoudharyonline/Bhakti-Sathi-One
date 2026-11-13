import React from 'react';
import { useTours } from '../../context/TourContext';
import {
  Luggage,
  MapPin,
  MessageCircle,
  Home,
  Phone,
  Compass,
  Star,
  Info,
  Globe,
} from 'lucide-react';
import { DEFAULT_BOTTOM_NAV_ITEMS } from '../../data/defaultPackages';
import { MobileBottomNavItem } from '../../types/tour';

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
    navigateToCustomPage,
    navigateToInfoPage,
  } = useTours();

  // Determine active states
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
    const rawPhone = agencySettings.whatsapp || agencySettings.phone || '+919419915255';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      'Hi Holidays Hunt! I would like to inquire about holiday packages and custom itineraries.'
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleCall = () => {
    const phone = agencySettings.phone || '+919419915255';
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  // Only show in traveler view and not when inside package detail (which has its own booking bar)
  if (activeView !== 'traveler' || selectedPackageId) return null;

  const navItems: MobileBottomNavItem[] = (agencySettings.bottomNavItems && agencySettings.bottomNavItems.length > 0)
    ? agencySettings.bottomNavItems.filter((i) => i.enabled !== false)
    : DEFAULT_BOTTOM_NAV_ITEMS;

  const renderIcon = (iconName: string, isActive: boolean) => {
    const iconClass = `w-5 h-5 transition-transform ${
      isActive ? 'scale-110 stroke-[2.5] text-[#9b0000]' : 'stroke-2 text-stone-500'
    }`;

    switch (iconName) {
      case 'home':
        return <Home className={iconClass} />;
      case 'tours':
        return <Luggage className={iconClass} />;
      case 'destinations':
        return <MapPin className={iconClass} />;
      case 'chat':
        return (
          <div className="relative w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        );
      case 'phone':
        return <Phone className={iconClass} />;
      case 'compass':
        return <Compass className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'info':
        return <Info className={iconClass} />;
      default:
        return <Globe className={iconClass} />;
    }
  };

  const handleItemClick = (item: MobileBottomNavItem) => {
    const act = item.actionType || (item as any).action || 'home';
    const cleanUrl = (item.url || '').trim();
    const normalizedSlug = cleanUrl.replace(/^\/+/, '').toLowerCase();

    if (act === 'home') {
      navigateToHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (act === 'tours' || normalizedSlug === 'tours' || normalizedSlug === 'packages') {
      navigateToAllTours();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (act === 'destinations' || normalizedSlug === 'destinations') {
      navigateToDestinationsExplorer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (act === 'whatsapp' || normalizedSlug === 'whatsapp' || normalizedSlug === 'chat') {
      handleWhatsApp();
      return;
    }

    if (act === 'call' || normalizedSlug === 'call' || cleanUrl.startsWith('tel:')) {
      handleCall();
      return;
    }

    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (cleanUrl.startsWith('tel:') || cleanUrl.startsWith('mailto:')) {
      window.location.href = cleanUrl;
      return;
    }

    const infoPages = ['about', 'faq', 'terms', 'cancellation', 'privacy', 'security', 'careers', 'contact', 'locate_us'];
    if (infoPages.includes(normalizedSlug)) {
      navigateToInfoPage(normalizedSlug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalizedSlug === 'panchang') {
      window.location.href = '/panchang';
      return;
    }

    if (normalizedSlug === 'rashifal' || normalizedSlug === 'horoscope') {
      window.location.href = '/rashifal';
      return;
    }

    if (normalizedSlug === 'sitemap') {
      window.location.href = '/sitemap';
      return;
    }

    if (cleanUrl) {
      navigateToCustomPage(cleanUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigateToHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getItemActive = (item: MobileBottomNavItem) => {
    const act = item.actionType || (item as any).action;
    if (act === 'home') return isHomeActive;
    if (act === 'tours') return isToursActive;
    if (act === 'destinations') return isDestinationsActive;
    if (act === 'custom' && item.url) {
      const normalizedSlug = item.url.replace(/^\/+/, '').toLowerCase();
      return activeCustomPageSlug === item.url || activeInfoPage === item.url || activeInfoPage === normalizedSlug;
    }
    return false;
  };

  return (
    <nav
      id="mobile-bottom-app-nav"
      aria-label="Bottom App Navigation"
      className="fixed bottom-0 left-0 right-0 md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-xl md:rounded-2xl md:border md:border-stone-200/90 md:shadow-2xl z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,8px)] md:pb-0 transition-all duration-300"
    >
      <div className="max-w-md md:max-w-none md:min-w-[420px] mx-auto px-2 md:px-4 py-1.5 flex items-center justify-around gap-1 md:gap-3">
        {navItems.map((item) => {
          const isActive = getItemActive(item);
          const isChat = (item.actionType || (item as any).action) === 'whatsapp' || item.icon === 'chat';

          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-nav-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] ${
                isChat
                  ? 'text-emerald-600 hover:text-emerald-700 font-bold'
                  : isActive
                  ? 'text-[#9b0000] font-black'
                  : 'text-stone-500 hover:text-stone-800 font-semibold'
              }`}
            >
              <div className="relative">
                {renderIcon(item.icon, isActive)}
                {item.actionType === 'tours' && publishedCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#9b0000] text-white border border-[#9b0000]/40 text-[8px] font-black rounded-full leading-tight shadow-xs">
                    {publishedCount}
                  </span>
                )}
                {isActive && !isChat && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#9b0000] shadow-2xs" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap ${
                  isChat
                    ? 'font-black text-emerald-700'
                    : isActive
                    ? 'font-black text-[#9b0000]'
                    : 'font-medium text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

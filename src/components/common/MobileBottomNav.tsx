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
    openCustomPage,
    openInfo,
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
    const rawPhone = agencySettings.whatsappConciergeNumber || agencySettings.whatsapp || agencySettings.primaryPhone || '+919419915255';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      'Hi Bhakti Sathi! I would like to inquire about holiday packages and custom itineraries.'
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    const phone = agencySettings.primaryPhone || agencySettings.phone || '+919419915255';
    window.open(`tel:${phone.replace(/\s+/g, '')}`, '_self');
  };

  // Only show in traveler view
  if (activeView !== 'traveler') return null;

  const navItems: MobileBottomNavItem[] = (agencySettings.bottomNavItems && agencySettings.bottomNavItems.length > 0)
    ? agencySettings.bottomNavItems.filter((i) => i.enabled !== false)
    : DEFAULT_BOTTOM_NAV_ITEMS;

  const renderIcon = (iconName: string, isActive: boolean) => {
    const iconClass = `w-5 h-5 transition-transform ${
      isActive ? 'scale-110 stroke-[2.5] text-[#FF4B00]' : 'stroke-2 text-stone-500'
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
    switch (item.actionType) {
      case 'home':
        navigateToHome();
        break;
      case 'tours':
        navigateToAllTours();
        break;
      case 'destinations':
        navigateToDestinationsExplorer();
        break;
      case 'whatsapp':
        handleWhatsApp();
        break;
      case 'call':
        handleCall();
        break;
      case 'custom':
        if (item.url) {
          if (item.url.startsWith('http')) {
            window.open(item.url, '_blank');
          } else if (item.url === 'about' || item.url === 'faq' || item.url === 'terms') {
            openInfo(item.url);
          } else {
            openCustomPage(item.url);
          }
        }
        break;
      default:
        navigateToHome();
    }
  };

  const getItemActive = (item: MobileBottomNavItem) => {
    if (item.actionType === 'home') return isHomeActive;
    if (item.actionType === 'tours') return isToursActive;
    if (item.actionType === 'destinations') return isDestinationsActive;
    if (item.actionType === 'custom' && item.url) {
      return activeCustomPageSlug === item.url || activeInfoPage === item.url;
    }
    return false;
  };

  return (
    <nav
      id="mobile-bottom-app-nav"
      aria-label="Mobile Bottom App Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,8px)] transition-all duration-300"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = getItemActive(item);
          const isChat = item.actionType === 'whatsapp' || item.icon === 'chat';

          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-nav-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] ${
                isChat
                  ? 'text-emerald-600 hover:text-emerald-700 font-bold'
                  : isActive
                  ? 'text-[#FF4B00] font-black'
                  : 'text-stone-500 hover:text-stone-800 font-semibold'
              }`}
            >
              <div className="relative">
                {renderIcon(item.icon, isActive)}
                {item.actionType === 'tours' && publishedCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#FF4B00] text-white border border-[#FF4B00]/40 text-[8px] font-black rounded-full leading-tight shadow-xs">
                    {publishedCount}
                  </span>
                )}
                {isActive && !isChat && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF4B00] shadow-2xs" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none ${
                  isChat
                    ? 'font-black text-emerald-700'
                    : isActive
                    ? 'font-black text-[#FF4B00]'
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

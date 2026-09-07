/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { TourProvider, useTours } from './context/TourContext';
import { LuxuryHomepage } from './components/traveler/LuxuryHomepage';
import { EnhancedTourExperience } from './components/traveler/EnhancedTourExperience';
import { DestinationPage } from './components/traveler/DestinationPage';
import { AllDestinationsExplorer } from './components/traveler/AllDestinationsExplorer';
import { TravelBlogHub } from './components/traveler/TravelBlogHub';
import { BlogPostDetailView } from './components/traveler/BlogPostDetailView';
import { AllToursDirectory } from './components/traveler/AllToursDirectory';
import { CustomPageDetailView } from './components/traveler/CustomPageDetailView';
import { InfoPageView } from './components/traveler/InfoPageView';
import { EnhancedERP } from './components/cms/EnhancedERP';
import { SplashScreen } from './components/common/SplashScreen';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { FloatingSupportWidget } from './components/common/FloatingSupportWidget';
import { PushNotificationDrawer } from './components/common/PushNotificationDrawer';
import { PushPermissionBanner } from './components/common/PushPermissionBanner';
import { TravelerProfilePage } from './components/traveler/TravelerProfilePage';
import { TravelerAuthModal } from './components/traveler/TravelerAuthModal';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { JapCounterPageV2 } from './components/traveler/JapCounterPageV2';
import { PanchangCalendarPageV3 } from './components/traveler/PanchangCalendarPageV3';
import { HoroscopePage } from './components/traveler/HoroscopePage';
import { Settings } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeView, setActiveView, selectedPackageId, selectedDestinationSlug, isDestinationsExplorerOpen, isToursDirectoryOpen, selectedToursDestination, isBlogHubOpen, activeBlogSlug, activeCustomPageSlug, activeInfoPage, setActiveInfoPage, isTravelerProfileOpen, isJapCounterOpen } = useTours();
  const [showSplash, setShowSplash] = useState(true);
  const [pathname, setPathname] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '/');
  useEffect(() => { const syncPath = () => setPathname(window.location.pathname); window.addEventListener('popstate', syncPath); return () => window.removeEventListener('popstate', syncPath); }, []);
  const isPanchangOpen = pathname === '/panchang' || pathname === '/panchang/';
  const isHoroscopeOpen = pathname === '/rashifal' || pathname === '/rashifal/';
  const isHome = activeView === 'traveler' && !isPanchangOpen && !isHoroscopeOpen && !isJapCounterOpen && !isTravelerProfileOpen && !activeBlogSlug && !isBlogHubOpen && !isToursDirectoryOpen && !activeCustomPageSlug && !activeInfoPage && !selectedPackageId && !selectedDestinationSlug && !isDestinationsExplorerOpen;
  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white">
        {activeView !== 'traveler' ? <EnhancedERP /> : isPanchangOpen ? <PanchangCalendarPageV3 /> : isHoroscopeOpen ? <HoroscopePage /> : isJapCounterOpen ? <JapCounterPageV2 /> : isTravelerProfileOpen ? <TravelerProfilePage /> : activeBlogSlug ? <BlogPostDetailView slug={activeBlogSlug} /> : isBlogHubOpen ? <TravelBlogHub /> : isToursDirectoryOpen ? <AllToursDirectory initialDestinationSlug={selectedToursDestination || undefined} /> : activeCustomPageSlug ? <CustomPageDetailView slug={activeCustomPageSlug} /> : activeInfoPage ? <InfoPageView pageSlug={activeInfoPage} onBack={() => setActiveInfoPage(null)} /> : selectedPackageId ? <EnhancedTourExperience /> : selectedDestinationSlug ? <DestinationPage /> : isDestinationsExplorerOpen ? <AllDestinationsExplorer /> : <LuxuryHomepage />}
        {activeView === 'traveler' && !isPanchangOpen && !isHoroscopeOpen && <MobileBottomNav />}
        {activeView === 'traveler' && !isPanchangOpen && !isHoroscopeOpen && <FloatingSupportWidget />}
        <PushNotificationDrawer />
        {activeView === 'traveler' && !isPanchangOpen && !isHoroscopeOpen && <PushPermissionBanner />}
        <TravelerAuthModal />
        <PWAInstallButton />
        {isHome && <></>}
        {activeView === 'traveler' && (
          <button type="button" onClick={() => { setActiveView('cms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="fixed left-3 bottom-20 md:bottom-6 sm:left-6 z-[90] flex items-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-xl border transition-all duration-300 cursor-pointer text-[11px] sm:text-xs font-black tracking-wider bg-stone-900/95 backdrop-blur-md text-white border-stone-700/80 hover:bg-black hover:scale-105 shadow-stone-900/25" title="Open CMS / Operations Hub">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FC3200]" />
            <span className="hidden xs:inline">CMS HUB</span><span className="xs:hidden">CMS</span>
          </button>
        )}
      </div>
    </>
  );
};

export default function App() { return <TourProvider><MainAppContent /></TourProvider>; }

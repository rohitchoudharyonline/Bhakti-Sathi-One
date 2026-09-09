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
import { TravelerProfilePage } from './components/traveler/TravelerProfilePage';
import { TravelerAuthModal } from './components/traveler/TravelerAuthModal';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { JapCounterPageV2 } from './components/traveler/JapCounterPageV2';
import { PanchangCalendarPageV3 } from './components/traveler/PanchangCalendarPageV3';
import { HoroscopePage } from './components/traveler/HoroscopePage';
import { PublicGuidesHub } from './components/traveler/PublicGuidesHub';
import { GuideDetailView } from './components/traveler/GuideDetailView';
import { SitemapPage } from './components/traveler/SitemapPage';
import { Settings } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedPackageId,
    selectedDestinationSlug,
    isDestinationsExplorerOpen,
    isToursDirectoryOpen,
    selectedToursDestination,
    isBlogHubOpen,
    activeBlogSlug,
    isGuidesHubOpen,
    activeGuideSlug,
    activeCustomPageSlug,
    activeInfoPage,
    setActiveInfoPage,
    isTravelerProfileOpen,
    isJapCounterOpen,
  } = useTours();
  const [showSplash, setShowSplash] = useState(true);
  const [pathname, setPathname] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '/');
  useEffect(() => { const syncPath = () => setPathname(window.location.pathname); window.addEventListener('popstate', syncPath); return () => window.removeEventListener('popstate', syncPath); }, []);
  const isPanchangOpen = pathname === '/panchang' || pathname === '/panchang/';
  const isHoroscopeOpen = pathname === '/rashifal' || pathname === '/rashifal/';
  const isSitemapOpen = pathname === '/sitemap' || pathname === '/sitemap/' || pathname === '/sitemap.html';
  const isHome = activeView === 'traveler' && !isSitemapOpen && !isPanchangOpen && !isHoroscopeOpen && !isJapCounterOpen && !isTravelerProfileOpen && !isGuidesHubOpen && !activeGuideSlug && !activeBlogSlug && !isBlogHubOpen && !isToursDirectoryOpen && !activeCustomPageSlug && !activeInfoPage && !selectedPackageId && !selectedDestinationSlug && !isDestinationsExplorerOpen;
  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white">
        {activeView !== 'traveler' ? <EnhancedERP /> : isSitemapOpen ? <SitemapPage /> : isPanchangOpen ? <PanchangCalendarPageV3 /> : isHoroscopeOpen ? <HoroscopePage /> : isJapCounterOpen ? <JapCounterPageV2 /> : isTravelerProfileOpen ? <TravelerProfilePage /> : activeGuideSlug ? <GuideDetailView slug={activeGuideSlug} /> : isGuidesHubOpen ? <PublicGuidesHub /> : activeBlogSlug ? <BlogPostDetailView slug={activeBlogSlug} /> : isBlogHubOpen ? <TravelBlogHub /> : isToursDirectoryOpen ? <AllToursDirectory initialDestinationSlug={selectedToursDestination || undefined} /> : activeCustomPageSlug ? <CustomPageDetailView slug={activeCustomPageSlug} /> : activeInfoPage ? <InfoPageView pageSlug={activeInfoPage} onBack={() => setActiveInfoPage(null)} /> : selectedPackageId ? <EnhancedTourExperience /> : selectedDestinationSlug ? <DestinationPage /> : isDestinationsExplorerOpen ? <AllDestinationsExplorer /> : <LuxuryHomepage />}
        {activeView === 'traveler' && !isSitemapOpen && !isPanchangOpen && !isHoroscopeOpen && <MobileBottomNav />}
        {activeView === 'traveler' && !isSitemapOpen && !isPanchangOpen && !isHoroscopeOpen && <FloatingSupportWidget />}
        <TravelerAuthModal />
        <PWAInstallButton />
        {isHome && <></>}

      </div>
    </>
  );
};

export default function App() { return <TourProvider><MainAppContent /></TourProvider>; }

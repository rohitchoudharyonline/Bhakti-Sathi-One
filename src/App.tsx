/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { TourProvider, useTours } from './context/TourContext';
import { LuxuryHomepage } from './components/traveler/LuxuryHomepage';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { FloatingSupportWidget } from './components/common/FloatingSupportWidget';
import { SplashScreen } from './components/common/SplashScreen';
import { TravelerAuthSessionSync } from './components/auth/TravelerAuthSessionSync';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { trackPageView } from './utils/analytics';

const EnhancedERP = lazy(() => import('./components/cms/EnhancedERP').then((m) => ({ default: m.EnhancedERP })));
const EnhancedTourExperience = lazy(() => import('./components/traveler/EnhancedTourExperience').then((m) => ({ default: m.EnhancedTourExperience })));
const DestinationPage = lazy(() => import('./components/traveler/DestinationPage').then((m) => ({ default: m.DestinationPage })));
const AllDestinationsExplorer = lazy(() => import('./components/traveler/AllDestinationsExplorer').then((m) => ({ default: m.AllDestinationsExplorer })));
const TravelBlogHub = lazy(() => import('./components/traveler/TravelBlogHub').then((m) => ({ default: m.TravelBlogHub })));
const BlogPostDetailView = lazy(() => import('./components/traveler/BlogPostDetailView').then((m) => ({ default: m.BlogPostDetailView })));
const AllToursDirectory = lazy(() => import('./components/traveler/AllToursDirectory').then((m) => ({ default: m.AllToursDirectory })));
const CustomPageDetailView = lazy(() => import('./components/traveler/CustomPageDetailView').then((m) => ({ default: m.CustomPageDetailView })));
const InfoPageView = lazy(() => import('./components/traveler/InfoPageView').then((m) => ({ default: m.InfoPageView })));
const TravelerProfilePage = lazy(() => import('./components/traveler/TravelerProfilePage').then((m) => ({ default: m.TravelerProfilePage })));
import { TravelerAuthModal } from './components/traveler/TravelerAuthModal';
import { AdminFloatingBar } from './components/cms/AdminFloatingBar';
const TravelerGoogleAuthPage = lazy(() => import('./components/traveler/TravelerGoogleAuthPage').then((m) => ({ default: m.TravelerGoogleAuthPage })));
const JapCounterPageV2 = lazy(() => import('./components/traveler/JapCounterPageV2').then((m) => ({ default: m.JapCounterPageV2 })));
const PanchangCalendarPageV3 = lazy(() => import('./components/traveler/PanchangCalendarPageV3').then((m) => ({ default: m.PanchangCalendarPageV3 })));
const HoroscopePage = lazy(() => import('./components/traveler/HoroscopePage').then((m) => ({ default: m.HoroscopePage })));
const PublicGuidesHub = lazy(() => import('./components/traveler/PublicGuidesHub').then((m) => ({ default: m.PublicGuidesHub })));
const GuideDetailView = lazy(() => import('./components/traveler/GuideDetailView').then((m) => ({ default: m.GuideDetailView })));
const SitemapPage = lazy(() => import('./components/traveler/SitemapPage').then((m) => ({ default: m.SitemapPage })));

const CMS_ENTRY_PATH = '/admin-rudra-0712';
const isCmsEntryPath = (path: string) => {
  if (!path) return false;
  const norm = path.toLowerCase().split('?')[0].replace(/\/+$/, '');
  return norm === CMS_ENTRY_PATH;
};

const RouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center" aria-label="Loading">
    <div className="w-7 h-7 rounded-full border-2 border-stone-300 border-t-[#FF4B00] animate-spin" />
  </div>
);

const shouldShowInitialSplash = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    // 1. If it's a browser reload/refresh, NEVER show splash
    const navEntries = window.performance?.getEntriesByType?.('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      if (nav.type === 'reload') return false;
    }
    // Legacy fallback check for reload
    if ((window.performance as any)?.navigation?.type === 1) {
      return false;
    }

    // 2. If already seen in this session or device, NEVER show splash
    if (sessionStorage.getItem('hh_splash_seen') === '1' || localStorage.getItem('hh_splash_seen') === '1') {
      return false;
    }

    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    // 3. Never show on admin or ANY sub-page (tours, destinations, blogs, guides, panchang, etc.)
    if (path !== '/') {
      sessionStorage.setItem('hh_splash_seen', '1');
      return false;
    }

    // Mark as seen immediately so any rapid refresh won't show it again
    sessionStorage.setItem('hh_splash_seen', '1');
    localStorage.setItem('hh_splash_seen', '1');
    return true;
  } catch {
    return false;
  }
};

const MainAppContent: React.FC = () => {
  const {
    activeView,
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
    travelerUser,
    setActiveView,
  } = useTours();
  const [showSplash, setShowSplash] = useState(() => shouldShowInitialSplash());
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));

  useEffect(() => {
    // Intercept pushState & replaceState so local URL changes react immediately in App
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      const res = originalPush.apply(this, args);
      setPathname(window.location.pathname);
      return res;
    };

    window.history.replaceState = function (...args) {
      const res = originalReplace.apply(this, args);
      setPathname(window.location.pathname);
      return res;
    };

    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener('popstate', syncPath);
    };
  }, []);

  const cmsEntry = isCmsEntryPath(pathname);

  useEffect(() => {
    if (cmsEntry) return;
    const timer = window.setTimeout(() => trackPageView(pathname), 0);
    return () => window.clearTimeout(timer);
  }, [pathname, cmsEntry]);

  useEffect(() => {
    if (cmsEntry) {
      if (activeView !== 'cms') setActiveView('cms');
    } else if (activeView === 'cms') {
      setActiveView('traveler');
    }
  }, [cmsEntry, activeView, setActiveView]);

  const isPanchangOpen = pathname === '/panchang' || pathname === '/panchang/';
  const isHoroscopeOpen = pathname === '/rashifal' || pathname === '/rashifal/';
  const isSitemapOpen = pathname === '/sitemap' || pathname === '/sitemap/' || pathname === '/sitemap.html' || pathname === '/info/sitemap' || pathname === '/info/sitemap/' || activeInfoPage === 'sitemap';
  const showTravelerGoogleAuth = activeView === 'traveler' && isTravelerProfileOpen && !travelerUser;
  const showCms = cmsEntry || activeView === 'cms';

  return (
    <>
      <TravelerAuthSessionSync />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white">
        <ErrorBoundary fallbackTitle="Travel Experience Loading" fallbackMessage="There was a temporary issue loading this Holidays Hunt travel experience. Please reload to refresh the latest destinations and tour details.">
          <Suspense fallback={<RouteFallback />}>
            {showCms ? <EnhancedERP /> : showTravelerGoogleAuth ? <TravelerGoogleAuthPage /> : isSitemapOpen ? <SitemapPage /> : isPanchangOpen ? <PanchangCalendarPageV3 /> : isHoroscopeOpen ? <HoroscopePage /> : isJapCounterOpen ? <JapCounterPageV2 /> : isTravelerProfileOpen ? <TravelerProfilePage /> : activeGuideSlug ? <GuideDetailView slug={activeGuideSlug} /> : isGuidesHubOpen ? <PublicGuidesHub /> : activeBlogSlug ? <BlogPostDetailView slug={activeBlogSlug} /> : isBlogHubOpen ? <TravelBlogHub /> : isToursDirectoryOpen ? <AllToursDirectory initialDestinationSlug={selectedToursDestination || undefined} /> : activeCustomPageSlug ? <CustomPageDetailView slug={activeCustomPageSlug} /> : activeInfoPage ? <InfoPageView pageSlug={activeInfoPage} onBack={() => setActiveInfoPage(null)} /> : selectedPackageId ? <EnhancedTourExperience /> : selectedDestinationSlug ? <DestinationPage /> : isDestinationsExplorerOpen ? <AllDestinationsExplorer /> : <LuxuryHomepage />}
          </Suspense>
        </ErrorBoundary>
        {/* {activeView === 'traveler' && !showTravelerGoogleAuth && !isSitemapOpen && !isPanchangOpen && !isHoroscopeOpen && <MobileBottomNav />} */}
        {activeView === 'traveler' && !showTravelerGoogleAuth && !isSitemapOpen && !isPanchangOpen && !isHoroscopeOpen && <FloatingSupportWidget />}
        {!showTravelerGoogleAuth && <TravelerAuthModal />}
        <AdminFloatingBar />
      </div>
    </>
  );
};

export default function App() {
  return <TourProvider><MainAppContent /></TourProvider>;
}

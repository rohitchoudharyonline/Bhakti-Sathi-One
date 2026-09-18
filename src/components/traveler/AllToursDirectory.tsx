import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { TourPackage } from '../../types/tour';
import { DestinationMeta, getDestinationBySlug, matchPackageToDestination } from '../../data/destinationsData';
import { updatePageSeo } from '../../utils/seo';
import { generateBreadcrumbSchema } from '../../utils/seoEngine';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { formatPackagePrice } from '../../utils/priceHelper';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import { FreeTravelInsuranceCard } from './FreeTravelInsuranceCard';
import {
  Compass,
  Search,
  Star,
  MapPin,
  Clock,
  Check,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Hotel,
  ShieldCheck,
  Users,
  SlidersHorizontal,
  X,
  RotateCcw,
  Tag,
  Calendar,
  Landmark,
  MessageCircle,
  Shirt,
  CalendarDays,
} from 'lucide-react';

interface AllToursDirectoryProps {
  initialDestinationSlug?: string;
}

export const AllToursDirectory: React.FC<AllToursDirectoryProps> = ({
  initialDestinationSlug,
}) => {
  const {
    packages,
    destinations,
    temples,
    mediaAssets,
    agencySettings,
    systemSearchParams,
    navigateToHome,
    navigateToPackage,
    navigateToDestination,
    navigateToSearch,
    setSelectedPackageId,
    pageSeoConfigs,
  } = useTours();

  const [selectedDestSlug, setSelectedDestSlug] = useState<string>(
    systemSearchParams?.destinationSlug || initialDestinationSlug || 'all'
  );
  const [selectedTempleId, setSelectedTempleId] = useState<string>(
    systemSearchParams?.templeId || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    systemSearchParams?.category || 'all'
  );
  const [selectedDuration, setSelectedDuration] = useState<string>(
    systemSearchParams?.duration || 'all'
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    systemSearchParams?.month || 'any'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    systemSearchParams?.searchQuery || ''
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'duration'>('featured');

  // Sync state when systemSearchParams changes
  useEffect(() => {
    if (systemSearchParams) {
      if (systemSearchParams.destinationSlug !== undefined) {
        setSelectedDestSlug(systemSearchParams.destinationSlug || 'all');
      }
      if (systemSearchParams.templeId !== undefined) {
        setSelectedTempleId(systemSearchParams.templeId || 'all');
      } else if (systemSearchParams.templeName !== undefined) {
        const queryName = (systemSearchParams.templeName || '').toLowerCase().trim();
        const found = temples.find(
          (t) =>
            t &&
            (((t.name || '').toLowerCase() === queryName) ||
              ((t.slug || '').toLowerCase() === queryName) ||
              (queryName && (t.name || '').toLowerCase().includes(queryName)))
        );
        setSelectedTempleId(found ? found.id : 'all');
      }
      if (systemSearchParams.category !== undefined) {
        setSelectedCategory(systemSearchParams.category || 'all');
      }
      if (systemSearchParams.searchQuery !== undefined) {
        setSearchQuery(systemSearchParams.searchQuery || '');
      }
      if (systemSearchParams.month !== undefined) {
        setSelectedMonth(systemSearchParams.month || 'any');
      }
      if (systemSearchParams.duration !== undefined) {
        setSelectedDuration(systemSearchParams.duration || 'all');
      }
    }
  }, [systemSearchParams, temples]);

  const destinationList: DestinationMeta[] = Object.values(destinations || {}) as DestinationMeta[];
  const currentDestMeta = destinationList.find(
    (d) => d && (d.slug === selectedDestSlug || d.id === selectedDestSlug)
  );

  const selectedTempleMeta = temples.find(
    (t) => t && (t.id === selectedTempleId || t.slug === selectedTempleId)
  );

  // SEO & Dynamic Title / Schema Configuration
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://holidayshunt.com';
    const isTempleSpecific = selectedTempleId !== 'all' && selectedTempleMeta;
    const isDestSpecific = selectedDestSlug !== 'all' && currentDestMeta;
    const isCategorySpecific = selectedCategory !== 'all' && selectedCategory;

    const categorySeoKey = isCategorySpecific ? `tour-type-${selectedCategory.toLowerCase()}` : '';
    const categorySeo = categorySeoKey ? pageSeoConfigs?.[categorySeoKey] : null;
    const toursSeo = pageSeoConfigs?.['tours'];

    const pageTitle = isCategorySpecific
      ? categorySeo?.metaTitle || `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Tour Packages 2026 | Holidays Hunt`
      : isTempleSpecific
      ? `${selectedTempleMeta?.name} Pilgrimage & Darshan Tour Packages 2026 | Holidays Hunt`
      : isDestSpecific
      ? `${currentDestMeta?.name} Tour Packages 2026 | Holidays Hunt`
      : toursSeo?.metaTitle || 'Book Family, Honeymoon & Pilgrimage Tour Packages | Holidays Hunt';

    const pageDescription = isCategorySpecific
      ? categorySeo?.metaDescription || `Explore verified ${selectedCategory} tour packages across India and top international destinations.`
      : isTempleSpecific
      ? `Book customized pilgrimage itineraries and guided tour packages for ${selectedTempleMeta?.name}. Verified stays, private transfers, and experienced yatra guides.`
      : isDestSpecific
      ? `Explore all verified ${currentDestMeta?.name} holiday packages. Dedicated private cabs, inspected 3-star/4-star hotels, and 24/7 mountain support.`
      : toursSeo?.metaDescription || 'Explore and book verified Family, Honeymoon, and Pilgrimage tour packages across India and International destinations.';

    const canonicalPath = isCategorySpecific
      ? `/tour-type/${selectedCategory.toLowerCase()}`
      : isTempleSpecific
      ? `/tours?temple=${selectedTempleMeta?.slug || selectedTempleMeta?.id}`
      : isDestSpecific
      ? `/tours/${selectedDestSlug}`
      : '/tours';

    const breadcrumbs = isCategorySpecific
      ? generateBreadcrumbSchema([
          { name: 'Home', url: origin },
          { name: 'Tour Types', url: `${origin}/tours` },
          { name: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Tours`, url: `${origin}/tour-type/${selectedCategory.toLowerCase()}` },
        ])
      : isTempleSpecific
      ? generateBreadcrumbSchema([
          { name: 'Home', url: origin },
          { name: 'All Tours', url: `${origin}/tours` },
          { name: `${selectedTempleMeta?.name} Darshan`, url: `${origin}/tours?temple=${selectedTempleMeta?.slug || selectedTempleMeta?.id}` },
        ])
      : isDestSpecific
      ? generateBreadcrumbSchema([
          { name: 'Home', url: origin },
          { name: 'All Tours', url: `${origin}/tours` },
          { name: `${currentDestMeta?.name} Tours`, url: `${origin}/tours/${selectedDestSlug}` },
        ])
      : generateBreadcrumbSchema([
          { name: 'Home', url: origin },
          { name: 'All Tours', url: `${origin}/tours` },
        ]);

    updatePageSeo({
      title: pageTitle,
      description: pageDescription,
      canonicalUrl: isCategorySpecific && categorySeo?.canonicalUrl ? categorySeo.canonicalUrl : !isDestSpecific && !isTempleSpecific && toursSeo?.canonicalUrl ? toursSeo.canonicalUrl : undefined,
      canonicalPath,
      schemaData: breadcrumbs,
      noIndex: categorySeo?.noIndex || toursSeo?.noIndex,
      noFollow: categorySeo?.noFollow || toursSeo?.noFollow,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDestSlug, currentDestMeta, selectedTempleId, selectedTempleMeta, selectedCategory, pageSeoConfigs]);

  // Filtering & Sorting
  const filteredPackages = (packages || []).filter((pkg) => {
    if (!pkg) return false;
    if (pkg.status !== 'published') return false;

    // Destination
    if (selectedDestSlug !== 'all') {
      const match = matchPackageToDestination(pkg, selectedDestSlug);
      if (!match) return false;
    }

    // Sacred Temple / Place
    if (selectedTempleId !== 'all') {
      const targetTemple = temples.find(
        (t) => t && (t.id === selectedTempleId || t.slug === selectedTempleId)
      );
      const targetName = (targetTemple?.name || selectedTempleId || '').toLowerCase();
      const targetSlug = (targetTemple?.slug || selectedTempleId || '').toLowerCase();
      const targetId = (targetTemple?.id || selectedTempleId || '').toLowerCase();
      const targetCity = (targetTemple?.city || '').toLowerCase();

      // Extract core search keywords (e.g., "Vaishno Devi", "Shiv Khori", "Amarnath", "Golden Temple")
      const keywords = targetName
        .replace(/temple|shrine|mandir|bhawan|cave|sahib|darshan|ji/gi, '')
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 2);

      const titleLower = (pkg.title || '').toLowerCase();
      const taglineLower = (pkg.tagline || '').toLowerCase();
      const destLower = (pkg.destination || '').toLowerCase();
      const overviewLower = (pkg.overview || '').toLowerCase();
      const itineraryText = (pkg.itinerary || [])
        .map((d) => `${d?.title || ''} ${d?.description || ''}`)
        .join(' ')
        .toLowerCase();

      const match =
        pkg.templeIds?.some((id) => id && (id.toLowerCase() === targetId || id.toLowerCase() === targetSlug)) ||
        pkg.temples?.some(
          (name) =>
            name &&
            (name.toLowerCase() === targetName ||
              name.toLowerCase().includes(targetName) ||
              (targetName && targetName.includes(name.toLowerCase())))
        ) ||
        (targetName && titleLower.includes(targetName)) ||
        (targetName && taglineLower.includes(targetName)) ||
        (targetName && destLower.includes(targetName)) ||
        (targetName && overviewLower.includes(targetName)) ||
        (targetCity && (destLower.includes(targetCity) || titleLower.includes(targetCity))) ||
        (keywords.length > 0 &&
          keywords.some(
            (kw) =>
              titleLower.includes(kw) ||
              taglineLower.includes(kw) ||
              destLower.includes(kw) ||
              itineraryText.includes(kw)
          ));

      if (!match) return false;
    }

    // Category / Tour Type (Pilgrimage, Honeymoon, Family)
    if (selectedCategory !== 'all') {
      const cat = selectedCategory.toLowerCase();
      const pkgTourType = ((pkg as any).tourType || '').toLowerCase();
      const pkgCat = (pkg.category || '').toLowerCase();
      const pkgTitle = (pkg.title || '').toLowerCase();
      const pkgDesc = ((pkg as any).description || pkg.tagline || pkg.overview || '').toLowerCase();

      if (['family', 'honeymoon', 'pilgrimage'].includes(cat)) {
        const hasTourTypeMatch = pkgTourType === cat || pkgTourType.includes(cat);
        const hasCategoryMatch = pkgCat === cat || pkgCat.includes(cat);
        
        let hasKeywordMatch = false;
        if (cat === 'family') {
          hasKeywordMatch =
            pkgTitle.includes('family') ||
            pkgTitle.includes('vacation') ||
            pkgDesc.includes('family') ||
            (pkg as any).tags?.includes('family');
        } else if (cat === 'honeymoon') {
          hasKeywordMatch =
            pkgTitle.includes('honeymoon') ||
            pkgTitle.includes('romantic') ||
            pkgDesc.includes('honeymoon') ||
            pkgDesc.includes('romantic');
        } else if (cat === 'pilgrimage') {
          hasKeywordMatch =
            pkgCat.includes('yatra') ||
            pkgTitle.includes('yatra') ||
            pkgTitle.includes('vaishno') ||
            pkgTitle.includes('amritsar') ||
            (pkg.destination || '').toLowerCase() === 'jammu';
        }

        if (!hasTourTypeMatch && !hasCategoryMatch && !hasKeywordMatch) {
          return false;
        }
      } else if (cat === 'luxury') {
        const isLuxury =
          pkgCat.includes('luxury') ||
          pkgTitle.includes('luxury') ||
          pkgTitle.includes('premium') ||
          (pkg.price || 0) >= 25000;
        if (!isLuxury) return false;
      }
    }

    // Duration
    if (selectedDuration !== 'all') {
      const days = pkg.durationDays || parseInt((pkg as any).duration) || 0;
      if (selectedDuration === 'short' && days > 4) return false;
      if (selectedDuration === 'medium' && (days < 5 || days > 7)) return false;
      if (selectedDuration === 'long' && days < 8) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (pkg.title || '').toLowerCase().includes(q);
      const descMatch = ((pkg as any).description || pkg.tagline || pkg.overview || '').toLowerCase().includes(q);
      const destMatch = (pkg.destination || '').toLowerCase().includes(q);
      const cityMatch = (pkg as any).cities?.some((c: string) => c && c.toLowerCase().includes(q));
      const catMatch = (pkg.category || '').toLowerCase().includes(q);
      const inclMatch = pkg.inclusions?.some((inc) => inc && inc.toLowerCase().includes(q));

      if (!titleMatch && !descMatch && !destMatch && !cityMatch && !catMatch && !inclMatch) {
        return false;
      }
    }

    return true;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'duration') {
      const aDays = a.durationDays || parseInt((a as any).duration) || 0;
      const bDays = b.durationDays || parseInt((b as any).duration) || 0;
      return bDays - aDays;
    }
    return 0; // featured default
  });

  const handleDestinationChange = (slug: string) => {
    setSelectedDestSlug(slug);
    if (slug === 'all') {
      window.history.pushState({}, '', '/tours');
    } else {
      window.history.pushState({}, '', `/tours/${slug}`);
    }
  };

  const hasActivePreferences =
    selectedDestSlug !== 'all' ||
    selectedTempleId !== 'all' ||
    selectedCategory !== 'all' ||
    selectedDuration !== 'all' ||
    (selectedMonth && selectedMonth !== 'any') ||
    searchQuery.trim().length > 0;

  const handleResetPreferences = () => {
    setSelectedDestSlug('all');
    setSelectedTempleId('all');
    setSelectedCategory('all');
    setSelectedDuration('all');
    setSelectedMonth('any');
    setSearchQuery('');
    window.history.pushState({}, '', '/tours');
  };

  const whatsappNumber = (agencySettings?.whatsapp || '919419915255').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between font-sans selection:bg-stone-900 selection:text-white pb-20 lg:pb-0">
      <div>
        {/* Unified Top Navbar */}
        <Navbar />

        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-stone-200 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-stone-500">
            <button
              onClick={navigateToHome}
              className="hover:text-black font-medium transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button
              onClick={() => handleDestinationChange('all')}
              className={`hover:text-black font-medium transition cursor-pointer ${
                selectedDestSlug === 'all' && selectedTempleId === 'all' ? 'text-black font-bold' : ''
              }`}
            >
              All Tours Directory
            </button>
            {selectedTempleMeta && selectedTempleId !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-black font-bold">{selectedTempleMeta.name} Darshan</span>
              </>
            )}
            {currentDestMeta && selectedDestSlug !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-black font-bold">{currentDestMeta.name} Packages</span>
              </>
            )}
          </div>
        </div>

        {/* Dedicated Full Temple Hero Showcase when a Temple is Selected */}
        {selectedTempleMeta && selectedTempleId !== 'all' && (
          <div className="relative bg-stone-950 text-white overflow-hidden border-b border-stone-800">
            {/* Full High-Resolution Temple Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={resolveDisplayImage(selectedTempleMeta.image, mediaAssets)}
                alt={selectedTempleMeta.name}
                onError={(e) => handleImageError(e, selectedTempleMeta.image, mediaAssets)}
                className="w-full h-full object-cover object-center transform scale-105 filter blur-xs brightness-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/60" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Full Image Card */}
                <div className="lg:col-span-5 w-full">
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-stone-900 group">
                    <img
                      src={resolveDisplayImage(selectedTempleMeta.image, mediaAssets)}
                      alt={selectedTempleMeta.name}
                      onError={(e) => handleImageError(e, selectedTempleMeta.image, mediaAssets)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    {selectedTempleMeta.city && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow-md">
                        <span className="flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#FF4B00]" />
                          {selectedTempleMeta.city}, {selectedTempleMeta.state}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Temple Information & Actions */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] uppercase font-black tracking-wider px-3 py-1 rounded-full bg-[#FF4B00] text-white shadow-xs">
                        Sacred Shrine
                      </span>
                      {selectedTempleMeta.city && (
                        <span className="text-xs text-stone-300 font-medium flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {selectedTempleMeta.city}, {selectedTempleMeta.state}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                      {selectedTempleMeta.name}
                    </h1>

                    {selectedTempleMeta.tagline && (
                      <p className="text-sm sm:text-base text-stone-300 font-medium italic">
                        "{selectedTempleMeta.tagline}"
                      </p>
                    )}

                    {selectedTempleMeta.description && (
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal pt-1 max-w-2xl">
                        {selectedTempleMeta.description}
                      </p>
                    )}
                  </div>

                  {/* Temple Key Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-w-2xl">
                    {selectedTempleMeta.deity && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-start gap-2 text-xs">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Presiding Deity</span>
                          <span className="font-semibold text-white">{selectedTempleMeta.deity}</span>
                        </div>
                      </div>
                    )}

                    {selectedTempleMeta.darshanTimings && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-start gap-2 text-xs">
                        <Clock className="w-4 h-4 text-[#FF4B00] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Darshan Timings</span>
                          <span className="font-semibold text-white">{selectedTempleMeta.darshanTimings}</span>
                        </div>
                      </div>
                    )}

                    {selectedTempleMeta.dressCode && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-start gap-2 text-xs">
                        <Shirt className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Dress Code</span>
                          <span className="font-semibold text-white">{selectedTempleMeta.dressCode}</span>
                        </div>
                      </div>
                    )}

                    {selectedTempleMeta.bestTimeToVisit && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-start gap-2 text-xs">
                        <CalendarDays className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Best Time to Visit</span>
                          <span className="font-semibold text-white">{selectedTempleMeta.bestTimeToVisit}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Namaste Holidays Hunt, I want to book a customized sacred pilgrimage & darshan package for ${selectedTempleMeta.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-orange-950/40 inline-flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Custom Yatra Inquiry on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedTempleId('all')}
                      className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 backdrop-blur-md border border-white/15 active:scale-95"
                    >
                      <X className="w-4 h-4" />
                      <span>View All Shrines</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimalist Header Section with Integrated Search */}
        {(!selectedTempleMeta || selectedTempleId === 'all') && (
          <div id="search-widget-container" className="bg-white border-b border-stone-100 py-8 sm:py-10 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {selectedCategory && selectedCategory !== 'all' ? (
                    selectedCategory === 'pilgrimage' ? 'Pilgrimage Tours' :
                    selectedCategory === 'family' ? 'Family Tours' :
                    selectedCategory === 'honeymoon' ? 'Honeymoon Tours' :
                    selectedCategory === 'luxury' ? 'Luxury & Premium Tours' :
                    selectedCategory === 'group' ? 'Group Departures' :
                    `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Tours`
                  ) : currentDestMeta && selectedDestSlug !== 'all' ? (
                    `${currentDestMeta.name} Tour Packages`
                  ) : (
                    'All Tour Packages Directory'
                  )}
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
                  {selectedCategory && selectedCategory !== 'all' ? (
                    selectedCategory === 'pilgrimage' ? 'Book custom-tailored sacred yatras and holiday packages across Jammu Katra, Kashmir, Himachal Pradesh, Amritsar, and sacred Himalayan shrines.' :
                    selectedCategory === 'family' ? 'Handcrafted family holiday packages with spacious private cabs, kid & elder friendly hotel stays, and relaxed sightseeing itineraries.' :
                    selectedCategory === 'honeymoon' ? 'Romantic couples retreats with private chauffeur transfers, candle-light dinners, scenic mountain view resorts, and flower bed decorations.' :
                    selectedCategory === 'luxury' ? 'Ultra-premium holiday packages featuring 5-star royal palace stays, private luxury transfers, and exclusive VIP experiences.' :
                    selectedCategory === 'group' ? 'Join curated group tour departures across India and International circuits with experienced trip captains.' :
                    `Explore our handpicked ${selectedCategory} tour packages.`
                  ) : currentDestMeta && selectedDestSlug !== 'all' ? (
                    <>
                      Explore premium, fully customizable {currentDestMeta.name} Tour Packages with direct-operator pricing, handpicked stays, private chauffeur transfers, and 24/7 travel desk support.
                    </>
                  ) : (
                    <>
                      Explore our entire handpicked collection of Pilgrimage, Family, Honeymoon, and Group tour packages across top domestic and international destinations with transparent pricing and 24/7 travel support.
                    </>
                  )}
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full lg:max-w-md shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search packages (e.g. Vaishno Devi, Manali, 5 Days)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-[#FF4B00]/10 focus:border-[#FF4B00] transition shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Destination tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => handleDestinationChange('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedDestSlug === 'all'
                    ? 'bg-black text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                All Destinations ({packages.length})
              </button>
              {destinationList.map((dest) => (
                <button
                  key={dest.slug}
                  onClick={() => handleDestinationChange(dest.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedDestSlug === dest.slug
                      ? 'bg-black text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {dest.name}
                </button>
              ))}
            </div>

            {/* Criteria Controls: Temple, Category, Duration & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Temple / Shrine Selection Dropdown */}
              <select
                value={selectedTempleId}
                onChange={(e) => setSelectedTempleId(e.target.value)}
                className={`p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/20 border ${
                  selectedTempleId !== 'all'
                    ? 'bg-orange-50 border-[#FF4B00] text-[#FF4B00]'
                    : 'bg-stone-100 border-stone-200 text-stone-800'
                }`}
              >
                <option value="all">All Temples & Shrines ({temples.length})</option>
                {temples.map((temple) => (
                  <option key={temple.id} value={temple.id}>
                    {temple.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val);
                  navigateToSearch({
                    category: val,
                    destinationSlug: selectedDestSlug,
                    templeId: selectedTempleId !== 'all' ? selectedTempleId : undefined,
                    searchQuery: searchQuery || undefined,
                  });
                }}
                className="p-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/20"
              >
                <option value="all">All Tour Types</option>
                <option value="pilgrimage">Pilgrimage Tours</option>
                <option value="family">Family Tours</option>
                <option value="honeymoon">Honeymoon Tours</option>
                <option value="group">Group Tours</option>
                <option value="luxury">Luxury & Premium</option>
              </select>

              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="p-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/20"
              >
                <option value="all">All Durations</option>
                <option value="short">Short Break (2 - 4 Days)</option>
                <option value="medium">Classic (5 - 7 Days)</option>
                <option value="long">Grand Holiday (8+ Days)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/20"
              >
                <option value="featured">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Criteria Tags Bar */}
        {hasActivePreferences && (
          <div className="bg-stone-100/90 border-b border-stone-200/80 py-2.5 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black uppercase text-[10px] tracking-wider text-stone-500 flex items-center gap-1">
                  Selected Criteria:
                </span>
                {selectedDestSlug !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900 shadow-2xs">
                    <MapPin className="w-3 h-3 text-[#FF4B00]" />
                    {currentDestMeta?.name || selectedDestSlug}
                    <button onClick={() => setSelectedDestSlug('all')} className="hover:text-[#FF4B00] ml-1 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTempleId !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900 shadow-2xs">
                    <Landmark className="w-3 h-3 text-[#FF4B00]" />
                    {selectedTempleMeta?.name || selectedTempleId}
                    <button onClick={() => setSelectedTempleId('all')} className="hover:text-[#FF4B00] ml-1 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900 shadow-2xs capitalize">
                    <Tag className="w-3 h-3 text-[#FF4B00]" />
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-[#FF4B00] ml-1 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900 shadow-2xs">
                    <Search className="w-3 h-3 text-[#FF4B00]" />
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-[#FF4B00] ml-1 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedMonth !== 'any' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900 shadow-2xs uppercase">
                    <Calendar className="w-3 h-3 text-[#FF4B00]" />
                    Month: {selectedMonth}
                    <button onClick={() => setSelectedMonth('any')} className="hover:text-[#FF4B00] ml-1 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={handleResetPreferences}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4B00] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Tours Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Compass className="w-5 h-5 text-stone-600" />
              {selectedCategory && selectedCategory !== 'all'
                ? `Available ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Packages (${sortedPackages.length})`
                : selectedTempleId !== 'all' && selectedTempleMeta
                ? `Available ${selectedTempleMeta.name} Packages (${sortedPackages.length})`
                : selectedDestSlug !== 'all' && currentDestMeta
                ? `Available ${currentDestMeta.name} Tour Packages (${sortedPackages.length})`
                : `Available Tour Packages (${sortedPackages.length})`}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPackages.map((pkg) => {
              const coverImg = resolveDisplayImage(pkg.coverImage || (pkg as any).image, mediaAssets);
              const priceResult = formatPackagePrice(
                pkg.price,
                pkg.discountedPrice,
                agencySettings.currencySymbol,
                pkg.priceOnRequest || (!pkg.price && !pkg.discountedPrice) || (pkg.price <= 0 && (!pkg.discountedPrice || pkg.discountedPrice <= 0))
              );

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-black transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with badges */}
                    <div className="aspect-16/10 relative overflow-hidden bg-stone-100">
                      <img
                        src={coverImg}
                        alt={pkg.title}
                        onError={(e) => handleImageError(e, pkg.coverImage || (pkg as any).image, mediaAssets)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-black/80 text-white font-bold text-xs rounded-lg uppercase tracking-wider backdrop-blur-xs">
                        {pkg.destination || 'Himalayas'}
                      </span>
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 text-black font-black text-xs rounded-lg shadow-sm">
                        {pkg.durationDays ? `${pkg.durationDays}D / ${pkg.durationNights}N` : (pkg as any).duration || '3D / 2N'}
                      </span>
                      {pkg.rating && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-black text-black" />
                          {pkg.rating}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1.5">
                        <h3
                          onClick={() => navigateToPackage(pkg.id)}
                          className="text-base sm:text-lg font-bold text-black leading-snug cursor-pointer group-hover:text-[#FF4B00] transition line-clamp-2"
                        >
                          {pkg.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {pkg.tagline || pkg.overview || (pkg as any).description || ''}
                        </p>
                      </div>

                      {/* Inclusions Highlights */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        {pkg.inclusions?.slice(0, 3).map((inc, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA Footer */}
                  <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">
                          {priceResult.isPriceOnRequest ? 'Quotation' : 'Starting From'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          {priceResult.isPriceOnRequest ? (
                            <span className="text-base sm:text-lg font-black text-black">
                              Price on Request
                            </span>
                          ) : (
                            <>
                              <span className="text-lg font-black text-black">
                                {priceResult.displayPrice}
                              </span>
                              {priceResult.originalPrice && (
                                <span className="text-[11px] font-bold text-stone-400 line-through">
                                  {priceResult.originalPrice}
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400">/ person</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateToPackage(pkg.id)}
                          className="px-3.5 py-2 bg-white border border-stone-200 hover:border-black rounded-xl text-xs font-bold text-black transition cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => navigateToPackage(pkg.id)}
                          className="px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          Inquire
                        </button>
                      </div>
                    </div>

                    {/* Free Travel Insurance card below price */}
                    <FreeTravelInsuranceCard variant="compact" />
                  </div>
                </div>
              );
            })}
          </div>

          {sortedPackages.length === 0 && (
            <div className="py-14 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-xl mx-auto">
              <Landmark className="w-12 h-12 text-[#FF4B00] mx-auto" />
              <h4 className="text-lg font-bold text-black">
                {selectedTempleMeta ? `Custom Yatra to ${selectedTempleMeta.name}` : 'No packages match your criteria'}
              </h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                {selectedTempleMeta
                  ? `We offer customized sacred pilgrimage itineraries, certified hotel stays, helicopter arrangements, and private chauffeur transfers to ${selectedTempleMeta.name}. Connect with our sacred pilgrimage desk to craft your custom yatra.`
                  : 'Try selecting "All Destinations" or clearing your search term to browse all available packages.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Namaste Holidays Hunt, I would like to arrange a customized pilgrimage tour package for ${selectedTempleMeta?.name || 'this sacred shrine'}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Inquire on WhatsApp</span>
                </a>
                <button
                  onClick={handleResetPreferences}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  View All Packages
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <GlobalFooter />
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { TourPackage } from '../../types/tour';
import { DestinationMeta } from '../../data/destinationsData';
import { updatePageSeo } from '../../utils/seo';
import { generateTouristTripSchema, generateBreadcrumbSchema } from '../../utils/seoEngine';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import { FreeTravelInsuranceCard } from './FreeTravelInsuranceCard';
import {
  Compass,
  Search,
  Filter,
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
    agencySettings,
    systemSearchParams,
    navigateToHome,
    navigateToPackage,
    navigateToDestination,
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
        const found = temples.find(
          (t) =>
            t.name.toLowerCase() === systemSearchParams.templeName?.toLowerCase() ||
            t.slug.toLowerCase() === systemSearchParams.templeName?.toLowerCase()
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

  const destinationList: DestinationMeta[] = Object.values(destinations) as DestinationMeta[];
  const currentDestMeta = destinationList.find(
    (d) => d.slug === selectedDestSlug || d.id === selectedDestSlug
  );

  // SEO & Dynamic Title / Schema Configuration
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
    const isDestSpecific = selectedDestSlug !== 'all' && currentDestMeta;
    const toursSeo = pageSeoConfigs?.['tours'];

    const pageTitle = isDestSpecific
      ? `${currentDestMeta?.name} Tour Packages 2026 | Bhakti Sathi`
      : toursSeo?.metaTitle || 'Book Sacred Yatra & Spiritual Pilgrimage Packages | Bhakti Sathi';

    const pageDescription = isDestSpecific
      ? `Explore all verified ${currentDestMeta?.name} holiday packages. Dedicated private cabs, inspected 3-star/4-star hotels, and 24/7 mountain support.`
      : toursSeo?.metaDescription || 'Book premium spiritual and devotional tour packages. Unbeatable local prices, private cabs, premium stays, and 24/7 mountain assistance.';

    const canonicalPath = isDestSpecific ? `/tours/${selectedDestSlug}` : '/tours';

    const breadcrumbs = isDestSpecific
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
      canonicalUrl: !isDestSpecific && toursSeo?.canonicalUrl ? toursSeo.canonicalUrl : undefined,
      canonicalPath,
      schemaData: breadcrumbs,
      noIndex: toursSeo?.noIndex,
      noFollow: toursSeo?.noFollow,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDestSlug, currentDestMeta, pageSeoConfigs]);

  // Filtering & Sorting
  const filteredPackages = packages.filter((pkg) => {
    // Destination filter
    if (selectedDestSlug !== 'all') {
      const match =
        pkg.destination?.toLowerCase() === selectedDestSlug.toLowerCase() ||
        pkg.category?.toLowerCase().includes(selectedDestSlug.toLowerCase()) ||
        pkg.title.toLowerCase().includes(selectedDestSlug.toLowerCase());
      if (!match) return false;
    }

    // Sacred Temple / Place filter
    if (selectedTempleId !== 'all') {
      const targetTemple = temples.find(
        (t) => t.id === selectedTempleId || t.slug === selectedTempleId
      );
      const targetName = (targetTemple ? targetTemple.name : selectedTempleId).toLowerCase();
      const targetSlug = (targetTemple ? targetTemple.slug : selectedTempleId).toLowerCase();
      const targetId = (targetTemple ? targetTemple.id : selectedTempleId).toLowerCase();

      const match =
        pkg.templeIds?.some((id) => id.toLowerCase() === targetId || id.toLowerCase() === targetSlug) ||
        pkg.temples?.some(
          (name) =>
            name.toLowerCase() === targetName ||
            name.toLowerCase().includes(targetName) ||
            targetName.includes(name.toLowerCase())
        ) ||
        pkg.title.toLowerCase().includes(targetName) ||
        pkg.tagline?.toLowerCase().includes(targetName) ||
        pkg.destination?.toLowerCase().includes(targetName) ||
        pkg.overview?.toLowerCase().includes(targetName);

      if (!match) return false;
    }

    // Category / Travel Style filter
    if (selectedCategory !== 'all') {
      const cat = selectedCategory.toLowerCase();
      const pkgCat = (pkg.category || '').toLowerCase();
      const pkgTitle = pkg.title.toLowerCase();
      const pkgDesc = (pkg.description || '').toLowerCase();

      if (cat === 'family') {
        const isFamily =
          pkgCat.includes('family') ||
          pkgTitle.includes('family') ||
          pkgTitle.includes('vacation') ||
          pkgDesc.includes('family') ||
          pkg.tags?.includes('family');
        if (!isFamily) return false;
      } else if (cat === 'pilgrimage') {
        const isPilgrimage =
          pkgCat.includes('pilgrimage') ||
          pkgCat.includes('yatra') ||
          pkgTitle.includes('yatra') ||
          pkgTitle.includes('vaishno') ||
          pkgTitle.includes('amritsar') ||
          pkg.destination?.toLowerCase() === 'jammu';
        if (!isPilgrimage) return false;
      } else if (cat === 'luxury') {
        const isLuxury =
          pkgCat.includes('luxury') ||
          pkgTitle.includes('luxury') ||
          pkgTitle.includes('premium') ||
          pkg.price >= 25000;
        if (!isLuxury) return false;
      } else if (cat === 'adventure') {
        const isAdventure =
          pkgCat.includes('adventure') ||
          pkgTitle.includes('trek') ||
          pkgTitle.includes('adventure') ||
          pkg.destination?.toLowerCase() === 'ladakh' ||
          pkg.destination?.toLowerCase() === 'spiti';
        if (!isAdventure) return false;
      }
    }

    // Duration filter
    if (selectedDuration !== 'all') {
      const days = parseInt(pkg.duration) || 0;
      if (selectedDuration === 'short' && days > 4) return false;
      if (selectedDuration === 'medium' && (days < 5 || days > 7)) return false;
      if (selectedDuration === 'long' && days < 8) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = pkg.title.toLowerCase().includes(q);
      const descMatch = pkg.description.toLowerCase().includes(q);
      const destMatch = pkg.destination.toLowerCase().includes(q);
      const cityMatch = pkg.cities?.some((c) => c.toLowerCase().includes(q));
      const catMatch = pkg.category?.toLowerCase().includes(q);
      const inclMatch = pkg.inclusions?.some((inc) => inc.toLowerCase().includes(q));

      if (!titleMatch && !descMatch && !destMatch && !cityMatch && !catMatch && !inclMatch) {
        return false;
      }
    }

    return true;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'duration') {
      return (parseInt(b.duration) || 0) - (parseInt(a.duration) || 0);
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

  const selectedTempleMeta = temples.find(
    (t) => t.id === selectedTempleId || t.slug === selectedTempleId
  );

  const hasActiveFilters =
    selectedDestSlug !== 'all' ||
    selectedTempleId !== 'all' ||
    selectedCategory !== 'all' ||
    selectedDuration !== 'all' ||
    (selectedMonth && selectedMonth !== 'any') ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedDestSlug('all');
    setSelectedTempleId('all');
    setSelectedCategory('all');
    setSelectedDuration('all');
    setSelectedMonth('any');
    setSearchQuery('');
    window.history.pushState({}, '', '/tours');
  };

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
                selectedDestSlug === 'all' ? 'text-black font-bold' : ''
              }`}
            >
              All Tours Directory
            </button>
            {currentDestMeta && selectedDestSlug !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-black font-bold">{currentDestMeta.name} Packages</span>
              </>
            )}
          </div>
        </div>

        {/* Light Minimalist Header Section with Integrated Search */}
        <div id="search-widget-container" className="bg-white border-b border-stone-100 py-8 sm:py-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3.5 max-w-2xl">
              <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
                {currentDestMeta && selectedDestSlug !== 'all' ? (
                  <>
                    Explore premium, fully customizable {currentDestMeta.name} Tour Packages. Plan your dream vacation with direct-operator pricing including luxury and standard hand-picked hotel stays, a dedicated private chauffeur vehicle, customized daily sightseeing itineraries, and 24/7 travel desk support. {currentDestMeta.tagline}
                  </>
                ) : (
                  <>
                    Book custom-tailored Jammu Kashmir, Himachal Pradesh & Amritsar Tour Packages directly from the local operator at guaranteed best rates. Our meticulously planned itineraries cover top domestic destinations including the scenic valleys of Kashmir (Srinagar, Gulmarg Gondola, Pahalgam, Sonamarg), spiritual temple yatras to Jammu Katra & Vaishno Devi, picturesque mountain escapes across Himachal Pradesh (Manali, Shimla, Dharamshala, Dalhousie), and sacred heritage tours to Amritsar (Golden Temple, Wagah Border flag ceremony). Each premium package is fully flexible and features pre-inspected hotel accommodations, personal dedicated chauffeur cabs (sedans, SUVs, and luxury tempo travellers), flexible meal plans, shikara rides, and round-the-clock ground assistance.
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
                  placeholder="Search packages (e.g. Srinagar, Manali, 5 Days)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-[#FF4B00]/10 focus:border-[#FF4B00] transition shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
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

            {/* Sub-Filters: Category, Temple, Duration & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Temple / Shrine Filter Dropdown */}
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
                    🛕 {temple.name} ({temple.category})
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/20"
              >
                <option value="all">All Sacred Yatras</option>
                <option value="pilgrimage">Spiritual Yatra / Pilgrimage</option>
                <option value="family">Family Pilgrimage</option>
                <option value="luxury">VIP Darshan & Luxury</option>
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

        {/* Active Filters Tag Bar */}
        {hasActiveFilters && (
          <div className="bg-stone-100/90 border-b border-stone-200/80 py-2.5 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black uppercase text-[10px] tracking-wider text-stone-500 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#FF4B00]" /> Active Filters:
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
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4B00] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Tours Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Compass className="w-5 h-5 text-stone-600" />
              Available Holiday Packages ({sortedPackages.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPackages.map((pkg) => {
              const tripSchema = generateTouristTripSchema(pkg, agencySettings);

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-black transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with badges */}
                    <div className="aspect-16/10 relative overflow-hidden bg-stone-100">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-black/80 text-white font-bold text-xs rounded-lg uppercase tracking-wider backdrop-blur-xs">
                        {pkg.destination || 'Himalayas'}
                      </span>
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 text-black font-black text-xs rounded-lg shadow-sm">
                        {pkg.duration}
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
                          className="text-base sm:text-lg font-bold text-black leading-snug cursor-pointer group-hover:text-stone-700 transition line-clamp-2"
                        >
                          {pkg.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {pkg.description}
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
                          Starting From
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-black">
                            {agencySettings.currencySymbol}
                            {pkg.price?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-stone-400">/ person</span>
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
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Compass className="w-10 h-10 text-stone-400 mx-auto" />
              <h4 className="text-base font-bold text-black">No packages match your filters</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try selecting "All Destinations" or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setSelectedDestSlug('all');
                  setSelectedDuration('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <GlobalFooter />
    </div>
  );
};

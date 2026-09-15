import React, { useState, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import { HeroSection } from './HeroSection';
import { PackageCard } from './PackageCard';
import { PackageDetailsView } from './PackageDetailsView';
import { InquiryModal } from './InquiryModal';
import { OTAValueGuarantees } from './OTAValueGuarantees';
import { DestinationsGrid } from './DestinationsGrid';
import { InteractiveTripPlanner } from './InteractiveTripPlanner';
import { HotelsDirectory } from './HotelsDirectory';
import { TravelGuideAndFAQs } from './TravelGuideAndFAQs';
import { Footer } from './Footer';
import { InfoPageView } from './InfoPageView';
import { TourPackage } from '../../types/tour';
import {
  Compass,
  Sparkles,
  SlidersHorizontal,
  Grid3X3,
  List,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const TravelerPortal: React.FC = () => {
  const { packages, selectedPackageId, setSelectedPackageId, agencySettings, setActiveView } = useTours();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'durationAsc' | 'durationDesc' | 'priceAsc' | 'priceDesc'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickBookPkg, setQuickBookPkg] = useState<TourPackage | null>(null);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);

  // If an info page is active, show the InfoPageView
  if (activeInfoPage) {
    return (
      <InfoPageView
        pageSlug={activeInfoPage}
        onBack={() => setActiveInfoPage(null)}
      />
    );
  }

  // Filter packages: only published packages for traveler view
  const publishedPackages = useMemo(() => {
    return packages.filter((p) => p.status === 'published');
  }, [packages]);

  const filteredPackages = useMemo(() => {
    let result = publishedPackages.filter((pkg) => {
      // Search term matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = pkg.title.toLowerCase().includes(query);
        const matchesDest = pkg.destination.toLowerCase().includes(query);
        const matchesCategory = pkg.category.toLowerCase().includes(query);
        const matchesTagline = pkg.tagline.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDest && !matchesCategory && !matchesTagline) return false;
      }

      // Category matching
      if (selectedCategory !== 'All' && pkg.category !== selectedCategory) {
        return false;
      }

      // Duration matching
      if (selectedDuration === 'short' && pkg.durationDays > 4) return false;
      if (selectedDuration === 'medium' && (pkg.durationDays < 5 || pkg.durationDays > 7)) return false;
      if (selectedDuration === 'long' && pkg.durationDays < 8) return false;

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      const priceA = a.discountedPrice || a.price;
      const priceB = b.discountedPrice || b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'durationAsc') return a.durationDays - b.durationDays;
      if (sortBy === 'durationDesc') return b.durationDays - a.durationDays;
      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      return 0; // recommended default
    });
  }, [publishedPackages, searchTerm, selectedCategory, selectedDuration, sortBy]);

  // If a package is selected, show the full details view
  const selectedPackage = packages.find((p) => p.id === selectedPackageId || p.slug === selectedPackageId || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === selectedPackageId?.toLowerCase());
  if (selectedPackage) {
    return (
      <PackageDetailsView
        pkg={selectedPackage}
        onBack={() => setSelectedPackageId(null)}
      />
    );
  }

  const handleDestinationClick = (destKey: string) => {
    setSearchTerm(destKey);
    const elem = document.getElementById('packages-grid-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pilgrimageCategories = [
    'All',
    'Devi & Shaktipeeth',
    'Himachal Devi Darshan',
    'Jyotirlingas',
    'Ramayana Tour',
    'South India Teertham',
    'Helicopter Yatra',
  ];

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 font-sans">
      {/* 1. Hero with Clean Search Engine */}
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        totalPackagesCount={publishedPackages.length}
        onQuickDestination={(dest) => {
          setSearchTerm(dest);
          const elem = document.getElementById('packages-grid-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Core Value & Trust Guarantees Bar */}
      <OTAValueGuarantees />

      {/* 3. Curated Sacred Tours Grid (Vaishno Devi, Himachal Devi Darshan, Ayodhya, Jyotirlinga, Rameshwaram, Puri) */}
      <DestinationsGrid
        selectedDestination={searchTerm}
        onSelectDestination={handleDestinationClick}
      />

      {/* 4. Main Tour Packages Showcase Catalog */}
      <main id="packages-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-stone-200">
        {/* Section Header & Interactive Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-5 border-b-2 border-stone-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-stone-900 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanctified Holy Yatras</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight font-serif">
              Explore All Sacred Pilgrimage Packages
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
              Showing <strong className="text-stone-900">{filteredPackages.length}</strong> of {publishedPackages.length} sacred yatra itineraries • With Guided Darshan & Verified Stays
            </p>
          </div>

          {/* Interactive Controls: Sort & View Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-900" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-stone-900 font-extrabold focus:outline-hidden cursor-pointer"
              >
                <option value="recommended">Featured / Most Revered</option>
                <option value="rating">Top Rated (★ High to Low)</option>
                <option value="durationAsc">Duration: Short to Long</option>
                <option value="durationDesc">Duration: Long to Short</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Detailed View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {pilgrimageCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Packages Display */}
        {filteredPackages.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
                : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
            }
          >
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={(id) => {
                  setSelectedPackageId(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onQuickBook={(p) => setQuickBookPkg(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
            <div className="w-14 h-14 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-300">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-stone-900 mb-1">No matching sacred yatra found</h3>
            <p className="text-xs sm:text-sm text-stone-500 mb-4 max-w-md mx-auto font-medium">
              Try adjusting your search keywords or resetting category filters to browse all available holy tours.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDuration('All');
              }}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-black rounded-xl transition cursor-pointer shadow-xs"
            >
              Show All Sacred Yatras
            </button>
          </div>
        )}
      </main>

      {/* 4.5. Standalone Hotels Directory */}
      <HotelsDirectory />

      {/* 5. Interactive Custom Yatra Planner Wizard */}
      <InteractiveTripPlanner />

      {/* 6. Travel Guide & FAQs Accordion */}
      <TravelGuideAndFAQs />

      {/* 8. Call-to-action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-200 bg-white/10 px-3.5 py-1 rounded-full inline-block mb-3 border border-stone-700">
              Direct Pilgrimage Help Desk
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white font-serif">
              Planning a Sacred Yatra for Your Parents or Family?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed font-medium">
              Speak directly with our senior pilgrimage coordinators at Katra, Varanasi & Haridwar. We customize every detail—senior citizen pacing, Darshan assistance, Yatra registration guidance, and comfortable stay options.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={`https://wa.me/${agencySettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Namaste ${agencySettings.agencyName}! I am planning a sacred family pilgrimage and would like to speak with a yatra coordinator.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-[#25D366] text-white hover:bg-[#1da851] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>WhatsApp Yatra Helpline</span>
            </a>

            <button
              onClick={() => setActiveView('cms')}
              className="px-6 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition border border-stone-700 cursor-pointer"
            >
              <span>Agency CMS Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Rich Comprehensive Big Website Footer */}
      <Footer onSelectDham={handleDestinationClick} onSelectInfoPage={setActiveInfoPage} />

      {/* Quick Booking Inquiry Modal if triggered */}
      {quickBookPkg && (
        <InquiryModal
          pkg={quickBookPkg}
          isOpen={true}
          onClose={() => setQuickBookPkg(null)}
        />
      )}
    </div>
  );
};

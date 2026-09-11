import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Search, X, MapPin, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { updatePageSeo } from '../../utils/seo';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import { DESTINATIONS_REGISTRY, DestinationMeta } from '../../data/destinationsData';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { motion } from 'motion/react';

export const AllDestinationsExplorer: React.FC = () => {
  const { destinations, mediaAssets, navigateToHome, navigateToDestination, agencySettings, pageSeoConfigs } = useTours();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const destinationsList: DestinationMeta[] = useMemo(() => {
    const list = Object.values(destinations || DESTINATIONS_REGISTRY) as DestinationMeta[];
    return list;
  }, [destinations]);

  // SEO Update on mount
  useEffect(() => {
    const destinationsSeo = pageSeoConfigs?.['destinations'];
    updatePageSeo({
      title: destinationsSeo?.metaTitle || "Sacred Destinations & Temple Circuits in India | Bhakti Sathi",
      description: destinationsSeo?.metaDescription || "Explore India’s most revered holy destinations including Katra Vaishno Devi, Varanasi, Ayodhya Ram Mandir, Mathura Vrindavan, and Himachal Devi Temples.",
      canonicalUrl: destinationsSeo?.canonicalUrl || "https://mybhaktisathi.com/destinations",
      canonicalPath: "/destinations",
      noIndex: destinationsSeo?.noIndex,
      noFollow: destinationsSeo?.noFollow,
      schemaData: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Holiday Destinations",
        "description": "Comprehensive list of pilgrimage travel packages available on Bhakti Sathi.",
        "itemListElement": destinationsList.map((dest, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": dest.name,
          "url": `${window.location.origin}/holidays/${dest.slug}`,
          "image": dest.heroImage,
        })),
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [destinationsList, pageSeoConfigs]);

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return destinationsList.filter((dest) => {
      const matchesSearch =
        !q ||
        dest.name.toLowerCase().includes(q) ||
        dest.displayName?.toLowerCase().includes(q) ||
        dest.state?.toLowerCase().includes(q) ||
        dest.popularCities?.some((c) => c.toLowerCase().includes(q)) ||
        dest.tagline?.toLowerCase().includes(q);

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'kashmir' && (dest.slug === 'kashmir' || dest.id === 'kashmir')) ||
        (selectedFilter === 'jammu' && (dest.slug === 'jammu' || dest.id === 'jammu')) ||
        (selectedFilter === 'himachal' && (dest.slug === 'himachal' || dest.id === 'himachal')) ||
        (selectedFilter === 'ladakh' && (dest.slug === 'ladakh' || dest.id === 'ladakh'));

      return matchesSearch && matchesFilter;
    });
  }, [destinationsList, searchQuery, selectedFilter]);

  const handleSelect = (slug: string) => {
    navigateToDestination(slug);
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
              className="hover:text-black font-semibold transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-bold">Destinations</span>
          </div>
        </div>

        {/* Main Grid Container */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
          {/* Lightweight Elegant Header with Integrated Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1D1C1C] tracking-tight">
                Jammu Kashmir, Himachal Pradesh & Amritsar Tour Packages
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm font-medium mt-1.5 leading-relaxed max-w-3xl">
                Plan your perfect holiday with our highly-rated, customized tour packages. Experience the scenic valleys of Kashmir, high-altitude passes of Ladakh, serene landscapes of Himachal Pradesh, and the holy vibes of Jammu Katra & Amritsar with premium stays, private chauffeur cars, and 24/7 local travel desk support.
              </p>
            </div>

            {/* Clean Light Search Box */}
            <div className="relative w-full md:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-50 text-stone-900 placeholder-stone-400 text-xs sm:text-sm border border-stone-200 focus:outline-none focus:ring-4 focus:ring-[#FF4B00]/10 focus:border-[#FF4B00] transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                All Places ({destinationsList.length})
              </button>
              {destinationsList.map((d) => (
                <button
                  key={d.slug || d.id}
                  type="button"
                  onClick={() => setSelectedFilter(d.slug || d.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedFilter === (d.slug || d.id)
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-stone-500 hidden sm:inline whitespace-nowrap">
              Showing {filteredDestinations.length} Destinations
            </span>
          </div>

          {/* Grid of Destination Photo Cards */}
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
              <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">No destinations match "{searchQuery}"</h3>
              <p className="text-xs text-stone-500 mt-1">Try searching for Kashmir, Gulmarg, Katra, Patnitop, or Manali</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-black hover:bg-black transition cursor-pointer"
              >
                Show All Destinations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDestinations.map((dest, index) => (
                <motion.div
                  key={dest.id || dest.slug}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => handleSelect(dest.slug || dest.id)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-stone-200 hover:border-stone-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between p-4"
                >
                  {/* Background Image */}
                  <img
                    src={resolveDisplayImage(dest.heroImage, mediaAssets)}
                    alt={dest.displayName || dest.name}
                    onError={(e) => handleImageError(e, dest.heroImage, mediaAssets)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-black/10 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-black tracking-wider text-white bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-full uppercase border border-white/20 shadow-xs">
                      {dest.badge || `${dest.packagesCount || 6}+ TOURS`}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      ★ {dest.rating || 4.98}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="relative z-10 text-white pointer-events-none flex flex-col gap-0.5">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-stone-100 transition-colors drop-shadow-md leading-tight">
                      {dest.displayName || dest.name}
                    </h3>
                    <p className="text-[11px] text-stone-200 font-medium drop-shadow-sm line-clamp-1">
                      {dest.tagline}
                    </p>
                    <div className="flex items-center justify-end pt-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 group-hover:translate-x-1 transition-transform shrink-0">
                        <span>Explore Destination</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Global High-Trust Footer */}
      <GlobalFooter onSelectDestination={(slug) => navigateToDestination(slug)} />
    </div>
  );
};

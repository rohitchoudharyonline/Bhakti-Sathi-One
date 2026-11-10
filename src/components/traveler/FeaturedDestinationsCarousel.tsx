import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

interface DestinationItem {
  id: string;
  name: string;
  coverImage: string;
  startingPrice?: number;
  filterKey: string;
  badge?: string;
  tagline?: string;
}

interface FeaturedDestinationsCarouselProps {
  destinationsList?: DestinationItem[];
  onSelectDestination: (dest: DestinationItem) => void;
  title?: string;
  subtitle?: string;
}

export const FeaturedDestinationsCarousel: React.FC<FeaturedDestinationsCarouselProps> = ({
  destinationsList,
  onSelectDestination,
  title = "Destinations",
  subtitle = "Explore iconic Jammu & Kashmir destinations and world-class tour circuits curated by our travel specialists.",
}) => {
  const { destinations, packages, mediaAssets } = useTours();

  // If no custom list provided, build from context destinations
  const list: DestinationItem[] = (destinationsList && destinationsList.length > 0)
    ? destinationsList
    : Object.values(destinations || {}).map((d: any) => {
        // Calculate minimum starting price from active packages for this destination
        const destSlug = d.slug || d.id;
        const matchingPkgs = packages.filter(
          (p) =>
            p.destinationTag?.toLowerCase() === destSlug.toLowerCase() ||
            p.destination?.toLowerCase().includes(d.name.toLowerCase())
        );
        const minPkgPrice = matchingPkgs.reduce((min, p) => {
          const pr = p.discountedPrice || p.price;
          return pr && pr > 0 && pr < min ? pr : min;
        }, Infinity);

        const calculatedPrice = minPkgPrice !== Infinity ? minPkgPrice : (d.startingPrice || 8999);

        return {
          id: d.id || d.slug,
          name: d.displayName || d.name,
          coverImage: d.heroImage || d.coverImage || '',
          startingPrice: calculatedPrice,
          filterKey: d.slug || d.id,
          badge: d.badge || `${d.packagesCount || matchingPkgs.length || 5}+ Packages`,
          tagline: d.tagline || '',
        };
      });

  const [activeIndex, setActiveIndex] = useState(0);

  if (!list || list.length === 0) {
    return null;
  }

  const count = list.length;
  const prevIndex = (activeIndex - 1 + count) % count;
  const nextIndex = (activeIndex + 1) % count;

  const activeDest = list[activeIndex];
  const prevDest = list[prevIndex];
  const nextDest = list[nextIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % count);
  };

  const formatPrice = (price?: number) => {
    if (!price || price <= 0) return '₹8,999';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <section id="featured-destinations-section" className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 select-none overflow-hidden">
      {/* Header with Badge & Red Bar */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF4EE] border border-[#FCD6C3] text-[#FF4B00] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
          <span>FEATURED DESTINATIONS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <span>{title}</span>
          <span className="w-8 h-1.5 bg-[#FF4B00] rounded-full inline-block shrink-0" />
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* 3D Curved Cards Carousel Container */}
      <div className="relative w-full max-w-5xl mx-auto py-6 flex items-center justify-center min-h-[480px] sm:min-h-[540px]">
        
        {/* Navigation Arrow Left Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 lg:left-12 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl border border-stone-200/80 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Previous destination"
        >
          <ChevronLeft className="w-6 h-6 text-stone-900" strokeWidth={2.5} />
        </button>

        {/* Navigation Arrow Right Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-6 lg:right-12 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl border border-stone-200/80 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Next destination"
        >
          <ChevronRight className="w-6 h-6 text-stone-900" strokeWidth={2.5} />
        </button>

        {/* Cards Row (Left Side Preview, Active Center Card, Right Side Preview) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-4xl mx-auto relative px-2">

          {/* LEFT PREVIEW CARD */}
          {count > 1 && (
            <div
              onClick={() => setActiveIndex(prevIndex)}
              className="hidden sm:flex relative w-[200px] sm:w-[240px] md:w-[260px] h-[380px] sm:h-[440px] rounded-[30px] sm:rounded-[36px] overflow-hidden cursor-pointer border-2 border-stone-200/60 shadow-lg scale-90 opacity-60 hover:opacity-85 hover:scale-[0.92] transition-all duration-500 ease-out shrink-0 select-none group"
            >
              <img
                src={resolveDisplayImage(prevDest.coverImage, mediaAssets)}
                alt={prevDest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => handleImageError(e, prevDest.coverImage, mediaAssets, '')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
              
              <div className="relative z-10 flex flex-col justify-between h-full p-5 text-white">
                <div className="pt-4 text-center">
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {prevDest.name}
                  </h3>
                </div>
                <div className="pb-2 text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 block">
                    STARTING AT
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatPrice(prevDest.startingPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE CENTER CARD (THE STAR CARD MATCHING SCREENSHOT) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDest.id}
              initial={{ scale: 0.94, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0.8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelectDestination(activeDest)}
              className="relative w-[270px] sm:w-[320px] md:w-[340px] h-[450px] sm:h-[510px] rounded-[36px] sm:rounded-[42px] overflow-hidden cursor-pointer border-4 border-stone-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.38)] ring-1 ring-black/10 z-20 shrink-0 group select-none transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* High Quality Background Image */}
              <img
                src={resolveDisplayImage(activeDest.coverImage, mediaAssets)}
                alt={activeDest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                onError={(e) => handleImageError(e, activeDest.coverImage, mediaAssets, '')}
              />

              {/* Multi-step Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent group-hover:from-stone-950/95 transition-all duration-300 pointer-events-none" />
              
              {/* Subtle Brand Orange Hover Overlay */}
              <div className="absolute inset-0 bg-[#FF4B00]/0 group-hover:bg-[#FF4B00]/10 transition-colors duration-300 pointer-events-none mix-blend-overlay" />

              {/* Card Inner Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-7 text-white">
                
                {/* Upper Destination Title */}
                <div className="pt-6 sm:pt-8 text-center space-y-1">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg tracking-tight leading-tight">
                    {activeDest.name}
                  </h3>
                  {activeDest.tagline && (
                    <p className="text-xs font-semibold text-stone-200/90 drop-shadow-md max-w-xs mx-auto">
                      {activeDest.tagline}
                    </p>
                  )}
                </div>

                {/* Bottom Section: STARTING AT, Price, and Circular Arrow Button */}
                <div className="pb-2 sm:pb-3 text-center space-y-1">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-300 block drop-shadow-md">
                    STARTING AT
                  </span>

                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                    {formatPrice(activeDest.startingPrice)}
                  </div>

                  {/* Circular Action Button with Arrow Up-Right (↗) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDestination(activeDest);
                      }}
                      className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#FF4B00] hover:bg-[#E04200] text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                      aria-label={`Explore ${activeDest.name}`}
                    >
                      <ArrowUpRight className="w-6 h-6 text-white" strokeWidth={2.8} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT PREVIEW CARD */}
          {count > 1 && (
            <div
              onClick={() => setActiveIndex(nextIndex)}
              className="hidden sm:flex relative w-[200px] sm:w-[240px] md:w-[260px] h-[380px] sm:h-[440px] rounded-[30px] sm:rounded-[36px] overflow-hidden cursor-pointer border-2 border-stone-200/60 shadow-lg scale-90 opacity-60 hover:opacity-85 hover:scale-[0.92] transition-all duration-500 ease-out shrink-0 select-none group"
            >
              <img
                src={resolveDisplayImage(nextDest.coverImage, mediaAssets)}
                alt={nextDest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => handleImageError(e, nextDest.coverImage, mediaAssets, '')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
              
              <div className="relative z-10 flex flex-col justify-between h-full p-5 text-white">
                <div className="pt-4 text-center">
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {nextDest.name}
                  </h3>
                </div>
                <div className="pb-2 text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 block">
                    STARTING AT
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatPrice(nextDest.startingPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

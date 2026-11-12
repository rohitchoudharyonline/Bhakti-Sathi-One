import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

const getDestinationDisplayName = (destination: any): string => {
  const candidates = [destination?.name, destination?.displayName]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());
  return candidates.sort((a, b) => b.length - a.length)[0] || 'Destination';
};

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
          name: getDestinationDisplayName(d),
          coverImage: d.heroImage || d.coverImage || '',
          startingPrice: calculatedPrice,
          filterKey: d.slug || d.id,
          badge: d.badge || `${d.packagesCount || matchingPkgs.length || 5}+ Packages`,
          tagline: d.tagline || '',
        };
      });

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % count);
  };

  const formatPrice = (price?: number) => {
    if (!price || price <= 0) return '₹8,999';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <section id="featured-destinations-section" className="py-8 sm:py-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 select-none overflow-hidden">
      {/* Header with Badge & Red Bar */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF4EE] border border-[#FCD6C3] text-[#FF4B00] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
          <span>FEATURED DESTINATIONS</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <span>{title}</span>
          <span className="w-8 h-1.5 bg-[#FF4B00] rounded-full inline-block shrink-0" />
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* 3D Curved Cards Carousel Container */}
      <div className="relative w-full max-w-5xl mx-auto py-4 sm:py-6 flex items-center justify-center min-h-[440px] sm:min-h-[540px]">
        
        {/* Navigation Arrow Left Button */}
        {count > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 xs:left-3 sm:left-8 lg:left-14 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl border border-stone-200/90 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous destination"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-stone-900" strokeWidth={2.5} />
          </button>
        )}

        {/* Navigation Arrow Right Button */}
        {count > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 xs:right-3 sm:right-8 lg:right-14 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl border border-stone-200/90 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next destination"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-stone-900" strokeWidth={2.5} />
          </button>
        )}

        {/* Cards Row (Left Side Preview, Active Center Card, Right Side Preview) - Visible on Mobile and Desktop */}
        <div className="flex items-center justify-center gap-1.5 xs:gap-2.5 sm:gap-6 w-full max-w-4xl mx-auto relative px-1 sm:px-2">

          {/* LEFT PREVIEW CARD - Visible on both mobile and desktop (peeks in from left) */}
          {count > 1 && (
            <div
              onClick={() => {
                setDirection(-1);
                setActiveIndex(prevIndex);
              }}
              className="flex relative w-[75px] xs:w-[100px] sm:w-[220px] md:w-[260px] h-[340px] xs:h-[370px] sm:h-[440px] rounded-[24px] sm:rounded-[36px] overflow-hidden cursor-pointer border-2 border-stone-200/60 shadow-lg scale-[0.88] sm:scale-90 opacity-65 hover:opacity-90 hover:scale-[0.92] transition-all duration-300 ease-out shrink-0 select-none group"
            >
              <img
                src={resolveDisplayImage(prevDest.coverImage, mediaAssets)}
                alt={prevDest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => handleImageError(e, prevDest.coverImage, mediaAssets, '')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              
              <div className="relative z-10 flex flex-col justify-between h-full p-2.5 sm:p-5 text-white">
                <div className="pt-2 sm:pt-4 text-center">
                  <h3 className="text-sm xs:text-base sm:text-2xl font-black text-white drop-shadow-md truncate">
                    {prevDest.name}
                  </h3>
                </div>
                <div className="pb-1 sm:pb-2 text-center hidden xs:block">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-stone-300 block">
                    STARTING AT
                  </span>
                  <span className="text-xs sm:text-lg font-black text-white">
                    {formatPrice(prevDest.startingPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE CENTER CARD (THE STAR CARD MATCHING SCREENSHOT) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDest.id || activeIndex}
              initial={{ scale: 0.95, opacity: 0.85, x: direction * 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.95, opacity: 0.85, x: -direction * 20 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => onSelectDestination(activeDest)}
              className="relative w-[210px] xs:w-[245px] sm:w-[320px] md:w-[340px] h-[390px] xs:h-[430px] sm:h-[510px] rounded-[30px] sm:rounded-[42px] overflow-hidden cursor-pointer border-4 border-stone-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.38)] ring-1 ring-black/10 z-20 shrink-0 group select-none transition-transform duration-200 hover:scale-[1.02]"
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
              <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-7 text-white">
                
                {/* Upper Destination Title */}
                <div className="pt-4 sm:pt-8 text-center space-y-1">
                  <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg tracking-tight leading-tight">
                    {activeDest.name}
                  </h3>
                  {activeDest.tagline && (
                    <p className="text-[11px] sm:text-xs font-semibold text-stone-200/90 drop-shadow-md max-w-xs mx-auto line-clamp-2">
                      {activeDest.tagline}
                    </p>
                  )}
                </div>

                {/* Bottom Section: STARTING AT, Price, and Circular Arrow Button */}
                <div className="pb-1 sm:pb-3 text-center space-y-1">
                  <span className="text-[9.5px] sm:text-xs font-black uppercase tracking-widest text-stone-300 block drop-shadow-md">
                    STARTING AT
                  </span>

                  <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                    {formatPrice(activeDest.startingPrice)}
                  </div>

                  {/* Circular Action Button with Arrow Up-Right (↗) */}
                  <div className="pt-1.5 sm:pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDestination(activeDest);
                      }}
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#FF4B00] hover:bg-[#E04200] text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                      aria-label={`Explore ${activeDest.name}`}
                    >
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.8} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT PREVIEW CARD - Visible on both mobile and desktop (peeks in from right) */}
          {count > 1 && (
            <div
              onClick={() => {
                setDirection(1);
                setActiveIndex(nextIndex);
              }}
              className="flex relative w-[75px] xs:w-[100px] sm:w-[220px] md:w-[260px] h-[340px] xs:h-[370px] sm:h-[440px] rounded-[24px] sm:rounded-[36px] overflow-hidden cursor-pointer border-2 border-stone-200/60 shadow-lg scale-[0.88] sm:scale-90 opacity-65 hover:opacity-90 hover:scale-[0.92] transition-all duration-300 ease-out shrink-0 select-none group"
            >
              <img
                src={resolveDisplayImage(nextDest.coverImage, mediaAssets)}
                alt={nextDest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => handleImageError(e, nextDest.coverImage, mediaAssets, '')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              
              <div className="relative z-10 flex flex-col justify-between h-full p-2.5 sm:p-5 text-white">
                <div className="pt-2 sm:pt-4 text-center">
                  <h3 className="text-sm xs:text-base sm:text-2xl font-black text-white drop-shadow-md truncate">
                    {nextDest.name}
                  </h3>
                </div>
                <div className="pb-1 sm:pb-2 text-center hidden xs:block">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-stone-300 block">
                    STARTING AT
                  </span>
                  <span className="text-xs sm:text-lg font-black text-white">
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

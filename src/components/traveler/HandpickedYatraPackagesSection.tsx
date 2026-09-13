import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Hotel,
  Car,
  MapPin,
  Sparkles,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { TourPackage } from '../../types/tour';

/**
 * Authentic Real Flower Mala (Garland) & Repeating Toran
 * - Real flowers: 🌺 (Auspicious Red Hibiscus), 🌼 (Golden Marigold), ☘️ (Sacred Green Leaves)
 * - Repeating marigold & flower toran pattern across the full top edge
 * - Exactly 3 graceful curved folds across mobile screens (< 640px)
 * - 6 graceful folds across desktop screens (>= 640px)
 * - Sacred red-and-gold Kalawa/Mauli thread catenary drape
 */

interface RealFlowerProps {
  type: 'hibiscus' | 'marigold' | 'leaf';
  sizeClass?: string;
  className?: string;
}

const RealFlower: React.FC<RealFlowerProps> = ({ type, sizeClass, className = '' }) => {
  if (type === 'hibiscus') {
    return (
      <span
        role="img"
        aria-label="red hibiscus"
        className={`inline-block select-none leading-none filter drop-shadow-[0_2px_3px_rgba(185,28,28,0.38)] ${sizeClass || 'text-[17px] sm:text-[20px]'} ${className}`}
        style={{
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        }}
      >
        🌺
      </span>
    );
  }
  if (type === 'marigold') {
    return (
      <span
        role="img"
        aria-label="yellow marigold"
        className={`inline-block select-none leading-none filter drop-shadow-[0_2px_3px_rgba(202,138,4,0.35)] ${sizeClass || 'text-[16px] sm:text-[19px]'} ${className}`}
        style={{
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        }}
      >
        🌼
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label="sacred green leaf"
      className={`inline-block select-none leading-none filter drop-shadow-[0_1.5px_2px_rgba(21,128,61,0.32)] ${sizeClass || 'text-[13px] sm:text-[15px]'} ${className}`}
      style={{
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      }}
    >
      ☘️
    </span>
  );
};

// Flower positions along catenary swag curve y = 5 + 68 * t * (1 - t)
const FOLD_BLOSSOMS = [
  { x: 13, y: 12, type: 'marigold' as const },
  { x: 26, y: 18, type: 'marigold' as const },
  { x: 39, y: 22, type: 'marigold' as const },
  { x: 50, y: 24, type: 'hibiscus' as const },
  { x: 61, y: 22, type: 'marigold' as const },
  { x: 74, y: 18, type: 'marigold' as const },
  { x: 87, y: 12, type: 'marigold' as const },
];

/**
 * Single Swag / Fold Component with Real Flowers
 */
const MarigoldFold: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  return (
    <div className={`relative ${isMobile ? 'h-9' : 'h-10 sm:h-11'} w-full overflow-visible`}>
      {/* Sacred twisted Kalawa (Mauli) cord hanging along catenary curve */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 28"
        aria-hidden="true"
      >
        {/* Red strand */}
        <path
          d="M 0,5 Q 50,23 100,5"
          fill="none"
          stroke="#DC2626"
          strokeWidth="1.6"
          strokeDasharray="4 2"
          opacity="0.8"
        />
        {/* Golden amber strand */}
        <path
          d="M 0,5 Q 50,23 100,5"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          opacity="0.9"
        />
      </svg>

      {/* Left Anchor Peak (x = 0): Sacred Green Leaf + Red Hibiscus */}
      <div className="absolute left-0 top-[5px] -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center pointer-events-none">
        <RealFlower type="leaf" className="-mr-1.5 rotate-[-20deg]" />
        <RealFlower type="hibiscus" />
      </div>

      {/* Blossoms strung gracefully along the drape curve: 🌼🌼🌼 🌺 🌼🌼🌼 */}
      {FOLD_BLOSSOMS.map((b, idx) => (
        <div
          key={`blossom-${idx}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-[2] pointer-events-none"
          style={{
            left: `${b.x}%`,
            top: `${b.y}px`,
          }}
        >
          <RealFlower type={b.type} />
        </div>
      ))}
    </div>
  );
};

/**
 * High-Quality Real Flower Garland (Mala)
 * - Features real flowers: 🌺🌺🌼🌼☘️☘️
 * - Spans 100% full width edge-to-edge
 * - Exactly 3 graceful curved folds across mobile screens (< 640px)
 * - 6 graceful folds across desktop screens (>= 640px)
 */
const TraditionalMarigoldGarlandTop: React.FC = () => {
  return (
    <div className="w-full relative select-none pointer-events-none -mt-0.5 overflow-hidden pt-1.5 pb-1" aria-hidden="true">
      {/* Mobile Screens (< 640px): EXACTLY 3 FOLDS across the entire screen width */}
      <div className="grid grid-cols-3 w-full sm:hidden relative px-2.5">
        {[0, 1, 2].map((foldIdx) => (
          <MarigoldFold key={`m-fold-${foldIdx}`} isMobile={true} />
        ))}
        {/* Right Edge Closing Peak (x = 100%): Red Hibiscus + Sacred Green Leaf */}
        <div className="absolute top-[5px] right-2.5 translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center pointer-events-none">
          <RealFlower type="hibiscus" />
          <RealFlower type="leaf" className="-ml-1.5 rotate-[20deg]" />
        </div>
      </div>

      {/* Tablet & Desktop Screens (>= 640px): 6 Graceful Folds across wide screens */}
      <div className="hidden sm:grid sm:grid-cols-6 w-full relative px-4">
        {[0, 1, 2, 3, 4, 5].map((foldIdx) => (
          <MarigoldFold key={`d-fold-${foldIdx}`} isMobile={false} />
        ))}
        {/* Right Edge Closing Peak (x = 100%): Red Hibiscus + Sacred Green Leaf */}
        <div className="absolute top-[5px] right-4 translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center pointer-events-none">
          <RealFlower type="hibiscus" />
          <RealFlower type="leaf" className="-ml-1.5 rotate-[20deg]" />
        </div>
      </div>
    </div>
  );
};

export const HandpickedYatraPackagesSection: React.FC = () => {
  const {
    packages,
    setSelectedPackageId,
    toggleWishlist,
    isWishlisted,
    navigateToSearch,
  } = useTours();

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Filter curated pilgrimage & yatra packages
  const handpickedPackages = useMemo(() => {
    const published = packages.filter((pkg) => pkg.status === 'published');
    const pilgrimage = published.filter(
      (pkg) =>
        String(pkg.category).toLowerCase().includes('pilgrimage') ||
        String(pkg.title).toLowerCase().includes('yatra') ||
        String(pkg.title).toLowerCase().includes('darshan') ||
        String(pkg.destination).toLowerCase().includes('kashmir') ||
        String(pkg.destination).toLowerCase().includes('himachal')
    );

    const source = pilgrimage.length >= 3 ? pilgrimage : published;

    return [...source]
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating ||
          a.title.localeCompare(b.title)
      )
      .slice(0, 8);
  }, [packages]);

  // Update carousel scroll buttons state
  const checkScrollState = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 15);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);

    // Calculate approximate slide index for pagination dots
    const cardWidth = el.querySelector<HTMLElement>('.yatra-package-card')?.offsetWidth || 320;
    const currentIdx = Math.round(el.scrollLeft / cardWidth);
    setActiveSlideIndex(Math.min(currentIdx, handpickedPackages.length - 1));
  };

  useEffect(() => {
    checkScrollState();
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [handpickedPackages]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.yatra-package-card');
    const scrollAmount = card ? card.offsetWidth + 20 : 340;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handlePackageClick = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="handpicked-packages-section-container"
      data-section="handpicked-packages"
      className="relative bg-[#FAF2EA] border-y border-[#EADBCC] pb-12 sm:pb-14 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Anchor for backward compatibility */}
      <div id="handpicked-yatra-packages-section" className="absolute top-0 left-0 pointer-events-none" aria-hidden="true" />

      {/* 1. High-Quality Indian Marigold Garland (Mala) looping across top full width with 3 folds on mobile */}
      <TraditionalMarigoldGarlandTop />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5">
        {/* 2. Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF4B00] bg-[#FF4B00]/10 px-3 py-1 rounded-full border border-[#FF4B00]/20 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4B00]" />
                <span>Popular Yatra Packages</span>
              </span>
              <span className="text-xs font-semibold text-stone-400">पवित्र यात्राएं</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>Handpicked Yatra Packages</span>
              <span className="hidden sm:inline-block w-8 h-1 bg-[#FF4B00] rounded-full" />
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 leading-relaxed max-w-xl">
              Curated sacred journeys with verified comfortable hotel stays and dedicated private transfers.
            </p>
          </div>

          {/* Navigation Controls & View All Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* View All Button */}
            <button
              type="button"
              onClick={() => navigateToSearch({ category: 'Pilgrimage' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm font-bold hover:border-[#FF4B00] hover:text-[#FF4B00] hover:shadow-2xs transition-all cursor-pointer shadow-2xs"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-4 h-4 text-[#FF4B00]" />
            </button>

            {/* Desktop / Tablet Carousel Arrows */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => scrollByDirection('left')}
                disabled={!canScrollLeft}
                aria-label="Previous packages"
                className="w-9 h-9 rounded-full bg-white border border-stone-300 text-stone-700 hover:bg-[#FF4B00] hover:text-white hover:border-[#FF4B00] disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-stone-700 disabled:hover:border-stone-300 grid place-items-center transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollByDirection('right')}
                disabled={!canScrollRight}
                aria-label="Next packages"
                className="w-9 h-9 rounded-full bg-white border border-stone-300 text-stone-700 hover:bg-[#FF4B00] hover:text-white hover:border-[#FF4B00] disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-stone-700 disabled:hover:border-stone-300 grid place-items-center transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Touch / Swipe Carousel */}
        {handpickedPackages.length > 0 ? (
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {handpickedPackages.map((pkg, index) => {
                const isItemWishlisted = isWishlisted(pkg.id);
                const startingPrice = Number(pkg.price ?? 0);
                const durationLabel = `${pkg.durationDays} Days / ${pkg.durationNights || pkg.durationDays - 1} Nights`;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageClick(pkg.id)}
                    className="yatra-package-card group w-[84vw] sm:w-[330px] md:w-[350px] lg:w-[calc(33.333%-16px)] shrink-0 snap-start bg-white rounded-2xl sm:rounded-[20px] border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-[#FF4B00]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
                  >
                    {/* Card Top: Image Area */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                      <img
                        src={pkg.coverImage}
                        alt={pkg.title}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Gentle bottom shadow gradient on image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent pointer-events-none" />

                      {/* Top Badges: Duration / Bestseller + Wishlist Button */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="text-[10px] font-black tracking-wider text-white bg-[#FF4B00] px-2.5 py-1 rounded-full uppercase shadow-xs">
                          {pkg.badge || durationLabel}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(pkg.id);
                          }}
                          aria-label={isItemWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-stone-700 hover:text-rose-500 grid place-items-center transition-all shadow-xs active:scale-90"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isItemWishlisted ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Image Bottom Overlays: Start Location & Duration */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold drop-shadow-sm pointer-events-none">
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span>Ex-{pkg.startLocation}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 shrink-0 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10">
                          <CalendarDays className="w-3 h-3 text-amber-300" />
                          <span>{pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body: Title, Route & Inclusions */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        {/* Package Title */}
                        <h3 className="text-base sm:text-[17px] font-black text-stone-900 leading-snug line-clamp-2 group-hover:text-[#FF4B00] transition-colors">
                          {pkg.title}
                        </h3>

                        {/* Destination Route line */}
                        <p className="text-xs text-stone-500 font-medium mt-1 line-clamp-1">
                          {pkg.destination || `${pkg.startLocation} to Sacred Shrine`}
                        </p>

                        {/* Feature Badges inside Card: Verified Stay & Private Cab */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-[11px] font-bold text-stone-700">
                          <span className="inline-flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100/80 px-2.5 py-1.5 rounded-lg border border-stone-200/80 transition-colors text-center shadow-2xs">
                            <Hotel className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
                            <span className="truncate">Verified Stay</span>
                          </span>

                          <span className="inline-flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100/80 px-2.5 py-1.5 rounded-lg border border-stone-200/80 transition-colors text-center shadow-2xs">
                            <Car className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
                            <span className="truncate">Private Cab</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Pricing & Action */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                            Starting from
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-xl font-black text-[#FF4B00]">
                              ₹{startingPrice > 0 ? startingPrice.toLocaleString('en-IN') : 'Custom'}
                            </span>
                            {startingPrice > 0 && (
                              <span className="text-[10px] text-stone-500 font-medium">/ person</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePackageClick(pkg.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0EB] text-[#FF4B00] group-hover:bg-[#FF4B00] group-hover:text-white text-xs font-black transition-all shadow-2xs cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Carousel Indicators & Next Peek Hint */}
            <div className="flex sm:hidden items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5">
                {handpickedPackages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => {
                      const el = carouselRef.current;
                      if (!el) return;
                      const card = el.querySelector<HTMLElement>('.yatra-package-card');
                      if (card) {
                        el.scrollTo({
                          left: dotIdx * (card.offsetWidth + 16),
                          behavior: 'smooth',
                        });
                      }
                    }}
                    aria-label={`Go to package ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlideIndex === dotIdx ? 'w-5 bg-[#FF4B00]' : 'w-1.5 bg-stone-300'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <span>Swipe for more</span>
                <ArrowRight className="w-3 h-3 text-[#FF4B00]" />
              </span>
            </div>
          </div>
        ) : (
          /* Empty state fallback */
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-2xs">
            <ShieldCheck className="w-10 h-10 text-[#FF4B00] mx-auto mb-3" />
            <h3 className="text-base font-black text-stone-900">Curating Sacred Yatra Packages</h3>
            <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
              Our travel experts are updating current yatra schedules and hotel stays. Explore our entire directory below.
            </p>
            <button
              type="button"
              onClick={() => navigateToSearch({ category: 'Pilgrimage' })}
              className="mt-4 px-5 py-2 rounded-xl bg-[#FF4B00] text-white font-black text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Explore All Yatras</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

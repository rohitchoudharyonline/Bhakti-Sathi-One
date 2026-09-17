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
  ShieldCheck,
  Users,
  Compass,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { TourPackage } from '../../types/tour';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

interface GenericToursSectionProps {
  id: string;
  badgeLabel: string;
  badgeIcon?: React.ReactNode;
  heading: string;
  description: string;
  categoryFilter: 'Family' | 'Honeymoon' | 'Pilgrimage';
  viewAllCategoryName: string;
  bgColor?: string;
  borderColor?: string;
  showGarland?: boolean;
}

/**
 * Authentic Real Flower Mala (Garland) & Repeating Toran
 * Shown ONLY for Pilgrimage Tours when showGarland is true
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

const MarigoldFold: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  return (
    <div className={`relative ${isMobile ? 'h-9' : 'h-10 sm:h-11'} w-full overflow-visible`}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 28"
        aria-hidden="true"
      >
        <path
          d="M 0,5 Q 50,23 100,5"
          fill="none"
          stroke="#DC2626"
          strokeWidth="1.6"
          strokeDasharray="4 2"
          opacity="0.8"
        />
        <path
          d="M 0,5 Q 50,23 100,5"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          opacity="0.9"
        />
      </svg>
      <div className="absolute left-0 top-[5px] -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center pointer-events-none">
        <RealFlower type="leaf" className="-mr-1.5 rotate-[-20deg]" />
        <RealFlower type="hibiscus" />
      </div>
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

const TraditionalMarigoldGarlandTop: React.FC = () => {
  return (
    <div className="w-full relative select-none pointer-events-none -mt-0.5 overflow-hidden pt-1.5 pb-1" aria-hidden="true">
      <div className="grid grid-cols-3 w-full sm:hidden relative px-2.5">
        {[0, 1, 2].map((foldIdx) => (
          <MarigoldFold key={`m-fold-${foldIdx}`} isMobile={true} />
        ))}
        <div className="absolute top-[5px] right-2.5 translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center pointer-events-none">
          <RealFlower type="hibiscus" />
          <RealFlower type="leaf" className="-ml-1.5 rotate-[20deg]" />
        </div>
      </div>
      <div className="hidden sm:grid sm:grid-cols-6 w-full relative px-4">
        {[0, 1, 2, 3, 4, 5].map((foldIdx) => (
          <MarigoldFold key={`d-fold-${foldIdx}`} isMobile={false} />
        ))}
        <div className="absolute top-[5px] right-4 translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center pointer-events-none">
          <RealFlower type="hibiscus" />
          <RealFlower type="leaf" className="-ml-1.5 rotate-[20deg]" />
        </div>
      </div>
    </div>
  );
};

export const CategoryToursCarouselSection: React.FC<GenericToursSectionProps> = ({
  id,
  badgeLabel,
  badgeIcon,
  heading,
  description,
  categoryFilter,
  viewAllCategoryName,
  bgColor = 'bg-stone-50/50',
  borderColor = 'border-stone-200/80',
  showGarland = false,
}) => {
  const {
    packages,
    mediaAssets,
    setSelectedPackageId,
    toggleWishlist,
    isWishlisted,
    navigateToSearch,
  } = useTours();

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Filter curated packages matching category type or tags
  const matchedPackages = useMemo(() => {
    const published = packages.filter((pkg) => pkg.status === 'published');
    const targetType = categoryFilter.toLowerCase();

    const filtered = published.filter((pkg) => {
      // Strict Tour Type match
      if (pkg.tourType && pkg.tourType.toLowerCase() === targetType) {
        return true;
      }
      
      // Fallback: Check category string (legacy support)
      const cat = String(pkg.category || '').toLowerCase();
      if (cat === targetType || cat.includes(targetType)) {
        return true;
      }

      return false;
    });

    // If fewer than 2 match directly, fallback to general published packages
    const source = filtered.length >= 2 ? filtered : published;

    return [...source]
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating ||
          a.title.localeCompare(b.title)
      )
      .slice(0, 8);
  }, [packages, categoryFilter]);

  const checkScrollState = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 15);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);

    const cardWidth = el.querySelector<HTMLElement>('.tour-package-card')?.offsetWidth || 320;
    const currentIdx = Math.round(el.scrollLeft / cardWidth);
    setActiveSlideIndex(Math.min(currentIdx, matchedPackages.length - 1));
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
  }, [matchedPackages]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.tour-package-card');
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
      id={id}
      data-section={id}
      className={`relative ${bgColor} border-y ${borderColor} pb-12 sm:pb-14 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]`}
    >
      {/* Flower Garland for Pilgrimage Only */}
      {showGarland && <TraditionalMarigoldGarlandTop />}

      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${showGarland ? 'pt-3 sm:pt-5' : 'pt-8 sm:pt-10'}`}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF4B00] bg-[#FF4B00]/10 px-3 py-1 rounded-full border border-[#FF4B00]/20 inline-flex items-center gap-1.5">
                {badgeIcon || <Sparkles className="w-3.5 h-3.5 text-[#FF4B00]" />}
                <span>{badgeLabel}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>{heading}</span>
              <span className="hidden sm:inline-block w-8 h-1 bg-[#FF4B00] rounded-full" />
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          {/* Navigation Controls & View All Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => navigateToSearch({ category: viewAllCategoryName })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm font-bold hover:border-[#FF4B00] hover:text-[#FF4B00] hover:shadow-2xs transition-all cursor-pointer shadow-2xs"
            >
              <span>View All {viewAllCategoryName}</span>
              <ArrowRight className="w-4 h-4 text-[#FF4B00]" />
            </button>

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

        {/* Horizontal Touch / Swipe Carousel */}
        {matchedPackages.length > 0 ? (
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {matchedPackages.map((pkg, index) => {
                const isItemWishlisted = isWishlisted(pkg.id);
                const startingPrice = Number(pkg.price ?? 0);
                const durationLabel = `${pkg.durationDays} Days / ${pkg.durationNights || pkg.durationDays - 1} Nights`;
                const coverImg = resolveDisplayImage(pkg.coverImage, mediaAssets);

                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageClick(pkg.id)}
                    className="tour-package-card group w-[84vw] sm:w-[330px] md:w-[350px] lg:w-[calc(33.333%-16px)] shrink-0 snap-start bg-white rounded-2xl sm:rounded-[20px] border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-[#FF4B00]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
                  >
                    {/* Card Top: Image Area */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                      <img
                        src={coverImg}
                        alt={pkg.title}
                        onError={(e) => handleImageError(e, pkg.coverImage, mediaAssets)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent pointer-events-none" />

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

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-[17px] font-black text-stone-900 leading-snug line-clamp-2 group-hover:text-[#FF4B00] transition-colors">
                          {pkg.title}
                        </h3>

                        <p className="text-xs text-stone-500 font-medium mt-1 line-clamp-1">
                          {pkg.destination || `${pkg.startLocation} Circuit`}
                        </p>

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

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                            {startingPrice > 0 && !pkg.priceOnRequest ? 'Starting from' : 'Quotation'}
                          </span>
                          <div className="flex items-baseline gap-1">
                            {startingPrice > 0 && !pkg.priceOnRequest ? (
                              <>
                                <span className="text-lg sm:text-xl font-black text-[#FF4B00]">
                                  ₹{startingPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-stone-500 font-medium">/ person</span>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-black text-[#FF4B00]">
                                Price on Request
                              </span>
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

            {/* Mobile Carousel Indicators */}
            <div className="flex sm:hidden items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5">
                {matchedPackages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => {
                      const el = carouselRef.current;
                      if (!el) return;
                      const card = el.querySelector<HTMLElement>('.tour-package-card');
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
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-2xs">
            <ShieldCheck className="w-10 h-10 text-[#FF4B00] mx-auto mb-3" />
            <h3 className="text-base font-black text-stone-900">Curating {heading}</h3>
            <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
              Our travel experts are updating current schedules and hotel stays. Explore our entire directory below.
            </p>
            <button
              type="button"
              onClick={() => navigateToSearch({ category: viewAllCategoryName })}
              className="mt-4 px-5 py-2 rounded-xl bg-[#FF4B00] text-white font-black text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Explore All {viewAllCategoryName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// Backwards-compatible export for Pilgrimage Tours
export const HandpickedYatraPackagesSection: React.FC = () => {
  return (
    <CategoryToursCarouselSection
      id="pilgrimage-tours-section"
      badgeLabel="Spiritual & Pilgrimage Journeys"
      heading="Pilgrimage Tours"
      description="Curated pilgrimage journeys with verified comfortable hotel stays, darshan assistance, and dedicated private transfers."
      categoryFilter="Pilgrimage"
      viewAllCategoryName="Pilgrimage"
      bgColor="bg-amber-50/40"
      borderColor="border-amber-100"
      showGarland={true}
    />
  );
};


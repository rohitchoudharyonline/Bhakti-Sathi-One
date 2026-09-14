import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bus,
  MapPin,
  Star,
  Clock,
  BadgePercent,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';

export const GroupToursSection: React.FC = () => {
  const { packages, setSelectedPackageId, setActiveView, navigateToSearch } = useTours();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bhakti_fav_group_tours');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter packages strictly for Group Tours
  const groupPackages = useMemo(() => {
    return packages.filter((pkg) => {
      return (
        pkg.isGroupTour === true ||
        pkg.tourType === 'Group Tour' ||
        Boolean(pkg.groupTourDetails?.isGroupTour)
      );
    });
  }, [packages]);

  const toggleFavorite = (e: React.MouseEvent, pkgId: string) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId];
      try {
        localStorage.setItem('bhakti_fav_group_tours', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handlePackageClick = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('traveler');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Carousel scroll controls
  const handleScroll = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>('.group-tour-card')?.offsetWidth || 460;
    const scrollAmount = cardWidth + 24;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Sync scroll position with active dot
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const card = el.querySelector<HTMLElement>('.group-tour-card');
      if (!card) return;
      const cardW = card.offsetWidth + 24;
      const index = Math.round(el.scrollLeft / cardW);
      setActiveSlideIndex(Math.max(0, Math.min(index, groupPackages.length - 1)));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [groupPackages.length]);

  return (
    <section
      id="group-tours-section-container"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden"
    >
      {/* Background Accent Subtle Glow */}
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#FF4B00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF4B00] bg-[#FFF0EB] px-3.5 py-1.5 rounded-full border border-[#FF4B00]/20 inline-flex items-center gap-1.5 mb-2.5 shadow-2xs">
              <Bus className="w-3.5 h-3.5 text-[#FF4B00]" />
              <span>Fixed Departures</span>
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>Group Tours</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1.5 max-w-2xl leading-relaxed">
              Travel in comfort with fellow devotees. Guaranteed fixed departures, luxury AC pushback coaches,
              confirmed batch dates, and hassle-free yatra management.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          {groupPackages.length > 1 && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-[#FF4B00] hover:text-white hover:border-[#FF4B00] grid place-items-center transition-all cursor-pointer shadow-2xs active:scale-95"
                aria-label="Previous tours"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-[#FF4B00] hover:text-white hover:border-[#FF4B00] grid place-items-center transition-all cursor-pointer shadow-2xs active:scale-95"
                aria-label="Next tours"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Carousel Track */}
        {groupPackages.length > 0 ? (
          <div>
            <div
              ref={carouselRef}
              className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {groupPackages.map((pkg) => {
                const isFavorite = favoriteIds.includes(pkg.id);
                const isPriceOnRequest = Boolean(
                  pkg.priceOnRequest ||
                  !pkg.price ||
                  pkg.price <= 0 ||
                  (pkg.discountedPrice !== undefined && pkg.discountedPrice <= 0 && (!pkg.price || pkg.price <= 0))
                );
                const startingPrice = pkg.discountedPrice && pkg.discountedPrice > 0 ? pkg.discountedPrice : (pkg.price || 0);
                const grp = pkg.groupTourDetails;
                const totalSeats = grp?.totalSeats || 24;
                const bookedSeats = grp?.bookedSeats || 0;
                const availableSeats = Math.max(1, totalSeats - bookedSeats);
                const savings = isPriceOnRequest ? 0 : (grp?.perPersonSavings || Math.max(0, (pkg.price || 0) - startingPrice));
                const departureDate = grp?.nextDeparture || 'Every Weekend Departure';

                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageClick(pkg.id)}
                    className="group-tour-card group shrink-0 w-[310px] sm:w-[480px] md:w-[540px] snap-start bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#FF4B00]/40 transition-all duration-300 flex flex-col sm:flex-row cursor-pointer"
                  >
                    {/* Left Column: Image with Group Tour Badge */}
                    <div className="relative w-full sm:w-52 md:w-60 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-stone-100">
                      <img
                        src={pkg.coverImage}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

                      {/* Fixed Departure Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        <span className="bg-[#FF4B00] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                          <Bus className="w-3 h-3" />
                          <span>Fixed Departure</span>
                        </span>
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, pkg.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                          isFavorite
                            ? 'bg-rose-500 text-white'
                            : 'bg-black/40 text-white hover:bg-black/70 hover:scale-110'
                        }`}
                        aria-label="Add to wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      {/* Bottom Image Badges: Savings & Duration */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5">
                        {savings > 0 && (
                          <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-400/30 flex items-center gap-1">
                            <BadgePercent className="w-3 h-3 text-emerald-200" />
                            <span>Save ₹{savings.toLocaleString('en-IN')}</span>
                          </span>
                        )}

                        <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-md ml-auto flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-[#FF4B00]" />
                          <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Top Meta: Coach Specs & Star Rating */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md truncate">
                            <Bus className="w-3 h-3 text-[#FF4B00] shrink-0" />
                            <span className="truncate">{grp?.coachType || '2x2 AC Pushback Coach'}</span>
                          </span>

                          <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold shrink-0">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-stone-800">{pkg.rating || 4.9}</span>
                            <span className="text-stone-400 font-normal">({pkg.reviewCount || 28})</span>
                          </div>
                        </div>

                        {/* Package Title */}
                        <h3 className="text-base font-black text-stone-900 leading-snug line-clamp-2 group-hover:text-[#FF4B00] transition-colors">
                          {pkg.title}
                        </h3>

                        {/* Destination Route */}
                        <p className="text-xs text-stone-500 font-medium mt-1 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF4B00] shrink-0" />
                          <span>{pkg.destination}</span>
                        </p>

                        {/* Key Badges: Upcoming Departure & Guaranteed Batch Info */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {/* Upcoming Departure Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-2xs">
                            <CalendarDays className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
                            <span className="text-stone-500 font-medium text-[11px]">Next Batch:</span>
                            <span className="text-stone-900 font-black text-xs">{departureDate}</span>
                          </div>

                          {/* Guaranteed Batch Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium text-[11px]">Departure:</span>
                            <span className="font-black text-xs text-emerald-900">Guaranteed Batch</span>
                          </div>

                          {/* Accommodations Badge */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-stone-600 shrink-0" />
                            <span>Verified Accommodations</span>
                          </div>
                        </div>

                        {/* Boarding Points preview if available */}
                        {grp?.boardingPoints && grp.boardingPoints.length > 0 && (
                          <p className="text-[11px] text-stone-500 font-medium mt-2.5 truncate">
                            <strong className="text-stone-700 font-bold">Boarding:</strong>{' '}
                            {grp.boardingPoints.join(' • ')}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Group Price & Distinct 'Join Group' CTA */}
                      <div className="pt-3.5 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                            {isPriceOnRequest ? 'Pricing' : 'Fixed Fare'}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            {isPriceOnRequest ? (
                              <span className="text-base sm:text-lg font-black text-[#FF4B00]">
                                Price on Request
                              </span>
                            ) : (
                              <>
                                <span className="text-lg sm:text-xl font-black text-[#FF4B00]">
                                  ₹{startingPrice.toLocaleString('en-IN')}
                                </span>
                                {pkg.discountedPrice && pkg.price > pkg.discountedPrice && (
                                  <span className="text-[11px] text-stone-400 line-through font-medium">
                                    ₹{pkg.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="text-[10px] text-stone-500 font-medium">/ seat</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Distinct 'Join Group' Call-to-Action Button with Hover-Lift & Smooth Pulse Effect */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePackageClick(pkg.id);
                          }}
                          className="relative group/btn inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs sm:text-sm font-black transition-all duration-300 transform-gpu hover:-translate-y-1 shadow-xs hover:shadow-lg hover:shadow-[#FF4B00]/30 hover:ring-4 hover:ring-[#FF4B00]/25 cursor-pointer active:scale-95 shrink-0 overflow-hidden"
                        >
                          {/* Smooth Pulse Light Shimmer Layer */}
                          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity duration-300 pointer-events-none" />

                          <span className="relative z-10">Join Group</span>
                          <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Indicators & Next Peek Hint */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5">
                {groupPackages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => {
                      const el = carouselRef.current;
                      if (!el) return;
                      const card = el.querySelector<HTMLElement>('.group-tour-card');
                      if (card) {
                        el.scrollTo({
                          left: dotIdx * (card.offsetWidth + 24),
                          behavior: 'smooth',
                        });
                      }
                    }}
                    aria-label={`Go to tour ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlideIndex === dotIdx ? 'w-6 bg-[#FF4B00]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <span>Swipe or use arrows for more departures</span>
                <ArrowRight className="w-3 h-3 text-[#FF4B00]" />
              </span>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 shadow-2xs">
            <Bus className="w-10 h-10 text-[#FF4B00] mx-auto mb-3" />
            <h3 className="text-base font-black text-stone-900">Upcoming Group Batches Loading</h3>
            <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
              We are releasing new fixed departure group tour batches.
            </p>
            <button
              type="button"
              onClick={() => navigateToSearch({ category: 'Pilgrimage' })}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF4B00] text-white font-black text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
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

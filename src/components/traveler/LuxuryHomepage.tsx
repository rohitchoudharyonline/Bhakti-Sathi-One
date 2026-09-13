import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Heart,
  Hotel,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Search,
  Loader2,
  ShieldCheck,
  Star,
  Users,
  Car,
  Utensils,
  Plane,
  Luggage,
  Sparkles,
  X,
  Globe2,
  BadgeCheck,
  SlidersHorizontal,
  ArrowUpRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Sparkle,
  Headphones,
  CreditCard,
  Flame,
  Camera,
  Sun,
  Mountain,
  Palmtree,
  Gift,
  ChevronDown,
  ChevronUp,
  Building2,
  Edit3,
  Tag,
  Receipt,
  Sparkle as SparkleIcon,
  Settings,
  User,
  FileText,
  Landmark,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { Navbar } from '../common/Navbar';
import { Footer } from './Footer';
import { TourPackage } from '../../types/tour';
import { DestinationMeta } from '../../data/destinationsData';
import { updatePageSeo } from '../../utils/seo';
import { generateAgencyReviewSchema } from '../../utils/seoEngine';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';
import { JapCounterIcon } from './JapCounterIcon';
import { PencilTempleIllustration } from './PencilTempleIllustration';
import { HandpickedYatraPackagesSection } from './HandpickedYatraPackagesSection';
import { GroupToursSection } from './GroupToursSection';
import { PullToRefresh } from '../common/PullToRefresh';
import { FaqSection } from './FaqSection';

// ==========================================
// SEARCH WIDGET OPTION DATA (NO EMOJIS, CLEAN LUXURY)
// ==========================================

const TRAVEL_MONTH_OPTIONS = [
  { id: 'any', label: 'Any Month (Flexible)', sub: 'Travel whenever you are ready' },
  { id: 'current', label: 'Next 30 Days', sub: 'Instant & upcoming departures' },
  { id: 'summer', label: 'Summer Yatra (Apr - Jun)', sub: 'Pleasant mountain weather & auspicious darshan' },
  { id: 'monsoon', label: 'Monsoon / Shravan (Jul - Sep)', sub: 'Sacred Shravan month & auspicious yatras' },
  { id: 'winter', label: 'Winter Season (Oct - Mar)', sub: 'Navratri, Diwali & winter temple festivals' },
];

// ==========================================
// CORE DESTINATION SHOWCASES
// ==========================================

interface LocationShowcase {
  id: string;
  type: 'domestic';
  name: string;
  subtitle: string;
  badge: string;
  country: string;
  tagline: string;
  highlights: string[];
  keyPills: string[];
  featureTag: string;
  featureDetail: string;
  startingPrice: number;
  duration: string;
  coverImage: string;
  filterKey: string;
  toursCount?: string;
}

const REVIEWS = [
  {
    id: 'rev-1',
    name: 'Sunil & Renu Verma',
    city: 'New Delhi',
    trip: 'Kashmir Paradise (4-Star Super Deluxe)',
    rating: 5,
    comment:
      'Bhakti Sathi delivered an unforgettable experience. The Gulmarg Gondola Phase 2 and Dal Lake houseboat stays were pristine. Our private Innova driver was punctual, friendly, and courteous with our senior parents.',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'Amit & Pooja Sharma',
    city: 'Chandigarh',
    trip: 'Shimla Manali Deluxe Holiday (3-Star Deluxe)',
    rating: 5,
    comment:
      'From Atal Tunnel snow excursions to Shimla Mall Road, everything was seamlessly organized. Hotels had reliable room heating, delicious buffets, and prompt customer support.',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Rohit & Sneha Patel',
    city: 'Ahmedabad',
    trip: 'Vietnam Ha Long Cruise & Da Nang (4-Star Luxury)',
    rating: 5,
    comment:
      'The 5-star Ha Long Bay overnight cruise and Ba Na Hills Golden Hands Bridge tour were magical! Everything was hassle-free with zero language barrier.',
    verified: true,
  },
];

const WHY_HOLIDAYS_HUNT = [
  {
    id: 'free-insurance',
    icon: ShieldCheck,
    title: 'Free Travel Insurance (₹200K)',
    subtitle: 'Complimentary Cover',
    description:
      'Complimentary emergency accidental & baggage insurance up to ₹2,00,000 included with every verified holiday booking.',
  },
  {
    id: 'cabs-transfers',
    icon: Car,
    title: 'Dedicated Private Cabs',
    subtitle: 'Zero Hidden Costs',
    description:
      'Reserved Sedan & Innova Crysta cabs with courteous hill drivers. Includes state tolls, green taxes & parking.',
  },
  {
    id: 'seasonal-rates',
    icon: Tag,
    title: '100% Transparent Rates',
    subtitle: 'No Surprise Taxes',
    description:
      'Upfront itemized quotes covering hotels, meals, cabs & permits. What we quote is exactly what you pay.',
  },
  {
    id: 'stays-deals',
    icon: Building2,
    title: 'Verified Stays & Heating',
    subtitle: 'Quality Guaranteed',
    description:
      'Handpicked hotels, heated Kashmiri houseboats on Dal Lake, and 5-star mountain resorts with verified amenities.',
  },
  {
    id: 'customization',
    icon: Edit3,
    title: 'Customizable Itineraries',
    subtitle: 'Travel at Your Pace',
    description:
      'Tailor your daily schedule—add extra days in Pahalgam, upgrade vehicles, or request Jain / vegetarian meal options.',
  },
  {
    id: 'customer-support',
    icon: Headphones,
    title: '24/7 Local Ground Operations',
    subtitle: 'WhatsApp & Call Support',
    description:
      'Active local team guiding you from airport arrival to departure with real-time assistance and snow updates.',
  },
  {
    id: 'holiday-options',
    icon: Sparkles,
    title: 'Sacred Yatras for Every Devotee',
    subtitle: 'Families & Senior Citizens',
    description:
      'Curated devotional itineraries for families, senior citizens, and satsang groups with verified hotel stays.',
  },
];

// ==========================================
// MAIN CLEAN PORTAL HOMEPAGE (MMT / CLEARTRIP STYLE)
// ==========================================

export const LuxuryHomepage: React.FC = () => {
  const {
    packages,
    destinations,
    temples,
    mediaAssets,
    agencySettings,
    setActiveView,
    setSelectedPackageId,
    toggleWishlist,
    isWishlisted,
    submitInquiry,
    navigateToDestination,
    navigateToTemple,
    navigateToSearch,
    pageSeoConfigs,
  } = useTours();

  useEffect(() => {
    const agencySchema = generateAgencyReviewSchema(agencySettings);
    const homeSeo = pageSeoConfigs?.['home'];
    
    updatePageSeo({
      title: homeSeo?.metaTitle || "Bhakti Sathi — All India Sacred Pilgrimage & Yatra Packages",
      description: homeSeo?.metaDescription || "Book customized sacred pilgrimage and yatra tour packages across India with verified hotel stays, priority darshan support, 1,300+ 5-star traveler reviews, and dedicated private transfers.",
      canonicalUrl: homeSeo?.canonicalUrl || "https://mybhaktisathi.com",
      canonicalPath: "/",
      schemaData: agencySchema,
      noIndex: homeSeo?.noIndex,
      noFollow: homeSeo?.noFollow,
    });
  }, [agencySettings, pageSeoConfigs]);

  // Filter States
  const [destinationScope, setDestinationScope] = useState<'all' | 'domestic' | 'international'>('domestic');
  const [activeSpecificDest, setActiveSpecificDest] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('any');
  const [durationFilter, setDurationFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [openWhyId, setOpenWhyId] = useState<string | null>('stays-deals');
  const [openDropdown, setOpenDropdown] = useState<'dest' | 'month' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [pulsingTempleId, setPulsingTempleId] = useState<string | null>(null);

  const handleTempleClick = (temple: (typeof temples)[number]) => {
    setPulsingTempleId(temple.id);
    setTimeout(() => {
      navigateToTemple(temple.id);
      setPulsingTempleId(null);
    }, 240);
  };

  const destinationSearchOptions = useMemo(() => {
    const destList = Object.values(destinations || {}) as DestinationMeta[];
    const dynamicDestOptions = destList.map((d) => ({
      id: d.slug || d.id,
      name: d.displayName || d.name,
      region: d.state || 'Circuit',
      desc: d.tagline || (d.popularCities && d.popularCities.length > 0 ? d.popularCities.join(', ') : `${d.name} Pilgrimage`),
      type: 'dest' as const,
    }));

    return [
      ...dynamicDestOptions,
      { id: 'all', name: 'All Sacred Yatras & Temples', region: 'Explore', desc: 'Browse all spiritual yatra & temple packages', type: 'dest' as const },
    ];
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const list = Object.values(destinations || {}) as DestinationMeta[];
    return list.map((d) => ({
      id: d.id || d.slug,
      type: 'domestic' as const,
      destinationType: d.destinationType || 'regular',
      name: d.displayName || d.name,
      subtitle: d.tagline || `${d.name} Sacred Circuit`,
      badge: (d as any).badge || `${(d as any).packagesCount || 6}+ YATRA PACKAGES`,
      toursCount: (d as any).badge || `${(d as any).packagesCount || 6}+ YATRA PACKAGES`,
      country: d.state || 'India',
      tagline: d.tagline || '',
      highlights: d.keyHighlights || (d.popularCities && d.popularCities.length > 0 ? d.popularCities.slice(0, 3) : ['Priority Darshan', 'Verified Stays', 'Private Chauffeur']),
      keyPills: d.keyHighlights || (d.popularCities && d.popularCities.length > 0 ? d.popularCities.slice(0, 3) : ['Priority Darshan', 'Verified Stays', 'Private Chauffeur']),
      featureTag: d.state || 'Sacred Pilgrimage',
      featureDetail: 'Verified Stays • Priority Darshan Support',
      startingPrice: d.startingPrice || 6499,
      duration: d.guide?.idealDuration?.split('(')[0]?.trim() || '4 - 8 Days',
      coverImage: d.heroImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
      filterKey: d.slug || d.id,
    }));
  }, [destinations]);

  const handleRefresh = async () => {
    // Simulate real-time server check/refresh for latest yatra packages and agency settings
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoadedImages({});
  };


  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.hero-search-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Call Back Request Form State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadYatra, setLeadYatra] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    setOpenDropdown(null);

    setTimeout(() => {
      if (activeSpecificDest.startsWith('temple:')) {
        const rawTempleId = activeSpecificDest.replace('temple:', '');
        const targetTemple = temples.find((t) => t.id === rawTempleId);
        navigateToSearch({
          templeId: rawTempleId,
          templeName: targetTemple ? targetTemple.name : undefined,
          searchQuery: searchQuery,
          category: 'pilgrimage',
          month: selectedMonth !== 'any' ? selectedMonth : undefined,
        });
      } else {
        navigateToSearch({
          destinationSlug: activeSpecificDest,
          searchQuery: searchQuery,
          category: 'pilgrimage',
          month: selectedMonth !== 'any' ? selectedMonth : undefined,
        });
      }
      setIsSearching(false);
    }, 350);
  };

  const handleSelectTravelStyle = (style: 'pilgrimage' | 'family') => {
    navigateToSearch({
      category: style,
    });
  };

  const captureDestinationInteraction = (locationId: string, locationName: string) => {
    try {
      const stored = localStorage.getItem('holidays_hunt_analytics_clicks') || '{}';
      const stats = JSON.parse(stored);
      stats[locationId] = (stats[locationId] || 0) + 1;
      localStorage.setItem('holidays_hunt_analytics_clicks', JSON.stringify(stats));
      console.log(`[Bhakti Sathi Analytics] Captured interaction for "${locationName}" (${locationId}). Total clicks: ${stats[locationId]}`);
    } catch (e) {
      console.error('Failed to capture destination interaction', e);
    }
  };

  const handleSelectLocationCard = (location: LocationShowcase) => {
    captureDestinationInteraction(location.id, location.name);
    navigateToDestination(location.filterKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Phone number must be mandatory and contain at least 10 digits
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const isLeadFormValid = Boolean(
    leadName.trim() &&
    isValidPhone(leadPhone) &&
    (!leadEmail.trim() || isValidEmail(leadEmail))
  );

  const handleCustomLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !isValidPhone(leadPhone)) return;
    if (leadEmail.trim() && !isValidEmail(leadEmail)) return;

    const cleanEmail = leadEmail.trim()
      ? leadEmail.trim().toLowerCase()
      : `${leadPhone.replace(/\D/g, '')}@callback.bhaktisathi.com`;

    submitInquiry({
      travelerName: leadName.trim(),
      phone: leadPhone.trim(),
      email: cleanEmail,
      packageTitle: `Pilgrimage Callback Request${leadYatra.trim() ? `: ${leadYatra.trim()}` : ''}`,
      travelDate: 'Flexible',
      adults: 1,
      children: 0,
      specialRequests: `Devotee requested instant callback on WhatsApp / Phone: ${leadPhone.trim()}.${leadYatra.trim() ? ` Yatra / Darshan: ${leadYatra.trim()}.` : ''}${leadNotes.trim() ? ` Query / Details: ${leadNotes.trim()}.` : ''}`,
      estimatedTotal: 0,
    });
    setLeadSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Main Navigation Bar */}
      <Navbar />

      <main className="flex-1 pb-20 md:pb-6">
        <PullToRefresh onRefresh={handleRefresh}>
          {/* ========================================================
              MAKEMYTRIP / CLEARTRIP STYLE CLEAN HERO WITH MASTER SEARCH
              ======================================================== */}
        <section className="relative bg-[#FFFDF9] border-b border-stone-200/80 pt-12 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8">
          {/* Aesthetic Temple Pencil Illustration covering the whole hero section */}
          <PencilTempleIllustration className="absolute inset-0 w-full h-full pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Slogan & Title Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="max-w-2xl">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight drop-shadow-2xs">
                  Which sacred shrine would you like to visit?
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
                  Curating sacred pilgrimage tours with love, care, and devotion across <b className="text-stone-900 font-extrabold">India</b>.
                </p>
              </div>

              {/* Verified Best Sacred Pilgrimage Specialist Badge */}
              <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-[#FFF0EB]/95 backdrop-blur-xs border border-[#FF4B00]/30 text-xs font-bold shrink-0 self-start md:self-auto shadow-2xs">
                <span className="px-3 py-1.5 rounded-lg bg-[#FF4B00] text-white font-black inline-flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  India&apos;s Best Sacred Pilgrimage &amp; Yatra Specialist
                </span>
              </div>
            </div>

            {/* MASTER SEARCH WIDGET (CLEAN, DEDICATED DEVOTIONAL SEARCH) */}
            <div id="search-widget-container" className="relative z-20 bg-white rounded-2xl border-2 border-stone-200/90 shadow-lg p-4 sm:p-5">
              <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 relative">
                {/* Column 1: Sacred Destination / Temple Selector */}
                <div className="md:col-span-5 relative hero-search-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'dest' ? null : 'dest')}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl bg-stone-50 border transition cursor-pointer flex flex-col justify-between min-h-[52px] sm:min-h-[56px] ${
                      openDropdown === 'dest'
                        ? 'border-stone-900 ring-2 ring-stone-100 bg-white'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Sacred Destination / Shrine
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-[#FF4B00] shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                          {destinationSearchOptions.find((d) => d.id === activeSpecificDest)?.name || 'All Sacred Destinations'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          openDropdown === 'dest' ? 'rotate-180 text-stone-900' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Destination Dropdown Popover */}
                  {openDropdown === 'dest' && (
                    <div className="absolute top-full left-0 right-0 sm:min-w-[320px] mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 p-2 space-y-1 max-h-[320px] overflow-y-auto">
                      <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                        Select Sacred Destination
                      </div>
                      {destinationSearchOptions.map((dest) => {
                        const isSelected = activeSpecificDest === dest.id;
                        return (
                          <button
                            key={dest.id}
                            type="button"
                            onClick={() => {
                              setActiveSpecificDest(dest.id);
                              setSearchQuery('');
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-[#FFF0EB] text-[#FF4B00] font-bold border border-[#FF4B00]/20'
                                : 'hover:bg-stone-50 text-stone-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold">{dest.name}</span>
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                                  {dest.region}
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-500 block truncate mt-0.5 font-normal">
                                {dest.desc}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#FF4B00] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: Travel Month / Yatra Season */}
                <div className="md:col-span-4 relative hero-search-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl bg-stone-50 border transition cursor-pointer flex flex-col justify-between min-h-[52px] sm:min-h-[56px] ${
                      openDropdown === 'month'
                        ? 'border-stone-900 ring-2 ring-stone-100 bg-white'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Travel Month
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-stone-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                          {TRAVEL_MONTH_OPTIONS.find((m) => m.id === selectedMonth)?.label || 'Any Month (Flexible)'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          openDropdown === 'month' ? 'rotate-180 text-stone-900' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Month Dropdown Popover */}
                  {openDropdown === 'month' && (
                    <div className="absolute top-full left-0 right-0 sm:min-w-[280px] mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 p-2 space-y-1 max-h-[320px] overflow-y-auto">
                      <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                        Preferred Travel Season
                      </div>
                      {TRAVEL_MONTH_OPTIONS.map((m) => {
                        const isSelected = selectedMonth === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedMonth(m.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-stone-100 text-stone-900 font-bold'
                                : 'hover:bg-stone-50 text-stone-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-bold block">{m.label}</span>
                              <span className="text-[11px] text-stone-500 block truncate mt-0.5 font-normal">
                                {m.sub}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-stone-900 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 3: Search Action Button */}
                <div className="md:col-span-3 flex items-center">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full h-11 sm:h-12 md:h-full min-h-[44px] md:min-h-[56px] py-2.5 px-4 sm:px-5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] disabled:bg-[#FF4B00]/90 text-white text-xs sm:text-sm font-black transition shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:cursor-wait"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-white shrink-0" />
                        <span>Search Sacred Yatras</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sacred 108 Japa Mala Counter Small Quick Icon (No text, pure icon) */}
            <JapCounterIcon />
          </div>
        </section>

        {/* ========================================================
            TRUST STRIP (MakeMyTrip Style)
            ======================================================== */}
        <section className="bg-stone-100/70 border-b border-stone-200/80 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-stone-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-stone-200 grid place-items-center text-stone-900 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs font-bold text-stone-900 block">100% Customizable</b>
                <span className="text-[10px] text-stone-500">Tailored to your dates</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-stone-200 grid place-items-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs font-bold text-stone-900 block">Verified Hotels</b>
                <span className="text-[10px] text-stone-500">2★ to 5★ inspected hotels</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-stone-200 grid place-items-center text-blue-600 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs font-bold text-stone-900 block">Private Mountain Cab</b>
                <span className="text-[10px] text-stone-500">Local experienced driver</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-stone-200 grid place-items-center text-[#FF4B00] shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs font-bold text-stone-900 block">24x7 Trip Support</b>
                <span className="text-[10px] text-stone-500">Dedicated on-ground support</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SIGNATURE TEERTH STHAL (SACRED PILGRIMAGE) CARDS
            ======================================================== */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FF4B00] bg-[#FF4B00]/10 px-2.5 py-0.5 rounded-full border border-[#FF4B00]/20">
                    Sacred Pilgrimages
                  </span>
                  <span className="text-[11px] font-medium text-stone-400">तीर्थ स्थल</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>Pavitra Teerth Sthal</span>
                  <span className="w-8 h-1 bg-[#FF4B00] rounded-full inline-block" />
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 leading-relaxed max-w-2xl">
                  Divine darshans, revered Shaktipeeths & blessed yatra circuits with verified comfortable stays and priority assistance.
                </p>
              </div>
            </div>

            {/* Dynamic Card Grid */}
            <style dangerouslySetInnerHTML={{ __html: `
              .dest-card-container {
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease-out, box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
              }
              .dest-card-container:hover {
                box-shadow: 0 20px 25px -5px rgba(255, 75, 0, 0.2) !important;
              }
              .dest-card-container:hover .card-badge-badge {
                transform: rotate(-5deg) !important;
              }
              .card-badge-badge {
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                display: inline-block !important;
              }
              .dest-card-container .dest-card-img {
                transition: transform 0.8s ease-in-out, opacity 0.8s ease-out, scale 0.8s ease-out !important;
              }
              .dest-card-container:hover .dest-card-img {
                transform: scale(1.15) !important;
              }
              .dest-card-container:active {
                transform: scale(0.98) !important;
                box-shadow: inset 0 0 0 3px #FF4B00, 0 8px 16px -4px rgba(255, 75, 0, 0.3) !important;
                transition: transform 0.1s ease-out, box-shadow 0.1s ease-out !important;
              }
              @keyframes skeleton-shimmer-anim {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              .skeleton-shimmer-bg {
                background: linear-gradient(90deg, #1c1917 25%, #292524 50%, #1c1917 75%) !important;
                background-size: 200% 100% !important;
                animation: skeleton-shimmer-anim 1.5s infinite linear !important;
              }
            ` }} />
            {filteredDestinations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center max-w-md mx-auto">
                <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-700">No destinations available</p>
                <p className="text-xs text-stone-500 mt-1">Create destinations in the CMS to showcase them here.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${filteredDestinations.length === 1 ? 'sm:grid-cols-1 max-w-xl mx-auto' : filteredDestinations.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'} gap-4 sm:gap-6`}>
                {filteredDestinations.map((loc, index) => {
                  const isSelected = activeSpecificDest === loc.filterKey;
                  const isImgLoaded = loadedImages[loc.id];

                  const displayBadge = loc.toursCount || loc.badge;

                  return (
                    <motion.div
                      key={loc.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      id={`dest-card-${loc.filterKey}`}
                      onClick={() => handleSelectLocationCard(loc)}
                      className={`dest-card-container group relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border transition-all duration-500 ease-out shadow-sm hover:shadow-[0_20px_25px_-5px_rgba(255,75,0,0.2)] hover:-translate-y-1 hover:scale-[1.02] flex flex-col justify-between p-4 sm:p-6 ${
                        isSelected
                          ? 'border-[#FF4B00] ring-2 ring-[#FF4B00]/40'
                          : 'border-stone-200/90 hover:border-[#FF4B00]/70'
                      }`}
                    >
                      {/* Shimmer Placeholder Overlay */}
                      {!isImgLoaded && (
                        <div className="absolute inset-0 skeleton-shimmer-bg transition-opacity duration-500 pointer-events-none z-10" />
                      )}

                      {/* Background Cover Image */}
                      <img
                        src={resolveDisplayImage(loc.coverImage, mediaAssets)}
                        alt={loc.name}
                        onError={(e) => {
                          handleImageError(e, loc.coverImage, mediaAssets);
                          setLoadedImages((prev) => ({ ...prev, [loc.id]: true }));
                        }}
                        onLoad={() => setLoadedImages((prev) => ({ ...prev, [loc.id]: true }))}
                        className={`dest-card-img absolute inset-0 w-full h-full object-cover transition-all ease-out ${
                          isImgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                        loading="lazy"
                      />

                      {/* Multi-step Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none z-10" />
                      
                      {/* Brand Color Hover Overlay */}
                      <div className="absolute inset-0 bg-[#FF4B00]/0 group-hover:bg-[#FF4B00]/10 transition-colors duration-500 pointer-events-none z-10 mix-blend-overlay" />

                      {/* Top Right High-CTR Interactive Icon & Optional Badge */}
                      <div className="relative z-10 flex justify-between items-start pointer-events-none">
                        <div>
                          {loc.destinationType === 'temple' && (
                            <span className="inline-flex items-center gap-1.5 bg-[#FF4B00]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md border border-white/20">
                              <Landmark className="w-3.5 h-3.5" />
                              Temple Destination
                            </span>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-[#FF4B00] group-hover:scale-110 transition-all duration-300 shadow-md">
                          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                        </div>
                      </div>

                      {/* Bottom Destination Name & Action Button */}
                      <div className="relative z-10 text-white pointer-events-none flex items-end justify-between gap-3">
                        <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-200 transition-colors drop-shadow-md leading-tight tracking-tight">
                          {loc.name}
                        </h3>
                        <div className="w-9 h-9 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 group-hover:translate-x-1 transition-transform shrink-0 shadow-lg">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            SACRED TEMPLES & HOLY PLACES (PAVITRA MANDIR & DHAM)
            ======================================================== */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FF4B00] bg-[#FF4B00]/10 px-2.5 py-0.5 rounded-full border border-[#FF4B00]/20 inline-flex items-center gap-1">
                    <Landmark className="w-3 h-3" />
                    <span>Holy Shrine & Temple</span>
                  </span>
                  <span className="text-[11px] font-medium text-stone-400">धाम एवं मंदिर दर्शन</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>Pavitra Mandir & Dham</span>
                  <span className="w-8 h-1 bg-[#FF4B00] rounded-full inline-block" />
                </h2>
              </div>

              {/* Carousel Navigation Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('temples-carousel');
                    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-[#FF4B00] hover:text-white hover:border-[#FF4B00] grid place-items-center transition-all cursor-pointer shadow-2xs active:scale-95"
                  aria-label="Previous holy shrine"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('temples-carousel');
                    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-[#FF4B00] border border-[#FF4B00] text-white hover:bg-[#E04200] grid place-items-center transition-all cursor-pointer shadow-2xs active:scale-95"
                  aria-label="Next holy shrine"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Temples Carousel */}
            <div
              id="temples-carousel"
              className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {temples.map((temple, idx) => (
                <motion.div
                  key={temple.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  animate={
                    pulsingTempleId === temple.id
                      ? { scale: [1, 0.92, 1.04, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    pulsingTempleId === temple.id
                      ? { duration: 0.24, times: [0, 0.35, 0.75, 1], ease: 'easeInOut' }
                      : { duration: 0.35, delay: Math.min(idx * 0.03, 0.3) }
                  }
                  whileHover={pulsingTempleId ? undefined : { y: -4 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleTempleClick(temple)}
                  className="group relative shrink-0 w-[210px] sm:w-[240px] md:w-[260px] aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-stone-200/90 hover:border-[#FF4B00] shadow-2xs hover:shadow-xl flex flex-col justify-end p-4 sm:p-5 snap-start select-none transition-[border-color,box-shadow] duration-300"
                >
                  {/* Temple Image */}
                  <img
                    src={resolveDisplayImage(temple.image, mediaAssets)}
                    alt={temple.name}
                    onError={(e) => handleImageError(e, temple.image, mediaAssets)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-transparent pointer-events-none" />

                  {/* Temple Name Over Card */}
                  <div className="relative z-10 text-white pointer-events-none">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors drop-shadow-md leading-snug">
                      {temple.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            HANDPICKED YATRA PACKAGES (CURATED PILGRIMAGES & DARSHANS)
            ======================================================== */}
        <HandpickedYatraPackagesSection />

        {/* ========================================================
            GROUP TOURS & SANGHA PILGRIMAGES
            ======================================================== */}
        <GroupToursSection />

        {/* ========================================================
            WHY HOLIDAYS HUNT? (BLACK & WHITE SMOOTH SWIPE CAROUSEL)
            ======================================================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-black bg-stone-100 px-3.5 py-1.5 rounded-full border border-black/10 inline-flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>The Bhakti Sathi Guarantee</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Why Travel With Us?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 max-w-xl leading-relaxed">
                Handcrafted itineraries, verified 3★ to 5★ hotel stays, and private dedicated chauffeur cabs for complete peace of mind.
              </p>
            </div>

            {/* Carousel Navigation Arrow Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById('why-us-carousel');
                  if (container) container.scrollBy({ left: -380, behavior: 'smooth' });
                }}
                className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-[#FF4B00] hover:text-white hover:border-[#FF4B00] grid place-items-center transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById('why-us-carousel');
                  if (container) container.scrollBy({ left: 380, behavior: 'smooth' });
                }}
                className="w-10 h-10 rounded-full bg-[#FF4B00] border border-[#FF4B00] text-white hover:bg-[#E04200] grid place-items-center transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Touch & Scroll Snap Carousel Container */}
          <div
            id="why-us-carousel"
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {WHY_HOLIDAYS_HUNT.map((item, idx) => {
              const IconComp = item.icon;

              return (
                <div
                  key={item.id}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className="w-[84vw] sm:w-[360px] md:w-[380px] shrink-0 snap-start bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs hover:border-black hover:shadow-md transition-all duration-200 flex flex-col justify-between group active:scale-[0.97] cursor-grab active:cursor-grabbing select-none animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                >
                  <div>
                    {/* Monochrome Icon Badge & Subtitle Pill */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#FF4B00]/10 text-[#FF4B00] grid place-items-center shrink-0 group-hover:bg-[#FF4B00]/20 transition-colors">
                        <IconComp className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-black bg-stone-100 border border-black/15 px-3 py-1 rounded-md">
                        {item.subtitle}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-black text-black tracking-tight leading-snug mb-2 group-hover:underline">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Minimalist Bottom Indicator Line */}
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-500">
                    <span>HOLIDAYS HUNT EXCLUSIVE</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF4B00] inline-block" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            CUSTOM HOLIDAY PLANNER / INSTANT CALLBACK FORM
            ======================================================== */}
        <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1917] via-[#261e1a] to-[#1a1512] rounded-3xl p-6 md:p-8 lg:p-10 text-white shadow-xl border border-[#FF4B00]/25 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Brand ambient glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FF4B00]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#FF4B00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-xl">
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFF0EB] text-[#FF4B00] border border-[#FF4B00]/30 text-[10.5px] font-black uppercase tracking-wider mb-3 inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4B00]" />
                <span>Instant Callback Assistance</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Request an Instant Call Back
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                Have questions or need a customized pilgrimage plan? Enter your WhatsApp or phone number. Our yatra specialist will call you back within 15 minutes with complete details.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 text-xs font-bold text-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FFF0EB]/15 border border-[#FF4B00]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#FF4B00]" />
                  </div>
                  <span>Callback Within 15 Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FFF0EB]/15 border border-[#FF4B00]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#FF4B00]" />
                  </div>
                  <span>Direct Local Chauffeurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FFF0EB]/15 border border-[#FF4B00]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#FF4B00]" />
                  </div>
                  <span>Zero Agent Commissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FFF0EB]/15 border border-[#FF4B00]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#FF4B00]" />
                  </div>
                  <span>Instant WhatsApp Itinerary</span>
                </div>
              </div>
            </div>

            {/* Quick Callback Box with Brand Colors */}
            <div className="relative w-full md:w-[380px] lg:w-[410px] bg-white rounded-2xl p-5 sm:p-6 text-stone-900 shadow-2xl shrink-0 border-2 border-[#FF4B00]/25 overflow-hidden">
              {/* Top brand saffron banner stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF4B00] via-[#FF7A33] to-[#FF4B00]" />

              {leadSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-[#FFF0EB] border border-[#FF4B00]/30 text-[#FF4B00] grid place-items-center mx-auto mb-3 shadow-xs">
                    <Check className="w-7 h-7 text-[#FF4B00]" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Callback Request Received!</h3>
                  <p className="text-xs text-stone-600 mt-1.5">
                    Our pilgrimage specialist will call or WhatsApp you at <b className="text-[#FF4B00]">{leadPhone}</b> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadSubmitted(false);
                      setLeadPhone('');
                      setLeadYatra('');
                      setLeadNotes('');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#FFF0EB] hover:bg-[#FFE4D6] text-[#FF4B00] border border-[#FF4B00]/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Request Another Callback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomLeadSubmit} className="space-y-3 pt-1">
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] border border-[#FF4B00]/30 text-[#FF4B00] flex items-center justify-center shrink-0 shadow-xs">
                        <PhoneCall className="w-4 h-4 text-[#FF4B00]" />
                      </div>
                      <div>
                        <b className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                          Request a Call Back
                        </b>
                        <span className="text-[10px] text-stone-500 font-medium">Yatra expert connects in 15 mins</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-stone-800 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#FF4B00]" />
                      <span>Your Full Name</span>
                      <span className="text-[#FF4B00] font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] font-black uppercase tracking-wider text-stone-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#FF4B00]" />
                        <span>WhatsApp / Phone Number</span>
                        <span className="text-[#FF4B00] font-bold">*</span>
                      </label>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition select-none ${
                          isValidPhone(leadPhone)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : leadPhone.trim().length > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-[#FFF0EB] text-[#FF4B00] border-[#FF4B00]/30'
                        }`}
                      >
                        {isValidPhone(leadPhone) ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </>
                        ) : leadPhone.trim().length > 0 ? (
                          <span>Min 10 Digits</span>
                        ) : (
                          <span>* Mandatory</span>
                        )}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210 (Mandatory)"
                        className={`w-full px-3 py-2 rounded-xl bg-stone-50/80 border text-xs font-semibold focus:bg-white focus:outline-none transition ${
                          isValidPhone(leadPhone)
                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : leadPhone.trim().length > 0
                            ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                            : 'border-stone-200 focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-[#25D366] shrink-0" />
                      <span>Mandatory for callback. We will call or WhatsApp on this number.</span>
                    </p>
                  </div>

                  {/* Pilgrimage / Yatra of Interest (Open text input, no dropdown options) */}
                  <div>
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-stone-800 mb-1 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#FF4B00]" />
                      <span>Pilgrimage / Yatra of Interest</span>
                      <span className="text-stone-400 font-normal normal-case ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={leadYatra}
                      onChange={(e) => setLeadYatra(e.target.value)}
                      placeholder="e.g. Mata Vaishno Devi, Amarnath, Kedarnath, Char Dham..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20 transition"
                    />
                  </div>

                  {/* Requirements / Query (Open text area, no options) */}
                  <div>
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-stone-800 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#FF4B00]" />
                      <span>Your Query or Requirements</span>
                      <span className="text-stone-400 font-normal normal-case ml-1">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      placeholder="e.g. Need helicopter ticket guidance, senior citizen darshan, tentative dates..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20 transition resize-none"
                    />
                  </div>

                  <EmailVerificationInput
                    id="homepage-lead-email"
                    value={leadEmail}
                    onChange={(val) => setLeadEmail(val)}
                    label="Email Address"
                    placeholder="e.g. yourname@gmail.com (Optional)"
                    required={false}
                    helperText="Optional: To receive yatra itinerary copy on email."
                    inputClassName="bg-stone-50/80 border-stone-200 py-2 text-xs"
                  />

                  <div>
                    <button
                      type="submit"
                      disabled={!isLeadFormValid}
                      className="w-full py-3 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] active:scale-[0.99] disabled:bg-stone-200 disabled:border-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white border border-[#FF4B00] text-xs font-black transition-all shadow-md shadow-[#FF4B00]/25 hover:shadow-lg hover:shadow-[#FF4B00]/35 cursor-pointer mt-2 flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-white" />
                      <span>Request Instant Callback</span>
                    </button>
                    {!isValidPhone(leadPhone) ? (
                      <p className="text-[10px] text-center text-[#FF4B00] mt-1.5 font-bold">
                        * Enter a valid 10-digit WhatsApp or Phone number to enable callback.
                      </p>
                    ) : (
                      <p className="text-[10px] text-center text-stone-500 mt-1.5 font-medium">
                        ✓ Free callback within 15 minutes • 100% privacy protected
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQ) Section */}
        <FaqSection />
        </PullToRefresh>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

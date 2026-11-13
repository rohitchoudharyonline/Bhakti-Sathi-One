import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { FeaturedDestinationsCarousel } from './FeaturedDestinationsCarousel';
import { Footer } from './Footer';
import { TourPackage } from '../../types/tour';
import { DestinationMeta } from '../../data/destinationsData';
import { updatePageSeo } from '../../utils/seo';
import { generateAgencyReviewSchema } from '../../utils/seoEngine';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';
import { TravelerReviewsSection } from './TravelerReviewsSection';
import { PencilTempleIllustration } from './PencilTempleIllustration';
import { HandpickedYatraPackagesSection, CategoryToursCarouselSection } from './HandpickedYatraPackagesSection';
import { PullToRefresh } from '../common/PullToRefresh';
import { FaqSection } from './FaqSection';
import { QuickOrderContactCards } from '../common/QuickOrderContactCards';

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
      'Holidays Hunt delivered an unforgettable experience. The Gulmarg Gondola Phase 2 and Dal Lake houseboat stays were pristine. Our private Innova driver was punctual, friendly, and courteous with our senior parents.',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'Amit & Pooja Sharma',
    city: 'Chandigarh',
    trip: 'Kashmir Family Holiday (3-Star Deluxe)',
    rating: 5,
    comment:
      'From Gulmarg snow excursions to Pahalgam sightseeing, everything was seamlessly organized. Hotels were comfortable, the itinerary was smooth, and customer support was prompt.',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Rohit & Sneha Patel',
    city: 'Ahmedabad',
    trip: 'Vaishno Devi & Kashmir Circuit (4-Star Luxury)',
    rating: 5,
    comment:
      'The helicopter darshan at Vaishno Devi and houseboat stay on Dal Lake were seamless. Our chauffeur was courteous and the 24/7 local support was prompt and reassuring.',
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
// LAZY IMAGE COMPONENT
// ==========================================
const LazyImage = ({ src, alt, className, onError, onLoad, ...props }: any) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' } // Load images 200px before they enter viewport
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

  return (
    <img
      ref={imgRef}
      src={isIntersecting && src ? src : placeholder}
      alt={alt}
      className={className}
      onError={onError}
      onLoad={onLoad}
      {...props}
    />
  );
};

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
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": agencySettings?.agencyName || "Holidays Hunt",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    const agencySchema = generateAgencyReviewSchema(agencySettings);
    const homeSeo = pageSeoConfigs?.['home'];
    
    updatePageSeo({
      title: homeSeo?.metaTitle || "Holidays Hunt — Jammu & Kashmir and Himachal Pradesh Tour Packages",
      description: homeSeo?.metaDescription || "Book customized Jammu & Kashmir and Himachal Pradesh tour packages with Holidays Hunt. Discover verified stays, Dal Lake houseboats, private cabs, and 24x7 local ground support.",
      canonicalUrl: homeSeo?.canonicalUrl || "https://holidayshunt.com",
      canonicalPath: "/",
      schemaData: [websiteSchema, agencySchema],
      noIndex: homeSeo?.noIndex,
      noFollow: homeSeo?.noFollow,
    });
  }, [agencySettings, pageSeoConfigs]);

  // Filter States
  const [activeSpecificDest, setActiveSpecificDest] = useState<string>('all');
  const [selectedTourType, setSelectedTourType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('any');
  const [durationFilter, setDurationFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [openWhyId, setOpenWhyId] = useState<string | null>('stays-deals');
  const [openDropdown, setOpenDropdown] = useState<'dest' | 'month' | 'type' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [pulsingTempleId, setPulsingTempleId] = useState<string | null>(null);
  const searchQueryInputRef = useRef<HTMLInputElement>(null);

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
      { id: 'all', name: 'All Destinations & Packages', region: 'Explore', desc: 'Browse all tour and holiday packages', type: 'dest' as const },
    ];
  }, [destinations]);

  const queryLower = searchQuery.trim().toLowerCase();
  const matchedPackages = useMemo(() => {
    if (!queryLower) return [];
    return (packages || []).filter(p => p.title.toLowerCase().includes(queryLower) || p.destination.toLowerCase().includes(queryLower) || (p.tagline && p.tagline.toLowerCase().includes(queryLower))).slice(0, 4);
  }, [packages, queryLower]);

  const matchedDestinations = useMemo(() => {
    if (!queryLower) return [];
    return destinationSearchOptions.filter(d => d.id !== 'all' && (d.name.toLowerCase().includes(queryLower) || d.desc.toLowerCase().includes(queryLower) || d.region.toLowerCase().includes(queryLower))).slice(0, 3);
  }, [destinationSearchOptions, queryLower]);

  const matchedTemples = useMemo(() => {
    if (!queryLower) return [];
    return (temples || []).filter(t => t.name.toLowerCase().includes(queryLower) || t.city.toLowerCase().includes(queryLower) || t.state.toLowerCase().includes(queryLower) || (t.deity && t.deity.toLowerCase().includes(queryLower))).slice(0, 3);
  }, [temples, queryLower]);

  const flatDropdownItems = useMemo(() => {
    if (queryLower) {
      const items: Array<{ type: 'package' | 'destination' | 'temple'; data: any }> = [];
      matchedPackages.forEach(p => items.push({ type: 'package', data: p }));
      matchedDestinations.forEach(d => items.push({ type: 'destination', data: d }));
      matchedTemples.forEach(t => items.push({ type: 'temple', data: t }));
      return items;
    } else {
      return destinationSearchOptions.map(d => ({ type: 'destination' as const, data: d }));
    }
  }, [queryLower, matchedPackages, matchedDestinations, matchedTemples, destinationSearchOptions]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (openDropdown !== 'dest') return;
    if (flatDropdownItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatDropdownItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatDropdownItems.length) % flatDropdownItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatDropdownItems[selectedIndex];
      if (item) {
        if (item.type === 'package') {
          setSelectedPackageId(item.data.id);
          setOpenDropdown(null);
        } else if (item.type === 'destination') {
          setActiveSpecificDest(item.data.id);
          setSearchQuery('');
          setOpenDropdown(null);
        } else if (item.type === 'temple') {
          handleTempleClick(item.data);
          setSearchQuery('');
          setOpenDropdown(null);
        }
      }
    }
  };

  const filteredDestinations = useMemo(() => {
    const list = Object.values(destinations || {}) as DestinationMeta[];
    return list.map((d) => {
      const slug = String(d.slug || d.id || '').toLowerCase();
      let name = d.displayName || d.name || '';
      if (
        name.trim().toLowerCase() === 'h' ||
        name.trim().toLowerCase() === 'hp' ||
        slug.includes('himachal') ||
        slug === 'h'
      ) {
        name = 'Himachal Pradesh';
      } else if (
        slug.includes('jammu') ||
        slug.includes('kashmir') ||
        name.trim().toLowerCase() === 'j&k'
      ) {
        name = 'Jammu & Kashmir';
      } else if (slug.includes('ladakh')) {
        name = 'Ladakh';
      }

      // Strictly show only the picture the user uploaded while creating destinations in CMS
      const coverImage = d.heroImage || (d as any).coverImage || '';

      return {
        id: d.id || d.slug,
        type: 'domestic' as const,
        destinationType: d.destinationType || 'regular',
        name,
        subtitle: d.tagline || `${name} Holiday Destinations`,
        badge: (d as any).badge || `${(d as any).packagesCount || 6}+ TOUR PACKAGES`,
        toursCount: (d as any).badge || `${(d as any).packagesCount || 6}+ TOUR PACKAGES`,
        country: d.state || 'India',
        tagline: d.tagline || '',
        highlights: d.keyHighlights || (d.popularCities && d.popularCities.length > 0 ? d.popularCities.slice(0, 3) : ['Verified Stays', 'Private Transfers', 'Sightseeing']),
        keyPills: d.keyHighlights || (d.popularCities && d.popularCities.length > 0 ? d.popularCities.slice(0, 3) : ['Verified Stays', 'Private Transfers', 'Sightseeing']),
        featureTag: d.state || 'Top Destination',
        featureDetail: 'Verified Stays • Private Transfers',
        startingPrice: d.startingPrice || (slug.includes('himachal') ? 14999 : 6499),
        duration: d.guide?.idealDuration?.split('(')[0]?.trim() || '4 - 8 Days',
        coverImage,
        filterKey: d.slug || d.id,
      };
    });
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
  const [submittedWaUrl, setSubmittedWaUrl] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    setOpenDropdown(null);

    setTimeout(() => {
      const categoryParam = selectedTourType !== 'all' ? selectedTourType.toLowerCase() : undefined;

      if (activeSpecificDest.startsWith('temple:')) {
        const rawTempleId = activeSpecificDest.replace('temple:', '');
        const targetTemple = temples.find((t) => t.id === rawTempleId);
        navigateToSearch({
          templeId: rawTempleId,
          templeName: targetTemple ? targetTemple.name : undefined,
          searchQuery: searchQuery,
          category: categoryParam,
          month: selectedMonth !== 'any' ? selectedMonth : undefined,
        });
      } else {
        navigateToSearch({
          destinationSlug: activeSpecificDest,
          searchQuery: searchQuery,
          category: categoryParam,
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
      console.log(`[Holidays Hunt Analytics] Captured interaction for "${locationName}" (${locationId}). Total clicks: ${stats[locationId]}`);
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
      : `${leadPhone.replace(/\D/g, '')}@callback.holidayshunt.com`;

    const cleanWhatsapp = (agencySettings?.whatsapp || '+91 94199 15255').replace(/\D/g, '');

    // Formatted WhatsApp message with lead details
    const waLines = [
      `*New Callback & Tour Inquiry - Holidays Hunt*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Name:* ${leadName.trim()}`,
      `📞 *Phone / WhatsApp:* ${leadPhone.trim()}`,
      cleanEmail && !cleanEmail.includes('@callback.') ? `📧 *Email:* ${cleanEmail}` : null,
      leadYatra.trim() ? `🗺️ *Destination / Tour:* ${leadYatra.trim()}` : null,
      leadNotes.trim() ? `📝 *Requirements / Query:* ${leadNotes.trim()}` : null,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_I filled this callback request on holidayshunt.com. Please connect with me for customized tour planning._`,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(waLines.join('\n'))}`;

    // Record inquiry in system database
    submitInquiry({
      packageId: 'callback-request',
      travelerName: leadName.trim(),
      phone: leadPhone.trim(),
      email: cleanEmail,
      packageTitle: `Holiday & Tour Callback Request${leadYatra.trim() ? `: ${leadYatra.trim()}` : ''}`,
      travelDate: 'Flexible',
      adults: 1,
      children: 0,
      specialRequests: `Customer requested instant callback on WhatsApp / Phone: ${leadPhone.trim()}.${leadYatra.trim() ? ` Yatra / Destination: ${leadYatra.trim()}.` : ''}${leadNotes.trim() ? ` Query / Details: ${leadNotes.trim()}.` : ''}`,
      estimatedTotal: 0,
    });

    setSubmittedWaUrl(waUrl);
    setLeadSubmitted(true);

    // Open WhatsApp directly
    try {
      window.open(waUrl, '_blank') || (window.location.href = waUrl);
    } catch {
      window.location.href = waUrl;
    }
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
                  Where would you like to travel next?
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
                  Curating <b className="text-stone-900 font-extrabold">Family Vacations, Honeymoons &amp; Sacred Tours</b> across Jammu &amp; Kashmir.
                </p>
              </div>

              {/* Verified Holiday Specialist Badge */}
              <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-[#FDF2F2]/95 backdrop-blur-xs border border-[#9b0000]/30 text-xs font-bold shrink-0 self-start md:self-auto shadow-2xs">
                <span className="px-3 py-1.5 rounded-lg bg-[#9b0000] text-white font-black inline-flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  Jammu &amp; Kashmir Tour Experts
                </span>
              </div>
            </div>

            {/* MASTER SEARCH WIDGET (CLEAN, DEDICATED SEARCH) */}
            <div 
              id="search-widget-container" 
              onClick={() => {
                searchQueryInputRef.current?.focus();
                setOpenDropdown('dest');
              }}
              className="relative z-20 bg-white rounded-2xl border-2 border-stone-200/90 shadow-lg p-4 sm:p-5 cursor-pointer"
            >
              <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 relative">
                {/* Column 1: Live Search & Destination Selector */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    searchQueryInputRef.current?.focus();
                    setOpenDropdown('dest');
                  }}
                  className="lg:col-span-4 relative hero-search-dropdown-container cursor-pointer"
                >
                  <div className={`w-full text-left p-2.5 sm:p-3 rounded-xl bg-stone-50 border transition flex flex-col justify-between min-h-[52px] sm:min-h-[56px] ${
                    openDropdown === 'dest'
                      ? 'border-stone-900 ring-2 ring-stone-100 bg-white'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Search Packages, Destinations &amp; Temples
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Search className="w-4 h-4 text-[#9b0000] shrink-0" />
                        <input
                          ref={searchQueryInputRef}
                          type="text"
                          value={searchQuery}
                          onFocus={() => setOpenDropdown('dest')}
                          onKeyDown={handleSearchKeyDown}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setOpenDropdown('dest');
                          }}
                          placeholder={destinationSearchOptions.find((d) => d.id === activeSpecificDest)?.name || 'Search Srinagar, Gulmarg, Vaishno Devi...'}
                          className="w-full text-xs sm:text-sm font-bold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:font-normal truncate cursor-text"
                        />
                      </div>
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery('');
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                            openDropdown === 'dest' ? 'rotate-180 text-stone-900' : ''
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Live Search & Destination Dropdown Popover with Fade Animation */}
                  <AnimatePresence>
                    {openDropdown === 'dest' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute top-full left-0 right-0 sm:min-w-[360px] mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 p-3 space-y-3 max-h-[380px] overflow-y-auto"
                      >
                      {queryLower ? (
                        <div className="space-y-3">
                          {(() => {
                            let itemIndex = 0;
                            return (
                              <>
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                                    Live Search Results for &ldquo;{searchQuery}&rdquo;
                                  </span>
                                  <span className="text-[10px] font-bold text-[#9b0000]">
                                    {matchedPackages.length + matchedDestinations.length + matchedTemples.length} found
                                  </span>
                                </div>

                                {matchedPackages.length === 0 && matchedDestinations.length === 0 && matchedTemples.length === 0 ? (
                                  <div className="py-6 text-center text-stone-500 text-xs">
                                    No matching packages, destinations, or temples found. Try searching for &ldquo;Kashmir&rdquo;, &ldquo;Vaishno Devi&rdquo;, or &ldquo;Doodhpathri&rdquo;.
                                  </div>
                                ) : (
                                  <>
                                    {/* Matching Packages */}
                                    {matchedPackages.length > 0 && (
                                      <div className="space-y-1">
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-1">
                                          Matching Tour Packages ({matchedPackages.length})
                                        </div>
                                        {matchedPackages.map((pkg) => {
                                          const curIndex = itemIndex++;
                                          const isHighlighted = selectedIndex === curIndex;
                                          return (
                                            <button
                                              key={pkg.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPackageId(pkg.id);
                                                setOpenDropdown(null);
                                              }}
                                              className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer group ${
                                                isHighlighted ? 'bg-[#FDF2F2] text-[#9b0000] font-bold border border-[#9b0000]/20' : 'hover:bg-stone-50 text-stone-800'
                                              }`}
                                            >
                                              <div>
                                                <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#9b0000] transition-colors">
                                                  {pkg.title}
                                                </div>
                                                <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                                                  <span>{pkg.destination}</span>
                                                  <span>•</span>
                                                  <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                                                </div>
                                              </div>
                                              <div className="text-right shrink-0">
                                                <div className="text-xs font-black text-stone-900">
                                                  ₹{pkg.price?.toLocaleString('en-IN')}
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Matching Destinations */}
                                    {matchedDestinations.length > 0 && (
                                      <div className="space-y-1 pt-1 border-t border-stone-100">
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-1">
                                          Destinations ({matchedDestinations.length})
                                        </div>
                                        {matchedDestinations.map((dest) => {
                                          const curIndex = itemIndex++;
                                          const isHighlighted = selectedIndex === curIndex;
                                          return (
                                            <button
                                              key={dest.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveSpecificDest(dest.id);
                                                setSearchQuery('');
                                                setOpenDropdown(null);
                                              }}
                                              className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer group ${
                                                isHighlighted ? 'bg-[#FDF2F2] text-[#9b0000] font-bold border border-[#9b0000]/20' : 'hover:bg-stone-50 text-stone-800'
                                              }`}
                                            >
                                              <div>
                                                <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#9b0000] transition-colors">
                                                  {dest.name}
                                                </div>
                                                <div className="text-[10px] text-stone-500">
                                                  {dest.desc}
                                                </div>
                                              </div>
                                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                                                {dest.region}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Matching Temples */}
                                    {matchedTemples.length > 0 && (
                                      <div className="space-y-1 pt-1 border-t border-stone-100">
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-1">
                                          Temples &amp; Shrines ({matchedTemples.length})
                                        </div>
                                        {matchedTemples.map((temple) => {
                                          const curIndex = itemIndex++;
                                          const isHighlighted = selectedIndex === curIndex;
                                          return (
                                            <button
                                              key={temple.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleTempleClick(temple);
                                                setSearchQuery('');
                                                setOpenDropdown(null);
                                              }}
                                              className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer group ${
                                                isHighlighted ? 'bg-[#FDF2F2] text-[#9b0000] font-bold border border-[#9b0000]/20' : 'hover:bg-stone-50 text-stone-800'
                                              }`}
                                            >
                                              <div>
                                                <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#9b0000] transition-colors">
                                                  {temple.name}
                                                </div>
                                                <div className="text-[10px] text-stone-500">
                                                  {temple.city}, {temple.state} {temple.deity ? `• ${temple.deity}` : ''}
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                            Select Destination or Circuit
                          </div>
                          {destinationSearchOptions.map((dest, idx) => {
                            const isHighlighted = selectedIndex === idx;
                            const isSelected = activeSpecificDest === dest.id;
                            return (
                              <button
                                key={dest.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSpecificDest(dest.id);
                                  setSearchQuery('');
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                                  isHighlighted || isSelected
                                    ? 'bg-[#FDF2F2] text-[#9b0000] font-bold border border-[#9b0000]/20'
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
                                {isSelected && <Check className="w-4 h-4 text-[#9b0000] shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Column 2: Tour Type Selector (Pilgrimage, Honeymoon, Family) */}
                <div className="lg:col-span-3 relative hero-search-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'type' ? null : 'type');
                    }}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl bg-stone-50 border transition cursor-pointer flex flex-col justify-between min-h-[52px] sm:min-h-[56px] ${
                      openDropdown === 'type'
                        ? 'border-stone-900 ring-2 ring-stone-100 bg-white'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Tour Type
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-4 h-4 text-[#9b0000] shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                          {selectedTourType === 'all'
                            ? 'All Tour Types'
                            : selectedTourType === 'Pilgrimage'
                            ? 'Pilgrimage'
                            : selectedTourType === 'Honeymoon'
                            ? 'Honeymoon'
                            : selectedTourType === 'Family'
                            ? 'Family'
                            : selectedTourType}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          openDropdown === 'type' ? 'rotate-180 text-stone-900' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Tour Type Dropdown Popover */}
                  {openDropdown === 'type' && (
                    <div className="absolute top-full left-0 right-0 sm:min-w-[240px] mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 p-2 space-y-1">
                      <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                        Select Tour Type
                      </div>
                      {[
                        { id: 'all', label: 'All Tour Types', desc: 'Pilgrimage, Family & Honeymoon' },
                        { id: 'Pilgrimage', label: 'Pilgrimage', desc: 'Sacred Temples, Yatras & Shrines' },
                        { id: 'Honeymoon', label: 'Honeymoon', desc: 'Romantic Scenic Getaways & Resorts' },
                        { id: 'Family', label: 'Family', desc: 'Relaxed Vacations & Sightseeing' },
                      ].map((t) => {
                        const isSelected = selectedTourType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTourType(t.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#FDF2F2] text-[#9b0000] font-bold border border-[#9b0000]/20'
                                : 'hover:bg-stone-50 text-stone-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-bold block">{t.label}</span>
                              <span className="text-[10px] text-stone-500 block truncate font-normal">{t.desc}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#9b0000] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 3: Travel Month / Yatra Season */}
                <div className="lg:col-span-3 relative hero-search-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'month' ? null : 'month');
                    }}
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
                            onClick={(e) => {
                              e.stopPropagation();
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

                {/* Column 4: Search Action Button */}
                <div className="lg:col-span-2 flex items-center">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full h-11 sm:h-12 md:h-full min-h-[44px] md:min-h-[56px] py-2.5 px-4 sm:px-5 rounded-xl bg-[#9b0000] hover:bg-[#7D0000] disabled:bg-[#9b0000]/90 text-white text-xs sm:text-sm font-black transition shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:cursor-wait"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-white shrink-0" />
                        <span>Search Tours</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions: Order via call & Order from WhatsApp */}
            <div className="mt-4 sm:mt-5 max-w-xl mx-auto md:mx-0">
              <QuickOrderContactCards />
            </div>
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
              <div className="w-8 h-8 rounded-full bg-white border border-stone-200 grid place-items-center text-[#9b0000] shrink-0">
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
        <FeaturedDestinationsCarousel
          destinationsList={filteredDestinations}
          onSelectDestination={(dest) => handleSelectLocationCard(dest as any)}
        />

        {/* ========================================================
            FAMILY TOUR PACKAGES (CURATED FAMILY VACATIONS)
            ======================================================== */}
        <CategoryToursCarouselSection
          id="family-tours-section"
          badgeLabel="Memorable Family Holidays"
          badgeIcon={<Users className="w-3.5 h-3.5 text-[#9b0000]" />}
          heading="Family Tours"
          description="Handcrafted leisure holidays with spacious vehicles, child and elder-friendly accommodations, and relaxed sightseeing schedules."
          categoryFilter="Family"
          viewAllCategoryName="Family"
          bgColor="bg-white"
          borderColor="border-stone-200"
          showGarland={false}
        />

        {/* ========================================================
            HONEYMOON TOUR PACKAGES (ROMANTIC GETAWAYS)
            ======================================================== */}
        <CategoryToursCarouselSection
          id="honeymoon-tours-section"
          badgeLabel="Romantic & Couples Getaways"
          badgeIcon={<Heart className="w-3.5 h-3.5 text-[#9b0000]" />}
          heading="Honeymoon Tours"
          description="Private scenic retreats, luxury honeymoon suites, candle-light dinners, and intimate romantic experiences designed just for couples."
          categoryFilter="Honeymoon"
          viewAllCategoryName="Honeymoon"
          bgColor="bg-rose-50/30"
          borderColor="border-rose-100"
          showGarland={false}
        />

        {/* ========================================================
            PILGRIMAGE TOURS (SACRED YATRAS & DARSHANS)
            ======================================================== */}
        <HandpickedYatraPackagesSection />

        {/* Google Verified Reviews Section */}
        <TravelerReviewsSection />

        {/* ========================================================
            WHY HOLIDAYS HUNT? (CAROUSEL)
            ======================================================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-black bg-stone-100 px-3.5 py-1.5 rounded-full border border-black/10 inline-flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>The Holidays Hunt Guarantee</span>
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
                className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-[#9b0000] hover:text-white hover:border-[#9b0000] grid place-items-center transition-all cursor-pointer shadow-xs active:scale-95"
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
                className="w-10 h-10 rounded-full bg-[#9b0000] border border-[#9b0000] text-white hover:bg-[#7D0000] grid place-items-center transition-all cursor-pointer shadow-xs active:scale-95"
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
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="w-[84vw] sm:w-[360px] md:w-[380px] shrink-0 snap-start bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs hover:border-black hover:shadow-md transition-all duration-200 flex flex-col justify-between group active:scale-[0.97] cursor-grab active:cursor-grabbing select-none"
                >
                  <div>
                    {/* Monochrome Icon Badge & Subtitle Pill */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#9b0000]/10 text-[#9b0000] grid place-items-center shrink-0 group-hover:bg-[#9b0000]/20 transition-colors">
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
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            CUSTOM HOLIDAY PLANNER / INSTANT CALLBACK FORM
            ======================================================== */}
        <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1917] via-[#261e1a] to-[#1a1512] rounded-3xl p-6 md:p-8 lg:p-10 text-white shadow-xl border border-[#9b0000]/25 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Brand ambient glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#9b0000]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#9b0000]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-xl">
              <span className="px-3.5 py-1.5 rounded-full bg-[#FDF2F2] text-[#9b0000] border border-[#9b0000]/30 text-[10.5px] font-black uppercase tracking-wider mb-3 inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#9b0000]" />
                <span>Instant Callback Assistance</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Request an Instant Call Back
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                Have questions or need a customized Family, Honeymoon, or Pilgrimage holiday plan? Enter your WhatsApp or phone number. Our travel specialist will call you back within 15 minutes with complete details.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 text-xs font-bold text-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FDF2F2]/15 border border-[#9b0000]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#9b0000]" />
                  </div>
                  <span>Callback Within 15 Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FDF2F2]/15 border border-[#9b0000]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#9b0000]" />
                  </div>
                  <span>Direct Local Chauffeurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FDF2F2]/15 border border-[#9b0000]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#9b0000]" />
                  </div>
                  <span>Zero Agent Commissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FDF2F2]/15 border border-[#9b0000]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#9b0000]" />
                  </div>
                  <span>Instant WhatsApp Itinerary</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-800">
                <span className="text-xs font-bold text-stone-300 block mb-2.5">
                  Or connect instantly with our tour experts:
                </span>
                <QuickOrderContactCards />
              </div>
            </div>

            {/* Quick Callback Box with Brand Colors */}
            <div className="relative w-full md:w-[380px] lg:w-[410px] bg-white rounded-2xl p-5 sm:p-6 text-stone-900 shadow-2xl shrink-0 border-2 border-[#9b0000]/25 overflow-hidden">
              {/* Top brand saffron banner stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9b0000] via-[#C21818] to-[#9b0000]" />

              {leadSubmitted ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 grid place-items-center mx-auto mb-3 shadow-xs">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Callback Request Sent to WhatsApp!</h3>
                  <p className="text-xs text-stone-600 mt-1.5 max-w-sm mx-auto">
                    Your details have been submitted. If WhatsApp did not open automatically, tap below to send your details to our travel expert:
                  </p>

                  {submittedWaUrl && (
                    <a
                      href={submittedWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-white" />
                      <span>Open in WhatsApp</span>
                    </a>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setLeadSubmitted(false);
                        setLeadPhone('');
                        setLeadYatra('');
                        setLeadNotes('');
                        setSubmittedWaUrl('');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Request Another Callback
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomLeadSubmit} className="space-y-3 pt-1">
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF2F2] border border-[#9b0000]/30 text-[#9b0000] flex items-center justify-center shrink-0 shadow-xs">
                        <PhoneCall className="w-4 h-4 text-[#9b0000]" />
                      </div>
                      <div>
                        <b className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                          Request a Call Back
                        </b>
                        <span className="text-[10px] text-stone-500 font-medium">Travel expert connects in 15 mins</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-stone-800 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#9b0000]" />
                      <span>Your Full Name</span>
                      <span className="text-[#9b0000] font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#9b0000] focus:ring-2 focus:ring-[#9b0000]/20 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] font-black uppercase tracking-wider text-stone-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#9b0000]" />
                        <span>WhatsApp / Phone Number</span>
                        <span className="text-[#9b0000] font-bold">*</span>
                      </label>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition select-none ${
                          isValidPhone(leadPhone)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : leadPhone.trim().length > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-[#FDF2F2] text-[#9b0000] border-[#9b0000]/30'
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
                            : 'border-stone-200 focus:border-[#9b0000] focus:ring-2 focus:ring-[#9b0000]/20'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-[#25D366] shrink-0" />
                      <span>Mandatory for callback. We will call or WhatsApp on this number.</span>
                    </p>
                  </div>

                  {/* Destination / Tour of Interest */}
                  <div>
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-stone-800 mb-1 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#9b0000]" />
                      <span>Destination / Tour of Interest</span>
                      <span className="text-stone-400 font-normal normal-case ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={leadYatra}
                      onChange={(e) => setLeadYatra(e.target.value)}
                      placeholder="e.g. Kashmir Family Holiday, Kashmir Honeymoon, Vaishno Devi, Gurez Valley..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#9b0000] focus:ring-2 focus:ring-[#9b0000]/20 transition"
                    />
                  </div>

                  {/* Requirements / Query */}
                  <div>
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-stone-800 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#9b0000]" />
                      <span>Your Query or Requirements</span>
                      <span className="text-stone-400 font-normal normal-case ml-1">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      placeholder="e.g. Number of adults/children, honeymoon inclusions, tentative travel dates..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#9b0000] focus:ring-2 focus:ring-[#9b0000]/20 transition resize-none"
                    />
                  </div>

                  <EmailVerificationInput
                    id="homepage-lead-email"
                    value={leadEmail}
                    onChange={(val) => setLeadEmail(val)}
                    label="Email Address"
                    placeholder="e.g. yourname@gmail.com (Optional)"
                    required={false}
                    helperText="Optional: To receive customized itinerary copy on email."
                    inputClassName="bg-stone-50/80 border-stone-200 py-2 text-xs"
                  />

                  <div>
                    <button
                      type="submit"
                      disabled={!isLeadFormValid}
                      className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] disabled:bg-stone-200 disabled:border-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-xs font-black transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer mt-2 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-white" />
                      <span>Request Instant Callback on WhatsApp</span>
                    </button>
                    {!isValidPhone(leadPhone) ? (
                      <p className="text-[10px] text-center text-[#9b0000] mt-1.5 font-bold">
                        * Enter a valid 10-digit WhatsApp or Phone number to enable callback.
                      </p>
                    ) : (
                      <p className="text-[10px] text-center text-stone-500 mt-1.5 font-medium">
                        ✓ Opens WhatsApp directly • 100% privacy protected
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

import React, { useState, useMemo, useEffect } from 'react';
import { updateDocumentSEO } from '../../utils/seoHelper';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Heart,
  Hotel,
  Info,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Train,
  Users,
  Utensils,
  X,
  Car,
  Filter,
  ArrowRight,
  Tag,
  CheckCircle2,
  Share2,
  Compass as SightseeingIcon,
  Ticket,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { DESTINATIONS_REGISTRY, matchPackageToDestination, DestinationMeta } from '../../data/destinationsData';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { TourPackage } from '../../types/tour';
import { InquiryModal } from './InquiryModal';
import { formatPackagePrice } from '../../utils/priceHelper';
import { FreeTravelInsuranceCard } from './FreeTravelInsuranceCard';
import { Footer } from './Footer';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';

export const DestinationPage: React.FC = () => {
  const {
    selectedDestinationSlug,
    navigateToHome,
    navigateToPackage,
    navigateToTemple,
    packages,
    destinations,
    temples,
    mediaAssets,
    agencySettings,
    toggleWishlist,
    isWishlisted,
    submitInquiry,
  } = useTours();

  const currentSlug = selectedDestinationSlug || 'kashmir';
  const destinationMeta: any =
    destinations?.[currentSlug] ||
    (Object.values(destinations || {}) as DestinationMeta[]).find(d => d.slug === currentSlug || d.id === currentSlug) ||
    DESTINATIONS_REGISTRY[currentSlug] ||
    (Object.values(destinations || {}) as DestinationMeta[])[0] ||
    DESTINATIONS_REGISTRY['kashmir'];

  useEffect(() => {
    if (destinationMeta) {
      const title = destinationMeta.seoMetaTitle || `${destinationMeta.name} Tour Packages & Yatra Guide | Holidays Hunt`;
      const description = destinationMeta.seoMetaDescription || `Book ${destinationMeta.name} tour packages with Holidays Hunt. Verified hotels, private vehicle transfers & 24/7 yatra support.`;
      const keywords = destinationMeta.seoKeywords || `${destinationMeta.name} tour packages, ${destinationMeta.name} yatra, Holidays Hunt`;
      updateDocumentSEO(title, description, keywords);
    }
  }, [destinationMeta]);

  const destinationTemples = useMemo(() => {
    if (!temples) return [];
    return temples.filter((t) => {
      if (t.destinationSlug) {
        const tSlug = t.destinationSlug.toLowerCase();
        const dSlug = currentSlug.toLowerCase();
        const metaId = (destinationMeta?.id || '').toLowerCase();
        if (tSlug === dSlug || tSlug === metaId || dSlug.includes(tSlug) || metaId.includes(tSlug)) return true;
      }
      const stateMatch = typeof t.state === 'string' && destinationMeta?.state && t.state.toLowerCase() === destinationMeta.state.toLowerCase();
      const cityMatch = typeof t.city === 'string' && t.city.trim() !== '' && destinationMeta?.name && (t.city.toLowerCase().includes(destinationMeta.name.toLowerCase()) || destinationMeta.name.toLowerCase().includes(t.city.toLowerCase()));
      return stateMatch || cityMatch;
    });
  }, [temples, currentSlug, destinationMeta]);

  // Active view: Packages or Destination Guide
  const [activeTab, setActiveTab] = useState<'packages' | 'guide'>('packages');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Filters
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');

  // Custom Lead Modal
  const [inquiryPackage, setInquiryPackage] = useState<TourPackage | null>(null);
  const [isCustomLeadOpen, setIsCustomLeadOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadTravelDate, setLeadTravelDate] = useState('');
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Filter packages specifically for this destination
  const destinationPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (pkg.status && pkg.status !== 'published') return false;
      return matchPackageToDestination(pkg, currentSlug);
    });
  }, [packages, currentSlug]);

  // Apply filters and sorting
  const filteredPackages = useMemo(() => {
    let result = destinationPackages.filter((pkg) => {
      if (selectedDuration === 'short' && (pkg.durationDays || 0) > 4) return false;
      if (selectedDuration === 'medium' && ((pkg.durationDays || 0) < 5 || (pkg.durationDays || 0) > 7)) return false;
      if (selectedDuration === 'long' && (pkg.durationDays || 0) < 8) return false;
      return true;
    });

    result.sort((a, b) => {
      const priceA = a.discountedPrice ?? a.price;
      const priceB = b.discountedPrice ?? b.price;
      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    return result;
  }, [destinationPackages, selectedDuration, sortBy]);

  const isJammuKashmirDestination =
    destinationMeta?.name === 'Jammu & Kashmir' || currentSlug === 'jammu-kashmir';

  const destinationTourFaqs = (destinationMeta?.tourPackageFaqs?.length
    ? destinationMeta.tourPackageFaqs
    : (destinationMeta?.tourPackageFaqs || destinationMeta?.guide?.faqs || [])) as { question: string; answer: string }[];

  const defaultJammuKashmirFaqs = [
    {
      question: 'What are the best places to cover in a Jammu and Kashmir tour package?',
      answer: 'Popular Jammu and Kashmir tour packages commonly combine Srinagar, Gulmarg, Pahalgam and Sonamarg, with Jammu, Katra or other places added according to the duration and purpose of the trip.'
    },
    {
      question: 'How many days are enough for a Jammu and Kashmir tour?',
      answer: 'A 5 to 7 day itinerary is a practical choice for covering the main Kashmir highlights at a comfortable pace. Longer trips allow more time for places such as Doodhpathri, Gurez or additional Jammu and pilgrimage stops.'
    },
    {
      question: 'What is the best time to visit Jammu and Kashmir?',
      answer: 'The best time depends on the experience you want. Spring and summer are popular for green valleys and sightseeing, autumn is known for clear landscapes and colours, while winter attracts travellers looking for snow in destinations such as Gulmarg.'
    },
    {
      question: 'Are hotels and private cabs included in Jammu and Kashmir tour packages?',
      answer: 'Package inclusions vary by itinerary. Holidays Hunt can arrange hotel stays, private vehicle transfers, sightseeing and other services according to the selected package and your travel requirements.'
    },
    {
      question: 'Can I customise a Jammu and Kashmir tour package?',
      answer: 'Yes. You can customise the duration, hotels, sightseeing, vehicle category and travel plan around your preferred dates, interests and budget.'
    },
    {
      question: 'Is Jammu and Kashmir suitable for family, honeymoon and pilgrimage trips?',
      answer: 'Yes. Jammu and Kashmir offers options for family holidays, honeymoon trips, leisure tours and pilgrimage journeys, including itineraries that can be planned around Katra and Vaishno Devi.'
    }
  ];

  const activeTourFaqs =
    destinationTourFaqs.length > 0 ? destinationTourFaqs : defaultJammuKashmirFaqs;

  const isLeadFormValid = Boolean(
    leadName.trim() &&
    leadPhone.trim() &&
    isValidEmail(leadEmail)
  );

  const handleCustomLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim() || !isValidEmail(leadEmail)) return;

    submitInquiry({
      packageId: 'custom-pilgrimage',
      travelerName: leadName,
      phone: leadPhone,
      email: leadEmail.trim().toLowerCase(),
      packageTitle: `Custom ${destinationMeta.name} Pilgrimage Inquiry`,
      travelDate: leadTravelDate || 'Flexible',
      adults: 2,
      children: 0,
      specialRequests: `Pilgrimage inquiry for ${destinationMeta.name}. Tentative Travel Date: ${leadTravelDate || 'Flexible'}.`,
      estimatedTotal: destinationMeta.startingPrice * 2,
    });

    setLeadSuccess(true);
    setTimeout(() => {
      setLeadSuccess(false);
      setIsCustomLeadOpen(false);
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      setLeadTravelDate('');
    }, 2000);
  };

  const handleWhatsAppInquiry = (pkgTitle?: string, currentTierLabel?: string, currentPriceVal?: number) => {
    const rawPhone = agencySettings.whatsapp || agencySettings.phone || '+919419915255';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const priceText = currentPriceVal ? ` (Approx ₹${currentPriceVal.toLocaleString('en-IN')}/person)` : '';
    const tierText = currentTierLabel ? ` [${currentTierLabel}]` : '';
    const message = encodeURIComponent(
      `Hello Holidays Hunt! I am interested in booking "${pkgTitle || `${destinationMeta.name} Tour Package`}"${tierText}${priceText}. Please share the detailed itinerary and customized quotation.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* 1. CLEAN TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-2xs">
        {/* 2px Orange Brand Color Line at Top of Header */}
        <div className="h-[2px] w-full bg-[#FF4B00]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={navigateToHome}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <span className="text-sm font-black text-stone-900 tracking-tight">
              {isJammuKashmirDestination ? 'Jammu And Kashmir Tour Packages' : `${destinationMeta.name} Tour Packages`}
            </span>
          </div>

          {/* Quick Contact */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleWhatsAppInquiry()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            <a
              href={`tel:${agencySettings.phone || '+919419915255'}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. CLEARTRIP STYLE CLEAN DESTINATION HEADER */}
      <section className="bg-white border-b border-stone-200 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5 font-medium">
            <button type="button" onClick={navigateToHome} className="hover:text-stone-900 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span>Destinations</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-bold">{destinationMeta.name}</span>
          </div>

          {/* Title & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {destinationMeta.name} Tour Packages
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-900 border border-stone-200">
                  {destinationMeta.state || 'Himalayan Circuit'}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium mb-4">
                {destinationPackages.length} curated itineraries with verified hotels, private cabs & 24/7 support.
              </p>

              {/* Custom Quote Button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomLeadOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Custom Plan
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppInquiry()}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold transition shadow-2xs cursor-pointer border border-stone-200"
                >
                  Get Best Deal
                </button>
              </div>
            </div>

            {/* Destination Picture */}
            {destinationMeta.heroImage && (
              <div className="h-32 sm:h-36 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 relative group shadow-2xs">
                <img
                  src={resolveDisplayImage(destinationMeta.heroImage, mediaAssets)}
                  alt={destinationMeta.name}
                  onError={(e) => handleImageError(e, destinationMeta.heroImage, mediaAssets)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <span className="absolute bottom-2.5 left-3 text-[10px] font-black text-white uppercase tracking-wider">
                  {isJammuKashmirDestination ? 'Jammu and Kashmir' : `${destinationMeta.name} Region`}
                </span>
              </div>
            )}
          </div>

          {(destinationMeta.tourPackagesDescription || isJammuKashmirDestination) && (
            <section className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3.5 sm:px-5 shadow-2xs">
              <h2 className="text-sm sm:text-base font-black text-stone-900 mb-1.5">Jammu and Kashmir Tour Packages</h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                {destinationMeta.tourPackagesDescription ||
                  (isJammuKashmirDestination
                    ? 'Plan your Jammu and Kashmir holiday with thoughtfully designed tour packages covering the region’s most-loved landscapes, from the calm waters of Dal Lake and the gardens of Srinagar to the alpine beauty of Gulmarg, the valleys of Pahalgam and the scenic routes of Sonamarg. Choose a short getaway or a longer itinerary with comfortable hotels, private cab transfers and flexible sightseeing. Holidays Hunt also helps families, couples and pilgrims customise their Jammu and Kashmir tour package around travel dates, preferred stays, sightseeing interests and overall trip pace.'
                    : '')}
              </p>
            </section>
          )}

          {/* Tab Switcher: Packages vs Travel Guide */}
          <div className="flex items-center gap-4 mt-4 border-b border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`pb-2.5 text-xs sm:text-sm font-black transition relative cursor-pointer ${
                activeTab === 'packages' ? 'text-[#FF4B00]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Tour Packages ({destinationPackages.length})
              {activeTab === 'packages' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF4B00]" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`pb-2.5 text-xs sm:text-sm font-black transition relative cursor-pointer whitespace-nowrap ${
                activeTab === 'guide' ? 'text-[#FF4B00]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Travel Guide
              {activeTab === 'guide' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF4B00]" />}
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        {activeTab === 'packages' ? (
          <div>
            {/* Filter & Sort Bar */}
            <div className="bg-white rounded-xl border border-stone-200 p-2.5 sm:p-3 mb-4 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
              {/* Duration Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-stone-500 mr-1">Duration:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'short', label: '3-4 Days' },
                  { id: 'medium', label: '5-7 Days' },
                  { id: 'long', label: '8+ Days' },
                ].map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedDuration(dur.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      selectedDuration === dur.id
                        ? 'bg-[#FF4B00] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort packages by"
                  className="text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 outline-none focus:border-stone-900 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Packages List */}
            {filteredPackages.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center shadow-2xs">
                <Compass className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h3 className="text-base font-black text-stone-900">No packages match the selected duration</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  Try selecting "All" or request a customized itinerary tailored specifically to your dates.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCustomLeadOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold cursor-pointer hover:bg-black transition"
                >
                  Request Custom Itinerary
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPackages.map((pkg) => {
                  const priceResult = formatPackagePrice(
                    pkg.price,
                    pkg.discountedPrice,
                    agencySettings.currencySymbol || '₹',
                    pkg.priceOnRequest
                  );

                  const isHeliPackage = pkg.title.toLowerCase().includes('helicopter') || pkg.slug.includes('helicopter');

                  return (
                    <article
                      key={pkg.id}
                      className="bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row"
                    >
                      {/* ================= 1. LEFT: MEDIA BANNER ================= */}
                      <div
                        className="md:w-64 lg:w-72 h-44 sm:h-48 md:h-auto shrink-0 relative overflow-hidden bg-stone-100 cursor-pointer"
                        onClick={() => navigateToPackage(pkg.id)}
                      >
                        <img
                          src={resolveDisplayImage(pkg.coverImage || (pkg as any).image, mediaAssets)}
                          alt={pkg.title}
                          onError={(e) => handleImageError(e, pkg.coverImage || (pkg as any).image, mediaAssets)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                          <div className="flex items-center gap-1">
                            {isHeliPackage ? (
                              <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                VIP Helicopter
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-stone-900/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                {pkg.badge || pkg.category || 'Featured'}
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(pkg.id);
                            }}
                            className={`w-7 h-7 rounded-full grid place-items-center backdrop-blur-md transition cursor-pointer ${
                              isWishlisted(pkg.id)
                                ? 'bg-stone-900 text-white'
                                : 'bg-white/90 text-stone-700 hover:bg-white'
                            }`}
                            title={isWishlisted(pkg.id) ? 'Remove from Saved' : 'Save to Wishlist'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted(pkg.id) ? 'fill-white text-white' : 'text-stone-700'}`} />
                          </button>
                        </div>

                        {/* Bottom Overlay: Duration & Star Rating */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white pointer-events-none">
                          <div className="flex items-center gap-1 text-[11px] font-black bg-stone-950/75 backdrop-blur-md px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-stone-300" />
                            <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-black bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded-md shadow-2xs">
                            <Star className="w-3 h-3 fill-stone-950 text-stone-950" />
                            <span>{pkg.rating?.toFixed(1) || '4.9'}</span>
                            <span className="text-[9px] font-bold text-stone-800">({pkg.reviewCount || 120})</span>
                          </div>
                        </div>
                      </div>

                      {/* ================= 2. MIDDLE: CLEAN DETAILS & INCLUSIONS ICONS ================= */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                        <div>
                          {/* Breadcrumb indicator */}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>{pkg.destinationTag?.toUpperCase() || destinationMeta.name} • {pkg.category}</span>
                          </div>

                          {/* Tour Title */}
                          <h2
                            onClick={() => navigateToPackage(pkg.id)}
                            className="text-base sm:text-lg font-black text-stone-900 hover:text-stone-600 transition cursor-pointer leading-snug"
                          >
                            {pkg.title}
                          </h2>

                          {/* Tagline */}
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {pkg.tagline || pkg.overview}
                          </p>

                          {/* Clean Icons for Inclusions (No bulky itinerary) */}
                          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center flex-wrap gap-2 text-xs font-bold text-stone-700">
                            <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/70" title="Hotel stay included">
                              <Hotel className="w-3.5 h-3.5 text-stone-900" />
                              <span>Hotel Stay</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/70" title="Private dedicated transport">
                              <Car className="w-3.5 h-3.5 text-stone-900" />
                              <span>Private Cab</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/70" title="Meals included">
                              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Daily Meals</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/70" title="Guided sightseeing">
                              <SightseeingIcon className="w-3.5 h-3.5 text-blue-600" />
                              <span>Sightseeing</span>
                            </div>
                            {isHeliPackage && (
                              <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-stone-900" title="Helicopter tickets included">
                                <Sparkles className="w-3.5 h-3.5 text-stone-900" />
                                <span>Helicopter Tickets</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ================= 3. RIGHT: PRICING & CALL TO ACTIONS ================= */}
                      <div className="md:w-56 lg:w-60 p-4 sm:p-5 bg-stone-50/70 border-t md:border-t-0 md:border-l border-stone-200 flex flex-col justify-between shrink-0">
                        <div>
                          <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">
                            {priceResult.isPriceOnRequest ? 'Quotation' : 'Starting from'}
                          </span>

                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            {priceResult.isPriceOnRequest ? (
                              <span className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                                Price on Request
                              </span>
                            ) : (
                              <>
                                <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                                  {priceResult.displayPrice}
                                </span>
                                {priceResult.originalPrice && (
                                  <span className="text-xs text-stone-400 line-through font-semibold">
                                    {priceResult.originalPrice}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-stone-500 font-medium">
                              {priceResult.isPriceOnRequest ? 'customized plan' : 'per person'}
                            </span>
                            {!priceResult.isPriceOnRequest && priceResult.savingsText && (
                              <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-1 py-0.2 rounded">
                                {priceResult.savingsText}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 text-[10px] text-stone-500 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Taxes & Permits Included</span>
                          </div>

                          {/* Free Travel Insurance Badge below Price */}
                          <div className="mt-2.5">
                            <FreeTravelInsuranceCard variant="compact" />
                          </div>
                        </div>

                        {/* CTA Buttons - 50/50 side by side in one single line */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => navigateToPackage(pkg.id)}
                            className="py-2.5 px-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white border border-[#FF4B00] text-xs font-black transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>View Itinerary</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleWhatsAppInquiry(
                                pkg.title,
                                pkg.category || 'Pilgrimage',
                                priceResult.isPriceOnRequest ? undefined : priceResult.rawPrice
                              )
                            }
                            className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>WhatsApp Quote</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'guide' ? (
          /* 4. CLEAN DESTINATION GUIDE & FAQS */
          <div className="space-y-4">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-2">
                About {destinationMeta.name}
              </h2>
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
                {destinationMeta.guide.overview}
              </p>
            </div>

            {/* Quick Travel Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Best Time</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.bestTimeToVisit}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ideal Duration</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.idealDuration}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Airport</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.nearestAirport}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Train className="w-3.5 h-3.5" />
                  <span>Railway</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.nearestRailway}</p>
              </div>
            </div>

            {/* Sacred Shrines & Temples in Destination */}
            {destinationTemples.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-[#FF4B00]" />
                      <span>Sacred Shrines & Holy Temples in {destinationMeta.name}</span>
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {destinationTemples.length} revered pilgrimage sites & holy shrines in this region
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF4B00] border border-orange-200 text-xs font-bold">
                    <span>Revered Shrines</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destinationTemples.map((temple) => (
                    <div
                      key={temple.id}
                      className="group rounded-2xl border border-stone-200/90 hover:border-orange-300 bg-stone-50/60 hover:bg-white overflow-hidden transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {temple.image && (
                          <div className="aspect-[16/9] relative bg-stone-100 overflow-hidden border-b border-stone-100">
                            <img
                              src={resolveDisplayImage(temple.image, mediaAssets)}
                              alt={temple.name}
                              onError={(e) => handleImageError(e, temple.image, mediaAssets)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="p-3.5 space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                              {temple.city}, {temple.state}
                            </span>
                            <h4 className="text-sm font-black text-stone-900 group-hover:text-[#FF4B00] transition line-clamp-1">
                              {temple.name}
                            </h4>
                          </div>

                          {temple.deity && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Presiding Deity: {temple.deity}</span>
                            </div>
                          )}

                          {temple.tagline && (
                            <p className="text-xs text-stone-600 font-medium leading-relaxed line-clamp-2">
                              {temple.tagline}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <button
                          type="button"
                          onClick={() => navigateToTemple(temple.id)}
                          className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-[#FF4B00] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Explore Packages for this Shrine</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Attractions (Photo-free information-rich cards) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                    Must-Visit Attractions & Shrines in {destinationMeta.name}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {destinationMeta.guide?.topAttractions?.length || 0} key sacred places, viewpoints & heritage landmarks
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF4B00] border border-orange-200 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Key Pilgrimage & Sights</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {destinationMeta.guide?.topAttractions?.map((attraction, idx) => (
                  <div
                    key={idx}
                    className="group rounded-2xl border border-stone-200/90 hover:border-orange-300 bg-stone-50/60 hover:bg-white overflow-hidden transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {attraction.image && (
                        <div className="aspect-[16/10] relative bg-stone-100 overflow-hidden">
                          <img
                            src={resolveDisplayImage(attraction.image, mediaAssets)}
                            alt={attraction.name}
                            onError={(e) => handleImageError(e, attraction.image, mediaAssets)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {attraction.badge && (
                            <span className="absolute top-2.5 left-3 px-2 py-0.5 bg-black/75 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                              {attraction.badge}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-orange-100 text-[#FF4B00] font-black text-[10px] flex items-center justify-center shrink-0 border border-orange-200">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-[#FF4B00] transition">
                            {attraction.name}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-stone-600 font-medium leading-relaxed">
                          {attraction.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4">
                      <div className="pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 text-[10px] text-stone-600 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Included in customized tour plans</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Things To Do & Local Highlights */}
            {destinationMeta.guide?.thingsToDo && destinationMeta.guide.thingsToDo.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
                <h3 className="text-base sm:text-lg font-black text-stone-900 mb-3 tracking-tight">
                  Top Recommended Experiences in {destinationMeta.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {destinationMeta.guide.thingsToDo.map((thing, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                      <span className="w-2 h-2 rounded-full bg-[#FF4B00] mt-1.5 shrink-0" />
                      <span className="text-xs text-stone-700 font-medium leading-relaxed">{thing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Cuisine & Travel Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destinationMeta.guide?.localCuisine && destinationMeta.guide.localCuisine.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                  <h3 className="text-base font-black text-stone-900 mb-3 tracking-tight">
                    Must-Try Prasad & Local Cuisine
                  </h3>
                  <div className="space-y-2.5">
                    {destinationMeta.guide.localCuisine.map((c, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                        <div className="text-xs font-black text-stone-900">{c.dish}</div>
                        <p className="text-[11px] text-stone-600 mt-0.5 font-medium leading-relaxed">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {destinationMeta.guide?.travelTips && destinationMeta.guide.travelTips.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                  <h3 className="text-base font-black text-stone-900 mb-3 tracking-tight">
                    Essential Pilgrim & Travel Tips
                  </h3>
                  <div className="space-y-2.5">
                    {destinationMeta.guide.travelTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                        <p className="text-xs text-stone-700 font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

        {activeTourFaqs.length > 0 && (
          <section className="mt-5 rounded-2xl border border-stone-200 bg-white shadow-2xs overflow-hidden" aria-labelledby="jammu-kashmir-faq-heading">
            <div className="px-4 py-3.5 sm:px-5 border-b border-stone-100">
              <h2 id="jammu-kashmir-faq-heading" className="text-base sm:text-lg font-black text-stone-900">{destinationMeta.name} Tour Packages – FAQs</h2>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5">Quick answers to help you plan your trip.</p>
            </div>
            <div className="divide-y divide-stone-100">
              {activeTourFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-stone-50 transition cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">{faq.question}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 text-[#FF4B00] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 -mt-0.5">
                        <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed pr-7">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: activeTourFaqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: faq.answer
                    }
                  }))
                })
              }}
            />
          </section>
        )}
          </div>
        ) : activeTab === 'guide' ? (
          /* 4. CLEAN DESTINATION GUIDE & FAQS */
          <div className="space-y-4">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-2">
                About {destinationMeta.name}
              </h2>
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
                {destinationMeta.guide.overview}
              </p>
            </div>

            {/* Quick Travel Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Best Time</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.bestTimeToVisit}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ideal Duration</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.idealDuration}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Airport</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.nearestAirport}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 uppercase mb-0.5">
                  <Train className="w-3.5 h-3.5" />
                  <span>Railway</span>
                </div>
                <p className="text-xs font-bold text-stone-900">{destinationMeta.guide.nearestRailway}</p>
              </div>
            </div>

            {/* Sacred Shrines & Temples in Destination */}
            {destinationTemples.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-[#FF4B00]" />
                      <span>Sacred Shrines & Holy Temples in {destinationMeta.name}</span>
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {destinationTemples.length} revered pilgrimage sites & holy shrines in this region
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF4B00] border border-orange-200 text-xs font-bold">
                    <span>Revered Shrines</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destinationTemples.map((temple) => (
                    <div
                      key={temple.id}
                      className="group rounded-2xl border border-stone-200/90 hover:border-orange-300 bg-stone-50/60 hover:bg-white overflow-hidden transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {temple.image && (
                          <div className="aspect-[16/9] relative bg-stone-100 overflow-hidden border-b border-stone-100">
                            <img
                              src={resolveDisplayImage(temple.image, mediaAssets)}
                              alt={temple.name}
                              onError={(e) => handleImageError(e, temple.image, mediaAssets)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="p-3.5 space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                              {temple.city}, {temple.state}
                            </span>
                            <h4 className="text-sm font-black text-stone-900 group-hover:text-[#FF4B00] transition line-clamp-1">
                              {temple.name}
                            </h4>
                          </div>

                          {temple.deity && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Presiding Deity: {temple.deity}</span>
                            </div>
                          )}

                          {temple.tagline && (
                            <p className="text-xs text-stone-600 font-medium leading-relaxed line-clamp-2">
                              {temple.tagline}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <button
                          type="button"
                          onClick={() => navigateToTemple(temple.id)}
                          className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-[#FF4B00] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Explore Packages for this Shrine</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Attractions (Photo-free information-rich cards) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                    Must-Visit Attractions & Shrines in {destinationMeta.name}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {destinationMeta.guide?.topAttractions?.length || 0} key sacred places, viewpoints & heritage landmarks
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF4B00] border border-orange-200 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Key Pilgrimage & Sights</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {destinationMeta.guide?.topAttractions?.map((attraction, idx) => (
                  <div
                    key={idx}
                    className="group rounded-2xl border border-stone-200/90 hover:border-orange-300 bg-stone-50/60 hover:bg-white overflow-hidden transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {attraction.image && (
                        <div className="aspect-[16/10] relative bg-stone-100 overflow-hidden">
                          <img
                            src={resolveDisplayImage(attraction.image, mediaAssets)}
                            alt={attraction.name}
                            onError={(e) => handleImageError(e, attraction.image, mediaAssets)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {attraction.badge && (
                            <span className="absolute top-2.5 left-3 px-2 py-0.5 bg-black/75 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                              {attraction.badge}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-orange-100 text-[#FF4B00] font-black text-[10px] flex items-center justify-center shrink-0 border border-orange-200">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-[#FF4B00] transition">
                            {attraction.name}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-stone-600 font-medium leading-relaxed">
                          {attraction.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4">
                      <div className="pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 text-[10px] text-stone-600 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Included in customized tour plans</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Things To Do & Local Highlights */}
            {destinationMeta.guide?.thingsToDo && destinationMeta.guide.thingsToDo.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs">
                <h3 className="text-base sm:text-lg font-black text-stone-900 mb-3 tracking-tight">
                  Top Recommended Experiences in {destinationMeta.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {destinationMeta.guide.thingsToDo.map((thing, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                      <span className="w-2 h-2 rounded-full bg-[#FF4B00] mt-1.5 shrink-0" />
                      <span className="text-xs text-stone-700 font-medium leading-relaxed">{thing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Cuisine & Travel Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destinationMeta.guide?.localCuisine && destinationMeta.guide.localCuisine.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                  <h3 className="text-base font-black text-stone-900 mb-3 tracking-tight">
                    Must-Try Prasad & Local Cuisine
                  </h3>
                  <div className="space-y-2.5">
                    {destinationMeta.guide.localCuisine.map((c, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                        <div className="text-xs font-black text-stone-900">{c.dish}</div>
                        <p className="text-[11px] text-stone-600 mt-0.5 font-medium leading-relaxed">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {destinationMeta.guide?.travelTips && destinationMeta.guide.travelTips.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                  <h3 className="text-base font-black text-stone-900 mb-3 tracking-tight">
                    Essential Pilgrim & Travel Tips
                  </h3>
                  <div className="space-y-2.5">
                    {destinationMeta.guide.travelTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                        <p className="text-xs text-stone-700 font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}


      </main>

      {/* 5. CUSTOM TRIP INQUIRY MODAL */}
      {isCustomLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsCustomLeadOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {leadSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900">Custom Request Received!</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Our destination specialist will contact you on WhatsApp / Phone within 15 minutes.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF4B00] bg-[#FFF0EB] px-2.5 py-1 rounded-full border border-[#FF4B00]/25 tracking-wider inline-block mb-1.5">
                  Pilgrimage Consultation
                </span>
                <h3 className="text-lg font-black text-stone-900">
                  Custom {destinationMeta.name} Itinerary
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Share your requirements and our yatra specialist will send you a personalized plan.
                </p>

                <form onSubmit={handleCustomLeadSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20"
                    />
                  </div>

                  <EmailVerificationInput
                    id="destination-lead-email"
                    value={leadEmail}
                    onChange={(val) => setLeadEmail(val)}
                    label="Email Address (Verification Step)"
                    placeholder="e.g. yourname@gmail.com"
                    required
                    helperText="Required to enable quote submission and sync quotes to your traveler profile."
                    inputClassName="px-3 py-2.5 rounded-xl border border-stone-200"
                  />

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Tentative Travel Date</label>
                    <input
                      type="date"
                      value={leadTravelDate}
                      onChange={(e) => setLeadTravelDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/20"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={!isLeadFormValid}
                      className="w-full py-3 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-black transition shadow-md shadow-[#FF4B00]/25 mt-2 cursor-pointer"
                    >
                      Request Free Custom Quote
                    </button>
                    {!isValidEmail(leadEmail) && (
                      <p className="text-[10px] text-center text-stone-500 mt-1.5 font-medium">
                        * Enter a correctly formatted email address above to enable the submission button.
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

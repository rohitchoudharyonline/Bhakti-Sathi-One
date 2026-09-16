import React, { useMemo, useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { TourPackage, HotelStarCategory } from '../../types/tour';
import { TourDetailsSection } from './TourDetailsSection';
import { DayWiseItinerary } from './DayWiseItinerary';
import { formatPackagePrice } from '../../utils/priceHelper';
import { getPackageGalleryPhotos } from '../../data/tourReviewsData';
import { TourReviewsAndGalleryModal } from './TourReviewsAndGalleryModal';
import { FreeTravelInsuranceCard } from './FreeTravelInsuranceCard';
import { updatePageSeo } from '../../utils/seo';
import { generateTouristTripSchema, generateBreadcrumbSchema } from '../../utils/seoEngine';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Hotel,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  X,
  Download,
  Phone,
  Car,
  Utensils,
  Sparkles,
  Plane,
  Camera,
  Building,
  Info as InfoIcon,
  HelpCircle,
  Share2,
  Ship,
  Compass,
  FileText,
  Mail,
} from 'lucide-react';
import { generateTourPDF } from '../../utils/pdfGenerator';
import { isValidEmail } from '../../utils/validation';
import { EmailVerificationInput } from '../common/EmailVerificationInput';

interface Props {
  pkg: TourPackage;
  onBack: () => void;
}

export const PremiumPackageDetail: React.FC<Props> = ({ pkg, onBack }) => {
  const { submitInquiry, toggleWishlist, isWishlisted, agencySettings, travelerUser, setTravelerUser } = useTours();

  // Selected Hotel Tier (2-star, 3-star, 4-star, 5-star)
  const [selectedTier, setSelectedTier] = useState<HotelStarCategory>('3-star');

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [bookingStep, setBookingStep] = useState<'details' | 'review' | 'confirmation'>('details');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState(travelerUser?.name || '');
  const [email, setEmail] = useState(travelerUser?.email || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPriceInfoModal, setShowPriceInfoModal] = useState(false);

  // Sync traveler user data if available
  useEffect(() => {
    if (travelerUser?.email && !email) {
      setEmail(travelerUser.email);
    }
    if (travelerUser?.name && !name) {
      setName(travelerUser.name);
    }
  }, [travelerUser]);

  // Sync Google Search Central Structured Data & Review Schema for rich snippet indexing
  useEffect(() => {
    try {
      const tripSchemas = generateTouristTripSchema(pkg, agencySettings);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://holidayshunt.com';
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: origin },
        { name: 'Tours', url: `${origin}/tours` },
        { name: pkg.destination || 'Holiday Package', url: `${origin}/tours/${pkg.destinationTag || 'india'}` },
        { name: pkg.title, url: `${origin}/tours/${pkg.destinationTag || 'india'}/${pkg.slug || pkg.id}` },
      ]);

      const allSchemas = Array.isArray(tripSchemas) ? [...tripSchemas, breadcrumbSchema] : [tripSchemas, breadcrumbSchema];

      updatePageSeo({
        title: `${pkg.title} | Holidays Hunt Sacred Yatra`,
        description: pkg.overview || pkg.tagline || `Book ${pkg.title} (${pkg.durationDays} Days / ${pkg.durationNights} Nights) with verified deluxe hotels and private chauffeur cab transfers.`,
        canonicalPath: `/tours/${pkg.destinationTag || 'india'}/${pkg.slug || pkg.id}`,
        ogImage: pkg.coverImage,
        schemaData: allSchemas,
        type: 'product',
      });
    } catch (err) {
      console.warn('SEO Schema initialization warning:', err);
    }
  }, [pkg, agencySettings]);

  // Reviews and Photo Gallery Modal state
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryModalTab, setGalleryModalTab] = useState<'reviews' | 'gallery'>('reviews');

  // Interactive 4-Photo Gallery (1 Main + 3 Below)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [pkg?.id]);

  const fourPhotos = useMemo(() => {
    const items: { id: string; url: string; caption: string }[] = [];
    if (pkg.coverImage) {
      items.push({ id: 'cover', url: pkg.coverImage, caption: pkg.title || 'Tour Highlight' });
    }
    if (pkg.gallery && pkg.gallery.length > 0) {
      pkg.gallery.forEach((g, idx) => {
        if (!items.some(it => it.url === g.url)) {
          items.push({ id: g.id || `gallery-${idx}`, url: g.url, caption: g.caption || `Tour View ${idx + 1}` });
        }
      });
    }
    const fallbackList = getPackageGalleryPhotos(pkg.destination || '', pkg.gallery, pkg.coverImage);
    fallbackList.forEach((fb, idx) => {
      if (items.length < 4 && !items.some(it => it.url === fb.url)) {
        items.push({ id: fb.id || `fb-${idx}`, url: fb.url, caption: fb.caption || `Scenic View ${idx + 1}` });
      }
    });
    return items.slice(0, 4);
  }, [pkg]);

  const activeMainPhoto = fourPhotos[selectedPhotoIndex] || fourPhotos[0] || { url: pkg.coverImage, caption: pkg.title };
  const thumbnailPhotos = fourPhotos
    .map((photo, index) => ({ photo, index }))
    .filter(({ index }) => index !== selectedPhotoIndex)
    .slice(0, 3);

  const isBasePriceOnRequest = pkg.priceOnRequest || !pkg.price || pkg.price <= 0;
  const basePrice = isBasePriceOnRequest ? 0 : (pkg.discountedPrice ?? pkg.price);

  const currentTierInfo = useMemo(() => {
    if (pkg.pricingTiers) {
      if (selectedTier === '3-star' && pkg.pricingTiers.star3) return pkg.pricingTiers.star3;
      if (selectedTier === '4-star' && pkg.pricingTiers.star4) return pkg.pricingTiers.star4;
      if (selectedTier === '5-star' && pkg.pricingTiers.star5) return pkg.pricingTiers.star5;
    }

    // Default fallbacks
    switch (selectedTier) {
      case '3-star':
        return {
          starRating: 3 as const,
          tierName: 'Deluxe (3-Star)',
          price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.15),
          discountedPrice: isBasePriceOnRequest ? 0 : basePrice,
          priceOnRequest: isBasePriceOnRequest,
          hotelNames: '3-Star Premium Deluxe Hotels & Resorts',
          mealPlan: 'MAP (Breakfast & Dinner)',
          cabType: 'Dedicated AC Sedan / Ertiga SUV',
        };
      case '4-star':
        return {
          starRating: 4 as const,
          tierName: 'Super Deluxe (4-Star)',
          price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.55),
          discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.4),
          priceOnRequest: isBasePriceOnRequest,
          hotelNames: '4-Star Luxury Resorts & Heritage Stays',
          mealPlan: 'MAP (Lavish Buffet Breakfast & Dinner)',
          cabType: 'Toyota Innova Crysta SUV',
        };
      case '5-star':
        return {
          starRating: 5 as const,
          tierName: 'Luxury Heritage (5-Star)',
          price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 2.3),
          discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 2.05),
          priceOnRequest: isBasePriceOnRequest,
          hotelNames: '5-Star Grand Luxury / Palace / Heritage Stays',
          mealPlan: 'AP (All Meals: Breakfast, Lunch, Dinner)',
          cabType: 'Chauffeur Driven Luxury SUV',
        };
      default:
        return {
          starRating: 3 as const,
          tierName: 'Deluxe (3-Star)',
          price: basePrice,
          discountedPrice: basePrice,
          priceOnRequest: isBasePriceOnRequest,
          hotelNames: 'Verified Hotels',
          mealPlan: 'MAP',
          cabType: 'AC Cab',
        };
    }
  }, [selectedTier, pkg.pricingTiers, basePrice, isBasePriceOnRequest]);

  // Compute active price using priceHelper
  const activePriceResult = formatPackagePrice(
    currentTierInfo.price,
    currentTierInfo.discountedPrice,
    pkg.currency || '₹',
    currentTierInfo.priceOnRequest || isBasePriceOnRequest
  );

  const rawPhone = agencySettings.whatsapp || agencySettings.phone || '+919419915255';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const isFormValid = Boolean(
    name.trim() &&
    phone.trim() &&
    isValidEmail(email) &&
    date
  );

  const sendInquiry = () => {
    if (!name.trim() || !phone.trim() || !isValidEmail(email) || !date) return;

    const rateText = activePriceResult.isPriceOnRequest
      ? 'Price on Request (Custom Quote)'
      : `${activePriceResult.displayPrice}/person`;

    const trimmedEmail = email.trim().toLowerCase();

    submitInquiry({
      packageId: pkg.id,
      packageTitle: `${pkg.title} [${currentTierInfo.tierName}]`,
      travelerName: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      travelDate: date,
      adults,
      children,
      specialRequests: `Selected Hotel Tier: ${currentTierInfo.tierName} (${currentTierInfo.starRating}-Star). Rate: ${rateText}. Notes: ${message}`,
      estimatedTotal: activePriceResult.isPriceOnRequest
        ? 0
        : activePriceResult.rawPrice * Math.max(1, adults + children),
    });

    // Auto-authenticate traveler portal session so user can immediately view in profile
    if (!travelerUser || travelerUser.email !== trimmedEmail) {
      setTravelerUser({
        name: name.trim() || 'Valued Traveler',
        email: trimmedEmail,
      });
    }

    setSubmitted(true);

    // Open WhatsApp with complete booking inquiry message
    const confirmMsg = `*New Booking Request* 🛎️\n\n*Package:* ${pkg.title} (${currentTierInfo.tierName})\n*Traveler:* ${name}\n*Email:* ${trimmedEmail}\n*Phone:* ${phone}\n*Travel Date:* ${date}\n*Guests:* ${adults} Adults${children > 0 ? `, ${children} Children` : ''}\n*Rate:* ${rateText}\n*Special Requests:* ${message || 'None'}\n\nPlease check hotel availability and share the confirmed customized itinerary quote!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(confirmMsg)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      await generateTourPDF(pkg, agencySettings);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const whatsappInquiryUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello Holidays Hunt! I am interested in booking *${pkg.title}* with *${currentTierInfo.tierName}* (${activePriceResult.isPriceOnRequest ? 'Price on Request' : `${activePriceResult.displayPrice}/person`}) for ${pkg.durationDays}D/${pkg.durationNights}N. Please confirm hotel details, dates, and pricing.`
  )}`;

  const openReviewsModal = (tab: 'reviews' | 'gallery') => {
    setGalleryModalTab(tab);
    setIsGalleryModalOpen(true);
  };

  const destinationState = pkg.destination.split(',')[0].trim() || 'India';
  const citiesCount = Math.max(2, pkg.itinerary.length > 3 ? Math.min(5, pkg.itinerary.length) : 3);

  const renderInclusionIcon = (iconType: string, className = 'w-5 h-5') => {
    switch (iconType) {
      case 'hotel':
        return <Building className={`${className} text-amber-600`} />;
      case 'meals':
        return <Utensils className={`${className} text-emerald-600`} />;
      case 'cab':
        return <Car className={`${className} text-blue-600`} />;
      case 'flight':
        return <Plane className={`${className} text-sky-600`} />;
      case 'sightseeing':
        return <Camera className={`${className} text-purple-600`} />;
      case 'transport':
        return <Car className={`${className} text-indigo-600`} />;
      case 'houseboat':
        return <Ship className={`${className} text-teal-600`} />;
      case 'shikara':
        return <Compass className={`${className} text-cyan-600`} />;
      case 'guide':
        return <ShieldCheck className={`${className} text-emerald-700`} />;
      case 'activities':
        return <Sparkles className={`${className} text-amber-600`} />;
      case 'permits':
        return <FileText className={`${className} text-stone-700`} />;
      default:
        return <Check className={`${className} text-emerald-600`} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-[#1D1C1C] font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full overflow-x-hidden pb-20 md:pb-6">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-2xs w-full">
        {/* 2px Orange Brand Color Line at Top of Header */}
        <div className="h-[2px] w-full bg-[#FF4B00]" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1D1C1C] transition cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-900 font-black block leading-tight truncate">
                {agencySettings.agencyName || 'Holidays Hunt'} • Verified Tour
              </span>
              <b className="block text-xs sm:text-base font-black text-[#1D1C1C] truncate">{pkg.title}</b>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs sm:text-sm font-bold text-[#1D1C1C] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'PDF...' : 'Brochure'}</span>
            </button>

            <button
              onClick={() => toggleWishlist(pkg.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center gap-1 cursor-pointer ${
                isWishlisted(pkg.id) ? 'border-stone-900 text-stone-900 bg-stone-100' : 'border-stone-200 text-[#1D1C1C] hover:bg-stone-50'
              }`}
            >
              <span>{isWishlisted(pkg.id) ? '♥ Saved' : '♡ Save'}</span>
            </button>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setShowEnquiry(true)}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white font-black text-xs sm:text-sm transition shadow-sm cursor-pointer shrink-0"
            >
              Dates & Availability
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-36 sm:pb-24 w-full min-w-0">
        {/* Breadcrumb Navigation (Matching Screenshot 1) */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 font-medium mb-2.5 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="hover:text-stone-900 cursor-pointer" onClick={onBack}>Home</span>
          <span>&gt;</span>
          <span>India</span>
          <span>&gt;</span>
          <span className="text-stone-700">{destinationState}</span>
          <span>&gt;</span>
          <span className="text-stone-900 font-bold truncate max-w-[200px] sm:max-w-md">{pkg.title}</span>
        </div>

        {/* Tour Title & Badges Bar (Matching Screenshot 1) */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#FC3200] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                {pkg.tourType || 'CUSTOM TOUR'}
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-900 text-white text-[10px] sm:text-[11px] font-mono font-bold">
                {pkg.id.slice(0, 7).toUpperCase()}
              </span>
            </div>
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs hover:scale-105 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </a>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-950 tracking-tight leading-snug">
            {pkg.title}
          </h1>

          {/* Duration & City Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-900 text-xs font-bold border border-stone-200">
              {pkg.durationDays} Days / {pkg.durationNights} Nights
            </span>
            <button
              onClick={() => {
                const itElem = document.getElementById('itinerary');
                if (itElem) itElem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-900 text-xs font-bold border border-stone-200 flex items-center gap-1 cursor-pointer hover:bg-stone-200 transition"
            >
              <span>{citiesCount} Covered Destinations</span>
              <span>&gt;</span>
            </button>
            <button
              onClick={() => openReviewsModal('reviews')}
              className="px-2.5 py-1 rounded-md bg-[#FFF0EB] text-[#FF4B00] text-xs font-bold border border-[#FF4B00]/30 flex items-center gap-1 cursor-pointer hover:bg-[#FFE0D6] transition"
            >
              <Star className="w-3 h-3 fill-[#FF4B00] text-[#FF4B00]" />
              <span>{pkg.rating} ({pkg.reviewCount || 485} reviews)</span>
            </button>
          </div>
        </div>

        {/* 4-Pic Interactive Gallery (1 Main on top, 3 Thumbnails below) */}
        <section className="mb-4">
          {/* Main Large Photo Display */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 aspect-[16/9] sm:aspect-[21/9] max-h-[360px] group shadow-sm border border-stone-200">
            <img
              key={activeMainPhoto.url}
              src={activeMainPhoto.url}
              alt={activeMainPhoto.caption || pkg.title}
              className="w-full h-full object-cover transition-all duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute left-3.5 bottom-3.5 right-3.5 flex items-center justify-between text-white pointer-events-none">
              <span className="text-[11px] sm:text-xs font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white inline-flex items-center gap-1.5 border border-white/15">
                <Sparkles className="w-3 h-3 text-[#FF4B00]" /> {activeMainPhoto.caption || 'Tour Highlight'}
              </span>
              <span className="text-[10px] font-bold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-stone-200 border border-white/10">
                Photo {selectedPhotoIndex + 1} of {fourPhotos.length}
              </span>
            </div>
          </div>

          {/* 3 Thumbnails Grid Below (Clicking any swaps it into the main container) */}
          {thumbnailPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-3 h-20 sm:h-28">
              {thumbnailPhotos.map((item) => (
                <button
                  key={item.photo.id || item.photo.url}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(item.index)}
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 cursor-pointer group border-2 border-stone-200 hover:border-[#FF4B00] transition-all duration-300 focus:outline-hidden p-0 text-left"
                  title={`View ${item.photo.caption || 'Photo'}`}
                >
                  <img
                    src={item.photo.url}
                    alt={item.photo.caption || 'Tour Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                  <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5">
                    <span className="text-[9px] sm:text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      View
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Pricing Card below Gallery (Matching Screenshot 1 & 2) */}
        <section className="mb-4 bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-100">
            <div>
              <div className="text-[10px] sm:text-[11px] text-stone-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <span>{activePriceResult.isPriceOnRequest ? 'Tour Pricing' : 'Package Price per person'}</span>
                <button onClick={() => setShowPriceInfoModal(true)} className="text-stone-400 hover:text-stone-700 cursor-pointer" title="View pricing details">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <div className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
                  {activePriceResult.isPriceOnRequest ? 'Price on Request' : activePriceResult.displayPrice}
                </div>
                {activePriceResult.originalPrice && !activePriceResult.isPriceOnRequest && (
                  <span className="text-xs sm:text-sm text-stone-400 line-through font-medium">
                    {activePriceResult.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] sm:text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Private Tour
              </span>
              <span className="text-[10px] text-stone-500 block mt-1 font-bold">
                {currentTierInfo.tierName}
              </span>
            </div>
          </div>

          {/* Full-width Compact Brand Yellow/Gold CTA Button */}
          <div className="pt-3">
            <button
              onClick={() => setShowEnquiry(true)}
              className="w-full py-3 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white font-black text-xs sm:text-sm tracking-wider transition shadow-xs cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Dates & Availability</span>
            </button>
          </div>

          {/* Two-column side-by-side sleeker action widgets for Download PDF and Free Insurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-100">
            {/* Download PDF Elegant Compact Row */}
            <button 
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-stone-50/50 border border-stone-200 hover:bg-stone-100/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-[11px] font-bold text-stone-900 group-hover:text-red-600 transition-colors truncate">
                    {downloadingPdf ? 'Generating...' : 'Download PDF Brochure'}
                  </span>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-600 transition-colors shrink-0" />
            </button>

            {/* Complimentary Free Travel Insurance Card compact variant */}
            <FreeTravelInsuranceCard variant="compact" className="h-full" />
          </div>
        </section>

        {/* Tour Includes Icons Row (Matching Screenshot 1 & dynamic from CMS) */}
        <section className="mb-4 bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-stone-500 mb-3">
            Tour Includes
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 text-center">
            {pkg.includedIcons && pkg.includedIcons.length > 0 ? (
              pkg.includedIcons.map((inc) => (
                <div
                  key={inc.id || inc.label}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100 min-h-[70px]"
                >
                  {renderInclusionIcon(inc.icon, 'w-5 h-5')}
                  <span className="text-[11px] font-bold text-stone-800 line-clamp-1">{inc.label}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Building className="w-5 h-5 text-amber-600" />
                  <span className="text-[11px] font-bold text-stone-800">Hotel</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-stone-800">Meals</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Car className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-stone-800">Private Cab</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span className="text-[11px] font-bold text-stone-800">Sightseeing</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Car className="w-5 h-5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-stone-800">Transport</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-2.5 text-xs sm:text-sm text-stone-800 font-medium">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span>
              Tour includes the services of <b>Holidays Hunt's Dedicated Chauffeur & 24x7 Trip Manager</b>.
            </span>
          </div>
        </section>

        {/* Content Layout with Itinerary & Sticky Sidebar */}
        <div className="grid lg:grid-cols-[1.6fr_.75fr] gap-4 sm:gap-6 items-start w-full min-w-0">
          {/* Left Column: Itinerary, Inclusions, Hotels */}
          <div className="space-y-4 w-full min-w-0 max-w-full">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs w-full min-w-0 overflow-hidden">
              <h2 className="text-sm sm:text-base font-black text-stone-900 mb-1.5">Tour Highlights & Overview</h2>
              <p className="text-stone-700 leading-relaxed text-sm font-normal break-words">{pkg.overview}</p>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 mt-4 min-w-0 w-full">
                <Info label="Pick-up" value={pkg.startLocation} />
                <Info label="Drop-off" value={pkg.endLocation} />
                <Info label="Category" value={pkg.category || 'Customized Tour'} />
                <Info label="Best Season" value={pkg.bestTimeToVisit || 'All Year Round'} />
              </div>
            </div>

            {/* Day by Day Itinerary Component */}
            <div id="itinerary" className="w-full min-w-0 max-w-full">
              <DayWiseItinerary itinerary={pkg.itinerary} packageTitle={pkg.title} />
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid md:grid-cols-2 gap-3.5 w-full min-w-0">
              <ListSection title="What's Included" items={pkg.inclusions} positive />
              <ListSection title="What's Excluded" items={pkg.exclusions} />
            </div>

            {/* Tour details: Flight Details | Accommodation Details | Reporting & Dropping */}
            <div id="tour-details" className="w-full min-w-0 max-w-full">
              <TourDetailsSection pkg={pkg} />
            </div>
          </div>

          {/* Right Column: Sticky Price & Booking Card on Desktop */}
          <aside className="hidden lg:block lg:sticky lg:top-20 space-y-3">
            <div className="bg-white border border-stone-300 rounded-2xl shadow-xs p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-900 text-[10px] font-black uppercase border border-stone-200">
                  {currentTierInfo.tierName || 'Selected Tier'}
                </span>
                <span className="text-[10px] text-stone-400 font-bold">
                  {activePriceResult.isPriceOnRequest ? 'Quotation' : 'Per Person'}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-2.5">
                {activePriceResult.isPriceOnRequest ? (
                  <b className="text-xl sm:text-2xl text-stone-900 font-black">
                    Price on Request
                  </b>
                ) : (
                  <>
                    <b className="text-2xl sm:text-3xl text-stone-900 font-black tracking-tight">
                      {activePriceResult.displayPrice}
                    </b>
                    {activePriceResult.originalPrice && (
                      <span className="text-xs text-stone-400 line-through">
                        {activePriceResult.originalPrice}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Dynamic Inclusions based on Selected Tier */}
              <div className="border-t border-stone-100 my-3 pt-2.5 space-y-1.5 text-xs">
                <Mini label="Hotel Standard" value={`${currentTierInfo.starRating}★ Verified`} />
                <Mini label="Meal Plan" value={currentTierInfo.mealPlan || 'MAP (Breakfast + Dinner)'} />
                <Mini label="Private Cab" value={currentTierInfo.cabType || 'Dedicated AC Car'} />
                <Mini label="Duration" value={`${pkg.durationDays}D / ${pkg.durationNights}N`} />
                <Mini label="Pick-up" value={pkg.startLocation} />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setShowEnquiry(true)}
                  className="w-full py-3 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white font-black text-xs sm:text-sm shadow-sm transition cursor-pointer"
                >
                  Dates & Availability →
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                  className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-900 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#FF4B00]" />
                  <span>{downloadingPdf ? 'Generating PDF...' : 'Download Itinerary (PDF)'}</span>
                </button>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Instant WhatsApp Quotation</span>
                </a>
              </div>

              <div className="flex items-start gap-1.5 mt-3 pt-2.5 border-t border-stone-100 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero hidden charges. Dedicated 24x7 trip coordinator assigned.</span>
              </div>
            </div>

            {/* Need Customization callout */}
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <b className="text-stone-900 text-xs">Need custom dates or changes?</b>
              <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                Customize number of days, hotel category (3★, 4★, 5★), or add/remove destinations.
              </p>
              <a
                href={`tel:${cleanPhone || agencySettings.phone}`}
                className="text-stone-900 font-bold mt-1.5 inline-flex items-center gap-1 text-[11px]"
              >
                <Phone className="w-3 h-3" />
                <span>Call: {rawPhone || agencySettings.phone}</span>
              </a>
            </div>
          </aside>
        </div>
      </main>

      {/* Pricing Details Modal */}
      {showPriceInfoModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 relative">
            <button
              onClick={() => setShowPriceInfoModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-stone-900 mb-1">Pricing & Inclusions Explained</h3>
            <p className="text-xs text-stone-500 mb-4">Transparent private tour package rates with zero surprises.</p>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <b className="text-stone-900 block mb-0.5">Package Price ({activePriceResult.isPriceOnRequest ? 'Price on Request' : activePriceResult.displayPrice})</b>
                <span>Includes private hotel accommodation, dedicated vehicle with driver, daily breakfast & dinner, and all intercity tolls/permits.</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <b className="text-stone-900 block mb-0.5">100% Private Tour Guarantee</b>
                <span>Dedicated vehicle exclusively for your group with zero sharing, personal pickup/drop, and custom schedule flexibility.</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <b className="block mb-0.5 font-bold">Direct Wholesale Partner Rates</b>
                <span>Direct hotel tie-ups give you maximum value across Standard, Deluxe, Super Deluxe, and Luxury tiers with daily breakfast and dinner included.</span>
              </div>
              <div>
                <FreeTravelInsuranceCard variant="compact" />
              </div>
            </div>

            <button
              onClick={() => {
                setShowPriceInfoModal(false);
                setShowEnquiry(true);
              }}
              className="w-full mt-4 py-2.5 bg-[#FF4B00] hover:bg-[#E04200] text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Check Availability for My Dates
            </button>
          </div>
        </div>
      )}

      {/* Booking / Dates Inquiry Modal */}
      {showEnquiry && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs grid place-items-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto">
            {/* Dynamic Trip Progress Bar */}
            <div className="mb-4 bg-stone-100 p-3 rounded-xl border border-stone-200">
              <div className="text-[10px] uppercase font-black text-stone-600 tracking-wider mb-2 flex items-center justify-between">
                <span>Trip Booking Inquiry</span>
                <span className="text-stone-900 font-bold">
                  {bookingStep === 'details' ? 'Step 1 of 3: Trip Details' : bookingStep === 'review' ? 'Step 2 of 3: Review Request' : 'Step 3 of 3: Confirmed'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2 rounded-lg text-xs transition font-black ${bookingStep === 'details' ? 'bg-[#FF4B00] text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  1. Details
                </div>
                <div className={`p-2 rounded-lg text-xs transition font-black ${bookingStep === 'review' ? 'bg-[#FF4B00] text-white shadow-xs' : bookingStep === 'confirmation' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-white text-stone-400 border border-stone-200'}`}>
                  2. Review
                </div>
                <div className={`p-2 rounded-lg text-xs transition font-black ${bookingStep === 'confirmation' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-stone-400 border border-stone-200'}`}>
                  3. Confirmed
                </div>
              </div>
            </div>

            {bookingStep === 'confirmation' ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Booking Request Received
                </span>
                <h3 className="text-xl font-black text-stone-900">Your Inquiry is Registered!</h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Booking inquiry <b className="text-stone-900 font-mono">#HH-{Math.floor(100000 + Math.random() * 900000)}</b> has been generated for {pkg.title} ({currentTierInfo.tierName}). Our destination expert will verify hotel inventory and connect with you on WhatsApp/Phone with the confirmed customized itinerary.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setShowEnquiry(false);
                      setBookingStep('details');
                      setSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#FF4B00] text-white text-xs font-black hover:bg-[#E04200] transition cursor-pointer"
                  >
                    Done & Return to Tour
                  </button>
                </div>
              </div>
            ) : bookingStep === 'review' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      CONFIRM DETAILS
                    </span>
                    <h3 className="text-sm font-black text-stone-900">Review Booking Request</h3>
                  </div>
                  <button
                    onClick={() => setBookingStep('details')}
                    className="text-xs text-stone-600 font-bold hover:underline cursor-pointer"
                  >
                    ← Edit Details
                  </button>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Package:</span>
                    <span className="font-bold text-stone-900 text-right max-w-[200px] truncate">{pkg.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Hotel Standard:</span>
                    <span className="font-bold text-stone-900">{currentTierInfo.tierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Traveler:</span>
                    <span className="font-bold text-stone-900">{name} ({phone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Email:</span>
                    <span className="font-bold text-stone-900 break-all">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Guests:</span>
                    <span className="text-stone-900">{adults} Adults{children > 0 ? `, ${children} Children` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Travel Date:</span>
                    <span className="text-stone-900">{date}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                    <span className="font-extrabold text-stone-900">Estimated Total:</span>
                    <span className="text-base font-black text-stone-900">
                      {activePriceResult.isPriceOnRequest ? 'Custom Quote on WhatsApp' : `₹${(activePriceResult.rawPrice * Math.max(1, adults + children)).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                {/* Clear No Online Payment Notice */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">No Online Payment Required Now:</span> You do not need to pay anything on this website. Our travel expert will discuss your customized itinerary and dates first. Bank Transfer / UPI details are only shared once you approve your final plan.
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setBookingStep('details')}
                    className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={!isFormValid}
                    onClick={() => {
                      sendInquiry();
                      setBookingStep('confirmation');
                    }}
                    className="w-2/3 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-black shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Send Booking Request →</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4B00] bg-[#FFF0EB] px-2 py-0.5 rounded border border-[#FF4B00]/30">
                      Check Dates & Availability
                    </span>
                    <h3 className="text-base font-black text-stone-900 mt-1">{pkg.title}</h3>
                  </div>
                  <button
                    onClick={() => setShowEnquiry(false)}
                    className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 grid place-items-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 mt-3">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-black block">Selected Hotel Tier</span>
                      <b className="text-stone-900">{currentTierInfo.tierName}</b>
                    </div>
                    <span className="text-xs font-black text-stone-900">
                      {activePriceResult.displayPrice}/person
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Counter label="Adults (12+ yrs)" value={adults} setValue={setAdults} min={1} />
                    <Counter label="Children (2-11 yrs)" value={children} setValue={setChildren} min={0} />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-stone-500 block mb-1">
                      Travel Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-stone-500 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-stone-500 block mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-orange-50/70 border-2 border-orange-200 space-y-2">
                    <EmailVerificationInput
                      id="package-booking-email"
                      value={email}
                      onChange={(val) => setEmail(val)}
                      label="Email Address (Verification Step)"
                      placeholder="e.g. rahul.traveler@gmail.com"
                      required
                      helperText="A correctly formatted email is required to verify your inquiry and enable submission."
                    />
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-600 font-medium leading-tight">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Used as your identifier in <strong>My Bookings & Payments</strong> to view your voucher & record advance deposit receipts.</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-stone-500 block mb-1">
                      Special Requests / Extra Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Optional: Guided darshan assistance, senior citizen support, meal preferences, etc."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div>
                    <button
                      disabled={!isFormValid}
                      onClick={() => setBookingStep('review')}
                      className="w-full py-3 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:bg-stone-300 text-white text-xs sm:text-sm font-black transition shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Proceed to Review Request (Step 2) →</span>
                    </button>
                    {!isValidEmail(email) && (
                      <p className="text-[10px] text-center text-stone-500 mt-1.5 font-medium">
                        * Enter a correctly formatted email address above to enable the submission button.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Sticky Checkout Bar on Mobile / Tablet (Matching Screenshot 1 & 2) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
            <span>Starting price/person</span>
            <button onClick={() => setShowPriceInfoModal(true)}>
              <InfoIcon className="w-3 h-3 text-stone-400" />
            </button>
          </span>
          <div className="text-lg font-black text-stone-950 truncate">
            {activePriceResult.isPriceOnRequest ? 'Price on Request' : activePriceResult.displayPrice}
          </div>
        </div>

        <button
          onClick={() => setShowEnquiry(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white font-black text-xs sm:text-sm shadow-md cursor-pointer transition shrink-0"
        >
          Dates & Availability
        </button>
      </div>

      {/* Reviews and Photo Gallery Modal */}
      <TourReviewsAndGalleryModal
        pkg={pkg}
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        initialTab={galleryModalTab}
      />
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="p-2.5 sm:p-3 rounded-xl bg-stone-50 border border-stone-200/80 min-w-0 overflow-hidden">
    <small className="block text-[10px] sm:text-xs uppercase tracking-wider text-stone-500 font-extrabold truncate">{label}</small>
    <b className="block text-xs sm:text-sm text-[#1D1C1C] mt-0.5 leading-snug break-words" title={value}>{value}</b>
  </div>
);

const Mini = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-xs sm:text-sm">
    <span className="text-stone-500">{label}:</span>
    <b className="text-right text-[#1D1C1C] font-semibold">{value}</b>
  </div>
);

const ListSection = ({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) => (
  <div className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs">
    <h3 className="font-black text-sm sm:text-base text-[#1D1C1C] mb-2">{title}</h3>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 leading-snug">
          <span
            className={`w-4 h-4 rounded-full grid place-items-center shrink-0 mt-0.5 ${
              positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {positive ? <Check className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const Counter = ({
  label,
  value,
  setValue,
  min,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
}) => (
  <div className="border border-stone-300 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
    <span className="text-xs font-bold text-stone-700">{label}</span>
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setValue(Math.max(min, value - 1))}
        className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 grid place-items-center cursor-pointer text-xs"
      >
        <Minus className="w-2.5 h-2.5" />
      </button>
      <b className="text-xs w-4 text-center">{value}</b>
      <button
        type="button"
        onClick={() => setValue(value + 1)}
        className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 grid place-items-center cursor-pointer text-xs"
      >
        <Plus className="w-2.5 h-2.5" />
      </button>
    </span>
  </div>
);

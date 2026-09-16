import React, { useState } from 'react';
import { TourPackage } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { PDFBrochureModal } from './PDFBrochureModal';
import { formatPackagePrice } from '../../utils/priceHelper';
import {
  Clock,
  MapPin,
  Star,
  Hotel,
  ArrowRight,
  FileText,
  Heart,
  MessageCircle,
  Car,
  Utensils,
  CheckCircle2,
  Compass as SightseeingIcon,
  Sparkles,
} from 'lucide-react';

interface PackageCardProps {
  pkg: TourPackage;
  onSelect: (pkgId: string) => void;
  onQuickBook: (pkg: TourPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect, onQuickBook }) => {
  const { agencySettings, toggleWishlist, isWishlisted } = useTours();
  const [showPdfModal, setShowPdfModal] = useState(false);
  const isSaved = isWishlisted(pkg.id);

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Best Seller':
        return 'bg-stone-900 text-white font-black shadow-xs';
      case 'Trending':
        return 'bg-[#FF4B00] text-white font-black shadow-xs';
      case 'Top Rated':
        return 'bg-emerald-600 text-white font-black shadow-xs';
      case 'Heritage Classic':
        return 'bg-purple-700 text-white font-black shadow-xs';
      default:
        return 'bg-stone-900 text-white font-bold';
    }
  };

  const rawBasePrice = pkg.price;
  const rawDiscountPrice = pkg.discountedPrice;
  const isTierPriceOnRequest = pkg.priceOnRequest;

  const priceResult = formatPackagePrice(
    rawBasePrice,
    rawDiscountPrice,
    agencySettings.currencySymbol || '₹',
    isTierPriceOnRequest
  );

  const isHeli = pkg.title.toLowerCase().includes('helicopter') || pkg.slug.includes('helicopter');

  const handleWhatsAppQuickQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rawPhone = agencySettings.whatsapp || agencySettings.phone || '+919419915255';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const priceText = priceResult.isPriceOnRequest
      ? 'Price on Request'
      : `${priceResult.displayPrice}/person`;
    const text = `Hello Holidays Hunt! I am interested in "${pkg.title}" (${pkg.durationDays}D/${pkg.durationNights}N - ${priceText}). Please share quotes and hotel details for my dates.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <article
        id={`package-card-${pkg.id}`}
        className="group bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-lg hover:border-stone-300 transition-all duration-200 flex flex-col overflow-hidden relative font-sans"
      >
        {/* Thumbnail & Badges Container */}
        <div
          className="relative aspect-[16/10] overflow-hidden bg-stone-100 cursor-pointer"
          onClick={() => onSelect(pkg.id)}
        >
          <img
            src={pkg.coverImage}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent pointer-events-none" />

          {/* Top Badges & Wishlist Button */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 pointer-events-none">
              {isHeli ? (
                <span className="text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold bg-stone-900 text-white shadow-2xs">
                  VIP Helicopter
                </span>
              ) : pkg.badge ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold ${getBadgeColor(
                    pkg.badge
                  )}`}
                >
                  {pkg.badge}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white font-bold">
                  {pkg.category}
                </span>
              )}
            </div>

            {/* Wishlist Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(pkg.id);
              }}
              className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-stone-700 hover:text-stone-900 flex items-center justify-center transition shadow-2xs cursor-pointer"
              title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isSaved ? 'fill-stone-900 text-stone-900' : 'text-stone-700'
                }`}
              />
            </button>
          </div>

          {/* Bottom Image Info: Duration & Rating */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
            <span className="flex items-center gap-1 bg-stone-950/75 backdrop-blur-md px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-stone-300" />
              {pkg.durationDays}D / {pkg.durationNights}N
            </span>

            <span className="flex items-center gap-1 bg-[#FF4B00] text-white px-1.5 py-0.5 rounded-md font-black">
              <Star className="w-3 h-3 fill-white text-white" />
              <span>{pkg.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Category / Location Breadcrumb */}
            <div className="flex items-center justify-between gap-2 text-[10px] mb-1 font-bold text-stone-500 uppercase tracking-wider">
              <span className="text-stone-900 font-bold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                {pkg.destinationTag || pkg.destination}
              </span>
              <span className="text-stone-400 font-semibold">{pkg.category}</span>
            </div>

            {/* Title */}
            <h3
              onClick={() => onSelect(pkg.id)}
              className="text-sm sm:text-base font-black text-stone-900 hover:text-stone-600 transition line-clamp-2 cursor-pointer leading-snug mb-1"
            >
              {pkg.title}
            </h3>

            {/* Tagline */}
            <p className="text-xs text-stone-500 line-clamp-2 mb-2.5 leading-relaxed">
              {pkg.tagline || pkg.overview}
            </p>

            {/* Clean Inclusion Icons Row */}
            <div className="flex items-center flex-wrap gap-1.5 mb-2.5 text-[11px] font-bold text-stone-700">
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60" title="Hotel Stays">
                <Hotel className="w-3 h-3 text-stone-900" />
                <span>Hotel</span>
              </div>
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60" title="Dedicated Cab">
                <Car className="w-3 h-3 text-stone-900" />
                <span>Cab</span>
              </div>
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60" title="Meals">
                <Utensils className="w-3 h-3 text-emerald-600" />
                <span>Meals</span>
              </div>
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60" title="Sightseeing">
                <SightseeingIcon className="w-3 h-3 text-blue-600" />
                <span>Sightseeing</span>
              </div>
              {isHeli && (
                <div className="flex items-center gap-1 bg-stone-100 text-stone-900 px-2 py-0.5 rounded-md border border-stone-200" title="VIP Helicopter">
                  <Sparkles className="w-3 h-3 text-stone-900" />
                  <span>Heli</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & CTA Buttons */}
          <div className="pt-2.5 border-t border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  {priceResult.isPriceOnRequest ? 'Quotation' : 'Starting from'}
                </span>
                <div className="flex items-baseline gap-1">
                  {priceResult.isPriceOnRequest ? (
                    <span className="text-sm sm:text-base font-black text-stone-900 leading-tight">
                      Price on Request
                    </span>
                  ) : (
                    <>
                      <span className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                        {priceResult.displayPrice}
                      </span>
                      {priceResult.originalPrice && (
                        <span className="text-[11px] font-bold text-stone-400 line-through">
                          {priceResult.originalPrice}
                        </span>
                      )}
                      <span className="text-[10px] text-stone-500">/ person</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Brochure Download */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPdfModal(true);
                }}
                className="px-2 py-1 rounded-lg text-stone-700 bg-stone-50 hover:bg-stone-100 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 border border-stone-200"
                title="Download PDF Itinerary"
              >
                <FileText className="w-3 h-3 text-stone-900" />
                <span>PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSelect(pkg.id)}
                className="py-2.5 px-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white border border-[#FF4B00] text-[11px] font-black transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Itinerary</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleWhatsAppQuickQuote}
                className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="WhatsApp Inquiry"
              >
                <MessageCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>WhatsApp Quote</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* PDF Brochure Modal */}
      {showPdfModal && (
        <PDFBrochureModal
          pkg={pkg}
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </>
  );
};

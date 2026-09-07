import React, { useState } from 'react';
import { TourPackage, HotelStarCategory, HotelCategoryRate } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { formatPackagePrice } from '../../utils/priceHelper';
import {
  Star,
  Hotel,
  Car,
  Utensils,
  Layers,
  MessageCircle,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface HotelTierPricingSelectorProps {
  pkg: TourPackage;
  selectedTier: HotelStarCategory;
  onSelectTier: (tier: HotelStarCategory) => void;
  className?: string;
}

export const HotelTierPricingSelector: React.FC<HotelTierPricingSelectorProps> = ({
  pkg,
  selectedTier,
  onSelectTier,
  className = '',
}) => {
  const { agencySettings } = useTours();
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [viewMode, setViewMode] = useState<'dropdown' | 'compact'>('dropdown');

  const isBasePriceOnRequest = pkg.priceOnRequest || !pkg.price || pkg.price <= 0;
  const basePrice = isBasePriceOnRequest ? 0 : (pkg.discountedPrice ?? pkg.price);

  // Compute default fallback tier rates if not explicitly in package
  const tiers = pkg.pricingTiers || {
    star2: {
      starRating: 2,
      tierName: 'Standard (2★)',
      price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 0.8),
      discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 0.72),
      priceOnRequest: isBasePriceOnRequest,
      hotelNames: 'Clean Standard Hotels & Guesthouses',
      roomType: 'Standard Room with Geyser & Heated Bedding',
      mealPlan: 'CP (Daily Breakfast)',
      cabType: 'Dedicated AC Hatchback / Sedan',
      keyHighlights: ['Comfortable sanitized stays', 'Hot water facility', 'Dedicated chauffeur'],
    },
    star3: {
      starRating: 3,
      tierName: 'Deluxe (3★)',
      price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.15),
      discountedPrice: isBasePriceOnRequest ? 0 : basePrice,
      priceOnRequest: isBasePriceOnRequest,
      hotelNames: '3-Star Premium Deluxe Hotels & Mountain Resorts',
      roomType: 'Deluxe Valley / Garden View Room',
      mealPlan: 'MAP (Daily Breakfast & Dinner)',
      cabType: 'Dedicated AC Sedan / Ertiga SUV',
      keyHighlights: ['Top-rated 3★ scenic properties', 'Buffet Breakfast & Dinner', 'Central heating / room heaters'],
    },
    star4: {
      starRating: 4,
      tierName: 'Super Deluxe (4★)',
      price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.55),
      discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.4),
      priceOnRequest: isBasePriceOnRequest,
      hotelNames: '4-Star Luxury Resorts & Heritage Properties',
      roomType: 'Super Deluxe Executive Suite with Balcony',
      mealPlan: 'MAP (Lavish Buffet Breakfast & Dinner)',
      cabType: 'Toyota Innova Crysta SUV',
      keyHighlights: ['Luxury 4-star mountain resorts', 'Complimentary high-tea', 'Toyota Innova Crysta cab'],
    },
    star5: {
      starRating: 5,
      tierName: 'Luxury (5★ Heritage)',
      price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 2.3),
      discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 2.05),
      priceOnRequest: isBasePriceOnRequest,
      hotelNames: '5-Star Grand Luxury / Palace / Heritage Stays',
      roomType: 'Royal Suite / Presidential Heritage Room',
      mealPlan: 'AP (All Meals: Breakfast, Lunch, Dinner)',
      cabType: 'Chauffeur Driven Luxury SUV',
      keyHighlights: ['5-Star heritage palaces', 'All meals included', 'VIP priority support & fast-track passes'],
    },
  };

  const tierOptions: {
    key: HotelStarCategory;
    rating: 3 | 4 | 5;
    shortLabel: string;
    fullLabel: string;
    badge?: string;
    data: HotelCategoryRate;
  }[] = [
    {
      key: '3_star',
      rating: 3,
      shortLabel: '3★ Deluxe',
      fullLabel: '3-Star Deluxe',
      badge: 'Popular',
      data: tiers.star3 || {
        starRating: 3,
        tierName: 'Deluxe (3★)',
        price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.15),
        discountedPrice: isBasePriceOnRequest ? 0 : basePrice,
        priceOnRequest: isBasePriceOnRequest,
      },
    },
    {
      key: '4_star',
      rating: 4,
      shortLabel: '4★ Premium',
      fullLabel: '4-Star Super Deluxe',
      badge: 'Recommended',
      data: tiers.star4 || {
        starRating: 4,
        tierName: 'Super Deluxe (4★)',
        price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.55),
        discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 1.4),
        priceOnRequest: isBasePriceOnRequest,
      },
    },
    {
      key: '5_star',
      rating: 5,
      shortLabel: '5★ Luxury',
      fullLabel: '5-Star Luxury Heritage',
      badge: 'Luxury',
      data: tiers.star5 || {
        starRating: 5,
        tierName: 'Luxury (5★)',
        price: isBasePriceOnRequest ? 0 : Math.round(basePrice * 2.3),
        discountedPrice: isBasePriceOnRequest ? 0 : Math.round(basePrice * 2.05),
        priceOnRequest: isBasePriceOnRequest,
      },
    },
  ];

  const activeOption = tierOptions.find((t) => t.key === selectedTier) || tierOptions[1];
  const activePriceInfo = formatPackagePrice(
    activeOption.data.price,
    activeOption.data.discountedPrice,
    pkg.currency || '₹',
    activeOption.data.priceOnRequest || isBasePriceOnRequest
  );

  const rawPhone = agencySettings.whatsappConciergeNumber || agencySettings.primaryPhone || '+919419915255';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const handleWhatsAppTierQuote = (tierName: string) => {
    const priceStr = activePriceInfo.isPriceOnRequest
      ? 'Price on Request'
      : `${activePriceInfo.displayPrice}/person`;
    const message = encodeURIComponent(
      `Hello Bhakti Sathi! I am interested in booking "${pkg.title}" with *${tierName}* category (${priceStr}). Please share hotel details and quote for my dates.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className={`bg-white rounded-xl border border-stone-200/90 p-2.5 sm:p-3 shadow-2xs w-full max-w-full min-w-0 overflow-hidden ${className}`}>
      {/* Header & Controls Bar: Compact Single Line */}
      <div className="flex items-center justify-between gap-2 mb-2 min-w-0 w-full">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="p-1 rounded bg-stone-100 text-stone-900 border border-stone-200 shrink-0">
            <Hotel className="w-3.5 h-3.5" />
          </span>
          <div className="truncate min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 leading-tight truncate">
              Hotel Category & Pricing
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle view mode pills vs dropdown */}
          <div className="hidden sm:flex items-center bg-stone-100 rounded-lg p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('dropdown')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                viewMode === 'dropdown' ? 'bg-white text-stone-900 shadow-2xs font-extrabold' : 'text-stone-500'
              }`}
            >
              Dropdown
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                viewMode === 'compact' ? 'bg-white text-stone-900 shadow-2xs font-extrabold' : 'text-stone-500'
              }`}
            >
              Buttons
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowComparisonModal(true)}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-stone-900 hover:text-black bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2 py-0.5 sm:py-1 rounded-lg transition cursor-pointer shrink-0"
          >
            <Layers className="w-3 h-3" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Main Selection Area: Either Dropdown or Compact Row */}
      {viewMode === 'dropdown' ? (
        /* Sleek Dropdown Select (Takes almost zero vertical room on mobile) */
        <div className="relative w-full min-w-0">
          <select
            id="hotel-category-dropdown"
            value={selectedTier}
            onChange={(e) => onSelectTier(e.target.value as HotelStarCategory)}
            aria-label="Select Hotel Category"
            className="w-full appearance-none bg-stone-50 hover:bg-white focus:bg-white text-stone-900 font-bold text-xs sm:text-sm pl-3 pr-9 py-2 rounded-xl border border-stone-300 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/20 transition cursor-pointer shadow-2xs"
          >
            {tierOptions.map(({ key, rating, fullLabel, badge, data }) => {
              const tierPriceInfo = formatPackagePrice(
                data.price,
                data.discountedPrice,
                pkg.currency || '₹',
                data.priceOnRequest || isBasePriceOnRequest
              );
              const priceText = tierPriceInfo.isPriceOnRequest
                ? 'Price on Request'
                : `${tierPriceInfo.displayPrice}/person`;
              const badgeText = badge ? ` [${badge}]` : '';

              return (
                <option key={key} value={key} className="py-1">
                  {'★'.repeat(rating)} {fullLabel} — {priceText}{badgeText}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      ) : (
        /* Ultra Compact 4-Pill Segmented Row */
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full min-w-0">
          {tierOptions.map(({ key, rating, shortLabel, data }) => {
            const isSelected = selectedTier === key;
            const tierPriceInfo = formatPackagePrice(
              data.price,
              data.discountedPrice,
              pkg.currency || '₹',
              data.priceOnRequest || isBasePriceOnRequest
            );

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectTier(key)}
                className={`rounded-lg p-1.5 text-center transition-all cursor-pointer border flex flex-col justify-center items-center ${
                  isSelected
                    ? 'border-stone-900 bg-stone-100 ring-1 ring-stone-900/40'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-amber-500">★</span>
                  <span
                    className={`text-[10px] font-black ${
                      isSelected ? 'text-stone-900' : 'text-stone-800'
                    }`}
                  >
                    {rating}★
                  </span>
                </div>
                <div className="text-[9px] font-medium text-stone-600 truncate max-w-full">
                  {shortLabel.replace(`${rating}★ `, '')}
                </div>
                <div className="text-[10px] font-bold text-stone-900 mt-0.5 truncate">
                  {tierPriceInfo.isPriceOnRequest ? 'Req' : tierPriceInfo.displayPrice}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Tier Live Inclusions Strip (Compact 1-Line Strip) */}
      <div className="mt-2 p-2 rounded-lg bg-stone-50/90 border border-stone-200/80 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-[11px] min-w-0 w-full">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-stone-700 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 font-bold text-stone-900 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
            {activePriceInfo.isPriceOnRequest ? (
              <span className="text-stone-900 font-black">Price on Request</span>
            ) : (
              <span className="text-stone-900 font-black">{activePriceInfo.displayPrice} <span className="text-[10px] text-stone-500 font-normal">/person</span></span>
            )}
          </span>

          <span className="inline-flex items-center gap-1 text-stone-600 truncate max-w-[160px] sm:max-w-none">
            <Hotel className="w-3 h-3 text-stone-900 shrink-0" />
            <span className="truncate">{activeOption.data.roomType || `${activeOption.rating}★ Verified Stay`}</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-stone-600">
            <Utensils className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{activeOption.data.mealPlan || 'MAP (Breakfast + Dinner)'}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleWhatsAppTierQuote(activeOption.fullLabel)}
          className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs self-start xs:self-auto"
        >
          <MessageCircle className="w-2.5 h-2.5" />
          <span>Ask {activeOption.rating}★ Quote</span>
        </button>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-900 font-black block">
                  TRANSPARENT TIER COMPARISON
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Compare 3★, 4★ & 5★ Hotel Categories
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComparisonModal(false)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="p-2 font-black text-stone-900">Features</th>
                    {tierOptions.map((t) => {
                      const pInfo = formatPackagePrice(
                        t.data.price,
                        t.data.discountedPrice,
                        pkg.currency || '₹',
                        t.data.priceOnRequest || isBasePriceOnRequest
                      );
                      return (
                        <th
                          key={t.key}
                          className={`p-2 font-black min-w-[110px] ${
                            selectedTier === t.key ? 'bg-stone-100 text-stone-900' : 'text-stone-800'
                          }`}
                        >
                          <div>{t.shortLabel}</div>
                          <div className="text-xs font-black mt-0.5">
                            {pInfo.isPriceOnRequest ? 'On Request' : pInfo.displayPrice}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y border-stone-200 text-stone-700">
                  <tr>
                    <td className="p-2 font-bold bg-stone-50/50">Hotel Standard</td>
                    {tierOptions.map((t) => (
                      <td key={t.key} className="p-2">
                        <b>{t.rating}★ Verified</b>
                        <div className="text-[10px] text-stone-500 mt-0.5 truncate max-w-[140px]">{t.data.hotelNames || 'Selected stays'}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-stone-50/50">Room Category</td>
                    {tierOptions.map((t) => (
                      <td key={t.key} className="p-2 text-[11px]">
                        {t.data.roomType || 'Standard Room'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-stone-50/50">Meals Included</td>
                    {tierOptions.map((t) => (
                      <td key={t.key} className="p-2 text-[11px]">
                        {t.data.mealPlan || (t.rating >= 3 ? 'Breakfast & Dinner' : 'Breakfast')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-stone-50/50">Transport Cab</td>
                    {tierOptions.map((t) => (
                      <td key={t.key} className="p-2 text-[11px]">
                        {t.data.cabType || (t.rating >= 4 ? 'Innova Crysta' : 'AC Sedan')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-stone-50/50">Select Tier</td>
                    {tierOptions.map((t) => (
                      <td key={t.key} className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTier(t.key);
                            setShowComparisonModal(false);
                          }}
                          className={`w-full py-1 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedTier === t.key
                              ? 'bg-stone-900 text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                          }`}
                        >
                          {selectedTier === t.key ? 'Selected' : 'Choose'}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { TourPackage } from '../../types/tour';
import {
  Hotel,
  MapPin,
  Calendar,
  ShieldCheck,
  Car,
  Clock,
  Star,
} from 'lucide-react';

interface TourDetailsSectionProps {
  pkg: TourPackage;
  selectedTier?: 'star3' | 'star4' | 'star5';
  onSelectTier?: (tier: 'star3' | 'star4' | 'star5') => void;
  className?: string;
}

// Smart clean city extractor
const extractCleanCity = (location: string, pkgDest: string): string => {
  if (!location) return pkgDest.split('(')[0].trim() || 'Destination';

  const knownCities = [
    'Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Doodhpathri', 'Yusmarg', 'Leh', 'Nubra', 'Pangong',
    'Jaipur', 'Pushkar', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Bikaner', 'Mount Abu', 'Ranthambore',
    'Manali', 'Shimla', 'Dharamshala', 'Dalhousie', 'Kasol', 'Kullu', 'Spiti', 'Jibhi',
    'Munnar', 'Alleppey', 'Thekkady', 'Kochi', 'Wayanad', 'Kovalam', 'Varkala',
    'Agra', 'Delhi', 'Varanasi', 'Rishikesh', 'Haridwar', 'Nainital', 'Mussoorie', 'Corbett',
    'Port Blair', 'Havelock', 'Neil Island', 'Gangtok', 'Darjeeling', 'Pelling', 'Lachung',
    'Goa', 'Ooty', 'Kodaikanal', 'Coorg', 'Mysore', 'Hampi', 'Chikmagalur'
  ];

  for (const city of knownCities) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(location)) {
      return city;
    }
  }

  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts[parts.length - 1].replace(/\(.*?\)/g, '').trim();
  }

  if (location.includes('/')) {
    const slashParts = location.split('/').map((s) => s.trim());
    return slashParts[slashParts.length - 1];
  }

  return location.replace(/\(.*?\)/g, '').trim() || pkgDest.split('(')[0].trim();
};

export const TourDetailsSection: React.FC<TourDetailsSectionProps> = ({
  pkg,
  selectedTier: controlledTier,
  onSelectTier,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'accommodation' | 'reporting'>('accommodation');
  const [internalTier, setInternalTier] = useState<'star3' | 'star4' | 'star5'>('star3');

  const currentTier = controlledTier || internalTier;
  const handleTierChange = (tier: 'star3' | 'star4' | 'star5') => {
    if (onSelectTier) {
      onSelectTier(tier);
    }
    setInternalTier(tier);
  };

  // Build accommodation rows from pkg.hotels or itinerary
  const accommodationList = React.useMemo(() => {
    if (pkg.hotels && pkg.hotels.length > 0) {
      return pkg.hotels.map((h, idx) => {
        const cityPart = extractCleanCity(h.location, pkg.destination);
        return {
          id: h.id || `acc-${idx}`,
          city: `${cityPart} - ${pkg.country || 'India'}`,
          hotelName: h.name.includes('/or similar') || h.name.includes('/ similar') ? h.name : `${h.name} /or similar`,
          starRating: h.starRating || 3,
          nights: h.nights || 1,
          roomType: h.roomType || 'Deluxe Room',
          amenities: h.amenities || [],
          locationDetail: h.location,
        };
      });
    }

    // Fallback if hotels array is empty: extract unique stayHotels from itinerary
    const staysFromItinerary: Array<{
      id: string;
      city: string;
      hotelName: string;
      starRating: number;
      nights: number;
      roomType: string;
      amenities: string[];
      locationDetail: string;
    }> = [];

    let currentStayName = '';
    let currentCount = 0;
    let currentLocation = '';

    pkg.itinerary.forEach((day) => {
      const stay = day.stayHotel || 'Selected Category Hotel';
      if (stay.toLowerCase().includes('departure') || stay.toLowerCase().includes('no hotel')) {
        return;
      }

      if (stay === currentStayName) {
        currentCount++;
      } else {
        if (currentStayName) {
          const cityClean = extractCleanCity(currentLocation, pkg.destination);
          staysFromItinerary.push({
            id: `itin-acc-${staysFromItinerary.length}`,
            city: `${cityClean} - ${pkg.country || 'India'}`,
            hotelName: `${currentStayName} /or similar`,
            starRating: 3,
            nights: currentCount,
            roomType: 'Deluxe Category Stay',
            amenities: ['Breakfast & Dinner', 'Free Wi-Fi', 'Hot Water'],
            locationDetail: currentLocation,
          });
        }
        currentStayName = stay;
        currentLocation = day.location || pkg.destination;
        currentCount = 1;
      }
    });

    if (currentStayName) {
      const cityClean = extractCleanCity(currentLocation, pkg.destination);
      staysFromItinerary.push({
        id: `itin-acc-${staysFromItinerary.length}`,
        city: `${cityClean} - ${pkg.country || 'India'}`,
        hotelName: `${currentStayName} /or similar`,
        starRating: 3,
        nights: currentCount,
        roomType: 'Deluxe Category Stay',
        amenities: ['Breakfast & Dinner', 'Free Wi-Fi', 'Hot Water'],
        locationDetail: currentLocation,
      });
    }

    if (staysFromItinerary.length > 0) {
      return staysFromItinerary;
    }

    return [
      {
        id: 'def-1',
        city: `${pkg.destination.split('(')[0].trim() || 'Destination'} - ${pkg.country || 'India'}`,
        hotelName: 'Selected Verified Hotel / Resort /or similar',
        starRating: 3,
        nights: pkg.durationNights || 4,
        roomType: 'Deluxe Room with Breakfast & Dinner',
        amenities: ['Free Wi-Fi', 'Geyser / 24/7 Hot Water'],
        locationDetail: pkg.destination,
      },
    ];
  }, [pkg]);

  // Selected tier data if available
  const tierInfo = pkg.pricingTiers ? pkg.pricingTiers[currentTier] : null;

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden w-full max-w-full min-w-0 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100">
        <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
          Tour details
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-normal mt-0.5">
          Best facilities with no added cost.
        </p>
      </div>

      {/* 2 Main Tabs: Accommodation Details | Reporting & Dropping (Using Brand Primary Color #FF4B00) */}
      <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50 p-1.5 sm:p-2 gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('accommodation')}
          className={`py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeTab === 'accommodation'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Hotel className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
          <span className="truncate">Accommodation Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reporting')}
          className={`py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeTab === 'reporting'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Car className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
          <span className="truncate">Reporting & Dropping</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5">
        {/* ============================================================ */}
        {/* TAB 1: ACCOMMODATION DETAILS */}
        {/* ============================================================ */}
        {activeTab === 'accommodation' && (
          <div className="space-y-4">
            {/* If pricing tiers exist, show category selector banner (3★ Deluxe, 4★ Super Deluxe, 5★ Luxury) */}
            {pkg.pricingTiers && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-black text-stone-500 tracking-wider block">
                    SELECT HOTEL CATEGORY TO PREVIEW STAYS
                  </span>
                  <p className="text-xs sm:text-sm text-stone-900 font-bold mt-0.5">
                    {tierInfo?.tierName || `${currentTier === 'star3' ? '3-Star Deluxe' : currentTier === 'star4' ? '4-Star Super Deluxe' : '5-Star Luxury'}`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {(['star3', 'star4', 'star5'] as const).map((tierKey) => {
                    const t = pkg.pricingTiers ? pkg.pricingTiers[tierKey] : null;
                    const starNum = tierKey === 'star3' ? 3 : tierKey === 'star4' ? 4 : 5;
                    const defaultName = starNum === 3 ? '3★ Deluxe' : starNum === 4 ? '4★ Super Deluxe' : '5★ Luxury';
                    const displayName = t?.tierName ? `${t.starRating}★ ${t.tierName.replace(/^\d-Star\s*/i, '')}` : defaultName;
                    const isSelected = currentTier === tierKey;

                    return (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => handleTierChange(tierKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#FF4B00] text-white shadow-xs'
                            : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${isSelected ? 'fill-white text-white' : 'text-amber-500 fill-amber-500'}`} />
                        <span>{displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Table Layout with Proper 2-Column Inline Alignment matching Reference */}
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
              {/* Table Header with explicit 2-column alignment on all screens */}
              <div className="grid grid-cols-[1.1fr_1.9fr] sm:grid-cols-[1.2fr_2fr] bg-stone-100/90 border-b border-stone-200 text-[11px] sm:text-xs font-black text-stone-800 uppercase tracking-wider p-3 gap-2 sm:gap-4">
                <div>City - Country</div>
                <div>Hotel & Stay Details</div>
              </div>

              {/* Table Rows with side-by-side columns */}
              <div className="divide-y divide-stone-200/80 bg-white">
                {accommodationList.map((acc, index) => {
                  const isEven = index % 2 === 0;
                  let displayHotelName = acc.hotelName;
                  if (tierInfo?.hotelNames) {
                    const tierHotels = tierInfo.hotelNames.split('/');
                    if (tierHotels[index]) {
                      displayHotelName = `${tierHotels[index].trim()} /or similar`;
                    }
                  }

                  return (
                    <div
                      key={acc.id}
                      className={`grid grid-cols-[1.1fr_1.9fr] sm:grid-cols-[1.2fr_2fr] p-3 sm:p-4 gap-2 sm:gap-4 items-start ${
                        isEven ? 'bg-white' : 'bg-stone-50/50'
                      }`}
                    >
                      {/* Left Column: City - Country */}
                      <div className="pr-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-800 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <b className="text-xs sm:text-sm font-black text-stone-900 leading-snug block break-words">
                              {acc.city}
                            </b>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Hotel Name, Stay Duration & Room Type */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-stone-900 leading-snug break-words">
                          {displayHotelName}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-600 font-medium">
                          <span className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md text-stone-800 font-bold">
                            <Calendar className="w-3 h-3 text-stone-800" />
                            <span>{acc.nights} {acc.nights === 1 ? 'Night' : 'Nights'} Stay</span>
                          </span>

                          <span className="text-stone-500 font-medium">
                            • {tierInfo?.roomType || acc.roomType}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note Section */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 text-xs text-stone-700 space-y-1.5">
              <b className="text-xs font-black text-stone-900 uppercase tracking-wider block">
                Note:
              </b>
              <ul className="space-y-1 text-stone-600 list-disc list-outside pl-4 leading-relaxed font-normal">
                <li>
                  These are the tentative accommodation details for guests booking this holiday package.
                </li>
                <li>
                  Hotel details are tentative only. The hotel or place of accommodation may change to an equivalent or upgraded category based on season and room inventory.
                </li>
                <li>
                  Check-in time is generally <strong>12:00 PM / 2:00 PM</strong> and check-out time is <strong>10:00 AM / 11:00 AM</strong>. Early check-in or late check-out is subject to room availability at hotel discretion.
                </li>
                <li>
                  All hotels are pre-screened for cleanliness, safety, heated rooms/geysers, and authentic hospitality.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: REPORTING & DROPPING */}
        {/* ============================================================ */}
        {activeTab === 'reporting' && (
          <div className="space-y-4">
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-stone-100/90 border-b border-stone-200 p-3 text-xs font-black text-stone-800 uppercase tracking-wider">
                Meeting Point, Chauffeur & Vehicle Handover
              </div>

              <div className="p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 mb-1">
                      <Clock className="w-3.5 h-3.5 text-stone-900" />
                      <span>Tour Start / Reporting</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      Day 01 at <strong>{pkg.startLocation}</strong>. Your dedicated chauffeur will track your arrival in real time.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-900" />
                      <span>Tour Conclusion / Dropping</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      Day {pkg.durationDays} at <strong>{pkg.endLocation}</strong>. Convenient drop at departure gates with luggage assistance.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-stone-900 shrink-0 mt-0.5" />
                  <div>
                    <b className="font-bold text-stone-900 block">100% Dedicated Chauffeur Vehicle</b>
                    <p className="text-stone-600 mt-0.5">
                      This is a <strong>Private Tour</strong> with an exclusive dedicated vehicle (Sedan / Innova Crysta / SUV) solely for your family or group. No sharing with other tourists.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 text-xs text-stone-700 space-y-1.5">
              <b className="text-xs font-black text-stone-900 uppercase tracking-wider block">
                Note:
              </b>
              <ul className="space-y-1 text-stone-600 list-disc list-outside pl-4 leading-relaxed font-normal">
                <li>
                  Driver and vehicle contact details with vehicle registration number will be dispatched via WhatsApp and SMS 24 hours prior to travel date.
                </li>
                <li>
                  A 24x7 dedicated Bhakti Sathi Operations Manager will remain on standby to assist with any itinerary coordination.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

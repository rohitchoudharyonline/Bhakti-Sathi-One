import React, { useState, useMemo } from 'react';
import { TourPackage } from '../../types/tour';
import {
  Hotel,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Car,
  Clock,
  Check,
} from 'lucide-react';

interface TourDetailsSectionProps {
  pkg: TourPackage;
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
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'reporting'>('hotels');

  // Build clean accommodation list from pkg.hotels or itinerary fallback
  const accommodationList = useMemo(() => {
    if (pkg.hotels && pkg.hotels.length > 0) {
      return pkg.hotels.map((h, idx) => {
        const cityPart = (h.location && h.location.trim()) || (h.city && h.city.trim()) || extractCleanCity(h.location || '', pkg.destination);
        const countryPart = h.country || pkg.country || 'India';
        const hotelNameStr =
          h.name.includes('/or similar') || h.name.includes('/ similar')
            ? h.name
            : `${h.name} /or similar`;

        return {
          id: h.id || `acc-${idx}`,
          city: cityPart,
          country: countryPart,
          hotelName: hotelNameStr,
          alternativeHotel: h.alternativeHotel,
          nights: h.nights || 1,
          roomType: h.roomType || 'Deluxe Room',
          mealPlan: h.mealPlan || 'As per package inclusion',
          checkInDate: h.checkInDate,
          checkOutDate: h.checkOutDate,
          houseboatDetails: h.houseboatDetails,
          amenities: h.amenities || [],
        };
      });
    }

    // Fallback if pkg.hotels is empty: Extract stays from itinerary
    const staysFromItinerary: Array<{
      id: string;
      city: string;
      country: string;
      hotelName: string;
      alternativeHotel?: string;
      nights: number;
      roomType: string;
      mealPlan: string;
      checkInDate?: string;
      checkOutDate?: string;
      houseboatDetails?: string;
      amenities: string[];
    }> = [];

    let currentStayName = '';
    let currentCount = 0;
    let currentLocation = '';

    if (pkg.itinerary && pkg.itinerary.length > 0) {
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
              city: cityClean,
              country: pkg.country || 'India',
              hotelName: `${currentStayName} /or similar`,
              nights: currentCount,
              roomType: 'Deluxe Room',
              mealPlan: 'As per package inclusion',
              amenities: ['Breakfast & Dinner', 'Free Wi-Fi', 'Hot Water', 'Clean Linen'],
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
          city: cityClean,
          country: pkg.country || 'India',
          hotelName: `${currentStayName} /or similar`,
          nights: currentCount,
          roomType: 'Deluxe Room',
          mealPlan: 'As per package inclusion',
          amenities: ['Breakfast & Dinner', 'Free Wi-Fi', 'Hot Water', 'Clean Linen'],
        });
      }
    }

    if (staysFromItinerary.length > 0) {
      return staysFromItinerary;
    }

    return [
      {
        id: 'def-1',
        city: extractCleanCity('', pkg.destination),
        country: pkg.country || 'India',
        hotelName: 'Selected Verified Hotel / Resort /or similar',
        nights: pkg.durationNights || 4,
        roomType: 'Deluxe Room',
        mealPlan: 'As per package inclusion',
        amenities: ['24/7 Hot Water', 'Free Wi-Fi', 'Room Heating / Geyser', 'Breakfast & Dinner'],
      },
    ];
  }, [pkg]);

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

      {/* 2 Main Tabs: Hotels | Reporting & Dropping */}
      <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50 p-1.5 sm:p-2 gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('hotels')}
          className={`py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeTab === 'hotels'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Hotel className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
          <span className="truncate">Hotels</span>
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
        {/* TAB 1: HOTELS */}
        {/* ============================================================ */}
        {activeTab === 'hotels' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {accommodationList.map((acc, idx) => (
                <div
                  key={acc.id || idx}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs hover:border-stone-300 transition"
                >
                  {/* Header Bar: City & Country on Left, Stay Nights on Right (100% Inline on all screens) */}
                  <div className="bg-stone-50/90 border-b border-stone-200/80 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
                      <span className="font-extrabold text-stone-900 text-xs sm:text-sm tracking-tight truncate">
                        {acc.city}, {acc.country}
                      </span>
                    </div>
                    <div className="shrink-0 bg-white border border-stone-200 text-stone-800 font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#FF4B00]" />
                      <span>{acc.nights} {acc.nights === 1 ? 'Night' : 'Nights'} Stay</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 sm:p-4 space-y-3">
                    {/* Hotel Name Section */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Hotel className="w-4 h-4 text-[#FF4B00]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug">
                          {acc.hotelName}
                        </h4>
                        {acc.alternativeHotel && (
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                            <span className="text-stone-400 font-semibold">Alternative:</span>{' '}
                            {acc.alternativeHotel}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Aligned Key-Value Specs Table */}
                    <div className="bg-stone-50/60 rounded-xl p-2.5 sm:p-3 border border-stone-200/70 divide-y divide-stone-200/60 text-xs">
                      <div className="grid grid-cols-[82px_1fr] sm:grid-cols-[105px_1fr] gap-2 py-1.5 items-baseline">
                        <span className="text-stone-500 font-bold text-[11px] sm:text-xs">Room Type</span>
                        <span className="font-extrabold text-stone-900 text-[11px] sm:text-xs leading-tight">
                          {acc.roomType}
                        </span>
                      </div>

                      <div className="grid grid-cols-[82px_1fr] sm:grid-cols-[105px_1fr] gap-2 py-1.5 items-baseline">
                        <span className="text-stone-500 font-bold text-[11px] sm:text-xs">Meal Plan</span>
                        <span className="font-extrabold text-stone-900 text-[11px] sm:text-xs leading-tight">
                          {acc.mealPlan}
                        </span>
                      </div>

                      {(acc.checkInDate || acc.checkOutDate) && (
                        <div className="grid grid-cols-[82px_1fr] sm:grid-cols-[105px_1fr] gap-2 py-1.5 items-baseline">
                          <span className="text-stone-500 font-bold text-[11px] sm:text-xs">Timings</span>
                          <span className="text-stone-700 font-medium text-[11px] sm:text-xs">
                            {acc.checkInDate ? `Check-in: ${acc.checkInDate}` : ''}
                            {acc.checkInDate && acc.checkOutDate ? ' • ' : ''}
                            {acc.checkOutDate ? `Check-out: ${acc.checkOutDate}` : ''}
                          </span>
                        </div>
                      )}

                      {acc.houseboatDetails && (
                        <div className="grid grid-cols-[82px_1fr] sm:grid-cols-[105px_1fr] gap-2 py-1.5 items-baseline">
                          <span className="text-stone-500 font-bold text-[11px] sm:text-xs">Houseboat</span>
                          <span className="text-stone-700 font-medium text-[11px] sm:text-xs">
                            {acc.houseboatDetails}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amenities Inclusions */}
                    {acc.amenities && acc.amenities.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                          Hotel Amenities & Inclusions
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {acc.amenities.map((am, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 bg-white border border-stone-200 text-stone-800 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs"
                            >
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{am}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                  Hotel details are tentative only. The hotel or place of accommodation may change to an equivalent category based on season and room inventory.
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

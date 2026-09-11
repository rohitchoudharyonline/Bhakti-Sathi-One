import React from 'react';
import { TourPackage } from '../../types/tour';
import { Hotel, MapPin, CheckCircle2 } from 'lucide-react';

interface HotelTierPricingSelectorProps {
  pkg: TourPackage;
  selectedTier?: any;
  onSelectTier?: (tier: any) => void;
  className?: string;
}

export const HotelTierPricingSelector: React.FC<HotelTierPricingSelectorProps> = ({
  pkg,
  className = '',
}) => {
  const hotels = pkg.hotels || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Hotel className="w-5 h-5 text-brand" />
        <h3 className="text-lg font-bold text-slate-900">Hotels & Accommodation</h3>
      </div>
      {hotels.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm">
          Handpicked comfortable accommodations included as per itinerary.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotels.map((hotel, idx) => (
            <div
              key={hotel.id || idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{hotel.name}</h4>
                  {hotel.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{hotel.location}</span>
                    </div>
                  )}
                </div>
                <span className="bg-brand/10 text-brand font-bold text-xs px-2.5 py-1 rounded-lg shrink-0">
                  {hotel.nights} {hotel.nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700">Room:</span> {hotel.roomType}
              </div>

              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hotel.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100/60"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

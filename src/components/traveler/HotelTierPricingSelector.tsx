import React, { useState } from 'react';
import { Hotel, MapPin, BedDouble, Utensils } from 'lucide-react';
import { TourPackage, HotelStarCategory } from '../../types/tour';
import { formatPackagePrice } from '../../utils/priceHelper';

interface HotelTierPricingSelectorProps {
  pkg: TourPackage;
  selectedTier: HotelStarCategory;
  onSelectTier: (tier: HotelStarCategory) => void;
  className?: string;
}

/** Simple hotel selector without star/category labels. */
export const HotelTierPricingSelector: React.FC<HotelTierPricingSelectorProps> = ({
  pkg,
  className = '',
}) => {
  const hotels = pkg.hotels || [];
  const [selectedHotelId, setSelectedHotelId] = useState(hotels[0]?.id || '');
  const selectedHotel = hotels.find((hotel) => hotel.id === selectedHotelId) || hotels[0];
  const priceInfo = formatPackagePrice(
    pkg.price,
    pkg.discountedPrice,
    pkg.currency || '₹',
    Boolean(pkg.priceOnRequest || !pkg.price || pkg.price <= 0)
  );

  if (hotels.length === 0) {
    return (
      <div className={`rounded-xl border border-stone-200 bg-white p-4 ${className}`}>
        <div className="flex items-center gap-2 text-stone-900">
          <Hotel className="h-4 w-4" />
          <h3 className="text-sm font-bold">Hotels</h3>
        </div>
        <p className="mt-2 text-sm text-stone-500">Hotel details will be shared before booking confirmation.</p>
      </div>
    );
  }

  return (
    <div className={`w-full min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-white p-3 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-stone-100 p-2 text-stone-800">
          <Hotel className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-stone-900">Hotels</h3>
          <p className="text-xs text-stone-500">Choose your preferred hotel option</p>
        </div>
      </div>

      <label htmlFor="hotel-option-select" className="mb-1.5 block text-xs font-semibold text-stone-600">
        Hotel option
      </label>
      <select
        id="hotel-option-select"
        value={selectedHotelId}
        onChange={(event) => setSelectedHotelId(event.target.value)}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
      >
        {hotels.map((hotel) => (
          <option key={hotel.id} value={hotel.id}>
            {hotel.name}
          </option>
        ))}
      </select>

      {selectedHotel && (
        <div className="mt-3 rounded-lg bg-stone-50 p-3">
          <p className="text-sm font-bold text-stone-900">{selectedHotel.name}</p>
          <div className="mt-2 grid gap-1.5 text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {selectedHotel.location}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 shrink-0" />
              {selectedHotel.roomType} · {selectedHotel.nights} night{selectedHotel.nights === 1 ? '' : 's'}
            </span>
            {selectedHotel.amenities?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 shrink-0" />
                {selectedHotel.amenities.slice(0, 3).join(' · ')}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-200 pt-3">
        <span className="text-xs text-stone-500">Package starting price</span>
        <span className="text-base font-black text-stone-900">
          {priceInfo.isPriceOnRequest ? 'Price on Request' : priceInfo.displayPrice}
        </span>
      </div>
    </div>
  );
};

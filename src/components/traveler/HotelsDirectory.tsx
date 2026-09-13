import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Star, MapPin, Building, ChevronRight, Search, Sparkles } from 'lucide-react';

export const HotelsDirectory: React.FC = () => {
  const { hotels } = useTours();
  const [searchTerm, setSearchTerm] = useState('');

  if (hotels.length === 0) return null;

  const filteredHotels = hotels.filter((h) => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-stone-200">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-stone-900 uppercase tracking-wider mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>Verified Pilgrim Accommodations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight font-serif">
            Sanctified Stays & Luxury Himalayan Resorts
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-medium">
            Explore our handpicked collection of verified pilgrimage bhawans, 4-star mountain resorts, and temple vicinity hotels with comfortable dining.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search shrines or hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-300 text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:border-stone-900 focus:outline-hidden transition font-medium shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-400 transition overflow-hidden flex flex-col group">
            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
              {hotel.images?.[0] ? (
                <img 
                  src={hotel.images[0]} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-10 h-10 text-stone-300" />
                </div>
              )}
              
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg text-xs font-black text-stone-900 flex items-center gap-1 shadow-2xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{hotel.overallRating || 4}</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                {Array(Math.round(hotel.overallRating || 4)).fill(0).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                ))}
                <span className="ml-1 text-stone-500 font-semibold">• {Math.round(hotel.overallRating || 4)}-Star Standard</span>
              </div>
              
              <h3 className="font-black text-stone-900 text-base mb-1 line-clamp-1 group-hover:text-stone-600 transition">
                {hotel.name}
              </h3>
              
              <p className="text-xs text-stone-500 font-medium flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                <span className="truncate">{hotel.location}</span>
              </p>

              <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                {hotel.amenities?.slice(0, 3).map((am, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 bg-stone-50 border border-stone-200 text-stone-700 rounded-md font-semibold">
                    ✓ {am}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
                <div className="text-xs text-stone-800">
                  <span className="font-bold">{hotel.reviewCount}</span> <span className="text-stone-500 font-medium">Pilgrim Reviews</span>
                </div>
                <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  Dining Available
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredHotels.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 text-sm font-medium">
            No hotels match your search criteria.
          </div>
        )}
      </div>
    </section>
  );
};

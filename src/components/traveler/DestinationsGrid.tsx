import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTours } from '../../context/TourContext';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

interface DestinationsGridProps {
  onSelectDestination: (dest: string) => void;
  selectedDestination: string;
}

interface DestinationCardData {
  id: string;
  name: string;
  region: string;
  packagesCount: number;
  rating: number;
  bestTime: string;
  tagline: string;
  image: string;
  badge?: string;
  popularHighlight: string;
}

const APPROVED_DESTINATION_IMAGE_FALLBACKS: Record<string, string> = {
  'jammu-kashmir': 'https://images.unsplash.com/photo-1719377678428-d9bcec6976f3?auto=format&fit=crop&w=1600&q=85',
  'himachal': 'https://images.unsplash.com/photo-1590265788376-5d99eb11976e?auto=format&fit=crop&w=1600&q=85',
  'amritsar': 'https://images.unsplash.com/photo-1517427677506-ade074eb1432?auto=format&fit=crop&w=1600&q=85',
};

const PILGRIMAGE_DESTINATIONS: DestinationCardData[] = [
  {
    id: 'jammu-kashmir',
    name: 'Jammu & Kashmir',
    region: 'Jammu & Kashmir',
    packagesCount: 12,
    rating: 4.99,
    bestTime: 'Year Round',
    tagline: 'Scenic Mountain Valleys, Houseboats & Sacred Shrines',
    image: 'https://images.unsplash.com/photo-1719377678428-d9bcec6976f3?auto=format&fit=crop&w=800&q=85',
    badge: 'Jammu & Kashmir',
    popularHighlight: 'Alpine Meadows, Houseboats & Mountain Shrines',
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    region: 'Himachal Pradesh',
    packagesCount: 8,
    rating: 4.98,
    bestTime: 'Year Round',
    tagline: 'Himalayan Passes, Pine Valleys & Serene Hill Escapes',
    image: 'https://images.unsplash.com/photo-1590265788376-5d99eb11976e?auto=format&fit=crop&w=800&q=85',
    badge: 'Himachal Pradesh',
    popularHighlight: 'Alpine Passes, Pine Forests & Hill Escapes',
  },
];

export const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  onSelectDestination,
  selectedDestination,
}) => {
  const { destinations, mediaAssets } = useTours();

  return (
    <section id="destinations-section" className="py-14 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-900 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premier Mountain & Sacred Circuits</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
              Explore Jammu & Kashmir and Himachal Pradesh
            </h2>
          </div>

          <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200 self-start md:self-auto">
            Himalayan Tour Specialists
          </span>
        </div>

        {/* Responsive Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PILGRIMAGE_DESTINATIONS.map((dest, index) => {
            const isSelected = selectedDestination.toLowerCase().includes(dest.id.toLowerCase());
            const destState = destinations ? (destinations as Record<string, any>)[dest.id] : null;
            const rawImg = destState?.heroImage || dest.image;
            const displayImg = resolveDisplayImage(rawImg, mediaAssets, dest.image);

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => onSelectDestination(dest.id)}
                className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between p-4 sm:p-5 ${
                  isSelected
                    ? 'border-stone-900 ring-2 ring-stone-900/40'
                    : 'border-stone-200/90 hover:border-stone-400'
                }`}
              >
                {/* Background Image */}
                <img
                  src={displayImg}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                  onError={(e) => handleImageError(e, rawImg, mediaAssets, APPROVED_DESTINATION_IMAGE_FALLBACKS[dest.id] || dest.image)}
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent group-hover:from-stone-950/90 transition-all duration-300 pointer-events-none" />

                {/* Brand Color Subtle Hover Overlay */}
                <div className="absolute inset-0 bg-[#FF4B00]/0 group-hover:bg-[#FF4B00]/10 transition-colors duration-300 pointer-events-none" />

                {/* Bottom Destination Name & Brand-colored Arrow Only */}
                <div className="relative z-10 text-white pointer-events-none mt-auto">
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-orange-200 transition-colors drop-shadow-md leading-tight tracking-tight">
                      {dest.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#FF4B00] group-hover:bg-[#FF4B00] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-md shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

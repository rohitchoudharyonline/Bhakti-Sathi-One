import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

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

const PILGRIMAGE_DESTINATIONS: DestinationCardData[] = [
  {
    id: 'kashmir',
    name: 'Jammu & Kashmir',
    region: 'Jammu & Kashmir',
    packagesCount: 12,
    rating: 4.99,
    bestTime: 'Year Round',
    tagline: 'Srinagar, Gulmarg Gondola, Pahalgam & Houseboats',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    badge: '12+ Packages',
    popularHighlight: 'Guaranteed Gondola & Houseboat Stays',
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    region: 'Himachal Pradesh',
    packagesCount: 8,
    rating: 4.98,
    bestTime: 'Year Round',
    tagline: 'Manali, Solang Valley, Atal Tunnel & Shimla',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    badge: '8+ Packages',
    popularHighlight: 'Solang Adventures & Private Cabs',
  },
  {
    id: 'jammu',
    name: 'Jammu & Katra',
    region: 'Jammu & Kashmir',
    packagesCount: 6,
    rating: 4.97,
    bestTime: 'Year Round',
    tagline: 'Mata Vaishno Devi Holy Yatra & Patnitop Pine Meadows',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
    badge: '6+ Packages',
    popularHighlight: 'VIP Helicopter & Sacred Bhawan Stays',
  },
];

export const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  onSelectDestination,
  selectedDestination,
}) => {
  return (
    <section id="destinations-section" className="py-14 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-900 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sacred Dhams & Holy Yatras</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
              Top Pilgrimage Destinations Across India
            </h2>
          </div>

          <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200 self-start md:self-auto">
            Direct Yatra Specialist
          </span>
        </div>

        {/* Responsive Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {PILGRIMAGE_DESTINATIONS.map((dest, index) => {
            const isSelected = selectedDestination.toLowerCase().includes(dest.id.toLowerCase());

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
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-black/10 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-black tracking-wider text-white bg-stone-900/90 backdrop-blur-md px-3 py-1 rounded-full uppercase border border-white/20 shadow-xs">
                    {dest.badge}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    ★ {dest.rating}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 text-white pointer-events-none flex flex-col gap-1">
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-stone-100 transition-colors drop-shadow-md leading-tight">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-stone-200 font-medium drop-shadow-sm line-clamp-1">
                    {dest.tagline}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-stone-300">
                      {dest.popularHighlight}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform shrink-0">
                      <span>View Packages</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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

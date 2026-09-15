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
    id: 'jammu-kashmir',
    name: 'Jammu & Kashmir',
    region: 'Jammu & Kashmir',
    packagesCount: 12,
    rating: 4.99,
    bestTime: 'Year Round',
    tagline: 'Vaishno Devi, Shankaracharya Temple, Shiv Khori, Srinagar & Gulmarg',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
    badge: 'Vaishno Devi & Kashmir',
    popularHighlight: 'Helicopter Yatra, Cave Darshan & Dal Lake Shikara',
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    region: 'Himachal Pradesh',
    packagesCount: 8,
    rating: 4.98,
    bestTime: 'Year Round',
    tagline: 'Sacred 5 Devi Darshan (Jwala Ji, Chintpurni, Chamunda, Kangra, Naina Devi)',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    badge: 'Devi Darshan Circuit',
    popularHighlight: '9 Holy Flames, Ropeway & Dhauladhar Hills',
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    region: 'Punjab',
    packagesCount: 6,
    rating: 4.99,
    bestTime: 'Oct - Mar',
    tagline: 'Golden Temple (Sri Harmandir Sahib), Wagah Border & Durgiana Tirath',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    badge: 'Golden Temple & Border',
    popularHighlight: '24-Hour Gurbani Kirtan & Guru Ka Langar',
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
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/10 group-hover:from-stone-950/95 group-hover:via-stone-950/70 transition-all duration-300 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-black tracking-wider text-white bg-stone-900/90 backdrop-blur-md px-3 py-1 rounded-full uppercase border border-white/20 shadow-xs">
                    {dest.badge}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
                    ★ {dest.rating} • {dest.bestTime}
                  </span>
                </div>

                {/* Bottom Content with Desktop Hover Overlay */}
                <div className="relative z-10 text-white pointer-events-none flex flex-col gap-2">
                  {/* Desktop Hover Revealed Top Activities & CTA */}
                  <div className="hidden sm:flex flex-col gap-2 max-h-0 opacity-0 group-hover:max-h-48 group-hover:opacity-100 transition-all duration-300 overflow-hidden ease-out">
                    <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed font-medium">
                      {dest.tagline}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-200 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                      <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className="truncate">{dest.popularHighlight}</span>
                    </div>

                    <div className="mt-1 inline-flex items-center justify-between w-full bg-[#FF4B00] text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md transition-colors">
                      <span>Explore Details & Yatras</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Base Title & Package Count */}
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-200 transition-colors drop-shadow-md leading-tight tracking-tight">
                      {dest.name}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-white/20 mt-1">
                      <span className="text-xs font-bold text-stone-200">
                        {dest.packagesCount} Verified Packages
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 group-hover:text-amber-200 group-hover:translate-x-1 transition-all shrink-0">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
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

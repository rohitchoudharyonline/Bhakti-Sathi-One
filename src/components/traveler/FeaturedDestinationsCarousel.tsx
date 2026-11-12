import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Compass, MapPin } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { resolveDisplayImage } from '../../utils/imageResolver';

export interface DestinationItem {
  id: string;
  name: string;
  coverImage: string;
  startingPrice?: number;
  filterKey: string;
  badge?: string;
  tagline?: string;
}

interface FeaturedDestinationsCarouselProps {
  destinationsList?: DestinationItem[];
  onSelectDestination: (dest: DestinationItem) => void;
  title?: string;
  subtitle?: string;
}

export const getCleanDestinationName = (destination: any): string => {
  const rawId = String(destination?.id || destination?.slug || destination?.filterKey || '').toLowerCase().trim();
  const rawName = String(destination?.name || '').trim();
  const rawDisplay = String(destination?.displayName || '').trim();

  // If user stored 'H' or 'hp', expand to proper title
  if (
    rawName.toLowerCase() === 'h' ||
    rawDisplay.toLowerCase() === 'h' ||
    rawName.toLowerCase() === 'hp' ||
    rawDisplay.toLowerCase() === 'hp' ||
    rawName.toLowerCase() === 'himachal' ||
    rawDisplay.toLowerCase() === 'himachal' ||
    rawId === 'h' ||
    rawId === 'hp' ||
    rawId.includes('himachal')
  ) {
    return 'Himachal Pradesh';
  }

  if (
    rawName.toLowerCase() === 'j&k' ||
    rawDisplay.toLowerCase() === 'j&k' ||
    rawName.toLowerCase() === 'jk' ||
    rawDisplay.toLowerCase() === 'jk'
  ) {
    return 'Jammu & Kashmir';
  }

  // Use user's chosen display name or name directly from CMS
  if (rawDisplay && rawDisplay.length > 1) return rawDisplay;
  if (rawName && rawName.length > 1) return rawName;

  if (rawId && rawId.length > 1) {
    return rawId
      .split(/[-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return rawName || 'Destination';
};

export const FeaturedDestinationsCarousel: React.FC<FeaturedDestinationsCarouselProps> = ({
  destinationsList,
  onSelectDestination,
  title = "Destinations",
  subtitle = "Explore our verified tour destinations and handcrafted travel circuits.",
}) => {
  const { destinations, mediaAssets } = useTours();

  // Strictly show only destinations created in CMS - NO dummy destinations
  const list: DestinationItem[] = useMemo(() => {
    const sourceList: any[] = (destinationsList && destinationsList.length > 0)
      ? destinationsList
      : Object.values(destinations || {});

    return sourceList
      .filter((d) => d && (d.id || d.slug || d.name))
      .map((d: any) => {
        const destSlug = d.slug || d.id || d.filterKey;

        // Strictly use only the image uploaded while creating the destination in CMS
        const rawImage = d.heroImage || d.coverImage || '';
        const coverImage = rawImage && typeof rawImage === 'string' && rawImage.trim().length > 0
          ? resolveDisplayImage(rawImage.trim(), mediaAssets)
          : '';

        return {
          id: d.id || destSlug,
          name: getCleanDestinationName(d),
          coverImage,
          filterKey: destSlug,
        };
      });
  }, [destinationsList, destinations, mediaAssets]);

  // If user has not created any destinations in CMS, do not display dummy cards
  if (!list || list.length === 0) {
    return null;
  }

  return (
    <section id="featured-destinations-section" className="py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 select-none">
      {/* Header with Badge & Red Bar */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF4EE] border border-[#FCD6C3] text-[#FF4B00] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
          <span>FEATURED DESTINATIONS</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <span>{title}</span>
          <span className="w-8 h-1.5 bg-[#FF4B00] rounded-full inline-block shrink-0" />
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Simple Destination Cards Grid - Only destination name and uploaded photo */}
      <div className={`grid gap-3 sm:gap-6 ${
        list.length === 1
          ? 'grid-cols-1 max-w-md mx-auto'
          : list.length === 2
          ? 'grid-cols-2 max-w-5xl mx-auto'
          : 'grid-cols-2 sm:grid-cols-3 max-w-6xl mx-auto'
      }`}>
        {list.map((dest, index) => (
          <motion.div
            key={dest.id || dest.filterKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            onClick={() => onSelectDestination(dest)}
            className="group relative h-[250px] xs:h-[290px] sm:h-[380px] md:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-stone-200/90 hover:border-[#FF4B00] shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 select-none flex flex-col justify-end p-4 sm:p-6 bg-stone-900"
          >
            {/* Show ONLY the photo uploaded by the user while creating the destination */}
            {dest.coverImage ? (
              <img
                src={dest.coverImage}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-stone-600" />
              </div>
            )}

            {/* Bottom Gradient Scrim for Name Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent pointer-events-none" />

            {/* Only Destination Name */}
            <div className="relative z-10 text-white">
              <h3 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                {dest.name}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

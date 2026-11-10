import React from 'react';
import { FeaturedDestinationsCarousel } from './FeaturedDestinationsCarousel';

interface DestinationsGridProps {
  onSelectDestination: (dest: string) => void;
  selectedDestination: string;
}

export const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  onSelectDestination,
}) => {
  return (
    <FeaturedDestinationsCarousel
      onSelectDestination={(dest) => onSelectDestination(dest.filterKey || dest.id)}
    />
  );
};

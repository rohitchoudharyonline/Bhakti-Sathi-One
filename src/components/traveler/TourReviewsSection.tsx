import React from 'react';
import { TourPackage } from '../../types/tour';
import { TravelerReviewsSection } from './TravelerReviewsSection';

interface Props {
  pkg: TourPackage;
}

export const TourReviewsSection: React.FC<Props> = ({ pkg }) => {
  return (
    <div className="w-full py-4 px-2 sm:px-4">
      <TravelerReviewsSection />
    </div>
  );
};


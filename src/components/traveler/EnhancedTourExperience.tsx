import React from 'react';
import { useTours } from '../../context/TourContext';
import { PremiumTravelMarketplace } from './PremiumTravelMarketplace';
import { PremiumPackageDetail } from './PremiumPackageDetail';
import { TourReviewsSection } from './TourReviewsSection';
import { Footer } from './Footer';

export const EnhancedTourExperience: React.FC = () => {
  const { packages, selectedPackageId, setSelectedPackageId } = useTours();
  const pkg = selectedPackageId ? packages.find(p => p.id === selectedPackageId) : undefined;
  if (!pkg) return <PremiumTravelMarketplace />;
  return <>
    <PremiumPackageDetail pkg={pkg} onBack={() => setSelectedPackageId(null)} />
    <TourReviewsSection pkg={pkg} />
    <Footer />
  </>;
};

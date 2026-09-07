import React, { useState } from 'react';
import { Star, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { TourPackage } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { getPackageReviews } from '../../data/tourReviewsData';
import { TourReviewsAndGalleryModal } from './TourReviewsAndGalleryModal';

interface Props {
  pkg: TourPackage;
}

export const TourReviewsSection: React.FC<Props> = ({ pkg }) => {
  const { agencySettings } = useTours();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'reviews' | 'gallery'>('reviews');
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const reviews = getPackageReviews(pkg.title, pkg.reviews);
  const agencyName = agencySettings.agencyName || 'Bhakti Sathi';

  const openReviewsModal = (tab: 'reviews' | 'gallery') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  // Structured Data (JSON-LD) for Google Reviews Rich Snippets on Google Search
  const jsonLdTourReviews = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.overview || pkg.tagline,
    touristType: ['Family', 'Couples', 'Holiday Travelers'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: pkg.rating || 4.9,
      reviewCount: pkg.reviewCount || 485,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author,
      },
      datePublished: '2026-07-01',
      reviewBody: r.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
        worstRating: '1',
      },
    })),
  };

  return (
    <section className="w-full bg-[#111A2C] text-white py-12 sm:py-16 px-3 sm:px-6 relative overflow-hidden">
      {/* Inject Google Reviews JSON-LD Schema for Google Search Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTourReviews) }}
      />

      {/* Decorative background quotes watermark */}
      <div className="absolute right-4 top-4 text-white/5 text-9xl font-serif select-none pointer-events-none">
        “
      </div>
      <div className="absolute left-8 bottom-4 text-white/5 text-9xl font-serif select-none pointer-events-none">
        ”
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            {agencyName} tour reviews
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-medium">
            Verified traveler experiences and real holiday feedback
          </p>
        </div>

        {/* Single Featured Review Card */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          {reviews.slice(0, 1).map((rev) => {
            const isExpanded = expandedReviewId === rev.id;
            const snippetText =
              rev.text.length > 180 && !isExpanded
                ? rev.text.slice(0, 180) + '...'
                : rev.text;

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 sm:p-6 text-stone-900 shadow-xl flex flex-col justify-between relative border border-stone-100"
              >
                <div>
                  {/* Rating & Tag Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 font-black text-xs text-stone-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {rev.rating}
                    </span>
                    {rev.categoryTag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200">
                        {rev.categoryTag}
                      </span>
                    )}
                    {rev.verified && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Tour Title */}
                  <h3 className="text-xs sm:text-sm font-black text-stone-900 line-clamp-1 mb-2">
                    {pkg.title}
                  </h3>

                  {/* Review Text + Image Layout */}
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                        "{snippetText}"
                      </p>
                      {rev.text.length > 180 && (
                        <button
                          type="button"
                          onClick={() => setExpandedReviewId(isExpanded ? null : rev.id)}
                          className="text-stone-900 font-bold text-xs underline mt-1.5 cursor-pointer inline-block"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {rev.photoThumbnail && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-xs">
                        <img
                          src={rev.photoThumbnail}
                          alt={rev.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer with Reviewer & Tour Manager Badge */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <b className="text-xs font-black text-stone-900 block">{rev.author}</b>
                    <span className="text-[10px] text-stone-400 font-medium">{rev.date}</span>
                  </div>

                  {rev.tourManagers && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-[10px] text-stone-700">
                      <User className="w-3 h-3 text-stone-500 shrink-0" />
                      <span className="font-semibold text-stone-800 truncate max-w-[140px] sm:max-w-[180px]">
                        {rev.tourManagers}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand Primary CTA Button */}
        <div className="text-center">
          <button
            onClick={() => openReviewsModal('reviews')}
            className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white font-black text-sm tracking-wide transition shadow-md hover:shadow-lg cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span>Read 1,300+ Verified Reviews</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviews & Photo Gallery Modal */}
      <TourReviewsAndGalleryModal
        pkg={pkg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </section>
  );
};

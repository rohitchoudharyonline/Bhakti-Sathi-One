import React, { useState } from 'react';
import { Star, X, CheckCircle2, Image as ImageIcon, ChevronLeft, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { TourPackage } from '../../types/tour';
import { getPackageGalleryPhotos, getPackageReviews } from '../../data/tourReviewsData';

interface Props {
  pkg: TourPackage;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'reviews' | 'gallery';
}

export const TourReviewsAndGalleryModal: React.FC<Props> = ({
  pkg,
  isOpen,
  onClose,
  initialTab = 'reviews',
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'gallery'>(initialTab);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync tab if modal is re-opened with new initialTab
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const reviews = getPackageReviews(pkg.title, pkg.reviews);
  const gallery = getPackageGalleryPhotos(pkg.destination, pkg.gallery, pkg.coverImage);
  const reviewCount = pkg.reviewCount || 485;
  const rating = pkg.rating || 5.0;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length);
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % gallery.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full h-full sm:h-[90vh] max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header (Matching Screenshot 3) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <h2 className="text-sm sm:text-base font-black text-stone-900 truncate">
              {pkg.title}
            </h2>
            <div className="flex items-center gap-1 shrink-0 text-xs sm:text-sm font-bold text-stone-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(0)}</span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-600 font-medium">{reviewCount} Reviews</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Switcher (Matching Screenshot 3) */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-stone-50 border-b border-stone-200 shrink-0">
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer border ${
                activeTab === 'reviews'
                  ? 'bg-white text-stone-900 border-stone-300 shadow-xs'
                  : 'bg-stone-200/70 text-stone-600 border-transparent hover:bg-stone-200'
              }`}
            >
              All reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer border ${
                activeTab === 'gallery'
                  ? 'bg-white text-stone-900 border-stone-300 shadow-xs'
                  : 'bg-stone-200/70 text-stone-600 border-transparent hover:bg-stone-200'
              }`}
            >
              Photo gallery ({gallery.length}+)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/50">
          {activeTab === 'reviews' ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs transition hover:border-stone-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 font-black text-xs text-stone-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {rev.rating}
                    </span>
                    {rev.categoryTag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200">
                        {rev.categoryTag}
                      </span>
                    )}
                    {rev.verified && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Verified Guest
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-stone-900 mb-2">
                    {pkg.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-4 whitespace-pre-line font-normal">
                    "{rev.text}"
                  </p>

                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <b className="text-xs sm:text-sm text-stone-900 block">{rev.author}</b>
                      <span className="text-[11px] text-stone-400">
                        {rev.location ? `${rev.location} • ` : ''}
                        {rev.date}
                      </span>
                    </div>

                    {rev.tourManagers && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700">
                        <User className="w-3 h-3 text-stone-500" />
                        <span className="text-[10px] text-stone-500 font-bold">Tour Manager / Driver:</span>
                        <span className="font-semibold text-stone-900">{rev.tourManagers}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900">Guest Tour Moments</h3>
                  <p className="text-xs text-stone-500">Real photographs captured by travelers on this tour</p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
                  {gallery.length} High-Res Photos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => openLightbox(idx)}
                    className="group relative rounded-xl overflow-hidden bg-stone-200 aspect-[4/3] cursor-pointer shadow-xs border border-stone-200"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
                        {img.caption}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lightbox Viewer */}
        {lightboxIndex !== null && (
          <div
            onClick={closeLightbox}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-stone-300 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={gallery[lightboxIndex].url}
                alt={gallery[lightboxIndex].caption}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              <p className="text-white text-sm mt-3 text-center font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-xs">
                {gallery[lightboxIndex].caption} ({lightboxIndex + 1} / {gallery.length})
              </p>
            </div>

            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

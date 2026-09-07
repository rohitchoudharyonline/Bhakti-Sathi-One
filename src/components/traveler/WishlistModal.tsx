import React from 'react';
import { useTours } from '../../context/TourContext';
import { Heart, X, MapPin, Clock, Star, Sparkles, MessageCircle, ArrowRight, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (id: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose, onSelectPackage }) => {
  const { packages, wishlistIds, toggleWishlist, agencySettings } = useTours();

  if (!isOpen) return null;

  const wishlistedPackages = packages.filter((p) => wishlistIds.includes(p.id));

  const handleWhatsAppInquiryAll = () => {
    const titles = wishlistedPackages.map((p) => `• ${p.title} (${p.durationDays}D/${p.durationNights}N)`).join('\n');
    const text = `Hi ${agencySettings.agencyName}! I saved the following tour packages on your website and would like a combined custom quote & availability details:\n\n${titles}\n\nPlease share the best Price on Request quote.`;
    window.open(`https://wa.me/${(agencySettings?.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-900">
              <Heart className="w-5 h-5 fill-stone-900" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Your Saved Tours ({wishlistedPackages.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Bookmarked itineraries for your upcoming vacation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {wishlistedPackages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No saved tours yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                Click the heart icon on any package card to save your favorite holiday itineraries here.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
              >
                Browse Experiences
              </button>
            </div>
          ) : (
            wishlistedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="group flex flex-col sm:flex-row items-stretch gap-4 p-3.5 rounded-2xl border border-slate-200 hover:border-stone-400 transition bg-slate-50/50 hover:bg-white"
              >
                <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                  <img
                    src={pkg.coverImage}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                    {pkg.durationDays}D / {pkg.durationNights}N
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-stone-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {pkg.destination}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{pkg.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <h4
                      onClick={() => {
                        onSelectPackage(pkg.id);
                        onClose();
                      }}
                      className="text-sm font-bold text-slate-900 group-hover:text-stone-600 cursor-pointer line-clamp-1 transition-colors"
                    >
                      {pkg.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                      {pkg.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/70">
                    <div className="text-xs font-black text-stone-900">
                      Price on Request
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWishlist(pkg.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          onSelectPackage(pkg.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {wishlistedPackages.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Ready to plan your trip? Send all saved tours to our travel team.
            </span>

            <button
              onClick={handleWhatsAppInquiryAll}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get WhatsApp Quote for All Saved</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

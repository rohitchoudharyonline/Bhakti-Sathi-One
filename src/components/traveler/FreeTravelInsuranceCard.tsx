import React, { useState } from 'react';
import { ShieldCheck, Sparkles, ChevronRight, Info } from 'lucide-react';
import { TravelInsuranceModal } from './TravelInsuranceModal';

interface FreeTravelInsuranceCardProps {
  variant?: 'card' | 'compact' | 'pill';
  className?: string;
}

export const FreeTravelInsuranceCard: React.FC<FreeTravelInsuranceCardProps> = ({
  variant = 'card',
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      {variant === 'pill' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FDF2F2] hover:bg-[#FAD5D5] border border-[#9b0000]/30 text-[#9b0000] text-[10px] font-black transition cursor-pointer ${className}`}
        >
          <ShieldCheck className="w-3 h-3 text-[#9b0000] shrink-0" />
          <span>Free Insurance up to ₹200K</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full group text-left px-2.5 py-1.5 rounded-lg bg-[#FDF2F2] hover:bg-[#FAD5D5] border border-[#9b0000]/30 transition-all flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs ${className}`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-4 h-4 rounded bg-[#9b0000] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-extrabold text-[#1A1A1A] tracking-tight truncate">
              Free Travel Insurance <span className="text-[#9b0000] font-black">upto ₹200K</span>
            </span>
          </div>

          <div className="flex items-center gap-0.5 text-[10px] font-black text-[#9b0000] shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>Covers</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      ) : (
        <div
          onClick={handleClick}
          className={`p-2.5 sm:p-3 rounded-xl bg-[#1A1A1A] text-white border border-[#9b0000]/40 hover:border-[#9b0000] flex items-center justify-between gap-2.5 shadow-xs transition-all cursor-pointer group ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#9b0000] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white leading-tight">
                  Free Travel Insurance
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider bg-[#9b0000] text-white px-1.5 py-0.2 rounded font-mono shadow-2xs">
                  ₹200K COVER
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-medium leading-tight mt-0.5 line-clamp-1">
                Hospitalization (₹2 Lakhs), Accident & Baggage Cover Included
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-[11px] font-black text-[#9b0000] group-hover:text-white transition-colors">
            <span className="hidden xs:inline">View Covers & Terms</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* Interactive Modal showing full covers and liability terms */}
      <TravelInsuranceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};


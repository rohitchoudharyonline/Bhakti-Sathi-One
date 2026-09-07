import React from 'react';
import { ShieldCheck, Star, Zap, CreditCard, Sparkles } from 'lucide-react';

interface TrustIndicatorsProps {
  className?: string;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ className = '' }) => {
  const perks = [
    {
      id: 'verified',
      icon: ShieldCheck,
      text: '100% Verified Hotels & Cabs',
      highlight: 'Inspected Stays',
      color: 'text-stone-900',
    },
    {
      id: 'ratings',
      icon: Star,
      text: '4.7/5 Rated by 1,300+ Travelers',
      highlight: 'Top Rated',
      color: 'text-amber-500',
    },
    {
      id: 'instant',
      icon: Zap,
      text: 'Instant WhatsApp Itinerary',
      highlight: 'Under 2 Mins',
      color: 'text-emerald-600',
    },
    {
      id: 'transparent',
      icon: CreditCard,
      text: 'Zero Hidden Fees • Secure UPI',
      highlight: 'Guaranteed',
      color: 'text-blue-600',
    },
  ];

  return (
    <div
      id="hero-trust-ribbon"
      className={`w-full bg-white rounded-2xl sm:rounded-full border border-stone-200/90 py-2.5 px-3 sm:px-6 shadow-2xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar sm:divide-x sm:divide-stone-100">
        {perks.map((perk, idx) => {
          const Icon = perk.icon;
          return (
            <div
              key={perk.id}
              className={`flex items-center gap-2 whitespace-nowrap shrink-0 ${
                idx !== 0 ? 'sm:pl-4' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 ${perk.color}`}>
                <Icon className="w-3.5 h-3.5 fill-current/15" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                <span>{perk.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


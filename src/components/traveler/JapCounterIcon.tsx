import React from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { useTours } from '../../context/TourContext';

const RudrakshaIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" aria-hidden="true">
    <circle cx="24" cy="24" r="15" fill="none" stroke="#A84D12" strokeWidth="6" strokeDasharray="1.2 4" strokeLinecap="round" />
    <circle cx="24" cy="8" r="3.5" fill="#7C3410" /><circle cx="24" cy="24" r="5" fill="#9b0000" />
    <path d="M20 17c2-2 6-2 8 0M20 31c2 2 6 2 8 0" fill="none" stroke="#FDF2F2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Shortcut: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <button type="button" onClick={onClick} aria-label={label} className="w-[82px] sm:w-[92px] flex flex-col items-center gap-1.5 cursor-pointer active:scale-[0.97] transition-transform">
    <span className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-2xl border border-stone-200 bg-white shadow-[0_6px_18px_rgba(60,35,20,0.07)] flex items-center justify-center">{icon}</span>
    <span className="text-[10px] sm:text-[11px] font-black text-stone-600 whitespace-nowrap">{label}</span>
  </button>
);

export const JapCounterIcon: React.FC = () => {
  const { navigateToJapCounter } = useTours();
  const navigate = (path: string) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <div className="mt-4 sm:mt-5 flex items-start justify-center gap-3 sm:gap-7" aria-label="Holidays Hunt spiritual shortcuts">
      <Shortcut label="Jap Counter" icon={<RudrakshaIcon />} onClick={navigateToJapCounter} />
      <Shortcut label="Panchang" icon={<CalendarDays className="w-6 h-6 text-[#9b0000]" strokeWidth={1.8} />} onClick={() => navigate('/panchang')} />
      <Shortcut label="Rashifal" icon={<Sparkles className="w-6 h-6 text-[#5B35D5]" strokeWidth={1.8} />} onClick={() => navigate('/rashifal')} />
    </div>
  );
};

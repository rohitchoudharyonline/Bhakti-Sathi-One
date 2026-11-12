import React from 'react';
import { useTours } from '../../context/TourContext';

interface QuickOrderContactCardsProps {
  className?: string;
  tourTitle?: string;
}

export const QuickOrderContactCards: React.FC<QuickOrderContactCardsProps> = ({
  className = '',
  tourTitle,
}) => {
  const { agencySettings } = useTours();

  const phone = agencySettings?.phone || '+91 94199 15255';
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  const whatsapp = agencySettings?.whatsapp || phone || '+91 94199 15255';
  const cleanWhatsapp = whatsapp.replace(/\D/g, '');

  const waMessage = tourTitle
    ? `Hello Holidays Hunt, I would like to order and book the tour package: "${tourTitle}". Please connect with me.`
    : `Hello Holidays Hunt, I would like to order and book a holiday package. Please connect with me.`;

  const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full max-w-full ${className}`}>
      {/* 1. Order Via Call Card (Authentic Design Matching Reference) */}
      <a
        href={`tel:${cleanPhone}`}
        className="bg-white rounded-2xl border border-stone-200/90 hover:border-blue-300 py-3 px-3 sm:px-4 flex items-center justify-center gap-2.5 sm:gap-3 shadow-2xs hover:shadow-xs transition-all duration-200 group active:scale-[0.98] select-none text-left"
        aria-label="Order Via Call"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0084FF] group-hover:bg-[#0073E6] text-white flex items-center justify-center shrink-0 shadow-xs transition-colors">
          {/* Authentic Phone Receiver SVG */}
          <svg
            className="w-5 h-5 fill-white text-white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="block text-[13px] sm:text-sm font-bold text-stone-900 group-hover:text-blue-700 leading-tight transition-colors">
            Order
          </span>
          <span className="block text-[13px] sm:text-sm font-bold text-stone-900 group-hover:text-blue-700 leading-tight transition-colors">
            Via Call
          </span>
        </div>
      </a>

      {/* 2. Order from WhatsApp Card (Authentic Official WhatsApp Logo) */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-300 py-3 px-3 sm:px-4 flex items-center justify-center gap-2.5 sm:gap-3 shadow-2xs hover:shadow-xs transition-all duration-200 group active:scale-[0.98] select-none text-left"
        aria-label="Order from WhatsApp"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] group-hover:bg-[#20BD5A] text-white flex items-center justify-center shrink-0 shadow-xs transition-colors">
          {/* Official WhatsApp Logo SVG (Speech bubble + handset) */}
          <svg
            className="w-5 h-5 fill-white text-white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="block text-[13px] sm:text-sm font-bold text-stone-900 group-hover:text-emerald-700 leading-tight transition-colors">
            Order from
          </span>
          <span className="block text-[13px] sm:text-sm font-bold text-stone-900 group-hover:text-emerald-700 leading-tight transition-colors">
            WhatsApp
          </span>
        </div>
      </a>
    </div>
  );
};

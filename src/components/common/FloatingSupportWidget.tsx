import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Phone, Headphones, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTours } from '../../context/TourContext';

export const FloatingSupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const { agencySettings } = useTours();

  const phoneFormatted = agencySettings.phone || '+91 94199 15255';
  const cleanPhone = (agencySettings.phone || '+919419915255').replace(/[^0-9]/g, '');
  const rawWhatsapp = agencySettings.whatsapp || agencySettings.phone || '+919419915255';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=Hello%20Holidays%20Hunt,%20I%20would%20like%20instant%20support%20and%20assistance%20regarding%20tour%20packages.`;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={widgetRef} className="fixed right-4 bottom-20 md:bottom-6 z-[95] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/90 p-4 flex flex-col gap-3 min-w-[240px] sm:min-w-[260px] text-stone-900 z-50 animate-in fade-in-50"
          >
            {/* Header Title */}
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <div className="space-y-0.5 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4B00]">24x7 Customer Desk</p>
                <h4 className="text-xs font-black text-stone-900">How would you like to connect?</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Phone Call */}
            <motion.a
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={`tel:${cleanPhone}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50/80 hover:bg-[#FF4B00] border border-[#FF4B00]/20 text-stone-800 transition-all duration-300 group cursor-pointer shadow-2xs hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF4B00] group-hover:bg-white text-white group-hover:text-[#FF4B00] flex items-center justify-center shrink-0 shadow-xs transition-colors duration-300">
                <Phone className="w-4 h-4 fill-current text-current" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-black text-stone-900 group-hover:text-white transition-colors">Call Our Hotline</p>
                <p className="text-[11px] font-bold text-stone-500 group-hover:text-white/90 mt-0.5 transition-colors">{phoneFormatted}</p>
              </div>
            </motion.a>

            {/* WhatsApp Chat */}
            <motion.a
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/80 hover:bg-[#FF4B00] border border-emerald-500/20 hover:border-[#FF4B00] text-stone-800 transition-all duration-300 group cursor-pointer shadow-2xs hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 group-hover:bg-white text-white group-hover:text-[#FF4B00] flex items-center justify-center shrink-0 shadow-xs transition-colors duration-300">
                <MessageCircle className="w-4 h-4 fill-current text-current" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-black text-stone-900 group-hover:text-white transition-colors">Chat on WhatsApp</p>
                <p className="text-[11px] font-bold text-stone-500 group-hover:text-white/90 mt-0.5 transition-colors">Instant Tour Support</p>
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Round Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12, rotate: 6 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full bg-stone-900 hover:bg-[#FF4B00] text-white shadow-2xl border border-stone-700/80 hover:border-[#FF4B00] flex items-center justify-center cursor-pointer transition-all duration-300 shadow-stone-950/40 hover:shadow-lg hover:shadow-[#FF4B00]/40 group"
        title="Customer Support & Inquiries"
      >
        {/* Pulsing Dot */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B00] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF4B00] border-2 border-stone-900 group-hover:border-white transition-colors"></span>
        </span>

        <div className="text-amber-400 group-hover:text-white flex items-center justify-center transition-colors duration-300">
          {isOpen ? <X className="w-6 h-6" /> : <Headphones className="w-6 h-6" />}
        </div>
      </motion.button>
    </div>
  );
};

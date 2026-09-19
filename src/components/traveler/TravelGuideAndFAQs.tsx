import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { HelpCircle, ChevronDown, ChevronUp, Phone, MessageCircle } from 'lucide-react';

export const TravelGuideAndFAQs: React.FC = () => {
  const { agencySettings } = useTours();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What types of tour packages does Holidays Hunt specialize in?',
      a: 'Holidays Hunt specializes in customized Family Vacations, Romantic Honeymoon Getaways, Sacred Pilgrimages, and Leisure Holidays across Jammu & Kashmir and Himachal Pradesh with handpicked stays, private chauffeurs, and 24/7 concierge support.',
    },
    {
      q: 'How does Holidays Hunt ensure a smooth and personalized holiday experience?',
      a: 'Holidays Hunt pairs you with verified local hotel partners, experienced mountain chauffeurs, and dedicated 24x7 tour managers. We customize every itinerary according to your travel pace, family preferences, hotel category choices, and sightseeing interests.',
    },
    {
      q: 'Can Holidays Hunt customize a private tour itinerary for families or couples?',
      a: 'Absolutely! Every itinerary at Holidays Hunt is 100% customizable. Whether you are traveling as a honeymoon couple seeking private candlelight dinners and scenic retreats, or a multi-generational family requiring spacious vehicles and child/elderly-friendly hotels, our team tailors every detail.',
    },
    {
      q: 'How does Holidays Hunt handle sacred pilgrimages like Mata Vaishno Devi?',
      a: 'For sacred yatras, Holidays Hunt provides end-to-end facilitation including handpicked hotels near shrines, assistance with priority darshan guidance, dedicated comfortable transfers, and respectful local coordination for senior citizens. (Note: We do NOT sell helicopter tickets directly).',
    },
    {
      q: 'What is Holidays Hunt\'s payment schedule and booking policy?',
      a: 'To secure your hotel reservations and private cab bookings, Holidays Hunt requires a standard advance deposit. The remaining balance can be settled as per the agreed payment schedule before or upon arrival. We accept UPI, Net Banking, credit/debit cards, and bank transfers with complete GST invoicing.',
    },
    {
      q: 'Which destinations are covered in Jammu & Kashmir and Himachal Pradesh tours?',
      a: 'Our tours cover Srinagar (Dal Lake houseboats & Mughal Gardens), Gulmarg, Pahalgam, Sonamarg, Doodhpathri, and Mata Vaishno Devi Katra in Jammu & Kashmir, as well as Shimla, Manali, Solang Valley, Atal Tunnel, Rohtang, Dharamshala, and Dalhousie in Himachal Pradesh.',
    },
  ];

  return (
    <section id="faqs-section" className="py-16 bg-white border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-900 text-[11px] font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Holidays Hunt FAQs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg mx-auto">
            Essential information regarding custom tour packages, family vacations, honeymoons, and sacred yatras.
          </p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-stone-50/70 rounded-2xl border border-stone-200 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-stone-900 hover:text-stone-600 transition-colors cursor-pointer select-none"
                >
                  <span className="text-xs sm:text-sm font-black">{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-[#FF4B00] text-white' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-stone-200/60 font-medium whitespace-pre-line bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-orange-50/80 border border-orange-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">Have questions about specific dates or destinations?</h4>
              <p className="text-xs text-stone-600 font-medium">Speak directly with our senior holiday specialists.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${agencySettings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
            <a
              href={`tel:${agencySettings.phone}`}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call Toll-Free</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

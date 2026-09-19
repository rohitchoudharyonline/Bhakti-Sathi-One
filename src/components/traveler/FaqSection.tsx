import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { Helmet } from 'react-helmet-async';

export const FaqSection: React.FC = () => {
  const { agencySettings } = useTours();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const fallbackFaqs = [
    {
      id: 'faq-1',
      question: 'What types of tour packages does Holidays Hunt specialize in?',
      answer: 'Holidays Hunt specializes in customized Family Vacations, Romantic Honeymoon Getaways, Sacred Pilgrimages, and Leisure Holidays across Jammu & Kashmir and Himachal Pradesh with handpicked verified stays, private mountain chauffeurs, and 24/7 on-trip concierge support.'
    },
    {
      id: 'faq-2',
      question: 'How does Holidays Hunt ensure a smooth and personalized holiday experience?',
      answer: 'Holidays Hunt pairs you with verified local hotel partners, experienced chauffeurs, and dedicated 24x7 tour managers. We customize every itinerary according to your travel pace, family preferences, hotel category choices, and sightseeing interests.'
    },
    {
      id: 'faq-3',
      question: 'Can Holidays Hunt customize a private tour itinerary for families or couples?',
      answer: 'Absolutely! Every itinerary at Holidays Hunt is 100% customizable. Whether you are traveling as a honeymoon couple seeking private candlelight dinners and scenic retreats, or a multi-generational family requiring spacious vehicles and child/elderly-friendly hotels, our team tailors every detail.'
    },
    {
      id: 'faq-4',
      question: 'How does Holidays Hunt handle sacred pilgrimages like Mata Vaishno Devi?',
      answer: 'For sacred yatras, Holidays Hunt provides end-to-end facilitation including handpicked hotels near shrines, assistance with priority darshan guidance, dedicated comfortable transfers, and respectful local coordination for senior citizens.'
    },
    {
      id: 'faq-5',
      question: 'What is Holidays Hunt\'s payment schedule and booking policy?',
      answer: 'To secure your hotel reservations and private cab bookings, Holidays Hunt requires a standard advance deposit. The remaining balance can be settled as per the agreed payment schedule before or upon arrival. We accept UPI, Net Banking, credit/debit cards, and bank transfers with complete GST invoicing.'
    },
    {
      id: 'faq-6',
      question: 'What is the cancellation and refund policy for Holidays Hunt bookings?',
      answer: 'Cancellations follow clear transparent timelines based on hotel and operational partner policies. Any eligible refunds are processed promptly to your original payment mode within standard banking turnaround times.'
    },
    {
      id: 'faq-7',
      question: 'Which destinations are covered in Jammu & Kashmir and Himachal Pradesh packages?',
      answer: 'Our packages cover all major circuits including Srinagar, Gulmarg, Pahalgam, Sonamarg, and Mata Vaishno Devi Katra in Jammu & Kashmir, and Shimla, Manali, Solang Valley, Rohtang Pass, Dharamshala, and Dalhousie in Himachal Pradesh.'
    },
    {
      id: 'faq-8',
      question: 'Are meals and special dietary preferences accommodated during the tour?',
      answer: 'Yes, our tour packages include flexible meal plans (such as MAP Plan with Daily Breakfast & Dinner). We recommend and coordinate with partner hotels and reputable local restaurants to ensure clean, high-quality, and pure vegetarian / Jain / halal meal options as per guest requirements.'
    },
    {
      id: 'faq-9',
      question: 'How are transportation and safety managed in hilly regions?',
      answer: 'We deploy only experienced, courteous, and licensed mountain drivers with well-maintained commercial vehicles (Innova Crysta, Ertiga, Tempo Traveller, Dzire). Safety protocols, terrain expertise, and guest comfort are our highest priorities.'
    },
    {
      id: 'faq-10',
      question: 'What sets Holidays Hunt apart from conventional travel operators?',
      answer: 'Holidays Hunt delivers genuine on-ground concierge support, 100% transparent pricing with no hidden charges, verified hotel stays, and personalized itineraries designed for unforgettable Family, Honeymoon, and Pilgrimage memories.'
    }
  ];

  const activeFaqs = agencySettings?.faqs && agencySettings.faqs.length > 0 
    ? agencySettings.faqs 
    : fallbackFaqs;

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="homepage-faqs" className="bg-stone-50/40 py-10 sm:py-12 border-t border-b border-stone-200/50">
      {/* Dynamic Google FAQ Schema for Premium SEO Ranking */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1 bg-orange-50 border border-orange-100/80 text-orange-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3 h-3 text-orange-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Common Questions & Answers
          </h2>
          <p className="mt-1 text-stone-500 text-xs leading-relaxed">
            Quick, honest, and comprehensive details regarding planning, customized Family, Honeymoon & Pilgrimage itineraries, payments, and cancellations with Holidays Hunt.
          </p>
        </div>

        {/* FAQ Accordions - Compact Layout */}
        <div className="space-y-2.5">
          {activeFaqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={faq.id || index}
                className="bg-white border border-stone-200/60 rounded-xl overflow-hidden shadow-2xs hover:border-stone-300/80 transition-all duration-150"
              >
                {/* Trigger Button - Reduced Padding & Small Font */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between text-left px-4 py-3 gap-3 hover:bg-stone-50/30 transition-colors cursor-pointer"
                >
                  <span className="font-extrabold text-stone-800 text-xs sm:text-[13.5px] leading-snug">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-md bg-stone-50 text-stone-400 transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-180 bg-orange-50 text-orange-600' : ''}`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Animated Collapse Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                    >
                      <div className="px-4 pb-3.5 pt-1 border-t border-stone-100">
                        <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line max-w-[68ch]">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

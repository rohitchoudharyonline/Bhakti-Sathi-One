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
      question: 'How does Bhakti Sathi assist in planning customizable spiritual Yatras?',
      answer: 'Bhakti Sathi is a premier digital platform and travel facilitator. We coordinate customized travel itineraries, connecting you with verified local transport coordinators and accommodation providers. Our expert team assists you in selecting custom routes, durations, and comfort-aligned options suitable for families and senior citizens.'
    },
    {
      id: 'faq-2',
      question: 'How does Bhakti Sathi help ensure comfort for senior citizens on pilgrimages like Vaishno Devi or Char Dham?',
      answer: 'Bhakti Sathi is dedicated to organizing stress-free, senior-friendly spiritual journeys. While hotels and helicopter services are managed by independent third-party operators, Bhakti Sathi coordinators handpick recommended hotels with elevators and close proximity to the shrines. We also assist in coordinating priority assist requests, planning gentle travel paces, and arranging dedicated, comfortable ground vehicles with experienced chauffeurs to support our elderly guests.'
    },
    {
      id: 'faq-3',
      question: 'What is Bhakti Sathi\'s role regarding meals and restaurant suggestions?',
      answer: 'Bhakti Sathi does not operate restaurants, kitchens, or hotel dining services. However, we understand the importance of dietary preferences on a sacred journey. We provide curated recommendations for reputable local vegetarian restaurants and hotel kitchens along your yatra route that offer clean, high-quality vegetarian food.'
    },
    {
      id: 'faq-4',
      question: 'Can Bhakti Sathi customize a spiritual tour itinerary for my family?',
      answer: 'Absolutely! Bhakti Sathi is famous for custom-made, private spiritual itineraries. Whether you are planning a family trip to Kashi Vishwanath, Ayodhya Ram Mandir, or Himachal Devi Darshans, our expert team can adjust the travel duration, suggest select category stays, and coordinate private transport matching your family\'s speed and requirements.'
    },
    {
      id: 'faq-5',
      question: 'What is Bhakti Sathi\'s payment schedule and booking policy?',
      answer: 'To secure your preferred hotels and dedicated vehicle bookings, Bhakti Sathi requires a standard 30% advance deposit. The remaining 70% balance can be settled in easy installments up to 7 days before your departure. We accept UPI, bank transfer, Net Banking, and all major debit/credit cards with 100% transparent invoicing.'
    },
    {
      id: 'faq-6',
      question: 'What is the cancellation and rescheduling policy for a Bhakti Sathi coordinated yatra?',
      answer: 'We offer flexible terms to ensure peace of mind. For cancellations done 30 days or more before departure, we provide a full refund of your deposit. Within 15-29 days, a 50% refund is applicable. If you need to postpone, Bhakti Sathi allows you to reschedule or transfer your booking to a family member within 6 months, subject to seasonal rate differences from hotels and transport partners.'
    },
    {
      id: 'faq-7',
      question: 'Are local tour guides and temple historians provided by Bhakti Sathi?',
      answer: 'Yes, upon request, Bhakti Sathi can connect you with certified, knowledgeable local guides and religious experts at various historical temples. They help explain the historical significance, temple legends, and rich cultural heritage of the sacred shrines.'
    },
    {
      id: 'faq-8',
      question: 'Does Bhakti Sathi coordinate helicopter bookings for Yatras like Vaishno Devi or Kedarnath?',
      answer: 'Bhakti Sathi assists travelers by providing guidance, booking schedule updates, and facilitation support for third-party helicopter tickets. Please note that helicopter tickets are subject to official government portal schedules, verification requirements, and availability.'
    },
    {
      id: 'faq-9',
      question: 'How does Bhakti Sathi handle travel logistics in hilly and mountainous regions?',
      answer: 'We coordinate with licensed local drivers who are highly experienced with hilly terrains. For the safety of our guests, we strictly adhere to mountain safety guidelines, such as completing travel before dark, maintaining safe speed limits, and ensuring proper vehicle fitness.'
    },
    {
      id: 'faq-10',
      question: 'What sets Bhakti Sathi apart from conventional tour operators?',
      answer: 'Bhakti Sathi is a specialized platform focusing exclusively on custom-made devotional, family, and senior-friendly yatras. We provide personalized 24/7 travel desk support during your trip, complete billing transparency, and reliable local partners to make your pilgrimage seamless and spiritually enriching.'
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
            <span>Assisted Yatra Travel FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Common Questions & Answers
          </h2>
          <p className="mt-1 text-stone-500 text-xs leading-relaxed">
            Quick, honest, and comprehensive details regarding planning, customized spiritual itineraries, payments, and cancellations with Bhakti Sathi.
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

import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Phone, MessageCircle, Sparkles } from 'lucide-react';

export const TravelGuideAndFAQs: React.FC = () => {
  const { agencySettings } = useTours();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Darshan assistance work for Mata Vaishno Devi & Himachal Temples?',
      a: 'We provide comprehensive yatra coordination, timing guidance, and ground logistics for sacred shrines (e.g. Shri Mata Vaishno Devi Shrine Board, Kangra Devi, Jwala Ji, and Chamunda Devi). A dedicated local coordinator or private chauffeur assists your family with registration, route guidance, and comfortable scheduling so senior citizens and families travel without stress.',
    },
    {
      q: 'What meal arrangements are included in the packages?',
      a: 'Daily breakfast and scheduled meals are provided according to your chosen plan (CP, MAP, or AP) at verified and hygienic partner hotels. Specific dietary requirements or special requests can be accommodated with advance notice during booking.',
    },
    {
      q: 'What special arrangements do you make for Senior Citizens & Elderly Pilgrims?',
      a: 'We understand the physical comfort required for family and temple journeys. We provide:\n1. Pre-booked Battery-operated e-rickshaws or Palki/Pony arrangements for Vaishno Devi Bhawan.\n2. Ground-floor or elevator-accessible rooms in all verified hotel categories.\n3. Dedicated private chauffeur vehicles (Innova / Crysta) with flexible rest stops.\n4. Personalized pacing so senior family members travel comfortably.',
    },
    {
      q: 'Does Bhakti Sathi sell or book Mata Vaishno Devi Helicopter tickets?',
      a: 'NO. Bhakti Sathi DOES NOT sell or book helicopter tickets for Mata Vaishno Devi. In strict compliance with Shri Mata Vaishno Devi Shrine Board (SMVDSB) regulations, Katra–Sanjichhat helicopter tickets must be booked directly by devotees on the official Shrine Board portal (maavaishnodeviboard.org). Beware of fraudulent sites or fake promises. Our packages provide Katra hotel stays, private cab transfers, RFID yatra card guidance, and ground assistance.',
    },
    {
      q: 'What is included in the Himachal 5 Devi Darshan tour?',
      a: 'The Himachal Devi Darshan tour covers the sacred shrines of Mata Mansa Devi (Panchkula), Mata Naina Devi (Bilaspur), Mata Chintpurni, Mata Jwala Ji (Eternal Flame), Mata Kangra Brajeshwari, and Mata Chamunda Devi, along with comfortable family stays and private vehicle transfers throughout.',
    },
    {
      q: 'Can we customize our family yatra itinerary or combine multiple sacred shrines?',
      a: 'Yes, absolutely! Every tour is 100% private and fully customizable. You can combine Mata Vaishno Devi with Shivkhori & Patnitop, Kashi Vishwanath with Ayodhya Ram Mandir & Prayagraj, or Char Dham with Haridwar & Rishikesh at your preferred family pacing.',
    },
  ];

  return (
    <section id="faqs-section" className="py-16 bg-white border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-900 text-[11px] font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Sacred Yatra FAQs & Guidelines</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
            Frequently Asked Questions for Devotees
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg mx-auto">
            Essential information regarding temple darshans, hotel dining, elderly care, and government biometric registrations.
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
                    isOpen ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'
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
        <div className="mt-10 p-6 rounded-2xl bg-amber-50/80 border border-amber-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">Have questions about specific Pujas or Yatra dates?</h4>
              <p className="text-xs text-stone-600 font-medium">Speak directly with our senior Yatra coordinator in Haridwar.</p>
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
              <span>WhatsApp Yatra Desk</span>
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

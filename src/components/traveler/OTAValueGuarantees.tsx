import React from 'react';
import { ShieldCheck, Utensils, HeartHandshake, Sparkles, CheckCircle2, Award, Users, Compass } from 'lucide-react';

export const OTAValueGuarantees: React.FC = () => {
  const guarantees = [
    {
      icon: Sparkles,
      title: 'Guaranteed VIP Darshan Passes',
      description: 'Pre-booked VIP passes for Kedarnath, Kashi Vishwanath Sugam Darshan, and Tirupati Sheegra Darshan.',
      badge: 'VIP Sanctum Entry',
    },
    {
      icon: Utensils,
      title: 'Hygienic Dining & Daily Meals',
      description: 'Fresh and hygienic meals arranged daily at verified hotels, with custom preferences accommodated on advance request.',
      badge: 'Daily Meals',
    },
    {
      icon: HeartHandshake,
      title: 'Senior Citizen & Wheelchair Care',
      description: 'Dedicated assistance with Palki, Doli, battery cars, and emergency medical oxygen support.',
      badge: 'Elderly Friendly',
    },
    {
      icon: Compass,
      title: 'Char Dham & Shrine Registration',
      description: 'Official Yatra registration assistance & Shrine Board booking guidance for Kedarnath & Char Dham.',
      badge: 'Yatra Support',
    },
    {
      icon: Users,
      title: 'Dedicated Yatra Pandit & Guide',
      description: 'Experienced priests to guide you through sacred temple rituals, 22 teertham snan, and abhishek.',
      badge: 'Ritual Assistance',
    },
    {
      icon: ShieldCheck,
      title: 'Govt. Biometric Registration',
      description: 'Complete assistance with state shrine boards, biometric RFID cards, and health clearances.',
      badge: 'Govt. Verified',
    },
  ];

  return (
    <section className="bg-white border-y border-stone-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-stone-900 bg-stone-100 px-3.5 py-1 rounded-full border border-stone-300 inline-block mb-2">
              The Sacred Yatra Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Why Devotees & Families Trust Bhakti Sathi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md font-medium">
            Every sacred journey is planned with deep spiritual devotion, sanitized private mountain vehicles, verified clean stays, and complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-stone-50/70 rounded-2xl p-5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-400 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 group-hover:text-stone-700 transition-colors mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] font-bold text-stone-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guaranteed in Every Yatra Package</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

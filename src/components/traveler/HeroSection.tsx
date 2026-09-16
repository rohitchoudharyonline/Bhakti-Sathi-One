import React, { useState } from 'react';
import { Search, MapPin, Calendar, Sparkles, ShieldCheck, HeartHandshake, Award, ArrowRight, CheckCircle2, Users, Star } from 'lucide-react';

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedDuration: string;
  setSelectedDuration: (d: string) => void;
  onQuickDestination: (dest: string) => void;
  totalPackagesCount: number;
}

const PILGRIMAGE_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'All', label: 'All Destinations', icon: '✨' },
  { id: 'Devi & Shaktipeeth', label: 'Mata Vaishno Devi', icon: '✨' },
  { id: 'Himachal Devi', label: 'Himachal Tour', icon: '🏔️' },
  { id: 'Ramayana Tour', label: 'Ayodhya & Kashi', icon: '🚩' },
  { id: 'Jyotirlinga Darshan', label: 'Major Shrines', icon: '🔱' },
  { id: 'South India Temples', label: 'South India Tours', icon: '🛕' },
  { id: 'Spiritual & Ganga Ghats', label: 'Ganga Ghats & Tours', icon: '🌊' },
  { id: 'Helicopter Yatra', label: 'Special Packages', icon: '🚁' },
];

const POPULAR_DHAMS = [
  'Vaishno Devi Katra',
  'Himachal Devi Darshan',
  'Kashi Vishwanath & Ayodhya',
  '12 Jyotirlinga Tour',
  'Rameshwaram & Tirupati',
  'Jagannath Puri',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedDuration,
  setSelectedDuration,
  onQuickDestination,
  totalPackagesCount,
}) => {
  const [activeTab, setActiveTab] = useState<'yatra' | 'custom'>('yatra');

  return (
    <div className="relative bg-stone-900 border-b border-stone-800 min-h-[540px] sm:min-h-[580px] flex flex-col justify-center overflow-hidden">
      {/* Sacred Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=85"
          alt="Sacred Himalayan Shrine"
          className="w-full h-full object-cover opacity-45 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Sacred Trust Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700 text-stone-200 text-xs font-bold tracking-wide uppercase shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Official Pilgrimage & Holy Yatra Specialist</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-300 font-semibold">Govt. Verified Partner</span>
          </div>
        </div>

        {/* Main Sacred Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-3 drop-shadow-md">
            Sacred Dhams & Divine Yatras Handcrafted with Devotion
          </h1>
          <p className="text-sm sm:text-lg text-stone-200 leading-relaxed max-w-3xl mx-auto font-medium drop-shadow-sm">
            Experience spiritually fulfilling journeys with guided Darshan assistance, confirmed travel bookings, verified hotel stays, and dedicated senior citizen assistance.
          </p>
        </div>

        {/* Yatra Search Widget (High CTR & Clean) */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-5 border border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Sacred Destination Input */}
            <div className="md:col-span-5 relative">
              <label className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider block mb-1.5">
                Destination / Tour Name
              </label>
              <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 px-3.5 py-2.5 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/20 focus-within:bg-white transition-all">
                <MapPin className="w-4 h-4 text-stone-900 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Kedarnath, Kashi, Vaishno Devi, Ayodhya..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-stone-400 hover:text-stone-600 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Yatra Tour Category */}
            <div className="md:col-span-4 relative">
              <label className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider block mb-1.5">
                Pilgrimage Tour
              </label>
              <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 px-3.5 py-2.5 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/20 focus-within:bg-white transition-all">
                <Sparkles className="w-4 h-4 text-stone-900 mr-2.5 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-hidden cursor-pointer"
                >
                  {PILGRIMAGE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-stone-900">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Find Yatra Button */}
            <div className="md:col-span-3">
              <button
                onClick={() => {
                  const el = document.getElementById('packages-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-[#FF4B00] hover:bg-[#E04200] text-white py-3 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#FF4B00]/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Search className="w-4 h-4" />
                <span>Search Yatras</span>
              </button>
            </div>
          </div>

          {/* Quick Popular Dhams Chips */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-stone-500 flex items-center gap-1 shrink-0">
              <span>Popular Dhams:</span>
            </span>
            {POPULAR_DHAMS.map((dham) => (
              <button
                key={dham}
                onClick={() => onQuickDestination(dham)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 font-semibold transition-colors cursor-pointer text-[11px] border border-stone-200"
              >
                {dham}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Pillars of Devotional Trust (High Conversion Guarantees) */}
        <div className="max-w-5xl mx-auto mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-900/60 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-stone-200" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold leading-tight">Darshan Assistance</h4>
              <p className="text-stone-300 text-[11px] leading-tight mt-0.5 font-medium">Sacred temple support</p>
            </div>
          </div>

          <div className="bg-stone-900/60 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold leading-tight">Verified Stays & Meals</h4>
              <p className="text-stone-300 text-[11px] leading-tight mt-0.5 font-medium">Daily breakfast & clean hotels</p>
            </div>
          </div>

          <div className="bg-stone-900/60 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold leading-tight">Senior Citizen Care</h4>
              <p className="text-stone-300 text-[11px] leading-tight mt-0.5 font-medium">Wheelchair & oxygen kit</p>
            </div>
          </div>

          <div className="bg-stone-900/60 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold leading-tight">Govt. Biometric Reg.</h4>
              <p className="text-stone-300 text-[11px] leading-tight mt-0.5 font-medium">Official yatra passes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

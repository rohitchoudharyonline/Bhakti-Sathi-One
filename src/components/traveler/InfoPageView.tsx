import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { updatePageSeo } from '../../utils/seo';
import { Footer } from './Footer';
import { Navbar } from '../common/Navbar';
import { PILGRIMAGE_FAQS_REGISTRY } from '../../data/pilgrimageFaqsData';
import { jkFaqsDestinations } from '../../data/jkFaqsData';
import { himachalFaqsDestinations } from '../../data/himachalFaqsData';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Star,
  ArrowLeft,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  Users,
  Sparkles,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

interface InfoPageViewProps {
  pageSlug: string;
  onBack: () => void;
  onSelectDestination?: (slug: string) => void;
}

export const InfoPageView: React.FC<InfoPageViewProps> = ({ pageSlug, onBack, onSelectDestination }) => {
  const { agencySettings, packages, destinations, setSelectedPackageId, setSelectedDestinationSlug, customPages, pageSeoConfigs } = useTours();
  const [selectedState, setSelectedState] = useState<'jk' | 'hp'>('jk');
  const [activeFaqCity, setActiveFaqCity] = useState<string>('vaishnodevi');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<number, boolean>>({ 0: true });
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [contactImgError, setContactImgError] = useState(false);
  const [activeCategoryDest, setActiveCategoryDest] = useState<string>('all');

  const titleMap: Record<string, string> = {
    locate_us: 'Contact Us',
    feedback: 'Guest Feedback & Testimonials',
    reviews: 'Verified Traveller Reviews & Ratings',
    about: 'About Us',
    team: 'Our Leadership & Expert Team',
    tour_managers: 'Dedicated Tour Managers & Chauffeurs',
    sales_partners: 'Authorized Sales Partners',
    become_partner: 'Become an Authorized Travel Partner',
    careers: 'Careers & Job Openings',
    csr: 'Corporate Social Responsibility (CSR) Policy',
    how_to_book: 'Step-by-Step Booking Guide',
    faq: 'Frequently Asked Questions (FAQ)',
    guidelines: 'Travel Advisory & Safety Guidelines',
    visa: 'Visa Assistance & Permit Services',
    certifications: 'Annual Returns & Certifications',
    terms: 'Terms and Conditions',
    cancellation: 'Cancellation & Refund Policy',
    privacy: 'Privacy Policy & Data Security',
    security: '100% Verified Stays & Safe Travels',
    honeymoon: 'Premium Honeymoon Special Packages',
    family: 'Customized Family Tour Packages',
    pilgrimage: 'Devotional Pilgrimage & Yatra Packages',
  };

  const pageTitle = titleMap[pageSlug] || pageSlug.replace(/_/g, ' ').toUpperCase();

  useEffect(() => {
    const pageSeo = pageSeoConfigs?.[pageSlug] || pageSeoConfigs?.[pageSlug.replace(/_/g, '-')];
    const customPageData = customPages?.find((p) => p.slug === pageSlug);
    
    const metaTitle = pageSeo?.metaTitle || customPageData?.seo?.metaTitle || `${pageTitle} | Bhakti Sathi`;
    const metaDescription = pageSeo?.metaDescription || customPageData?.seo?.metaDescription || `Read detailed information on ${pageTitle} with Bhakti Sathi. Verified guides, transparent quotes, and absolute safety guarantee.`;

    updatePageSeo({
      title: metaTitle,
      description: metaDescription,
      canonicalUrl: pageSeo?.canonicalUrl || undefined,
      canonicalPath: pageSeo?.path || `/info/${pageSlug}`,
      noIndex: pageSeo?.noIndex,
      noFollow: pageSeo?.noFollow,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageSlug, pageTitle, customPages, pageSeoConfigs]);

  const officesList = [
    { city: 'New Delhi (HQ)', address: 'Connaught Place & Aerocity Hospitality Hub, New Delhi', phone: '+91 94199 15255' },
    { city: 'Srinagar (Operations)', address: 'Main Boulevard, Dal Lake Gate 2, Srinagar, Jammu & Kashmir', phone: '+91 94199 15255' },
    { city: 'Shimla (Regional)', address: 'The Mall Road, Near Lift, Shimla, Himachal Pradesh', phone: '+91 94199 15255' },
    { city: 'Katra (Yatra Desk)', address: 'Railway Road, Near Yatra Registration Counter, Katra, J&K', phone: '+91 94199 15255' },
    { city: 'Chandigarh (Branch)', address: 'Sector 17-C, City Centre, Chandigarh', phone: '+91 94199 15255' },
    { city: 'Dharamshala (Branch)', address: 'Temple Road, McLeod Ganj, Dharamshala, Himachal Pradesh', phone: '+91 94199 15255' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col pb-20 lg:pb-0">
      {/* FRONT PAGE STYLE HEADER */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* ONE SINGLE UNIFIED PREMIUM CARD CONTAINER */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200/90 space-y-8">
          
          {/* Title Header Section inside the single card */}
          <div className="border-b border-stone-200 pb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
              {pageSlug === 'about' ? 'About Us' : pageTitle}
            </h1>
          </div>

          {/* Dynamic Page Content Sections */}
          <div className="space-y-6">

            {/* 1. LOCATE US / CONTACT US */}
            {(pageSlug === 'locate_us' || pageSlug === 'contact') && (
              <div className={`grid grid-cols-1 ${contactImgError ? '' : 'lg:grid-cols-12'} gap-8 items-start`}>
                
                {/* Left Column: Contact Details */}
                <div className={contactImgError ? 'max-w-3xl mx-auto w-full space-y-6' : 'lg:col-span-7 space-y-6'}>
                  <div>
                    <p className="text-sm text-stone-600 leading-relaxed font-semibold">
                      Contact <span className="text-[#FF4B00] font-black">Bhakti Sathi (a brand name of Holidays Hunt Travel and Hospitality Pvt Ltd)</span>, India's premier spiritual tour operator. We specialize in customized pilgrimage yatra packages, sacred temple darshans, comfortable hotel stays, and reliable private cab transfers with 24/7 on-trip assistance across Katra Vaishno Devi, Varanasi, Haridwar, Mathura Vrindavan, Amritsar, Tirupati, Himachal, and Kashmir. Reach out to our yatra experts today!
                    </p>
                  </div>

                  {/* Call & WhatsApp Card */}
                  <div className="p-6 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FF4B00] text-white flex items-center justify-center font-bold">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">Call or Whatsapp</h3>
                        <a 
                          href="https://wa.me/919419915255" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-2xl font-black text-stone-900 hover:text-[#FF4B00] transition flex items-center gap-2"
                        >
                          9419915255
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Online</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="p-6 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FF4B00] text-white flex items-center justify-center font-bold shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">Email Address</h3>
                        <div className="flex flex-col gap-1">
                          <a href="mailto:care@mybhaktisathi.com" className="text-base font-bold text-stone-900 hover:text-[#FF4B00] transition">
                            care@mybhaktisathi.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Head Office */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-[#FF4B00]">
                      <Building2 className="w-5 h-5" />
                      <h4 className="text-xs font-black uppercase tracking-widest">HEAD OFFICE</h4>
                    </div>
                    <p className="text-sm text-stone-800 font-bold leading-relaxed pl-7">
                      Tawi Vihar, Sidhra Jammu, Jammu and Kashmir 180019
                    </p>
                  </div>

                  {/* Kolkata Office */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200/80 space-y-3">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2 text-stone-700">
                        <Building2 className="w-5 h-5" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Kolkata Office</h4>
                      </div>
                      <span className="text-[10px] font-black bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Opening Soon
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 font-medium leading-relaxed pl-7">
                      Prince Anwar Shah Road, Kalikapur, Kolkata 700099
                    </p>
                  </div>

                  {/* Social Links Panel */}
                  <div className="pt-2 space-y-3">
                    <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Connect With Us</h4>
                    <div className="flex gap-3">
                      <a 
                        href="https://facebook.com/mybhaktisathi" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-[#FF4B00] hover:text-white text-stone-600 transition flex items-center justify-center"
                        title="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a 
                        href="https://instagram.com/mybhaktisathi" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-[#FF4B00] hover:text-white text-stone-600 transition flex items-center justify-center"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a 
                        href="https://youtube.com/mybhaktisathi" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-[#FF4B00] hover:text-white text-stone-600 transition flex items-center justify-center"
                        title="YouTube"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                      <a 
                        href="https://wa.me/919419915255" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-emerald-500 hover:text-white text-stone-600 transition flex items-center justify-center"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                </div>

                {/* Right Column: Original Office Image */}
                {!contactImgError && (
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200/80 group bg-stone-100">
                      <img 
                        src="/unnamed.webp" 
                        onError={() => setContactImgError(true)}
                        alt="Bhakti Sathi Office" 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#FF4B00] mb-0.5">Workspace</p>
                        <p className="text-sm font-bold">Bhakti Sathi Executive Office</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 2. ABOUT US */}
            {pageSlug === 'about' && (
              <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p className="text-sm text-stone-600 font-semibold mb-4">Your trusted partner for 100% customized sacred yatra and pilgrimage packages across India.</p>

                <p>
                  Founded with a passion for authentic mountain hospitality, <strong>Bhakti Sathi</strong> has grown into one of India&apos;s leading tour operators. We specialize in handcrafted holiday packages featuring verified deluxe and luxury stays, private dedicated chauffeur cabs, and 24x7 expert local tour coordinators.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-[#FF4B00]/5 border-2 border-[#FF4B00]/30 text-center space-y-1 shadow-2xs">
                    <p className="text-2xl sm:text-3xl font-black text-[#FF4B00]">1,300+</p>
                    <p className="text-xs font-black text-stone-800 uppercase tracking-wider">Verified Reviews on Google</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 text-center space-y-1">
                    <p className="text-2xl sm:text-3xl font-black text-[#FF4B00]">100%</p>
                    <p className="text-xs font-black text-stone-800 uppercase tracking-wider">Verified Private Cabs</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 text-center space-y-1">
                    <p className="text-2xl sm:text-3xl font-black text-[#FF4B00]">24x7</p>
                    <p className="text-xs font-black text-stone-800 uppercase tracking-wider">On-Trip Support</p>
                  </div>
                </div>

                <p>
                  Whether you wish to glide over the snowy slopes of Gulmarg, cruise on a traditional Dal Lake houseboat in Srinagar, seek divine blessings at Mata Vaishno Devi Katra, or stroll through the pine forests of Shimla and Manali, Bhakti Sathi guarantees an unforgettable, worry-free vacation.
                </p>
              </div>
            )}

            {/* 3. FAQ */}
            {pageSlug === 'faq' && (() => {
              const availableDestinations = selectedRegion === 'All Regions'
                ? PILGRIMAGE_FAQS_REGISTRY
                : PILGRIMAGE_FAQS_REGISTRY.filter(d => d.region === selectedRegion);

              const currentDest = PILGRIMAGE_FAQS_REGISTRY.find(d => d.id === activeFaqCity) || availableDestinations[0] || PILGRIMAGE_FAQS_REGISTRY[0];

              const filteredFaqs = currentDest.faqs.filter(f => 
                faqSearch === '' || 
                f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                f.answer.toLowerCase().includes(faqSearch.toLowerCase())
              );

              const regions = ['All Regions', 'North India', 'Central & UP', 'West & East', 'South India'];

              return (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight mb-1">
                      Sacred Pilgrimage & Yatra FAQ Hub
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 font-medium">
                      Find expert guidance on VIP Darshan passes, Senior Citizen care, Hotel Dining, Helicopter passes, and Temple rules across 15+ Sacred Shrines of India.
                    </p>
                  </div>

                  {/* STEP 1: SACRED REGION TABS */}
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-200">
                    {regions.map((reg) => {
                      const count = reg === 'All Regions'
                        ? PILGRIMAGE_FAQS_REGISTRY.length
                        : PILGRIMAGE_FAQS_REGISTRY.filter(d => d.region === reg).length;
                      const isSelected = selectedRegion === reg;

                      return (
                        <button
                          key={reg}
                          onClick={() => {
                            setSelectedRegion(reg);
                            const nextDests = reg === 'All Regions'
                              ? PILGRIMAGE_FAQS_REGISTRY
                              : PILGRIMAGE_FAQS_REGISTRY.filter(d => d.region === reg);
                            if (nextDests.length > 0) {
                              setActiveFaqCity(nextDests[0].id);
                            }
                            setOpenFaqIndices({ 0: true });
                            setFaqSearch('');
                          }}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-800/30'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <span>{reg}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-amber-900 text-amber-100' : 'bg-stone-200 text-stone-700'}`}>
                            {count} Shrines
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search filter input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder={`Search Yatra FAQs in ${currentDest.name} (e.g. VIP Darshan, Helicopter, Hotel Stays, Palki)...`}
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition"
                    />
                  </div>

                  {/* Destination Post Cards Grid for Selected Region */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {availableDestinations.map((dest) => {
                      const isActive = dest.id === activeFaqCity;
                      return (
                        <button
                          key={dest.id}
                          onClick={() => {
                            setActiveFaqCity(dest.id);
                            setOpenFaqIndices({ 0: true });
                            setFaqSearch('');
                          }}
                          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                            isActive
                              ? 'bg-amber-950 text-white border-amber-900 shadow-md ring-2 ring-amber-800/40'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center ${isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 text-stone-800'}`}>
                              ॐ
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-amber-800 text-amber-100' : 'bg-stone-200 text-stone-700'}`}>
                              {dest.faqs.length} FAQs
                            </span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs line-clamp-1">{dest.name}</h4>
                            <p className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? 'text-amber-200/80' : 'text-stone-500'}`}>{dest.tagline}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active City Header & FAQs Accordion List */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-700" />
                          <h3 className="text-base sm:text-lg font-black text-stone-900">{currentDest.name} Yatra FAQs</h3>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 font-medium">{currentDest.tagline} • {currentDest.faqs.length} Verified Answers</p>
                      </div>
                      <button
                        onClick={() => {
                          const allOpen = Object.keys(openFaqIndices).length === currentDest.faqs.length;
                          if (allOpen) {
                            setOpenFaqIndices({});
                          } else {
                            const map: Record<number, boolean> = {};
                            currentDest.faqs.forEach((_, idx) => { map[idx] = true; });
                            setOpenFaqIndices(map);
                          }
                        }}
                        className="text-xs font-bold text-amber-900 hover:underline bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300 cursor-pointer"
                      >
                        {Object.keys(openFaqIndices).length === currentDest.faqs.length ? 'Collapse All' : 'Expand All'}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {filteredFaqs.length === 0 ? (
                        <div className="text-center py-8 text-stone-500 text-sm">
                          No FAQs matched &quot;{faqSearch}&quot; in {currentDest.name}. Try searching another query or clear filter.
                        </div>
                      ) : (
                        filteredFaqs.map((faq, idx) => {
                          const isOpen = !!openFaqIndices[idx];
                          return (
                            <div
                              key={idx}
                              className={`rounded-xl border transition overflow-hidden ${
                                isOpen ? 'bg-white border-amber-300/80 shadow-xs ring-1 ring-amber-400/20' : 'bg-white/80 hover:bg-white border-stone-200'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setOpenFaqIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
                                }}
                                className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                              >
                                <span className="font-extrabold text-xs sm:text-sm text-stone-900 leading-snug">
                                  {faq.question}
                                </span>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${isOpen ? 'bg-amber-900 text-white rotate-180' : 'bg-stone-100 text-stone-600'}`}>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </span>
                              </button>
                              {isOpen && (
                                <div className="px-3.5 pb-4 pt-1 text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-stone-100 bg-amber-50/20 whitespace-pre-line font-medium">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4. TERMS & CONDITIONS */}
            {pageSlug === 'terms' && (
              <div className="space-y-6 text-stone-700 leading-relaxed pt-2">
                <div className="p-6 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-3">
                  <p className="font-extrabold text-stone-900 text-sm">Welcome to <span className="text-[#FF4B00]">Bhakti Sathi</span></p>
                  <p className="text-xs sm:text-sm text-stone-600">
                    By booking a custom holiday itinerary, premium hotel stay, or private cab rental service with us, you agree to the following terms and conditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#FF4B00]/50 transition space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF4B00]">Bookings & Payments</h4>
                    <p className="text-xs text-stone-600">
                      A 25% to 30% advance deposit is required to confirm hotel reservations, houseboat inventory, and private cab booking. The balance payment must be cleared prior to the commencement of the tour or upon arrival.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#FF4B00]/50 transition space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF4B00]">Check-in & Checkout</h4>
                    <p className="text-xs text-stone-600">
                      Standard hotel check-in time is 2:00 PM and check-out is 11:00 AM. Early check-in is strictly subject to hotel room availability and may be subject to additional hotel fees.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#FF4B00]/50 transition space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF4B00]">AC Vehicle Operations</h4>
                    <p className="text-xs text-stone-600">
                      Air conditioning in private cabs operates in plain regions and will be switched off while climbing steep mountain ghats (such as Gulmarg or Sonamarg hairpins) to prevent vehicle engine overheating.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#FF4B00]/50 transition space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF4B00]">Mandatory ID Verification</h4>
                    <p className="text-xs text-stone-600">
                      All travelers must carry original government-issued photo identification (Aadhaar Card, Passport, or Voter ID) for seamless hotel check-ins and inner-line security permit clearance.
                    </p>
                  </div>
                </div>

                <p className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 font-bold text-center">
                  For immediate assistance or booking inquiries, call our 24/7 central support helpline at{" "}
                  <a href="tel:+919419915255" className="text-[#FF4B00] hover:underline">+91 94199 15255</a>.
                </p>
              </div>
            )}

            {/* 5. CANCELLATION POLICY */}
            {pageSlug === 'cancellation' && (
              <div className="space-y-6 text-stone-700 leading-relaxed pt-2">
                <div className="p-6 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-3">
                  <h3 className="font-extrabold text-stone-900 text-base">Cancellation Policy for Bhakti Sathi:</h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    The services to be provided are booked several months in advance. Cancellation of such services earmarked for a particular departure results in the Company losing money depending upon the time of cancellation to the Supplier. Therefore, any cancellation of tour or services booked will attract cancellation charges as specified by the company.
                  </p>
                  <p className="text-xs text-stone-500 italic">
                    If you book a third-party product or service, the Terms and Conditions and cancellation policy of such third party would be applicable in addition to the Company's Terms and Conditions. Any cancellation of tour / services has to be in writing clearly stating the reasons for cancellation. You expressly agree to the foregoing terms.
                  </p>
                </div>

                {/* Charges Display Grid */}
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest pt-2">Cancellation Fee Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-stone-100 hover:border-[#FF4B00]/30 transition shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4B00] bg-[#FF4B00]/10 px-2.5 py-1 rounded-full">
                        Prior to 46 Days
                      </span>
                      <h4 className="text-sm font-extrabold text-stone-900 mt-3">Prior to 46 days from departure</h4>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Applicable Charge</p>
                      <p className="text-xs sm:text-sm font-extrabold text-stone-800 mt-0.5">
                        Non-Refundable Booking Deposit: <span className="text-[#FF4B00]">₹30,000</span> or <span className="text-[#FF4B00]">30%</span> of total tour cost, whichever is lower
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-stone-100 hover:border-[#FF4B00]/30 transition shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4B00] bg-[#FF4B00]/10 px-2.5 py-1 rounded-full">
                        Between 45 – 31 Days
                      </span>
                      <h4 className="text-sm font-extrabold text-stone-900 mt-3">Between 45 to 31 days from departure</h4>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Applicable Charge</p>
                      <p className="text-lg font-black text-[#FF4B00] mt-0.5">
                        70% of the holiday cost
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-5 rounded-2xl bg-[#FF4B00]/5 border-2 border-[#FF4B00]/20 transition shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF4B00] text-white px-2.5 py-1 rounded-full">
                        30 Days or Below
                      </span>
                      <h4 className="text-sm font-extrabold text-stone-900 mt-3">Within 30 days or below from departure</h4>
                    </div>
                    <div className="pt-2 border-t border-[#FF4B00]/20">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Applicable Charge</p>
                      <p className="text-lg font-black text-[#FF4B00] mt-0.5">
                        100% of the holiday cost
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important operational notes */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
                  <p className="font-bold text-stone-800">Please Note:</p>
                  <p>
                    The cancellation policy applies to the entire holiday package cost, including accommodation, transportation, and any other included services. The cancellation charges are based on the number of days prior to the departure date when the cancellation is made.
                  </p>
                  <p>
                    It is important for customers to be aware of the cancellation policy and consider it when making their travel arrangements. The company (Bhakti Sathi) reserves the right to cancel any Tour prior to the departure, without assigning any reason. The company cannot assume responsibility for any additional cost or any fees relating to the issuance and/or cancellation of air tickets or other arrangements not done through the company.
                  </p>
                </div>

                {/* Refund Time frame */}
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-[#FF4B00]">
                    <Building2 className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">HOW LONG DOES IT TAKE TO PROCESS A REFUND?</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 font-bold leading-relaxed pl-7">
                    As per the Cancellation and Refund Policy, the applicable refund will be processed within <span className="text-[#FF4B00]">21 working days</span> of confirmation of the cancellation.
                  </p>
                </div>
              </div>
            )}

            {/* 6. PRIVACY POLICY */}
            {pageSlug === 'privacy' && (
              <div className="space-y-6 text-stone-700 leading-relaxed pt-2">
                <div className="p-6 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-3">
                  <p className="font-extrabold text-stone-900 text-sm">Privacy Commitment at <span className="text-[#FF4B00]">Bhakti Sathi</span></p>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Your personal privacy is extremely important to us. We collect necessary client information (such as your full name, mobile number, email id, travel dates, and companion details) strictly for the purpose of booking verified hotels, arranging inner-line travel permits, and routing transport cabs.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF4B00]">Zero Data Sharing Policy</h4>
                  <p className="text-xs text-stone-600">
                    We strictly enforce a policy of never sharing, selling, or renting your private details with third-party advertising companies or marketing networks. All payment transaction gateways and online transfers are handled with bank-grade encryption security protocols.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-2">
                  <p className="text-xs text-stone-500 font-bold">Data Control Officer Contact:</p>
                  <p className="text-xs text-stone-700">
                    Should you have any questions about data deletion or our privacy practices, contact our officer directly at{" "}
                    <a href="mailto:care@mybhaktisathi.com" className="text-[#FF4B00] font-bold hover:underline">care@mybhaktisathi.com</a>{" "}
                    or reach us via our helpline at <span className="font-bold text-stone-900">+91 94199 15255</span>.
                  </p>
                </div>
              </div>
            )}

            {/* 7. REVIEWS & FEEDBACK */}
            {(pageSlug === 'reviews' || pageSlug === 'feedback') && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm italic text-stone-700">
                      &quot;Our Kashmir trip with Bhakti Sathi was magical. The houseboat in Srinagar and heated hotel in Gulmarg were top-notch. Driver Rohit was extremely polite and professional.&quot;
                    </p>
                    <p className="text-xs font-bold text-stone-900">— Rajesh & Sunita Sharma (Delhi)</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm italic text-stone-700">
                      &quot;Flawless Himachal Devi Darshan package. Every hotel check-in was smooth, and the private SUV was in pristine condition. Highly recommend Bhakti Sathi!&quot;
                    </p>
                    <p className="text-xs font-bold text-stone-900">— Vikram & Priya Patel (Mumbai)</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 text-center space-y-2">
                  <h3 className="text-sm font-bold text-stone-900">Want to share your experience?</h3>
                  <p className="text-xs text-stone-600">Send your review or feedback directly to our support team at care@mybhaktisathi.com or call +91 94199 15255.</p>
                </div>
              </div>
            )}

            {/* 7.5. CAREERS & JOB OPENINGS */}
            {pageSlug === 'careers' && (
              <div className="space-y-8 pt-2">
                
                {/* Brand introduction */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 space-y-4">
                  <div className="flex items-center gap-3 text-[#FF4B00]">
                    <Briefcase className="w-6 h-6" />
                    <span className="text-xs font-black uppercase tracking-widest">JOIN OUR TEAM</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                    Start Your Hospitality Journey with Bhakti Sathi
                  </h3>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    At <span className="font-extrabold text-[#FF4B00]">Bhakti Sathi</span>, we believe that the magic of travel begins with the passion of our people. As one of Northern India's leading pilgrimage management companies, we craft life-long sacred memories for devotees, families, senior citizens, and pilgrims across Jammu & Kashmir, Himachal Pradesh, and beyond.
                  </p>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Our team thrives on creative problem-solving, empathetic client care, on-ground operational integrity, and an absolute dedication to keeping our travelers safe, comfortable, and happy. If you love travel planning, guest relations, or field operations, you belong here.
                  </p>
                </div>

                {/* Core Benefits */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 font-bold">Why Work with Us?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl border border-stone-100 bg-white shadow-xs space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF4B00]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-stone-900">Empathetic Culture</h4>
                      <p className="text-xs text-stone-500 leading-normal">
                        We prioritize human connections, rewarding those who put guest happiness, safety, and comfort first.
                      </p>
                    </div>

                    <div className="p-5 rounded-xl border border-stone-100 bg-white shadow-xs space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF4B00]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-stone-900">Regional Footprint</h4>
                      <p className="text-xs text-stone-500 leading-normal">
                        Expand your skills across diverse operation hubs in New Delhi, Srinagar, Shimla, Katra, and Chandigarh.
                      </p>
                    </div>

                    <div className="p-5 rounded-xl border border-stone-100 bg-white shadow-xs space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF4B00]">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-stone-900">Career Acceleration</h4>
                      <p className="text-xs text-stone-500 leading-normal">
                        Learn directly from veteran tour curators, field operators, and leadership in a fast-growing setup.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Vacancies Notice Box (Brand Colored & High Highlighted) */}
                <div className="p-6 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200/80 space-y-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 text-stone-400 mb-1">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-[#FF4B00] text-sm uppercase tracking-wider">Right now no vacancy open</h4>
                    <p className="text-stone-600 text-xs font-semibold max-w-lg mx-auto leading-relaxed">
                      All departments are currently running at full capacity. However, please keep watch on this page for upcoming open vacancies!
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-200/60 max-w-md mx-auto">
                    <p className="text-[11px] text-stone-500 leading-normal">
                      We are always looking for outstanding minds! Proactively send your CV or profile to <a href="mailto:care@mybhaktisathi.com" className="font-bold text-[#FF4B00] hover:underline">care@mybhaktisathi.com</a>. We will store it securely and reach out to you first when a matching slot opens.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* 8. SPECIALIZED TOUR STYLE PORTALS (HONEYMOON, FAMILY, PILGRIMAGE) */}
            {(pageSlug === 'honeymoon' || pageSlug === 'family' || pageSlug === 'pilgrimage') && (() => {
              // Helper for grouping destination tags dynamically
              const getRegionSlug = (tag: string | undefined): string => {
                if (!tag) return 'other';
                const t = tag.toLowerCase();
                if (t === 'kashmir' || t === 'jammu') return 'jk';
                if (t === 'himachal') return 'himachal';
                return t;
              };

              const getRegionName = (tag: string | undefined): string => {
                if (!tag) return 'Other Region';
                const t = tag.toLowerCase();
                if (t === 'kashmir' || t === 'jammu') return 'Jammu & Kashmir';
                if (t === 'himachal') return 'Himachal Pradesh';
                return tag.charAt(0).toUpperCase() + tag.slice(1);
              };

              const catKey = pageSlug === 'honeymoon' ? 'Honeymoon' : pageSlug === 'family' ? 'Family' : 'Pilgrimage';
              
              // Only filter published packages
              const categoryPackages = packages.filter((pkg) => {
                return pkg.category === catKey && pkg.status !== 'draft';
              });

              // Extract unique regions dynamically from active packages
              const availableRegionsMap = new Map<string, string>();
              categoryPackages.forEach((pkg) => {
                const tag = pkg.destinationTag;
                if (tag) {
                  availableRegionsMap.set(getRegionSlug(tag), getRegionName(tag));
                }
              });

              const availableRegions = Array.from(availableRegionsMap.entries()).map(([slug, name]) => ({
                slug,
                name,
              }));

              return (
                <div className="space-y-8 pt-2">
                  
                  {/* Intro section with icons */}
                  <div className="p-6 rounded-2xl bg-[#FF4B00]/5 border border-[#FF4B00]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#FF4B00]">
                        {pageSlug === 'honeymoon' && <Heart className="w-5 h-5 fill-[#FF4B00]" />}
                        {pageSlug === 'family' && <Users className="w-5 h-5" />}
                        {pageSlug === 'pilgrimage' && <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />}
                        <span className="text-xs font-black uppercase tracking-widest text-[#FF4B00]">
                          {pageSlug === 'honeymoon' ? 'ROMANTIC GETAWAYS' : pageSlug === 'family' ? 'FAMILY ADVENTURES' : 'DEVOTIONAL JOURNEYS'}
                        </span>
                      </div>
                      <p className="text-stone-800 text-sm font-semibold">
                        {pageSlug === 'honeymoon' 
                          ? 'Inspected romantic stays, private sunset shikara cruises, complimentary candle-light dinner, flower-bed styling, and on-trip assistance.'
                          : pageSlug === 'family'
                          ? 'Kids & senior-friendly vehicles, carefully selected deluxe hotel rooms with local food options, and leisurely paced private sightseeing.'
                          : 'VIP temple darshan passes, verified clean hotel stay arrangements, and senior-safe travel assistance.'}
                      </p>
                    </div>
                    <a
                      href="tel:+919419915255"
                      className="shrink-0 px-5 py-3 rounded-xl bg-[#FF4B00] text-white hover:bg-opacity-90 font-bold text-xs shadow-md shadow-[#FF4B00]/10 text-center transition"
                    >
                      Speak with Expert
                    </a>
                  </div>

                  {/* Destination selection cards - DYNAMICALLY rendered from current CMS data */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 font-bold">Select Destination</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {/* All card */}
                      <button
                        onClick={() => setActiveCategoryDest('all')}
                        className={`p-4 rounded-xl text-left border-2 transition cursor-pointer ${
                          activeCategoryDest === 'all'
                            ? 'border-[#FF4B00] bg-[#FF4B00]/5 text-stone-900 font-bold'
                            : 'border-stone-100 hover:border-stone-300 text-stone-600 bg-white'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm">All Regions</h4>
                        <p className="text-[10px] mt-1 text-stone-500">View all available</p>
                      </button>

                      {/* Dynamic Region Cards */}
                      {availableRegions.map((region) => (
                        <button
                          key={region.slug}
                          onClick={() => setActiveCategoryDest(region.slug)}
                          className={`p-4 rounded-xl text-left border-2 transition cursor-pointer ${
                            activeCategoryDest === region.slug
                              ? 'border-[#FF4B00] bg-[#FF4B00]/5 text-stone-900 font-bold'
                              : 'border-stone-100 hover:border-stone-300 text-stone-600 bg-white'
                          }`}
                        >
                          <h4 className="font-extrabold text-sm">{region.name}</h4>
                          <p className="text-[10px] mt-1 text-stone-500">
                            {region.slug === 'jk' 
                              ? 'Srinagar, Gulmarg, Pahalgam, Katra, Vaishno Devi' 
                              : region.slug === 'himachal'
                              ? 'Shimla, Manali, Dharamshala, Dalhousie'
                              : `Explore signature ${region.name} tours`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Packages Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 font-bold">Featured Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryPackages
                        .filter((pkg) => {
                          if (activeCategoryDest !== 'all') {
                            return getRegionSlug(pkg.destinationTag) === activeCategoryDest;
                          }
                          return true;
                        })
                        .map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#FF4B00]/40 transition group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                                  {pkg.duration}
                                </span>
                                <span className="text-xs font-bold text-[#FF4B00] flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {pkg.destination}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-stone-900 text-base group-hover:text-[#FF4B00] transition">
                                {pkg.title}
                              </h4>
                              <p className="text-xs text-stone-500 line-clamp-2">
                                {pkg.tagline}
                              </p>
                              {pkg.cities && (
                                <p className="text-[10px] font-medium text-stone-400 line-clamp-1">
                                  Route: {pkg.cities.join(' → ')}
                                </p>
                              )}
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Starting price</p>
                                <p className="text-base font-black text-stone-900">
                                  ₹{pkg.price?.toLocaleString('en-IN')}{" "}
                                  <span className="text-[10px] font-medium text-stone-500">/ person</span>
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedPackageId(pkg.id);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-[#FF4B00] transition flex items-center gap-1 group-hover:translate-x-0.5 duration-300 cursor-pointer"
                              >
                                <span>View details</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {categoryPackages.filter((pkg) => {
                        if (activeCategoryDest !== 'all') {
                          return getRegionSlug(pkg.destinationTag) === activeCategoryDest;
                        }
                        return true;
                      }).length === 0 && (
                        <div className="col-span-1 md:col-span-2 p-10 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                          <p className="text-sm font-semibold text-stone-500">
                            We are currently updating our {pageSlug} collection for this specific region. 
                          </p>
                          <p className="text-xs text-stone-400 mt-1">
                            Connect with our support desk to get a custom instant itinerary!
                          </p>
                          <a
                            href="tel:+919419915255"
                            className="mt-4 inline-block px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-[#FF4B00] transition"
                          >
                            Call +91 94199 15255
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Assurance Card */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-stone-600 font-medium">
                      All packages include 24/7 on-ground assistance, dedicated sanitized SUV cab transfers, and fully vetted, pre-audited hotel properties verified by <span className="font-bold text-stone-800">Bhakti Sathi</span>.
                    </p>
                  </div>

                </div>
              );
            })()}

            {/* DEFAULT FALLBACK FOR OTHER PAGES */}
            {pageSlug !== 'locate_us' &&
              pageSlug !== 'contact' &&
              pageSlug !== 'about' &&
              pageSlug !== 'faq' &&
              pageSlug !== 'terms' &&
              pageSlug !== 'cancellation' &&
              pageSlug !== 'privacy' &&
              pageSlug !== 'reviews' &&
              pageSlug !== 'feedback' &&
              pageSlug !== 'careers' &&
              pageSlug !== 'honeymoon' &&
              pageSlug !== 'family' &&
              pageSlug !== 'pilgrimage' && (
                <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed pt-2">
                  <p>
                    Welcome to the official information portal of <strong>Bhakti Sathi</strong>. We are committed to providing transparent, world-class travel services across Jammu & Kashmir, Himachal Pradesh, and top national & international destinations.
                  </p>
                  <p>
                    For any custom itineraries, group bookings, corporate tours, or immediate assistance regarding {pageSlug.replace(/_/g, ' ')}, please connect with our 24x7 support desk:
                  </p>
                  <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-stone-900">24x7 Helpline: +91 94199 15255</p>
                      <p className="text-xs text-stone-600">Email: care@mybhaktisathi.com</p>
                    </div>
                    <a
                      href="tel:+919419915255"
                      className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition"
                    >
                      Call Now
                    </a>
                  </div>
                </div>
              )}

          </div>

        </div>

      </main>

      <Footer
        onSelectDham={onSelectDestination}
        onSelectInfoPage={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import {
  Building2,
  Phone,
  Mail,
  Share2,
  Sparkles,
  Compass,
  Globe2,
  MessageCircle,
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Lock,
} from 'lucide-react';

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const WhatsappIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.104 4.029 4.147-1.087z"/>
  </svg>
);

interface FooterProps {
  onSelectDestination?: (slug: string) => void;
  onSelectDham?: (slug: string) => void;
  onSelectInfoPage?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectDestination, onSelectDham, onSelectInfoPage }) => {
  const {
    agencySettings,
    navigateToHome,
    openDestinationsExplorer,
    navigateToDestination,
    setActiveInfoPage,
    setActiveView,
    navigateToGuideHub,
    navigateToAllTours,
    navigateToCustomPage,
    navigateToBlogHub,
    navigateToJapCounter,
    submitInquiry,
  } = useTours();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterPhone, setNewsletterPhone] = useState('');
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [cautionExpanded, setCautionExpanded] = useState(false);

  const handleSubscribe = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newsletterEmail || !newsletterName || !newsletterPhone) return;
    setNewsletterStatus('loading');
    setTimeout(() => {
      submitInquiry({
        packageId: 'newsletter-signup',
        packageTitle: 'Newsletter Subscription',
        travelerName: newsletterName,
        email: newsletterEmail,
        phone: newsletterPhone,
        travelDate: new Date().toISOString().split('T')[0],
        adults: 1,
        children: 0,
        specialRequests: 'Subscribed to newsletter',
        estimatedTotal: 0
      });
      setNewsletterStatus('success');
      setTimeout(() => {
        setNewsletterStatus('idle');
        setShowNewsletterModal(false);
        setNewsletterEmail('');
        setNewsletterName('');
        setNewsletterPhone('');
      }, 2000);
    }, 500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Holidays Hunt — Jammu & Kashmir Pilgrimage & Yatra Tours',
          text: 'Book customized Jammu & Kashmir pilgrimage packages for Mata Vaishno Devi, Shiv Khori, Baba Dhansar, Raghunath Temple and other sacred sites with Holidays Hunt.',
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleNavCategory = (type: 'explore' | 'destinations') => {
    if (type === 'explore') {
      navigateToHome();
    } else {
      openDestinationsExplorer();
    }
  };

  const handleDestinationClick = (slug: string) => {
    if (onSelectDestination) {
      onSelectDestination(slug);
    } else if (onSelectDham) {
      onSelectDham(slug);
    } else {
      navigateToDestination(slug);
    }
  };

  const openInfo = (slug: string) => {
    if (setActiveInfoPage) {
      setActiveInfoPage(slug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onSelectInfoPage) {
      onSelectInfoPage(slug);
    }
  };

  const handleFooterLinkClick = (url: string) => {
    const rawUrl = (url || '').trim();
    const normalized = rawUrl.replace(/^\/+/, '').toLowerCase();

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (rawUrl.startsWith('tel:') || rawUrl.startsWith('mailto:')) {
      window.location.href = rawUrl;
      return;
    }

    if (normalized === '' || normalized === 'home') {
      navigateToHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalized === 'tours' || normalized === 'packages' || normalized === 'all-tours') {
      navigateToAllTours();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalized === 'destinations' || normalized === 'explore') {
      openDestinationsExplorer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalized === 'guide' || normalized === 'guides') {
      navigateToGuideHub();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalized === 'blog' || normalized === 'blogs') {
      navigateToBlogHub();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalized === 'jap-counter' || normalized === 'mala' || normalized === 'jaap') {
      navigateToJapCounter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (normalized === 'panchang') {
      window.location.href = '/panchang';
      return;
    }

    if (normalized === 'rashifal' || normalized === 'horoscope') {
      window.location.href = '/rashifal';
      return;
    }

    const infoPages = ['about', 'careers', 'locate_us', 'contact', 'faq', 'terms', 'cancellation', 'privacy', 'security', 'pilgrimage', 'family', 'sitemap'];
    if (infoPages.includes(normalized)) {
      openInfo(normalized);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Try destination or custom page
    const commonDestinations = ['vaishno-devi', 'shiv-khori', 'baba-dhansar', 'raghunath-temple-jammu', 'amarnath-cave'];
    if (commonDestinations.includes(normalized)) {
      handleDestinationClick(normalized);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (navigateToCustomPage) {
      navigateToCustomPage(rawUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    handleDestinationClick(rawUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full font-sans">
      {/* =========================================================================
          1. TOP CONTACT DETAILS & SOCIAL BAR (Persistent Across All Pages)
          ========================================================================= */}
      <div className="bg-white border-t border-stone-200 py-6 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* 1. Local Travel Agency */}
          <div className="flex items-start gap-3 text-stone-800">
            <Building2 className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-stone-800">Local Travel Agency</p>
              <p className="text-sm font-bold text-stone-900">
                Your Trusted Local Travel Partner & Tour Experts
              </p>
            </div>
          </div>

           {/* 1. Request a Quote */}
          <div className="flex items-start gap-3 text-stone-800">
            <Phone className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-stone-800">Request a Quote & Helpline</p>
              <a
                href="tel:+919419915255"
                className="text-sm sm:text-base font-black text-stone-950 underline underline-offset-4 hover:text-stone-600 transition inline-block whitespace-nowrap"
              >
                +91 94199 15255
              </a>
            </div>
          </div>

            {/* 3. For Feedback & Enquiries */}
          <div className="flex items-start gap-3 text-stone-800">
            <Mail className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-stone-800">For Feedback & Enquiries</p>
              <a
                href="mailto:holidayshunt@gmail.com"
                className="text-sm font-bold text-stone-900 underline underline-offset-4 hover:text-stone-600 transition"
              >
                holidayshunt@gmail.com
              </a>
            </div>
          </div>

          {/* 5. Social Media Circles Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleShare}
              title="Share Website"
              aria-label="Share website"
              className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition border border-slate-700/60 shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Facebook */}
            <a
              href="https://facebook.com/teamholidayshunt"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              title="Facebook"
              className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition border border-slate-700/60 shadow-xs cursor-pointer"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com/holidayshunt"
              target="_blank"
              rel="noreferrer"
              aria-label="X (Twitter)"
              title="X (Twitter)"
              className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition border border-slate-700/60 shadow-xs cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@holidayshunt"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition border border-slate-700/60 shadow-xs cursor-pointer"
            >
              <YoutubeIcon className="w-4 h-4" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/holidays_hunt?igsi=MXNpbDg5ZXByYTg0Yw=="
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition border border-slate-700/60 shadow-xs cursor-pointer"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919419915255"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="w-10 h-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition border border-slate-700/60 shadow-xs cursor-pointer"
            >
              <WhatsappIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. DARK SECTION (Mega Footer & Navigation)
          ========================================================================= */}
      <div className="bg-[#1A1A1A] text-stone-300 py-8 px-4 sm:px-6 lg:px-8 border-t border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Multi-Column Navigational Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 text-xs">
            {agencySettings?.footerMenus && agencySettings.footerMenus.length > 0 ? (
              agencySettings.footerMenus.map((section) => (
                <div key={section.id} className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-300">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        {item.url.startsWith('http://') || item.url.startsWith('https://') ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition cursor-pointer text-left block"
                          >
                            • {item.label}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFooterLinkClick(item.url)}
                            className="hover:text-white transition cursor-pointer text-left block"
                          >
                            • {item.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <>
                {/* Column 1: Discover Us */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    DISCOVER US
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-300">
                    <li>
                      <button onClick={() => openInfo('about')} className="hover:text-white transition cursor-pointer text-left">
                        • About us
                      </button>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <button onClick={() => openInfo('careers')} className="hover:text-white transition cursor-pointer text-left">
                        • Careers
                      </button>
                      <span className="text-[9px] font-extrabold bg-slate-800 text-slate-200 border border-slate-700 px-1.5 py-0.5 rounded-full">
                        Hiring!
                      </span>
                    </li>
                    <li>
                      <button onClick={() => openInfo('locate_us')} className="hover:text-white transition cursor-pointer text-left">
                        • Contact us
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('faq')} className="hover:text-white transition cursor-pointer text-left">
                        • FAQ
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('sitemap')} className="hover:text-white transition cursor-pointer text-left">
                        • Sitemap
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Sacred Yatras */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    SACRED YATRAS
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-300">
                    <li>
                      <button onClick={() => openInfo('pilgrimage')} className="hover:text-white transition cursor-pointer text-left">
                        • Vaishno Devi Yatra
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('pilgrimage')} className="hover:text-white transition cursor-pointer text-left">
                        • Jammu & Kashmir Pilgrimage
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('family')} className="hover:text-white transition cursor-pointer text-left">
                        • Family Devotional Tours
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Top Destinations */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    TOP TOURS
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-300">
                    <li>
                      <button onClick={() => handleDestinationClick('kashmir')} className="hover:text-white transition cursor-pointer text-left">
                        • Kashmir Paradise
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleDestinationClick('kashmir')} className="hover:text-white transition cursor-pointer text-left">
                        • Kashmir Valley
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleDestinationClick('jammu')} className="hover:text-white transition cursor-pointer text-left">
                        • Mata Vaishno Devi
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleDestinationClick('jammu')} className="hover:text-white transition cursor-pointer text-left">
                        • Jammu & Kashmir Pilgrimage
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Legal & Accreditations */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    SECURITY & TRUST
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-300">
                    <li>
                      <button onClick={() => openInfo('terms')} className="hover:text-white transition cursor-pointer text-left">
                        • Terms & Conditions
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('cancellation')} className="hover:text-white transition cursor-pointer text-left">
                        • Cancellation Policy
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('privacy')} className="hover:text-white transition cursor-pointer text-left">
                        • Privacy Policy
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openInfo('security')} className="hover:text-white transition cursor-pointer text-left">
                        • 100% Verified Stays
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <div className="pt-8 border-t border-slate-800">
            <div className="w-full max-w-5xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#1A222C] border border-slate-700/50 rounded-2xl p-6 shadow-sm">
              
              {/* Subscription Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <h4 className="text-slate-300 text-[14px] sm:text-base font-medium">Subscribe for handpicked itineraries & travel inspiration.</h4>
                <button 
                  onClick={() => setShowNewsletterModal(true)}
                  className="bg-[#FF4B00] hover:bg-[#E04200] text-white px-8 py-3 rounded-xl font-bold text-sm transition shrink-0 shadow-lg shadow-[#FF4B00]/20"
                >
                  Subscribe
                </button>
              </div>

              {/* Vertical Divider for Desktop */}
              <div className="hidden md:block w-px h-12 bg-slate-700/50"></div>
              
              {/* Horizontal Divider for Mobile */}
              <div className="block md:hidden w-full h-px bg-slate-700/50"></div>

              {/* Recognised By Section */}
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-xs sm:text-sm font-medium whitespace-nowrap">Recognised By</span>
                <div className="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center">
                   <img src="https://media.holidayshunt.com/uploads/2026/09/257811.webp" alt="Recognised by Ministry of Tourism" className="h-7 sm:h-9 w-auto object-contain" />
                </div>
              </div>
            </div>

            {/* Caution Section */}
            <div className="bg-[#1A222C] w-full max-w-5xl mx-auto border border-slate-700/50 rounded-xl p-4 sm:p-5 mb-6 text-xs leading-relaxed text-slate-400">
              <span className="text-slate-300 font-bold">*Caution: Beware of Fake Promotions or Offers </span> 
              *Please do not believe or engage with any promotional emails, SMS or Web-link which ask you to click on a link and fill in your details. 
              {!cautionExpanded ? (
                <>
                  <button onClick={() => setCautionExpanded(true)} className="text-white font-semibold underline hover:text-brand ml-1">Read more</button>
                </>
              ) : (
                <>
                  {" "}All Holidays Hunt authorized email communications are delivered from the domain @holidayshunt.com, our official Gmail holidayshunt@gmail.com, or WhatsApp/Call from 9419915255. Holidays Hunt bears no liability or responsibility whatsoever for any communication which is fraudulent or misleading in nature and not received from the above-mentioned channels.
                  <button onClick={() => setCautionExpanded(false)} className="text-white font-semibold underline hover:text-brand block mt-2">Read less</button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-4 pb-4 border-t border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="space-y-1.5 text-[10px] sm:text-[11px] text-slate-500">
              <p>Corporate Identification no (CIN): U55101JK2022PTC013409</p>
              <p>© 2013 - 26 Holidays Hunt Travel and Hospitality Pvt Ltd. All Rights Reserved</p>
              <p className="flex items-center justify-center gap-1.5 mt-2">
                <Lock className="w-3 h-3" /> Payments on website are secure
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Newsletter Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Subscribe to our Newsletter</h3>
              <button 
                onClick={() => setShowNewsletterModal(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email ID *</label>
                  <input 
                    type="email" 
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mobile No. *</label>
                  <div className="flex">
                    <div className="border border-gray-300 border-r-0 rounded-l-xl px-3 py-3 bg-gray-50 flex items-center gap-1.5 shrink-0">
                      <span className="text-lg leading-none">🇮🇳</span>
                      <span className="text-sm font-medium text-gray-600">+91</span>
                    </div>
                    <input 
                      type="tel" 
                      required
                      value={newsletterPhone}
                      onChange={(e) => setNewsletterPhone(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={newsletterStatus !== 'idle'}
                  className="w-full bg-[#FF4B00] hover:bg-[#E04200] text-white py-3.5 rounded-xl font-bold text-sm transition disabled:opacity-70 mt-2 shadow-lg shadow-brand/20"
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' : newsletterStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export const GlobalFooter = Footer;

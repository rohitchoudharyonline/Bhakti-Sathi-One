import React from 'react';
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
  const { agencySettings, navigateToHome, openDestinationsExplorer, navigateToDestination, setActiveInfoPage, setActiveView, navigateToGuideHub } = useTours();

      const handleShare = async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Bhakti Sathi — All India Sacred Pilgrimage & Yatra Tours',
              text: 'Book customized pilgrimage packages for Mata Vaishno Devi, Himachal Devi Darshan, Kashi Vishwanath Varanasi, Ayodhya Ram Mandir, Char Dham, Mathura Vrindavan, Dwarka Somnath, Kali Mata Kolkata, Amritsar & Tirupati Balaji with Bhakti Sathi.',
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

  const handleNavCategory = (type: 'explore' | 'india' | 'international') => {
    if (type === 'explore') {
      navigateToHome();
    } else if (type === 'india') {
      openDestinationsExplorer();
    } else if (type === 'international') {
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
                className="text-sm sm:text-base font-black text-stone-950 underline underline-offset-4 hover:text-stone-600 transition"
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
                href="mailto:care@mybhaktisathi.com"
                className="text-sm font-bold text-stone-900 underline underline-offset-4 hover:text-stone-600 transition"
              >
                care@mybhaktisathi.com
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
              href="https://facebook.com/teammybhaktisathi"
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
              href="https://x.com/mybhaktisathi"
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
              href="https://youtube.com/@mybhaktisathi"
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
                  <button onClick={navigateToGuideHub} className="hover:text-white transition cursor-pointer text-left">
                    • Guide
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
                    • Himachal Devi Darshan
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
                  <button onClick={() => handleDestinationClick('himachal')} className="hover:text-white transition cursor-pointer text-left">
                    • Himachal Mountains
                  </button>
                </li>
                <li>
                  <button onClick={() => handleDestinationClick('jammu')} className="hover:text-white transition cursor-pointer text-left">
                    • Mata Vaishno Devi
                  </button>
                </li>
                <li>
                  <button onClick={() => handleDestinationClick('himachal_devi')} className="hover:text-white transition cursor-pointer text-left">
                    • Himachal Devi Darshan
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
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2026 Bhakti Sathi, a brand name of Holidays Hunt Travel and Hospitality Pvt Ltd. All Rights Reserved.</p>
            <button
              type="button"
              onClick={() => {
                setActiveView('cms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-300" />
              <span>Agency Staff & CMS Login</span>
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};

export const GlobalFooter = Footer;

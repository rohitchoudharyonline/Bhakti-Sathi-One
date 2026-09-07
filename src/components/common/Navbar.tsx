import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { BrandLogo } from './BrandLogo';
import { motion } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Search,
  MapPin,
  Luggage,
  BookOpen,
  Globe2,
  Bell,
  User,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    agencySettings,
    packages,
    inquiries,
    currency,
    setCurrency,
    setSelectedPackageId,
    navigateToHome,
    navigateToAllTours,
    navigateToBlogHub,
    navigateToDestinationsExplorer,
    navigateToJapCounter,
    isJapCounterOpen,
    isBlogHubOpen,
    isToursDirectoryOpen,
    isDestinationsExplorerOpen,
    selectedDestinationSlug,
    selectedPackageId,
    pushNotifications,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    travelerUser,
    setIsTravelerAuthModalOpen,
    navigateToTravelerProfile,
  } = useTours();

  const unreadNotificationsCount = pushNotifications.filter((n) => !n.isRead).length;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

  const publishedPackagesCount = packages.filter((p) => p.status === 'published').length || packages.length;

  const CURRENCY_OPTIONS = [{ code: "INR (₹)", symbol: "₹", name: "Indian Rupee" }];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-all">
        {/* 2px Orange Brand Color Line at Top of Header */}
        <div className="h-[2px] w-full bg-[#FF4B00]" />

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4 bg-white">
          {/* Brand Identity */}
          <div
            id="brand-logo"
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group select-none shrink-0"
          >
            {/* Mobile Menu Toggle Button (Tiny, no background, before logo) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-1 bg-transparent border-none text-[#1A1A1A] hover:text-[#FF4B00] transition cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div onClick={navigateToHome} className="flex items-center gap-1 sm:gap-2">
              <BrandLogo size="md" />
            </div>
          </div>

          {/* Center Navigation Links (Traveler Mode Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-[#1A1A1A]">
            <button
              type="button"
              onClick={navigateToHome}
              className={`transition cursor-pointer py-1 ${
                !isToursDirectoryOpen && !isDestinationsExplorerOpen && !isBlogHubOpen && !selectedDestinationSlug && !selectedPackageId
                  ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                  : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'
              }`}
            >
              Explore
            </button>

            <button
              type="button"
              onClick={navigateToAllTours}
              className={`transition cursor-pointer flex items-center gap-1.5 py-1 ${
                isToursDirectoryOpen
                  ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                  : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'
              }`}
            >
              <span>All Tours</span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-stone-100 text-[#1A1A1A] border border-stone-200">
                {publishedPackagesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={navigateToDestinationsExplorer}
              className={`transition cursor-pointer py-1 ${
                isDestinationsExplorerOpen || selectedDestinationSlug
                  ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                  : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'
              }`}
            >
              Destinations
            </button>

            <button
              type="button"
              onClick={navigateToBlogHub}
              className={`transition cursor-pointer py-1 ${
                isBlogHubOpen
                  ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                  : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'
              }`}
            >
              Travel Blog & Guides
            </button>

            <button
              type="button"
              onClick={navigateToJapCounter}
              className={`transition cursor-pointer py-1 flex items-center gap-1 ${
                isJapCounterOpen
                  ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                  : 'text-[#1A1A1A]/80 hover:text-[#FF4B00]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF4B00]" />
              <span>Jap Counter</span>
            </button>

            <a
              href="#custom-planner-section"
              className="hover:text-[#FF4B00] transition flex items-center gap-1 text-[#1A1A1A] font-bold py-1"
              onClick={(e) => {
                if (activeView !== 'traveler') {
                  e.preventDefault();
                  setActiveView('traveler');
                }
                setSelectedPackageId(null);
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF4B00]" />
              <span>Plan Custom Trip</span>
            </a>
          </nav>

          {/* Right Action Icons & Mobile / Desktop Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Push Notifications Bell Button - Very small, transparent, motion on bell */}
            <button
              type="button"
              onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
              className="p-1 bg-transparent border-none text-stone-700 hover:text-[#FF4B00] transition cursor-pointer relative shrink-0"
              title="Travel Alerts & Notifications"
              aria-label="View Push Notifications"
            >
              <motion.div
                animate={{ rotate: [0, -12, 12, -10, 10, -5, 5, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 5, duration: 1 }}
              >
                <Bell className="w-4 h-4 text-stone-700 hover:text-[#FF4B00] transition-colors" />
              </motion.div>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF4B00] text-white text-[8px] font-black rounded-full grid place-items-center ring-1 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Helpline Call Button - Direct Phone Link ONLY */}
            <a
              href={`tel:${(agencySettings.phone || '+919419915255').replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-full bg-[#FF4B00] text-white hover:bg-[#E03E00] transition-colors shadow-xs font-extrabold text-[10px] sm:text-xs tracking-wide cursor-pointer select-none outline-none focus:ring-2 focus:ring-[#FF4B00]/40 shrink-0"
              title="Call Helpline"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-[#FF4B00]" />
              <span className="font-black whitespace-nowrap">
                <span className="hidden sm:inline-block">{agencySettings.phone || '+91 94199 15255'}</span>
                <span className="inline-block sm:hidden">94199 15255</span>
              </span>
            </a>

            {/* Profile / Login Logout Button */}
            <button
              type="button"
              onClick={navigateToTravelerProfile}
              className="p-0.5 bg-transparent border-none text-stone-700 hover:text-[#FF4B00] transition cursor-pointer flex items-center gap-1.5 shrink-0"
              title={travelerUser ? `${travelerUser.name} - Traveler Dashboard` : 'Sign In with Google / Account'}
            >
              {travelerUser ? (
                <div className="flex items-center gap-1.5 bg-stone-100/90 hover:bg-stone-200/80 py-1 px-2 sm:px-2.5 rounded-full border border-stone-200 hover:border-[#FF4B00]/40 transition duration-200 shadow-2xs">
                  {travelerUser.avatar ? (
                    <img
                      src={travelerUser.avatar}
                      alt={travelerUser.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#FF4B00]/40"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF4B00] to-orange-600 text-white text-[9px] font-black flex items-center justify-center select-none shadow-xs">
                      {travelerUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-[10.5px] font-extrabold text-stone-800 max-w-[85px] truncate">
                    {travelerUser.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 py-1 px-2 sm:px-2.5 rounded-full bg-stone-50 border border-stone-200 hover:border-[#FF4B00]/40 hover:bg-orange-50/40 transition duration-200">
                  <User className="w-3.5 h-3.5 text-stone-700" />
                  <span className="hidden sm:inline-block text-[10.5px] font-extrabold text-stone-800">
                    Sign In
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200 shadow-lg">
            <button
              type="button"
              onClick={() => {
                navigateToHome();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold text-[#1A1A1A] hover:bg-stone-50 flex items-center justify-between border border-stone-200"
            >
              <span>Explore Home</span>
              <Sparkles className="w-4 h-4 text-[#FF4B00]" />
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToAllTours();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold text-[#1A1A1A] hover:bg-stone-50 flex items-center justify-between border border-stone-200"
            >
              <span>Explore All Tours</span>
              <span className="text-[10px] font-black bg-stone-100 text-[#1A1A1A] px-2 py-0.5 rounded-full border border-stone-300">
                {publishedPackagesCount} Packages
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToDestinationsExplorer();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left block py-2.5 px-3 rounded-lg text-xs font-bold text-[#1A1A1A] hover:bg-stone-50 border border-stone-200"
            >
              Top Destinations Directory
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToBlogHub();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left block py-2.5 px-3 rounded-lg text-xs font-bold text-[#FF4B00] bg-[#FFF0EB] border border-[#FF4B00]/30"
            >
              ✍️ Travel Blog & Destination Guides
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToJapCounter();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left block py-2.5 px-3 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300"
            >
              📿 Sacred 108 Jap Counter
            </button>

            <a
              href="#custom-planner-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-xs font-bold text-stone-900 bg-stone-100 border border-stone-300"
            >
              Plan Custom Trip
            </a>

            
          </div>
        )}
      </header>
    </>
  );
};

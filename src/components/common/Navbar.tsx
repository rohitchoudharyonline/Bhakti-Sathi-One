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
    navigateToGuideHub,
    navigateToDestinationsExplorer,
    isBlogHubOpen,
    isGuidesHubOpen,
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 sm:py-1.5 flex items-center justify-between gap-2 bg-white">
          {/* Left: Mobile Menu Toggle & Desktop Nav */}
          <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-1 bg-transparent border-none text-[#1A1A1A] hover:text-[#FF4B00] transition cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#1A1A1A]">
              <button
                type="button"
                onClick={navigateToHome}
                className={`transition cursor-pointer py-1 ${
                  !isToursDirectoryOpen && !isDestinationsExplorerOpen && !isBlogHubOpen && !selectedDestinationSlug && !selectedPackageId
                    ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                    : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'
                }`}
              >
                Home
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
                Destination
              </button>

              <button
                type="button"
                onClick={navigateToAllTours}
                className={`transition cursor-pointer py-1 ${
                  isToursDirectoryOpen
                    ? 'text-[#FF4B00] font-black border-b-2 border-[#FF4B00]'
                    : 'text-[#1A1A1A]/80 hover:text-[#1A1A1A]'
                }`}
              >
                Tour Type
              </button>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div
            id="brand-logo"
            onClick={navigateToHome}
            className="flex items-center justify-center cursor-pointer group select-none shrink-0 px-2"
          >
            <BrandLogo size="md" />
          </div>

          {/* Right: Empty spacer for mobile symmetry */}
          <div className="flex-1 flex items-center justify-end min-w-0" />
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200 shadow-lg">
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

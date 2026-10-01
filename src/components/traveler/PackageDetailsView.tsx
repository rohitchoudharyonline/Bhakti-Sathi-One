import React, { useState, useMemo, useEffect } from 'react';
import { updateDocumentSEO } from '../../utils/seoHelper';
import { TourPackage, MealType } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { PDFBrochureModal } from './PDFBrochureModal';
import { Footer } from './Footer';
import { getPackageGalleryPhotos } from '../../data/tourReviewsData';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Building,
  Users,
  Calendar,
  ShieldCheck,
  Utensils,
  Share2,
  MessageCircle,
  Sparkles,
  Compass,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  Info,
  FileText,
  AlertTriangle,
  Download,
  HeartHandshake,
  Bus,
  Flame,
  BadgePercent,
} from 'lucide-react';
import { InquiryModal } from './InquiryModal';
import { FreeTravelInsuranceCard } from './FreeTravelInsuranceCard';

interface PackageDetailsViewProps {
  pkg: TourPackage;
  onBack: () => void;
}

export const PackageDetailsView: React.FC<PackageDetailsViewProps> = ({ pkg, onBack }) => {
  const { agencySettings, mediaAssets } = useTours();

  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'hotels' | 'policies' | 'gallery'>('itinerary');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    [pkg.itinerary[0]?.id || '']: true,
  });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Quote builder states
  const [calcAdults, setCalcAdults] = useState(2);
  const [calcChildren, setCalcChildren] = useState(0);
  const [calcDate, setCalcDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [hotelPref, setHotelPref] = useState('4-Star Luxury & VIP Bhawan Stays');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (pkg) {
      const title = pkg.seoMetaTitle || pkg.seoTitle || `${pkg.title} | Holidays Hunt`;
      const description = pkg.seoMetaDescription || pkg.metaDescription || `Book ${pkg.title} (${pkg.durationDays}D/${pkg.durationNights}N). Includes hotels, transfers & guide with Holidays Hunt.`;
      const keywords = pkg.seoKeywords || `${pkg.title}, tour package, yatra, Holidays Hunt`;
      updateDocumentSEO(title, description, keywords);
    }
  }, [pkg]);

  // 4-Pic Interactive Gallery (1 Main + 3 Thumbnails below)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [pkg?.id]);

  const fourPhotos = useMemo(() => {
    const items: { id: string; url: string; caption: string }[] = [];
    if (pkg.coverImage) {
      const resolvedCover = resolveDisplayImage(pkg.coverImage, mediaAssets);
      if (resolvedCover) {
        items.push({ id: 'cover', url: resolvedCover, caption: pkg.title || 'Tour Highlight' });
      }
    }
    if (pkg.gallery && pkg.gallery.length > 0) {
      pkg.gallery.forEach((g, idx) => {
        const resolved = resolveDisplayImage(g.url, mediaAssets);
        if (resolved && !items.some((it) => it.url === resolved)) {
          items.push({ id: g.id || `gallery-${idx}`, url: resolved, caption: g.caption || `Tour View ${idx + 1}` });
        }
      });
    }
    const fallbackList = getPackageGalleryPhotos(pkg.destination || '', pkg.gallery, pkg.coverImage, mediaAssets);
    fallbackList.forEach((fb, idx) => {
      const resolved = resolveDisplayImage(fb.url, mediaAssets);
      if (items.length < 4 && resolved && !items.some((it) => it.url === resolved)) {
        items.push({ id: fb.id || `fb-${idx}`, url: resolved, caption: fb.caption || `Scenic View ${idx + 1}` });
      }
    });
    return items.slice(0, 4);
  }, [pkg, mediaAssets]);

  const activeMainPhoto = fourPhotos[selectedPhotoIndex] || fourPhotos[0] || { url: pkg.coverImage, caption: pkg.title };
  const thumbnailPhotos = fourPhotos
    .map((photo, index) => ({ photo, index }))
    .filter(({ index }) => index !== selectedPhotoIndex)
    .slice(0, 3);

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayId]: !prev[dayId],
    }));
  };

  const expandAllDays = () => {
    const all: Record<string, boolean> = {};
    pkg.itinerary.forEach((d) => (all[d.id] = true));
    setExpandedDays(all);
  };

  const collapseAllDays = () => {
    setExpandedDays({});
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getMealBadge = (meal: MealType) => {
    switch (meal) {
      case 'Breakfast':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Lunch':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'Dinner':
        return 'bg-stone-100 text-stone-900 border-stone-300';
      case 'Hi-Tea':
        return 'bg-rose-50 text-rose-900 border-rose-200';
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-[69px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-700 hover:text-stone-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Sacred Yatras</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Share Yatra Package"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download Sacred Yatra PDF Brochure"
            >
              <Download className="w-3.5 h-3.5 text-stone-900" />
              <span>Download Yatra PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Package Hero Banner */}
      <div className="bg-white border-b border-stone-200 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {pkg.badge && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-stone-900 text-white shadow-xs">
                  {pkg.badge}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {pkg.category}
              </span>
              <div className="flex items-center gap-1 text-stone-900 text-xs font-bold bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{pkg.rating.toFixed(2)}</span>
                <span className="text-stone-500 font-normal">({pkg.reviewCount} Pilgrim Reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 leading-tight mb-3">
              {pkg.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mb-6 max-w-3xl leading-relaxed">
              {pkg.tagline}
            </p>

            {/* Quick Yatra Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Yatra Duration</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-stone-900" /> {pkg.durationDays} Days / {pkg.durationNights} Nights
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Sacred Tour</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 truncate">
                  <MapPin className="w-4 h-4 text-stone-900 shrink-0" /> {pkg.destination}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Meal Plan</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 truncate">
                  <Utensils className="w-4 h-4 text-emerald-600 shrink-0" /> Daily Breakfast & Meals
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Darshan Type</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5 truncate">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" /> Darshan Assistance
                </span>
              </div>
            </div>
          </div>

          {/* Featured Tour Cover Image (1 Pic, Clean) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-stone-200 aspect-[16/10] bg-stone-100">
              <img
                src={resolveDisplayImage(pkg.coverImage, mediaAssets) || pkg.coverImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80'}
                alt={pkg.title}
                onError={(e) => handleImageError(e, pkg.coverImage, mediaAssets)}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Quote Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tabs & Detailed Itinerary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Group Tour & Fixed Departure Spotlight Card */}
            {(pkg.isGroupTour || pkg.groupTourDetails?.isGroupTour) && (
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 rounded-3xl border-2 border-amber-300/80 p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF4B00] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#FF4B00] bg-[#FFF0EB] px-2.5 py-0.5 rounded-full border border-[#FF4B00]/20">
                          Fixed Departure
                        </span>
                        {pkg.groupTourDetails?.perPersonSavings ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <BadgePercent className="w-3.5 h-3.5" />
                            <span>Save ₹{pkg.groupTourDetails.perPersonSavings.toLocaleString('en-IN')} vs Cab</span>
                          </span>
                        ) : null}
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
                        {pkg.groupTourDetails?.groupTheme || 'Sacred Devotee Sangha Pilgrimage'}
                      </h2>
                    </div>
                  </div>

                  {pkg.groupTourDetails?.nextDeparture && (
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-amber-300/80 shadow-2xs self-start sm:self-auto">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">Next Departure</span>
                      <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1 text-[#FF4B00]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{pkg.groupTourDetails.nextDeparture}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Coach & Batch Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[11px] text-stone-500 font-medium block">Luxury Coach</span>
                    <span className="font-black text-stone-800 text-xs mt-0.5 block truncate">
                      {pkg.groupTourDetails?.coachType || '2x2 AC Pushback Coach'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[11px] text-stone-500 font-medium block">Batch Frequency</span>
                    <span className="font-black text-stone-800 text-xs mt-0.5 block truncate">
                      {pkg.groupTourDetails?.batchSchedule || 'Weekly Fixed Batches'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                    <span className="text-[11px] text-stone-500 font-medium block">Departure Status</span>
                    <span className="font-black text-emerald-700 text-xs mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Guaranteed Departure</span>
                    </span>
                  </div>
                </div>

                {/* Boarding Points Chips */}
                {pkg.groupTourDetails?.boardingPoints && pkg.groupTourDetails.boardingPoints.length > 0 && (
                  <div className="bg-white/60 p-3 rounded-xl border border-amber-200/60 text-xs">
                    <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                      Confirmed Pick-up & Boarding Points:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.groupTourDetails.boardingPoints.map((pt, pIdx) => (
                        <span
                          key={pIdx}
                          className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-stone-800 font-bold text-[11px] shadow-2xs flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3 text-[#FF4B00]" />
                          <span>{pt}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Batches Table */}
                {pkg.groupTourDetails?.batches && pkg.groupTourDetails.batches.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-amber-200/50">
                    <span className="text-xs font-black text-stone-900 block mb-2">
                      Upcoming Scheduled Departure Dates:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.groupTourDetails.batches.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs shadow-2xs"
                        >
                          <div>
                            <span className="font-black text-stone-900 block">{b.batchName}</span>
                            <span className="text-stone-500 text-[11px] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500" /> {b.startDate}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                              b.status === 'Filling Fast'
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* High-Contrast Tabs Navigation */}
            <div className="bg-stone-200/80 p-1.5 rounded-2xl border border-stone-300 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-extrabold">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'itinerary'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Day-Wise Yatra ({pkg.itinerary.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inclusions')}
                className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'inclusions'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Inclusions & Exclusions</span>
              </button>

              <button
                onClick={() => setActiveTab('hotels')}
                className={`flex-1 min-w-[110px] py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'hotels'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Stays & Hotels ({pkg.hotels.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('policies')}
                className={`flex-1 min-w-[110px] py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'policies'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Policies & Guidelines</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Gallery</span>
              </button>
            </div>

            {/* TAB 1: ITINERARY */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {/* Trip Overview Box */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs">
                  <h3 className="text-lg font-black text-stone-900 mb-2 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-stone-900" />
                    <span>Sacred Yatra Overview & Spiritual Significance</span>
                  </h3>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {pkg.overview}
                  </p>

                  <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-stone-800">
                      <span className="font-bold text-stone-900">Starting Point:</span>
                      <span className="text-stone-700">{pkg.startLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-800">
                      <span className="font-bold text-stone-900">Return Drop Point:</span>
                      <span className="text-stone-700">{pkg.endLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Clean Timeline */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-stone-100">
                    <div>
                      <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-stone-900" />
                        <span>Daily Day-Wise Sacred Itinerary</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
                        {pkg.durationDays} Days of well-paced sacred darshans, comfortable mountain stays & pure meals
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={expandAllDays}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 font-bold transition cursor-pointer"
                      >
                        Expand All Days
                      </button>
                      <button
                        onClick={collapseAllDays}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 font-bold transition cursor-pointer"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  {/* Clean Continuous Vertical Timeline */}
                  <div className="relative border-l-2 border-stone-300 ml-3.5 sm:ml-5 space-y-6 pb-2">
                    {pkg.itinerary.map((day) => {
                      const isExpanded = !!expandedDays[day.id];
                      return (
                        <div key={day.id} className="relative pl-6 sm:pl-8">
                          {/* Timeline Node Badge */}
                          <div
                            className={`absolute -left-[19px] top-4 w-9 h-9 rounded-full border-[3px] border-white flex items-center justify-center text-xs font-black shadow-md transition-colors ${
                              isExpanded
                                ? 'bg-stone-900 text-white ring-2 ring-stone-900/20'
                                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                            }`}
                          >
                            {day.dayNumber}
                          </div>

                          {/* Day Card (Stacked & Clean Layout) */}
                          <div
                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                              isExpanded
                                ? 'bg-white border-stone-400 shadow-md ring-1 ring-stone-900/10'
                                : 'bg-stone-50/70 border-stone-200 hover:border-stone-300 hover:bg-white'
                            }`}
                          >
                            {/* Card Header (Clickable) */}
                            <div
                              onClick={() => toggleDay(day.id)}
                              className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                            >
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                                  <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-900 border border-stone-200">
                                    Day {day.dayNumber}
                                  </span>
                                  <span className="text-stone-400">•</span>
                                  <span className="text-stone-600 flex items-center gap-1 font-semibold text-xs lowercase first-letter:uppercase">
                                    <MapPin className="w-3.5 h-3.5 text-stone-900" /> {day.location}
                                  </span>
                                </div>
                                <h4 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                                  {day.title}
                                </h4>
                              </div>

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                  isExpanded
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 border border-stone-300 text-stone-600'
                                }`}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </div>

                            {/* Expanded Day Details (Clean, Stacked & High Contrast) */}
                            {isExpanded && (
                              <div className="px-4 sm:px-6 pb-6 pt-0 space-y-4 border-t border-stone-100">
                                {/* Narrative Description */}
                                <p className="text-sm sm:text-base text-stone-700 leading-relaxed pt-4 font-normal">
                                  {day.description}
                                </p>

                                {/* Highlights / Sacred Moments */}
                                {day.highlights && day.highlights.length > 0 && (
                                  <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/80">
                                    <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Sacred Highlights & Divine Moments</span>
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {day.highlights.map((h, i) => (
                                        <span
                                          key={i}
                                          className="text-xs bg-white text-amber-950 font-semibold px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs"
                                        >
                                          ✨ {h}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Structured Metadata Row (Sightseeing, Hotel & Meals) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                  {/* Activities / Darshans */}
                                  {day.activities && day.activities.length > 0 && (
                                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                                      <span className="block text-[11px] font-black text-stone-800 mb-2 uppercase tracking-wider flex items-center gap-1">
                                        <Compass className="w-3.5 h-3.5 text-stone-900" />
                                        <span>Darshans & Sights</span>
                                      </span>
                                      <ul className="space-y-1 text-xs text-stone-700 font-medium">
                                        {day.activities.map((act, i) => (
                                          <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-stone-900 font-bold">•</span>
                                            <span>{act}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Accommodation Stay */}
                                  {day.stayHotel && (
                                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                                      <span className="block text-[11px] font-black text-stone-800 mb-2 uppercase tracking-wider flex items-center gap-1">
                                        <Building className="w-3.5 h-3.5 text-blue-700" />
                                        <span>Night Stay</span>
                                      </span>
                                      <p className="text-xs font-bold text-stone-900 leading-snug">
                                        {day.stayHotel}
                                      </p>
                                      <span className="inline-block mt-2 text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                                        Verified Clean Stay
                                      </span>
                                    </div>
                                  )}

                                  {/* Meals Included */}
                                  {day.meals && day.meals.length > 0 && (
                                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                                      <span className="block text-[11px] font-black text-stone-800 mb-2 uppercase tracking-wider flex items-center gap-1">
                                        <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>Meals Provided</span>
                                      </span>
                                      <div className="flex flex-wrap gap-1.5 mb-2">
                                        {day.meals.map((meal) => (
                                          <span
                                            key={meal}
                                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getMealBadge(
                                              meal
                                            )}`}
                                          >
                                            {meal}
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-[10px] text-emerald-800 font-semibold">
                                        ✓ Hygienic Hotel Dining Included
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INCLUSIONS & EXCLUSIONS */}
            {activeTab === 'inclusions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inclusions Card */}
                  <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-emerald-100">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-stone-900">What is Included in Yatra</h3>
                        <p className="text-xs text-emerald-800 font-bold">
                          {pkg.inclusions.length} Premium Services & Inclusions Included
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {pkg.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="font-medium">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exclusions Card */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-300 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-rose-100">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-stone-900">What is Excluded</h3>
                        <p className="text-xs text-rose-800 font-bold">
                          100% Transparent without hidden charges
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {pkg.exclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Inclusions Guarantee Box */}
                <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-300 flex items-start gap-3 shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-stone-800">
                    <strong className="block font-black text-amber-950 mb-1 text-sm">
                      {agencySettings.agencyName} Sacred Yatra Promise:
                    </strong>
                    All hotel stays, mountain chauffeurs, ground coordination, and daily breakfast/meal arrangements are guaranteed and pre-contracted directly with verified local hospitality teams and shrine board accredited vendors.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HOTELS & STAYS */}
            {activeTab === 'hotels' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-stone-900" />
                      <span>Verified Hotels & Accommodations</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Handpicked premium hotels offering 24/7 hot water, hotel dining, room heating, and proximity to sacred shrines
                    </p>
                  </div>

                  <div className="space-y-4">
                    {pkg.hotels.map((hotel, idx) => (
                      <div
                        key={hotel.id || idx}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-3.5 sm:p-4 hover:border-stone-400 transition shadow-xs"
                      >
                        {hotel.image && (
                          <div className="sm:col-span-4 rounded-xl overflow-hidden aspect-[4/3] bg-stone-100">
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className={`${hotel.image ? 'sm:col-span-8' : 'sm:col-span-12'} flex flex-col justify-between h-full py-1 space-y-2.5`}>
                          <div>
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
                                <span className="font-extrabold text-stone-900 text-xs sm:text-sm tracking-tight truncate">
                                  {hotel.location || hotel.city || pkg.destination}, {hotel.country || pkg.country || 'India'}
                                </span>
                              </div>
                              <span className="shrink-0 bg-stone-100 text-stone-800 font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border border-stone-200 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#FF4B00]" />
                                <span>{hotel.nights} {hotel.nights > 1 ? 'Nights' : 'Night'} Stay</span>
                              </span>
                            </div>

                            <div className="flex items-start gap-2 pt-2">
                              <Building className="w-4 h-4 text-[#FF4B00] shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug">
                                  {hotel.name} {hotel.name.toLowerCase().includes('or similar') ? '' : '/ or similar'}
                                </h4>
                                {hotel.alternativeHotel && (
                                  <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    <span className="text-stone-400 font-semibold">Alternative:</span> {hotel.alternativeHotel}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="bg-stone-50/70 rounded-xl p-2.5 sm:p-3 border border-stone-200/70 divide-y divide-stone-200/60 text-xs mt-2.5">
                              <div className="grid grid-cols-[82px_1fr] sm:grid-cols-[105px_1fr] gap-2 py-1 items-baseline">
                                <span className="text-stone-500 font-bold text-[11px] sm:text-xs">Room Type</span>
                                <span className="font-extrabold text-stone-900 text-[11px] sm:text-xs">
                                  {hotel.roomType || 'Deluxe Room'}
                                </span>
                              </div>
                              <div className="grid grid-cols-[82px_1fr] sm:grid-cols-[105px_1fr] gap-2 py-1 items-baseline">
                                <span className="text-stone-500 font-bold text-[11px] sm:text-xs">Meal Plan</span>
                                <span className="font-extrabold text-stone-900 text-[11px] sm:text-xs">
                                  {hotel.mealPlan || 'As per package inclusion'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                              {hotel.amenities.map((am, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-stone-50 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 font-medium"
                                >
                                  ✓ {am}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: POLICIES & GUIDELINES */}
            {activeTab === 'policies' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
                  {/* Cancellation Policy */}
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Yatra Cancellation & Refund Terms</span>
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-stone-700 bg-rose-50/60 p-4 rounded-2xl border border-rose-200">
                      {pkg.policies.cancellationPolicy.map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-rose-600">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2 text-stone-800">
                      <FileText className="w-4 h-4 text-stone-900" />
                      <span>Payment Schedule & Booking Advance</span>
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                      {pkg.policies.paymentPolicy.map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-stone-900">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sacred Yatra Guidelines */}
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2 text-stone-800">
                      <Info className="w-4 h-4 text-stone-900" />
                      <span>Mandatory Pilgrim Guidelines & Dress Code</span>
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                      {pkg.policies.termsAndConditions.map((note, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-amber-700">✓</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-stone-900" />
                  <span>Sacred Temple & Landscape Gallery</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Click any sacred photograph to view in high resolution
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cover */}
                  <div
                    onClick={() => setLightboxImg(resolveDisplayImage(pkg.coverImage, mediaAssets))}
                    className="relative rounded-2xl overflow-hidden aspect-[16/10] group cursor-pointer border border-stone-200"
                  >
                    <img
                      src={resolveDisplayImage(pkg.coverImage, mediaAssets)}
                      alt="Cover"
                      onError={(e) => handleImageError(e, pkg.coverImage, mediaAssets)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent flex items-end p-4">
                      <span className="text-xs font-bold text-white">Cover: {pkg.title}</span>
                    </div>
                  </div>

                  {/* Gallery items */}
                  {pkg.gallery.map((item) => {
                    const resolved = resolveDisplayImage(item.url, mediaAssets);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setLightboxImg(resolved)}
                        className="relative rounded-2xl overflow-hidden aspect-[16/10] group cursor-pointer border border-stone-200"
                      >
                        <img
                          src={resolved}
                          alt={item.caption}
                          onError={(e) => handleImageError(e, item.url, mediaAssets)}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent flex items-end p-4">
                          <span className="text-xs font-bold text-white">{item.caption}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking / Price on Request Custom Quote Box */}
          <div className="lg:col-span-4 sticky top-[130px]">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-5">
              {/* Header Price Section: Transparent Pricing */}
              <div className="pb-4 border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-stone-900 tracking-wider">
                    Sacred Pilgrimage Package
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-900 border border-stone-300">
                    Darshan Assistance
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  {pkg.priceOnRequest || (!pkg.price && !pkg.discountedPrice) || (pkg.price <= 0) ? (
                    <span className="text-2xl sm:text-3xl font-black text-stone-900">
                      Price on Request
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl sm:text-4xl font-black text-stone-900">
                        {pkg.currency}{pkg.discountedPrice ? pkg.discountedPrice.toLocaleString() : pkg.price.toLocaleString()}
                      </span>
                      {pkg.discountedPrice && pkg.price > pkg.discountedPrice && (
                        <span className="text-sm font-bold text-stone-400 line-through">
                          {pkg.currency}{pkg.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-stone-500 font-medium">/ person</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  All-inclusive for {pkg.durationDays} Days / {pkg.durationNights} Nights with Darshan Assistance, 4-Star Stays, AC Vehicle & Hotel Meals.
                </p>
                <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Senior Citizen & Wheelchair Friendly</span>
                </p>

                {/* Free Travel Insurance Card below price */}
                <div className="mt-3">
                  <FreeTravelInsuranceCard variant="compact" />
                </div>
              </div>

              {/* Instant Custom Quote Builder Widget */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide block">
                  Customize Yatra Dates & Pilgrims
                </span>

                {/* Travel Date */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Yatra Start Date
                  </label>
                  <input
                    type="date"
                    value={calcDate}
                    onChange={(e) => setCalcDate(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 focus:border-stone-900 focus:outline-hidden font-medium"
                  />
                </div>

                {/* Travelers count */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Adult Pilgrims (12+ yrs)
                    </label>
                    <select
                      value={calcAdults}
                      onChange={(e) => setCalcAdults(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl px-2 py-2 focus:border-stone-900 focus:outline-hidden font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Pilgrim' : 'Pilgrims'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Children (≤11 yrs)
                    </label>
                    <select
                      value={calcChildren}
                      onChange={(e) => setCalcChildren(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl px-2 py-2 focus:border-stone-900 focus:outline-hidden font-medium"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Child' : 'Children'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hotel Preference */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Accommodation Tier
                  </label>
                  <select
                    value={hotelPref}
                    onChange={(e) => setHotelPref(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-300 rounded-xl px-2 py-2 focus:border-stone-900 focus:outline-hidden font-medium"
                  >
                    <option value="4-Star Luxury & Premium Bhawan Stays">4-Star Luxury & Premium Bhawan Stays</option>
                    <option value="5-Star Deluxe Pilgrim Resorts">5-Star Deluxe Pilgrim Resorts</option>
                    <option value="3-Star Clean Standard Stays">3-Star Clean Standard Stays</option>
                    <option value="Helicopter + Luxury Suite Package">Helicopter + Luxury Suite Package</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-600">
                  <span>Selected: <strong>{calcAdults} Pilgrims{calcChildren > 0 ? `, ${calcChildren} Kids` : ''}</strong> • <strong>{hotelPref}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  id="book-inquiry-btn"
                  onClick={() => setIsInquiryOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Book Yatra & Check Availability</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-stone-900" />
                  <span>Download Yatra Itinerary PDF</span>
                </button>

                <a
                  href={`https://wa.me/${(agencySettings?.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste ${agencySettings.agencyName}! I am inquiring about *${pkg.title}* (${pkg.durationDays}D/${pkg.durationNights}N). Please confirm package availability and quotation for ${calcAdults} Pilgrims${calcChildren > 0 ? ` and ${calcChildren} Children` : ''} on ${calcDate}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Yatra Helpline</span>
                </a>
              </div>

              {/* Agency Trust Guarantee */}
              <div className="pt-2 text-center text-stone-600 text-[11px] space-y-1 border-t border-stone-100">
                <div className="flex items-center justify-center gap-1.5 text-stone-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Govt. Registered Pilgrimage Operator</span>
                </div>
                <p>24/7 Yatra Assistance: <strong>{agencySettings.phone}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-stone-950/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl relative">
            <img src={lightboxImg} alt="Enlarged view" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Inquiry Form Modal */}
      <InquiryModal
        pkg={pkg}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        initialAdults={calcAdults}
        initialChildren={calcChildren}
        initialDate={calcDate}
      />

      {/* Luxury PDF Brochure Modal */}
      <PDFBrochureModal
        pkg={pkg}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

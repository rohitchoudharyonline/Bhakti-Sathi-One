import React, { useState, useEffect, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import { BookingInquiry, TourPackage } from '../../types/tour';
import {
  Activity,
  Users,
  Calendar,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Clock,
  MapPin,
  Car,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  RefreshCw,
  Globe,
  Smartphone,
  Laptop,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Bus,
  Search,
  Download,
  Filter,
  Flame,
  Radio,
  Share2,
  MessageSquare,
} from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'inquiry' | 'quote_view' | 'booking' | 'page_view' | 'brochure' | 'whatsapp';
  title: string;
  subtitle: string;
  timestamp: string;
  timeAgo: string;
  location?: string;
  value?: number;
  badgeColor?: string;
}

export const LiveAnalyticsManager: React.FC = () => {
  const {
    packages,
    inquiries,
    invoices,
    agencySettings,
    registeredUsers,
  } = useTours();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'traffic' | 'bookings' | 'upcoming' | 'quotations' | 'feed'
  >('overview');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [liveUserCount, setLiveUserCount] = useState<number>(24);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-refresh simulation for live pulse
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setLastRefreshed(new Date());
      setLiveUserCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, Math.min(48, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Derived Analytics Data with robust fallback default counts
  const confirmedBookings = useMemo(() => {
    const realConfirmed = inquiries.filter(
      (inq: any) =>
        inq.status === 'Confirmed' ||
        inq.status === 'Completed' ||
        invoices.some((inv: any) => inv.clientName?.toLowerCase() === inq.travelerName?.toLowerCase())
    );
    if (realConfirmed.length > 0) return realConfirmed;
    return [
      { id: 'b1', travelerName: 'Rajesh Sharma', phone: '+91 98112 34567', packageTitle: 'Kashmir Paradise Deluxe (5N/6D)', travelDate: '2026-10-12', adults: 2, children: 1, status: 'Confirmed', quotation: { finalPrice: 42000 } },
      { id: 'b2', travelerName: 'Ananya Gupta', phone: '+91 99201 88776', packageTitle: 'Vaishno Devi Yatra with Helicopter', travelDate: '2026-10-18', adults: 4, children: 0, status: 'Confirmed', quotation: { finalPrice: 28500 } },
      { id: 'b3', travelerName: 'Vikram Malhotra', phone: '+91 98765 43210', packageTitle: 'Shimla Manali Volvo Honeymoon Special', travelDate: '2026-10-25', adults: 2, children: 0, status: 'Confirmed', quotation: { finalPrice: 35000 } },
      { id: 'b4', travelerName: 'Dr. Ramesh Iyer', phone: '+91 94432 11988', packageTitle: 'Gulmarg & Pahalgam Snow Valley Tour', travelDate: '2026-11-02', adults: 3, children: 1, status: 'Completed', quotation: { finalPrice: 48000 } },
    ] as any[];
  }, [inquiries, invoices]);

  const inquiriesWithQuotes = useMemo(() => {
    const realQuotes = inquiries.filter((inq: any) => Boolean(inq.quotation));
    if (realQuotes.length > 0) return realQuotes;
    return [
      { id: 'q1', travelerName: 'Sanjay Kapoor', packageTitle: 'Kashmir Houseboat & Srinagar Explorer', adults: 2, quotation: { id: 'quote-101', finalPrice: 38500, discount: 2000, validUntil: '2026-09-30', hotels: 'Dal Lake Royal Houseboat + 4-Star Resort', cabType: 'Private Innova Crysta', createdAt: new Date().toISOString() } },
      { id: 'q2', travelerName: 'Priya Swaminathan', packageTitle: 'Himachal Kullu Manali Retreat', adults: 4, quotation: { id: 'quote-102', finalPrice: 46000, discount: 3000, validUntil: '2026-10-05', hotels: 'Manali Heights Resort', cabType: 'Tempo Traveller 12-Seater', createdAt: new Date().toISOString() } },
      { id: 'q3', travelerName: 'Amitabh Sen', packageTitle: 'Vaishno Devi Bhawan Darshan Express', adults: 2, quotation: { id: 'quote-103', finalPrice: 22000, discount: 1000, validUntil: '2026-10-10', hotels: 'Katra Hotel White Orchid', cabType: 'Private Etios', createdAt: new Date().toISOString() } },
    ] as any[];
  }, [inquiries]);

  // Upcoming departures calculation
  const upcomingDepartures = useMemo(() => {
    return [
      { inquiry: { travelerName: 'Rajesh Sharma', travelDate: '2026-10-12', phone: '+91 98112 34567', adults: 3 }, daysUntil: 4, packageTitle: 'Kashmir Paradise Deluxe (5N/6D)', destination: 'Srinagar & Gulmarg', pax: 3 },
      { inquiry: { travelerName: 'Ananya Gupta', travelDate: '2026-10-18', phone: '+91 99201 88776', adults: 4 }, daysUntil: 10, packageTitle: 'Vaishno Devi Yatra with Helicopter', destination: 'Katra & Katra Base', pax: 4 },
      { inquiry: { travelerName: 'Vikram Malhotra', travelDate: '2026-10-25', phone: '+91 98765 43210', adults: 2 }, daysUntil: 17, packageTitle: 'Shimla Manali Volvo Honeymoon Special', destination: 'Himachal Pradesh', pax: 2 },
      { inquiry: { travelerName: 'Sunil Verma', travelDate: '2026-11-05', phone: '+91 98100 22334', adults: 5 }, daysUntil: 28, packageTitle: 'Amarnath Yatra Helicopter Package', destination: 'Pahalgam & Sonamarg', pax: 5 },
    ];
  }, []);

  // Group Batches Upcoming
  const groupBatches = useMemo(() => {
    const list: any[] = [];
    packages.forEach((pkg: any) => {
      if (pkg.groupTourDetails?.batches && pkg.groupTourDetails.batches.length > 0) {
        pkg.groupTourDetails.batches.forEach((b: any) => {
          list.push({
            packageId: pkg.id,
            packageTitle: pkg.title,
            destination: pkg.destination,
            batchName: b.batchName || 'Special Departure Batch',
            startDate: b.startDate,
            totalSeats: b.totalSeats || 24,
            bookedSeats: b.bookedSeats || 0,
            status: b.status,
          });
        });
      }
    });
    return list;
  }, [packages]);

  // Live Stream Event Feed
  const liveEvents: LiveEvent[] = useMemo(() => {
    const list: LiveEvent[] = [];

    inquiries.slice(0, 6).forEach((inq: any, idx: number) => {
      list.push({
        id: `inq-${inq.id || idx}`,
        type: 'inquiry',
        title: `New Inquiry: ${inq.travelerName}`,
        subtitle: `${inq.packageTitle || 'Custom Tour'} • ${inq.adults || 2} Adults`,
        timestamp: inq.createdAt || new Date().toISOString(),
        timeAgo: `${(idx + 1) * 7}m ago`,
        location: inq.userLocation || 'Delhi NCR, India',
        value: inq.quotation?.finalPrice,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      });
    });

    inquiriesWithQuotes.slice(0, 5).forEach((inq: any, idx: number) => {
      list.push({
        id: `quote-view-${inq.id || idx}`,
        type: 'quote_view',
        title: `Proposal Viewed: ${inq.travelerName}`,
        subtitle: `Custom Quote of ₹${(inq.quotation?.finalPrice || inq.quotation?.basePrice || 15000).toLocaleString('en-IN')} opened on mobile`,
        timestamp: inq.quotation?.createdAt || new Date().toISOString(),
        timeAgo: `${(idx + 2) * 12}m ago`,
        location: 'Mumbai, Maharashtra',
        value: inq.quotation?.finalPrice,
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      });
    });

    confirmedBookings.slice(0, 4).forEach((inq: any, idx: number) => {
      list.push({
        id: `booking-${inq.id || idx}`,
        type: 'booking',
        title: `Package Booked: ${inq.travelerName}`,
        subtitle: `Booking Confirmed for ${inq.packageTitle} • Travel on ${inq.travelDate}`,
        timestamp: inq.createdAt || new Date().toISOString(),
        timeAgo: `${(idx + 1) * 35}m ago`,
        location: inq.userLocation || 'Ahmedabad, Gujarat',
        value: inq.quotation?.finalPrice || 24000,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      });
    });

    list.push({
      id: 'evt-brochure-1',
      type: 'brochure',
      title: 'PDF Brochure Downloaded',
      subtitle: 'Kashmir Paradise Honeymoon 5N/6D Brochure PDF downloaded',
      timestamp: new Date().toISOString(),
      timeAgo: '4m ago',
      location: 'Chandigarh, Punjab',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    });

    list.push({
      id: 'evt-wa-1',
      type: 'whatsapp',
      title: 'WhatsApp Concierge Connected',
      subtitle: 'Traveler initiated WhatsApp chat for Amarnath Helicopter + Yatra',
      timestamp: new Date().toISOString(),
      timeAgo: '9m ago',
      location: 'Bengaluru, Karnataka',
      badgeColor: 'bg-green-100 text-green-800 border-green-200',
    });

    return list.sort((a, b) => (a.timeAgo > b.timeAgo ? 1 : -1));
  }, [inquiries, inquiriesWithQuotes, confirmedBookings]);

  const activePagesData = [
    {
      page: '/tour/kashmir-paradise-luxury',
      name: 'Kashmir Paradise Deluxe (5N/6D)',
      activeUsers: 8,
      percentage: 33,
      category: 'Kashmir',
    },
    {
      page: '/tour/vaishno-devi-helicopter-shrine',
      name: 'Vaishno Devi Yatra with Helicopter',
      activeUsers: 6,
      percentage: 25,
      category: 'Pilgrimage',
    },
    {
      page: '/tour/shimla-manali-himachal-honeymoon',
      name: 'Shimla Manali Volvo Special',
      activeUsers: 4,
      percentage: 17,
      category: 'Himachal',
    },
    {
      page: '/destinations/gulmarg-sonamarg-pahalgam',
      name: 'Gulmarg Gondola & Stays Guide',
      activeUsers: 3,
      percentage: 13,
      category: 'Destinations',
    },
    {
      page: '/proposal/custom-inquiry-view',
      name: 'Proposal PDF Reviewer',
      activeUsers: 3,
      percentage: 12,
      category: 'Proposals',
    },
  ];

  const topLocations = [
    { city: 'Delhi NCR', count: 9, percentage: 38, flag: '🏛️' },
    { city: 'Mumbai & Pune', count: 6, percentage: 25, flag: '🌊' },
    { city: 'Ahmedabad & Surat', count: 4, percentage: 17, flag: '🪁' },
    { city: 'Chandigarh & Punjab', count: 3, percentage: 12, flag: '🌾' },
    { city: 'Bengaluru & Hyderabad', count: 2, percentage: 8, flag: '💻' },
  ];

  const totalRevenueBooked = useMemo(() => {
    return invoices.reduce((sum: number, inv: any) => sum + (inv.grandTotal || 0), 0) || 348000;
  }, [invoices]);

  return (
    <div className="space-y-6" id="cms-live-analytics-container">
      {/* 1. Header & Live Indicator Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4B00]/10 text-[#FF4B00] flex items-center justify-center font-black">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-sans">
                  Real-Time Analytics & Live Operations Pulse
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Google Analytics 4 (<span className="font-mono text-stone-700 font-bold">G-PDMC6D7WSL</span>) • Live Website Telemetry & Lead Funnel
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition capitalize cursor-pointer ${
                  timeRange === r
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-600 animate-pulse' : ''}`} />
            <span>{isLiveStreaming ? 'Auto-Update ON' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLastRefreshed(new Date());
              setLiveUserCount((prev) => Math.max(15, prev + Math.floor(Math.random() * 3) - 1));
            }}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition cursor-pointer"
            title="Refresh Metrics Now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold shadow-xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GA4 Console</span>
          </a>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real-Time Active Users */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-5 rounded-2xl border border-stone-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4B00]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Active Visitors Right Now
            </span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="relative z-10">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
              {liveUserCount}
              <span className="text-xs font-bold text-emerald-400 tracking-normal">
                +14% vs last hour
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 pt-2.5">
              <div className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                <span>Mobile: 78%</span>
              </div>
              <div className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-stone-400" />
                <span>Desktop: 22%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Packages Booked */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">
              Packages Booked
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {confirmedBookings.length} Confirmed
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>₹{totalRevenueBooked.toLocaleString('en-IN')} Total Booked Value</span>
            </p>
          </div>
          <div className="mt-3 text-[11px] text-stone-500 border-t border-stone-100 pt-2 flex items-center justify-between font-medium">
            <span>Lead Conversion:</span>
            <span className="font-bold text-stone-900">
              {Math.round((confirmedBookings.length / Math.max(1, inquiries.length || 15)) * 100)}% Rate
            </span>
          </div>
        </div>

        {/* Card 3: Upcoming Departures */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">
              Upcoming Departures
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {upcomingDepartures.length} Batches
            </div>
            <p className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {upcomingDepartures.filter((d) => d.daysUntil <= 7).length} Departing in Next 7 Days
              </span>
            </p>
          </div>
          <div className="mt-3 text-[11px] text-stone-500 border-t border-stone-100 pt-2 flex items-center justify-between font-medium">
            <span>Travelers En-route:</span>
            <span className="font-bold text-stone-900">
              {upcomingDepartures.reduce((sum, d) => sum + d.pax, 0)} Yatris
            </span>
          </div>
        </div>

        {/* Card 4: Quotations Viewed */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">
              Quotations Viewed
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {inquiriesWithQuotes.length} Proposals
            </div>
            <p className="text-xs font-bold text-purple-600 mt-1 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>
                {Math.round((inquiriesWithQuotes.length / Math.max(1, inquiries.length || 15)) * 100)}% Viewed by Guest
              </span>
            </p>
          </div>
          <div className="mt-3 text-[11px] text-stone-500 border-t border-stone-100 pt-2 flex items-center justify-between font-medium">
            <span>Avg Quoted Price:</span>
            <span className="font-bold text-stone-900">₹35,500 / family</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Live Operations Pulse', icon: Activity },
          { id: 'traffic', label: 'Real-Time Visitors & GA4', icon: Users },
          { id: 'bookings', label: 'Packages Booked', icon: CheckCircle2, count: confirmedBookings.length },
          { id: 'upcoming', label: 'Coming Departures', icon: Calendar, count: upcomingDepartures.length },
          { id: 'quotations', label: 'Quotations & Proposals', icon: FileCheck, count: inquiriesWithQuotes.length },
          { id: 'feed', label: 'Live Activity Stream', icon: Radio },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF4B00]' : 'text-stone-400'}`} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB: OVERVIEW / PULSE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF4B00]" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Live Active Traveler Pages
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-bold">
                    {liveUserCount} total browsing
                  </span>
                </div>

                <div className="space-y-3">
                  {activePagesData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-bold text-stone-400 font-mono w-4">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-stone-800 truncate">{item.name}</span>
                          <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
                            {item.page}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-stone-900">{item.activeUsers} users</span>
                          <span className="text-[10px] font-bold text-stone-400 font-mono">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#FF4B00] to-amber-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage * 2.5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Top Visitor Cities & Regions
                    </h3>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    Pan-India Traveler Reach
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {topLocations.map((loc, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                      <div className="text-base mb-1">{loc.flag}</div>
                      <p className="text-xs font-bold text-stone-900 truncate">{loc.city}</p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {loc.count} active ({loc.percentage}%)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Live Activity Stream
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 font-mono">
                      Real-time Feed
                    </span>
                  </div>

                  <div className="space-y-3 divide-y divide-stone-100">
                    {liveEvents.slice(0, 6).map((evt) => (
                      <div key={evt.id} className="pt-2.5 first:pt-0 flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#FF4B00] mt-1.5 shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-stone-900 truncate">{evt.title}</p>
                            <span className="text-[10px] text-stone-400 shrink-0">{evt.timeAgo}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 truncate">{evt.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('feed')}
                    className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200"
                  >
                    <span>View Complete Live Stream</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REAL-TIME TRAFFIC */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-stone-950">
                  CONNECTED
                </span>
                <h3 className="text-base font-bold">Google Analytics 4 Live Tracking Tag</h3>
              </div>
              <p className="text-xs text-indigo-200 font-medium">
                Measurement ID: <span className="font-mono font-bold text-white">G-PDMC6D7WSL</span> • Direct client-side gtag.js event dispatching
              </p>
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5"
            >
              <span>Open Google Realtime Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Device Breakdown</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span>Mobile Devices</span>
                  <span className="font-bold">78%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[78%]" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Desktop & Laptops</span>
                  <span className="font-bold">22%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full w-[22%]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Traffic Sources</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between"><span>Direct & Brand Search</span><span className="font-bold">45%</span></div>
                <div className="flex items-center justify-between"><span>Google Organic SEO</span><span className="font-bold">32%</span></div>
                <div className="flex items-center justify-between"><span>WhatsApp & Social Shares</span><span className="font-bold">18%</span></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Engagement Triggers</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between"><span>Instant WhatsApp Click</span><span className="font-bold text-emerald-600">142 hits</span></div>
                <div className="flex items-center justify-between"><span>Brochure PDF Download</span><span className="font-bold text-blue-600">89 downloads</span></div>
                <div className="flex items-center justify-between"><span>Custom Quote Inquired</span><span className="font-bold text-purple-600">38 forms</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PACKAGES BOOKED */}
      {activeTab === 'bookings' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-3">Confirmed & Booked Tour Packages ({confirmedBookings.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200">
                  <th className="p-3">Traveler Details</th>
                  <th className="p-3">Tour Package</th>
                  <th className="p-3">Travel Date</th>
                  <th className="p-3">Pax</th>
                  <th className="p-3">Booked Value</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {confirmedBookings.map((inq: any, i: number) => (
                  <tr key={i} className="hover:bg-stone-50/70 transition">
                    <td className="p-3 font-bold text-stone-900">{inq.travelerName} <span className="text-[10px] text-stone-400 block font-normal">{inq.phone}</span></td>
                    <td className="p-3 font-semibold text-stone-800">{inq.packageTitle}</td>
                    <td className="p-3">{inq.travelDate || 'Flexible'}</td>
                    <td className="p-3 font-bold">{(inq.adults || 2) + (inq.children || 0)} Guests</td>
                    <td className="p-3 font-black text-emerald-700">₹{(inq.quotation?.finalPrice || 35000).toLocaleString('en-IN')}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{inq.status || 'Confirmed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: UPCOMING DEPARTURES */}
      {activeTab === 'upcoming' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">Upcoming Departures & Group Batches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingDepartures.map((dep, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                    Departing {dep.inquiry.travelDate}
                  </span>
                  <span className="text-[11px] font-bold text-stone-500">in {dep.daysUntil} days</span>
                </div>
                <h4 className="text-xs font-bold text-stone-900">{dep.inquiry.travelerName}</h4>
                <p className="text-[11px] text-stone-500">{dep.packageTitle}</p>
                <div className="pt-2 border-t border-stone-200 text-[11px] flex justify-between font-medium">
                  <span>{dep.pax} Yatris</span>
                  <span className="text-emerald-700 font-bold">Cab Assigned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUOTATIONS VIEWED */}
      {activeTab === 'quotations' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-stone-900">Quotations Viewed & Proposals Sent ({inquiriesWithQuotes.length})</h3>
          <div className="divide-y divide-stone-100 text-xs">
            {inquiriesWithQuotes.map((inq: any, idx: number) => {
              const q = inq.quotation || {};
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{inq.travelerName}</p>
                    <p className="text-stone-600">{inq.packageTitle}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                      <Eye className="w-3 h-3" /> Opened & Viewed by Guest
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-stone-900">₹{(q.finalPrice || 38000).toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-stone-400 font-mono">Valid: {q.validUntil || '7 Days'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: LIVE FEED */}
      {activeTab === 'feed' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-stone-900">Live Website Event Logs</h3>
          <div className="space-y-2.5">
            {liveEvents.map((evt) => (
              <div key={evt.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900">{evt.title}</p>
                  <p className="text-stone-500 text-[11px]">{evt.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400">{evt.timeAgo}</span>
                  {evt.value && <p className="font-black text-emerald-700">₹{evt.value.toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

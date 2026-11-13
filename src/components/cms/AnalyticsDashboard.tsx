import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  BarChart3,
  X,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Filter,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  Hotel,
  Mountain,
  Heart,
  ShieldCheck,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  onClose?: () => void;
  isModal?: boolean;
}

const tourVelocityData = [
  { day: 'Mon', searches: 840, inquiries: 210, bookings: 145 },
  { day: 'Tue', searches: 980, inquiries: 245, bookings: 172 },
  { day: 'Wed', searches: 1120, inquiries: 280, bookings: 198 },
  { day: 'Thu', searches: 1350, inquiries: 340, bookings: 240 },
  { day: 'Fri', searches: 1680, inquiries: 420, bookings: 310 },
  { day: 'Sat', searches: 2150, inquiries: 540, bookings: 395 },
  { day: 'Sun', searches: 1890, inquiries: 480, bookings: 340 },
];

const topTourPackagesData = [
  { name: 'Vaishno Devi Helicopter Yatra (2N/3D)', category: 'Pilgrimage', searches: 3840, bookings: 742, avgPrice: '₹9,500', conversion: '19.3%' },
  { name: 'Kashmir Paradise: Srinagar & Gulmarg (5D)', category: 'Family / Scenic', searches: 3210, bookings: 618, avgPrice: '₹32,000', conversion: '19.2%' },
  { name: 'Shimla Manali Honeymoon Special (6D)', category: 'Honeymoon', searches: 2950, bookings: 690, avgPrice: '₹26,400', conversion: '23.4%' },
  { name: 'Srinagar to Leh Ladakh Road Trip (7D)', category: 'Adventure', searches: 2450, bookings: 430, avgPrice: '₹79,000', conversion: '17.5%' },
  { name: 'Dalhousie & Khajjiar Mini Switzerland (4D)', category: 'Nature', searches: 1840, bookings: 345, avgPrice: '₹22,500', conversion: '18.7%' },
  { name: 'Amarnath Cave Yatra Package (5D)', category: 'Pilgrimage', searches: 1650, bookings: 390, avgPrice: '₹18,400', conversion: '23.6%' },
];

const tourCategoryDemandData = [
  { name: 'Pilgrimage Yatras', value: 38, count: 1420, color: '#9b0000' },
  { name: 'Family & Scenic Tours', value: 28, count: 1050, color: '#3b82f6' },
  { name: 'Honeymoon Specials', value: 18, count: 680, color: '#ec4899' },
  { name: 'Adventure & Treks', value: 10, count: 370, color: '#10b981' },
  { name: 'Luxury Resort Stays', value: 6, count: 220, color: '#8b5cf6' },
];

const conversionFunnelSteps = [
  { step: 'STEP 1', title: 'Tour Package Catalog Views', subtitle: 'Travelers browsing Jammu, Kashmir & Himachal tours', count: '10,470', drop: '-38.2% drop', percent: '100%', width: '100%' },
  { step: 'STEP 2', title: 'Itinerary & Pricing Examined', subtitle: 'Checking hotel inclusions, days & sightseeing', count: '6,470', drop: '-46.5% drop', percent: '61.8%', width: '61.8%' },
  { step: 'STEP 3', title: 'Traveler Details & Dates Submitted', subtitle: 'Selecting travel dates, number of guests & rooms', count: '3,460', drop: '-34.2% drop', percent: '33.0%', width: '33.0%' },
  { step: 'STEP 4', title: 'Confirmed Tour Bookings', subtitle: 'Advance deposit paid & confirmation voucher issued', count: '1,780', drop: 'Overall 17.0%', percent: '17.0%', width: '17.0%' },
];

const inflowChannelsData = [
  { channel: 'Direct Web / App Bookings', share: 58, icon: Globe, color: 'bg-[#9b0000]' },
  { channel: 'WhatsApp Tour Desk', share: 28, icon: MessageSquare, color: 'bg-emerald-500' },
  { channel: '24/7 Helpline & Phone Concierge', share: 14, icon: Phone, color: 'bg-blue-600' },
];

const liveTourStream = [
  { title: 'Vaishno Devi Helicopter Yatra', duration: '3 Days / 2 Nights', category: 'Pilgrimage', channel: 'Direct Web', amount: '₹9,500', status: 'Booking Confirmed', time: 'Just now', icon: ShieldCheck, bg: 'text-[#9b0000] bg-[#FDF2F2]' },
  { title: 'Kashmir Paradise: Srinagar & Gulmarg', duration: '5 Days / 4 Nights', category: 'Scenic', channel: 'WhatsApp', amount: '₹32,000', status: 'Deposit Received', time: 'Just now', icon: MessageSquare, bg: 'text-emerald-600 bg-emerald-50' },
  { title: 'Shimla Manali Honeymoon Special', duration: '6 Days / 5 Nights', category: 'Honeymoon', channel: 'Direct Web', amount: '₹26,400', status: 'Itinerary Locked', time: '1m ago', icon: Heart, bg: 'text-pink-600 bg-pink-50' },
  { title: 'Srinagar to Leh Ladakh Road Trip', duration: '7 Days / 6 Nights', category: 'Adventure', channel: 'WhatsApp', amount: '₹79,000', status: 'Booking Confirmed', time: '3m ago', icon: Mountain, bg: 'text-purple-600 bg-purple-50' },
  { title: 'Dalhousie & Khajjiar Weekend', duration: '4 Days / 3 Nights', category: 'Nature', channel: 'Helpline', amount: '₹22,500', status: 'Inquiry Assigned', time: '6m ago', icon: Phone, bg: 'text-blue-600 bg-blue-50' },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose, isModal = false }) => {
  const { packages } = useTours();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const content = (
    <div className="bg-stone-50 min-h-full p-4 sm:p-6 lg:p-8 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#FCE8E8] text-[#7D0000] uppercase tracking-wider">
              Tour Operations & Booking CRM
            </span>
            <span className="text-xs text-stone-500 font-medium">Jammu, Kashmir & Himachal Packages</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Tour Package Demand & Conversion Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1.5 rounded-lg transition uppercase cursor-pointer ${
                  timeframe === t ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              title="Close Analytics"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Tour Searches</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">10,470</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.6% vs last period</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">Pilgrimage & holiday itinerary searches</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Inquiries</span>
            <div className="p-2.5 rounded-2xl bg-[#FDF2F2] text-[#9b0000]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">2,280</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.2% inquiry volume</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">Travelers requesting quotes</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 font-black text-xs">
              %
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">17.0%</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+2.4% booking conversion</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">Searches → Confirmed Tour Bookings</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Gross Tour Revenue</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">₹4.36M</div>
            <div className="text-xs text-stone-600 font-bold mt-1.5">Avg Package: ₹24,500 / booking</div>
          </div>
          <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">Multi-day guided tours & hotel stays</div>
        </div>
      </div>

      {/* Real-Time Tour Booking Demand & Velocity Area Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-stone-900">Real-Time Tour Demand & Booking Velocity</h3>
            <p className="text-xs text-stone-500 font-medium">
              Comparison between tour itinerary searches, traveler inquiries submitted, and confirmed tour bookings
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-700 self-start sm:self-auto">
            Recharts Area Graph
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-stone-700 pt-2 pb-1">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block"></span>
            <span>Itinerary Searches</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#9b0000] inline-block"></span>
            <span>Traveler Inquiries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Confirmed Bookings</span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tourVelocityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b0000" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9b0000" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Area type="monotone" dataKey="searches" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSearches)" strokeWidth={2} />
              <Area type="monotone" dataKey="inquiries" stroke="#9b0000" fillOpacity={1} fill="url(#colorInquiries)" strokeWidth={2} />
              <Area type="monotone" dataKey="bookings" stroke="#10b981" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Top Tour Packages & Category Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Tour Packages Table */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-stone-900">Top Tour Packages & Itineraries</h3>
              <p className="text-xs text-stone-500 font-medium">Most requested pilgrim yatras, holiday packages & honeymoon specials</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter Tour Categories"
                className="bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-hidden"
              >
                <option>All Categories</option>
                <option>Pilgrimage</option>
                <option>Honeymoon</option>
                <option>Adventure</option>
                <option>Family & Scenic</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase font-black tracking-wider">
                  <th className="pb-3 pr-4">Tour Package Name</th>
                  <th className="pb-3 px-4 text-right">Searches</th>
                  <th className="pb-3 px-4 text-right">Bookings</th>
                  <th className="pb-3 px-4 text-right">Avg Price</th>
                  <th className="pb-3 pl-4 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topTourPackagesData.map((tour, i) => (
                  <tr key={i} className="hover:bg-stone-50 transition">
                    <td className="py-3.5 pr-4 font-bold text-stone-900 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#FDF2F2] text-[#9b0000] shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-stone-900 text-xs sm:text-sm">{tour.name}</div>
                        <span className="text-[11px] text-stone-500 font-medium">{tour.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-stone-700">{tour.searches.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-black text-[#9b0000]">{tour.bookings}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-stone-900">{tour.avgPrice}</td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-black">
                        {tour.conversion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tour Category Demand Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-stone-900">Tour Category Demand</h3>
              <Mountain className="w-4 h-4 text-[#9b0000]" />
            </div>
            <p className="text-xs text-stone-500 font-medium">Share of traveler bookings</p>
          </div>

          <div className="h-52 w-full my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tourCategoryDemandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tourCategoryDemandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            {tourCategoryDemandData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                  <span className="font-bold text-stone-800">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-stone-400">{c.count} bookings</span>
                  <span className="font-black text-stone-900">{c.value}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="text-xs font-bold text-amber-900 mb-1">Tour Insight:</div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Pilgrimage Yatras & Kashmir honeymoon specials drive highest revenue yield per booking across Northern circuits.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: End-to-End Tour Booking Funnel & Inflow Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* End-to-End Tour Booking Conversion Funnel */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-stone-900">End-to-End Tour Booking Funnel</h3>
              <p className="text-xs text-stone-500 font-medium">Step-by-step conversion drop-off analysis from catalog browse to confirmed tour deposit</p>
            </div>
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black self-start sm:self-auto">
              Overall Efficiency: 17.0%
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {conversionFunnelSteps.map((step, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-800 font-black text-[10px]">{step.step}</span>
                    <span className="font-black text-stone-900 text-sm">{step.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#9b0000] text-sm">{step.count}</span>
                    <span className="text-stone-400 font-medium">({step.percent})</span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 font-medium">{step.subtitle}</div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#9b0000] h-full rounded-full" style={{ width: step.width }}></div>
                </div>
                <div className="flex justify-end text-xs font-bold text-red-600">{step.drop}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inflow Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-stone-900">Tour Inflow Channels</h3>
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Attribution</span>
            </div>

            <div className="space-y-5 pt-2">
              {inflowChannelsData.map((ch, i) => {
                const IconComponent = ch.icon;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 font-bold text-stone-800">
                        <div className="p-1.5 rounded-lg bg-stone-100 text-[#9b0000]">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span>{ch.channel}</span>
                      </div>
                      <span className="font-black text-stone-900 text-sm">{ch.share}%</span>
                    </div>
                    <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.share}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4.5 bg-[#FDF2F2]/70 border border-[#F5C2C2]/80 rounded-2xl">
              <div className="text-xs font-bold text-[#660000] mb-1">Booking Takeaway:</div>
              <p className="text-xs text-[#7D0000] leading-relaxed font-medium">
                WhatsApp tour desks convert 32% faster for custom multi-city holiday packages, while standard pilgrimage yatras are predominantly booked via instant web checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Tour Booking Stream */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Live Tour Booking Stream</h3>
              <p className="text-xs text-stone-500 font-medium">Real-time telemetry of confirmed tour bookings and traveler inquiries</p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl">
            Live Feed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {liveTourStream.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div key={i} className="p-5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white transition space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-2xl shrink-0 ${item.bg}`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-stone-900 leading-tight">{item.title}</div>
                      <div className="text-[11px] text-stone-500 font-medium mt-1">{item.duration} • {item.category}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black text-[10px] rounded-lg">
                      {item.status}
                    </span>
                    <span className="text-stone-400 text-[11px]">{item.time}</span>
                  </div>
                  <span className="font-black text-stone-900 text-sm sm:text-base">{item.amount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

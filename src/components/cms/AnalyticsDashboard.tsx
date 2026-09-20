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
} from 'lucide-react';

interface AnalyticsDashboardProps {
  onClose?: () => void;
  isModal?: boolean;
}

const engagementData = [
  { day: 'Mon', visitors: 340, pageViews: 1250, inquiries: 12 },
  { day: 'Tue', visitors: 420, pageViews: 1580, inquiries: 18 },
  { day: 'Wed', visitors: 390, pageViews: 1420, inquiries: 15 },
  { day: 'Thu', visitors: 510, pageViews: 1980, inquiries: 24 },
  { day: 'Fri', visitors: 680, pageViews: 2450, inquiries: 32 },
  { day: 'Sat', visitors: 890, pageViews: 3200, inquiries: 45 },
  { day: 'Sun', visitors: 780, pageViews: 2900, inquiries: 38 },
];

const destinationClicksData = [
  { destination: 'Kashmir Paradise (Srinagar/Gulmarg)', clicks: 1450, conversions: 84 },
  { destination: 'Vaishno Devi Helicopter Yatra', clicks: 1220, conversions: 96 },
  { destination: 'Shimla Manali Honeymoon', clicks: 980, conversions: 52 },
  { destination: 'Pahalgam & Sonamarg Snow', clicks: 860, conversions: 44 },
  { destination: 'Kullu Manali Adventure', clicks: 650, conversions: 31 },
];

const conversionFunnelData = [
  { stage: 'Storefront Visitors', count: 4800, fill: '#3b82f6' },
  { stage: 'Tour Package Views', count: 3200, fill: '#6366f1' },
  { stage: 'WhatsApp / Inquiries', count: 420, fill: '#8b5cf6' },
  { stage: 'Quotes Generated', count: 210, fill: '#ec4899' },
  { stage: 'Confirmed Bookings', count: 68, fill: '#10b981' },
];

const COLORS = ['#FF4B00', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose, isModal = false }) => {
  const { packages, inquiries } = useTours();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  const totalClicks = destinationClicksData.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalConversions = destinationClicksData.reduce((acc, curr) => acc + curr.conversions, 0);
  const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(1);

  const content = (
    <div className="bg-stone-50 min-h-full p-4 sm:p-6 lg:p-8 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 uppercase tracking-wider">
              Recharts Visualizer
            </span>
            <span className="text-xs text-stone-500 font-medium">• Jammu & Kashmir & Himachal Tourism Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            User Engagement & Conversion Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg transition uppercase cursor-pointer ${
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
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              title="Close Analytics Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Weekly Visitors</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">4,800</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last week</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Destination Clicks</span>
            <Compass className="w-4 h-4 text-[#FF4B00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalClicks.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mt-2">
            <span>Kashmir & Himachal packages</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Inquiry Conversion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{conversionRate}%</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-2">
            <span>{totalConversions} successful leads</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Tour Packages</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">{packages.length || 12}</div>
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mt-2">
            <span>All fully published</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Engagement Over Time */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-stone-900">User Engagement & Page Views</h3>
              <p className="text-xs text-stone-500 font-medium">Daily traffic trends across Kashmir & Himachal itineraries</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
              <BarChart3 className="w-4 h-4 text-[#FF4B00]" />
              <span>Recharts Area</span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4B00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF4B00" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#FF4B00" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inquiry Conversion Funnel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-stone-900">Conversion Funnel</h3>
            <p className="text-xs text-stone-500 font-medium">From visitor to confirmed booking</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionFunnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" stroke="#333" fontSize={11} width={110} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                <Bar dataKey="count" name="Users" radius={[0, 8, 8, 0]}>
                  {conversionFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Destination Clicks Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-stone-900">Destination Clicks & Inquiries</h3>
            <p className="text-xs text-stone-500 font-medium">Most popular tour packages in Jammu & Kashmir & Himachal Pradesh</p>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={destinationClicksData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="destination" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Legend />
              <Bar dataKey="clicks" name="Package Clicks" fill="#FF4B00" radius={[8, 8, 0, 0]} />
              <Bar dataKey="conversions" name="Confirmed Leads" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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

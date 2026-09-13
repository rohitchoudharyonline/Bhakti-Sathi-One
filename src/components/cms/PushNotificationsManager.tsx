import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { PushNotification, PushSettings } from '../../types/pushNotification';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Laptop,
  Globe,
  Settings,
  CheckCircle,
  AlertTriangle,
  Flame,
  Snowflake,
  FileText,
  Trash2,
  Eye,
  BarChart2,
  Key,
  Radio,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const PushNotificationsManager: React.FC = () => {
  const {
    pushNotifications,
    pushSubscribers,
    pushSettings,
    sendPushNotification,
    deletePushNotification,
    updatePushSettings,
    requestPushPermission,
    currentStaffUser,
  } = useTours();

  const [activeTab, setActiveTab] = useState<'broadcast' | 'history' | 'subscribers' | 'settings'>('broadcast');
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);

  // Broadcast Form State
  const [title, setTitle] = useState('❄️ Fresh Snowfall in Gulmarg - Gondola Phase 2 Open!');
  const [body, setBody] = useState('Powder snow alert! Book your Gulmarg winter ski itinerary now before slots fill up.');
  const [url, setUrl] = useState('/package/pkg-kashmir-02');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80');
  const [targetAudience, setTargetAudience] = useState<PushNotification['targetAudience']>('kashmir_enthusiasts');
  const [category, setCategory] = useState<PushNotification['category']>('weather_alert');
  const [priority, setPriority] = useState<PushNotification['priority']>('high');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Settings State
  const [welcomeTitle, setWelcomeTitle] = useState(pushSettings.welcomeNotificationTitle);
  const [welcomeBody, setWelcomeBody] = useState(pushSettings.welcomeNotificationBody);
  const [autoPrompt, setAutoPrompt] = useState(pushSettings.autoPromptOnVisit);
  const [autoPromptDelay, setAutoPromptDelay] = useState(pushSettings.autoPromptDelaySeconds);
  const [fcmKey, setFcmKey] = useState(pushSettings.fcmApiKey || '');
  const [oneSignalId, setOneSignalId] = useState(pushSettings.oneSignalAppId || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Preset Template loader
  const handleLoadPreset = (preset: 'snow' | 'tulip' | 'flight' | 'itinerary') => {
    if (preset === 'snow') {
      setTitle('❄️ Heavy Snowfall Alert in Gulmarg!');
      setBody('Slopes have 4+ feet of powder snow. Special winter packages starting at ₹18,999.');
      setUrl('/package/pkg-kashmir-02');
      setImage('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80');
      setTargetAudience('kashmir_enthusiasts');
      setCategory('weather_alert');
      setPriority('high');
    } else if (preset === 'tulip') {
      setTitle('🌷 Spring Tulip Garden Festival - Early Bird ₹5,000 OFF!');
      setBody('Indira Gandhi Tulip Garden opens April 1st. Reserve your 6D/5N Luxury Kashmir tour today.');
      setUrl('/package/pkg-kashmir-01');
      setImage('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80');
      setTargetAudience('honeymooners');
      setCategory('deal');
      setPriority('high');
    } else if (preset === 'flight') {
      setTitle('✈️ Direct Flight Prices Dropped to Srinagar (SXR)!');
      setBody('Non-stop flight fares from Delhi & Mumbai dropped to ₹3,499. Book Kashmir holiday now.');
      setUrl('/all-tours');
      setImage('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80');
      setTargetAudience('all');
      setCategory('announcement');
      setPriority('normal');
    } else if (preset === 'itinerary') {
      setTitle('📄 Your Custom Kashmir Itinerary is Ready!');
      setBody('View your personalized 5-star Pahalgam & Srinagar Dal Lake houseboat package quote now.');
      setUrl('/cms');
      setImage('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80');
      setTargetAudience('active_leads');
      setCategory('itinerary');
      setPriority('high');
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    sendPushNotification({
      title,
      body,
      url,
      image,
      icon: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=120&q=80',
      targetAudience,
      category,
      priority,
      sentBy: currentStaffUser?.name || 'Staff Admin',
    });

    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 4000);
  };

  const handleTestToMyDevice = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      sendPushNotification({
        title: `[TEST] ${title}`,
        body,
        url,
        image,
        icon: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=120&q=80',
        targetAudience: 'all',
        category: 'announcement',
        priority: 'high',
        sentBy: currentStaffUser?.name || 'Staff Admin',
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePushSettings({
      welcomeNotificationTitle: welcomeTitle,
      welcomeNotificationBody: welcomeBody,
      autoPromptOnVisit: autoPrompt,
      autoPromptDelaySeconds: autoPromptDelay,
      fcmApiKey: fcmKey,
      oneSignalAppId: oneSignalId,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const activeSubscribersCount = pushSubscribers.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-black text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF4B00] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> Live Web Push Gateway
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              VAPID SSL Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#FF4B00]" /> Push Notifications Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            Broadcast instant real-time push alerts, snowfall warnings, deal drops, and itinerary updates directly to traveler desktop & mobile browsers.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleTestToMyDevice}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-[#FF4B00]" />
            <span>Test My Browser</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className="px-4 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Active Devices</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{activeSubscribersCount}</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <CheckCircle className="w-3 h-3" /> Ready for broadcast
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-800 grid place-items-center">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Sent</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{pushNotifications.length}</h3>
            <span className="text-[10px] font-bold text-stone-500 mt-0.5 block">Lifetime campaigns</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#FF4B00] grid place-items-center">
            <Send className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Avg. Click Rate</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">21.8%</h3>
            <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">+3.2% vs industry avg</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
            <BarChart2 className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Gateway Status</p>
            <h3 className="text-sm font-black text-emerald-600 mt-1">100% Online</h3>
            <span className="text-[10px] font-bold text-stone-500 mt-0.5 block">Zero delivery drops</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'broadcast'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast Composer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sent History ({pushNotifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'subscribers'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Subscribed Devices ({pushSubscribers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Gateway & VAPID Config</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST COMPOSER */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF4B00]" /> Compose Broadcast Push
                </h3>
                <p className="text-xs text-stone-500">
                  Target custom traveler segments or send instant alerts to all active subscribers.
                </p>
              </div>

              {/* Quick Presets Dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('snow')}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-[10px] font-bold cursor-pointer"
                  title="Gulmarg Snowfall Preset"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('tulip')}
                  className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition text-[10px] font-bold cursor-pointer"
                  title="Tulip Festival Preset"
                >
                  <Flame className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('flight')}
                  className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition text-[10px] font-bold cursor-pointer"
                  title="Flight Discount Preset"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {sendSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  🎉 Push notification successfully broadcasted to {activeSubscribersCount} active subscribers and your browser!
                </span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ❄️ Fresh Snowfall in Gulmarg!"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                  Message Body / Description *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Keep it snappy & high converting under 120 characters..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 focus:outline-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                    Click Action Target URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/package/pkg-kashmir-01"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                    Target Segment
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold cursor-pointer focus:outline-stone-900"
                  >
                    <option value="all">🌐 All Subscribers ({activeSubscribersCount})</option>
                    <option value="kashmir_enthusiasts">🏔️ Kashmir Enthusiasts</option>
                    <option value="honeymooners">💍 Honeymoon Couples</option>
                    <option value="active_leads">📄 Active Inquiries</option>
                    <option value="high_budget">👑 High Budget Travelers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold cursor-pointer focus:outline-stone-900"
                  >
                    <option value="weather_alert">❄️ Weather & Snow Alert</option>
                    <option value="deal">🔥 Special Offer / Deal Drop</option>
                    <option value="itinerary">📄 Itinerary & Quote</option>
                    <option value="announcement">📢 Agency Announcement</option>
                    <option value="booking_status">✈️ Booking Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold cursor-pointer focus:outline-stone-900"
                  >
                    <option value="high">🚨 High (Immediate Popup)</option>
                    <option value="normal">⚡ Normal Priority</option>
                    <option value="low">💤 Low (Silent Badge)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleTestToMyDevice}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-stone-600" />
                  <span>Send Test Push to My Device</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Push Notification</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Phone & Desktop Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#FF4B00]" /> Live Device Lock Screen Preview
                </span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                  iOS / Android / Desktop
                </span>
              </div>

              {/* Mobile Lock Screen Card Mockup */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800/80 shadow-2xl relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF4B00] text-white grid place-items-center shrink-0 shadow-md">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 mb-0.5 font-semibold">
                      <span>HOLIDAYS HUNT TRAVEL</span>
                      <span>Now</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">{title || 'Notification Title'}</h4>
                    <p className="text-[11px] text-stone-300 mt-1 line-clamp-2 leading-relaxed">{body || 'Notification message body will appear here...'}</p>
                  </div>
                </div>

                {image && (
                  <div className="mt-3 rounded-xl overflow-hidden h-28 w-full bg-stone-900 border border-stone-800">
                    <img src={image} alt="Push banner" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-bold text-[#FF4B00]">
                  <span>Tap to view itinerary deal</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              <div className="bg-stone-800/50 p-3.5 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Audience:</span>
                  <span className="font-bold text-white capitalize">{targetAudience.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Priority:</span>
                  <span className="font-bold text-amber-400 capitalize">{priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Target Devices:</span>
                  <span className="font-bold text-emerald-400">{activeSubscribersCount} Active Browsers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#FF4B00]" /> Sent Broadcast History Log
            </h3>
            
            {pushNotifications.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      selectedNotificationIds.length === pushNotifications.length &&
                      pushNotifications.length > 0
                    }
                    onChange={() => {
                      if (selectedNotificationIds.length === pushNotifications.length) {
                        setSelectedNotificationIds([]);
                      } else {
                        setSelectedNotificationIds(pushNotifications.map((n) => n.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                  />
                  <span>Select All ({pushNotifications.length})</span>
                </label>

                {selectedNotificationIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${selectedNotificationIds.length} selected notification campaign(s)?`
                        )
                      ) {
                        selectedNotificationIds.forEach((id) => deletePushNotification(id));
                        setSelectedNotificationIds([]);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedNotificationIds.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] uppercase font-black text-stone-400 bg-stone-50/50">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedNotificationIds.length === pushNotifications.length &&
                        pushNotifications.length > 0
                      }
                      onChange={() => {
                        if (selectedNotificationIds.length === pushNotifications.length) {
                          setSelectedNotificationIds([]);
                        } else {
                          setSelectedNotificationIds(pushNotifications.map((n) => n.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Notification</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {pushNotifications.map((notif) => (
                  <tr
                    key={notif.id}
                    className={`hover:bg-stone-50/80 transition ${
                      selectedNotificationIds.includes(notif.id) ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedNotificationIds.includes(notif.id)}
                        onChange={() => {
                          setSelectedNotificationIds((prev) =>
                            prev.includes(notif.id)
                              ? prev.filter((item) => item !== notif.id)
                              : [...prev, notif.id]
                          );
                        }}
                        className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        {notif.icon ? (
                          <img src={notif.icon} alt="" className="w-8 h-8 rounded-lg object-cover border border-stone-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF4B00] grid place-items-center">
                            <Bell className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <b className="text-stone-900 font-bold block line-clamp-1">{notif.title}</b>
                          <span className="text-stone-500 text-[11px] line-clamp-1">{notif.body}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-stone-700 capitalize">
                      {notif.targetAudience.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-extrabold text-[10px] capitalize">
                        {notif.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 font-semibold">
                      {new Date(notif.sentAt).toLocaleDateString()} {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-stone-900">
                      {notif.stats?.recipientsCount || 1}
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-emerald-600">
                      {notif.stats?.clicksCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deletePushNotification(notif.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIBED DEVICES */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#FF4B00]" /> Active Browser Devices & Segments
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {activeSubscribersCount} Active Tokens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pushSubscribers.map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 grid place-items-center text-stone-800 shrink-0">
                  {sub.deviceType === 'desktop' ? <Laptop className="w-5 h-5 text-blue-600" /> : <Smartphone className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <b className="text-xs font-bold text-stone-900 truncate">{sub.browser}</b>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-semibold">{sub.location}</p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                    <span>Segment: <b className="text-stone-700">{sub.segment}</b></span>
                    <span>{new Date(sub.subscribedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & VAPID */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-6 max-w-4xl">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-[#FF4B00]" /> Push Gateway & VAPID Keys Setup
            </h3>
            <p className="text-xs text-stone-500">Configure Web Push Protocol SSL keys, automated prompt delays, and external gateways.</p>
          </div>

          {settingsSaved && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">VAPID Key Pair (Web Push Standard)</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">VAPID Public Key</label>
                  <input
                    type="text"
                    value={pushSettings.vapidPublicKey}
                    readOnly
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-stone-100 pt-4">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">Automated Traveler Permission Prompt</h4>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoPrompt"
                  checked={autoPrompt}
                  onChange={(e) => setAutoPrompt(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF4B00] cursor-pointer"
                />
                <label htmlFor="autoPrompt" className="text-xs font-bold text-stone-800 cursor-pointer">
                  Show non-intrusive "Enable Push Notifications" banner automatically to website visitors
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Prompt Delay (Seconds after visit)</label>
                <input
                  type="number"
                  value={autoPromptDelay}
                  onChange={(e) => setAutoPromptDelay(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-32 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-stone-100 pt-4">
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">Welcome Push Message</h4>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Welcome Notification Title</label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Welcome Notification Body</label>
                <input
                  type="text"
                  value={welcomeBody}
                  onChange={(e) => setWelcomeBody(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

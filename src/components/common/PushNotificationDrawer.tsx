import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import {
  Bell,
  X,
  CheckCheck,
  ExternalLink,
  Snowflake,
  Flame,
  FileText,
  Radio,
  Clock,
  Sparkles,
  Smartphone,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PushNotificationDrawer: React.FC = () => {
  const {
    pushNotifications,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    isPushSubscribed,
    requestPushPermission,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateToPackage,
    navigateToAllTours,
  } = useTours();

  const [activeFilter, setActiveFilter] = useState<'all' | 'weather_alert' | 'deal' | 'itinerary'>('all');

  if (!isNotificationDrawerOpen) return null;

  const unreadCount = pushNotifications.filter((n) => !n.isRead).length;

  const filteredNotifications = pushNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const handleNotificationClick = (id: string, url?: string) => {
    markNotificationAsRead(id);
    setIsNotificationDrawerOpen(false);

    if (url) {
      if (url.startsWith('/package/')) {
        const pkgId = url.replace('/package/', '');
        navigateToPackage(pkgId);
      } else if (url === '/all-tours') {
        navigateToAllTours();
      } else {
        window.location.href = url;
      }
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsNotificationDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF4B00] text-white grid place-items-center relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full grid place-items-center ring-2 ring-stone-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Travel Alerts & Drops
              </h3>
              <p className="text-[11px] text-stone-300 font-medium">
                Real-time snow updates, deals & itinerary notifications
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscribe Banner if Not Permission Granted */}
        {!isPushSubscribed && (
          <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <b className="text-xs font-black block truncate">Enable Device Push Alerts</b>
                <p className="text-[10px] text-white/90 truncate font-medium">
                  Get instant snow & discount notifications on your browser
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => requestPushPermission()}
              className="px-3 py-1.5 rounded-lg bg-white text-stone-900 hover:bg-stone-100 text-xs font-black shrink-0 transition cursor-pointer shadow-sm active:scale-95"
            >
              Enable Now
            </button>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              All ({pushNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('weather_alert')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeFilter === 'weather_alert'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <Snowflake className="w-3 h-3 text-blue-500" /> Snow Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('deal')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeFilter === 'deal'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" /> Deals
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-[11px] font-bold text-[#FF4B00] hover:text-[#e04200] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Read All
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.id, notif.url)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3.5 ${
                !notif.isRead
                  ? 'bg-orange-50/50 border-orange-200/80 shadow-xs hover:border-[#FF4B00]'
                  : 'bg-white border-stone-200/80 hover:border-stone-400'
              }`}
            >
              {!notif.isRead && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#FF4B00]" />
              )}

              {/* Icon / Thumbnail */}
              {notif.icon ? (
                <img
                  src={notif.icon}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#FF4B00] grid place-items-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                    {notif.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-stone-400">•</span>
                  <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {getTimeAgo(notif.sentAt)}
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-stone-900 group-hover:text-[#FF4B00] transition-colors leading-snug line-clamp-2">
                  {notif.title}
                </h4>

                <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 font-medium leading-relaxed">
                  {notif.body}
                </p>

                {notif.image && (
                  <div className="mt-2.5 rounded-xl overflow-hidden aspect-[16/9] w-full border border-stone-200">
                    <img src={notif.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {notif.url && (
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-[#FF4B00]">
                    <span>View details</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-stone-400" />
              <p className="text-xs font-bold text-stone-600">No notifications found</p>
              <p className="text-[11px] text-stone-400">Check back soon for new travel deals and alerts</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 text-center text-[10px] font-semibold text-stone-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bhakti Sathi Encrypted Web Push Engine</span>
        </div>
      </div>
    </div>
  );
};

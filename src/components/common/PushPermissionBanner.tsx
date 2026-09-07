import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { Bell, X, Snowflake, Sparkles } from 'lucide-react';

export const PushPermissionBanner: React.FC = () => {
  const { isPushSubscribed, pushSettings, requestPushPermission } = useTours();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // If browser supports notifications, user hasn't granted yet, and pushSettings autoPrompt is enabled
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default' &&
      !isPushSubscribed &&
      pushSettings.autoPromptOnVisit
    ) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, (pushSettings.autoPromptDelaySeconds || 4) * 1000);

      return () => clearTimeout(timer);
    }
  }, [isPushSubscribed, pushSettings]);

  if (!showBanner) return null;

  const handleEnable = async () => {
    await requestPushPermission();
    setShowBanner(false);
  };

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-[380px] z-[9990] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-stone-800 relative overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setShowBanner(false)}
          className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF4B00] text-white grid place-items-center shrink-0 shadow-md">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <span className="text-[10px] font-black uppercase text-[#FF4B00] tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Real-time Kashmir Travel Alerts
            </span>
            <h4 className="text-xs font-black text-white mt-0.5">
              Never Miss Snowfall Alerts & Deal Drops!
            </h4>
            <p className="text-[11px] text-stone-300 mt-1 leading-snug font-medium">
              Enable browser push notifications for instant Gulmarg ski warnings, tulip garden tickets & 15% OFF houseboat deals.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnable}
                className="px-4 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-black transition shadow-md cursor-pointer active:scale-95"
              >
                Enable Notifications
              </button>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

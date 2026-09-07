export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  targetAudience: 'all' | 'honeymooners' | 'active_leads' | 'kashmir_enthusiasts' | 'high_budget';
  category: 'deal' | 'itinerary' | 'announcement' | 'weather_alert' | 'booking_status';
  priority: 'high' | 'normal' | 'low';
  sentAt: string;
  sentBy: string;
  status: 'sent' | 'scheduled' | 'draft';
  stats: {
    recipientsCount: number;
    deliveredCount: number;
    clicksCount: number;
  };
  isRead?: boolean;
}

export interface PushSubscriber {
  id: string;
  deviceType: 'desktop' | 'mobile_android' | 'mobile_ios';
  browser: string;
  subscribedAt: string;
  location: string;
  segment: string;
  status: 'active' | 'unsubscribed' | 'blocked';
}

export interface PushSettings {
  enabled: boolean;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  welcomeNotificationTitle: string;
  welcomeNotificationBody: string;
  autoPromptOnVisit: boolean;
  autoPromptDelaySeconds: number;
  fcmApiKey?: string;
  oneSignalAppId?: string;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TourPackage,
  BookingInquiry,
  AgencySettings,
  HotelEntity,
  StaffMember,
  Vendor,
  VendorPayment,
  Invoice,
  InquiryQuotation,
  TravelerUserProfile,
  CoTraveler,
} from '../types/tour';
import { BlogPost, BlogCategory, CustomPage, MediaAsset, CloudStorageSettings, RegisteredTravelerUser, PageSeoConfig } from '../types/cms';
import { PushNotification, PushSubscriber, PushSettings } from '../types/pushNotification';
import { DEFAULT_PACKAGES, DEFAULT_AGENCY_SETTINGS } from '../data/defaultPackages';
import {
  DEFAULT_STAFF,
  DEFAULT_VENDORS,
  DEFAULT_VENDOR_PAYMENTS,
  DEFAULT_INVOICES,
} from '../data/defaultCmsData';
import { DEFAULT_REGISTERED_USERS } from '../data/defaultUsersData';
import { generateBookingNumber, formatBookingNumber } from '../utils/bookingHelper';
import { DESTINATIONS_REGISTRY, DestinationMeta } from '../data/destinationsData';
import { DEFAULT_BLOG_POSTS, DEFAULT_BLOG_CATEGORIES } from '../data/defaultBlogData';
import { GuideArticle, GuideCategory } from '../types/guide';
import { DEFAULT_GUIDES, DEFAULT_GUIDE_CATEGORIES } from '../data/defaultGuidesData';
import { DEFAULT_CUSTOM_PAGES } from '../data/defaultPagesData';
import { DEFAULT_PAGE_SEO_CONFIGS } from '../data/defaultPageSeoData';
import { DEFAULT_PUSH_NOTIFICATIONS, DEFAULT_PUSH_SUBSCRIBERS, DEFAULT_PUSH_SETTINGS } from '../data/defaultPushData';
import { DEFAULT_TEMPLES_DATA, TemplePlace } from '../data/templesData';
import { initMediaStorage, saveMediaAssetToDb, saveAllMediaAssetsToDb, deleteMediaAssetFromDb } from '../utils/mediaStorage';
import { fetchDestinationsFromServer, saveDestinationToServer, deleteDestinationFromServer, loadAuthoritativeServerContent, syncRegistryToServer } from '../services/contentSyncService';

export interface SystemSearchParams {
  destinationSlug?: string;
  searchQuery?: string;
  category?: string;
  month?: string;
  duration?: string;
  templeId?: string;
  templeName?: string;
}

interface TourContextType {
  packages: TourPackage[];
  inquiries: BookingInquiry[];
  agencySettings: AgencySettings;
  hotels: HotelEntity[];
  staff: StaffMember[];
  currentStaffUser: StaffMember;
  setCurrentStaffUser: (staff: StaffMember) => void;
  vendors: Vendor[];
  vendorPayments: VendorPayment[];
  invoices: Invoice[];
  activeView: 'traveler' | 'cms';
  setActiveView: (view: 'traveler' | 'cms') => void;
  
  // Sacred Temples & Shrines
  temples: TemplePlace[];
  addTemple: (temple: Omit<TemplePlace, 'id' | 'slug'> & { id?: string; slug?: string }) => string;
  updateTemple: (temple: TemplePlace) => void;
  deleteTemple: (id: string) => void;
  selectedTempleId: string | null;
  setSelectedTempleId: (id: string | null) => void;
  navigateToTemple: (templeId: string) => void;
  
  // Navigation & URL Routing States
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string | null) => void;
  selectedDestinationSlug: string | null;
  setSelectedDestinationSlug: (slug: string | null) => void;
  isDestinationsExplorerOpen: boolean;
  openDestinationsExplorer: () => void;
  closeDestinationsExplorer: () => void;
  
  // Tours Directory & Master Search
  isToursDirectoryOpen: boolean;
  selectedToursDestination: string | null;
  systemSearchParams: SystemSearchParams | null;
  setSystemSearchParams: (params: SystemSearchParams | null) => void;
  navigateToSearch: (params?: SystemSearchParams) => void;
  
  // Blog Routing States
  isBlogHubOpen: boolean;
  activeBlogSlug: string | null;
  
  // Custom Pages
  activeCustomPageSlug: string | null;
  activeInfoPage: string | null;
  setActiveInfoPage: (slug: string | null) => void;
  navigateToInfoPage: (slug: string | null) => void;
  
  // Jap Counter (Mala Chanting Tool)
  isJapCounterOpen: boolean;
  setIsJapCounterOpen: (open: boolean) => void;
  navigateToJapCounter: () => void;
  
  // High-Level Navigation Handlers (syncs URL)
  navigateToHome: () => void;
  navigateToDestination: (slug: string) => void;
  navigateToPackage: (id: string) => void;
  navigateToAllTours: () => void;
  navigateToDestinationTours: (destinationSlug: string) => void;
  navigateToBlogHub: () => void;
  navigateToBlogPost: (slug: string) => void;
  navigateToGuideHub: () => void;
  navigateToGuideDetail: (slug: string) => void;
  navigateToAdmin: () => void;
  navigateToCustomPage: (slug: string) => void;
  navigateToDestinationsExplorer: () => void;
  
  wishlistIds: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  currency: string;
  setCurrency: (c: string) => void;

  // Traveler Authentication State (D1 & Secure Backend Auth)
  travelerUser: TravelerUserProfile | null;
  googleToken: string | null;
  setTravelerUser: (user: TravelerUserProfile | null) => void;
  updateTravelerProfile: (updatedData: Partial<TravelerUserProfile>) => Promise<void>;
  loginWithGoogle: (customAccount?: { name?: string; email?: string; avatar?: string; phone?: string }) => void;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  loginWithGoogleAccessToken: (accessToken: string) => Promise<void>;
  signupWithPassword: (params: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  loginWithPassword: (params: { email: string; password: string }) => Promise<void>;
  sendOtpCode: (email: string) => Promise<{ success: boolean; message: string; devHint?: string }>;
  verifyOtpCode: (email: string, otp: string) => Promise<void>;
  resetPasswordWithOtp: (params: { email: string; otp: string; newPassword: string }) => Promise<{ success: boolean; message: string }>;
  loginWithMagicLink: (email: string) => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
  logoutTraveler: () => void;
  isTravelerAuthModalOpen: boolean;
  setIsTravelerAuthModalOpen: (open: boolean) => void;
  isTravelerProfileOpen: boolean;
  setIsTravelerProfileOpen: (open: boolean) => void;
  navigateToTravelerProfile: () => void;

  // Packages CRUD
  addPackage: (newPkg: Omit<TourPackage, 'id' | 'createdAt'>) => string;
  updatePackage: (updatedPkg: TourPackage) => void;
  deletePackage: (id: string) => void;
  duplicatePackage: (id: string) => void;
  togglePublishStatus: (id: string) => void;
  toggleFeatured: (id: string) => void;

  // Destinations Registry & CMS CRUD
  destinations: Record<string, DestinationMeta>;
  addDestination: (newDest: Omit<DestinationMeta, 'id'>) => string;
  updateDestination: (updatedDest: DestinationMeta) => void;
  deleteDestination: (slug: string) => void;
  duplicateDestination: (slug: string) => void;

  // Blog Posts & Categories CRUD
  blogPosts: BlogPost[];
  blogCategories: BlogCategory[];
  addBlogPost: (newPost: Omit<BlogPost, 'id' | 'publishedAt' | 'viewsCount'>) => string;
  updateBlogPost: (updatedPost: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  duplicateBlogPost: (id: string) => void;
  toggleBlogPostStatus: (id: string) => void;
  addBlogCategory: (cat: Omit<BlogCategory, 'id'>) => void;
  updateBlogCategory: (cat: BlogCategory) => void;
  deleteBlogCategory: (id: string) => void;

  // Guides CRUD
  guides: GuideArticle[];
  guideCategories: GuideCategory[];
  activeGuideSlug: string | null;
  setActiveGuideSlug: (slug: string | null) => void;
  isGuidesHubOpen: boolean;
  setIsGuidesHubOpen: (open: boolean) => void;
  addGuide: (newGuide: Omit<GuideArticle, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateGuide: (updatedGuide: GuideArticle) => void;
  deleteGuide: (id: string) => void;
  duplicateGuide: (id: string) => void;
  moveGuideToReview: (id: string) => void;
  publishGuide: (id: string) => void;
  unpublishGuide: (id: string) => void;
  returnGuideToDraft: (id: string) => void;
  addGuideCategory: (cat: Omit<GuideCategory, 'id'>) => void;
  updateGuideCategory: (cat: GuideCategory) => void;
  deleteGuideCategory: (id: string) => void;

  // Custom Pages CRUD
  customPages: CustomPage[];
  addCustomPage: (newPage: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCustomPage: (updatedPage: CustomPage) => void;
  deleteCustomPage: (id: string) => void;

  // Website Pages SEO (All Core Site Pages)
  pageSeoConfigs: Record<string, PageSeoConfig>;
  updatePageSeoConfig: (config: PageSeoConfig) => void;
  deletePageSeoConfig: (id: string) => void;
  getPageSeoConfig: (idOrPath: string) => PageSeoConfig | undefined;

  // Media Library & Cloudflare R2 / D1 Storage
  mediaAssets: MediaAsset[];
  cloudStorageSettings: CloudStorageSettings;
  addMediaAsset: (asset: MediaAsset) => void;
  deleteMediaAsset: (id: string) => void;
  updateMediaAsset: (asset: MediaAsset) => void;
  restoreSampleMedia: () => void;
  updateCloudStorageSettings: (settings: CloudStorageSettings) => void;

  // Inquiries & Leads
  submitInquiry: (inquiry: Omit<BookingInquiry, 'id' | 'createdAt' | 'status'>) => string;
  updateInquiry: (inquiry: BookingInquiry) => void;
  updateInquiryStatus: (id: string, status: BookingInquiry['status']) => void;
  assignInquiryStaff: (inquiryId: string, staffId: string, staffName: string) => void;
  updateInquiryQuotation: (inquiryId: string, quotation: InquiryQuotation) => void;
  addInquiryTimelineLog: (inquiryId: string, action: string, note: string) => void;
  deleteInquiry: (id: string) => void;
  updateInquiryEmail: (inquiryId: string, email: string) => void;
  linkInquiriesByPhoneOrId: (identifier: string, email: string) => { linkedCount: number; matchedInquiries: BookingInquiry[] };

  // Hotels
  addHotel: (newHotel: Omit<HotelEntity, 'id' | 'createdAt'>) => string;
  updateHotel: (updatedHotel: HotelEntity) => void;
  deleteHotel: (id: string) => void;

  // Staff & RBAC
  addStaffMember: (newStaff: Omit<StaffMember, 'id' | 'joinedAt'>) => string;
  updateStaffMember: (updatedStaff: StaffMember) => void;
  deleteStaffMember: (id: string) => void;

  // Vendors
  addVendor: (newVendor: Omit<Vendor, 'id' | 'createdAt'>) => string;
  updateVendor: (updatedVendor: Vendor) => void;
  deleteVendor: (id: string) => void;

  // Vendor Payments
  addVendorPayment: (newPayment: Omit<VendorPayment, 'id' | 'createdAt' | 'voucherNumber'>) => string;
  updateVendorPayment: (updatedPayment: VendorPayment) => void;
  deleteVendorPayment: (id: string) => void;
  recordVendorPaymentTransaction: (
    paymentId: string,
    amount: number,
    mode: string,
    transactionRef: string,
    note: string
  ) => void;

  // Invoices & Billing
  addInvoice: (newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => string;
  updateInvoice: (updatedInvoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordInvoicePayment: (
    invoiceId: string,
    amount: number,
    method: string,
    transactionRef: string,
    note: string
  ) => void;

  // Settings
  updateAgencySettings: (settings: AgencySettings) => void;
  resetToDefaults: () => void;

  // Registered Users Management
  registeredUsers: RegisteredTravelerUser[];
  addRegisteredUser: (user: Omit<RegisteredTravelerUser, 'id' | 'signupDate'>) => string;
  updateRegisteredUser: (user: RegisteredTravelerUser) => void;
  toggleBlockUser: (id: string) => void;
  deleteRegisteredUser: (id: string) => void;

  // Push Notifications System
  pushNotifications: PushNotification[];
  pushSubscribers: PushSubscriber[];
  pushSettings: PushSettings;
  isPushSubscribed: boolean;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  requestPushPermission: () => Promise<boolean>;
  sendPushNotification: (notification: Omit<PushNotification, 'id' | 'sentAt' | 'stats' | 'status'>) => void;
  deletePushNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updatePushSettings: (settings: Partial<PushSettings>) => void;
}

const STORAGE_KEYS = {
  PACKAGES: 'hh_tour_packages_v2',
  DESTINATIONS: 'hh_destinations_registry_v2',
  TEMPLES_PLACES: 'hh_temples_places_v1',
  BLOG_POSTS: 'hh_blog_posts_v2',
  BLOG_CATEGORIES: 'hh_blog_categories_v2',
  GUIDES: 'hh_guide_articles_v1',
  GUIDE_CATEGORIES: 'hh_guide_categories_v1',
  CUSTOM_PAGES: 'hh_custom_pages_v2',
  PAGE_SEO_CONFIGS: 'hh_page_seo_configs_v1',
  MEDIA_ASSETS: 'hh_media_assets_v2',
  CLOUD_STORAGE_CONFIG: 'hh_cloud_storage_config_v2',
  INQUIRIES: 'hh_booking_inquiries_v2',
  SETTINGS: 'hh_agency_settings_v2',
  WISHLIST: 'hh_tour_wishlist_v2',
  CURRENCY: 'hh_tour_currency_v2',
  HOTELS: 'hh_hotels_v2',
  STAFF: 'hh_staff_members_v2',
  PUSH_NOTIFICATIONS: 'hh_push_notifications_v1',
  PUSH_SUBSCRIBERS: 'hh_push_subscribers_v1',
  PUSH_SETTINGS: 'hh_push_settings_v1',
  PUSH_SUBSCRIBED: 'hh_push_subscribed_user_v1',
  CURRENT_USER: 'hh_current_staff_user_v2',
  VENDORS: 'hh_vendors_v2',
  VENDOR_PAYMENTS: 'hh_vendor_payments_v2',
  INVOICES: 'hh_invoices_v2',
  REGISTERED_USERS: 'hh_registered_users_v2',
};

const DEFAULT_CLOUD_SETTINGS: CloudStorageSettings = {
  r2AccountId: '',
  r2BucketName: 'bhakti-sathi',
  r2AccessKeyId: '',
  r2SecretAccessKey: '********************************',
  r2PublicDomain: 'https://media.holidayshunt.com',
  d1DatabaseId: '165b7b99-72e3-443e-aee9-8bf0f8c6c26b',
  d1DatabaseName: 'bhakti-sathi-db',
  d1ApiToken: '',
  d1BucketName: 'bhakti-sathi',
  autoCompressOnUpload: true,
  compressionQuality: 0.78,
  maxImageWidth: 1920,
  outputFormat: 'webp',
};

const DEFAULT_SAMPLE_MEDIA: MediaAsset[] = [
  {
    id: 'media_kashmir_cover',
    name: 'Srinagar Dal Lake Shikara',
    fileName: 'srinagar-dal-lake-shikara.webp',
    fileType: 'webp',
    url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
    storagePath: 'uploads/2026/08/srinagar-dal-lake-shikara.webp',
    storageProvider: 'cloudflare_r2',
    originalSizeKb: 2450,
    compressedSizeKb: 285,
    compressionRatioPercent: 88,
    dimensions: { width: 1920, height: 1080 },
    altText: 'Traditional Kashmiri Shikara boat floating on Dal Lake surrounded by mountains',
    uploadedAt: '2026-08-20T10:00:00Z',
    folder: 'tours',
  },
  {
    id: 'media_manali_snow',
    name: 'Manali Solang Valley Snow Peaks',
    fileName: 'manali-solang-valley-snow.webp',
    fileType: 'webp',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    storagePath: 'uploads/2026/08/manali-solang-valley-snow.webp',
    storageProvider: 'cloudflare_r2',
    originalSizeKb: 3120,
    compressedSizeKb: 340,
    compressionRatioPercent: 89,
    dimensions: { width: 1920, height: 1200 },
    altText: 'Snow capped Himalayan mountain ranges in Solang Valley Manali',
    uploadedAt: '2026-08-22T14:30:00Z',
    folder: 'destinations',
  },
  {
    id: 'media_vaishno_devi',
    name: 'Vaishno Devi Katra Trikuta Shrine',
    fileName: 'vaishno-devi-katra-trikuta-shrine.webp',
    fileType: 'webp',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    storagePath: 'uploads/2026/08/vaishno-devi-katra-trikuta-shrine.webp',
    storageProvider: 'cloudflare_r2',
    originalSizeKb: 1890,
    compressedSizeKb: 210,
    compressionRatioPercent: 88,
    dimensions: { width: 1600, height: 900 },
    altText: 'Holy Sanctum of Shri Mata Vaishno Devi Bhawan in Katra',
    uploadedAt: '2026-08-25T09:15:00Z',
    folder: 'blog',
  },
];

const TourContext = createContext<TourContextType | undefined>(undefined);

const DEFAULT_SEED_INQUIRIES: BookingInquiry[] = [
  {
    id: 'HH76868',
    packageId: 'pkg-kashmir-01',
    packageTitle: 'Paradise Kashmir: Srinagar, Gulmarg, Pahalgam & Luxury Houseboat',
    travelerName: 'VIP Traveler',
    email: 'vip.traveler@gmail.com',
    phone: '+91 94199 15255',
    travelDate: '2026-09-24',
    adults: 2,
    children: 1,
    specialRequests: 'Lake facing Dal Lake luxury houseboat stay, private Innova Crysta throughout, and Gondola phase 2 tickets.',
    estimatedTotal: 48500,
    status: 'Confirmed',
    createdAt: '2026-08-30T10:15:00Z',
  },
  {
    id: 'HH41920',
    packageId: 'pkg-kashmir-04',
    packageTitle: 'Hidden Gurez Valley & Razdan Pass Offbeat Expedition',
    travelerName: 'VIP Traveler',
    email: 'vip.traveler@gmail.com',
    phone: '+91 94199 15255',
    travelDate: '2026-10-05',
    adults: 4,
    children: 0,
    specialRequests: '4x4 Scorpio vehicle for Razdan Pass, bonfire arrangement at Dawar village campsite.',
    estimatedTotal: 36000,
    status: 'Quotation Sent',
    createdAt: '2026-09-02T16:30:00Z',
  },
  {
    id: 'HH89123',
    packageId: 'pkg-kashmir-01',
    packageTitle: 'Paradise Kashmir: Srinagar, Gulmarg, Pahalgam & Luxury Houseboat',
    travelerName: 'Holidays Hunt Guest',
    email: 'care@holidayshunt.com',
    phone: '+91 94199 15255',
    travelDate: '2026-09-28',
    adults: 2,
    children: 0,
    specialRequests: 'Traditional satvik pure vegetarian dinner inclusion and Shikara sunset photo shoot.',
    estimatedTotal: 42000,
    status: 'Confirmed',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'HH65201',
    packageId: 'pkg-ladakh-01',
    packageTitle: 'Mesmerizing Ladakh & Pangong Tso Highland Odyssey',
    travelerName: 'Holidays Hunt Guest',
    email: 'care@holidayshunt.com',
    phone: '+91 94199 15255',
    travelDate: '2026-10-12',
    adults: 3,
    children: 1,
    specialRequests: 'Oxygen cylinder in vehicle and luxury dome camp at Pangong lake.',
    estimatedTotal: 58000,
    status: 'Quotation Sent',
    createdAt: '2026-09-03T11:45:00Z',
  },
  {
    id: 'HH52391',
    packageId: 'pkg-kashmir-01',
    packageTitle: 'Paradise Kashmir: Srinagar, Gulmarg, Pahalgam & Luxury Houseboat',
    travelerName: 'Sophia Reynolds',
    email: 'sophia.r@example.com',
    phone: '+91 98765 43210',
    travelDate: '2026-09-15',
    adults: 2,
    children: 0,
    specialRequests: 'Honeymoon couple looking for flower bed decoration, private shikara, and luxury heating.',
    estimatedTotal: 37000,
    status: 'New',
    createdAt: '2026-08-28T14:20:00Z',
  },
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to get deleted entities from persistent local storage
  const getDeletedItems = (key: string): string[] => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Helper to mark entity as deleted persistently
  const markItemDeleted = (key: string, idOrSlug: string) => {
    try {
      const items = getDeletedItems(key);
      if (!items.includes(idOrSlug)) {
        items.push(idOrSlug);
        localStorage.setItem(key, JSON.stringify(items));
      }
    } catch {}
  };

  // Helper to unmark entity when created or re-added
  const unmarkItemDeleted = (key: string, idOrSlug: string) => {
    try {
      const items = getDeletedItems(key);
      const filtered = items.filter((x) => x !== idOrSlug);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {}
  };

  const DISALLOWED_DUMMY_PKG_IDS = new Set([
    'pkg-kashmir-01',
    'pkg-kashmir-02',
    'pkg-kashmir-03',
    'pkg-kashmir-04',
    'pkg-jammu-01',
    'pkg-jammu-02',
    'pkg-ladakh-01',
  ]);

  // Helper to normalize category to one of the 3 clean categories
  const normalizePackageCategory = (cat: string | undefined): 'Family' | 'Honeymoon' | 'Pilgrimage' => {
    const c = (cat || '').toLowerCase().trim();
    if (c === 'honeymoon' || c.includes('honeymoon') || c.includes('romantic')) return 'Honeymoon';
    if (c === 'pilgrimage' || c.includes('pilgrimage') || c.includes('darshan') || c.includes('yatra') || c.includes('temple') || c.includes('sacred') || c.includes('devi') || c.includes('shaktipeeth')) return 'Pilgrimage';
    return 'Family'; // Default fallback is Family
  };

  // 1. Packages State
  // Public tours are server-authoritative. Start empty so legacy/default dummy
  // packages never flash while D1 content is being hydrated.
  const [packages, setPackages] = useState<TourPackage[]>([]);

  const DISALLOWED_DUMMY_DEST_SLUGS = new Set([
    'ladakh',
    'jammu',
    'kashmir',
    'goa',
    'kerala',
    'rajasthan',
    'uttarakhand',
    'andaman',
    'dubai',
    'thailand',
    'bali',
    'singapore',
  ]);

  // 2. Destinations Registry State (Strictly Jammu & Kashmir, Himachal Pradesh, Amritsar)
  const [destinations, setDestinations] = useState<Record<string, DestinationMeta>>(() => {
    const deletedSlugs = getDeletedItems('hh_deleted_destination_slugs');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const result: Record<string, DestinationMeta> = {};
          for (const [slug, rawItem] of Object.entries(parsed)) {
            if (!deletedSlugs.includes(slug) && !DISALLOWED_DUMMY_DEST_SLUGS.has(slug) && rawItem) {
              const defaultDest: any = DESTINATIONS_REGISTRY[slug] || {};
              const item: any = rawItem;
              result[slug] = {
                ...defaultDest,
                ...item,
                name: item.name || defaultDest.name || slug,
                displayName: item.displayName || defaultDest.displayName || item.name || slug,
                tagline: item.tagline || defaultDest.tagline || '',
                heroImage: item.heroImage || defaultDest.heroImage || '',
                destinationType: item.destinationType || defaultDest.destinationType || 'regular',
                guide: {
                  ...(defaultDest.guide || {}),
                  ...(item.guide || {}),
                  topAttractions: item.guide?.topAttractions || defaultDest.guide?.topAttractions || [],
                  faqs: item.guide?.faqs || defaultDest.guide?.faqs || [],
                },
                keyHighlights: item.keyHighlights || defaultDest.keyHighlights || [],
                startingPrice: item.startingPrice || defaultDest.startingPrice || 6499,
              };
            }
          }
          if (Object.keys(result).length > 0) {
            try {
              localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(result));
            } catch {}
            return result;
          }
        }
      }
    } catch {}

    const initial: Record<string, DestinationMeta> = {};
    for (const [slug, dest] of Object.entries(DESTINATIONS_REGISTRY)) {
      if (!deletedSlugs.includes(slug) && !DISALLOWED_DUMMY_DEST_SLUGS.has(slug)) {
        initial[slug] = dest;
      }
    }
    return initial;
  });

  // 2.1 Sacred Temples & Holy Places State
  const [temples, setTemples] = useState<TemplePlace[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_temple_ids');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLES_PLACES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: TemplePlace) => !deletedIds.includes(t.id) && !deletedIds.includes(t.slug));
        }
      }
    } catch {}

    return DEFAULT_TEMPLES_DATA.filter((dt) => !deletedIds.includes(dt.id) && !deletedIds.includes(dt.slug));
  });

  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);

  // 3. Blog Posts & Categories State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_blog_post_ids');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((p: BlogPost) => !deletedIds.includes(p.id));
      }
    } catch {}
    return DEFAULT_BLOG_POSTS.filter((p) => !deletedIds.includes(p.id));
  });

  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_blog_category_ids');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOG_CATEGORIES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((c: BlogCategory) => !deletedIds.includes(c.id));
      }
    } catch {}
    return DEFAULT_BLOG_CATEGORIES.filter((c) => !deletedIds.includes(c.id));
  });

  // Guides State
  const [guides, setGuides] = useState<GuideArticle[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_guide_ids');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUIDES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((g: GuideArticle) => !deletedIds.includes(g.id));
      }
    } catch {}
    return DEFAULT_GUIDES.filter((g) => !deletedIds.includes(g.id));
  });

  const [guideCategories, setGuideCategories] = useState<GuideCategory[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_guide_category_ids');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUIDE_CATEGORIES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((c: GuideCategory) => !deletedIds.includes(c.id));
      }
    } catch {}
    return DEFAULT_GUIDE_CATEGORIES.filter((c) => !deletedIds.includes(c.id));
  });

  // 4. Custom Pages State
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_custom_page_ids');

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_PAGES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove unwanted uncreated sample pages
          const unwantedIds = [
            'page-home', 'page-tours', 'page-destinations', 'page-blog', 'page-faq', 
            'home', 'tours', 'destinations', 'blog', 'faq',
            'page-about-us', 'page-why-choose-us', 'page-honeymoon-perks',
            'about-us', 'why-choose-us', 'honeymoon-special-inclusions'
          ];
          const cleaned = parsed.filter(p => 
            !deletedIds.includes(p.id) &&
            !unwantedIds.includes(p.id) &&
            !unwantedIds.includes(p.slug)
          );
          return cleaned;
        }
      }
    } catch {}
    return DEFAULT_CUSTOM_PAGES.filter(p => !deletedIds.includes(p.id));
  });

  // Helper to migrate legacy domain to holidayshunt.com
  const sanitizePageSeoConfigs = (input: Record<string, PageSeoConfig>): Record<string, PageSeoConfig> => {
    if (!input || typeof input !== 'object') return DEFAULT_PAGE_SEO_CONFIGS;
    const result: Record<string, PageSeoConfig> = {};
    for (const [k, v] of Object.entries(input)) {
      if (!v) continue;
      result[k] = {
        ...v,
        canonicalUrl: (v.canonicalUrl || '').replace(/https?:\/\/([^/]*\.)?mybhaktisathi\.com/gi, 'https://holidayshunt.com'),
        metaTitle: (v.metaTitle || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt'),
        metaDescription: (v.metaDescription || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt'),
        ogTitle: (v.ogTitle || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt'),
        ogDescription: (v.ogDescription || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt'),
      };
    }
    return { ...DEFAULT_PAGE_SEO_CONFIGS, ...result };
  };

  // 4.1. Website Pages SEO State (All Core Pages: Home, Tours, Destinations, Blog, FAQ, etc.)
  const [pageSeoConfigs, setPageSeoConfigs] = useState<Record<string, PageSeoConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAGE_SEO_CONFIGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const sanitized = sanitizePageSeoConfigs(parsed);
          try {
            localStorage.setItem(STORAGE_KEYS.PAGE_SEO_CONFIGS, JSON.stringify(sanitized));
          } catch {}
          return sanitized;
        }
      }
    } catch {}
    return DEFAULT_PAGE_SEO_CONFIGS;
  });

  const updatePageSeoConfig = (config: PageSeoConfig) => {
    setPageSeoConfigs(prev => {
      const updated = {
        ...prev,
        [config.id]: {
          ...config,
          updatedAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem(STORAGE_KEYS.PAGE_SEO_CONFIGS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save page SEO config:', err);
      }
      return updated;
    });
  };

  const deletePageSeoConfig = (id: string) => {
    setPageSeoConfigs(prev => {
      const updated = { ...prev };
      delete updated[id];
      try {
        localStorage.setItem(STORAGE_KEYS.PAGE_SEO_CONFIGS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to delete page SEO config:', err);
      }
      return updated;
    });
  };

  const getPageSeoConfig = (idOrPath: string): PageSeoConfig | undefined => {
    if (pageSeoConfigs && pageSeoConfigs[idOrPath]) return pageSeoConfigs[idOrPath];
    const list: PageSeoConfig[] = Object.values(pageSeoConfigs || {});
    return list.find(p => p.path === idOrPath || p.id === idOrPath);
  };

  // 5. Media Assets & Cloud Storage Settings State
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDIA_ASSETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: MediaAsset) => ({
            ...item,
            url: (item.url || '').replace(/https?:\/\/pub-r2\.holidayshunt\.com/g, 'https://media.holidayshunt.com'),
          }));
        }
      }
    } catch {}
    return DEFAULT_SAMPLE_MEDIA;
  });

  const [cloudStorageSettings, setCloudStorageSettings] = useState<CloudStorageSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_STORAGE_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_CLOUD_SETTINGS,
            ...parsed,
            r2PublicDomain: (!parsed.r2PublicDomain || parsed.r2PublicDomain.includes('bhakti')) ? 'https://media.holidayshunt.com' : parsed.r2PublicDomain,
            r2BucketName: (!parsed.r2BucketName || parsed.r2BucketName === 'holidays-hunt') ? 'bhakti-sathi' : parsed.r2BucketName,
            d1BucketName: (!parsed.d1BucketName || parsed.d1BucketName === 'holidays-hunt') ? 'bhakti-sathi' : parsed.d1BucketName,
            d1DatabaseId: (!parsed.d1DatabaseId) ? '165b7b99-72e3-443e-aee9-8bf0f8c6c26b' : parsed.d1DatabaseId,
            d1DatabaseName: (!parsed.d1DatabaseName || parsed.d1DatabaseName === 'holidays-hunt-db') ? 'bhakti-sathi-db' : parsed.d1DatabaseName,
          };
        }
      }
    } catch {}
    return DEFAULT_CLOUD_SETTINGS;
  });

  // 6. Inquiries State
  const [inquiries, setInquiries] = useState<BookingInquiry[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_inquiry_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: BookingInquiry) => !deletedIds.includes(p.id));
          // Ensure seed inquiries for test emails are always available unless deleted
          const existingIds = new Set(filtered.map((p: BookingInquiry) => p.id));
          const missing = DEFAULT_SEED_INQUIRIES.filter((s) => !existingIds.has(s.id) && !deletedIds.includes(s.id));
          const finalInquiries = [...filtered, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(finalInquiries));
          } catch {}
          return finalInquiries;
        }
      }
    } catch {}
    const initial = DEFAULT_SEED_INQUIRIES.filter((s) => !deletedIds.includes(s.id));
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  // 7. Agency Settings
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Cleanse and replace any remaining Bhakti Sathi references
        if (!parsed.agencyName || parsed.agencyName.toLowerCase().includes('bhakti')) {
          parsed.agencyName = DEFAULT_AGENCY_SETTINGS.agencyName;
        }
        if (!parsed.tagline || parsed.tagline.toLowerCase().includes('bhakti') || parsed.tagline.toLowerCase().includes('darshan facilitation')) {
          parsed.tagline = DEFAULT_AGENCY_SETTINGS.tagline;
        }
        if (!parsed.email || parsed.email.toLowerCase().includes('bhakti')) {
          parsed.email = DEFAULT_AGENCY_SETTINGS.email;
        }
        if (!parsed.phone || parsed.phone.includes('0000')) {
          parsed.phone = DEFAULT_AGENCY_SETTINGS.phone;
        }
        if (!parsed.whatsapp || parsed.whatsapp.includes('0000')) {
          parsed.whatsapp = DEFAULT_AGENCY_SETTINGS.whatsapp;
        }
        if (!parsed.address || parsed.address.toLowerCase().includes('bhakti')) {
          parsed.address = DEFAULT_AGENCY_SETTINGS.address;
        }
        if (!parsed.accountName || parsed.accountName.toLowerCase().includes('bhakti')) {
          parsed.accountName = DEFAULT_AGENCY_SETTINGS.accountName;
        }
        if (!parsed.upiId || parsed.upiId.toLowerCase().includes('bhakti')) {
          parsed.upiId = DEFAULT_AGENCY_SETTINGS.upiId;
        }
        if (!parsed.invoicePrefix || parsed.invoicePrefix.includes('BS-')) {
          parsed.invoicePrefix = DEFAULT_AGENCY_SETTINGS.invoicePrefix;
        }
        if (!parsed.voucherPrefix || parsed.voucherPrefix.includes('VOU-BS-')) {
          parsed.voucherPrefix = DEFAULT_AGENCY_SETTINGS.voucherPrefix;
        }
        if (parsed.sacredMantra === 'ॐ ऐं ह्रीं श्रीं वैष्णव्यै नमः' || parsed.sacredMantra === 'साम्ब सदाशिव') {
          parsed.sacredMantra = '';
        }
        // Ensure footerMenus is initialized from defaults if not set, without reverting user deletions
        if (!parsed.footerMenus || !Array.isArray(parsed.footerMenus)) {
          parsed.footerMenus = DEFAULT_AGENCY_SETTINGS.footerMenus || [];
        }
        // Ensure bottomNavItems is initialized from defaults if not set
        if (!parsed.bottomNavItems || !Array.isArray(parsed.bottomNavItems)) {
          parsed.bottomNavItems = DEFAULT_AGENCY_SETTINGS.bottomNavItems || [];
        }

        // Sanitize any existing FAQs that may contain the old/unwanted dietary purity or incorrect cancellation claims
        if (parsed.faqs && Array.isArray(parsed.faqs)) {
          parsed.faqs = parsed.faqs.map((faq: any) => {
            const hasUnwantedCopy = faq.answer && (
              faq.answer.toLowerCase().includes('dietary purity') ||
              faq.answer.toLowerCase().includes('onion or garlic') ||
              (faq.answer.toLowerCase().includes('sattvik') && faq.answer.toLowerCase().includes('dietary'))
            );
            if (hasUnwantedCopy) {
              return {
                ...faq,
                question: "What is Holidays Hunt's role regarding meals and restaurant suggestions?",
                answer: "Holidays Hunt does not operate restaurants, kitchens, or hotel dining services. However, we understand the importance of dietary preferences on a sacred journey. We provide curated recommendations for reputable local vegetarian restaurants and hotel kitchens along your yatra route that offer clean, high-quality vegetarian food."
              };
            }

            const hasIncorrectCancellationCopy = faq.answer && (
              faq.answer.toLowerCase().includes('flexible terms to ensure peace of mind') ||
              faq.answer.toLowerCase().includes('full refund of your deposit') ||
              (faq.answer.toLowerCase().includes('cancellation') && faq.answer.toLowerCase().includes('reschedule or transfer your booking to a family member'))
            );
            if (hasIncorrectCancellationCopy) {
              return {
                ...faq,
                question: "What is the cancellation and refund policy for a Holidays Hunt coordinated yatra?",
                answer: "Cancellations attract charges based on the departure timeline. Prior to 46 days from departure, the 30% advance booking deposit (or ₹30,000, whichever is lower) is non-refundable. Cancellations made between 31 to 45 days attract a 70% charge, and cancellations within 30 days or less are 100% non-refundable. Eligible refunds are processed within 21 working days."
              };
            }

            return faq;
          });
        }

        // Ensure we have at least 10 high-quality FAQs (merge defaults if some are missing or shorter than 10)
        if (!parsed.faqs || !Array.isArray(parsed.faqs) || parsed.faqs.length < 10) {
          const currentFaqs = Array.isArray(parsed.faqs) ? parsed.faqs : [];
          const defaultFaqs = DEFAULT_AGENCY_SETTINGS.faqs || [];
          const mergedFaqs = [...currentFaqs];
          defaultFaqs.forEach((defFaq) => {
            const exists = mergedFaqs.some(
              (f) => f.question.toLowerCase().trim() === defFaq.question.toLowerCase().trim() || f.id === defFaq.id
            );
            if (!exists) {
              mergedFaqs.push(defFaq);
            }
          });
          parsed.faqs = mergedFaqs;
        }
        return { ...DEFAULT_AGENCY_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_AGENCY_SETTINGS;
  });

  // 8. ERP Staff, Vendors, Payments, Invoices
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_staff_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((s: StaffMember) => !deletedIds.includes(s.id));
          try {
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filtered));
          } catch {}
          return filtered;
        }
      }
    } catch {}
    const initial = DEFAULT_STAFF.filter((s) => !deletedIds.includes(s.id));
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  const [currentStaffUser, setCurrentStaffUser] = useState<StaffMember>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF[0];
  });

  const [hotels, setHotels] = useState<HotelEntity[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_hotel_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOTELS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((h: HotelEntity) => !deletedIds.includes(h.id));
          try {
            localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(filtered));
          } catch {}
          return filtered;
        }
      }
    } catch {}
    return [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_vendor_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((v: Vendor) => !deletedIds.includes(v.id));
          try {
            localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(filtered));
          } catch {}
          return filtered;
        }
      }
    } catch {}
    const initial = DEFAULT_VENDORS.filter((v) => !deletedIds.includes(v.id));
    try {
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_vendor_payment_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VENDOR_PAYMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: VendorPayment) => !deletedIds.includes(p.id));
          try {
            localStorage.setItem(STORAGE_KEYS.VENDOR_PAYMENTS, JSON.stringify(filtered));
          } catch {}
          return filtered;
        }
      }
    } catch {}
    const initial = DEFAULT_VENDOR_PAYMENTS.filter((p) => !deletedIds.includes(p.id));
    try {
      localStorage.setItem(STORAGE_KEYS.VENDOR_PAYMENTS, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_invoice_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((inv: Invoice) => !deletedIds.includes(inv.id));
          try {
            localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
          } catch {}
          return filtered;
        }
      }
    } catch {}
    const initial = DEFAULT_INVOICES.filter((inv) => !deletedIds.includes(inv.id));
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  // Registered Traveler Users State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredTravelerUser[]>(() => {
    const deletedIds = getDeletedItems('hh_deleted_registered_user_ids');
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: RegisteredTravelerUser) => !deletedIds.includes(u.id));
          try {
            localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(filtered));
          } catch {}
          return filtered;
        }
      }
    } catch {}
    const initial = DEFAULT_REGISTERED_USERS.filter((u) => !deletedIds.includes(u.id));
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  // 9. Navigation / Routing States
  const [activeView, setActiveView] = useState<'traveler' | 'cms'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p === '/admin-rudra-0712' || p.startsWith('/admin-rudra-0712/') || p.startsWith('/admin-rudra-0712?')) {
        return 'cms';
      }
    }
    return 'traveler';
  });
  const [selectedPackageId, _setSelectedPackageId] = useState<string | null>(null);
  const [selectedDestinationSlug, _setSelectedDestinationSlug] = useState<string | null>(null);

  const setSelectedPackageId = (id: string | null) => {
    if (id) {
      navigateToPackage(id);
    } else {
      _setSelectedPackageId(null);
      if (typeof window !== 'undefined' && window.history.pushState) {
        if (window.location.pathname.startsWith('/tours/') || window.location.pathname.includes('/package/')) {
          window.history.pushState({}, '', '/tours');
        }
      }
    }
  };

  const setSelectedDestinationSlug = (slug: string | null) => {
    if (slug) {
      navigateToDestination(slug);
    } else {
      _setSelectedDestinationSlug(null);
      if (typeof window !== 'undefined' && window.history.pushState) {
        if (window.location.pathname.startsWith('/destinations/') || window.location.pathname.startsWith('/destination/')) {
          window.history.pushState({}, '', '/destinations');
        }
      }
    }
  };
  const [isDestinationsExplorerOpen, setIsDestinationsExplorerOpen] = useState<boolean>(false);
  const [isToursDirectoryOpen, setIsToursDirectoryOpen] = useState<boolean>(false);
  const [selectedToursDestination, setSelectedToursDestination] = useState<string | null>(null);
  const [systemSearchParams, setSystemSearchParams] = useState<SystemSearchParams | null>(null);
  const [isBlogHubOpen, setIsBlogHubOpen] = useState<boolean>(false);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [isGuidesHubOpen, setIsGuidesHubOpen] = useState<boolean>(false);
  const [activeGuideSlug, setActiveGuideSlug] = useState<string | null>(null);
  const [activeCustomPageSlug, setActiveCustomPageSlug] = useState<string | null>(null);
  const [activeInfoPage, setActiveInfoPageRaw] = useState<string | null>(null);
  const [isJapCounterOpen, setIsJapCounterOpen] = useState<boolean>(false);

  // Map Supabase user metadata to TravelerUserProfile
  const mapSupabaseUserToProfile = (user: any): TravelerUserProfile => {
    const metadata = user.user_metadata || {};
    return {
      name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'Traveler Guest',
      email: user.email || '',
      phone: metadata.phone || user.phone || '+91 94199 15255',
      avatar: metadata.avatar_url || metadata.picture || undefined,
      city: metadata.city || 'New Delhi',
      state: metadata.state || 'Delhi',
      country: metadata.country || 'India',
      passportNo: metadata.passportNo || '',
      idType: metadata.idType || 'Aadhaar Card',
      idNumber: metadata.idNumber || '',
      dietPreference: metadata.dietPreference || 'Vegetarian',
      roomPreference: metadata.roomPreference || 'Mountain View / King Bed',
      emergencyContact: metadata.emergencyContact || '',
      authProvider: 'google',
      memberTier: metadata.memberTier || 'Holidays Hunt Elite',
      memberSince: new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      rewardCoins: metadata.rewardCoins !== undefined ? metadata.rewardCoins : 2500,
      coTravelers: metadata.coTravelers || [
        {
          id: 'cotrav-01',
          fullName: 'Priya Sharma',
          relationship: 'Spouse',
          gender: 'Female',
          age: 29,
          idNumber: 'XXXX-XXXX-4819',
        }
      ],
    };
  };

  // Traveler Auth States (Persisted & Synced with D1 / Backend)
  const [travelerUser, setTravelerUserRaw] = useState<TravelerUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('hh_direct_traveler_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hh_google_oauth_token');
    } catch {
      return null;
    }
  });

  const setTravelerUser = (user: TravelerUserProfile | null) => {
    setTravelerUserRaw(user);
    try {
      if (user) {
        localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(user));
      } else {
        localStorage.removeItem('hh_direct_traveler_profile');
      }
    } catch {}
  };

  const updateTravelerProfile = async (updatedData: Partial<TravelerUserProfile>) => {
    if (!travelerUser) return;
    const merged: TravelerUserProfile = {
      ...travelerUser,
      ...updatedData,
    };
    setTravelerUserRaw(merged);
    try {
      localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(merged));
    } catch {}

    try {
      await fetch('/api/auth/traveler/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: merged }),
      });
    } catch (err) {
      console.error('Failed to sync traveler profile with backend:', err);
    }
  };

  // Google Sign-In via ID Token (from @react-oauth/google GoogleLogin / One-Tap)
  const loginWithGoogleIdToken = async (idToken: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Google verification failed.');
      }

      const data = await response.json();
      if (data.user) {
        setTravelerUserRaw(data.user);
        try {
          localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(data.user));
          localStorage.setItem('hh_google_oauth_token', idToken);
        } catch {}
        setGoogleToken(idToken);
      }
    } catch (err) {
      console.error('Failed to authenticate Google ID Token:', err);
      throw err;
    }
  };

  // Google Sign-In via Access Token
  const loginWithGoogleAccessToken = async (accessToken: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Google verification failed.');
      }

      const data = await response.json();
      if (data.user) {
        setTravelerUserRaw(data.user);
        try {
          localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(data.user));
          localStorage.setItem('hh_google_oauth_token', accessToken);
        } catch {}
        setGoogleToken(accessToken);
      }
    } catch (err) {
      console.error('Failed to authenticate Google Access Token:', err);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    // Open traveler auth modal to allow Google login or OTP
    setIsTravelerAuthModalOpen(true);
  };

  // Secure Email + Password Sign Up
  const signupWithPassword = async (params: { email: string; password: string; fullName: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/traveler/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (data.user) {
        setTravelerUserRaw(data.user);
        try {
          localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(data.user));
        } catch {}
      }
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  // Secure Email + Password Sign In
  const loginWithPassword = async (params: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/traveler/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      if (data.user) {
        setTravelerUserRaw(data.user);
        try {
          localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(data.user));
        } catch {}
      }
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  // 6-Digit Email OTP Dispatch
  const sendOtpCode = async (email: string) => {
    try {
      const res = await fetch('/api/auth/traveler/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      return data;
    } catch (err) {
      console.error('Send OTP error:', err);
      throw err;
    }
  };

  // 6-Digit Email OTP Verification
  const verifyOtpCode = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/traveler/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification code failed.');
      }

      if (data.user) {
        setTravelerUserRaw(data.user);
        try {
          localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(data.user));
        } catch {}
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      throw err;
    }
  };

  // Reset Password with Verified OTP
  const resetPasswordWithOtp = async (params: { email: string; otp: string; newPassword: string }) => {
    try {
      const res = await fetch('/api/auth/traveler/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      if (data.user) {
        setTravelerUserRaw(data.user);
        try {
          localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(data.user));
        } catch {}
      }

      return data;
    } catch (err) {
      console.error('Reset password error:', err);
      throw err;
    }
  };

  const loginWithMagicLink = async (email: string) => {
    await sendOtpCode(email);
  };

  const connectGoogleCalendar = async () => {
    console.log('Google calendar sync requested.');
  };

  const logoutTraveler = () => {
    try {
      localStorage.removeItem('hh_direct_traveler_profile');
      localStorage.removeItem('hh_google_oauth_token');
    } catch {}
    setTravelerUserRaw(null);
    setGoogleToken(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
  };

  const [isTravelerAuthModalOpen, setIsTravelerAuthModalOpen] = useState<boolean>(false);
  const [isTravelerProfileOpen, setIsTravelerProfileOpen] = useState<boolean>(false);

  const navigateToTravelerProfile = () => {
    setActiveView('traveler');
    setIsTravelerProfileOpen(true);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setActiveCustomPageSlug(null);
    setActiveInfoPageRaw(null);
    setIsTravelerAuthModalOpen(false); // close modal if open
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/profile');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToInfoPage = (slug: string | null) => {
    setActiveView('traveler');
    setActiveInfoPageRaw(slug);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setActiveCustomPageSlug(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      if (slug) {
        if (slug === 'honeymoon' || slug === 'family' || slug === 'pilgrimage') {
          window.history.pushState({}, '', `/${slug}`);
        } else {
          window.history.pushState({}, '', `/info/${slug}`);
        }
      } else {
        window.history.pushState({}, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setActiveInfoPage = (slug: string | null) => {
    navigateToInfoPage(slug);
  };

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [currency, setCurrency] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENCY) || '₹';
    } catch {}
    return '₹';
  });

  // Push Notifications System State & Initializers
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUSH_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PUSH_NOTIFICATIONS;
  });

  const [pushSubscribers, setPushSubscribers] = useState<PushSubscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUSH_SUBSCRIBERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PUSH_SUBSCRIBERS;
  });

  const [pushSettings, setPushSettings] = useState<PushSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUSH_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PUSH_SETTINGS;
  });

  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PUSH_SUBSCRIBED) === 'true';
    } catch {}
    return false;
  });

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PUSH_NOTIFICATIONS, JSON.stringify(pushNotifications));
    } catch {}
  }, [pushNotifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PUSH_SUBSCRIBERS, JSON.stringify(pushSubscribers));
    } catch {}
  }, [pushSubscribers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PUSH_SETTINGS, JSON.stringify(pushSettings));
    } catch {}
  }, [pushSettings]);

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser Push Notifications are not supported on this device/browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsPushSubscribed(true);
        try {
          localStorage.setItem(STORAGE_KEYS.PUSH_SUBSCRIBED, 'true');
        } catch {}

        const newSub: PushSubscriber = {
          id: `sub-${Date.now()}`,
          deviceType: window.innerWidth < 768 ? 'mobile_android' : 'desktop',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome Web Browser' : 'Web Browser',
          subscribedAt: new Date().toISOString(),
          location: 'Live Traveler Session',
          segment: 'Kashmir Enthusiasts',
          status: 'active',
        };
        setPushSubscribers((prev) => [newSub, ...prev]);

        if (pushSettings.enabled) {
          try {
            new Notification(pushSettings.welcomeNotificationTitle || '🎉 Notifications Enabled!', {
              body: pushSettings.welcomeNotificationBody || 'You will now receive instant travel alerts & deal drops.',
              icon: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=120&q=80',
            });
          } catch {}
        }
        return true;
      } else {
        alert(`Notification permission status: ${permission}`);
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  };

  const sendPushNotification = (
    notificationData: Omit<PushNotification, 'id' | 'sentAt' | 'stats' | 'status'>
  ) => {
    const newId = `push-${Date.now()}`;
    const activeSubCount = pushSubscribers.filter((s) => s.status === 'active').length || 1;
    const newNotif: PushNotification = {
      ...notificationData,
      id: newId,
      sentAt: new Date().toISOString(),
      status: 'sent',
      stats: {
        recipientsCount: activeSubCount,
        deliveredCount: activeSubCount,
        clicksCount: 0,
      },
      isRead: false,
    };

    setPushNotifications((prev) => [newNotif, ...prev]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const nativeNotif = new Notification(newNotif.title, {
          body: newNotif.body,
          icon: newNotif.icon || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=120&q=80',
          image: newNotif.image,
        } as any);

        nativeNotif.onclick = () => {
          window.focus();
          if (newNotif.url) {
            window.location.href = newNotif.url;
          }
        };
      } catch (e) {
        console.warn('Native browser push display error:', e);
      }
    }
  };

  const deletePushNotification = (id: string) => {
    markItemDeleted('hh_deleted_push_notification_ids', id);
    setPushNotifications((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PUSH_NOTIFICATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setPushNotifications((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isRead: true } : p))
    );
  };

  const markAllNotificationsAsRead = () => {
    setPushNotifications((prev) => prev.map((p) => ({ ...p, isRead: true })));
  };

  const updatePushSettings = (newSettings: Partial<PushSettings>) => {
    setPushSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Direct tour URLs can be opened before D1 hydration completes. Re-resolve the
  // exact /tours/<slug> route once the authoritative package registry arrives.
  useEffect(() => {
    if (typeof window === 'undefined' || packages.length === 0) return;
    const path = window.location.pathname.toLowerCase();
    if (!path.startsWith('/tours/')) return;
    const segment = path.replace('/tours/', '').replace(/^\\/+|\\/+$/g, '').split('/')[0];
    if (!segment || ['pilgrimage', 'family', 'honeymoon', 'group', 'luxury'].includes(segment)) return;

    const matchedPkg = packages.find((p) =>
      String(p.id || '').toLowerCase() === segment ||
      String(p.slug || '').toLowerCase() === segment ||
      String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === segment
    );

    if (matchedPkg) {
      _setSelectedPackageId(matchedPkg.id);
      _setSelectedDestinationSlug(null);
      setIsToursDirectoryOpen(false);
      setSelectedToursDestination(null);
    }
  }, [packages]);

  // URL Synchronization & History handling for Google indexable paths
  useEffect(() => {
    const parseUrl = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();

      // 1. Single Exclusive Admin Entry Point: /admin-rudra-0712
      if (path === '/admin-rudra-0712' || path.startsWith('/admin-rudra-0712/') || path.startsWith('/admin-rudra-0712?')) {
        setActiveView('cms');
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        return;
      }

      // 2. Hide / delete any other admin entry points: redirect decoy paths to homepage without revealing secret admin URL
      if (path === '/admin' || path === '/cms' || path === '/login' || path === '/admin-login' || path === '/cms-login' || (path.startsWith('/admin/') && !path.startsWith('/admin-rudra-0712')) || path.startsWith('/cms/')) {
        if (typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState({}, '', '/');
        }
        setActiveView('traveler');
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        return;
      } else if (path === '/jap-counter' || path === '/mala' || path === '/japa-counter') {
        setActiveView('traveler');
        setIsJapCounterOpen(true);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
      } else if (path.startsWith('/travel-blog')) {
        setActiveView('traveler');
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
        setActiveCustomPageSlug(null);
        const subParts = path.replace('/travel-blog', '').replace(/^\/+/, '').split('/');
        if (subParts[0] && subParts[0].length > 0) {
          setIsGuidesHubOpen(false);
          setActiveGuideSlug(subParts[0]);
        } else {
          setIsGuidesHubOpen(true);
          setActiveGuideSlug(null);
        }
      } else if (path.startsWith('/guides') || path.startsWith('/guide')) {
        setActiveView('traveler');
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
        setActiveCustomPageSlug(null);
        const subParts = path.replace('/guides', '').replace('/guide', '').replace(/^\/+/, '').split('/');
        if (subParts[0] && subParts[0].length > 0) {
          setIsGuidesHubOpen(false);
          setActiveGuideSlug(subParts[0]);
        } else {
          setIsGuidesHubOpen(true);
          setActiveGuideSlug(null);
        }
      } else if (path.startsWith('/tour-type/') || path.startsWith('/tour-types/')) {
        setActiveView('traveler');
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setIsDestinationsExplorerOpen(false);
        setActiveCustomPageSlug(null);
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        setIsToursDirectoryOpen(true);
        const categorySegment = path
          .replace('/tour-type/', '')
          .replace('/tour-types/', '')
          .replace(/^\/+/, '')
          .split('/')[0]
          .toLowerCase();
        setSelectedToursDestination(null);
        setSystemSearchParams({ category: categorySegment || 'all' });
      } else if (path.startsWith('/tours')) {
        setActiveView('traveler');
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setIsDestinationsExplorerOpen(false);
        setActiveCustomPageSlug(null);
        const subParts = path.replace('/tours', '').replace(/^\/+/, '').split('/');
        const segment = subParts[0] ? subParts[0].toLowerCase() : '';
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const queryCategory = searchParams ? searchParams.get('category') || searchParams.get('tourType') : null;

        if (segment && ['pilgrimage', 'family', 'honeymoon', 'group', 'luxury'].includes(segment)) {
          _setSelectedPackageId(null);
          setSelectedToursDestination(null);
          setIsToursDirectoryOpen(true);
          setSystemSearchParams({ category: segment });
        } else if (segment && segment.length > 0) {
          // Check if segment matches a package id or slug or title slug
          const matchedPkg = packages.find(p => p.id.toLowerCase() === segment || p.slug.toLowerCase() === segment || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === segment);
          if (matchedPkg) {
            _setSelectedPackageId(matchedPkg.id);
            _setSelectedDestinationSlug(null);
            setIsToursDirectoryOpen(false);
          } else {
            _setSelectedPackageId(null);
            setSelectedToursDestination(segment);
            setIsToursDirectoryOpen(true);
            if (queryCategory) {
              setSystemSearchParams({ destinationSlug: segment, category: queryCategory });
            }
          }
        } else {
          _setSelectedPackageId(null);
          setSelectedToursDestination(null);
          setIsToursDirectoryOpen(true);
          if (queryCategory) {
            setSystemSearchParams({ category: queryCategory });
          }
        }
      } else if (path.startsWith('/destinations')) {
        setActiveView('traveler');
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        _setSelectedPackageId(null);
        setIsGuidesHubOpen(false);
        setActiveGuideSlug(null);
        setIsJapCounterOpen(false);
        const subSlug = path.replace('/destinations', '').replace(/^\/+/, '').split('/')[0];
        if (subSlug && subSlug.length > 0) {
          setIsDestinationsExplorerOpen(false);
          _setSelectedDestinationSlug(subSlug);
        } else {
          setIsDestinationsExplorerOpen(true);
          _setSelectedDestinationSlug(null);
        }
      } else if (path.startsWith('/holidays/')) {
        setActiveView('traveler');
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        _setSelectedPackageId(null);
        setIsGuidesHubOpen(false);
        setActiveGuideSlug(null);
        setIsJapCounterOpen(false);
        const subSlug = path.replace('/holidays/', '').split('/')[0];
        if (subSlug && subSlug.length > 0) {
          setIsDestinationsExplorerOpen(false);
          _setSelectedDestinationSlug(subSlug);
        } else {
          setIsDestinationsExplorerOpen(true);
          _setSelectedDestinationSlug(null);
        }
      } else if (path === '/sitemap' || path === '/sitemap/' || path === '/sitemap.html' || path === '/info/sitemap' || path === '/info/sitemap/') {
        setActiveView('traveler');
        setActiveInfoPage('sitemap');
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        setIsGuidesHubOpen(false);
        setActiveGuideSlug(null);
        setIsJapCounterOpen(false);
      } else if (path === '/honeymoon' || path === '/family' || path === '/pilgrimage') {
        const infoSlug = path.replace('/', '');
        setActiveView('traveler');
        setActiveInfoPage(infoSlug);
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
      } else if (path.startsWith('/info/')) {
        const infoSlug = path.replace('/info/', '').split('/')[0];
        setActiveView('traveler');
        setActiveInfoPage(infoSlug);
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
      } else if (path.startsWith('/page/')) {
        const pageSlug = path.replace('/page/', '').split('/')[0];
        setActiveView('traveler');
        setActiveCustomPageSlug(pageSlug);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
      } else if (path.includes('/holidays/package/') || path.includes('/package/')) {
        const parts = path.split('/package/');
        const pkgIdOrSlug = parts[1]?.replace('/', '') || '';
        const matchedPkg = packages.find(p => p.id.toLowerCase() === pkgIdOrSlug.toLowerCase() || p.slug.toLowerCase() === pkgIdOrSlug.toLowerCase() || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === pkgIdOrSlug.toLowerCase());
        setActiveView('traveler');
        if (matchedPkg) {
          _setSelectedPackageId(matchedPkg.id);
          const targetSlug = matchedPkg.slug || matchedPkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState({}, '', `/tours/${targetSlug}`);
          }
        } else {
          _setSelectedPackageId(pkgIdOrSlug || null);
        }
        _setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
      } else if (path.startsWith('/holidays/') && path !== '/holidays/' && path !== '/holidays') {
        const slug = path.replace('/holidays/', '').split('/')[0];
        if (slug) {
          setActiveView('traveler');
          _setSelectedDestinationSlug(slug);
          _setSelectedPackageId(null);
          setIsDestinationsExplorerOpen(false);
          setIsToursDirectoryOpen(false);
          setIsBlogHubOpen(false);
          setActiveBlogSlug(null);
        }
      } else {
        setActiveView('traveler');
        _setSelectedPackageId(null);
        _setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setIsGuidesHubOpen(false);
        setActiveGuideSlug(null);
        setActiveCustomPageSlug(null);
        setActiveInfoPageRaw(null);
        setIsJapCounterOpen(false);
        setIsTravelerProfileOpen(false);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    } catch {}
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(destinations));
    } catch {}
  }, [destinations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLES_PLACES, JSON.stringify(temples));
    } catch {}
  }, [temples]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(blogPosts));
    } catch {}
  }, [blogPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOG_CATEGORIES, JSON.stringify(blogCategories));
    } catch {}
  }, [blogCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
    } catch {}
  }, [guides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUIDE_CATEGORIES, JSON.stringify(guideCategories));
    } catch {}
  }, [guideCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PAGES, JSON.stringify(customPages));
    } catch {}
  }, [customPages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAGE_SEO_CONFIGS, JSON.stringify(pageSeoConfigs));
    } catch {}
  }, [pageSeoConfigs]);

  // Hydrate Media Assets from IndexedDB on mount
  useEffect(() => {
    void initMediaStorage().then((dbAssets) => {
      if (Array.isArray(dbAssets) && dbAssets.length > 0) {
        setMediaAssets((prev) => {
          const map = new Map<string, MediaAsset>();
          for (const a of prev) map.set(a.id, a);
          for (const a of dbAssets) map.set(a.id, a);
          return Array.from(map.values());
        });
      }
    });

    // Fetch authoritative destinations from server database
    void fetchDestinationsFromServer().then((serverDests) => {
      // D1 is authoritative after an explicit restore. Do not let newer
      // browser tombstones hide destinations that exist in the restored server state.
      if (serverDests && typeof serverDests === 'object') {
        const cleanServerDests: Record<string, DestinationMeta> = {};
        for (const [k, v] of Object.entries(serverDests)) {
          if (!DISALLOWED_DUMMY_DEST_SLUGS.has(k) && v) {
            cleanServerDests[k] = v;
          }
        }
        if (Object.keys(cleanServerDests).length > 0) {
          setDestinations((prev) => {
            const next = { ...prev, ...cleanServerDests };
            try {
              localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(next));
              const deleted = getDeletedItems('hh_deleted_destination_slugs');
              const restoredSlugs = new Set(Object.keys(cleanServerDests));
              const remainingDeleted = deleted.filter((slug) => !restoredSlugs.has(slug));
              localStorage.setItem('hh_deleted_destination_slugs', JSON.stringify(remainingDeleted));
            } catch {}
            return next;
          });
        }
      }
    });

    // Refresh all shared collections from server
    void loadAuthoritativeServerContent();
  }, []);

  useEffect(() => {
    try {
      void saveAllMediaAssetsToDb(mediaAssets);
      try {
        localStorage.setItem(STORAGE_KEYS.MEDIA_ASSETS, JSON.stringify(mediaAssets));
      } catch (quotaError) {
        console.warn('[TourContext] LocalStorage quota reached for mediaAssets, saving stripped metadata:', quotaError);
        const pruned = mediaAssets.map(({ dataUrl, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEYS.MEDIA_ASSETS, JSON.stringify(pruned));
      }
    } catch {}
  }, [mediaAssets]);

  // Multi-tab / Multi-device cross sync listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      try {
        if (e.key === STORAGE_KEYS.TEMPLES_PLACES && e.newValue) {
          const deletedTempleIds = getDeletedItems('hh_deleted_temple_ids');
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setTemples(parsed.filter((t: TemplePlace) => !deletedTempleIds.includes(t.id) && !deletedTempleIds.includes(t.slug)));
          }
        } else if (e.key === STORAGE_KEYS.DESTINATIONS && e.newValue) {
          const deletedDestSlugs = getDeletedItems('hh_deleted_destination_slugs');
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            const clean: Record<string, DestinationMeta> = {};
            for (const [k, v] of Object.entries(parsed)) {
              if (!deletedDestSlugs.includes(k) && v) {
                clean[k] = v as DestinationMeta;
              }
            }
            setDestinations(clean);
          }
        } else if (e.key === STORAGE_KEYS.PACKAGES && e.newValue) {
          const deletedPkgIds = getDeletedItems('hh_deleted_package_ids');
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPackages(parsed.filter((p: TourPackage) => !deletedPkgIds.includes(p.id)));
        } else if (e.key === STORAGE_KEYS.BLOG_POSTS && e.newValue) {
          const deletedBlogIds = getDeletedItems('hh_deleted_blog_post_ids');
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setBlogPosts(parsed.filter((b: BlogPost) => !deletedBlogIds.includes(b.id)));
        } else if (e.key === STORAGE_KEYS.MEDIA_ASSETS && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMediaAssets(parsed);
        } else if (e.key === STORAGE_KEYS.CUSTOM_PAGES && e.newValue) {
          const deletedPageIds = getDeletedItems('hh_deleted_custom_page_ids');
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCustomPages(parsed.filter((p: CustomPage) => !deletedPageIds.includes(p.id)));
        } else if (e.key === STORAGE_KEYS.PAGE_SEO_CONFIGS && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') setPageSeoConfigs(sanitizePageSeoConfigs(parsed));
        }
      } catch (err) {
        console.warn('Error syncing storage event:', err);
      }
    };

    // When D1 server sync hydrates data into localStorage, update in-memory state
    const handleContentSynced = () => {
      try {
        const deletedDestSlugs = getDeletedItems('hh_deleted_destination_slugs');
        const deletedTempleIds = getDeletedItems('hh_deleted_temple_ids');
        const deletedPkgIds = getDeletedItems('hh_deleted_package_ids');
        const deletedBlogIds = getDeletedItems('hh_deleted_blog_post_ids');
        const deletedPageIds = getDeletedItems('hh_deleted_custom_page_ids');

        const d = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
        if (d) {
          const parsed = JSON.parse(d);
          if (parsed && typeof parsed === 'object') {
            const clean: Record<string, DestinationMeta> = {};
            for (const [k, v] of Object.entries(parsed)) {
              // Server-synced D1 destinations are authoritative after restore.
              // Do not let stale browser tombstones hide restored destinations.
              if (!DISALLOWED_DUMMY_DEST_SLUGS.has(k) && v) {
                clean[k] = v as DestinationMeta;
              }
            }
            const restoredSlugs = new Set(Object.keys(clean));
            const remainingDeleted = deletedDestSlugs.filter((slug) => !restoredSlugs.has(slug));
            try {
              localStorage.setItem('hh_deleted_destination_slugs', JSON.stringify(remainingDeleted));
            } catch {}
            setDestinations(clean);
          }
        }
        const t = localStorage.getItem(STORAGE_KEYS.TEMPLES_PLACES);
        if (t) {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed)) {
            setTemples(parsed.filter((item: TemplePlace) => !deletedTempleIds.includes(item.id) && !deletedTempleIds.includes(item.slug)));
          }
        }
        const p = localStorage.getItem(STORAGE_KEYS.PACKAGES);
        if (p) {
          const parsed = JSON.parse(p);
          if (Array.isArray(parsed)) {
            // Server content is authoritative: if a tour exists in D1, restore it
            // even if an old browser tombstone still contains its package ID.
            const cleaned = parsed
              .filter((item: TourPackage) => !DISALLOWED_DUMMY_PKG_IDS.has(item.id))
              .map((item: TourPackage) => {
                const cat = normalizePackageCategory(item.category || item.tourType);
                return {
                  ...item,
                  category: cat,
                  tourType: cat,
                  status: String(item.status || '').toLowerCase() === 'published' ? 'published' : item.status,
                };
              });
            setPackages(cleaned);
          }
        }
        const b = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
        if (b) {
          const parsed = JSON.parse(b);
          if (Array.isArray(parsed)) setBlogPosts(parsed.filter((item: BlogPost) => !deletedBlogIds.includes(item.id)));
        }
        const m = localStorage.getItem(STORAGE_KEYS.MEDIA_ASSETS);
        if (m) {
          const parsed = JSON.parse(m);
          if (Array.isArray(parsed)) setMediaAssets(parsed);
        }
        const cp = localStorage.getItem(STORAGE_KEYS.CUSTOM_PAGES);
        if (cp) {
          const parsed = JSON.parse(cp);
          if (Array.isArray(parsed)) setCustomPages(parsed.filter((item: CustomPage) => !deletedPageIds.includes(item.id)));
        }
        const s = localStorage.getItem(STORAGE_KEYS.PAGE_SEO_CONFIGS);
        if (s) {
          const parsed = JSON.parse(s);
          if (parsed && typeof parsed === 'object') setPageSeoConfigs(sanitizePageSeoConfigs(parsed));
        }
      } catch (err) {
        console.warn('Error applying synced content to state:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('holidayshunt_content_synced', handleContentSynced);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('holidayshunt_content_synced', handleContentSynced);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_STORAGE_CONFIG, JSON.stringify(cloudStorageSettings));
    } catch {}
  }, [cloudStorageSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch {}
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(agencySettings));
    } catch {}
  }, [agencySettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    } catch {}
  }, [hotels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch {}
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
    } catch {}
  }, [vendors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VENDOR_PAYMENTS, JSON.stringify(vendorPayments));
    } catch {}
  }, [vendorPayments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));
    } catch {}
  }, [registeredUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUIDE_CATEGORIES, JSON.stringify(guideCategories));
    } catch {}
  }, [guideCategories]);

  // High-Level Navigation Handlers
  const navigateToHome = () => {
    setActiveView('traveler');
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setSelectedToursDestination(null);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setActiveInfoPage(null);
    setIsJapCounterOpen(false);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDestination = (slug: string) => {
    setActiveView('traveler');
    _setSelectedDestinationSlug(slug);
    _setSelectedPackageId(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setIsJapCounterOpen(false);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/destinations/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPackage = (idOrSlug: string) => {
    setActiveView('traveler');
    const pkg = packages.find(p => p.id === idOrSlug || p.slug === idOrSlug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === idOrSlug.toLowerCase());
    const targetId = pkg ? pkg.id : idOrSlug;
    const targetSlug = pkg?.slug || (pkg?.title ? pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : idOrSlug);

    _setSelectedPackageId(targetId);
    _setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setIsJapCounterOpen(false);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/tours/${targetSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSearch = (params?: SystemSearchParams) => {
    setActiveView('traveler');
    setIsToursDirectoryOpen(true);
    setSelectedToursDestination(
      params?.destinationSlug && params.destinationSlug !== 'all' ? params.destinationSlug : null
    );
    setSystemSearchParams(params || null);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setActiveInfoPageRaw(null);
    setIsJapCounterOpen(false);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      if (params?.category && (!params.destinationSlug || params.destinationSlug === 'all') && !params.searchQuery) {
        window.history.pushState({}, '', `/tour-type/${params.category.toLowerCase()}`);
      } else {
        const destPart =
          params?.destinationSlug && params.destinationSlug !== 'all'
            ? `/${params.destinationSlug}`
            : '';
        const queryPart = params?.searchQuery ? `?q=${encodeURIComponent(params.searchQuery)}` : '';
        const catPart = params?.category && params.category !== 'all' ? `${queryPart ? '&' : '?'}category=${params.category.toLowerCase()}` : '';
        window.history.pushState({}, '', `/tours${destPart}${queryPart}${catPart}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAllTours = () => {
    navigateToSearch({ destinationSlug: 'all' });
  };

  const navigateToDestinationTours = (destinationSlug: string) => {
    setActiveView('traveler');
    setIsToursDirectoryOpen(true);
    setSelectedToursDestination(destinationSlug);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/tours/${destinationSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBlogHub = () => {
    navigateToGuideHub();
  };

  const navigateToBlogPost = (slug: string) => {
    navigateToGuideDetail(slug);
  };

  const navigateToGuideHub = () => {
    setActiveView('traveler');
    setIsGuidesHubOpen(true);
    setActiveGuideSlug(null);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsToursDirectoryOpen(false);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setActiveCustomPageSlug(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/guides');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToGuideDetail = (slug: string) => {
    setActiveView('traveler');
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(slug);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsToursDirectoryOpen(false);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setActiveCustomPageSlug(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/guides/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCustomPage = (slug: string) => {
    setActiveView('traveler');
    setActiveCustomPageSlug(slug);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setIsToursDirectoryOpen(false);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/page/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToJapCounter = () => {
    setActiveView('traveler');
    setIsJapCounterOpen(true);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setActiveInfoPageRaw(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/jap-counter');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDestinationsExplorer = () => {
    setActiveView('traveler');
    setIsDestinationsExplorerOpen(true);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/destinations');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setActiveView('cms');
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsGuidesHubOpen(false);
    setActiveGuideSlug(null);
    setActiveCustomPageSlug(null);
    _setSelectedPackageId(null);
    _setSelectedDestinationSlug(null);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/admin-rudra-0712');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDestinationsExplorer = () => {
    setIsDestinationsExplorerOpen(true);
  };

  const closeDestinationsExplorer = () => {
    setIsDestinationsExplorerOpen(false);
  };

  const toggleWishlist = (id: string) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isWishlisted = (id: string) => wishlistIds.includes(id);

  useEffect(() => {
    if (selectedPackageId || selectedDestinationSlug || isDestinationsExplorerOpen || isToursDirectoryOpen || isBlogHubOpen || activeBlogSlug || activeCustomPageSlug || activeInfoPage || isJapCounterOpen) {
      setIsTravelerProfileOpen(false);
    }
  }, [selectedPackageId, selectedDestinationSlug, isDestinationsExplorerOpen, isToursDirectoryOpen, isBlogHubOpen, activeBlogSlug, activeCustomPageSlug, activeInfoPage, isJapCounterOpen]);

  // Packages Operations
  const addPackage = (newPkg: Omit<TourPackage, 'id' | 'createdAt'>): string => {
    const id = `pkg-${Date.now()}`;
    const cleanCat = normalizePackageCategory(newPkg.category || newPkg.tourType);
    const pkgWithId: TourPackage = {
      ...newPkg,
      id,
      category: cleanCat,
      tourType: cleanCat,
      createdAt: new Date().toISOString(),
    };
    unmarkItemDeleted('hh_deleted_package_ids', id);
    setPackages((prev) => {
      const next = [pkgWithId, ...prev.filter(p => p.id !== id && !DISALLOWED_DUMMY_PKG_IDS.has(p.id))];
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      } catch {}
      void syncRegistryToServer(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      return next;
    });
    return id;
  };

  const updatePackage = (updatedPkg: TourPackage) => {
    unmarkItemDeleted('hh_deleted_package_ids', updatedPkg.id);
    const cleanCat = normalizePackageCategory(updatedPkg.category || updatedPkg.tourType);
    const sanitizedPkg: TourPackage = {
      ...updatedPkg,
      category: cleanCat,
      tourType: cleanCat,
    };
    setPackages((prev) => {
      const next = prev
        .filter(p => !DISALLOWED_DUMMY_PKG_IDS.has(p.id))
        .map((pkg) => (pkg.id === sanitizedPkg.id ? sanitizedPkg : pkg));
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      } catch {}
      void syncRegistryToServer(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      return next;
    });
  };

  const deletePackage = (id: string) => {
    markItemDeleted('hh_deleted_package_ids', id);
    setPackages((prev) => {
      const next = prev.filter((pkg) => pkg.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      } catch {}
      void syncRegistryToServer(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      return next;
    });
  };

  const duplicatePackage = (id: string) => {
    const original = packages.find((p) => p.id === id);
    if (!original) return;
    const newId = `pkg-${Date.now()}`;
    const cleanCat = normalizePackageCategory(original.category || original.tourType);
    const duplicated: TourPackage = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: original.status || 'published',
      category: cleanCat,
      tourType: cleanCat,
      featured: false,
      createdAt: new Date().toISOString(),
    };
    unmarkItemDeleted('hh_deleted_package_ids', newId);
    setPackages((prev) => {
      const next = [duplicated, ...prev.filter(p => p.id !== newId && !DISALLOWED_DUMMY_PKG_IDS.has(p.id))];
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      } catch {}
      void syncRegistryToServer(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      return next;
    });
  };

  const togglePublishStatus = (id: string) => {
    setPackages((prev) => {
      const next = prev.map((pkg) =>
        pkg.id === id
          ? { ...pkg, status: (pkg.status === 'published' ? 'draft' : 'published') as 'published' | 'draft' }
          : pkg
      );
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      } catch {}
      void syncRegistryToServer(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      return next;
    });
  };

  const toggleFeatured = (id: string) => {
    setPackages((prev) => {
      const next = prev.map((pkg) => (pkg.id === id ? { ...pkg, featured: !pkg.featured } : pkg));
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Destinations Operations
  const addDestination = (newDest: Omit<DestinationMeta, 'id'>): string => {
    const slug = newDest.slug || newDest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const id = slug;
    const destinationItem: DestinationMeta = {
      ...newDest,
      id,
      slug,
    };
    unmarkItemDeleted('hh_deleted_destination_slugs', slug);
    setDestinations((prev) => {
      const next = {
        ...prev,
        [destinationItem.slug]: destinationItem,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    void saveDestinationToServer(destinationItem);
    return destinationItem.slug;
  };

  const updateDestination = (updatedDest: DestinationMeta) => {
    unmarkItemDeleted('hh_deleted_destination_slugs', updatedDest.slug);
    setDestinations((prev) => {
      const next = {
        ...prev,
        [updatedDest.slug]: updatedDest,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    void saveDestinationToServer(updatedDest);
  };

  const deleteDestination = (slug: string) => {
    markItemDeleted('hh_deleted_destination_slugs', slug);
    setDestinations((prev) => {
      const next = { ...prev };
      delete next[slug];
      try {
        localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(next));
        const rawV2 = localStorage.getItem('hh_destinations_registry_v2');
        if (rawV2) {
          try {
            const parsedV2 = JSON.parse(rawV2);
            delete parsedV2[slug];
            localStorage.setItem('hh_destinations_registry_v2', JSON.stringify(parsedV2));
          } catch {}
        }
      } catch {}
      return next;
    });
    void deleteDestinationFromServer(slug);
  };

  const duplicateDestination = (slug: string) => {
    const original = destinations[slug];
    if (!original) return;
    const newSlug = `${original.slug}-copy`;
    const copy: DestinationMeta = {
      ...original,
      id: newSlug,
      slug: newSlug,
      name: `${original.name} (Copy)`,
      displayName: `${original.displayName} (COPY)`,
    };
    unmarkItemDeleted('hh_deleted_destination_slugs', newSlug);
    setDestinations((prev) => {
      const next = {
        ...prev,
        [newSlug]: copy,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    void saveDestinationToServer(copy);
  };

  // Temples & Sacred Shrines Operations
  const addTemple = (templeData: Omit<TemplePlace, 'id' | 'slug'> & { id?: string; slug?: string }): string => {
    const slug = templeData.slug || templeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = templeData.id || `temple-${Date.now()}`;
    const newTemple: TemplePlace = {
      ...templeData,
      id,
      slug,
      order: templeData.order ?? (temples.length + 1),
    };
    unmarkItemDeleted('hh_deleted_temple_ids', id);
    unmarkItemDeleted('hh_deleted_temple_ids', slug);
    setTemples((prev) => {
      const next = [...prev, newTemple];
      try {
        localStorage.setItem(STORAGE_KEYS.TEMPLES_PLACES, JSON.stringify(next));
      } catch {}
      return next;
    });
    return newTemple.id;
  };

  const updateTemple = (updatedTemple: TemplePlace) => {
    unmarkItemDeleted('hh_deleted_temple_ids', updatedTemple.id);
    unmarkItemDeleted('hh_deleted_temple_ids', updatedTemple.slug);
    setTemples((prev) => {
      const next = prev.map((t) => (t.id === updatedTemple.id ? updatedTemple : t));
      try {
        localStorage.setItem(STORAGE_KEYS.TEMPLES_PLACES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteTemple = (id: string) => {
    const target = temples.find(t => t.id === id || t.slug === id);
    if (target) {
      markItemDeleted('hh_deleted_temple_ids', target.id);
      markItemDeleted('hh_deleted_temple_ids', target.slug);
    } else {
      markItemDeleted('hh_deleted_temple_ids', id);
    }
    setTemples((prev) => {
      const next = prev.filter((t) => t.id !== id && t.slug !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.TEMPLES_PLACES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const navigateToTemple = (templeId: string) => {
    const temple = temples.find((t) => t.id === templeId || t.slug === templeId);
    setSelectedTempleId(temple ? temple.id : templeId);
    navigateToSearch({
      templeId: temple ? temple.id : templeId,
      templeName: temple ? temple.name : undefined,
    });
  };

  // Blog Posts Operations
  const addBlogPost = (newPost: Omit<BlogPost, 'id' | 'publishedAt' | 'viewsCount'>): string => {
    const id = `post-${Date.now()}`;
    const post: BlogPost = {
      ...newPost,
      id,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      likesCount: 0,
    };
    unmarkItemDeleted('hh_deleted_blog_post_ids', id);
    setBlogPosts((prev) => {
      const next = [post, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(next));
      } catch {}
      return next;
    });
    return post.slug || id;
  };

  const updateBlogPost = (updatedPost: BlogPost) => {
    unmarkItemDeleted('hh_deleted_blog_post_ids', updatedPost.id);
    setBlogPosts((prev) => {
      const next = prev.map((post) =>
        post.id === updatedPost.id
          ? { ...updatedPost, updatedAt: new Date().toISOString() }
          : post
      );
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteBlogPost = (id: string) => {
    markItemDeleted('hh_deleted_blog_post_ids', id);
    setBlogPosts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const duplicateBlogPost = (id: string) => {
    const original = blogPosts.find((p) => p.id === id);
    if (!original) return;
    const newId = `post-${Date.now()}`;
    const copy: BlogPost = {
      ...original,
      id: newId,
      slug: `${original.slug}-copy`,
      title: `${original.title} (Draft Copy)`,
      status: 'draft',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
    };
    unmarkItemDeleted('hh_deleted_blog_post_ids', newId);
    setBlogPosts((prev) => {
      const next = [copy, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleBlogPostStatus = (id: string) => {
    setBlogPosts((prev) => {
      const next = prev.map((post) =>
        post.id === id
          ? {
              ...post,
              status: (post.status === 'published' ? 'draft' : 'published') as 'published' | 'draft',
              updatedAt: new Date().toISOString(),
            }
          : post
      );
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addBlogCategory = (cat: Omit<BlogCategory, 'id'>) => {
    const id = `cat-${Date.now()}`;
    unmarkItemDeleted('hh_deleted_blog_category_ids', id);
    setBlogCategories((prev) => {
      const next = [...prev, { ...cat, id, postCount: 0 }];
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_CATEGORIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateBlogCategory = (cat: BlogCategory) => {
    unmarkItemDeleted('hh_deleted_blog_category_ids', cat.id);
    setBlogCategories((prev) => {
      const next = prev.map((c) => (c.id === cat.id ? cat : c));
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_CATEGORIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteBlogCategory = (id: string) => {
    markItemDeleted('hh_deleted_blog_category_ids', id);
    setBlogCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BLOG_CATEGORIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Pilgrimage & Travel Guides Operations
  const addGuide = (newGuide: Omit<GuideArticle, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `guide-${Date.now()}`;
    const now = new Date().toISOString();
    const created: GuideArticle = {
      ...newGuide,
      id,
      createdAt: now,
      updatedAt: now,
      status: 'draft', // Critical rule: newly created article always starts as draft!
    };
    unmarkItemDeleted('hh_deleted_guide_ids', id);
    setGuides((prev) => {
      const next = [created, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
    return id;
  };

  const updateGuide = (updated: GuideArticle) => {
    unmarkItemDeleted('hh_deleted_guide_ids', updated.id);
    setGuides((prev) => {
      const next = prev.map((g) => (g.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : g));
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteGuide = (id: string) => {
    markItemDeleted('hh_deleted_guide_ids', id);
    setGuides((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const moveGuideToReview = (id: string) => {
    setGuides((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, status: 'review' as const, updatedAt: new Date().toISOString() } : g));
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const publishGuide = (id: string) => {
    setGuides((prev) => {
      const next = prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: 'published' as const,
              publishedAt: g.publishedAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : g
      );
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const unpublishGuide = (id: string) => {
    setGuides((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, status: 'draft' as const, updatedAt: new Date().toISOString() } : g));
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const returnGuideToDraft = (id: string) => {
    setGuides((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, status: 'draft' as const, updatedAt: new Date().toISOString() } : g));
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const duplicateGuide = (id: string) => {
    const existing = guides.find((g) => g.id === id);
    if (!existing) return;
    const now = new Date().toISOString();
    const newId = `guide-${Date.now()}`;
    const duplicated: GuideArticle = {
      ...existing,
      id: newId,
      slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
      title: `${existing.title} (Copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    unmarkItemDeleted('hh_deleted_guide_ids', newId);
    setGuides((prev) => {
      const next = [duplicated, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addGuideCategory = (cat: Omit<GuideCategory, 'id'>) => {
    const newCat: GuideCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
      guideCount: 0,
    };
    unmarkItemDeleted('hh_deleted_guide_category_ids', newCat.id);
    setGuideCategories((prev) => {
      const next = [...prev, newCat];
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDE_CATEGORIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateGuideCategory = (cat: GuideCategory) => {
    unmarkItemDeleted('hh_deleted_guide_category_ids', cat.id);
    setGuideCategories((prev) => {
      const next = prev.map((c) => (c.id === cat.id ? cat : c));
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDE_CATEGORIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteGuideCategory = (id: string) => {
    markItemDeleted('hh_deleted_guide_category_ids', id);
    setGuideCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.GUIDE_CATEGORIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Custom Pages Operations
  const addCustomPage = (newPage: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `page-${Date.now()}`;
    const page: CustomPage = {
      ...newPage,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    unmarkItemDeleted('hh_deleted_custom_page_ids', id);
    setCustomPages((prev) => {
      const next = [page, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PAGES, JSON.stringify(next));
      } catch {}
      return next;
    });
    return page.slug || id;
  };

  const updateCustomPage = (updatedPage: CustomPage) => {
    unmarkItemDeleted('hh_deleted_custom_page_ids', updatedPage.id);
    setCustomPages((prev) => {
      const next = prev.map((p) =>
        p.id === updatedPage.id
          ? { ...updatedPage, updatedAt: new Date().toISOString() }
          : p
      );
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PAGES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteCustomPage = (id: string) => {
    const page = customPages.find(p => p.id === id);
    if (page && (page.isSystemPage || page.slug === 'about-us')) {
      alert("This is a core system page and cannot be deleted.");
      return;
    }
    markItemDeleted('hh_deleted_custom_page_ids', id);
    setCustomPages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PAGES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Media Library Operations
  const addMediaAsset = (asset: MediaAsset) => {
    void saveMediaAssetToDb(asset);
    setMediaAssets((prev) => {
      const existingIdx = prev.findIndex(
        (a) => a.id === asset.id || a.url === asset.url || a.storagePath === asset.storagePath
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = asset;
        return next;
      }
      return [asset, ...prev];
    });
  };

  const restoreSampleMedia = () => {
    setMediaAssets(DEFAULT_SAMPLE_MEDIA);
  };

  const deleteMediaAsset = (id: string) => {
    void deleteMediaAssetFromDb(id);
    setMediaAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const updateMediaAsset = (asset: MediaAsset) => {
    void saveMediaAssetToDb(asset);
    setMediaAssets((prev) => prev.map((a) => (a.id === asset.id ? asset : a)));
  };

  const updateCloudStorageSettings = (settings: CloudStorageSettings) => {
    setCloudStorageSettings(settings);
  };

  // Inquiries Operations
  const submitInquiry = (inquiry: Omit<BookingInquiry, 'id' | 'createdAt' | 'status'>): string => {
    const id = generateBookingNumber();
    const newInquiry: BookingInquiry = {
      ...inquiry,
      id,
      status: 'New',
      createdAt: new Date().toISOString(),
      timelineLogs: [
        {
          id: `log-${Date.now()}`,
          author: 'System (Online Traveler Portal)',
          action: 'Inquiry Submitted',
          note: `Booking request received for ${inquiry.packageTitle} (${inquiry.adults} Adults, ${inquiry.children} Children). Travel date: ${inquiry.travelDate}. Booking Ref: ${id}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setInquiries((prev) => [newInquiry, ...prev]);

    // Also link booking ID to registered user if matching email exists
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === inquiry.email.toLowerCase()) {
          const currentB = u.bookingIds || [];
          return {
            ...u,
            totalBookings: (u.totalBookings || 0) + 1,
            totalSpent: (u.totalSpent || 0) + (inquiry.estimatedTotal || 0),
            bookingIds: currentB.includes(id) ? currentB : [...currentB, id],
          };
        }
        return u;
      })
    );
    
    // Trigger backend notification
    fetch('/api/notify-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadData: newInquiry })
    }).catch(err => console.error('Failed to trigger lead notification:', err));

    return id;
  };

  const updateInquiryStatus = (id: string, status: BookingInquiry['status']) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== id) return inq;
        const log = {
          id: `log-${Date.now()}`,
          author: currentStaffUser.name,
          action: `Status Changed to ${status}`,
          note: `Lead pipeline moved from ${inq.status} to ${status}.`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...inq,
          status,
          timelineLogs: [...(inq.timelineLogs || []), log],
        };
      })
    );
  };

  const assignInquiryStaff = (inquiryId: string, staffId: string, staffName: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        const log = {
          id: `log-${Date.now()}`,
          author: currentStaffUser.name,
          action: `Assigned to ${staffName}`,
          note: `Account lead reassigned for follow-up and custom quotation.`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...inq,
          assignedStaffId: staffId,
          assignedStaffName: staffName,
          timelineLogs: [...(inq.timelineLogs || []), log],
        };
      })
    );
  };

  const updateInquiryQuotation = (inquiryId: string, quotation: InquiryQuotation) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        const log = {
          id: `log-${Date.now()}`,
          author: currentStaffUser.name,
          action: 'Quotation Updated',
          note: `Official quote generated: ${agencySettings.currencySymbol}${quotation.finalPrice?.toLocaleString('en-IN')} (Valid until ${quotation.validUntil}).`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...inq,
          status: inq.status === 'New' ? 'Quotation Sent' : inq.status,
          quotation,
          timelineLogs: [...(inq.timelineLogs || []), log],
        };
      })
    );
  };

  const addInquiryTimelineLog = (inquiryId: string, action: string, note: string) => {
    const log = {
      id: `log-${Date.now()}`,
      author: currentStaffUser.name,
      action,
      note,
      timestamp: new Date().toISOString(),
    };
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === inquiryId
          ? { ...inq, timelineLogs: [...(inq.timelineLogs || []), log] }
          : inq
      )
    );
  };

  const updateInquiry = (updatedInquiry: BookingInquiry) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== updatedInquiry.id) return inq;
        const log = {
          id: `log-${Date.now()}`,
          author: currentStaffUser.name,
          action: 'Booking Details Edited',
          note: `Booking details updated by staff. Travel Date: ${updatedInquiry.travelDate}, Guests: ${updatedInquiry.adults}A/${updatedInquiry.children}C, Est. Total: ₹${updatedInquiry.estimatedTotal || 0}.`,
          timestamp: new Date().toISOString(),
        };
        return {
          ...updatedInquiry,
          timelineLogs: [...(updatedInquiry.timelineLogs || inq.timelineLogs || []), log],
        };
      })
    );
  };

  const deleteInquiry = (id: string) => {
    markItemDeleted('hh_deleted_inquiry_ids', id);
    setInquiries((prev) => {
      const next = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const updateInquiryEmail = (inquiryId: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        return {
          ...inq,
          email: cleanEmail,
          timelineLogs: [
            ...(inq.timelineLogs || []),
            {
              id: `log-${Date.now()}`,
              author: 'Traveler Portal',
              action: 'Email Linked',
              note: `Inquiry linked to traveler email: ${cleanEmail}`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const linkInquiriesByPhoneOrId = (identifier: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const rawClean = identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!rawClean || !cleanEmail) return { linkedCount: 0, matchedInquiries: [] };

    let count = 0;
    const matched: BookingInquiry[] = [];

    setInquiries((prev) =>
      prev.map((inq) => {
        const inqPhoneClean = (inq.phone || '').replace(/[^0-9]/g, '');
        const inqIdClean = inq.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const inqRefNumber = inq.id.replace(/[^0-9]/g, '');

        const matchesPhone = inqPhoneClean && (
          inqPhoneClean.includes(rawClean) ||
          rawClean.includes(inqPhoneClean) ||
          (rawClean.length >= 8 && inqPhoneClean.endsWith(rawClean.slice(-10)))
        );

        const matchesId =
          inqIdClean === rawClean ||
          inqIdClean.includes(rawClean) ||
          (inqRefNumber && inqRefNumber === rawClean);

        if (matchesPhone || matchesId) {
          count++;
          const updated: BookingInquiry = {
            ...inq,
            email: cleanEmail,
            timelineLogs: [
              ...(inq.timelineLogs || []),
              {
                id: `log-${Date.now()}`,
                author: 'Traveler Portal Sync',
                action: 'Synced via Phone/Booking ID',
                note: `Linked to traveler account ${cleanEmail} using identifier: ${identifier.trim()}`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
          matched.push(updated);
          return updated;
        }
        return inq;
      })
    );

    return { linkedCount: count, matchedInquiries: matched };
  };

  // Hotel, Staff, Vendor, Invoice operations
  const addHotel = (newHotel: Omit<HotelEntity, 'id' | 'createdAt'>): string => {
    const id = `hotel-${Date.now()}`;
    const h: HotelEntity = { ...newHotel, id, createdAt: new Date().toISOString() };
    setHotels((prev) => [h, ...prev]);
    return id;
  };

  const updateHotel = (updatedHotel: HotelEntity) => {
    setHotels((prev) => prev.map((h) => (h.id === updatedHotel.id ? updatedHotel : h)));
  };

  const deleteHotel = (id: string) => {
    markItemDeleted('hh_deleted_hotel_ids', id);
    setHotels((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addStaffMember = (newStaff: Omit<StaffMember, 'id' | 'joinedAt'>): string => {
    const id = `staff-${Date.now()}`;
    const s: StaffMember = { ...newStaff, id, joinedAt: new Date().toISOString() };
    setStaff((prev) => [...prev, s]);
    return id;
  };

  const updateStaffMember = (updatedStaff: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
    if (currentStaffUser.id === updatedStaff.id) {
      setCurrentStaffUser(updatedStaff);
    }
  };

  const deleteStaffMember = (id: string) => {
    markItemDeleted('hh_deleted_staff_ids', id);
    setStaff((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addVendor = (newVendor: Omit<Vendor, 'id' | 'createdAt'>): string => {
    const id = `vnd-${Date.now()}`;
    const v: Vendor = { ...newVendor, id, createdAt: new Date().toISOString() };
    setVendors((prev) => [v, ...prev]);
    return id;
  };

  const updateVendor = (updatedVendor: Vendor) => {
    setVendors((prev) => prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
  };

  const deleteVendor = (id: string) => {
    markItemDeleted('hh_deleted_vendor_ids', id);
    setVendors((prev) => {
      const next = prev.filter((v) => v.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addVendorPayment = (
    newPayment: Omit<VendorPayment, 'id' | 'createdAt' | 'voucherNumber'>
  ): string => {
    const id = `vp-${Date.now()}`;
    const voucherNumber = `${agencySettings.voucherPrefix || 'VOU-HH-'}${Math.floor(1000 + Math.random() * 9000)}`;
    const vp: VendorPayment = {
      ...newPayment,
      id,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };
    setVendorPayments((prev) => [vp, ...prev]);
    return id;
  };

  const updateVendorPayment = (updatedPayment: VendorPayment) => {
    setVendorPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
  };

  const deleteVendorPayment = (id: string) => {
    markItemDeleted('hh_deleted_vendor_payment_ids', id);
    setVendorPayments((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.VENDOR_PAYMENTS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const recordVendorPaymentTransaction = (
    paymentId: string,
    amount: number,
    mode: string,
    transactionRef: string,
    note: string
  ) => {
    setVendorPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const newPaid = p.paidAmount + amount;
        const newBalance = Math.max(0, p.totalAmount - newPaid);
        const newStatus: VendorPayment['paymentStatus'] =
          newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
        const newLog = {
          id: `vplog-${Date.now()}`,
          amount,
          date: new Date().toISOString().split('T')[0],
          mode,
          transactionRef,
          note,
        };
        return {
          ...p,
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus: newStatus,
          paymentMode: mode as any,
          transactionRef,
          paymentLogs: [...(p.paymentLogs || []), newLog],
        };
      })
    );
  };

  const addInvoice = (newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>): string => {
    const id = `inv-${Date.now()}`;
    const invoiceNumber = `${agencySettings.invoicePrefix || 'HH-2026-'}${Math.floor(1000 + Math.random() * 9000)}`;
    const inv: Invoice = {
      ...newInvoice,
      id,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [inv, ...prev]);
    return id;
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
  };

  const deleteInvoice = (id: string) => {
    markItemDeleted('hh_deleted_invoice_ids', id);
    setInvoices((prev) => {
      const next = prev.filter((inv) => inv.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const recordInvoicePayment = (
    invoiceId: string,
    amount: number,
    method: string,
    transactionRef: string,
    note: string
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = inv.paidAmount + amount;
        const newBalance = Math.max(0, inv.grandTotal - newPaid);
        const newStatus: Invoice['status'] =
          newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
        const newLog = {
          id: `iplog-${Date.now()}`,
          amount,
          date: new Date().toISOString().split('T')[0],
          method,
          transactionRef,
          note,
        };
        return {
          ...inv,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newStatus,
          paymentMode: method,
          paymentReference: transactionRef,
          paymentLogs: [...(inv.paymentLogs || []), newLog],
        };
      })
    );
  };

  const updateAgencySettings = (settings: AgencySettings) => {
    setAgencySettings(settings);
  };

  const resetToDefaults = () => {
    setPackages(DEFAULT_PACKAGES);
    setDestinations(DESTINATIONS_REGISTRY);
    setBlogPosts(DEFAULT_BLOG_POSTS);
    setBlogCategories(DEFAULT_BLOG_CATEGORIES);
    setCustomPages(DEFAULT_CUSTOM_PAGES);
    setPageSeoConfigs(DEFAULT_PAGE_SEO_CONFIGS);
    setMediaAssets(DEFAULT_SAMPLE_MEDIA);
    setCloudStorageSettings(DEFAULT_CLOUD_SETTINGS);
    setAgencySettings(DEFAULT_AGENCY_SETTINGS);
    setStaff(DEFAULT_STAFF);
    setCurrentStaffUser(DEFAULT_STAFF[0]);
    setVendors(DEFAULT_VENDORS);
    setVendorPayments(DEFAULT_VENDOR_PAYMENTS);
    setInvoices(DEFAULT_INVOICES);
    localStorage.clear();
  };

  return (
    <TourContext.Provider
      value={{
        packages,
        inquiries,
        agencySettings,
        hotels,
        staff,
        currentStaffUser,
        setCurrentStaffUser,
        vendors,
        vendorPayments,
        invoices,
        activeView,
        setActiveView,
        selectedPackageId,
        setSelectedPackageId,
        selectedDestinationSlug,
        setSelectedDestinationSlug,
        isDestinationsExplorerOpen,
        openDestinationsExplorer,
        closeDestinationsExplorer,
        isToursDirectoryOpen,
        selectedToursDestination,
        systemSearchParams,
        setSystemSearchParams,
        navigateToSearch,
        isBlogHubOpen,
        activeBlogSlug,
        activeCustomPageSlug,
        activeInfoPage,
        setActiveInfoPage,
        navigateToInfoPage,
        isJapCounterOpen,
        setIsJapCounterOpen,
        navigateToJapCounter,
        navigateToHome,
        navigateToDestination,
        navigateToPackage,
        navigateToAllTours,
        navigateToDestinationTours,
        navigateToBlogHub,
        navigateToBlogPost,
        navigateToGuideHub,
        navigateToGuideDetail,
        navigateToAdmin,
        isGuidesHubOpen,
        setIsGuidesHubOpen,
        activeGuideSlug,
        setActiveGuideSlug,
        navigateToCustomPage,
        navigateToDestinationsExplorer,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        currency,
        setCurrency,
        addPackage,
        updatePackage,
        deletePackage,
        duplicatePackage,
        togglePublishStatus,
        toggleFeatured,
        destinations,
        addDestination,
        updateDestination,
        deleteDestination,
        duplicateDestination,
        temples,
        addTemple,
        updateTemple,
        deleteTemple,
        selectedTempleId,
        setSelectedTempleId,
        navigateToTemple,
        blogPosts,
        blogCategories,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        duplicateBlogPost,
        toggleBlogPostStatus,
        addBlogCategory,
        updateBlogCategory,
        deleteBlogCategory,
        guides,
        guideCategories,
        addGuide,
        updateGuide,
        deleteGuide,
        duplicateGuide,
        moveGuideToReview,
        publishGuide,
        unpublishGuide,
        returnGuideToDraft,
        addGuideCategory,
        updateGuideCategory,
        deleteGuideCategory,
        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,
        pageSeoConfigs,
        updatePageSeoConfig,
        deletePageSeoConfig,
        getPageSeoConfig,
        mediaAssets,
        cloudStorageSettings,
        addMediaAsset,
        deleteMediaAsset,
        updateMediaAsset,
        restoreSampleMedia,
        updateCloudStorageSettings,
        submitInquiry,
        updateInquiry,
        updateInquiryStatus,
        assignInquiryStaff,
        updateInquiryQuotation,
        addInquiryTimelineLog,
        deleteInquiry,
        updateInquiryEmail,
        linkInquiriesByPhoneOrId,
        addHotel,
        updateHotel,
        deleteHotel,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        addVendor,
        updateVendor,
        deleteVendor,
        addVendorPayment,
        updateVendorPayment,
        deleteVendorPayment,
        recordVendorPaymentTransaction,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordInvoicePayment,
        updateAgencySettings,
        resetToDefaults,
        pushNotifications,
        pushSubscribers,
        pushSettings,
        isPushSubscribed,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        requestPushPermission,
        sendPushNotification,
        deletePushNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updatePushSettings,
        registeredUsers,
        addRegisteredUser: (user: Omit<RegisteredTravelerUser, 'id' | 'signupDate'>) => {
          const id = `usr_hh_${Date.now().toString(36)}`;
          const newUser: RegisteredTravelerUser = {
            ...user,
            id,
            signupDate: new Date().toISOString().slice(0, 10),
            lastLogin: 'Just now',
          };
          unmarkItemDeleted('hh_deleted_registered_user_ids', id);
          setRegisteredUsers((prev) => {
            const next = [newUser, ...prev];
            try {
              localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
            } catch {}
            return next;
          });
          return id;
        },
        updateRegisteredUser: (user: RegisteredTravelerUser) => {
          unmarkItemDeleted('hh_deleted_registered_user_ids', user.id);
          setRegisteredUsers((prev) => {
            const next = prev.map((u) => (u.id === user.id ? user : u));
            try {
              localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
            } catch {}
            return next;
          });
        },
        toggleBlockUser: (id: string) => {
          setRegisteredUsers((prev) => {
            const next = prev.map((u) =>
              u.id === id ? { ...u, status: (u.status === 'active' ? 'blocked' : 'active') as 'active' | 'blocked' } : u
            );
            try {
              localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
            } catch {}
            return next;
          });
        },
        deleteRegisteredUser: (id: string) => {
          markItemDeleted('hh_deleted_registered_user_ids', id);
          setRegisteredUsers((prev) => {
            const next = prev.filter((u) => u.id !== id);
            try {
              localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
            } catch {}
            return next;
          });
        },
        travelerUser,
        googleToken,
        setTravelerUser,
        updateTravelerProfile,
        loginWithGoogle,
        loginWithGoogleIdToken,
        loginWithGoogleAccessToken,
        signupWithPassword,
        loginWithPassword,
        sendOtpCode,
        verifyOtpCode,
        resetPasswordWithOtp,
        loginWithMagicLink,
        connectGoogleCalendar,
        logoutTraveler,
        isTravelerAuthModalOpen,
        setIsTravelerAuthModalOpen,
        isTravelerProfileOpen,
        setIsTravelerProfileOpen,
        navigateToTravelerProfile,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTours = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTours must be used within a TourProvider');
  }
  return context;
};

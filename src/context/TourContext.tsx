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
import { BlogPost, BlogCategory, CustomPage, MediaAsset, CloudStorageSettings, RegisteredTravelerUser } from '../types/cms';
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
import { DEFAULT_CUSTOM_PAGES } from '../data/defaultPagesData';
import { DEFAULT_PUSH_NOTIFICATIONS, DEFAULT_PUSH_SUBSCRIBERS, DEFAULT_PUSH_SETTINGS } from '../data/defaultPushData';
import { supabase } from '../utils/supabaseClient';

export interface SystemSearchParams {
  destinationSlug?: string;
  searchQuery?: string;
  category?: string;
  month?: string;
  duration?: string;
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
  navigateToCustomPage: (slug: string) => void;
  navigateToDestinationsExplorer: () => void;
  
  wishlistIds: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  currency: string;
  setCurrency: (c: string) => void;

  // Traveler Authentication State
  travelerUser: TravelerUserProfile | null;
  googleToken: string | null;
  setTravelerUser: (user: TravelerUserProfile | null) => void;
  updateTravelerProfile: (updatedData: Partial<TravelerUserProfile>) => void;
  loginWithGoogle: (customAccount?: { name?: string; email?: string; avatar?: string; phone?: string }) => void;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
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

  // Custom Pages CRUD
  customPages: CustomPage[];
  addCustomPage: (newPage: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCustomPage: (updatedPage: CustomPage) => void;
  deleteCustomPage: (id: string) => void;

  // Media Library & Cloudflare R2 / Supabase Storage
  mediaAssets: MediaAsset[];
  cloudStorageSettings: CloudStorageSettings;
  addMediaAsset: (asset: MediaAsset) => void;
  deleteMediaAsset: (id: string) => void;
  updateMediaAsset: (asset: MediaAsset) => void;
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
  BLOG_POSTS: 'hh_blog_posts_v2',
  BLOG_CATEGORIES: 'hh_blog_categories_v2',
  CUSTOM_PAGES: 'hh_custom_pages_v2',
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
  r2AccountId: 'a9e18b43f76902cd98ef11',
  r2BucketName: 'mybhaktisathi-media-r2',
  r2AccessKeyId: 'r2_prod_key_77a9',
  r2SecretAccessKey: '********************************',
  r2PublicDomain: 'https://pub-r2.mybhaktisathi.com',
  supabaseUrl: 'https://jhyxopkmtuvbrlzp.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mybhaktisathi',
  supabaseServiceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role',
  supabaseBucket: 'mybhaktisathi-storage',
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
    travelerName: 'Bhakti Sathi Guest',
    email: 'care@mybhaktisathi.com',
    phone: '+91 94199 15255',
    travelDate: '2026-09-28',
    adults: 2,
    children: 0,
    specialRequests: 'Traditional Wazwan dinner inclusion and Shikara sunset photo shoot.',
    estimatedTotal: 42000,
    status: 'Confirmed',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'HH65201',
    packageId: 'pkg-ladakh-01',
    packageTitle: 'Mesmerizing Ladakh & Pangong Tso Highland Odyssey',
    travelerName: 'Bhakti Sathi Guest',
    email: 'care@mybhaktisathi.com',
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
  // Helper to normalize category to one of the 3 clean categories
  const normalizePackageCategory = (cat: string): string => {
    const c = (cat || '').toLowerCase().trim();
    if (c.includes('honeymoon') || c.includes('romantic')) return 'Honeymoon';
    if (c.includes('pilgrimage') || c.includes('darshan') || c.includes('yatra') || c.includes('temple') || c.includes('sacred') || c.includes('devi') || c.includes('shaktipeeth')) return 'Pilgrimage';
    return 'Family'; // Default fallback is Family
  };

  // 1. Packages State
  const [packages, setPackages] = useState<TourPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize existing package categories and hydrate group tour defaults if present
          const defaultMap = new Map(DEFAULT_PACKAGES.map((d) => [d.id, d]));
          return parsed.map((pkg) => {
            const def = defaultMap.get(pkg.id);
            return {
              ...pkg,
              category: normalizePackageCategory(pkg.category) as any,
              isGroupTour: pkg.isGroupTour !== undefined ? pkg.isGroupTour : (def?.isGroupTour || false),
              groupTourDetails: pkg.groupTourDetails || def?.groupTourDetails,
            };
          });
        }
      }
    } catch {}
    
    // Also normalize default packages just in case
    return DEFAULT_PACKAGES.map(pkg => ({
      ...pkg,
      category: normalizePackageCategory(pkg.category) as any
    }));
  });

  // 2. Destinations Registry State
  const [destinations, setDestinations] = useState<Record<string, DestinationMeta>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DESTINATIONS_REGISTRY;
  });

  // 3. Blog Posts & Categories State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BLOG_POSTS;
  });

  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOG_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BLOG_CATEGORIES;
  });

  // 4. Custom Pages State
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_PAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CUSTOM_PAGES;
  });

  // 5. Media Assets & Cloud Storage Settings State
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDIA_ASSETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SAMPLE_MEDIA;
  });

  const [cloudStorageSettings, setCloudStorageSettings] = useState<CloudStorageSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_STORAGE_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return DEFAULT_CLOUD_SETTINGS;
  });

  // 6. Inquiries State
  const [inquiries, setInquiries] = useState<BookingInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Ensure seed inquiries for test emails (vip.traveler, mybhaktisathi) are always available
          const existingIds = new Set(parsed.map((p: BookingInquiry) => p.id));
          const missing = DEFAULT_SEED_INQUIRIES.filter((s) => !existingIds.has(s.id));
          return [...parsed, ...missing];
        }
      }
    } catch {}
    return DEFAULT_SEED_INQUIRIES;
  });

  // 7. Agency Settings
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sacredMantra === 'ॐ ऐं ह्रीं श्रीं वैष्णव्यै नमः' || !parsed.sacredMantra) {
          parsed.sacredMantra = 'साम्ब सदाशिव';
        }
        return { ...DEFAULT_AGENCY_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_AGENCY_SETTINGS;
  });

  // 8. ERP Staff, Vendors, Payments, Invoices
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF;
  });

  const [currentStaffUser, setCurrentStaffUser] = useState<StaffMember>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF[0];
  });

  const [hotels, setHotels] = useState<HotelEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOTELS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_VENDORS;
  });

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VENDOR_PAYMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_VENDOR_PAYMENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_INVOICES;
  });

  // Registered Traveler Users State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredTravelerUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_REGISTERED_USERS;
  });

  // 9. Navigation / Routing States
  const [activeView, setActiveView] = useState<'traveler' | 'cms'>('traveler');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDestinationSlug, setSelectedDestinationSlug] = useState<string | null>(null);
  const [isDestinationsExplorerOpen, setIsDestinationsExplorerOpen] = useState<boolean>(false);
  const [isToursDirectoryOpen, setIsToursDirectoryOpen] = useState<boolean>(false);
  const [selectedToursDestination, setSelectedToursDestination] = useState<string | null>(null);
  const [systemSearchParams, setSystemSearchParams] = useState<SystemSearchParams | null>(null);
  const [isBlogHubOpen, setIsBlogHubOpen] = useState<boolean>(false);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
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
      memberTier: metadata.memberTier || 'Bhakti Sathi Elite',
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

  // Traveler Auth States
  const [travelerUser, setTravelerUserRaw] = useState<TravelerUserProfile | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Synchronize with Supabase Auth session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setTravelerUserRaw(mapSupabaseUserToProfile(session.user));
          if (session.provider_token) {
            setGoogleToken(session.provider_token);
            try {
              localStorage.setItem('hh_supabase_google_oauth_token', session.provider_token);
            } catch {}
          } else {
            // Check if we have a persisted token in localStorage
            try {
              const persisted = localStorage.getItem('hh_supabase_google_oauth_token');
              if (persisted) {
                setGoogleToken(persisted);
              }
            } catch {}
          }
        } else {
          setTravelerUserRaw(null);
          setGoogleToken(null);
          try {
            localStorage.removeItem('hh_supabase_google_oauth_token');
          } catch {}
        }
      } catch (err) {
        console.error('Supabase session initialization error:', err);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setTravelerUserRaw(mapSupabaseUserToProfile(session.user));
        if (session.provider_token) {
          setGoogleToken(session.provider_token);
          try {
            localStorage.setItem('hh_supabase_google_oauth_token', session.provider_token);
          } catch {}
        } else {
          try {
            const persisted = localStorage.getItem('hh_supabase_google_oauth_token');
            if (persisted) {
              setGoogleToken(persisted);
            }
          } catch {}
        }
      } else {
        setTravelerUserRaw(null);
        setGoogleToken(null);
        try {
          localStorage.removeItem('hh_supabase_google_oauth_token');
        } catch {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setTravelerUser = (user: TravelerUserProfile | null) => {
    setTravelerUserRaw(user);
  };

  const updateTravelerProfile = async (updatedData: Partial<TravelerUserProfile>) => {
    if (!travelerUser) return;
    const merged: TravelerUserProfile = {
      ...travelerUser,
      ...updatedData,
    };
    setTravelerUserRaw(merged);

    try {
      await supabase.auth.updateUser({
        data: updatedData,
      });
    } catch (err) {
      console.error('Failed to update Supabase user metadata:', err);
    }
  };

  const loginWithGoogle = async (customAccount?: { name?: string; email?: string; avatar?: string; phone?: string }) => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
      
      let redirectUrl = 'https://mybhaktisathi.com/profile';
      if (isLocalhost) {
        redirectUrl = window.location.origin + '/profile';
      } else if (typeof window !== 'undefined' && (window.location.origin.includes('.run.app') || window.location.origin.includes('aistudio'))) {
        redirectUrl = window.location.origin + '/profile';
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid email profile',
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        console.error('Supabase OAuth Error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to initiate Google Sign-In with Supabase:', err);
      throw err;
    }
  };

  const loginWithGoogleIdToken = async (idToken: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) {
        console.error('Supabase signInWithIdToken Error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to authenticate Google ID Token with Supabase:', err);
      throw err;
    }
  };

  const loginWithMagicLink = async (email: string) => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
      
      let redirectUrl = 'https://mybhaktisathi.com/profile';
      if (isLocalhost) {
        redirectUrl = window.location.origin + '/profile';
      } else if (typeof window !== 'undefined' && (window.location.origin.includes('.run.app') || window.location.origin.includes('aistudio'))) {
        redirectUrl = window.location.origin + '/profile';
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        console.error('Supabase OTP Error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to initiate Magic Link with Supabase:', err);
      throw err;
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
      
      let redirectUrl = 'https://mybhaktisathi.com/profile';
      if (isLocalhost) {
        redirectUrl = window.location.origin + '/profile';
      } else if (typeof window !== 'undefined' && (window.location.origin.includes('.run.app') || window.location.origin.includes('aistudio'))) {
        redirectUrl = window.location.origin + '/profile';
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
          },
        },
      });
      if (error) {
        console.error('Supabase OAuth Error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to connect Google Calendar with Supabase:', err);
      throw err;
    }
  };

  const logoutTraveler = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Failed to sign out from Supabase:', err);
    }
    setTravelerUserRaw(null);
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
    setPushNotifications((prev) => prev.filter((p) => p.id !== id));
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

  // URL Synchronization & History handling for Google indexable paths
  useEffect(() => {
    const parseUrl = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();

      // Reset all modals/views
      if (path.includes('/admin') || path.includes('/cms') || path.includes('/erp')) {
        setActiveView('cms');
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
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
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
        setActiveCustomPageSlug(null);
        const subParts = path.replace('/travel-blog', '').replace(/^\/+/, '').split('/');
        if (subParts[0] && subParts[0].length > 0) {
          setIsBlogHubOpen(false);
          setActiveBlogSlug(subParts[0]);
        } else {
          setIsBlogHubOpen(true);
          setActiveBlogSlug(null);
        }
      } else if (path.startsWith('/tours')) {
        setActiveView('traveler');
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setIsDestinationsExplorerOpen(false);
        setActiveCustomPageSlug(null);
        const subParts = path.replace('/tours', '').replace(/^\/+/, '').split('/');
        if (subParts[0] && subParts[0].length > 0) {
          // e.g. /tours/jammu-and-kashmir or /tours/kashmir
          setSelectedToursDestination(subParts[0]);
          setIsToursDirectoryOpen(true);
        } else {
          setSelectedToursDestination(null);
          setIsToursDirectoryOpen(true);
        }
      } else if (path.startsWith('/destinations')) {
        setActiveView('traveler');
        setIsDestinationsExplorerOpen(true);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
      } else if (path === '/honeymoon' || path === '/family' || path === '/pilgrimage') {
        const infoSlug = path.replace('/', '');
        setActiveView('traveler');
        setActiveInfoPage(infoSlug);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
        setActiveCustomPageSlug(null);
      } else if (path.startsWith('/info/')) {
        const infoSlug = path.replace('/info/', '').split('/')[0];
        setActiveView('traveler');
        setActiveInfoPage(infoSlug);
        setSelectedPackageId(null);
        setSelectedDestinationSlug(null);
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
        const pkgId = parts[1]?.replace('/', '') || null;
        setActiveView('traveler');
        setSelectedPackageId(pkgId);
        setSelectedDestinationSlug(null);
        setIsDestinationsExplorerOpen(false);
        setIsToursDirectoryOpen(false);
        setIsBlogHubOpen(false);
        setActiveBlogSlug(null);
      } else if (path.startsWith('/holidays/') && path !== '/holidays/' && path !== '/holidays') {
        const slug = path.replace('/holidays/', '').split('/')[0];
        if (slug) {
          setActiveView('traveler');
          setSelectedDestinationSlug(slug);
          setSelectedPackageId(null);
          setIsDestinationsExplorerOpen(false);
          setIsToursDirectoryOpen(false);
          setIsBlogHubOpen(false);
          setActiveBlogSlug(null);
        }
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
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PAGES, JSON.stringify(customPages));
    } catch {}
  }, [customPages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA_ASSETS, JSON.stringify(mediaAssets));
    } catch {}
  }, [mediaAssets]);

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
    setActiveCustomPageSlug(null);
    setActiveInfoPage(null);
    setIsJapCounterOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDestination = (slug: string) => {
    setActiveView('traveler');
    setSelectedDestinationSlug(slug);
    setSelectedPackageId(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setActiveCustomPageSlug(null);
    setIsJapCounterOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/holidays/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPackage = (id: string) => {
    setActiveView('traveler');
    setSelectedPackageId(id);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setIsToursDirectoryOpen(false);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setActiveCustomPageSlug(null);
    setIsJapCounterOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/package/${id}`);
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
    setActiveCustomPageSlug(null);
    setActiveInfoPageRaw(null);
    setIsJapCounterOpen(false);
    setIsTravelerProfileOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const destPart =
        params?.destinationSlug && params.destinationSlug !== 'all'
          ? `/${params.destinationSlug}`
          : '';
      const queryPart = params?.searchQuery ? `?q=${encodeURIComponent(params.searchQuery)}` : '';
      window.history.pushState({}, '', `/tours${destPart}${queryPart}`);
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
    setActiveCustomPageSlug(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/tours/${destinationSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBlogHub = () => {
    setActiveView('traveler');
    setIsBlogHubOpen(true);
    setActiveBlogSlug(null);
    setIsToursDirectoryOpen(false);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setActiveCustomPageSlug(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/travel-blog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBlogPost = (slug: string) => {
    setActiveView('traveler');
    setIsBlogHubOpen(false);
    setActiveBlogSlug(slug);
    setIsToursDirectoryOpen(false);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
    setActiveCustomPageSlug(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/travel-blog/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCustomPage = (slug: string) => {
    setActiveView('traveler');
    setActiveCustomPageSlug(slug);
    setIsBlogHubOpen(false);
    setActiveBlogSlug(null);
    setIsToursDirectoryOpen(false);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    setIsDestinationsExplorerOpen(false);
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
    setActiveCustomPageSlug(null);
    setSelectedPackageId(null);
    setSelectedDestinationSlug(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/destinations');
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
    const pkgWithId: TourPackage = {
      ...newPkg,
      id,
      createdAt: new Date().toISOString(),
    };
    setPackages((prev) => [pkgWithId, ...prev]);
    return id;
  };

  const updatePackage = (updatedPkg: TourPackage) => {
    setPackages((prev) => prev.map((pkg) => (pkg.id === updatedPkg.id ? updatedPkg : pkg)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  };

  const duplicatePackage = (id: string) => {
    const original = packages.find((p) => p.id === id);
    if (!original) return;
    const duplicated: TourPackage = {
      ...original,
      id: `pkg-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      featured: false,
      createdAt: new Date().toISOString(),
    };
    setPackages((prev) => [duplicated, ...prev]);
  };

  const togglePublishStatus = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === id
          ? { ...pkg, status: pkg.status === 'published' ? 'draft' : 'published' }
          : pkg
      )
    );
  };

  const toggleFeatured = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, featured: !pkg.featured } : pkg))
    );
  };

  // Destinations Operations
  const addDestination = (newDest: Omit<DestinationMeta, 'id'>): string => {
    const id = newDest.slug || `dest-${Date.now()}`;
    const destinationItem: DestinationMeta = {
      ...newDest,
      id,
    };
    setDestinations((prev) => ({
      ...prev,
      [destinationItem.slug]: destinationItem,
    }));
    return destinationItem.slug;
  };

  const updateDestination = (updatedDest: DestinationMeta) => {
    setDestinations((prev) => ({
      ...prev,
      [updatedDest.slug]: updatedDest,
    }));
  };

  const deleteDestination = (slug: string) => {
    setDestinations((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
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
    setDestinations((prev) => ({
      ...prev,
      [newSlug]: copy,
    }));
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
    setBlogPosts((prev) => [post, ...prev]);
    return post.slug || id;
  };

  const updateBlogPost = (updatedPost: BlogPost) => {
    setBlogPosts((prev) =>
      prev.map((post) =>
        post.id === updatedPost.id
          ? { ...updatedPost, updatedAt: new Date().toISOString() }
          : post
      )
    );
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateBlogPost = (id: string) => {
    const original = blogPosts.find((p) => p.id === id);
    if (!original) return;
    const copy: BlogPost = {
      ...original,
      id: `post-${Date.now()}`,
      slug: `${original.slug}-copy`,
      title: `${original.title} (Draft Copy)`,
      status: 'draft',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
    };
    setBlogPosts((prev) => [copy, ...prev]);
  };

  const toggleBlogPostStatus = (id: string) => {
    setBlogPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              status: post.status === 'published' ? 'draft' : 'published',
              updatedAt: new Date().toISOString(),
            }
          : post
      )
    );
  };

  const addBlogCategory = (cat: Omit<BlogCategory, 'id'>) => {
    const id = `cat-${Date.now()}`;
    setBlogCategories((prev) => [...prev, { ...cat, id, postCount: 0 }]);
  };

  const updateBlogCategory = (cat: BlogCategory) => {
    setBlogCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteBlogCategory = (id: string) => {
    setBlogCategories((prev) => prev.filter((c) => c.id !== id));
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
    setCustomPages((prev) => [page, ...prev]);
    return page.slug || id;
  };

  const updateCustomPage = (updatedPage: CustomPage) => {
    setCustomPages((prev) =>
      prev.map((p) =>
        p.id === updatedPage.id
          ? { ...updatedPage, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteCustomPage = (id: string) => {
    setCustomPages((prev) => prev.filter((p) => p.id !== id));
  };

  // Media Library Operations
  const addMediaAsset = (asset: MediaAsset) => {
    setMediaAssets((prev) => [asset, ...prev]);
  };

  const deleteMediaAsset = (id: string) => {
    setMediaAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const updateMediaAsset = (asset: MediaAsset) => {
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
    setInquiries((prev) => prev.filter((i) => i.id !== id));
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
    setHotels((prev) => prev.filter((h) => h.id !== id));
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
    setStaff((prev) => prev.filter((s) => s.id !== id));
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
    setVendors((prev) => prev.filter((v) => v.id !== id));
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
    setVendorPayments((prev) => prev.filter((p) => p.id !== id));
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
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
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
        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,
        mediaAssets,
        cloudStorageSettings,
        addMediaAsset,
        deleteMediaAsset,
        updateMediaAsset,
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
          setRegisteredUsers((prev) => [newUser, ...prev]);
          return id;
        },
        updateRegisteredUser: (user: RegisteredTravelerUser) => {
          setRegisteredUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
        },
        toggleBlockUser: (id: string) => {
          setRegisteredUsers((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
            )
          );
        },
        deleteRegisteredUser: (id: string) => {
          setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
        },
        travelerUser,
        googleToken,
        setTravelerUser,
        updateTravelerProfile,
        loginWithGoogle,
        loginWithGoogleIdToken,
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

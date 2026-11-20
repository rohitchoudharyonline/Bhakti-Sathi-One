export type TourType = 'Family' | 'Honeymoon' | 'Pilgrimage';

export type PackageCategory =
  | 'Family'
  | 'Honeymoon'
  | 'Pilgrimage'
  | string;

export type PackageBadge =
  | 'Featured'
  | 'Best Seller'
  | 'Trending'
  | 'Top Rated'
  | 'Heritage Classic'
  | 'Fun & Leisure'
  | 'Darshan Assistance'
  | 'VIP Darshan'
  | 'Helicopter'
  | 'Senior Friendly'
  | 'Daily Meals'
  | 'Flash Deal'
  | string;

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Hi-Tea';

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface TourReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  location?: string;
  verified?: boolean;
  photoUrl?: string;
}

export interface HotelEntity {
  id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  reviews: Review[];
  overallRating: number;
  reviewCount: number;
  pricePerNight?: number;
  url?: string;
  createdAt: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  location: string;
  description: string;
  meals: MealType[];
  stayHotel?: string;
  activities: string[];
  highlights?: string[];
}

export interface HotelStay {
  id: string;
  name: string;
  alternativeHotel?: string;
  city?: string;
  country?: string;
  location?: string;
  roomType: string;
  nights: number;
  starRating?: number;
  checkInDate?: string;
  checkOutDate?: string;
  mealPlan?: string;
  amenities?: string[];
  image?: string;
  houseboatDetails?: string;
  notes?: string;
}

export type HotelStarCategory = 'budget' | '2-star' | '3-star' | '4-star' | '5-star';

export type HotelTierKey = 'star2' | 'star3' | 'star4' | 'star5';

export const HOTEL_CATEGORY_OPTIONS: Array<{
  key: HotelTierKey;
  value: HotelStarCategory;
  starRating: 2 | 3 | 4 | 5;
  label: string;
  cmsLabel: string;
  tierName: string;
}> = [
  { key: 'star2', value: 'budget', starRating: 2, label: 'Budget', cmsLabel: 'Budget Hotels', tierName: 'Budget' },
  { key: 'star3', value: '3-star', starRating: 3, label: '3-Star', cmsLabel: '3★ Deluxe', tierName: '3-Star' },
  { key: 'star4', value: '4-star', starRating: 4, label: '4-Star', cmsLabel: '4★ Premium', tierName: '4-Star' },
  { key: 'star5', value: '5-star', starRating: 5, label: '5-Star', cmsLabel: '5★ Luxury', tierName: '5-Star' },
];

export interface PricingTierConfig {
  enabled?: boolean;
  starRating?: number;
  tierName?: string;
  price?: number;
  discountedPrice?: number;
  priceOnRequest?: boolean;
  hotelNames?: string;
  roomType?: string;
  mealPlan?: string;
  cabType?: string;
  keyHighlights?: string[];
  hotels?: string[];
}

export interface PricingTiers {
  star2?: PricingTierConfig;
  star3?: PricingTierConfig;
  star4?: PricingTierConfig;
  star5?: PricingTierConfig;
  standard?: { price: number; hotels?: string[] };
  deluxe?: { price: number; hotels?: string[] };
  luxury?: { price: number; hotels?: string[] };
  [key: string]: any;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export const DEFAULT_TRAVELER_GUIDELINES: string[] = [
  'Carry valid government-issued photo ID for all travellers.',
  'Standard hotel check-in time is 2:00 PM and check-out time is 11:00 AM.',
  'Carry suitable warm clothing, especially during winter and colder weather conditions.',
  'Sightseeing and travel schedules may change depending on weather, road conditions and local restrictions.',
  'Any additional activities, entry tickets, personal expenses or services not mentioned in the package inclusions will be charged separately.',
  'Guests must follow local rules, hotel policies and instructions provided by the tour coordinator.'
];

export const DEFAULT_CANCELLATION_TERMS: string[] = [
  'Non-Refundable Booking: All bookings are non-refundable once confirmed.',
  'Cancellation Within 30 Days: No refund will be provided for cancellations made within 30 days of the travel date.',
  'No-Show Policy: No refund will be provided in case of failure to report at the departure point or hotel.',
  'Unused Services: No refund will be provided for partially used or unused hotels, meals, sightseeing, transportation or other services.',
  'Date Changes: Any request for date changes will be subject to availability and applicable additional charges.'
];

export const DEFAULT_PAYMENT_TERMS: string[] = [
  '25% Advance deposit to confirm booking.',
  '75% Balance payable 15 days prior to travel.'
];

export interface PackagePolicies {
  cancellationPolicy: string[];
  termsAndConditions: string[];
  paymentPolicy: string[];
  importantNotes?: string[];
  customPoliciesEdited?: boolean;
}

const isLegacyTravelerNote = (note: string): boolean => {
  const n = note.trim().toLowerCase();
  if (!n) return true;
  if (DEFAULT_TRAVELER_GUIDELINES.some((d) => d.toLowerCase() === n)) return true;
  return (
    (n.includes('valid government') && n.includes('photo id')) ||
    (n.includes('check-in') && n.includes('check-out') && n.includes('2:00 pm')) ||
    n.includes('all bookings subject') ||
    n.includes('ac will be switched off on hilly')
  );
};

const isLegacyCancellationRule = (rule: string): boolean => {
  const r = rule.trim().toLowerCase();
  if (!r) return true;
  if (DEFAULT_CANCELLATION_TERMS.some((d) => d.toLowerCase() === r)) return true;
  return (
    r.startsWith('cancellation policy:') ||
    r.includes('cancellations made within 30 days') ||
    r.includes('30 days or more before travel:') ||
    r.includes('15 to 29 days before travel:') ||
    r.includes('7 to 14 days before departure:') ||
    r.includes('less than 7 days:') ||
    r.includes('20 days prior:') ||
    r.includes('10 to 19 days:') ||
    r.includes('under 7 days:')
  );
};

export function resolveTourPolicies(pkg?: Partial<TourPackage> | null): {
  importantNotes: string[];
  cancellationPolicy: string[];
} {
  if (!pkg) {
    return {
      importantNotes: [...DEFAULT_TRAVELER_GUIDELINES],
      cancellationPolicy: [...DEFAULT_CANCELLATION_TERMS],
    };
  }

  const rawNotes =
    pkg.importantNotes && pkg.importantNotes.length > 0
      ? pkg.importantNotes
      : pkg.policies?.importantNotes && pkg.policies.importantNotes.length > 0
      ? pkg.policies.importantNotes
      : pkg.policies?.termsAndConditions && pkg.policies.termsAndConditions.length > 0
      ? pkg.policies.termsAndConditions
      : [];

  const rawCancel =
    pkg.policies?.cancellationPolicy && pkg.policies.cancellationPolicy.length > 0
      ? pkg.policies.cancellationPolicy
      : [];

  if (pkg.policies?.customPoliciesEdited) {
    return {
      importantNotes: rawNotes.length > 0 ? rawNotes : [...DEFAULT_TRAVELER_GUIDELINES],
      cancellationPolicy: rawCancel.length > 0 ? rawCancel : [...DEFAULT_CANCELLATION_TERMS],
    };
  }

  const extraNotes = rawNotes
    .map((s) => String(s || '').trim())
    .filter((s) => s && !isLegacyTravelerNote(s));

  const extraCancel = rawCancel
    .map((s) => String(s || '').trim())
    .filter((s) => s && !isLegacyCancellationRule(s));

  return {
    importantNotes: [...DEFAULT_TRAVELER_GUIDELINES, ...extraNotes],
    cancellationPolicy: [...DEFAULT_CANCELLATION_TERMS, ...extraCancel],
  };
}

export type TourInclusionIconType =
  | 'hotel'
  | 'meals'
  | 'cab'
  | 'flight'
  | 'sightseeing'
  | 'transport'
  | 'houseboat'
  | 'shikara'
  | 'guide'
  | 'activities'
  | 'permits'
  | 'transfers';

export interface TourInclusionItem {
  id: string;
  icon: TourInclusionIconType;
  label: string;
}

export interface GroupTourBatch {
  id: string;
  batchName?: string;
  startDate: string; // e.g. "2025-10-15" or "15 Oct 2025"
  endDate?: string;
  totalSeats: number;
  bookedSeats: number;
  pricePerYatri?: number;
  status: 'Filling Fast' | 'Available' | 'Sold Out' | 'Guaranteed Departure';
  boardingPoint?: string;
}

export interface GroupTourDetails {
  isGroupTour: boolean;
  groupTheme?: string; // e.g. "Sacred Devotee Sangha", "Senior Citizen Friendly", "Weekend Darshan"
  coachType?: string; // e.g. "2x2 AC Pushback Luxury Coach", "Deluxe AC Tempo Traveller"
  batchSchedule?: string; // e.g. "Every Friday & 15th / 30th of Month"
  nextDeparture?: string; // e.g. "15 Oct 2025"
  totalSeats: number; // e.g. 24
  bookedSeats: number; // e.g. 18
  minGroupSize?: number; // e.g. 10
  maxGroupSize?: number; // e.g. 26
  perPersonSavings?: number; // e.g. 4500
  tourLeader?: string; // e.g. "Acharya Devotee Guide & Tour Coordinator"
  boardingPoints?: string[]; // e.g. ["Delhi Kashmere Gate", "Chandigarh", "Jammu Tawi"]
  batches?: GroupTourBatch[];
}

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  destination: string;
  destinationTag?: string;
  country: string;
  category: PackageCategory;
  badge?: PackageBadge;
  durationDays: number;
  durationNights: number;
  price: number;
  discountedPrice?: number;
  priceOnRequest?: boolean;
  currency: string;
  rating: number;
  reviewCount: number;
  coverImage: string;
  gallery: GalleryItem[];
  overview: string;
  startLocation: string;
  endLocation: string;
  groupSizeLimit?: string;
  bestTimeToVisit?: string;
  tourType?: TourType | 'Pilgrimage' | 'Honeymoon' | 'Family' | 'Private Tour' | 'Group Tour' | 'Customizable Tour' | string;
  isGroupTour?: boolean;
  groupTourDetails?: GroupTourDetails;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  includedIcons?: TourInclusionItem[];
  hotels: HotelStay[];
  pricingTiers?: PricingTiers;
  transportation?: any;
  policies: PackagePolicies;
  importantNotes?: string[];
  reviews?: TourReview[];
  status: 'published' | 'draft';
  featured: boolean;
  createdAt?: string;
  seoTitle?: string;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  templeIds?: string[];
  temples?: string[];
  places?: string[];
}

export type TempleCategory =
  | 'Shaktipeeth'
  | 'Jyotirlinga'
  | 'Char Dham'
  | 'Cave Shrine'
  | 'Panch Kedar'
  | 'Divya Desam'
  | 'Ancient Dham'
  | 'Holy River Ghat';

export interface TemplePlace {
  id: string;
  slug: string;
  name: string;
  hindiName?: string;
  deity?: string;
  category?: TempleCategory;
  city: string;
  state: string;
  image: string;
  tagline?: string;
  description?: string;
  darshanTimings?: string;
  dressCode?: string;
  bestTimeToVisit?: string;
  featured?: boolean;
  order?: number;
  destinationSlug?: string;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
}

export type StaffRole =
  | 'super_admin'
  | 'admin'
  | 'sub_admin'
  | 'operations'
  | 'sales'
  | 'finance';

export interface StaffPermissions {
  canManagePackages: boolean;
  canManageHotels: boolean;
  canManageInquiries: boolean;
  canManageVendors: boolean;
  canManageVendorPayments: boolean;
  canManageInvoices: boolean;
  canViewFinancials: boolean;
  canManageStaff: boolean;
  canManageSettings: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  designation: string;
  avatar: string;
  status: 'active' | 'inactive';
  permissions: StaffPermissions;
  joinedAt: string;
}

export type VendorCategory =
  | 'Hotel'
  | 'Cab / Taxi Fleet'
  | 'Chauffeur / Driver'
  | 'Tour Guide'
  | 'Activity / Excursion'
  | 'Flight / Train Desk';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscOrSwift: string;
  upiId: string;
  rating: number;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
}

export interface VendorPaymentLog {
  id: string;
  amount: number;
  date: string;
  mode: string;
  transactionRef: string;
  note: string;
}

export interface VendorPayment {
  id: string;
  voucherNumber: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: VendorCategory;
  category?: VendorCategory;
  vendorContactPerson?: string;
  vendorPhone?: string;
  packageId?: string;
  packageTitle?: string;
  tourPackageTitle?: string;
  inquiryId?: string;
  travelerName?: string;
  clientName?: string;
  serviceDescription: string;
  serviceDate: string;
  driverDetails?: string;
  totalAmount: number;
  amountAgreed?: number;
  paidAmount: number;
  amountPaid?: number;
  balanceAmount: number;
  amountDue?: number;
  dueDate: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  status?: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  paymentMode: 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Cash' | 'Cheque';
  transactionRef: string;
  notes: string;
  paymentLogs: VendorPaymentLog[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate?: number;
  unitPrice?: number;
  amount: number;
}

export interface InvoicePaymentLog {
  id: string;
  amount: number;
  date: string;
  method: string;
  transactionRef: string;
  note: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  inquiryId?: string;
  packageId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGstOrTaxId?: string;
  packageTitle: string;
  travelDate: string;
  paxAdults: number;
  paxChildren: number;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  amountPaid?: number;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Cancelled';
  paymentMode?: string;
  paymentReference?: string;
  paymentLogs: InvoicePaymentLog[];
  notes: string;
  terms: string[] | string;
  createdAt: string;
}

export interface ProposalHotelEntry {
  id: string;
  name: string;
  propertyType?: 'hotel' | 'houseboat';
  alternativeHotel?: string;
  location: string;
  nights: number;
  assignedNights?: number[];
  roomType?: string;
  mealPlan?: string;
  starRating?: 2 | 3 | 4 | 5;
  amenities?: string[];
}

export interface InquiryQuotation {
  id?: string;
  packageId?: string;
  packageTitle?: string;
  destination?: string;
  duration?: string;
  hotelTierKey?: HotelTierKey;
  hotelCategory?: string;
  basePrice?: number;
  customPrice?: number;
  discount: number;
  finalPrice: number;
  validUntil: string;
  hotels?: string;
  hotelEntries?: ProposalHotelEntry[];
  cabType?: string;
  inclusions?: string[];
  exclusions?: string[];
  includedNotes?: string[];
  notes?: string;
  customMessage?: string;
  createdAt: string;
}

export interface InquiryTimelineLog {
  id: string;
  author: string;
  action: string;
  note: string;
  timestamp: string;
}

export interface BookingInquiry {
  id: string;
  packageId: string;
  packageTitle: string;
  travelerName: string;
  email: string;
  phone: string;
  travelDate: string;
  adults: number;
  children: number;
  specialRequests?: string;
  estimatedTotal: number;
  status: 'New' | 'Contacted' | 'Booked' | 'Closed' | 'Quotation Sent' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedStaffId?: string;
  assignedStaffName?: string;
  quotation?: InquiryQuotation;
  timelineLogs?: InquiryTimelineLog[];
  createdAt: string;
}

export interface CoTraveler {
  id: string;
  fullName: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Friend' | 'Colleague' | 'Other';
  gender: 'Male' | 'Female' | 'Other';
  age?: number;
  passportNumber?: string;
  idNumber?: string;
}

export interface TravelerUserProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
  country?: string;
  passportNo?: string;
  idType?: string;
  idNumber?: string;
  dietPreference?: string;
  roomPreference?: string;
  emergencyContact?: string;
  authProvider?: 'google' | 'email' | 'phone';
  memberTier?: 'Member' | 'Silver Explorer' | 'Gold Explorer' | 'Holidays Hunt Elite';
  memberSince?: string;
  rewardCoins?: number;
  coTravelers?: CoTraveler[];
}

export interface AgencyBankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FooterMenuItem {
  id: string;
  label: string;
  url: string;
}

export interface FooterMenuSection {
  id: string;
  title: string;
  items: FooterMenuItem[];
}

export interface MobileBottomNavItem {
  id: string;
  label: string;
  icon: 'home' | 'tours' | 'destinations' | 'chat' | 'phone' | 'compass' | 'star' | 'info' | 'custom';
  actionType: 'home' | 'tours' | 'destinations' | 'whatsapp' | 'call' | 'custom';
  url?: string;
  badge?: string;
  enabled: boolean;
}

export interface AgencySettings {
  agencyName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currencySymbol: string;
  sacredMantra?: string;
  taxRegistrationNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  bankDetails?: AgencyBankDetails;
  invoicePrefix?: string;
  voucherPrefix?: string;
  invoiceTerms?: string[];
  faqs?: FAQItem[];
  footerMenus?: FooterMenuSection[];
  bottomNavItems?: MobileBottomNavItem[];
}

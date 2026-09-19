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
  stayHotel: string;
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

export type HotelStarCategory = '3-star' | '4-star' | '5-star';

export interface PricingTiers {
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

export interface PackagePolicies {
  cancellationPolicy: string[];
  termsAndConditions: string[];
  paymentPolicy: string[];
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

export interface InquiryQuotation {
  id?: string;
  packageId?: string;
  packageTitle?: string;
  destination?: string;
  duration?: string;
  basePrice?: number;
  customPrice?: number;
  discount: number;
  finalPrice: number;
  validUntil: string;
  hotels?: string;
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
  status: 'New' | 'Contacted' | 'Quotation Sent' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
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

import { TourPackage, AgencySettings, MobileBottomNavItem } from '../types/tour';

export const DEFAULT_BOTTOM_NAV_ITEMS: MobileBottomNavItem[] = [
  { id: 'bnav-explore', label: 'Explore', icon: 'home', actionType: 'home', enabled: true },
  { id: 'bnav-tours', label: 'Tours', icon: 'tours', actionType: 'tours', badge: 'count', enabled: true },
  { id: 'bnav-destinations', label: 'Destinations', icon: 'destinations', actionType: 'destinations', enabled: true },
  { id: 'bnav-chat', label: 'Chat', icon: 'chat', actionType: 'whatsapp', enabled: true },
];

export const DEFAULT_AGENCY_SETTINGS: AgencySettings = {
  agencyName: 'Holidays Hunt',
  tagline: "Experts in Kashmir & Himachal Tours",
  email: 'info@holidayshunt.com',
  phone: '+91 94199 15255',
  whatsapp: '+919419915255',
  address: 'Holidays Hunt Travel & Hospitality Pvt Ltd, Boulevard / Rajbagh, Srinagar, Kashmir / Katra / New Delhi',
  currencySymbol: '₹',
  taxRegistrationNumber: 'GSTIN: 07AAACH9921M1Z4',
  bankName: 'HDFC Bank Ltd.',
  accountName: 'Holidays Hunt',
  accountNumber: '50200099887766',
  ifscCode: 'HDFC0000456',
  upiId: 'holidayshunt@hdfcbank',
  invoicePrefix: 'HH-2026-',
  voucherPrefix: 'VOU-HH-',
  invoiceTerms: [
    '1. 25% Advance payment required to confirm hotel reservations and dedicated vehicle booking.',
    '2. Balance payment must be settled before check-in or commencement of sightseeing as per voucher.',
    '3. All inclusions are clearly stated in the official tour voucher.',
    '4. AC operates in plain areas and will be switched off on hilly drives for vehicle safety.',
    '5. 24x7 guest support team and emergency assistance available throughout the trip.',
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'What types of tour packages does Holidays Hunt specialize in?',
      answer: 'Holidays Hunt specializes exclusively in customized Jammu & Kashmir and Himachal Pradesh tour packages. From romantic Kashmir honeymoon houseboats and alpine Gondola tours in Gulmarg to family vacations in Shimla, Manali, and sacred Mata Vaishno Devi yatras in Katra.'
    },
    {
      id: 'faq-2',
      question: 'How does Holidays Hunt ensure a smooth and personalized holiday experience in Kashmir & Himachal?',
      answer: 'Holidays Hunt pairs you with verified local hotel partners, experienced mountain chauffeurs, and dedicated 24x7 tour managers across Srinagar, Gulmarg, Pahalgam, Shimla, Manali, and Katra. We customize every itinerary according to your travel pace, family preferences, hotel category choices, and sightseeing interests.'
    },
    {
      id: 'faq-3',
      question: 'Can Holidays Hunt customize a private tour itinerary for families or couples?',
      answer: 'Absolutely! Every Kashmir and Himachal itinerary at Holidays Hunt is 100% customizable. Whether you are traveling as a honeymoon couple seeking private candlelight dinners and scenic retreats, or a multi-generational family requiring spacious vehicles and child/elderly-friendly hotels, our team tailors every detail.'
    },
    {
      id: 'faq-4',
      question: 'How does Holidays Hunt handle sacred pilgrimages like Mata Vaishno Devi in Katra?',
      answer: 'For sacred yatras, Holidays Hunt provides end-to-end facilitation including handpicked hotels near the Katra base, assistance with RFID yatra registration, SMVDSB helicopter booking guidance, battery car advice for senior citizens, and private sanitized transfers.'
    },
    {
      id: 'faq-5',
      question: 'What is Holidays Hunt\'s payment schedule and booking policy?',
      answer: 'To secure your hotel reservations and private cab bookings in Kashmir or Himachal, Holidays Hunt requires a standard advance deposit. The remaining balance can be settled as per the agreed payment schedule before or upon arrival. We accept UPI, Net Banking, credit/debit cards, and bank transfers with complete GST invoicing.'
    },
    {
      id: 'faq-6',
      question: 'What is the cancellation and refund policy for Holidays Hunt bookings?',
      answer: 'Cancellations follow clear transparent timelines based on hotel and operational partner policies. Any eligible refunds are processed promptly to your original payment mode within standard banking turnaround times.'
    },
    {
      id: 'faq-7',
      question: 'What destinations in Jammu & Kashmir and Himachal Pradesh are covered?',
      answer: 'We cover all premier circuits: Srinagar, Dal Lake, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Katra Vaishno Devi, Patnitop, Shimla, Kufri, Manali, Solang Valley, Atal Tunnel, Rohtang Pass, Dharamshala, McLeod Ganj, Dalhousie, and Spiti Valley.'
    },
    {
      id: 'faq-8',
      question: 'Are meals and special dietary preferences accommodated during the tour?',
      answer: 'Yes, our tour packages include flexible meal plans (such as MAP Plan with Daily Breakfast & Dinner). We coordinate with partner hotels and reputable local restaurants to ensure clean, high-quality, and pure vegetarian / Jain / Kashmiri / Bengali meal options as per guest requirements.'
    },
    {
      id: 'faq-9',
      question: 'How are transportation and safety managed in hilly regions?',
      answer: 'We deploy only experienced, courteous, and licensed mountain drivers with well-maintained commercial vehicles (Innova Crysta, Ertiga, Tempo Traveller, Dzire). Safety protocols, terrain expertise, and guest comfort are our highest priorities.'
    },
    {
      id: 'faq-10',
      question: 'What sets Holidays Hunt apart from conventional travel operators?',
      answer: 'Holidays Hunt delivers genuine on-ground concierge support, 100% transparent pricing with no hidden charges, verified hotel stays, and personalized itineraries designed for unforgettable Family, Honeymoon, and Pilgrimage memories in Jammu & Kashmir and Himachal Pradesh.'
    }
  ],
  footerMenus: [
    {
      id: 'fm-discover',
      title: 'DISCOVER US',
      items: [
        { id: 'fmi-about', label: 'About Us', url: 'about' },
        { id: 'fmi-careers', label: 'Careers', url: 'careers' },
        { id: 'fmi-contact', label: 'Contact Us', url: 'locate_us' },
        { id: 'fmi-faq', label: 'FAQ', url: 'faq' },
        { id: 'fmi-guide', label: 'Travel Guides', url: 'guide' },
        { id: 'fmi-sitemap', label: 'Sitemap', url: 'sitemap' }
      ]
    },
    {
      id: 'fm-categories',
      title: 'TOUR CATEGORIES',
      items: [
        { id: 'fmi-fam', label: 'Family Vacations', url: 'family' },
        { id: 'fmi-honey', label: 'Honeymoon Specials', url: 'honeymoon' },
        { id: 'fmi-pilgrim', label: 'Sacred Pilgrimages', url: 'pilgrimage' },
        { id: 'fmi-group', label: 'Group Departures', url: 'tours' }
      ]
    },
    {
      id: 'fm-destinations',
      title: 'TOP DESTINATIONS',
      items: [
        { id: 'fmi-t-kashmir', label: 'Kashmir Paradise', url: 'kashmir' },
        { id: 'fmi-t-himachal', label: 'Himachal Hills', url: 'himachal' },
        { id: 'fmi-t-vaishno', label: 'Mata Vaishno Devi', url: 'jammu' },
        { id: 'fmi-t-manali', label: 'Shimla & Manali', url: 'himachal' }
      ]
    },
    {
      id: 'fm-security',
      title: 'SECURITY & TRUST',
      items: [
        { id: 'fmi-terms', label: 'Terms & Conditions', url: 'terms' },
        { id: 'fmi-cancel', label: 'Cancellation Policy', url: 'cancellation' },
        { id: 'fmi-privacy', label: 'Privacy Policy', url: 'privacy' },
        { id: 'fmi-sec', label: '100% Verified Stays', url: 'security' }
      ]
    }
  ],
  bottomNavItems: DEFAULT_BOTTOM_NAV_ITEMS
};

export const DEFAULT_PACKAGES: TourPackage[] = [];

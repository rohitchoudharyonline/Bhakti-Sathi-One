import { TourPackage, AgencySettings, MobileBottomNavItem } from '../types/tour';

export const DEFAULT_BOTTOM_NAV_ITEMS: MobileBottomNavItem[] = [
  { id: 'bnav-explore', label: 'Explore', icon: 'home', actionType: 'home', enabled: true },
  { id: 'bnav-tours', label: 'Tours', icon: 'tours', actionType: 'tours', badge: 'count', enabled: true },
  { id: 'bnav-destinations', label: 'Destinations', icon: 'destinations', actionType: 'destinations', enabled: true },
  { id: 'bnav-chat', label: 'Chat', icon: 'chat', actionType: 'whatsapp', enabled: true },
];

export const DEFAULT_AGENCY_SETTINGS: AgencySettings = {
  agencyName: 'Holidays Hunt',
  tagline: "Jammu & Kashmir Tour & Travel Specialist",
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
      answer: 'Holidays Hunt specializes exclusively in customized Jammu & Kashmir tour packages. From romantic Kashmir honeymoon houseboats and alpine Gondola tours in Gulmarg to family vacations in Srinagar, Pahalgam, Sonamarg, and sacred Mata Vaishno Devi yatras in Katra.'
    },
    {
      id: 'faq-2',
      question: 'How does Holidays Hunt ensure a smooth and personalized holiday experience in Jammu & Kashmir?',
      answer: 'Holidays Hunt pairs you with verified local hotel partners, experienced mountain chauffeurs, and dedicated 24x7 tour managers across Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, and Katra. We customize every itinerary according to your travel pace, family preferences, hotel category choices, and sightseeing interests.'
    },
    {
      id: 'faq-3',
      question: 'Can Holidays Hunt customize a private tour itinerary for families or couples?',
      answer: 'Absolutely! Every Jammu & Kashmir itinerary at Holidays Hunt is 100% customizable. Whether you are traveling as a honeymoon couple seeking private candlelight dinners and scenic retreats, or a multi-generational family requiring spacious vehicles and child/elderly-friendly hotels, our team tailors every detail.'
    },
    {
      id: 'faq-4',
      question: 'How does Holidays Hunt handle sacred pilgrimages like Mata Vaishno Devi in Katra?',
      answer: 'For sacred yatras, Holidays Hunt provides end-to-end facilitation including handpicked hotels near the Katra base, assistance with RFID yatra registration, SMVDSB helicopter booking guidance, battery car advice for senior citizens, and private sanitized transfers.'
    },
    {
      id: 'faq-5',
      question: 'What is Holidays Hunt\'s payment schedule and booking policy?',
      answer: 'To secure your hotel reservations and private cab bookings in Jammu & Kashmir, Holidays Hunt requires a standard advance deposit. The remaining balance can be settled as per the agreed payment schedule before or upon arrival. We accept UPI, Net Banking, credit/debit cards, and bank transfers with complete GST invoicing.'
    },
    {
      id: 'faq-6',
      question: 'What is the cancellation and refund policy for Holidays Hunt bookings?',
      answer: 'Cancellations follow clear transparent timelines based on hotel and operational partner policies. Any eligible refunds are processed promptly to your original payment mode within standard banking turnaround times.'
    },
    {
      id: 'faq-7',
      question: 'What destinations in Jammu & Kashmir are covered?',
      answer: 'We cover Jammu & Kashmir destinations including Srinagar, Dal Lake, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Katra, Mata Vaishno Devi, Shiv Khori, Patnitop, Bhaderwah and other local attractions.'
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
      answer: 'Holidays Hunt delivers genuine on-ground concierge support, 100% transparent pricing with no hidden charges, verified hotel stays, and personalized itineraries designed for unforgettable Family, Honeymoon, and Pilgrimage memories in Jammu & Kashmir.'
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
        { id: 'fmi-t-vaishno', label: 'Mata Vaishno Devi', url: 'jammu' },
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

export const DEFAULT_PACKAGES: TourPackage[] = [
  {
    id: 'pkg-kashmir-honeymoon-01',
    slug: '6-days-kashmir-honeymoon-package-srinagar-gulmarg-pahalgam',
    title: '6 Days Kashmir Honeymoon Package | Srinagar, Gulmarg & Pahalgam',
    tagline: 'Romantic couples retreat with luxury Dal Lake houseboat, candle-light dinner, flower bed decoration, private chauffeur cab & Gulmarg snow meadows',
    destination: 'Kashmir (Srinagar, Gulmarg, Pahalgam, Sonmarg)',
    destinationTag: 'kashmir',
    country: 'India',
    category: 'Honeymoon',
    tourType: 'Honeymoon',
    badge: 'Honeymoon Special',
    durationDays: 6,
    durationNights: 5,
    price: 24000,
    discountedPrice: 18500,
      pricingTiers: {
        star3: {
        tierName: 'Deluxe (3-Star) • Most Popular',
        price: 24000,
        discountedPrice: 18500,
        hotelNames: 'Hotel Grand Kaiser Srinagar / Pine Spring Pahalgam / Royal Heritage Houseboat',
        roomType: 'Deluxe Valley View Room + Super Deluxe Houseboat',
        mealPlan: 'MAP Plan (Daily Breakfast & Dinner)',
        cabType: 'Dedicated AC Sedan (Dzire / Etios / Amaze)',
        keyHighlights: [
          '1 Night in Super Deluxe Dal Lake Houseboat included',
          'Daily Buffet Breakfast and multi-cuisine Dinner included',
          'Heated rooms with 24/7 power backup and hot water',
          'Dedicated tour manager on call',
        ],
      },
      star4: {
        tierName: 'Super Deluxe (4-Star Premium)',
        price: 34000,
        discountedPrice: 26999,
        hotelNames: 'Radisson Srinagar / The Chinar Resort Pahalgam / Kolahoi Green Gulmarg',
        roomType: 'Super Deluxe Executive Suite with Mountain Balcony',
        mealPlan: 'MAP Plan (Lavish Buffet Breakfast & Dinner)',
        cabType: 'Dedicated AC Toyota Innova Crysta SUV',
        keyHighlights: [
          'Luxury 4-star mountain view resorts in Gulmarg & Pahalgam',
          'Private Toyota Innova Crysta throughout',
          'Complimentary Kashmiri Kehwa & walnut basket on arrival',
          'Priority Gondola cable car ticket booking assistance',
        ],
      },
      star5: {
        tierName: 'Luxury (5-Star Palace / Resort)',
        price: 55000,
        discountedPrice: 44999,
        hotelNames: 'The Lalit Grand Palace Srinagar / The Khyber Himalayan Resort Gulmarg',
        roomType: 'Royal Heritage Suite / Presidential Chalet',
        mealPlan: 'AP Plan (All Meals: Breakfast, Lunch, Dinner & Hi-Tea)',
        cabType: 'Luxury Chauffeur SUV / Fortuner with Personal Butler',
        keyHighlights: [
          'Stay at iconic 5-star properties (The Khyber / The Lalit)',
          'All gourmet meals included',
          'Phase 1 Gondola tickets + 2-Hour private Shikara ride',
          '24x7 personal trip support & luggage butler',
        ],
      },
    },
    currency: '₹',
    rating: 4.96,
    reviewCount: 512,
    coverImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'k1',
        url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1000&q=80',
        caption: 'Shikara boats floating peacefully on Dal Lake against Zabarwan range',
      },
      {
        id: 'k2',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        caption: 'Gulmarg Gondola skiing meadows covered in fresh powdery snow',
      },
      {
        id: 'k3',
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        caption: 'Lidder river roaring through Pine forests of Pahalgam',
      },
    ],
    overview:
      'Immerse yourself in the jewel of the Himalayas with Holidays Hunt. Experience the serene beauty of Srinagar Mughal Gardens, a dreamy sunset Shikara ride across Dal Lake, the alpine wonderland of Gulmarg (featuring the world-famous Gondola cable car), and the scenic valleys of Pahalgam (Betaab Valley, Chandanwari & Aru). Accompanied by private chauffeur vehicle, authentic Kashmiri hospitality, and choice of 2, 3, 4, or 5-star stays.',
    startLocation: 'Sheikh ul-Alam International Airport Srinagar (SXR)',
    endLocation: 'Sheikh ul-Alam International Airport Srinagar (SXR)',
    status: 'published',
    featured: true,
    itinerary: [
      {
        id: 'k-d1',
        dayNumber: 1,
        title: 'Arrival in Srinagar – Mughal Gardens & Romantic Sunset Shikara Ride',
        location: 'Srinagar Airport to Dal Lake / Boulevard (15 KM / 40 Mins)',
        description:
          'Warm traditional welcome by your dedicated chauffeur at Srinagar Airport. Transfer to your chosen hotel / luxury houseboat on Dal Lake. Post lunch, visit the world-renowned Mughal Gardens: Nishat Bagh (Garden of Bliss) and Shalimar Bagh (Abode of Love) built by Emperor Jahangir. In the evening, enjoy an enchanting 1-hour Shikara ride on Dal Lake, visiting floating gardens, Nehru Park, and Char Chinar island.',
        meals: ['Dinner'],
        stayHotel: 'Deluxe Hotel in Srinagar / Royal Houseboat on Dal Lake',
        activities: ['Airport Private Pickup', 'Nishat & Shalimar Gardens', '1-Hour Sunset Shikara Ride', 'Kashmiri Kehwa Tasting'],
        highlights: ['Sunset reflection on Dal Lake with Pir Panjal mountain backdrop'],
      },
      {
        id: 'k-d2',
        dayNumber: 2,
        title: 'Srinagar to Gulmarg – Alpine Meadow of Flowers & Gondola Cable Car',
        location: 'Srinagar to Gulmarg (55 KM / 1.5 - 2 Hrs)',
        description:
          'Drive along the picturesque willow and apple orchards to Gulmarg (2,730 m), Asia’s premier skiing and golf destination. Board the world’s highest operational cable car (Gondola Phase 1 to Kongdoori and Phase 2 to Apharwat Peak at 13,780 ft). Enjoy breathtaking panoramic views of Nanga Parbat and snow activities (sledging, snowmobiling, skiing). Visit the historic St. Mary’s Church and Golf Course.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Hotel in Gulmarg / Srinagar',
        activities: ['Gulmarg Gondola Ride Phase 1 & 2', 'Apharwat Peak Snow Walk', 'Maharani Temple', 'St. Mary’s Church'],
        highlights: ['Touching snow at Apharwat Peak 14,000 ft above sea level'],
      },
      {
        id: 'k-d3',
        dayNumber: 3,
        title: 'Gulmarg to Pahalgam – The Valley of Shepherds & Saffron Fields of Pampore',
        location: 'Gulmarg to Pahalgam via Awantipora (140 KM / 3.5 - 4 Hrs)',
        description:
          'Depart towards Pahalgam (2,130 m) along the national highway. En route, pass through the fragrant purple Saffron fields of Pampore and explore the 1,100-year-old historic Awantipora Temple ruins dedicated to Lord Vishnu. Continue along the gushing turquoise Lidder River. Check into your hotel and spend a tranquil evening strolling through Pahalgam club park and local market.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Riverfront Hotel in Pahalgam',
        activities: ['Pampore Saffron Farms', 'Awantipora Ruins', 'Lidder Riverfront Walk', 'Pahalgam Market'],
        highlights: ['Crystal clear water and pine aroma along Lidder River'],
      },
      {
        id: 'k-d4',
        dayNumber: 4,
        title: 'Pahalgam Local Exploration – Betaab Valley, Chandanwari & Aru Valley',
        location: 'Pahalgam Local Sightseeing',
        description:
          'Embark on an exhilarating sightseeing tour of the three famous valleys of Pahalgam by local taxi: Betaab Valley (named after the Bollywood hit movie), Chandanwari (the holy starting point of Amarnath Yatra), and Aru Valley (a pristine eco-tourism village surrounded by meadows and alpine streams). Enjoy pine forest nature walks or pony rides across Baisaran (Mini Switzerland).',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Riverfront Hotel in Pahalgam',
        activities: ['Betaab Valley Nature Stroll', 'Chandanwari Snow Point', 'Aru Valley Exploration', 'Baisaran Meadow Visit'],
        highlights: ['Unmatched Bollywood landscape in Betaab Valley'],
      },
      {
        id: 'k-d5',
        dayNumber: 5,
        title: 'Pahalgam to Sonmarg (Meadow of Gold) – Thajiwas Glacier & Srinagar Return',
        location: 'Pahalgam to Sonmarg & Srinagar (165 KM / 4.5 Hrs)',
        description:
          'Drive through the dramatic Sindh Valley to Sonmarg (2,800 m), gateway to Ladakh. Marvel at the imposing snow-capped peaks and take a pony ride or local union cab to the majestic Thajiwas Glacier, where snow remains throughout the year. In the late afternoon, drive back to Srinagar and check into your handcrafted carved cedarwood houseboat.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Super Deluxe Houseboat on Dal Lake / Nigeen Lake',
        activities: ['Sonmarg Sindh River Halt', 'Thajiwas Glacier Trek / Pony Ride', 'Houseboat Check-in & Pure Veg Kashmiri Dinner'],
        highlights: ['Overnight experiential stay in authentic Kashmiri Houseboat'],
      },
      {
        id: 'k-d6',
        dayNumber: 6,
        title: 'Old Srinagar Heritage Tour, Shankaracharya Temple & Airport Departure',
        location: 'Srinagar City to Airport Drop (15 KM / 40 Mins)',
        description:
          'Visit the ancient hilltop Shankaracharya Shiva Temple for panoramic views of Srinagar city and Dal Lake. Explore the bustling Lal Chowk and government arts emporium for authentic Pashmina shawls, walnut wood carvings, and dry fruits. Transfer to Srinagar Airport with unforgettable memories of Kashmir.',
        meals: ['Breakfast'],
        stayHotel: 'Departure Day - No Hotel Stay',
        activities: ['Shankaracharya Hilltop Temple', 'Pashmina & Walnut Souvenir Shopping', 'Airport Drop'],
        highlights: ['360-degree aerial view of Srinagar from Shankaracharya Hill'],
      },
    ],
    inclusions: [
      '5 Nights accommodation in selected category hotel & luxury houseboat (2★, 3★, 4★, or 5★)',
      'Daily Breakfast and Dinner as per meal plan (MAP/CP/AP)',
      '1-Hour complimentary Shikara ride on Dal Lake for all guests',
      'Private dedicated AC Sedan / SUV / Innova Crysta for all transfers and sightseeing',
      'All toll taxes, parking fees, fuel, and mountain driver allowances',
      'Welcome drink on arrival (Traditional Kashmiri Kahwa with crushed almonds)',
      '24x7 dedicated Holidays Hunt guest support team assistance',
    ],
    exclusions: [
      'Airfare to and from Srinagar Airport',
      'Gulmarg Gondola cable car tickets (available on add-on at actual cost)',
      'Local union vehicle charges at Pahalgam (Betaab/Aru/Chandanwari) and Sonmarg (per Supreme Court guidelines)',
      'Pony rides, skiing equipment, and personal expenses',
    ],
    hotels: [
      {
        id: 'h-sri-1',
        name: 'Grand Kaiser / Radisson Srinagar',
        location: 'Boulevard / Rajbagh, Srinagar',
        roomType: 'Deluxe Valley View Room',
        nights: 2,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        amenities: ['Central Heating', 'Multi-Cuisine Restaurant', 'Free Wi-Fi', '24/7 Hot Water'],
      },
      {
        id: 'h-pah-1',
        name: 'Pine Spring / The Chinar Resort',
        location: 'Lidder Riverfront, Pahalgam',
        roomType: 'Riverside Executive Room',
        nights: 2,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
        amenities: ['Lidder River View', 'Heated Blankets', 'Doctor on Call', 'Garden Lawn'],
      },
      {
        id: 'h-hb-1',
        name: 'Royal Heritage Deluxe Houseboat',
        location: 'Dal Lake Gate No. 7, Srinagar',
        roomType: 'Handcrafted Cedar Wood Suite',
        nights: 1,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
        amenities: ['Traditional Khatamband Ceilings', 'Attached Bath with Tub', 'Shikara Crossings Included'],
      },
    ],
    policies: {
      cancellationPolicy: [
        '30 days or more before travel: 100% refund minus 10% administrative processing fee.',
        '15 to 29 days before travel: 25% cancellation charges.',
        '7 to 14 days before departure: 50% cancellation charges.',
        'Less than 7 days: Non-refundable.',
      ],
      termsAndConditions: [
        'Valid Government photo ID (Aadhaar / Passport) is mandatory for hotel check-ins and Gondola bookings.',
        'AC will be switched off on hilly terrains for vehicle cooling and engine safety.',
      ],
      paymentPolicy: [
        '25% Advance payment to confirm hotel bookings.',
        '75% Balance upon arrival in Srinagar or 7 days prior to travel date.',
      ],
    },
  },
  {
    id: 'pkg-kashmir-vaishno-01',
    slug: 'kashmir-with-vaishno-devi-yatra-package-7d6n',
    title: '7 Days Sacred Kashmir & Mata Vaishno Devi Yatra | Katra, Srinagar & Pahalgam',
    tagline: 'Divine blessings at Holy Cave Shrine of Mata Vaishno Devi in Katra combined with Dal Lake houseboats & Gulmarg alpine meadows',
    destination: 'Jammu & Kashmir (Katra, Vaishno Devi, Srinagar, Gulmarg, Pahalgam)',
    destinationTag: 'kashmir',
    country: 'India',
    category: 'Pilgrimage',
    tourType: 'Pilgrimage',
    badge: 'Best Seller',
    isGroupTour: true,
    groupTourDetails: {
      isGroupTour: true,
      groupTheme: 'Katra Vaishno Devi & Kashmir Valley Sangam Yatra',
      coachType: '2x2 AC Pushback Luxury Coach / Innova Crysta',
      batchSchedule: 'Fixed Scheduled Departures (Every Friday & Tuesday)',
      nextDeparture: '10 Oct 2026',
      totalSeats: 25,
      bookedSeats: 21,
      minGroupSize: 10,
      maxGroupSize: 25,
      perPersonSavings: 3500,
      tourLeader: 'Dedicated Yatra Coordinator & Valley Guide Included',
      boardingPoints: [
        'Jammu Tawi Railway Station',
        'Katra Railway Station',
        'Jammu Airport (IXJ)',
      ],
      batches: [
        {
          id: 'b-v-1',
          batchName: 'Navratri Sacred Sangha Batch',
          startDate: '10 Oct 2026',
          totalSeats: 25,
          bookedSeats: 21,
          status: 'Filling Fast',
        },
        {
          id: 'b-v-2',
          batchName: 'Autumn Valley Special Batch',
          startDate: '24 Oct 2026',
          totalSeats: 25,
          bookedSeats: 16,
          status: 'Guaranteed Departure',
        },
      ],
    },
    durationDays: 7,
    durationNights: 6,
    price: 26000,
    discountedPrice: 19999,
    pricingTiers: {
      star3: {
        tierName: 'Deluxe (3-Star) • Most Popular',
        price: 26000,
        discountedPrice: 19999,
        hotelNames: 'Hotel Asia Vaishno Devi Katra / Hotel Grand Kaiser Srinagar / Deluxe Houseboat',
        roomType: 'Deluxe Room in Katra & Srinagar + 1N Houseboat',
        mealPlan: 'MAP Plan (Daily Breakfast & Pure Veg / Kashmiri Dinner)',
        cabType: 'Dedicated AC Sedan / Ertiga',
        keyHighlights: ['Handpicked hotels near Katra Ban Ganga & Srinagar Dal Lake', 'RFID registration guidance & SMVDSB helicopter advice', '1 Night Royal Houseboat stay on Dal Lake'],
      },
      star4: {
        tierName: 'Super Deluxe (4-Star Premium)',
        price: 38000,
        discountedPrice: 29500,
        hotelNames: 'The White Katra / Radisson Srinagar / Pine Spring Pahalgam',
        roomType: 'Super Deluxe Executive Mountain View Room',
        mealPlan: 'MAP Plan (Lavish Buffet Breakfast & Dinners)',
        cabType: 'Toyota Innova Crysta SUV',
        keyHighlights: ['Luxury 4-star properties with mountain views', 'Toyota Innova Crysta for all transfers and mountain routes', 'Shikara ride on Dal Lake included'],
      },
      star5: {
        tierName: 'Luxury (5-Star Heritage / Palace)',
        price: 60000,
        discountedPrice: 48999,
        hotelNames: 'Welcomhotel by ITC Katra / The Lalit Grand Palace Srinagar',
        roomType: 'Royal Suite / Presidential Heritage Room',
        mealPlan: 'AP Plan (All Gourmet Meals & High Tea)',
        cabType: 'Luxury Chauffeur SUV with Dedicated Yatra Assistant',
        keyHighlights: ['5-star luxury at ITC Katra & The Lalit Srinagar', 'VIP darshan coordination guidance', 'Phase 1 Gondola cable car ticket assistance'],
      },
    },
    currency: '₹',
    rating: 4.98,
    reviewCount: 620,
    coverImage: 'https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'kv1',
        url: 'https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=1000&q=80',
        caption: 'Holy Trikuta Hills and Mata Vaishno Devi shrine complex in Katra',
      },
      {
        id: 'kv2',
        url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1000&q=80',
        caption: 'Dal Lake shikara cruising alongside snow-dusted mountains',
      },
    ],
    overview:
      'Experience the perfect fusion of divine spirituality and breathtaking Himalayan vistas with Holidays Hunt. Begin your sacred journey in Katra for the revered Mata Vaishno Devi Darshan and Bhairon Baba Temple, then traverse the scenic expressway tunnels into the paradise of Kashmir. Enjoy Srinagar Mughal gardens, Dal Lake shikara rides, Gulmarg snow meadows, and picturesque Pahalgam valleys.',
    startLocation: 'Jammu Tawi Railway Station (JAT) / Jammu Airport (IXJ)',
    endLocation: 'Sheikh ul-Alam International Airport Srinagar (SXR) / Jammu Tawi (JAT)',
    status: 'published',
    featured: true,
    itinerary: [
      {
        id: 'kv-d1',
        dayNumber: 1,
        title: 'Arrival in Jammu / Katra – Check-in & Yatra Preparation',
        location: 'Jammu Station / Airport to Katra Hotel (48 KM / 1.5 Hrs)',
        description:
          'Warm welcome at Jammu Tawi Railway Station or Jammu Airport. Private transfer to your hotel in Katra base town. Receive your mandatory RFID Yatra Parchi and SMVDSB assistance. Evening at leisure for rest and preparation for the holy trek.',
        meals: ['Dinner'],
        stayHotel: 'Selected Category Hotel in Katra',
        activities: ['Jammu to Katra Transfer', 'RFID Yatra Card Registration', 'Katra Market Stroll'],
        highlights: ['First evening view of illuminated Trikuta Parvat'],
      },
      {
        id: 'kv-d2',
        dayNumber: 2,
        title: 'Sacred Mata Vaishno Devi Darshan & Bhairon Ghati Ropeway',
        location: 'Katra Hotel to Holy Cave Bhawan & Return (14 KM Trek / Helicopter)',
        description:
          'Early morning start for holy darshan of Mata Vaishno Devi Ji. Travel via helicopter, battery auto from Ardhkuwari, horse, or walking trek. Perform sacred darshan of the Holy Pindies inside the sanctum. Board the passenger ropeway to Bhairon Temple. Return to Katra for overnight rest.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Hotel in Katra',
        activities: ['Mata Vaishno Devi Bhawan Darshan', 'Bhairon Baba Ropeway', 'Ardhkuwari Cave Visit'],
        highlights: ['Soul-elevating darshan of the sacred Natural Holy Pindies'],
      },
      {
        id: 'kv-d3',
        dayNumber: 3,
        title: 'Katra to Srinagar via Banihal-Qazigund Mountain Tunnel',
        location: 'Katra to Srinagar Valley (235 KM / 6.5 Hrs)',
        description:
          'After breakfast, embark on the picturesque drive through the Chenani-Nashri and Banihal-Qazigund mountain tunnels into Kashmir Valley. Arrive in Srinagar and check into your hotel or luxury houseboat on Dal Lake. Enjoy a relaxing sunset Shikara ride.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Royal Heritage Houseboat on Dal Lake / Srinagar Hotel',
        activities: ['Scenic Mountain Highway Drive', 'Dal Lake 1-Hour Shikara Ride', 'Kashmiri Kehwa Tasting'],
        highlights: ['Spectacular mountain pass crossing into green Kashmir Valley'],
      },
      {
        id: 'kv-d4',
        dayNumber: 4,
        title: 'Srinagar to Gulmarg – Gondola Ride & Alpine Snow Meadows',
        location: 'Srinagar to Gulmarg & Back (55 KM / 1.5 Hrs Each Way)',
        description:
          'Full-day excursion to Gulmarg (Meadow of Flowers). Board the world-renowned Gulmarg Gondola (Phase 1 & 2) ascending up to Apharwat Peak at 13,780 ft. Enjoy snow walks, panoramic views of Nanga Parbat, and historic St. Mary’s Church. Return to Srinagar for evening dinner.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Hotel in Srinagar',
        activities: ['Gulmarg Gondola Ride', 'Apharwat Snow Walk', 'Maharani Shiv Temple'],
        highlights: ['Touching snow at 14,000 ft on Apharwat Peak'],
      },
      {
        id: 'kv-d5',
        dayNumber: 5,
        title: 'Srinagar to Pahalgam – Saffron Fields & Betaab Valley',
        location: 'Srinagar to Pahalgam (90 KM / 2.5 Hrs)',
        description:
          'Drive through the Pampore saffron fields and historic Awantipora ruins to Pahalgam (Valley of Shepherds) along the roaring Lidder River. Visit Betaab Valley, Chandanwari, and Aru Valley in local union cabs. Evening walk in Pahalgam market.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Mountain Resort in Pahalgam',
        activities: ['Pampore Saffron Fields', 'Awantipora Ruins', 'Betaab Valley & Lidder River Stroll'],
        highlights: ['Crystal-clear pine-scented Lidder River banks'],
      },
      {
        id: 'kv-d6',
        dayNumber: 6,
        title: 'Pahalgam to Srinagar – Mughal Gardens & Old City Heritage',
        location: 'Pahalgam to Srinagar (90 KM / 2.5 Hrs)',
        description:
          'Return drive to Srinagar. Visit Emperor Jahangir’s Nishat Bagh, Shalimar Bagh, and Shankaracharya Temple perched atop Takht-e-Suleiman with panoramic views of Srinagar city. Browse authentic Kashmiri shawls, walnut woodcraft, and dry fruits.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Category Hotel in Srinagar',
        activities: ['Nishat & Shalimar Mughal Gardens', 'Shankaracharya Temple Darshan', 'Heritage Handicrafts Tour'],
        highlights: ['360-degree sunset view from Shankaracharya Temple hilltop'],
      },
      {
        id: 'kv-d7',
        dayNumber: 7,
        title: 'Srinagar Airport Departure – Memorable Yatra Concludes',
        location: 'Hotel to Srinagar Airport (15 KM / 35 Mins)',
        description:
          'Enjoy breakfast overlooking the valley. Chauffeur transfer to Sheikh ul-Alam International Airport Srinagar for your return flight with divine blessings and cherished Himalayan memories.',
        meals: ['Breakfast'],
        stayHotel: 'Departure Day - No Hotel Stay',
        activities: ['Airport Private Drop'],
        highlights: ['Blessed yatra souvenirs and cherished valley memories'],
      },
    ],
    inclusions: [
      '6 Nights accommodation in selected category hotels & 1 Night Royal Dal Lake Houseboat',
      'Daily Breakfast and Gourmet Vegetarian / Multi-Cuisine Dinners',
      'Dedicated private AC vehicle (Sedan / Innova Crysta) for all transfers and sightseeing',
      '1-Hour Shikara ride on Dal Lake',
      'Assistance with Vaishno Devi RFID yatra card and helicopter booking guidance',
      'All toll taxes, parking fees, and driver allowances',
    ],
    exclusions: ['Airfare / Train tickets to Jammu or from Srinagar', 'Pony / Horse rides or Gondola tickets'],
    hotels: [
      {
        id: 'h-kt-1',
        name: 'Hotel Asia Vaishno Devi / The White Katra',
        location: 'Katra Base Town',
        roomType: 'Deluxe Air-Cooled Room',
        nights: 2,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        amenities: ['Pure Veg Restaurant', 'Elevator', '24/7 Hot Water', 'Yatra Desk'],
      },
      {
        id: 'h-sr-1',
        name: 'Hotel Grand Kaiser / Royal Heritage Houseboat',
        location: 'Rajbagh / Dal Lake, Srinagar',
        roomType: 'Deluxe Room & Super Deluxe Houseboat',
        nights: 3,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
        amenities: ['Room Heaters', 'Lake View Balcony', 'Free Wi-Fi', '24/7 Power Backup'],
      },
      {
        id: 'h-ph-1',
        name: 'Pine Spring / The Chinar Resort',
        location: 'Lidder River Valley, Pahalgam',
        roomType: 'River View Deluxe Room',
        nights: 1,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
        amenities: ['Riverfront Lawn', 'Multi-Cuisine Dining', 'Heated Bedding'],
      },
    ],
    policies: {
      cancellationPolicy: ['20 days prior: 90% refund.', '10 to 19 days: 50% refund.', 'Under 7 days: non-refundable.'],
      termsAndConditions: ['Yatra RFID registration is mandatory for all pilgrims.'],
      paymentPolicy: ['25% Advance deposit to confirm booking.'],
    },
  },
];

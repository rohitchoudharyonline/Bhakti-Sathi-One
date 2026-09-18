import { PILGRIMAGE_FAQS_REGISTRY, DestinationFaqs, CityFaq } from './pilgrimageFaqsData';

export type { CityFaq, DestinationFaqs };

export interface GeneralFaq {
  id: string;
  category: 'family' | 'honeymoon' | 'pilgrimage' | 'destinations' | 'booking';
  categoryLabel: string;
  question: string;
  answer: string;
  destinationTag?: string;
}

export const FAQ_CATEGORY_TABS = [
  { id: 'all', label: 'All FAQs', icon: 'Sparkles', count: 42 },
  { id: 'family', label: 'Family Vacations', icon: 'Users', count: 10 },
  { id: 'honeymoon', label: 'Honeymoon Specials', icon: 'Heart', count: 10 },
  { id: 'pilgrimage', label: 'Sacred Pilgrimages', icon: 'Sun', count: 8 },
  { id: 'destinations', label: 'Kashmir & Himachal Circuits', icon: 'Compass', count: 8 },
  { id: 'booking', label: 'Bookings & Policies', icon: 'ShieldCheck', count: 6 },
] as const;

export const FAMILY_FAQS: GeneralFaq[] = [
  {
    id: 'fam-1',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'How are Holidays Hunt family packages in Kashmir and Himachal customized for children and senior citizens?',
    answer: 'Every family holiday itinerary is planned with gentle driving paces, minimal consecutive transit hours, and child/elderly-friendly hotels in Srinagar, Pahalgam, Gulmarg, Shimla, and Manali. We arrange ground-floor or elevator-accessible rooms, private spacious vehicles (Innova Crysta, Ertiga, or Tempo Traveller) with experienced mountain chauffeurs, and schedule frequent comfort stops for tea, Kashmiri Kehwa, and scenic view points.'
  },
  {
    id: 'fam-2',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Can we book interconnected family suites or extra rollaway beds for kids in Kashmir & Himachal?',
    answer: 'Yes! When planning your customized family package with Holidays Hunt, you can request interconnecting rooms, luxury 2-bedroom pine cottages in Pahalgam/Manali, family suites, or extra rollaway/mattress beds with cozy electric blankets and room heaters. We coordinate directly with hotel managers before your check-in.'
  },
  {
    id: 'fam-3',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'What types of private vehicles are assigned for family tours?',
    answer: 'We provide dedicated, sanitized, commercial tourist vehicles tailored to your family size: \n- 2 to 4 guests: Dedicated AC Sedan (Dzire / Etios / Amaze).\n- 4 to 6 guests: Toyota Innova Crysta or Maruti Ertiga.\n- 7 to 15 guests: Force Tempo Traveller (12/16/20 seater) or Luxury Urbania.\nAll vehicles have verified tourist permits, comprehensive hill safety fitness, and courteous mountain drivers.'
  },
  {
    id: 'fam-4',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'How do you handle dietary preferences and kid-friendly food during family tours?',
    answer: 'Our packages can be booked on CP (Breakfast only) or MAP (Breakfast + Dinner) meal plans. Our partner hotels offer wholesome buffet spreads with pure vegetarian, Jain, Bengali, and non-spicy kid-friendly options (milk, porridge, mild dal-khichdi, pasta, and fresh fruits). Our chauffeurs also recommend hygienic, family-friendly mountain restaurants.'
  },
  {
    id: 'fam-5',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Which circuits in Kashmir and Himachal Pradesh are best for a relaxed family trip?',
    answer: 'For Kashmir: Srinagar (Dal Lake Shikara & Mughal Gardens) + Gulmarg (Gondola cable car) + Pahalgam (Betaab Valley & Lidder River) is the gold standard. For Himachal: Shimla (Ridge & Kufri) + Kullu-Manali (Solang Valley, Atal Tunnel, Old Manali) + Dharamshala is extraordinarily popular with families.'
  },
  {
    id: 'fam-6',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Are Gulmarg Gondola passes and Solang Valley snow activity tickets coordinated?',
    answer: 'Yes, we provide step-by-step assistance and guidance for Gulmarg Gondola Phase 1 & 2 online bookings, Shikara boat rides, and local union taxi transfers in Pahalgam (Aru & Betaab Valley) and Manali (Rohtang Pass permits) so your family enjoys a seamless journey.'
  },
  {
    id: 'fam-7',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'What medical and emergency assistance does Holidays Hunt provide for traveling families in the hills?',
    answer: 'Your dedicated 24x7 Holidays Hunt Tour Coordinator is always on call. All our mountain vehicles carry first-aid kits. In high-altitude areas like Gulmarg, Sonamarg, and Rohtang Pass, our chauffeurs carry portable oxygen support and maintain immediate contact with local medical centers and doctors.'
  },
  {
    id: 'fam-8',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Can we adjust daily sightseeing timings if our kids wake up late or need an afternoon rest?',
    answer: 'Yes! Because your vehicle and chauffeur are 100% private and dedicated solely to your family throughout the tour, you enjoy total flexibility. You can coordinate your morning start time and leisurely lunch breaks with your chauffeur every day.'
  },
  {
    id: 'fam-9',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'What is the child policy for hotels and vehicles in Kashmir and Himachal?',
    answer: 'Children under 5 years of age stay complimentary with parents in hotel rooms (sharing existing bedding) and vehicle. For children aged 5 to 11 years, child charges apply (with or without an extra bed based on your preference). Complete transparent pricing is provided upfront with no hidden fees.'
  },
  {
    id: 'fam-10',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Can Holidays Hunt organize traditional dress photography shoots for our family?',
    answer: 'Yes! We can arrange memorable keepsake photo shoots in traditional Kashmiri Pherans and jewelry on Dal Lake Shikaras, or traditional Himachali attire against snow-covered slopes in Kufri and Solang Valley.'
  }
];

export const HONEYMOON_FAQS: GeneralFaq[] = [
  {
    id: 'honey-1',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'What special inclusions are provided in Holidays Hunt Kashmir & Himachal Honeymoon packages?',
    answer: 'Our bespoke Honeymoon Packages feature:\n- Warm floral / flower bed decoration on arrival night.\n- Romantic candlelight dinner with customized decor and delicious cuisine.\n- Complimentary Honeymoon cake and fresh dry fruit basket.\n- Daily morning bed tea/coffee and evening warm saffron Kehwa / badam milk.\n- Sunset Shikara boat ride with flowers across Dal Lake.\n- Private dedicated couple cab (Dzire / Innova) with complete privacy.'
  },
  {
    id: 'honey-2',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Which circuits are best for honeymoon couples in Kashmir and Himachal?',
    answer: 'The most romantic circuits include:\n- Kashmir: Luxury Dal Lake Houseboat + pine chalets in Pahalgam + snow chalets in Gulmarg.\n- Himachal: Private jacuzzi chalets in Manali + apple orchard resorts in Old Manali + colonial heritage suites in Shimla.'
  },
  {
    id: 'honey-3',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we stay in a private luxury houseboat in Srinagar on our honeymoon?',
    answer: 'Absolutely! We handpick premium super-deluxe houseboats moored on tranquil spots of Dal Lake or Nigeen Lake with carved walnut woodwork, private front sun-decks, candlelit dining halls, 24-hour warm heating, and attentive personal butler service.'
  },
  {
    id: 'honey-4',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'How do you ensure privacy and intimate experiences for newly married couples?',
    answer: 'We reserve private, non-shared AC cabs with courteous, discreet chauffeurs who respect your personal space. We book couple-oriented boutique hotels away from crowded thoroughfares, reserving rooms with panoramic snow mountain or lake views.'
  },
  {
    id: 'honey-5',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we add adventure activities like paragliding or snowmobiling to our honeymoon?',
    answer: 'Yes! Whether it is paragliding over Solang Valley, tandem snowmobiling in Gulmarg, quad biking in Pahalgam, or river rafting in Kullu, we seamlessly integrate exciting couple adventures into your itinerary.'
  },
  {
    id: 'honey-6',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'What is the best season to book a Kashmir or Manali honeymoon for fresh snowfall?',
    answer: 'To experience a winter snow wonderland in Kashmir (Gulmarg & Sonamarg) or Himachal (Manali Solang & Rohtang), plan your honeymoon between late December and early March. For blooming tulip gardens, apple blossoms, and pleasant summer breezes, April through June is idyllic.'
  },
  {
    id: 'honey-7',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we surprise my spouse with special midnight celebrations or flower bouquets?',
    answer: 'Yes! Inform your Holidays Hunt tour coordinator during booking, and our team will coordinate with the resort to arrange midnight cake surprises, fresh flower bouquets, and personalized romantic setups.'
  },
  {
    id: 'honey-8',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Are private couple photography sessions available during the honeymoon tour?',
    answer: 'Yes, we can organize professional couple photoshoot sessions at iconic romantic spots (such as sunset Shikaras on Dal Lake, pine glades in Betaab Valley, or apple orchards in Manali).'
  },
  {
    id: 'honey-9',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we upgrade our resort room to a jacuzzi suite or heated chalet?',
    answer: 'Yes! We have direct contracted partnerships with premium luxury resorts offering private jacuzzi mountain suites, heated plunge pool chalets, and glass-roof cottages in Gulmarg, Pahalgam, Shimla, and Manali.'
  },
  {
    id: 'honey-10',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we extend our honeymoon stay or add extra nights while traveling?',
    answer: 'Yes, subject to hotel room availability, our 24x7 guest support team can easily extend your vehicle rental and room bookings with minimal hassle.'
  }
];

export const PILGRIMAGE_GENERAL_FAQS: GeneralFaq[] = [
  {
    id: 'pilg-1',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'How does Holidays Hunt organize sacred yatras like Mata Vaishno Devi in Katra?',
    answer: 'Holidays Hunt provides deeply respectful, end-to-end yatra facilitation for Mata Vaishno Devi in Katra and sacred shrines in Kashmir and Himachal. We arrange clean hotel stays near Katra base town, private vehicle transfers from Jammu Tawi Railway Station or Jammu Airport, RFID yatra card assistance, battery car advice for senior citizens, and darshan queue guidance.'
  },
  {
    id: 'pilg-2',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'Does Holidays Hunt sell or book Mata Vaishno Devi Helicopter tickets?',
    answer: 'NO. Holidays Hunt DOES NOT sell, resell, or mark up helicopter tickets. In strict compliance with official Shri Mata Vaishno Devi Shrine Board (SMVDSB) directives, helicopter tickets can ONLY be booked by pilgrims directly on the official government portal (maavaishnodevi.org) with Aadhaar authentication. Beware of fraudulent portals claiming to sell helicopter passes. Our packages include verified hotels, private cabs, RFID registration guidance, and ground transfers.'
  },
  {
    id: 'pilg-3',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'What special assistance is provided for senior citizens during the Vaishno Devi Yatra?',
    answer: 'We prioritize senior citizens by selecting hotels with elevators and pure vegetarian dining, advising on official battery-car slots from Ardhkuwari, coordinating with licensed Palki (palanquin) stands at Ban Ganga with government rates, and organizing relaxed transit schedules.'
  },
  {
    id: 'pilg-4',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'Can we combine Mata Vaishno Devi Darshan with a holiday in Kashmir or Patnitop?',
    answer: 'Yes! Our 7 Days Sacred Kashmir & Mata Vaishno Devi Yatra Package seamlessly pairs the holy pilgrimage in Katra with scenic houseboats in Srinagar, alpine Gondola rides in Gulmarg, and the pine valleys of Pahalgam via the Chenani-Nashri and Banihal highway tunnels.'
  },
  {
    id: 'pilg-5',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'Are pure vegetarian and Jain meals ensured during the pilgrimage tour?',
    answer: 'Yes. All partner hotels selected on our Katra and temple routes strictly serve pure vegetarian cuisine. Jain meals (prepared without onion and garlic) can be requested in advance. On temple tracks like Katra Banganga and Ardhkuwari, SMVDSB bhojanalayas are readily available.'
  },
  {
    id: 'pilg-6',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'What mandatory registration is required for Mata Vaishno Devi Yatra in Katra?',
    answer: 'A mandatory, complimentary RFID Yatra Access Card must be obtained by every devotee at the Katra Railway Station, Bus Stand, or Ban Ganga counters before starting the trek. Our tour chauffeurs guide you directly to the registration counter upon arrival in Katra.'
  },
  {
    id: 'pilg-7',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'What sacred shrines in Kashmir and Himachal can be visited?',
    answer: 'In Jammu & Kashmir: Mata Vaishno Devi (Katra), Shivkhori Cave Temple, Shankaracharya Temple (Srinagar), Kheer Bhawani Temple (Ganderbal), and Martand Sun Temple (Anantnag). In Himachal: Chamunda Devi, Kangra Brajeshwari, Jwala Ji, Naina Devi, Chintpurni, and Hadimba Temple in Manali.'
  },
  {
    id: 'pilg-8',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'How do you support devotees in case of unexpected mountain weather disruptions?',
    answer: 'Our local coordinators in Katra, Jammu, Srinagar, and Shimla monitor real-time weather and highway traffic reports. In case of route closures, our drivers and operations team immediately arrange safe accommodations and adjust your transfers safely.'
  }
];

export const DESTINATIONS_FAQS: GeneralFaq[] = [
  {
    id: 'dest-1',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'What specific destinations does Holidays Hunt cover in Jammu & Kashmir?',
    answer: 'In Jammu & Kashmir, we cover Srinagar (Dal Lake, Nigeen Lake, Mughal Gardens, Old City), Gulmarg (Apharwat Peak, Gondola), Pahalgam (Betaab Valley, Aru Valley, Chandanwari, Baisaran), Sonamarg (Thajiwas Glacier, Zero Point), Doodhpathri, Yousmarg, Katra (Mata Vaishno Devi), Shivkhori, and Patnitop.'
  },
  {
    id: 'dest-2',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'What specific destinations does Holidays Hunt cover in Himachal Pradesh?',
    answer: 'In Himachal Pradesh, we cover Shimla (Mall Road, Ridge, Kufri, Naldehra, Mashobra), Manali (Solang Valley, Atal Tunnel, Rohtang Pass, Old Manali, Naggar Castle), Kullu Valley, Kasol & Manikaran, Dharamshala & McLeod Ganj, Dalhousie & Khajjiar (Mini Switzerland), and Spiti Valley.'
  },
  {
    id: 'dest-3',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'How do mobile SIM cards and connectivity work in Jammu & Kashmir and Himachal?',
    answer: 'In Jammu & Kashmir, outside prepaid SIM cards do not work due to national telecom regulations; only nationwide postpaid SIMs (Airtel, Jio, BSNL) work. Our chauffeurs can assist you in buying a local J&K SIM if needed. In Himachal Pradesh, both prepaid and postpaid SIM cards work normally throughout most towns and valleys.'
  },
  {
    id: 'dest-4',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'Is it safe for women travelers, solo tourists, and families to travel in Kashmir and Himachal?',
    answer: 'Yes, absolutely! Kashmir and Himachal Pradesh are world-renowned for their hospitality, warmth, and safe tourist environment. Millions of tourists, couples, and multi-generational families visit every year. All our verified chauffeurs and partner hoteliers ensure utmost respect, care, and security.'
  },
  {
    id: 'dest-5',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'What is the best time to visit Kashmir and Himachal Pradesh for different experiences?',
    answer: 'Both destinations offer distinctive charm throughout the four seasons:\n- Spring (March to April): Kashmir Tulip Garden blooms, cherry blossoms, and pleasant crisp weather.\n- Summer (May to June): Perfect escape from tropical heat with lush green alpine meadows and flowing rivers.\n- Autumn (September to November): Kashmir Chinar leaves turn fiery crimson golden; crisp clear Himalayan views.\n- Winter (December to February): Fresh snowfall, skiing in Gulmarg, and snow sports in Manali Solang.'
  },
  {
    id: 'dest-6',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'How are airport and railway station transfers managed in Kashmir and Himachal?',
    answer: 'We provide dedicated doorstep private pickups and drops from Srinagar Airport (SXR), Jammu Tawi Railway Station (JAT), Jammu Airport (IXJ), Chandigarh Airport (IXC), Delhi Airport (DEL), and Kalka Railway Station (KLK) with experienced mountain chauffeurs.'
  },
  {
    id: 'dest-7',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'Can we customize our Kashmir or Himachal tour package with Kolkata or Delhi flights?',
    answer: 'Yes! We frequently organize Kashmir and Himachal tour packages tailored for travelers arriving from Kolkata, Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, and Ahmedabad, synchronizing flight arrival times with private cab pickups.'
  },
  {
    id: 'dest-8',
    category: 'destinations',
    categoryLabel: 'Kashmir & Himachal Circuits',
    question: 'What warm clothing should we pack for Kashmir and Himachal tours?',
    answer: 'During summer (May to August), light woolens or jackets for evenings are sufficient. For autumn (September to November), medium jackets and sweaters are advised. For winter (December to March), heavy thermal innerwear, down jackets, waterproof snow gloves, woolen caps, and insulated snow boots are recommended (boots and long coats are also rentable locally).'
  }
];

export const BOOKING_POLICY_FAQS: GeneralFaq[] = [
  {
    id: 'book-1',
    category: 'booking',
    categoryLabel: 'Bookings & Policies',
    question: 'What is the step-by-step booking process with Holidays Hunt?',
    answer: 'Booking your dream holiday is quick and transparent:\n1. Choose a package or send your customized destination requirements.\n2. Our Tour Specialist prepares a day-wise customized itinerary and transparent quotation.\n3. Confirm your booking by paying the standard advance token deposit.\n4. Receive your official Holidays Hunt Booking Confirmation Voucher with hotel details, vehicle confirmation, and emergency contacts.'
  },
  {
    id: 'book-2',
    category: 'booking',
    categoryLabel: 'Bookings & Policies',
    question: 'What payment methods are accepted by Holidays Hunt?',
    answer: 'We accept multiple secure payment options:\n- UPI (Google Pay, PhonePe, Paytm, BHIM).\n- Net Banking (IMPS / NEFT / RTGS) directly to our authorized Holidays Hunt bank account.\n- Credit Cards and Debit Cards.\nAll bookings are accompanied by a formal GST invoice and official payment receipt.'
  },
  {
    id: 'book-3',
    category: 'booking',
    categoryLabel: 'Bookings & Policies',
    question: 'What is the cancellation and refund policy?',
    answer: 'Cancellations follow clear transparent timelines:\n- 46 days or more prior to departure: 30% advance deposit or actual incurred hotel cancellation fee applies.\n- 31 to 45 days prior to departure: 50% package cost applies.\n- Within 30 days of departure: 100% non-refundable due to high-season peak hotel commitments.\nEligible refunds are processed promptly to the original payment mode.'
  },
  {
    id: 'book-4',
    category: 'booking',
    categoryLabel: 'Bookings & Policies',
    question: 'Can we reschedule our travel dates if an emergency occurs?',
    answer: 'Yes. We understand unforeseen family or medical emergencies can arise. Depending on the advance notice and partner hotel flexibility, our team assists you in rescheduling your travel dates with minimal rebooking fees.'
  },
  {
    id: 'book-5',
    category: 'booking',
    categoryLabel: 'Bookings & Policies',
    question: 'Are there any hidden costs or surprise surcharges during the trip?',
    answer: 'No! Holidays Hunt guarantees 100% transparent pricing. Your confirmation voucher clearly lists inclusions (e.g. hotel stays, meal plans, private vehicle, toll taxes, parking fees, driver allowances) and exclusions (personal shopping, horse/pony rides, personal laundry) so you have complete financial clarity.'
  },
  {
    id: 'book-6',
    category: 'booking',
    categoryLabel: 'Bookings & Policies',
    question: 'How do I contact my dedicated Holidays Hunt tour coordinator during the trip?',
    answer: 'You are provided with a dedicated Tour Manager’s direct phone and WhatsApp number before you depart. Additionally, our 24x7 customer helpline is active at +91 94199 15255 and info@holidayshunt.com.'
  }
];

export const ALL_GENERAL_FAQS: GeneralFaq[] = [
  ...FAMILY_FAQS,
  ...HONEYMOON_FAQS,
  ...PILGRIMAGE_GENERAL_FAQS,
  ...DESTINATIONS_FAQS,
  ...BOOKING_POLICY_FAQS,
];

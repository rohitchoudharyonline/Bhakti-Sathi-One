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
  { id: 'all', label: 'All FAQs', icon: 'Sparkles', count: 48 },
  { id: 'family', label: 'Family Vacations', icon: 'Users', count: 10 },
  { id: 'honeymoon', label: 'Honeymoon Specials', icon: 'Heart', count: 10 },
  { id: 'pilgrimage', label: 'Sacred Pilgrimages', icon: 'Sun', count: 12 },
  { id: 'destinations', label: 'Domestic & International', icon: 'Compass', count: 10 },
  { id: 'booking', label: 'Bookings & Policies', icon: 'ShieldCheck', count: 6 },
] as const;

export const FAMILY_FAQS: GeneralFaq[] = [
  {
    id: 'fam-1',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'How are Holidays Hunt family packages customized for children and senior citizens?',
    answer: 'Every family holiday itinerary is planned with gentle driving paces, minimal consecutive transit hours, and child/elderly-friendly hotels. We arrange ground-floor or elevator-accessible rooms, private spacious vehicles (Innova Crysta, Ertiga, or Urbania) with experienced mountain chauffeurs, and schedule frequent comfort stops for snacks and scenic view points.'
  },
  {
    id: 'fam-2',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Can we book interconnected family suites or extra rollaway beds for kids?',
    answer: 'Yes! When planning your customized family package with Holidays Hunt, you can request interconnecting rooms, luxury 2-bedroom cottages, family suites, or extra rollaway/mattress beds with cozy blankets and heaters. We coordinate directly with hotel managers before your check-in.'
  },
  {
    id: 'fam-3',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'What types of private vehicles are assigned for family tours?',
    answer: 'We provide dedicated, sanitized, commercial tourist vehicles tailored to your family size: \n- 2 to 4 guests: Toyota Etios or Swift Dzire.\n- 4 to 6 guests: Toyota Innova Crysta or Maruti Ertiga.\n- 7 to 15 guests: Force Tempo Traveller (12/16 seater) or Force Urbania.\nAll vehicles have verified commercial tourist permits, comprehensive insurance, and courteous, licensed drivers.'
  },
  {
    id: 'fam-4',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'How do you handle dietary preferences and kid-friendly food during family tours?',
    answer: 'Our packages can be booked on CP (Breakfast only) or MAP (Breakfast + Dinner) meal plans. Our partner hotels offer wholesome buffet spreads with pure vegetarian, Jain, and non-spicy kid-friendly options (milk, porridge, mild dal-khichdi, pasta, and fresh fruits). Our chauffeurs also recommend hygienic, family-friendly highway restaurants.'
  },
  {
    id: 'fam-5',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Which destinations are most recommended for a relaxing family holiday in India?',
    answer: 'For soothing mountain retreats, Kashmir (Srinagar Shikara ride, Gulmarg Gondola, Pahalgam Betaab Valley) and Himachal Pradesh (Shimla Mall Road, Manali Solang snow games, Dharamshala tea gardens) are timeless favorites. For heritage and royal grandeur, Rajasthan and Golden Triangle are exceptional. For lush nature, Kerala backwaters and Munnar hills offer pure family rejuvenation.'
  },
  {
    id: 'fam-6',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Are sightseeing tickets and adventure activity passes included in family packages?',
    answer: 'Monument entry tickets, park admissions, and adventure activities (such as Gulmarg Gondola Phase 1 & 2 tickets, river rafting in Manali, ATV rides in Pahalgam, or Shikara boat rides) can be bundled directly into your package quotation so your family avoids long ticket counter queues on the spot.'
  },
  {
    id: 'fam-7',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'What medical and emergency assistance does Holidays Hunt provide for traveling families?',
    answer: 'Your dedicated 24x7 Holidays Hunt Tour Executive is always on call. All our vehicles carry basic first-aid kits. In high-altitude regions like Gulmarg, Sonmarg, or Ladakh, our chauffeurs carry portable oxygen cylinders and maintain immediate contact with local medical clinics and doctors.'
  },
  {
    id: 'fam-8',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Can we change daily sightseeing timings if our kids wake up late or need an afternoon nap?',
    answer: 'Yes! Because your vehicle and driver are reserved 100% privately for your family, you enjoy complete flexibility. You can coordinate your morning departure time and leisurely lunch breaks with your chauffeur every day.'
  },
  {
    id: 'fam-9',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'What is the child pricing policy for hotels and transport?',
    answer: 'Generally, children under 5 years of age stay complimentary without an extra bed in hotels and share vehicle seating with parents. For children aged 5 to 11 years, child charges apply (with or without an extra rollaway bed based on your preference). Complete itemized pricing is provided upfront with no surprises.'
  },
  {
    id: 'fam-10',
    category: 'family',
    categoryLabel: 'Family Vacations',
    question: 'Can Holidays Hunt organize photo sessions and traditional dress shoots for our family?',
    answer: 'Yes! In Kashmir (traditional Kashmiri Pheran shoot on Dal Lake Shikara), Himachal (Himachali dress shoot in Solang Valley), and Rajasthan (royal attire shoots), we can arrange local photographers and memorable keepsake shoots.'
  }
];

export const HONEYMOON_FAQS: GeneralFaq[] = [
  {
    id: 'honey-1',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'What special inclusions are provided in Holidays Hunt Honeymoon packages?',
    answer: 'Our bespoke Honeymoon Packages are crafted for romance and luxury. Standard inclusions upon request feature:\n- Warm floral room decoration on the arrival evening.\n- Romantic candlelight dinner with customized decor and gourmet meal.\n- Complimentary Honeymoon cake and fresh fruit basket.\n- Daily morning bed tea/coffee and evening warm saffron-badam milk.\n- Scenic private Shikara boat ride with flowers on Dal Lake (for Kashmir packages).\n- Private couple transfers with maximum privacy and scenic photo stopovers.'
  },
  {
    id: 'honey-2',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Which destinations are most popular for honeymoon couples?',
    answer: 'Top domestic honeymoon havens include:\n- Kashmir: Luxury houseboat in Srinagar, pine-hugged cottages in Pahalgam, and snow vistas in Gulmarg.\n- Himachal: Private jacuzzi chalets in Manali, apple orchard resorts in Old Manali, and serene Shimla heritage hotels.\n- South India & Beach: Private pool villas in Munnar and luxury beach resorts in Goa & Andaman.\nTop international honeymoon getaways include Bali (Ubud jungle villas & Seminyak beachfront), Thailand (Phuket & Krabi cliff-side resorts), Vietnam, and the Maldives.'
  },
  {
    id: 'honey-3',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we stay in a private luxury houseboat in Srinagar on our honeymoon?',
    answer: 'Absolutely! We handpick premium super-deluxe houseboats moored on tranquil spots of Dal Lake or Nigeen Lake with carved walnut woodwork, private front sun-decks, candlelit dining halls, and 24-hour warm heating and attentive personal butler service.'
  },
  {
    id: 'honey-4',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'How do you ensure privacy and intimate experiences for newly married couples?',
    answer: 'We reserve private, non-shared AC cabs with courteous, discreet chauffeurs who respect your personal space. We book couple-oriented boutique hotels away from noisy crowded highways, reserving rooms with panoramic valley or lake views.'
  },
  {
    id: 'honey-5',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we add adventurous activities like paragliding, snowmobiling, or scuba diving to our honeymoon?',
    answer: 'Yes! Whether it is paragliding over Solang Valley, tandem snowmobiling in Gulmarg, scuba diving in the crystal waters of Andaman, or hot air ballooning in Bali/Cappadocia, we seamlessly weave thrilling couple experiences into your itinerary.'
  },
  {
    id: 'honey-6',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'What is the best season to book a Kashmir or Manali honeymoon for fresh snowfall?',
    answer: 'To witness snow wonderland magic in Kashmir (Gulmarg & Sonmarg) or Himachal (Manali Solang & Rohtang), plan your honeymoon between late December and early March. For blooming tulip gardens, lush green meadows, and pleasant summer breezes, April through June is idyllic.'
  },
  {
    id: 'honey-7',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we surprise my spouse with special midnight celebrations or champagne/sparkling juice?',
    answer: 'Yes! Inform your Holidays Hunt tour coordinator during booking, and our team will coordinate with the resort to arrange midnight room surprises, anniversary/honeymoon cakes, flower bouquets, and private musical arrangements.'
  },
  {
    id: 'honey-8',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Are private photography sessions available during the honeymoon tour?',
    answer: 'Yes, we can organize professional couple photoshoot sessions at iconic romantic spots (e.g. Shikara at sunset on Dal Lake, pine woods of Betaab Valley, or rice terraces in Bali) with digital high-resolution photo deliveries.'
  },
  {
    id: 'honey-9',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we upgrade our resort room to a jacuzzi suite or private plunge pool?',
    answer: 'Yes! We have direct contracted partnerships with premium luxury resorts offering private jacuzzi mountain suites, heated plunge pool villas, and glass-roof chalets. Room upgrade options and prices are shared transparently.'
  },
  {
    id: 'honey-10',
    category: 'honeymoon',
    categoryLabel: 'Honeymoon Specials',
    question: 'Can we extend our honeymoon stay or add extra nights while traveling?',
    answer: 'Yes, subject to hotel room availability, our 24x7 guest support team can extend your vehicle rental and room bookings with minimal hassle.'
  }
];

export const PILGRIMAGE_GENERAL_FAQS: GeneralFaq[] = [
  {
    id: 'pilg-1',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'How does Holidays Hunt organize sacred yatras and temple pilgrimages across India?',
    answer: 'Holidays Hunt provides deeply respectful, end-to-end yatra facilitation across India’s most sacred shrines including Mata Vaishno Devi, Char Dham Uttarakhand (Kedarnath, Badrinath, Gangotri, Yamunotri), Shri Amarnath Ji, Ayodhya Ram Mandir, Kashi Vishwanath Varanasi, Tirupati Balaji, Puri Jagannath, and Somnath Dwarka. We arrange clean hotel stays near temple complexes, private vehicle transfers, senior citizen assistance, and up-to-date guidance on darshan queues.'
  },
  {
    id: 'pilg-2',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'Does Holidays Hunt sell or book Mata Vaishno Devi or Kedarnath Helicopter tickets?',
    answer: 'NO. Holidays Hunt DOES NOT sell, resell, or book helicopter tickets. In strict compliance with official shrine board and government directives (such as SMVDSB and UCADA/IRCTC Heli Yatra), helicopter tickets can ONLY be booked by pilgrims directly on official government portals with Aadhaar authentication. Beware of fraudulent operators claiming to sell helicopter passes. Our packages include hotels, private cabs, RFID/biometric registration guidance, and ground transfers.'
  },
  {
    id: 'pilg-3',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'What special assistance is provided for senior citizens during yatras?',
    answer: 'We prioritize senior citizens by selecting hotels with elevators or ground-floor rooms, arranging battery-car transit slots where available, coordinating with licensed Palki (palanquin) and pony stands with government-fixed rates, and organizing gentle, paced driving itineraries.'
  },
  {
    id: 'pilg-4',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'Can we combine a holy pilgrimage with scenic holiday spots for our family?',
    answer: 'Yes! Popular combined packages include:\n- Mata Vaishno Devi (Katra) + Shivkhori Cave + Patnitop Hill Station.\n- Katra + Kashmir Valley (Srinagar, Gulmarg, Pahalgam).\n- Haridwar & Rishikesh Ganga Aarti + Char Dham.\n- Amritsar Golden Temple + Dharamshala & Dalhousie.\n- Madurai Meenakshi & Rameswaram + Kanyakumari & Kerala Backwaters.'
  },
  {
    id: 'pilg-5',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'Are pure vegetarian and Jain meals ensured during pilgrimage tours?',
    answer: 'Yes. All partner hotels selected on our pilgrimage routes strictly serve pure vegetarian food. Jain meals (prepared without onion, garlic, or root vegetables) can be requested in advance. On temple tracks like Katra Banganga and Kedarnath trek, hygienic bhojanalayas are abundant.'
  },
  {
    id: 'pilg-6',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'What mandatory registrations are required for Char Dham, Vaishno Devi, and Amarnath yatras?',
    answer: 'Mandatory pilgrim registrations include:\n- Mata Vaishno Devi: Free RFID Yatra Card obtained in Katra before beginning the trek.\n- Char Dham: Compulsory online biometric e-Pass registration via Uttarakhand Tourism portal (registrationandtouristcare.uk.gov.in).\n- Amarnath Ji: Compulsory Yatra Permit with authorized Compulsory Health Certificate (CHC) from designated doctors.\nOur team guides you step-by-step through official registration portals.'
  },
  {
    id: 'pilg-7',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'What are the opening and closing months for Kedarnath and Badrinath shrines?',
    answer: 'Kedarnath and Badrinath shrines open annually in late April or early May (around Akshaya Tritiya) and close for winter in late October or early November (around Bhai Dooj / Diwali). May, June, September, and October are the best months for Char Dham Yatra.'
  },
  {
    id: 'pilg-8',
    category: 'pilgrimage',
    categoryLabel: 'Sacred Pilgrimages',
    question: 'How do you support devotees in case of sudden mountain weather disruptions or road blockages?',
    answer: 'Our local coordinators in Katra, Srinagar, Haridwar, and Dehradun monitor real-time weather and landslide reports. In case of route closures, our drivers and operations team immediately arrange safe alternative accommodation and re-route your transfers safely.'
  }
];

export const DESTINATIONS_FAQS: GeneralFaq[] = [
  {
    id: 'dest-1',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'What domestic destinations does Holidays Hunt cover across India?',
    answer: 'We cover Jammu & Kashmir (Srinagar, Gulmarg, Pahalgam, Sonmarg, Doodhpathri, Yousmarg), Himachal Pradesh (Shimla, Manali, Kullu, Dharamshala, Dalhousie, Kasol, Spiti), Ladakh (Leh, Nubra Valley, Pangong Tso), Punjab (Amritsar Golden Temple, Wagah Border), Uttarakhand (Char Dham, Mussoorie, Nainital, Rishikesh), Goa, Kerala, and Rajasthan.'
  },
  {
    id: 'dest-2',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'What international tour packages does Holidays Hunt offer?',
    answer: 'We organize comprehensive customized international holidays to:\n- Thailand: Bangkok, Pattaya, Phuket, Krabi, Koh Samui.\n- Vietnam: Hanoi, Halong Bay cruise, Da Nang, Hoi An, Ho Chi Minh City.\n- Indonesia: Bali (Ubud culture, Nusa Penida island, Kuta & Seminyak beaches).\n- South Korea: Seoul, Nami Island, Busan, Jeju Island.\n- Japan: Tokyo, Mount Fuji, Kyoto, Osaka.\n- Dubai & UAE, Maldives, Singapore, and Malaysia.'
  },
  {
    id: 'dest-3',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'Does Holidays Hunt assist with international tourist visas and entry formalities?',
    answer: 'Yes! We provide step-by-step documentation guidance for tourist visas, e-Visas, Visa-on-Arrival requirements, passport validity checks, hotel confirmation vouchers, and air ticket itineraries for Thailand, Vietnam, Bali, Dubai, Japan, and other destinations.'
  },
  {
    id: 'dest-4',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'How do postpaid SIM cards, mobile connectivity, and local currencies work on tours?',
    answer: 'For domestic tours (especially J&K and Ladakh), prepaid SIM cards from outside J&K do not work due to telecom security regulations; only postpaid SIMs (Airtel, Jio, BSNL) work seamlessly. Our drivers can assist you in buying a local prepaid SIM if needed. For international tours, we guide you on getting local eSIMs or airport physical SIM cards.'
  },
  {
    id: 'dest-5',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'Is it safe for women travelers, solo tourists, and families to travel in Kashmir and Ladakh?',
    answer: 'Yes, absolutely! Kashmir and Ladakh are world-renowned for their hospitality, warmth, and safe tourist environment. Millions of tourists, couples, and multi-generational families visit every year. All our verified chauffeurs and partner hoteliers ensure utmost respect, care, and security.'
  },
  {
    id: 'dest-6',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'What is the best time to visit Kashmir and Himachal Pradesh?',
    answer: 'Both destinations offer unique charm throughout the four seasons:\n- Spring (March to April): Kashmir Tulip Garden blooms and pleasant cool weather.\n- Summer (May to June): Perfect escape from tropical heat with lush green meadows.\n- Autumn (September to November): Kashmir Chinar leaves turn fiery crimson golden; crisp clear Himalayan views.\n- Winter (December to February): Fresh snowfall, skiing in Gulmarg, and snow sports in Manali.'
  },
  {
    id: 'dest-7',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'What documents are required to enter Ladakh and high-altitude border zones?',
    answer: 'For Indian citizens visiting Ladakh border regions (Nubra Valley, Pangong Tso, Khardung La, Chang La), an Inner Line Permit (ILP) or Protected Area Permit is required, which our operations team arranges smoothly on arrival in Leh.'
  },
  {
    id: 'dest-8',
    category: 'destinations',
    categoryLabel: 'Domestic & International',
    question: 'Can we book multi-country international holiday combinations?',
    answer: 'Yes! Popular multi-country combinations include Thailand + Vietnam, Singapore + Malaysia, or South Korea + Japan. Our international travel desk prepares synchronized flight routes and hotel transfers.'
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
    answer: 'You are provided with a dedicated Tour Manager’s direct phone and WhatsApp number before you depart. Additionally, our 24x7 customer helpline is active at +91 94199 15255 and care@holidayshunt.com.'
  }
];

export const ALL_GENERAL_FAQS: GeneralFaq[] = [
  ...FAMILY_FAQS,
  ...HONEYMOON_FAQS,
  ...PILGRIMAGE_GENERAL_FAQS,
  ...DESTINATIONS_FAQS,
  ...BOOKING_POLICY_FAQS,
];

export interface DestinationGuide {
  overview?: string;
  bestTimeToVisit?: string;
  idealDuration?: string;
  nearestAirport?: string;
  nearestRailway?: string;
  topAttractions?: {
    name: string;
    description: string;
    image?: string;
    badge?: string;
  }[];
  thingsToDo?: string[];
  localCuisine?: {
    dish: string;
    description: string;
  }[];
  travelTips?: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
}

export interface DestinationMeta {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  state: string;
  tagline: string;
  heroImage: string;
  guideTitle: string;
  weatherInfo: string;
  bestSeason: string;
  startingPrice: number;
  popularCities: string[];
  keyHighlights?: string[];
  categoryFilters: { id: string; label: string; iconName: string }[];
  guide: DestinationGuide;
  destinationType?: 'regular' | 'temple';
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
}

export const DESTINATIONS_REGISTRY: Record<string, DestinationMeta> = {
  'jammu-kashmir': {
    id: 'jammu-kashmir',
    slug: 'jammu-kashmir',
    name: 'Jammu & Kashmir',
    displayName: 'JAMMU & KASHMIR',
    state: 'Jammu & Kashmir',
    destinationType: 'regular',
    tagline: 'Vaishno Devi Cave Yatra, Dal Lake Shikara & Gulmarg Alpine Snow',
    heroImage: 'https://images.unsplash.com/photo-1719377678428-d9bcec6976f3?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Jammu & Kashmir Sacred Yatra & Valley Guide',
    weatherInfo: '8°C - 24°C (Alpine & Hill Climate)',
    bestSeason: 'Year-Round (Navratri & Winter Snow Peak)',
    startingPrice: 6499,
    keyHighlights: [
      'Vaishno Devi Bhawan',
      'Dal Lake Shikara',
      'Gulmarg Gondola',
      'Shiv Khori Cave',
    ],
    popularCities: [
      'Vaishno Devi (Katra)',
      'Shankaracharya Temple (Srinagar)',
      'Shiv Khori Cave',
      'Srinagar (Dal Lake)',
      'Gulmarg Gondola',
      'Pahalgam (Betaab Valley)',
      'Patnitop & Sanasar',
      'Sonmarg Glacier',
      'Raghunath Temple (Jammu)',
    ],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'pilgrimage', label: 'Sacred Yatra', iconName: 'Sparkles' },
      { id: 'helicopter', label: 'Helicopter Yatra', iconName: 'Plane' },
      { id: 'senior', label: 'Senior Friendly', iconName: 'Users' },
      { id: 'family', label: 'Family & Hills', iconName: 'Hotel' },
      { id: 'honeymoon', label: 'Valley Special', iconName: 'Heart' },
    ],
    guide: {
      overview:
        'From the world-revered cave sanctum of Shri Mata Vaishno Devi in the Trikuta Hills and the mystical stalagmite cave of Shiv Khori, to the historic Shankaracharya Hill Temple and the tranquil jewel of Dal Lake in Srinagar, Jammu & Kashmir is a celestial union of divine spirituality and breathless Himalayan grandeur. Experience scenic shikaras, snow-clad Apharwat peaks in Gulmarg, verdant Lidder pine valleys in Pahalgam, and serene mountain getaways in Patnitop with trusted accommodations and sanitized private chauffeur transfers.',
      bestTimeToVisit:
        'Mata Vaishno Devi Yatra is open 365 days a year with grand Navratri celebrations in March-April and October. For Kashmir Valley, April to October offers blooming valleys, lush gardens, and pleasant weather, while December to February transforms Gulmarg and Sonmarg into a world-class winter snow wonderland.',
      idealDuration: '4 to 8 Days (3-4 Days for Katra & Shiv Khori; 6-8 Days for Grand J&K Circuit)',
      nearestAirport: 'Srinagar International Airport (SXR) & Jammu Domestic Airport (IXJ)',
      nearestRailway: 'Shri Mata Vaishno Devi Katra (SVDK) & Jammu Tawi (JAT) with direct Vande Bharat Express connectivity',
      topAttractions: [
        {
          name: 'Shri Mata Vaishno Devi',
          description:
            'Holistic cave sanctum nestled at 5,200 ft in Trikuta Hills where Maha Kali, Maha Lakshmi, and Maha Saraswati reside as self-manifested Pindies. Reachable by a paved 12 KM trek, electric eco-battery cars, ponies, palkis, or helicopter to Sanjichhat.',
        },
        {
          name: 'Shankaracharya Temple',
          description:
            'Historic Shiva temple situated atop Gopadari Hill at 1,100 ft above Srinagar city level, blessed by Adi Shankaracharya in the 9th century and offering breathtaking 360-degree panoramas of Dal Lake and the Zabarwan mountain range.',
        },
        {
          name: 'Shiv Khori',
          description:
            'A 200-meter-long natural limestone cave housing a 4-foot self-formed (Svayambhu) Shivling with continuous natural mineral water dripping from the ceiling. A sanctified pilgrimage just 75 km from Katra.',
        },
        {
          name: 'Bhairon Ghati',
          description:
            'Perched at 6,600 ft above Bhawan, the completion of Mata Vaishno Devi darshan requires paying homage to Baba Bhaironath. Accessible within 3 minutes via the modern high-capacity aerial passenger ropeway.',
        },
        {
          name: 'Dal Lake',
          description:
            'The crown jewel of Srinagar featuring heritage hand-carved cedar wood houseboats, colorful flower Shikara rides, floating vegetable markets, and the historic four chinar island overlooking the Mughal gardens.',
        },
        {
          name: 'Gulmarg Gondola',
          description:
            'One of the worlds highest operating passenger cable cars, carrying travelers across dense pine forests to Phase 1 (Kongdoori) and Phase 2 (Apharwat Peak) for skiing, snowmobile adventures, and sweeping views of Nanga Parbat.',
        },
        {
          name: 'Pahalgam & Betaab Valley',
          description:
            'A pristine mountain paradise on the banks of the rushing Lidder River, surrounded by cedar forests. It serves as the traditional starting base for the annual Amarnath Yatra and gateway to scenic Betaab and Aru valleys.',
        },
        {
          name: 'Patnitop',
          description:
            'A tranquil hill resort perched at 6,640 ft enveloped by dense deodars, featuring the Skyview aerial ropeway from Sanget, ancient Nag Temple, and the high-altitude pine meadow and lake of Sanasar.',
        },
        {
          name: 'Sonmarg',
          description:
            'Set against towering snow peaks on the Sindh River, Sonmarg is famous for pony treks to the eternal snowfields of Thajiwas Glacier, scenic alpine river walks, and acting as the fast-track gateway to Baltal for Amarnath Yatra.',
        },
        {
          name: 'Raghunath Temple',
          description:
            'One of Northern Indias largest historic temple complexes built by Maharaja Gulab Singh, housing seven inner shrines whose sanctum walls are adorned with gold sheets and rare Sanskrit manuscripts.',
        },
        {
          name: 'Maa Kheer Bhawani',
          description:
            'Revered Kashmiri Hindu temple dedicated to Goddess Ragnya Devi, built over a sacred natural spring whose waters are believed to change hues with regional spiritual portents.',
        },
        {
          name: 'Ardhkuwari Cave',
          description:
            'Sacred cave sanctuary located exactly midway on the Vaishno Devi trek at 4,800 ft where Goddess meditated for nine months in the Garbhjoon cave before reaching her permanent abode at Bhawan.',
        },
        {
          name: 'Baba Dhansar',
          description:
            'A deeply tranquil holy natural spring and cave sanctuary located just 17 km from Katra. Cool mineral streams flow continuously over an ancient natural Shivling nestled in lush forest groves.',
        },
        {
          name: 'Ranbireshwar Temple',
          description:
            'Northern Indias largest Shiva temple, built in 1883 by Maharaja Ranbir Singh. Houses a central 7.5-foot black stone Shivling, twelve crystal (sphatik) Jyotirlingas, and 1.25 lakh sacred Bana Lingas brought from Narmada.',
        },
        {
          name: 'Bawe Wali Mata',
          description:
            'Overlooking the Tawi River from inside the historic 3,000-year-old Bahu Fort, this sanctified Mahakali shrine is the supreme spiritual guardian of Jammu, drawing millions during festive Navratris.',
        },
        {
          name: 'Peer Kho Cave Temple',
          description:
            'Historic underground limestone cave on the banks of River Tawi where Sage Jamvant (the legendary bear king of Ramayana) meditated on Lord Shiva. Houses an ancient Svayambhu Shivling.',
        },
        {
          name: 'Sharika Devi Temple',
          description:
            'Perched on the western slopes of Hari Parbat in Srinagar, this sacred shrine is dedicated to the 18-armed Goddess Sharika Bhagwati (an incarnation of Durga), the revered presiding deity of Kashmiri Pandits.',
        },
        {
          name: 'Sudh Mahadev',
          description:
            'Ancient pilgrimage site preserving the sacred iron trident (Trishul) of Lord Shiva, paired with nearby Mantalai where Lord Shiva and Goddess Parvati were married according to Puranic lore.',
        },
        {
          name: 'Amarnath Cave',
          description:
            'Located at 12,756 ft in the Lidder Valley, the world-famous cave where Lord Shiva narrated the Amar Katha (secret of immortality) to Maa Parvati. Visited annually during Shravan via the Pahalgam or Baltal helicopter routes.',
        },
      ],
      thingsToDo: [
        'Perform morning or evening Darshan at Mata Vaishno Devi Bhawan with RFID fast-track access',
        'Climb the peaceful stone stairs to Shankaracharya Hill Temple for panoramic sunset views over Srinagar',
        'Take an early morning Shikara ride on Dal Lake through floating markets and lotus fields',
        'Ride the two-phase Gulmarg Gondola up to 13,780 ft on Apharwat mountain peak',
        'Explore the mystical limestone stalagmite formations inside Shiv Khori cave with local guided assistance',
        'Experience a luxury heritage cedar houseboat stay with hot traditional Kashmiri Kahwa on Dal Lake or Nigeen Lake',
        'Visit the scenic filming spots of Betaab Valley and river rafting points in Pahalgam',
      ],
      localCuisine: [
        { dish: 'Jammu Rajma Chawal & Anardana Chutney', description: 'Tender red hill kidney beans slow-cooked in aromatic spices and desi ghee, served with steamed rice and tangy wild pomegranate chutney.' },
        { dish: 'Kashmiri Kahwa', description: 'Traditional aromatic green tea infused with whole saffron strands, crushed green cardamom, cinnamon, and slivered almonds.' },
        { dish: 'Kaladi Kulcha', description: 'Indigenous aged Himalayan ripened mozzarella cheese shallow-fried to golden perfection and stuffed inside toasted local kulcha bread.' },
        { dish: 'Kashmiri Dum Aloo & Nadru Yakhni', description: 'Baby potatoes simmered in spicy yogurt gravy and lotus stem cooked in mild aromatic yogurt and saffron broth.' },
      ],
      travelTips: [
        'Mandatory RFID Yatra Access Cards must be collected at Katra railway station, bus stand, or counter before beginning the Vaishno Devi trek.',
        'Postpaid SIM cards (Jio, Airtel, BSNL) are required in Jammu & Kashmir. Standard prepaid SIM cards from other Indian states will not have active network due to regional telecom regulations.',
        'Helicopter tickets for Katra and Gulmarg Gondola tickets are in high demand and should be booked well in advance through verified official portals.',
        'Carry warm thermal inners and windproof jackets even in summer for high altitudes like Gulmarg Phase 2, Sonmarg, and overnight stays in Pahalgam.',
      ],
      faqs: [
        {
          question: '1. How do I get the mandatory RFID Yatra Card for Mata Vaishno Devi?',
          answer:
            'The RFID Yatra Access Card is mandatory and free of charge for every pilgrim. It can be obtained 24/7 at Katra Railway Station, Katra Bus Stand, or registered online via the official Shri Mata Vaishno Devi Shrine Board (SMVDSB) website. The card must be carried throughout the yatra and tapped at entry/exit checkpoints.',
        },
        {
          question: '2. What are the best travel options for senior citizens and kids to Vaishno Devi?',
          answer:
            'Senior citizens and families have multiple comfortable options: (1) 8-minute helicopter from Katra to Sanjichhat; (2) 24/7 eco-friendly battery cars operating between Himkoti and Bhawan; (3) Traditional Palkis (sedan chairs) and Ponies with Shrine Board-authorized rates and ID-verified operators.',
        },
        {
          question: '3. How can we visit Shankaracharya Temple in Srinagar?',
          answer:
            'Shankaracharya Temple is located atop Gopadari Hill in Srinagar. Vehicles can drive up to the dedicated hill parking lot, after which there are approximately 240 well-maintained stone steps equipped with railings and rest platforms leading to the inner sanctum. Cameras and mobile phones are securely deposited at the police checkpoint at the base of the stairs.',
        },
        {
          question: '4. How far is Shiv Khori from Katra and how to plan the trip?',
          answer:
            'Shiv Khori is located in Ransoo village, approximately 75 KM (~2.5 hours by private cab) from Katra. From the Ransoo base point, a scenic 3.5 KM paved trek (or pony ride) leads to the holy limestone cave. It is ideally completed as a full-day excursion from Katra.',
        },
        {
          question: '5. Can we combine Vaishno Devi (Katra) and Kashmir Valley in one single tour?',
          answer:
            'Yes, absolutely! Our 7 to 9-day combined yatra and valley packages are among our most requested itineraries. The route comfortably travels from Jammu/Katra via Patnitop through the Banihal Qazigund tunnel to Srinagar, Gulmarg, and Pahalgam in private AC sanitized vehicles.',
        },
        {
          question: '6. What type of clothing and woolens should we pack for Jammu & Kashmir?',
          answer:
            'For summers (April-August): Light cotton clothes with light woolens/windcheaters for evenings in Srinagar, Pahalgam, and Katra. For Gulmarg Phase 2 and Sonmarg, a warm jacket is recommended. For winters (November-March): Heavy thermal inners, down feather jackets, woolen caps, gloves, and snow boots.',
        },
        {
          question: '7. Will our mobile phone SIM cards work in Jammu and Kashmir?',
          answer:
            'Only POSTPAID mobile SIM connections (Jio, Airtel, BSNL, Vodafone-Idea) work in Jammu & Kashmir due to national telecom regulations. Prepaid SIM cards issued outside of J&K will stop working once you enter the state. You can easily purchase a local prepaid tourist SIM upon arrival in Jammu or Srinagar by presenting your Aadhaar card.',
        },
        {
          question: '8. Is pure vegetarian and Jain food available during the trip?',
          answer:
            'Yes, Katra is a 100% sacred vegetarian pilgrimage town with complete sanctity. In Srinagar, Pahalgam, Gulmarg, and along the national highway, numerous verified 100% pure vegetarian and dedicated satvik Jain restaurants (without onion/garlic) operate year-round, serving delicious satvik meals to yatris.',
        },
        {
          question: '9. How do we book Gulmarg Gondola and Shikara rides?',
          answer:
            'Shikara rides on Dal Lake can be enjoyed spontaneously at any of the heritage ghats (Boulevard Road). For Gulmarg Gondola Phase 1 (Kongdoori) and Phase 2 (Apharwat), tickets must be reserved online through the J&K Cable Car Corporation portal in advance due to strict daily visitor caps.',
        },
        {
          question: '10. What government IDs are required during travel in Jammu & Kashmir?',
          answer:
            'Every traveler (including children) must carry an original government-issued photo ID (Aadhaar Card, Voter ID, Passport, or Driving License). These are required for airport boarding, hotel check-ins, police verification checkpoints, and Vaishno Devi RFID yatra generation.',
        },
      ],
    },
  },


};

export const POPULAR_DESTINATION_SLUGS = [
  'jammu-kashmir',
];

export function getDestinationBySlug(slug?: string | null): DestinationMeta | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  
  // Direct key lookup
  if (DESTINATIONS_REGISTRY[clean]) return DESTINATIONS_REGISTRY[clean];

  // Map common aliases
  if (
    clean === 'jammu' ||
    clean === 'kashmir' ||
    clean === 'jammu-and-kashmir' ||
    clean === 'jammu_kashmir' ||
    clean === 'katra' ||
    clean === 'srinagar' ||
    clean === 'gulmarg' ||
    clean === 'pahalgam' ||
    clean === 'sonmarg' ||
    clean === 'vaishno-devi'
  ) {
    return DESTINATIONS_REGISTRY['jammu-kashmir'];
  }
  // Fuzzy match
  const foundKey = Object.keys(DESTINATIONS_REGISTRY).find(
    (key) => clean.includes(key) || DESTINATIONS_REGISTRY[key].name.toLowerCase().includes(clean)
  );
  return foundKey ? DESTINATIONS_REGISTRY[foundKey] : undefined;
}

export function matchPackageToDestination(pkg: any, destSlug: string): boolean {
  if (!pkg || !destSlug) return false;
  const target = destSlug.toLowerCase().trim();

  const destStr = (pkg.destination || '').toLowerCase();
  const titleStr = (pkg.title || '').toLowerCase();
  const slugStr = (pkg.slug || '').toLowerCase();
  const locStr = (pkg.location || '').toLowerCase();
  const tagStr = (pkg.destinationTag || '').toLowerCase();

  // Holidays Hunt currently operates only in Jammu & Kashmir.
  if (
    target === 'jammu-kashmir' ||
    target === 'jammu' ||
    target === 'kashmir' ||
    target === 'jammu-and-kashmir' ||
    target === 'jammu_kashmir'
  ) {
    return (
      destStr.includes('jammu') ||
      destStr.includes('katra') ||
      destStr.includes('vaishno') ||
      destStr.includes('kashmir') ||
      destStr.includes('srinagar') ||
      destStr.includes('gulmarg') ||
      destStr.includes('pahalgam') ||
      destStr.includes('patnitop') ||
      destStr.includes('shivkhori') ||
      destStr.includes('sonmarg') ||
      titleStr.includes('jammu') ||
      titleStr.includes('katra') ||
      titleStr.includes('vaishno') ||
      titleStr.includes('kashmir') ||
      titleStr.includes('srinagar') ||
      titleStr.includes('gulmarg') ||
      titleStr.includes('pahalgam') ||
      slugStr.includes('jammu') ||
      slugStr.includes('katra') ||
      slugStr.includes('kashmir') ||
      locStr.includes('jammu') ||
      locStr.includes('kashmir') ||
      locStr.includes('katra') ||
      locStr.includes('srinagar') ||
      tagStr.includes('jammu') ||
      tagStr.includes('kashmir')
    );
  }

  return false;
}

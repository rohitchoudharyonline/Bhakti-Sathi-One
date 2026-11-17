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
  tourPackagesDescription?: string;
  tourPackageFaqs?: { question: string; answer: string }[];
  guide: DestinationGuide;
  destinationType?: 'regular' | 'temple';
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
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
    seoMetaTitle: 'Jammu and Kashmir Tour Packages | Holidays Hunt',
    seoMetaDescription: 'Explore Jammu and Kashmir tour packages covering Srinagar, Gulmarg, Pahalgam, Sonamarg and Vaishno Devi with private cabs and hotels.',
    seoKeywords: 'jammu and kashmir tour packages, kashmir tour packages, jammu kashmir holiday packages, kashmir family tour packages, kashmir honeymoon packages, vaishno devi tour package',
    tourPackagesDescription: 'Plan your Jammu and Kashmir holiday with thoughtfully designed tour packages covering the region’s most-loved landscapes, from the calm waters of Dal Lake and the gardens of Srinagar to the alpine beauty of Gulmarg, the valleys of Pahalgam and the scenic routes of Sonamarg. Choose a short getaway or a longer itinerary with comfortable hotels, private cab transfers and flexible sightseeing. Holidays Hunt also helps families, couples and pilgrims customise their Jammu and Kashmir tour package around travel dates, preferred stays, sightseeing interests and overall trip pace.',
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
  'himachal': {
    id: 'himachal',
    slug: 'himachal',
    name: 'Himachal Pradesh',
    displayName: 'Himachal Pradesh',
    state: 'Himachal Pradesh',
    destinationType: 'regular',
    tagline: 'Manali Pine Valleys, Shimla Ridge & Solang Alpine Adventures',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    guideTitle: 'Himachal Pradesh Mountain Escapes & Devi Temples',
    seoMetaTitle: 'Himachal Pradesh Tour Packages | Holidays Hunt',
    seoMetaDescription: 'Discover handcrafted Himachal Pradesh tour packages covering Manali, Shimla, Dharamshala, Dalhousie and Spiti Valley with sanitized cabs and stays.',
    seoKeywords: 'himachal tour packages, manali tour packages, shimla manali packages, himachal family tours, dharamshala dalhousie tour',
    tourPackagesDescription: 'Experience the magic of the Western Himalayas with Holidays Hunt Himachal tour packages. Wander through lush pine trails in Manali, ride through Atal Tunnel to Solang Valley, explore the colonial charm of Shimla, and find serenity in Dharamshala and Dalhousie. Every package comes with comfortable mountain stays, seasoned local drivers, and personalized 24x7 support.',
    weatherInfo: '10°C - 26°C (Pleasant Summers & Snowy Winters)',
    bestSeason: 'March to June (Pleasant) & November to February (Snow)',
    startingPrice: 14999,
    keyHighlights: [
      'Solang Valley & Atal Tunnel',
      'Shimla Mall Road & Kufri',
      'Dharamshala Dalai Lama Temple',
      'Rohtang Snow Pass',
    ],
    popularCities: [
      'Manali (Solang & Old Manali)',
      'Shimla (Ridge & Mall Road)',
      'Dharamshala & McLeod Ganj',
      'Dalhousie & Khajjiar',
      'Kullu & Kasol Valley',
      'Spiti & Kaza Circuit',
    ],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family Holidays', iconName: 'Hotel' },
      { id: 'honeymoon', label: 'Honeymoon Specials', iconName: 'Heart' },
      { id: 'pilgrimage', label: 'Devi Darshan', iconName: 'Sparkles' },
      { id: 'adventure', label: 'Adventure & Snow', iconName: 'Mountain' },
    ],
    guide: {
      overview:
        'Himachal Pradesh is a crown jewel of the Western Himalayas, featuring whispering deodar forests, apple orchards, swift-flowing rivers, snow-capped passes, and revered Shaktipeeth shrines. From peaceful family retreats in Shimla and Manali to the tranquil Buddhist heritage of Dharamshala, every journey is a breath of fresh mountain air.',
      bestTimeToVisit:
        'March to June is ideal for blooming flowers and cool weather; October to February is perfect for winter snow lovers in Solang and Kufri.',
      idealDuration: '5 to 9 Days',
      nearestAirport: 'Bhuntar Airport Kullu (KUU), Gaggal Airport Kangra (DHM), or Chandigarh International (IXC)',
      nearestRailway: 'Chandigarh Junction (CDG) and Kalka (KLK) with toy train connectivity',
      topAttractions: [
        { name: 'Solang Valley & Atal Tunnel', description: 'Thrilling snow sports, paragliding, and high-altitude mountain vistas.' },
        { name: 'Shimla Ridge & Mall Road', description: 'Iconic heritage promenade, Christ Church, and panoramic Himalayan peaks.' },
        { name: 'Khajjiar & Dalhousie', description: 'The Mini Switzerland of India, surrounded by dense deodars and a peaceful lake.' },
      ],
    },
  },
};

export const POPULAR_DESTINATION_SLUGS = [
  'jammu-kashmir',
  'himachal',
];

export function getDestinationBySlug(slug?: string | null): DestinationMeta | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  
  // Direct key lookup
  if (DESTINATIONS_REGISTRY[clean]) return DESTINATIONS_REGISTRY[clean];

  // Map common aliases
  if (
    clean === 'himachal' ||
    clean === 'himachal-pradesh' ||
    clean === 'himachal_pradesh' ||
    clean === 'manali' ||
    clean === 'shimla' ||
    clean === 'dharamshala' ||
    clean === 'spiti' ||
    clean === 'h' ||
    clean === 'hp'
  ) {
    return DESTINATIONS_REGISTRY['himachal'];
  }

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
    clean === 'vaishno-devi' ||
    clean === 'j&k' ||
    clean === 'jk'
  ) {
    return DESTINATIONS_REGISTRY['jammu-kashmir'];
  }

  if (
    clean === 'ladakh' ||
    clean === 'leh' ||
    clean === 'leh-ladakh' ||
    clean === 'pangong'
  ) {
    return DESTINATIONS_REGISTRY['ladakh'];
  }

  // Fuzzy match
  const foundKey = Object.keys(DESTINATIONS_REGISTRY).find(
    (key) => clean.includes(key) || DESTINATIONS_REGISTRY[key].name.toLowerCase().includes(clean)
  );
  return foundKey ? DESTINATIONS_REGISTRY[foundKey] : undefined;
}

const normalizeDestinationKey = (value?: string | null): string =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[&/]+/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const hasWholeWordOrPhrase = (text: string, terms: string[]): boolean => {
  if (!text) return false;
  return terms.some((term) => {
    const clean = term.trim().toLowerCase();
    if (!clean) return false;
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s\\-_]+');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return regex.test(text);
  });
};

const GENERIC_PLACE_NAMES = new Set(['city center', 'old town', 'valley point', 'snow peak']);

export function matchPackageToDestination(
  pkg: any,
  destSlug: string,
  destinationMeta?: Partial<DestinationMeta>
): boolean {
  if (!pkg || !destSlug) return false;

  const target = destSlug.toLowerCase().trim();
  const normalizedTarget = normalizeDestinationKey(destSlug);

  const candidateKeys = new Set<string>(
    [
      normalizedTarget,
      normalizeDestinationKey(destinationMeta?.slug),
      normalizeDestinationKey(destinationMeta?.id),
      normalizeDestinationKey(destinationMeta?.name),
      normalizeDestinationKey(destinationMeta?.displayName),
    ].filter(Boolean)
  );

  const rawCandidates = [
    target,
    String(destinationMeta?.slug || '').toLowerCase().trim(),
    String(destinationMeta?.id || '').toLowerCase().trim(),
    String(destinationMeta?.name || '').toLowerCase().trim(),
    String(destinationMeta?.displayName || '').toLowerCase().trim(),
  ].filter(Boolean);

  const destStr = String(pkg.destination || '').toLowerCase();
  const titleStr = String(pkg.title || '').toLowerCase();
  const slugStr = String(pkg.slug || '').toLowerCase();
  const locStr = String(pkg.location || '').toLowerCase();
  const tagStr = String(pkg.destinationTag || '').toLowerCase().trim();
  const countryStr = String(pkg.country || '').toLowerCase();
  const startStr = String(pkg.startLocation || '').toLowerCase();
  const endStr = String(pkg.endLocation || '').toLowerCase();

  const normalizedTag = normalizeDestinationKey(pkg.destinationTag);
  const normalizedDest = normalizeDestinationKey(pkg.destination);

  // 1. Direct normalized tag / destination name match (covers all CMS-created destinations & custom slugs/ids)
  if (normalizedTag && candidateKeys.has(normalizedTag)) return true;
  if (normalizedDest && candidateKeys.has(normalizedDest)) return true;

  // Also check if package's destinationTag matches normalized popular aliases in the same region
  const combinedPkgText = [destStr, titleStr, slugStr, locStr, tagStr, startStr, endStr]
    .filter(Boolean)
    .join(' ');

  const isJammuKashmirTarget =
    candidateKeys.has('jammu-kashmir') ||
    candidateKeys.has('jammu') ||
    candidateKeys.has('kashmir') ||
    candidateKeys.has('jammu-and-kashmir') ||
    candidateKeys.has('jk') ||
    candidateKeys.has('j-k') ||
    rawCandidates.some((c) => c.includes('jammu') || c.includes('kashmir'));

  const isHimachalTarget =
    candidateKeys.has('himachal') ||
    candidateKeys.has('himachal-pradesh') ||
    candidateKeys.has('hp') ||
    candidateKeys.has('h') ||
    candidateKeys.has('shimla') ||
    candidateKeys.has('manali') ||
    candidateKeys.has('dharamshala') ||
    candidateKeys.has('dalhousie') ||
    candidateKeys.has('spiti') ||
    rawCandidates.some((c) => c.includes('himachal'));

  const isLadakhTarget =
    candidateKeys.has('ladakh') ||
    candidateKeys.has('leh') ||
    candidateKeys.has('leh-ladakh') ||
    candidateKeys.has('pangong') ||
    rawCandidates.some((c) => c.includes('ladakh'));

  if (isJammuKashmirTarget) {
    const jkKeywords = [
      'jammu',
      'katra',
      'vaishno',
      'kashmir',
      'srinagar',
      'gulmarg',
      'pahalgam',
      'patnitop',
      'shivkhori',
      'shiv khori',
      'sonmarg',
      'sonamarg',
      'doodhpathri',
      'gurez',
      'bhaderwah',
      'sanasar',
      'amarnath',
    ];
    return (
      tagStr.includes('jammu') ||
      tagStr.includes('kashmir') ||
      destStr.includes('jammu') ||
      destStr.includes('kashmir') ||
      titleStr.includes('jammu') ||
      titleStr.includes('kashmir') ||
      hasWholeWordOrPhrase(combinedPkgText, jkKeywords)
    );
  }

  if (isHimachalTarget) {
    if (normalizedTag === 'hp' || normalizedTag === 'h' || normalizedTag.includes('himachal')) {
      return true;
    }
    const himachalKeywords = [
      'himachal',
      'himachal pradesh',
      'shimla',
      'simla',
      'manali',
      'dharamshala',
      'dharmshala',
      'mcleodganj',
      'mcleod ganj',
      'dalhousie',
      'khajjiar',
      'kullu',
      'kasol',
      'spiti',
      'kaza',
      'kinnaur',
      'kalpa',
      'chitkul',
      'kufri',
      'rohtang',
      'atal tunnel',
      'solang',
      'chamba',
      'palampur',
      'kangra',
      'chintpurni',
      'jwalamukhi',
      'jwalaji',
      'naina devi',
      'baglamukhi',
      'chamunda',
      'bir billing',
      'jibhi',
      'tirthan',
      'narkanda',
      'kasauli',
      'barog',
      'chail',
      'sangla',
      'sissu',
      'keylong',
      'jispa',
    ];
    return (
      tagStr.includes('himachal') ||
      destStr.includes('himachal') ||
      titleStr.includes('himachal') ||
      slugStr.includes('himachal') ||
      countryStr.includes('himachal') ||
      hasWholeWordOrPhrase(combinedPkgText, himachalKeywords)
    );
  }

  if (isLadakhTarget) {
    const ladakhKeywords = [
      'ladakh',
      'leh',
      'pangong',
      'nubra',
      'khardung',
      'zanskar',
      'tso moriri',
      'diskit',
      'hanle',
    ];
    return (
      tagStr.includes('ladakh') ||
      destStr.includes('ladakh') ||
      titleStr.includes('ladakh') ||
      slugStr.includes('ladakh') ||
      hasWholeWordOrPhrase(combinedPkgText, ladakhKeywords)
    );
  }

  // 2. Generic matching for any other custom CMS-created destination
  const meaningfulTerms = [
    ...rawCandidates.filter((c) => c.length >= 3),
    ...((destinationMeta?.popularCities || [])
      .map((city) => String(city || '').split('(')[0].trim().toLowerCase())
      .filter((city) => city.length >= 3 && !GENERIC_PLACE_NAMES.has(city))),
  ];

  if (meaningfulTerms.length > 0 && hasWholeWordOrPhrase(combinedPkgText, meaningfulTerms)) {
    return true;
  }

  return false;
}


/**
 * Builds a destination-specific introduction from verified CMS fields.
 * It intentionally avoids invented attractions, prices, travel times or service claims.
 */
export function generateDestinationSeoIntroduction(destination: Partial<DestinationMeta>): string {
  const name = (destination.name || '').trim();
  if (!name) return '';

  const genericPlaceNames = new Set(['city center', 'old town', 'valley point', 'snow peak']);
  const places = (destination.popularCities || [])
    .map((place) => place.trim())
    .filter((place) => place && !genericPlaceNames.has(place.toLowerCase()))
    .slice(0, 5);
  const highlights = (destination.keyHighlights || [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  const state = (destination.state || '').trim();
  const location = state && state.toLowerCase() !== 'india' && state.toLowerCase() !== name.toLowerCase()
    ? ` in ${state}`
    : '';
  const placesText = places.length
    ? `Popular places and travel hubs include ${places.join(', ')}.`
    : '';
  const highlightsText = highlights.length
    ? `Highlights include ${highlights.join(', ')}.`
    : '';
  const tagline = (destination.tagline || '').trim();
  const theme = tagline ? `The destination is known for ${tagline.charAt(0).toLowerCase() + tagline.slice(1)}.` : '';

  const tripType = destination.destinationType === 'temple'
    ? 'pilgrimage and temple visits'
    : 'sightseeing, local experiences and relaxed holidays';

  return [
    `Explore ${name}${location} with destination-focused ${name} tour packages from Holidays Hunt.`,
    placesText,
    highlightsText,
    theme,
    `Compare available holiday packages and plan ${tripType} around your travel dates, interests and preferred pace.`,
    `Use this ${name} travel guide to review the destination details and choose an itinerary that matches your plans.`,
  ].filter(Boolean).join(' ').replace(/\\s+/g, ' ').trim();
}

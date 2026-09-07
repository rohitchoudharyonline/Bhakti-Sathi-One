export interface DestinationGuide {
  overview: string;
  bestTimeToVisit: string;
  idealDuration: string;
  nearestAirport: string;
  nearestRailway: string;
  topAttractions: {
    name: string;
    description: string;
    image: string;
    badge?: string;
  }[];
  thingsToDo: string[];
  localCuisine: {
    dish: string;
    description: string;
  }[];
  travelTips: string[];
  faqs: {
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
  categoryFilters: { id: string; label: string; iconName: string }[];
  guide: DestinationGuide;
}

export const DESTINATIONS_REGISTRY: Record<string, DestinationMeta> = {
  jammu: {
    id: 'jammu',
    slug: 'jammu',
    name: 'Jammu',
    displayName: 'JAMMU & KATRA',
    state: 'Jammu & Kashmir',
    tagline: 'Holy shrine of Mata Vaishno Devi, misty pine meadows of Patnitop & ancient temple heritage',
    heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Jammu & Katra guide',
    weatherInfo: '18°C - 29°C (Pleasant in hills)',
    bestSeason: 'Year-Round (Navratri & Winters peak)',
    startingPrice: 6499,
    popularCities: ['Katra', 'Vaishno Devi Bhawan', 'Patnitop', 'Shivkhori', 'Jammu City', 'Sanasar', 'Bahu Fort'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'pilgrimage', label: 'Pilgrimage & Yatra', iconName: 'Sparkles' },
      { id: 'helicopter', label: 'Helicopter Yatra', iconName: 'Plane' },
      { id: 'senior', label: 'Senior Friendly', iconName: 'Users' },
      { id: 'family', label: 'Family & Hills', iconName: 'Hotel' },
      { id: 'weekend', label: 'Short Break (2-3D)', iconName: 'Clock' },
    ],
    guide: {
      overview:
        'Known as the "City of Temples", Jammu is the spiritual gateway to the Himalayas. From the revered Mata Vaishno Devi cave shrine in the Trikuta hills of Katra to the emerald pine meadows of Patnitop, the mysterious limestone stalagmite Shivling of Shivkhori, and the historic Raghunath & Bahu Temples, Jammu offers a sublime mix of spirituality, mountain serenity, and Dogra culture.',
      bestTimeToVisit:
        'Mata Vaishno Devi Yatra is open 365 days a year. September to March offers cool and pleasant weather. Navratri (March-April and October) witnesses grand celestial aartis, while Patnitop enjoys snow in December–February.',
      idealDuration: '3 to 5 Days (Including Katra Yatra and Patnitop / Shivkhori)',
      nearestAirport: 'Jammu Airport (IXJ) - 48 KM from Katra (1.2 Hours via dedicated expressway)',
      nearestRailway: 'Shri Mata Vaishno Devi Katra Railway Station (SVDK) & Jammu Tawi (JAT)',
      topAttractions: [
        {
          name: 'Shri Mata Vaishno Devi Bhawan',
          description:
            'Holistic cave sanctum nestled at 5,200 ft in Trikuta Hills. Reachable by 12 KM trek, electric battery cars, ponies, or 8-minute helicopter from Katra to Sanjichhat.',
          image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
          badge: 'Most Sacred',
        },
        {
          name: 'Bhairon Ghati & Ropeway',
          description:
            'Panoramic aerial passenger cable car linking Vaishno Devi Bhawan to Bhairon Temple at 6,600 ft with breathless views of the Himalayan valleys.',
          image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
          badge: 'Aerial Views',
        },
        {
          name: 'Patnitop & Sanasar Meadows',
          description:
            'Mesmerizing hill station surrounded by dense deodar and pine forests, offering paragliding, nature trails, and snow activities in winter.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'Pine Meadows',
        },
        {
          name: 'Shivkhori Holy Cave',
          description:
            'A 200-meter-long natural limestone cave shrine with a 4-foot self-formed Svayambhu Shivling and continuous natural water dripping.',
          image: 'https://images.unsplash.com/photo-1600100397608-f010f443b740?auto=format&fit=crop&w=800&q=80',
          badge: 'Ancient Cave',
        },
      ],
      thingsToDo: [
        'Helicopter Darshan from Katra to Sanjichhat with priority VIP gate entry',
        'Experience the Divine Atka Aarti at Vaishno Devi Bhawan',
        'Skyview Ropeway ride from Sanget to Patnitop (one of Asia’s longest ropeways)',
        'Savor traditional Dogra street food like Kaladi Kulcha and Rajma Chawal at Katra',
        'Explore the underground aquarium and heritage gardens at Bahu Fort, Jammu',
      ],
      localCuisine: [
        { dish: 'Jammu Rajma Chawal', description: 'Red kidney beans cooked in aromatic spices served with desi ghee and anardana chutney.' },
        { dish: 'Kaladi Kulcha', description: 'Indigenous aged ripened Himalayan cheese shallow-fried and served piping hot inside toasted buns.' },
        { dish: 'Ambal & Dogra Dham', description: 'Traditional sweet-and-sour pumpkin preparation served during Dogra celebrations.' },
        { dish: 'Chocolate Barfi & Sund', description: 'Fudge-like walnut sweet of Jammu and Katra dry-fruit panjeeri.' },
      ],
      travelTips: [
        'Mandatory RFID Yatra Access Cards must be issued at Katra railway station or bus stand before starting the trek.',
        'Helicopter tickets can sell out weeks in advance — Bhakti Sathi arranges confirmed bookings in advance.',
        'Senior citizens can utilize the 24/7 battery car service between Himkoti and Bhawan.',
        'Carry light woolens in summer and heavy thermal jackets during winter months (Nov - Feb).',
      ],
      faqs: [
        {
          question: 'How long does the Mata Vaishno Devi trek take from Katra?',
          answer:
            'The trek is approximately 12–13 KM. On foot it takes 4–6 hours; on pony 3 hours; via battery car 30 minutes from Ardhkuwari; and via helicopter just 8 minutes from Katra to Sanjichhat.',
        },
        {
          question: 'Does Bhakti Sathi sell or provide Katra helicopter tickets?',
          answer:
            'NO. In strict compliance with Shri Mata Vaishno Devi Shrine Board (SMVDSB) guidelines, Bhakti Sathi DOES NOT sell or promise helicopter tickets. Helicopter tickets can ONLY be booked directly by pilgrims on the official SMVDSB website (maavaishnodeviboard.org). We assist with hotel stays, private cab transfers, and RFID Yatra card registration.',
        },
        {
          question: 'Can we combine Katra with Patnitop or Srinagar?',
          answer:
            'Absolutely! We offer combined tour packages such as Katra + Patnitop (4D/3N) and Grand Jammu + Kashmir (Katra–Patnitop–Srinagar–Gulmarg–Pahalgam, 8D/7N).',
        },
      ],
    },
  },
  kashmir: {
    id: 'kashmir',
    slug: 'kashmir',
    name: 'Kashmir',
    displayName: 'KASHMIR',
    state: 'Jammu & Kashmir',
    tagline: 'Paradise on Earth: Dal Lake Shikara, snow wonderland Gulmarg & Lidder valleys of Pahalgam',
    heroImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Kashmir guide',
    weatherInfo: '10°C - 24°C (Cool & Alpine)',
    bestSeason: 'Year-Round (April-Oct for Greenery, Dec-Feb for Snow)',
    startingPrice: 13999,
    popularCities: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonmarg', 'Doodhpathri', 'Dal Lake'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'honeymoon', label: 'Honeymoon Special', iconName: 'Heart' },
      { id: 'family', label: 'Family Vacation', iconName: 'Users' },
      { id: 'adventure', label: 'Snow & Skiing', iconName: 'Sparkles' },
      { id: 'luxury', label: '5-Star Luxury', iconName: 'Hotel' },
    ],
    guide: {
      overview:
        'Described by Mughal Emperor Jahangir as paradise on earth, Kashmir enchants with its iconic Dal Lake houseboats, Mughal gardens, alpine gondola cable car in Gulmarg, roaring Lidder river in Pahalgam, and golden glaciers of Sonmarg.',
      bestTimeToVisit:
        'Spring & Summer (April to September) for lush tulip gardens and pleasant valleys; Autumn (October to November) for golden Chinar leaves; and Winter (December to February) for deep powder snow and skiing.',
      idealDuration: '5 to 7 Days',
      nearestAirport: 'Sheikh ul-Alam International Airport Srinagar (SXR)',
      nearestRailway: 'Jammu Tawi (JAT) / Udhampur / Katra',
      topAttractions: [
        {
          name: 'Gulmarg Gondola & Apharwat Peak',
          description: 'Asia’s highest operational cable car taking you to 13,780 ft above sea level with 360-degree snow views.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'World Famous',
        },
        {
          name: 'Dal Lake & Houseboat Stay',
          description: 'Sunset shikara rides, floating vegetable markets, and overnight stays in carved cedarwood houseboats.',
          image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
          badge: 'Iconic',
        },
        {
          name: 'Betaab & Aru Valleys, Pahalgam',
          description: 'Pristine pine forests, alpine rivers, and trout streams where Bollywood blockbusters are filmed.',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          badge: 'Scenic Valleys',
        },
      ],
      thingsToDo: [
        'Ride the Gondola Phase 1 & 2 at Gulmarg',
        'Float in a Shikara during golden hour on Dal Lake',
        'Taste authentic 7-course Kashmiri Wazwan feast',
        'Shop for authentic Pashmina shawls, saffron, and walnut carvings at Lal Chowk',
      ],
      localCuisine: [
        { dish: 'Kashmiri Kahwa', description: 'Aromatic green tea brewed with saffron strands, cardamom, cinnamon, and slivered almonds.' },
        { dish: 'Rogan Josh & Gushtaba', description: 'Slow-cooked tender lamb in rich Kashmiri red chilli and yogurt gravy.' },
        { dish: 'Dum Aloo & Nadru Yakhni', description: 'Crispy baby potatoes in spicy gravy and lotus stem cooked in yogurt sauce.' },
      ],
      travelTips: [
        'Book Gulmarg Gondola tickets in advance through Bhakti Sathi to avoid last-minute slot shortages.',
        'Postpaid mobile SIM cards (Jio / Airtel / BSNL) work in Kashmir; prepaid SIM cards from other states do not work due to telecom regulations.',
      ],
      faqs: [
        {
          question: 'Is Kashmir safe for families and solo female travelers?',
          answer:
            'Yes, Kashmir is one of India’s most hospitable destinations with millions of happy tourists visiting annually. Bhakti Sathi provides verified chauffeur-driven private vehicles and 24x7 trip support.',
        },
      ],
    },
  },
  himachal: {
    id: 'himachal',
    slug: 'himachal',
    name: 'Himachal',
    displayName: 'HIMACHAL',
    state: 'Himachal Pradesh',
    tagline: 'Colonial heritage of Shimla Ridge, snow adventure at Solang & Atal Tunnel, and Tibetan cafes of Dharamshala',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Himachal guide',
    weatherInfo: '12°C - 25°C (Chilly in nights)',
    bestSeason: 'March to June (Summer) & Dec to Feb (Snow)',
    startingPrice: 11999,
    popularCities: ['Shimla', 'Manali', 'Solang Valley', 'Kullu', 'Dharamshala', 'Dalhousie', 'Kasol', 'Spiti'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'adventure', label: 'Adventure & Snow', iconName: 'Sparkles' },
      { id: 'relaxation', label: 'Relaxation & Nature', iconName: 'Heart' },
      { id: 'honeymoon', label: 'Honeymoon', iconName: 'Hotel' },
      { id: 'family', label: 'Family Volvo / SUV', iconName: 'Users' },
      { id: 'senior', label: 'Senior Friendly', iconName: 'Clock' },
    ],
    guide: {
      overview:
        'From the colonial Ridge of Shimla and deodar forests of Hadimba Temple in Manali to paragliding in Bir Billing and the high-altitude desert of Spiti, Himachal Pradesh is India’s ultimate Himalayan playground.',
      bestTimeToVisit:
        'March to June for pleasant summer escapes; September to November for clear mountain views; and December to February for fresh snowfall at Solang, Kufri, and Atal Tunnel.',
      idealDuration: '5 to 8 Days',
      nearestAirport: 'Chandigarh (IXC), Kullu Bhuntar (KUU), Kangra Gaggal (DHM)',
      nearestRailway: 'Chandigarh Junction (CDG) & Kalka Toy Train',
      topAttractions: [
        {
          name: 'Solang Valley & Atal Tunnel',
          description: 'Adrenaline capital for skiing, paragliding, zorbing, and drive into Lahaul valley via the 9 km long tunnel.',
          image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
          badge: 'Top Adventure',
        },
        {
          name: 'Shimla Mall Road & The Ridge',
          description: 'Pedestrian promenade featuring Christ Church, Scandal Point, and colonial Gaiety Theatre.',
          image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
          badge: 'Heritage',
        },
        {
          name: 'Hadimba Temple & Old Manali',
          description: '16th-century wooden temple amidst giant cedar pines and bohemian riverside cafes.',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
          badge: 'Ancient Pine Woods',
        },
      ],
      thingsToDo: [
        'Ride the historic UNESCO Kalka-Shimla Toy Train',
        'Cross the Atal Tunnel to view the frozen waterfalls of Sissu in Lahaul',
        'River rafting and paragliding in Kullu-Manali Beas valley',
        'Shop for authentic handmade Kullu shawls and Himachal apple jams',
      ],
      localCuisine: [
        { dish: 'Himachali Dham', description: 'Traditional festive meal served on leaf plates with Madra, Chha Gosht, and sweet rice.' },
        { dish: 'Siddu with Ghee', description: 'Steamed wheat flour bun stuffed with spiced poppy seeds or walnuts and bathed in desi ghee.' },
        { dish: 'Kullu Trout Fish', description: 'Fresh pan-fried river trout marinated with mountain herbs and lemon.' },
      ],
      travelTips: [
        'AC vehicles operate on plains and are switched off on mountain climbs for engine safety.',
        'Keep motion sickness tablets handy if prone to winding hill roads.',
      ],
      faqs: [
        {
          question: 'Can we visit Rohtang Pass or Atal Tunnel all year?',
          answer:
            'Atal Tunnel remains open throughout the year. Rohtang Pass is open from May to November depending on weather conditions and NGT permit quotas.',
        },
      ],
    },
  },
  amritsar: {
    id: 'amritsar',
    slug: 'amritsar',
    name: 'Amritsar',
    displayName: 'AMRITSAR',
    state: 'Punjab',
    tagline: 'Spiritual tranquility of the Golden Temple, patriotic fervor at Wagah Border & legendary Punjabi gastronomy',
    heroImage: 'https://images.unsplash.com/photo-1588096344356-9b57fc6a18d1?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Amritsar guide',
    weatherInfo: '15°C - 30°C (Sunny & Warm)',
    bestSeason: 'October to March (Pleasant Winters)',
    startingPrice: 5999,
    popularCities: ['Amritsar City', 'Attari-Wagah Border', 'Jallianwala Bagh', 'Gobindgarh Fort'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'pilgrimage', label: 'Golden Temple & Heritage', iconName: 'Sparkles' },
      { id: 'weekend', label: 'Short Break (2-3D)', iconName: 'Clock' },
      { id: 'combined', label: 'Amritsar + Himachal (5-6D)', iconName: 'Hotel' },
      { id: 'foodie', label: 'Gastronomy & Culture', iconName: 'Heart' },
    ],
    guide: {
      overview:
        'The spiritual and cultural capital of Punjab, Amritsar is crowned by the gleaming Sri Harmandir Sahib (Golden Temple). Experience the emotional evening retreat ceremony at Wagah Border, pay homage at Jallianwala Bagh, and relish the world’s most celebrated street food culture.',
      bestTimeToVisit:
        'October to March brings pleasant sunny days and crisp evenings, ideal for temple parikrama and Wagah Border excursions.',
      idealDuration: '2 to 3 Days (or 5-6 Days when combined with Dharamshala / Dalhousie)',
      nearestAirport: 'Sri Guru Ram Dass Jee International Airport (ATQ) - 11 KM',
      nearestRailway: 'Amritsar Junction (ASR)',
      topAttractions: [
        {
          name: 'Sri Harmandir Sahib (Golden Temple)',
          description:
            'The holiest Gurdwara of Sikhism covered in 500+ kg of 24k gold leaf, surrounded by the sacred Amrit Sarovar. Serves 100,000+ free langar meals daily.',
          image: 'https://images.unsplash.com/photo-1588096344356-9b57fc6a18d1?auto=format&fit=crop&w=800&q=80',
          badge: 'Spiritual Center',
        },
        {
          name: 'Attari-Wagah Border Beating Retreat',
          description:
            'Electrifying daily military parade with coordinated high-kicks, rapid marches, and lowering of national flags by BSF and Pakistan Rangers.',
          image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
          badge: 'Patriotic Spectacle',
        },
        {
          name: 'Jallianwala Bagh & Partition Museum',
          description:
            'Historic memorial site preserving the martyr’s well and bullet marks from 1919, alongside India’s premier Partition Museum at Town Hall.',
          image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
          badge: 'Historic Memorial',
        },
      ],
      thingsToDo: [
        'Partake in the sacred Palki Sahib night procession and Amrit Vela early morning prayers at the Golden Temple',
        'Witness the grand Beating Retreat at Wagah Border (VIP enclosure seating guidance)',
        'Taste world-famous Amritsari Kulcha with Chana & sweet lassi at Lawrence Road',
        'Watch the multimedia light & sound show at historic Gobindgarh Fort',
      ],
      localCuisine: [
        { dish: 'Amritsari Chur-Chur Kulcha', description: 'Crispy layered flatbread stuffed with spiced potatoes and onions, served with tangy chole and imli pyaz chutney.' },
        { dish: 'Guru Ka Langar & Karah Prasad', description: 'Divine whole-wheat flour halwa cooked in pure desi ghee and wholesome dal-roti langar.' },
        { dish: 'Amritsari Machhi (Fish)', description: 'Crisp carom-seed spiced batter fried river fish.' },
        { dish: 'Gian Di Lassi & Jalebi', description: 'Thick creamy malai lassi and hot saffron jalebis fried in pure ghee.' },
      ],
      travelTips: [
        'Head covering (scarf/rumal) is mandatory inside the Golden Temple complex. Shoes must be deposited at the free token counters.',
        'Wagah Border gates open around 3:30 PM; reach by 3:00 PM for premium stadium seats.',
      ],
      faqs: [
        {
          question: 'Can we combine Amritsar with Himachal or Kashmir?',
          answer:
            'Yes! Amritsar is the most popular launching pad for Dharamshala (4.5 hrs drive), Dalhousie (4.5 hrs), and Katra/Jammu (4.5 hrs). We offer seamless combined packages.',
        },
      ],
    },
  },
  ladakh: {
    id: 'ladakh',
    slug: 'ladakh',
    name: 'Ladakh',
    displayName: 'LADAKH & LEH',
    state: 'Ladakh (UT)',
    tagline: 'Land of High Passes: Color-changing Pangong Lake, double-humped camels of Nubra & Khardung La',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Ladakh guide',
    weatherInfo: '5°C - 20°C (Dry & High Altitude)',
    bestSeason: 'May to September (Roads open & pleasant)',
    startingPrice: 22999,
    popularCities: ['Leh', 'Nubra Valley', 'Pangong Tso', 'Khardung La', 'Tso Moriri', 'Diskit'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'adventure', label: 'Adventure & Biking', iconName: 'Sparkles' },
      { id: 'family', label: 'Family & Camps', iconName: 'Hotel' },
      { id: 'monastery', label: 'Monasteries & Culture', iconName: 'Heart' },
    ],
    guide: {
      overview:
        'A magical high-altitude desert framed by barren moonscapes, ancient Tibetan gompas, turquoise glacial lakes, and the world’s highest motorable passes.',
      bestTimeToVisit: 'May to September when all mountain passes are clear and temperatures are comfortable.',
      idealDuration: '6 to 8 Days',
      nearestAirport: 'Kushok Bakula Rimpochee Airport Leh (IXL)',
      nearestRailway: 'Jammu Tawi (JAT) / Chandigarh',
      topAttractions: [
        {
          name: 'Pangong Tso Glacial Lake',
          description: 'A 134-KM lake situated at 14,270 ft that changes shades from azure to turquoise under the clear Himalayan sky.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'High Altitude',
        },
        {
          name: 'Nubra Valley & Hunder Sand Dunes',
          description: 'Desert valley known for double-humped Bactrian camel safaris and the 106-foot Maitreya Buddha at Diskit.',
          image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
          badge: 'Camel Safari',
        },
      ],
      thingsToDo: [
        'Drive through Khardung La Pass (17,582 ft)',
        'Camp in luxury Swiss tents beside Pangong Lake',
        'Experience optical illusion at Magnetic Hill',
        'Stargaze under pollution-free cosmic skies',
      ],
      localCuisine: [
        { dish: 'Ladakhi Thukpa & Momos', description: 'Hearty steaming noodle soup and freshly steamed vegetable/meat dumplings.' },
        { dish: 'Butter Tea (Gur Gur)', description: 'Traditional salty tea churned with yak butter.' },
      ],
      travelTips: [
        'First 24 hours of arrival in Leh must be dedicated to complete rest for high altitude acclimatization.',
        'Bhakti Sathi provides onboard portable oxygen cylinders in all our Ladakh vehicles.',
      ],
      faqs: [
        {
          question: 'Do we need Inner Line Permits for Pangong & Nubra?',
          answer: 'Yes, Bhakti Sathi manages all Ladakh Inner Line Permits and environmental green fees seamlessly.',
        },
      ],
    },
  },
  himachal_devi: {
    id: 'himachal_devi',
    slug: 'himachal_devi',
    name: 'Himachal Devi Darshan',
    displayName: 'HIMACHAL 5 DEVI DARSHAN',
    state: 'Himachal Pradesh',
    tagline: 'Auspicious Shaktipeeth tour: Mata Mansa Devi, Mata Naina Devi, Mata Chintpurni, Mata Jwala Ji & Mata Chamunda Devi',
    heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Himachal Devi Darshan Guide',
    weatherInfo: '10°C - 28°C (Pleasant Hill Weather)',
    bestSeason: 'Year-Round (Navratri Special Festivals in March-April & October)',
    startingPrice: 12999,
    popularCities: ['Kangra', 'Jwala Mukhi', 'Chintpurni', 'Chamunda', 'Dharamshala', 'Bilaspur'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'pilgrimage', label: '5 Devi Darshan', iconName: 'Sparkles' },
      { id: 'family', label: 'Family Stays', iconName: 'Users' },
      { id: 'senior', label: 'Senior Friendly', iconName: 'HeartHandshake' },
    ],
    guide: {
      overview:
        'The auspicious Shaktipeeth yatra covering the sacred abodes in the foothills of Himachal Pradesh, featuring the self-manifested eternal flame of Jwala Ji and revered Shakti shrines.',
      bestTimeToVisit: 'Year-round, with peak festive enthusiasm during Chaitra and Sharad Navratri festivals.',
      idealDuration: '5 to 7 Days',
      nearestAirport: 'Kangra Gaggal Airport (DHM) / Chandigarh (IXC)',
      nearestRailway: 'Pathankot Junction (PTK) / Chandigarh (CDG)',
      topAttractions: [
        {
          name: 'Mata Jwala Ji Temple',
          description: 'Sacred Shaktipeeth where natural blue eternal flames burn without any known fuel source.',
          image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
          badge: 'Akhand Jyoti',
        },
        {
          name: 'Mata Kangra Brajeshwari Devi',
          description: 'Ancient 1000-year-old temple sanctum located in the historic town of Kangra.',
          image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
          badge: 'Shaktipeeth',
        },
      ],
      thingsToDo: [
        'Seek blessings of the natural eternal flames at Mata Jwala Ji',
        'Ropeway ride to Mata Naina Devi overlooking Govind Sagar Lake',
        'Experience peaceful riverside meditation at Mata Chamunda Devi on Baner River',
      ],
      localCuisine: [
        { dish: 'Himachali Dham & Traditional Local Cuisine', description: 'Traditional Kangri Madra, Sepu Badi, and mountain dishes cooked with fresh local spices.' },
      ],
      travelTips: [
        'Bhakti Sathi provides dedicated private vehicle transfers and priority temple entry coordination for families and senior citizens.',
      ],
      faqs: [
        {
          question: 'Can this tour be completed comfortably by elderly family members?',
          answer: 'Yes, all 5 temples have gentle access paths, battery carts/ropeway facilities where needed, and our private drivers ensure flexible pacing.',
        },
      ],
    },
  },
  rajasthan: {
    id: 'rajasthan',
    slug: 'rajasthan',
    name: 'Rajasthan',
    displayName: 'ROYAL RAJASTHAN',
    state: 'Rajasthan',
    tagline: 'Land of Kings: Amber Fort of Jaipur, Blue City of Jodhpur, desert dunes of Jaisalmer & Lake Pichola Udaipur',
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Rajasthan guide',
    weatherInfo: '20°C - 32°C (Pleasant Winters)',
    bestSeason: 'October to March (Royal Festive Season)',
    startingPrice: 15999,
    popularCities: ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 'Mount Abu'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'heritage', label: 'Heritage & Palaces', iconName: 'Hotel' },
      { id: 'desert', label: 'Desert & Camels', iconName: 'Sparkles' },
      { id: 'honeymoon', label: 'Romantic Udaipur', iconName: 'Heart' },
      { id: 'family', label: 'Family Vacation', iconName: 'Users' },
    ],
    guide: {
      overview:
        'Step into the era of royalty with majestic hill forts, mirror-work palaces, vibrant cultural folk music, and romantic boat rides on shimmering lakes.',
      bestTimeToVisit: 'October to March for comfortable palace tours and desert safaris.',
      idealDuration: '5 to 8 Days',
      nearestAirport: 'Jaipur (JAI), Udaipur (UDR), Jodhpur (JDH)',
      nearestRailway: 'Jaipur Junction & Jodhpur Junction',
      topAttractions: [
        {
          name: 'Amber Palace & Hawa Mahal, Jaipur',
          description: 'Intricate marble courtyards, Sheesh Mahal mirror palace, and iconic 953-window facade.',
          image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
          badge: 'Iconic Palace',
        },
        {
          name: 'Sam Sand Dunes, Jaisalmer',
          description: 'Sunset camel safaris, quad biking, and Rajasthani folk dances around desert bonfires.',
          image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
          badge: 'Desert Camping',
        },
      ],
      thingsToDo: [
        'Boat cruise on Lake Pichola with views of Taj Lake Palace',
        'Zipline (Flying Fox) across Mehrangarh Fort battlements in Jodhpur',
        'Relish authentic Dal Baati Churma and Ker Sangri at Chokhi Dhani',
      ],
      localCuisine: [
        { dish: 'Dal Baati Churma', description: 'Hard wheat rolls baked over cow dung/ghee, crushed in sweet churma and served with spicy lentil curry.' },
        { dish: 'Laal Maas', description: 'Fiery royal mutton curry cooked with Mathania red chillies.' },
      ],
      travelTips: ['Book heritage stays early during winter months (Nov - Feb).'],
      faqs: [{ question: 'Can we customize Jaipur with Udaipur and Jaisalmer?', answer: 'Yes, we provide flexible private chauffeur itineraries across all royal routes.' }],
    },
  },
  kerala: {
    id: 'kerala',
    slug: 'kerala',
    name: 'Kerala',
    displayName: 'KERALA',
    state: 'Kerala',
    tagline: 'God’s Own Country: Rolling tea valleys of Munnar, Periyar wildlife & private backwater houseboats',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Kerala guide',
    weatherInfo: '22°C - 30°C (Tropical & Refreshing)',
    bestSeason: 'September to March (Pleasant) & June-Aug (Monsoon Ayurveda)',
    startingPrice: 12999,
    popularCities: ['Munnar', 'Thekkady', 'Alleppey', 'Kochi', 'Kovalam', 'Wayanad'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'honeymoon', label: 'Honeymoon Special', iconName: 'Heart' },
      { id: 'houseboat', label: 'Private Houseboat', iconName: 'Hotel' },
      { id: 'nature', label: 'Tea & Waterfalls', iconName: 'Sparkles' },
      { id: 'family', label: 'Family Holiday', iconName: 'Users' },
    ],
    guide: {
      overview:
        'A tropical paradise of emerald tea plantations in Munnar, aromatic spice hills of Thekkady, and languid palm-fringed backwaters of Alleppey.',
      bestTimeToVisit: 'September to March for sightseeing and houseboat cruising; June to August for world-famous Ayurvedic monsoon treatments.',
      idealDuration: '4 to 7 Days',
      nearestAirport: 'Cochin International Airport (COK) / Trivandrum (TRV)',
      nearestRailway: 'Ernakulam Junction (ERS) & Aluva',
      topAttractions: [
        {
          name: 'Alleppey Private Houseboat Cruise',
          description: 'Traditional thatched roof Kettuvallam cruising through Vembanad Lake canals with personal chef.',
          image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
          badge: 'World Famous',
        },
      ],
      thingsToDo: [
        'Watch wild elephants during Periyar Lake boat safari',
        'Savor fresh Karimeen fish fried on banana leaf inside your houseboat',
        'Witness Kalaripayattu martial arts and Kathakali cultural shows',
      ],
      localCuisine: [
        { dish: 'Appam with Stew', description: 'Lacy fermented rice pancakes served with creamy coconut milk vegetable or chicken stew.' },
        { dish: 'Kerala Sadhya', description: 'Grand 24-dish vegetarian feast served on fresh banana leaf.' },
      ],
      travelTips: ['Houseboat AC operates 9:00 PM to 6:00 AM in Deluxe category and 24/7 in Luxury glasshouseboats.'],
      faqs: [{ question: 'Are all meals included on the houseboat?', answer: 'Yes! Houseboat stays include freshly cooked lunch, hi-tea, dinner, and breakfast.' }],
    },
  },
  goa: {
    id: 'goa',
    slug: 'goa',
    name: 'Goa',
    displayName: 'GOA',
    state: 'Goa',
    tagline: 'Sun, sand & spice: Golden beaches, Portuguese heritage churches, water sports & river cruises',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Goa guide',
    weatherInfo: '24°C - 32°C (Coastal Breeze)',
    bestSeason: 'October to April (Beach & Party Season)',
    startingPrice: 8999,
    popularCities: ['Calangute', 'Baga', 'Candolim', 'Panaji', 'Old Goa', 'Dudhsagar Waterfalls', 'Palolem'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'beach', label: 'Beaches & Shacks', iconName: 'Sparkles' },
      { id: 'honeymoon', label: 'Honeymoon & Luxury', iconName: 'Heart' },
      { id: 'family', label: 'Family & Heritage', iconName: 'Users' },
      { id: 'adventure', label: 'Water Sports & Cruises', iconName: 'Hotel' },
    ],
    guide: {
      overview:
        'India’s sunshine state blending Portuguese architectural charm, tranquil South Goa beaches, energetic North Goa beach clubs, and serene spice plantations.',
      bestTimeToVisit: 'October to April for pleasant beach weather and water sports.',
      idealDuration: '3 to 5 Days',
      nearestAirport: 'Goa International Airport Dabolim (GOI) / Manohar International Airport Mopa (GOX)',
      nearestRailway: 'Madgaon (MAO) & Thivim (THVM)',
      topAttractions: [
        {
          name: 'Dudhsagar Waterfalls & Spice Plantation',
          description: 'Four-tiered sea of milk waterfall deep inside the Western Ghats reachable by 4x4 open jungle jeep safari.',
          image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
          badge: 'Jungle Safari',
        },
      ],
      thingsToDo: [
        'Water sports at Calangute/Baga (parasailing, jet-ski, banana ride)',
        'Mandovi river sunset cruise with Goan folk performances',
        'Explore UNESCO heritage Basilica of Bom Jesus in Old Goa',
      ],
      localCuisine: [
        { dish: 'Goan Fish Curry Rice', description: 'Kingfish cooked in aromatic coconut, kokum, and Kashmiri red chillies.' },
        { dish: 'Bebinca', description: 'Traditional multi-layered Goan coconut milk pudding.' },
      ],
      travelTips: ['Rent sanitized private self-drive or chauffeur cars through Bhakti Sathi for effortless sightseeing.'],
      faqs: [{ question: 'Which is better: North Goa or South Goa?', answer: 'North Goa is famous for vibrant markets, water sports, and beach shacks. South Goa is known for serene luxury resorts and uncrowded white sand beaches.' }],
    },
  },
  thailand: {
    id: 'thailand',
    slug: 'thailand',
    name: 'Thailand',
    displayName: 'THAILAND',
    state: 'International',
    tagline: 'Tropical paradise: Bangkok temples, vibrant Pattaya coral islands & Phuket luxury beach villas',
    heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Thailand Holiday Guide',
    weatherInfo: '26°C - 32°C (Warm & Tropical)',
    bestSeason: 'November to April (Pleasant & Dry)',
    startingPrice: 24999,
    popularCities: ['Bangkok', 'Phuket', 'Pattaya', 'Krabi', 'Phi Phi Islands', 'Chiang Mai'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family Holiday', iconName: 'Users' },
      { id: 'honeymoon', label: 'Honeymoon Romantic', iconName: 'Heart' },
      { id: 'pilgrimage', label: 'Temples & Culture', iconName: 'Sparkles' },
    ],
    guide: {
      overview: 'Experience the Land of Smiles with glittering Buddhist golden temples, pristine Andaman coral islands, world-class nightlife, and indulgent Thai massages with private speedboat and chauffeur transfers.',
      bestTimeToVisit: 'November to April is prime tourist season with sunny skies and calm seas.',
      idealDuration: '5 to 8 Days',
      nearestAirport: 'Suvarnabhumi Airport Bangkok (BKK) / Phuket Airport (HKT)',
      nearestRailway: 'Bangkok Grand Central',
      topAttractions: [
        { name: 'Phi Phi Islands & Maya Bay', description: 'Emerald turquoise lagoons surrounded by towering limestone cliffs, featured in Hollywood movies.', image: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=80', badge: 'World Famous' },
        { name: 'Wat Arun & Grand Palace', description: 'Opulent royal complex and riverside temple of dawn shimmering with porcelain mosaics.', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80', badge: 'Cultural Icon' },
        { name: 'Coral Island Pattaya', description: 'Parasailing, underwater sea walking, and snorkeling in pristine crystal waters.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', badge: 'Water Sports' },
      ],
      thingsToDo: ['Chao Phraya Luxury Princess Dinner Cruise', 'Speedboat Island Hopping', 'Elephant Sanctuary Visit', 'Safari World & Marine Park'],
      localCuisine: [
        { dish: 'Pad Thai', description: 'Stir-fried rice noodles with tamarind, crushed peanuts, bean sprouts, and lime.' },
        { dish: 'Tom Yum Goong', description: 'Aromatic spicy and sour lemongrass shrimp soup.' },
        { dish: 'Mango Sticky Rice', description: 'Sweet sticky rice soaked in coconut milk served with ripe Thai honey mangoes.' },
      ],
      travelTips: ['Visa on Arrival is free for Indian passport holders.', 'Dress respectfully with covered shoulders and knees when visiting royal temples.'],
      faqs: [{ question: 'Do Indian passport holders need a visa for Thailand?', answer: 'Thailand offers visa exemption / free visa-on-arrival for Indian tourists for up to 30 days.' }],
    },
  },
  vietnam: {
    id: 'vietnam',
    slug: 'vietnam',
    name: 'Vietnam',
    displayName: 'VIETNAM',
    state: 'International',
    tagline: 'Emerald waters of Ha Long Bay, lantern-lit streets of Hoi An & Golden Bridge in Ba Na Hills',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Vietnam Explorer Guide',
    weatherInfo: '20°C - 30°C (Pleasant)',
    bestSeason: 'October to April',
    startingPrice: 28999,
    popularCities: ['Hanoi', 'Da Nang', 'Ha Long Bay', 'Hoi An', 'Ho Chi Minh City'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family Vacation', iconName: 'Users' },
      { id: 'honeymoon', label: 'Honeymoon Special', iconName: 'Heart' },
      { id: 'pilgrimage', label: 'Heritage & Pagodas', iconName: 'Sparkles' },
    ],
    guide: {
      overview: 'Discover the breathtaking emerald karst pillars of Ha Long Bay, giant stone hands holding the Golden Bridge in Da Nang, and the ancient French colonial quarters of Hanoi with luxury 5-star cruises and chauffeur service.',
      bestTimeToVisit: 'Spring (March to April) and Autumn (September to November) offer idyllic weather across north and south.',
      idealDuration: '6 to 9 Days',
      nearestAirport: 'Noi Bai International Airport Hanoi (HAN) / Da Nang Airport (DAD)',
      nearestRailway: 'Hanoi Train Station',
      topAttractions: [
        { name: 'Ha Long Bay Luxury Cruise', description: 'UNESCO World Heritage bay filled with thousands of limestone karst islets and mystical caves.', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', badge: 'UNESCO Wonder' },
        { name: 'Golden Hand Bridge (Ba Na Hills)', description: 'Spectacular footbridge held aloft by two massive stone hands in the mountain clouds.', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80', badge: 'Viral Icon' },
        { name: 'Hoi An Ancient Lantern Town', description: 'Enchanting riverside town lit by thousands of colorful handcrafted silk lanterns.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', badge: 'Heritage Gem' },
      ],
      thingsToDo: ['Ha Long Bay Overnight 5-Star Cruise', 'Ba Na Hills Sun World Cable Car', 'Hoi An Basket Boat Coconut Forest Ride', 'Hanoi Street Food & Egg Coffee Tour'],
      localCuisine: [
        { dish: 'Pho Bo', description: 'Fragrant Vietnamese beef noodle broth with fresh mint, basil, and chili.' },
        { dish: 'Banh Mi', description: 'Crisp French-style baguette filled with savory meats, paté, pickled daikon, and cilantro.' },
        { dish: 'Egg Coffee (Ca Phe Trung)', description: 'Rich Vietnamese robusta coffee topped with creamy whisked egg yolk foam.' },
      ],
      travelTips: ['Easy eVisa online processing takes only 3 business days.', 'Use Grab app for seamless and transparent city taxi rides.'],
      faqs: [{ question: 'How is the visa process for Vietnam?', answer: 'Vietnam provides online e-Visa for 30/90 days for travelers with quick approval within 3 working days.' }],
    },
  },
  indonesia: {
    id: 'indonesia',
    slug: 'indonesia',
    name: 'Indonesia',
    displayName: 'INDONESIA (BALI)',
    state: 'International',
    tagline: 'Island of the Gods: Ubud jungle swings, clifftop Uluwatu sunsets & Nusa Penida crystal lagoons',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Bali Indonesia Vacation Guide',
    weatherInfo: '27°C - 31°C (Tropical Island)',
    bestSeason: 'April to October (Dry & Breezy)',
    startingPrice: 32999,
    popularCities: ['Bali', 'Ubud', 'Kuta', 'Seminyak', 'Nusa Dua', 'Nusa Penida', 'Gili Islands'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'honeymoon', label: 'Honeymoon Private Pool Villa', iconName: 'Heart' },
      { id: 'family', label: 'Family Island Explorer', iconName: 'Users' },
      { id: 'pilgrimage', label: 'Sacred Temples & Water Blessings', iconName: 'Sparkles' },
    ],
    guide: {
      overview: 'Immerse in tropical bliss in Bali, Indonesia. From iconic private pool villas in Seminyak, emerald Tegalalang rice terraces, sacred Tirta Empul water purification, to dramatic clifftop Kecak fire dance at Uluwatu Temple overlooking the Indian Ocean.',
      bestTimeToVisit: 'April through October provides crisp sunny days and gentle sea breezes.',
      idealDuration: '6 to 8 Days',
      nearestAirport: 'Ngurah Rai International Airport Denpasar Bali (DPS)',
      nearestRailway: 'N/A (Private Chauffeur Tour)',
      topAttractions: [
        { name: 'Uluwatu Sunset Temple & Kecak Dance', description: 'Ancient sea temple perched atop a 70m cliff with hypnotic fire dance performance.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', badge: 'Must Experience' },
        { name: 'Nusa Penida (Kelingking Beach)', description: 'T-Rex shaped limestone cliff plunging into radiant turquoise waters.', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80', badge: 'World Wonder' },
        { name: 'Tegalalang Rice Terraces & Jungle Swing', description: 'Dramatic emerald green tiered paddies with high-flying jungle swings.', image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80', badge: 'Iconic Bali' },
      ],
      thingsToDo: ['Private Pool Villa Floating Breakfast', 'Nusa Penida Speedboat Day Tour', 'Tirta Empul Holy Spring Cleansing', 'Ayung River White Water Rafting'],
      localCuisine: [
        { dish: 'Nasi Goreng', description: 'Fragrant Indonesian fried rice with sweet soy, satay skewers, and crispy fried shallots.' },
        { dish: 'Ayam Betutu', description: 'Slow-cooked Balinese chicken infused with rich 16-spice paste and banana leaf wrap.' },
        { dish: 'Babi Guling / Balinese Satay', description: 'Crispy roast suckling pork and minced coconut chicken satay.' },
      ],
      travelTips: ['Visa on Arrival (VoA) is granted instantly at Bali Airport for 500,000 IDR (approx ₹2,700).', 'Dress in a traditional sarong and sash when entering sacred Hindu temples.'],
      faqs: [{ question: 'Is Bali suitable for vegetarians and Indian food?', answer: 'Yes! Bali has hundreds of excellent Indian restaurants (both North and South Indian dining options) across Kuta, Seminyak, Ubud, and Nusa Dua.' }],
    },
  },
  andaman: {
    id: 'andaman',
    slug: 'andaman',
    name: 'Andaman',
    displayName: 'ANDAMAN',
    state: 'Union Territory',
    tagline: 'Crystal turquoise waters of Havelock, Radhanagar beach & historic Cellular Jail',
    heroImage: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Andaman Islands Holiday Guide',
    weatherInfo: '24°C - 30°C (Tropical Breezy)',
    bestSeason: 'October to May (Best for Scuba & Water Sports)',
    startingPrice: 19999,
    popularCities: ['Port Blair', 'Havelock Island (Swaraj Dweep)', 'Neil Island (Shaheed Dweep)', 'Baratang Island'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'beach', label: 'Beaches & Coral', iconName: 'Sparkles' },
      { id: 'honeymoon', label: 'Honeymoon Special', iconName: 'Heart' },
      { id: 'family', label: 'Family Vacation', iconName: 'Users' },
    ],
    guide: {
      overview: 'White powdery sand beaches, Asia’s finest Radhanagar Beach, vibrant underwater coral reefs, scuba diving, and Cellular Jail Light & Sound show.',
      bestTimeToVisit: 'October to May with calm turquoise waters.',
      idealDuration: '5 to 7 Days',
      nearestAirport: 'Veer Savarkar International Airport Port Blair (IXZ)',
      nearestRailway: 'N/A (Flight to Port Blair)',
      topAttractions: [
        { name: 'Radhanagar Beach (Havelock)', description: 'Ranked among Asia’s best beaches with crystal clear blue water and powdery white sand.', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80', badge: 'Asia’s Best Beach' },
        { name: 'Cellular Jail & Light Show', description: 'Historic national memorial showcasing India’s freedom struggle.', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80', badge: 'Historic Gem' },
      ],
      thingsToDo: ['Scuba Diving & Sea Walk at Elephant Beach', 'Private Catamaran Cruise to Havelock & Neil', 'Baratang Island Mangrove Boat Ride & Limestone Caves'],
      localCuisine: [{ dish: 'Fresh Andaman Seafood', description: 'Grilled red snapper and butter garlic prawns.' }],
      travelTips: ['Book private luxury ferries (Makruzz / Nautika) in advance.'],
      faqs: [{ question: 'Do Indians need a passport for Andaman?', answer: 'No passport or visa is required for Indian citizens visiting Andaman & Nicobar Islands. Valid photo ID (Aadhaar / Voter ID / Driving License) is sufficient.' }],
    },
  },
  singapore: {
    id: 'singapore',
    slug: 'singapore',
    name: 'Singapore',
    displayName: 'SINGAPORE',
    state: 'International',
    tagline: 'Futuristic Gardens by the Bay, Marina Bay Sands SkyPark & Sentosa Island thrill',
    heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Singapore City Guide',
    weatherInfo: '26°C - 32°C (Tropical)',
    bestSeason: 'Year-Round (Best Nov to June)',
    startingPrice: 38999,
    popularCities: ['Marina Bay', 'Sentosa Island', 'Orchard Road', 'Chinatown', 'Little India'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family Fun & Universal', iconName: 'Users' },
      { id: 'luxury', label: 'Luxury & SkyPark', iconName: 'Heart' },
    ],
    guide: {
      overview: 'The Lion City blends futuristic skylines, Supertree Grove light shows, Universal Studios thrill rides, and Michelin-starred dining.',
      bestTimeToVisit: 'Year-round destination with pleasant tropical vibes.',
      idealDuration: '4 to 6 Days',
      nearestAirport: 'Changi Airport Singapore (SIN)',
      nearestRailway: 'Singapore MRT',
      topAttractions: [
        { name: 'Gardens by the Bay & Supertrees', description: 'Futuristic botanical wonderland with giant biodomes and evening light & sound spectacle.', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80', badge: 'Futuristic Marvel' },
        { name: 'Universal Studios Sentosa', description: 'World-class theme park with blockbuster rollercoasters and family attractions.', image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80', badge: 'Top Family Spot' },
      ],
      thingsToDo: ['Marina Bay Sands Infinity Observation Deck', 'Singapore Night Safari Tram', 'Cable Car Ride to Sentosa Island'],
      localCuisine: [{ dish: 'Hainanese Chicken Rice & Chili Crab', description: 'National delicacies with savory chili sauces.' }],
      travelTips: ['Indian tourists can obtain Singapore tourist visa within 3-4 working days.'],
      faqs: [{ question: 'Is Singapore kid-friendly?', answer: 'Yes, Singapore is rated among the world’s best family destinations with Universal Studios, Night Safari, and interactive science centers.' }],
    },
  },
  dubai: {
    id: 'dubai',
    slug: 'dubai',
    name: 'Dubai',
    displayName: 'DUBAI',
    state: 'International',
    tagline: 'Burj Khalifa 124th Floor, golden desert dune bashing & luxury Marina yacht cruises',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Dubai Luxury Holiday Guide',
    weatherInfo: '22°C - 33°C (Sunny & Pleasant in Winter)',
    bestSeason: 'October to April (Peak Dubai Season)',
    startingPrice: 34999,
    popularCities: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Old Deira Gold Souk'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'luxury', label: 'Luxury & Sky', iconName: 'Heart' },
      { id: 'family', label: 'Family & Theme Parks', iconName: 'Users' },
    ],
    guide: {
      overview: 'City of Gold and superlatives: Stand on the world’s tallest tower, cruise on a luxury yacht along Dubai Marina, and enjoy 4x4 desert safaris with BBQ dinner and belly dance.',
      bestTimeToVisit: 'November to March for sublime outdoor weather and Dubai Shopping Festival.',
      idealDuration: '5 to 7 Days',
      nearestAirport: 'Dubai International Airport (DXB)',
      nearestRailway: 'Dubai Metro',
      topAttractions: [
        { name: 'Burj Khalifa & Dubai Mall Fountain', description: 'Ascend to the 124th/125th floor observation deck overlooking the illuminated city skyline.', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', badge: 'World’s Tallest' },
        { name: 'Red Dune Desert Safari & Camp', description: 'Thrilling 4x4 dune bashing, sandboarding, camel rides, and Tanoura dance show.', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', badge: 'Must Do' },
      ],
      thingsToDo: ['Dubai Marina Luxury Dhow Dinner Cruise', 'Museum of the Future Interactive Tour', 'Atlantis Aquaventure Waterpark on Palm Jumeirah'],
      localCuisine: [{ dish: 'Shawarma & Arabic Mezze Platter', description: 'Freshly grilled meats with hummus, falafel, and tabbouleh.' }],
      travelTips: ['Bhakti Sathi processes 30-day Dubai tourist eVisa within 48-72 hours.'],
      faqs: [{ question: 'How long does Dubai visa take for Indians?', answer: 'Normal Dubai e-Visa is issued in 2-3 working days with only passport copy and photo.' }],
    },
  },
  malaysia: {
    id: 'malaysia',
    slug: 'malaysia',
    name: 'Malaysia',
    displayName: 'MALAYSIA',
    state: 'International',
    tagline: 'Petronas Twin Towers, colorful Batu Caves & Genting Highlands cable car',
    heroImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Malaysia Explorer Guide',
    weatherInfo: '25°C - 32°C (Warm & Tropical)',
    bestSeason: 'Year-Round (Best Nov to May)',
    startingPrice: 26999,
    popularCities: ['Kuala Lumpur', 'Genting Highlands', 'Batu Caves', 'Langkawi', 'Penang'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family Vacation', iconName: 'Users' },
      { id: 'honeymoon', label: 'Langkawi Honeymoon', iconName: 'Heart' },
    ],
    guide: {
      overview: 'Truly Asia experience: Iconic Petronas Twin Towers, the rainbow 272 steps of Batu Caves, mountain breeze of Genting Highlands, and duty-free island beaches of Langkawi.',
      bestTimeToVisit: 'Year-round with great tropical weather.',
      idealDuration: '4 to 6 Days',
      nearestAirport: 'Kuala Lumpur International Airport (KUL)',
      nearestRailway: 'KL Sentral',
      topAttractions: [
        { name: 'Batu Caves & Lord Murugan Statue', description: 'Monumental golden deity and limestone cave temple with vibrant rainbow steps.', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80', badge: 'Cultural Wonder' },
      ],
      thingsToDo: ['Petronas Skybridge View', 'Genting SkyWorlds Theme Park & Cable Car', 'Langkawi Island Hopping & Eagle Square'],
      localCuisine: [{ dish: 'Nasi Lemak & Roti Canai', description: 'Coconut rice with sambal and crispy flaky flatbreads.' }],
      travelTips: ['Visa-free entry for Indian passport holders.'],
      faqs: [{ question: 'Is Malaysia visa free for Indians?', answer: 'Yes! Indian passport holders enjoy 30-day visa exemption for Malaysia.' }],
    },
  },
  northeast: {
    id: 'northeast',
    slug: 'northeast',
    name: 'Northeast & Meghalaya',
    displayName: 'NORTHEAST',
    state: 'Meghalaya & Assam',
    tagline: 'Crystal waters of Dawki, living root bridges of Cherrapunji & Kaziranga rhinos',
    heroImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Northeast India Adventure Guide',
    weatherInfo: '15°C - 24°C (Misty Hills)',
    bestSeason: 'October to May',
    startingPrice: 18999,
    popularCities: ['Shillong', 'Cherrapunji', 'Dawki', 'Mawlynnong', 'Kaziranga', 'Guwahati'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'nature', label: 'Waterfalls & Caves', iconName: 'Sparkles' },
      { id: 'family', label: 'Family Explorer', iconName: 'Users' },
    ],
    guide: {
      overview: 'Explore the Scotland of the East: Transparent Umngot river in Dawki, double-decker living root bridges, majestic Nohkalikai Falls, and one-horned rhino safari in Kaziranga.',
      bestTimeToVisit: 'October to May for clear skies and crystal river boating.',
      idealDuration: '5 to 7 Days',
      nearestAirport: 'Guwahati Airport (GAU) / Shillong Airport (SHL)',
      nearestRailway: 'Guwahati Railway Station (GHY)',
      topAttractions: [
        { name: 'Dawki Crystal River Boating', description: 'Boats appear to float on air over glass-like turquoise waters on the Indo-Bangla border.', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80', badge: 'Glass Water' },
      ],
      thingsToDo: ['Cherrapunji Waterfalls Tour', 'Mawlynnong Cleanest Village Walk', 'Kaziranga Elephant Jeep Safari'],
      localCuisine: [{ dish: 'Assamese Thali & Kholasapori Pitha', description: 'Steamed rice, bamboo shoot curry, and fresh herbs.' }],
      travelTips: ['Carry light jackets even in summer months in Shillong.'],
      faqs: [{ question: 'Best time for Dawki boat ride?', answer: 'November to April when the river is glass clear and transparent.' }],
    },
  },
  srilanka: {
    id: 'srilanka',
    slug: 'srilanka',
    name: 'Sri Lanka',
    displayName: 'SRI LANKA',
    state: 'International',
    tagline: 'Scenic Ella mountain train, Sigiriya rock fortress, Bentota beach & tea estates',
    heroImage: 'https://images.unsplash.com/photo-1588258524675-c619196b010c?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Sri Lanka Island Holiday Guide',
    weatherInfo: '24°C - 30°C (Tropical)',
    bestSeason: 'November to April',
    startingPrice: 23999,
    popularCities: ['Colombo', 'Kandy', 'Bentota', 'Nuwara Eliya', 'Ella', 'Sigiriya'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family Island Tour', iconName: 'Users' },
      { id: 'honeymoon', label: 'Honeymoon Hills', iconName: 'Heart' },
    ],
    guide: {
      overview: 'Pearl of the Indian Ocean: World-famous scenic blue train ride through Ella tea plantations, ancient Sigiriya Rock, Temple of the Sacred Tooth Relic, and golden beach resorts.',
      bestTimeToVisit: 'December to April for sunny beach weather.',
      idealDuration: '5 to 7 Days',
      nearestAirport: 'Bandaranaike International Airport Colombo (CMB)',
      nearestRailway: 'Colombo Fort Station',
      topAttractions: [
        { name: 'Sigiriya Lion Rock Fortress', description: 'Ancient 5th-century palace fortress towering 200m above the jungle canopy.', image: 'https://images.unsplash.com/photo-1588258524675-c619196b010c?auto=format&fit=crop&w=800&q=80', badge: 'UNESCO Heritage' },
      ],
      thingsToDo: ['Kandy to Ella Blue Scenic Train', 'Madu River Boat Safari with Fish Spa', 'Pinnawala Elephant Orphanage Visit'],
      localCuisine: [{ dish: 'Sri Lankan Kottu Roti & Hoppers', description: 'Chopped flatbread stir-fry and bowl-shaped crispy rice flour pancakes.' }],
      travelTips: ['Indian tourists receive free tourist visa / ETA.'],
      faqs: [{ question: 'Is Sri Lanka visa free for Indians?', answer: 'Yes, Sri Lanka offers free ETA tourist visas for Indian travelers.' }],
    },
  },
};

export const POPULAR_DESTINATION_SLUGS = [
  'thailand',
  'kerala',
  'andaman',
  'indonesia',
  'singapore',
  'dubai',
  'vietnam',
  'malaysia',
  'himachal',
  'northeast',
  'kashmir',
  'jammu',
  'amritsar',
  'ladakh',
  'rajasthan',
  'goa',
  'himachal_devi',
  'srilanka',
];

export function getDestinationBySlug(slug?: string | null): DestinationMeta | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  if (DESTINATIONS_REGISTRY[clean]) return DESTINATIONS_REGISTRY[clean];

  // Fuzzy match
  const foundKey = Object.keys(DESTINATIONS_REGISTRY).find(
    (key) => clean.includes(key) || DESTINATIONS_REGISTRY[key].name.toLowerCase().includes(clean)
  );
  return foundKey ? DESTINATIONS_REGISTRY[foundKey] : undefined;
}

export function matchPackageToDestination(pkg: any, destSlug: string): boolean {
  if (!pkg || !destSlug) return false;
  const target = destSlug.toLowerCase().trim();
  
  if (pkg.destinationTag && pkg.destinationTag.toLowerCase().includes(target)) return true;
  if (pkg.country && pkg.country.toLowerCase().includes(target)) return true;

  const destStr = (pkg.destination || '').toLowerCase();
  const titleStr = (pkg.title || '').toLowerCase();
  const slugStr = (pkg.slug || '').toLowerCase();
  const locStr = (pkg.location || '').toLowerCase();

  switch (target) {
    case 'jammu':
      return (
        destStr.includes('jammu') ||
        destStr.includes('katra') ||
        destStr.includes('vaishno') ||
        destStr.includes('patnitop') ||
        destStr.includes('shivkhori') ||
        titleStr.includes('jammu') ||
        titleStr.includes('katra') ||
        titleStr.includes('vaishno') ||
        slugStr.includes('jammu') ||
        slugStr.includes('katra')
      );
    case 'kashmir':
      return (
        destStr.includes('kashmir') ||
        destStr.includes('srinagar') ||
        destStr.includes('gulmarg') ||
        destStr.includes('pahalgam') ||
        destStr.includes('sonmarg') ||
        destStr.includes('jammu') ||
        destStr.includes('katra') ||
        destStr.includes('vaishno') ||
        destStr.includes('patnitop') ||
        titleStr.includes('kashmir') ||
        titleStr.includes('srinagar') ||
        titleStr.includes('gulmarg') ||
        titleStr.includes('jammu') ||
        titleStr.includes('katra') ||
        titleStr.includes('vaishno')
      );
    case 'himachal':
      return (
        destStr.includes('himachal') ||
        destStr.includes('shimla') ||
        destStr.includes('manali') ||
        destStr.includes('dharamshala') ||
        destStr.includes('dalhousie') ||
        destStr.includes('spiti') ||
        destStr.includes('kullu') ||
        destStr.includes('solang') ||
        titleStr.includes('himachal') ||
        titleStr.includes('shimla') ||
        titleStr.includes('manali')
      );
    case 'amritsar':
      return (
        destStr.includes('amritsar') ||
        destStr.includes('punjab') ||
        destStr.includes('wagah') ||
        destStr.includes('golden temple') ||
        titleStr.includes('amritsar') ||
        titleStr.includes('golden temple')
      );
    case 'ladakh':
      return (
        destStr.includes('ladakh') ||
        destStr.includes('leh') ||
        destStr.includes('pangong') ||
        destStr.includes('nubra') ||
        titleStr.includes('ladakh') ||
        titleStr.includes('leh')
      );
    case 'himachal_devi':
      return (
        destStr.includes('devi darshan') ||
        destStr.includes('jwala') ||
        destStr.includes('kangra') ||
        destStr.includes('chintpurni') ||
        destStr.includes('chamunda') ||
        destStr.includes('naina devi') ||
        titleStr.includes('devi darshan') ||
        titleStr.includes('shaktipeeth')
      );
    case 'rajasthan':
      return (
        destStr.includes('rajasthan') ||
        destStr.includes('jaipur') ||
        destStr.includes('jodhpur') ||
        destStr.includes('udaipur') ||
        destStr.includes('jaisalmer') ||
        titleStr.includes('rajasthan') ||
        titleStr.includes('jaipur')
      );
    case 'kerala':
      return (
        destStr.includes('kerala') ||
        destStr.includes('munnar') ||
        destStr.includes('alleppey') ||
        destStr.includes('thekkady') ||
        destStr.includes('cochin') ||
        titleStr.includes('kerala') ||
        titleStr.includes('munnar')
      );
    case 'goa':
      return (
        destStr.includes('goa') ||
        titleStr.includes('goa') ||
        slugStr.includes('goa')
      );
    case 'thailand':
      return (
        destStr.includes('thailand') ||
        destStr.includes('bangkok') ||
        destStr.includes('phuket') ||
        destStr.includes('pattaya') ||
        destStr.includes('krabi') ||
        titleStr.includes('thailand') ||
        titleStr.includes('phuket') ||
        titleStr.includes('bangkok')
      );
    case 'vietnam':
      return (
        destStr.includes('vietnam') ||
        destStr.includes('hanoi') ||
        destStr.includes('da nang') ||
        destStr.includes('ha long') ||
        destStr.includes('hoi an') ||
        titleStr.includes('vietnam') ||
        titleStr.includes('ha long')
      );
    case 'indonesia':
    case 'bali':
      return (
        destStr.includes('indonesia') ||
        destStr.includes('bali') ||
        destStr.includes('ubud') ||
        destStr.includes('seminyak') ||
        destStr.includes('nusa penida') ||
        titleStr.includes('bali') ||
        titleStr.includes('indonesia')
      );
    case 'andaman':
      return (
        destStr.includes('andaman') ||
        destStr.includes('havelock') ||
        destStr.includes('port blair') ||
        destStr.includes('neil island') ||
        titleStr.includes('andaman') ||
        titleStr.includes('havelock')
      );
    case 'singapore':
      return (
        destStr.includes('singapore') ||
        destStr.includes('sentosa') ||
        destStr.includes('marina bay') ||
        titleStr.includes('singapore') ||
        titleStr.includes('sentosa')
      );
    case 'dubai':
      return (
        destStr.includes('dubai') ||
        destStr.includes('uae') ||
        destStr.includes('burj khalifa') ||
        titleStr.includes('dubai') ||
        titleStr.includes('abu dhabi')
      );
    case 'malaysia':
      return (
        destStr.includes('malaysia') ||
        destStr.includes('kuala lumpur') ||
        destStr.includes('genting') ||
        destStr.includes('langkawi') ||
        titleStr.includes('malaysia') ||
        titleStr.includes('kuala lumpur')
      );
    case 'northeast':
      return (
        destStr.includes('northeast') ||
        destStr.includes('meghalaya') ||
        destStr.includes('shillong') ||
        destStr.includes('cherrapunji') ||
        destStr.includes('dawki') ||
        destStr.includes('kaziranga') ||
        destStr.includes('assam') ||
        titleStr.includes('meghalaya') ||
        titleStr.includes('northeast')
      );
    case 'srilanka':
      return (
        destStr.includes('sri lanka') ||
        destStr.includes('srilanka') ||
        destStr.includes('colombo') ||
        destStr.includes('kandy') ||
        destStr.includes('bentota') ||
        titleStr.includes('sri lanka') ||
        titleStr.includes('srilanka')
      );
    default:
      return destStr.includes(target) || titleStr.includes(target) || slugStr.includes(target);
  }
}

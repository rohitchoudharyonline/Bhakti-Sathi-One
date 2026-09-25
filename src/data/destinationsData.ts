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
    heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
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
          image: 'https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=800&q=80',
          badge: 'Holy Cave Shrine',
          description:
            'Holistic cave sanctum nestled at 5,200 ft in Trikuta Hills where Maha Kali, Maha Lakshmi, and Maha Saraswati reside as self-manifested Pindies. Reachable by a paved 12 KM trek, electric eco-battery cars, ponies, palkis, or helicopter to Sanjichhat.',
        },
        {
          name: 'Shankaracharya Temple',
          image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
          badge: 'Ancient Shiva Sanctum',
          description:
            'Historic Shiva temple situated atop Gopadari Hill at 1,100 ft above Srinagar city level, blessed by Adi Shankaracharya in the 9th century and offering breathtaking 360-degree panoramas of Dal Lake and the Zabarwan mountain range.',
        },
        {
          name: 'Shiv Khori',
          image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80',
          badge: 'Limestone Cave',
          description:
            'A 200-meter-long natural limestone cave housing a 4-foot self-formed (Svayambhu) Shivling with continuous natural mineral water dripping from the ceiling. A sanctified pilgrimage just 75 km from Katra.',
        },
        {
          name: 'Bhairon Ghati',
          image: 'https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=800&q=80',
          badge: 'Aerial Ropeway Peak',
          description:
            'Perched at 6,600 ft above Bhawan, the completion of Mata Vaishno Devi darshan requires paying homage to Baba Bhaironath. Accessible within 3 minutes via the modern high-capacity aerial passenger ropeway.',
        },
        {
          name: 'Dal Lake & Houseboats',
          image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
          badge: 'Jewel of Srinagar',
          description:
            'The crown jewel of Srinagar featuring heritage hand-carved cedar wood houseboats, colorful flower Shikara rides, floating vegetable markets, and the historic four chinar island overlooking the Mughal gardens.',
        },
        {
          name: 'Gulmarg Gondola & Apharwat',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'World Highest Cable Car',
          description:
            'One of the worlds highest operating passenger cable cars, carrying travelers across dense pine forests to Phase 1 (Kongdoori) and Phase 2 (Apharwat Peak) for skiing, snowmobile adventures, and sweeping views of Nanga Parbat.',
        },
        {
          name: 'Pahalgam & Betaab Valley',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          badge: 'Valley of Shepherds',
          description:
            'A pristine mountain paradise on the banks of the rushing Lidder River, surrounded by cedar forests. It serves as the traditional starting base for the annual Amarnath Yatra and gateway to scenic Betaab and Aru valleys.',
        },
        {
          name: 'Patnitop & Sanasar',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'Scenic Pine Resort',
          description:
            'A tranquil hill resort perched at 6,640 ft enveloped by dense deodars, featuring the Skyview aerial ropeway from Sanget, ancient Nag Temple, and the high-altitude pine meadow and lake of Sanasar.',
        },
        {
          name: 'Sonmarg & Thajiwas Glacier',
          image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
          badge: 'Meadow of Gold',
          description:
            'Set against towering snow peaks on the Sindh River, Sonmarg is famous for pony treks to the eternal snowfields of Thajiwas Glacier, scenic alpine river walks, and acting as the fast-track gateway to Baltal for Amarnath Yatra.',
        },
        {
          name: 'Raghunath Temple Jammu',
          image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
          badge: 'Royal Heritage Temple',
          description:
            'One of Northern Indias largest historic temple complexes built by Maharaja Gulab Singh, housing seven inner shrines whose sanctum walls are adorned with gold sheets and rare Sanskrit manuscripts.',
        },
        {
          name: 'Maa Kheer Bhawani',
          image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80',
          badge: 'Sacred Spring Shrine',
          description:
            'Revered Kashmiri Hindu temple dedicated to Goddess Ragnya Devi, built over a sacred natural spring whose waters are believed to change hues with regional spiritual portents.',
        },
        {
          name: 'Ardhkuwari Cave',
          image: 'https://images.unsplash.com/photo-1626014303757-6564477577f1?auto=format&fit=crop&w=800&q=80',
          badge: 'Garbhjoon Cave',
          description:
            'Sacred cave sanctuary located exactly midway on the Vaishno Devi trek at 4,800 ft where Goddess meditated for nine months in the Garbhjoon cave before reaching her permanent abode at Bhawan.',
        },
        {
          name: 'Baba Dhansar',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'Holy Water Springs',
          description:
            'A deeply tranquil holy natural spring and cave sanctuary located just 17 km from Katra. Cool mineral streams flow continuously over an ancient natural Shivling nestled in lush forest groves.',
        },
        {
          name: 'Amarnath Holy Cave',
          image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80',
          badge: 'Baba Barfani Abode',
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
    displayName: 'HIMACHAL PRADESH',
    state: 'Himachal Pradesh',
    destinationType: 'regular',
    tagline: 'Sacred 5 Devi Darshan Shaktipeeth Circuit & Himalayan Hills',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    guideTitle: 'Himachal Pradesh Sacred Devi Darshan & Hills Guide',
    weatherInfo: '12°C - 26°C (Pleasant Mountain Breezes)',
    bestSeason: 'Year-Round (Navratri Festivals & Summer Peaks)',
    startingPrice: 7499,
    keyHighlights: [
      '5 Devi Shaktipeeths',
      'Maa Jwala Ji Flames',
      'Manali & Solang',
      'Shimla Ridge',
    ],
    popularCities: [
      'Maa Jwala Ji',
      'Maa Chintpurni Devi',
      'Maa Chamunda Devi',
      'Maa Brajeshwari Kangra',
      'Maa Naina Devi',
      'Maa Baglamukhi',
      'Manali (Solang Valley)',
      'Dharamshala (McLeodganj)',
      'Shimla (Mall Road)',
    ],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'pilgrimage', label: 'Devi Darshan Circuit', iconName: 'Sparkles' },
      { id: 'family', label: 'Family & Hills', iconName: 'Users' },
      { id: 'honeymoon', label: 'Manali & Shimla', iconName: 'Heart' },
      { id: 'senior', label: 'Senior Friendly', iconName: 'Hotel' },
      { id: 'weekend', label: 'Short Break (3-4D)', iconName: 'Clock' },
    ],
    guide: {
      overview:
        'Revered as "Devbhoomi" (Land of the Gods), Himachal Pradesh is home to the most powerful and auspicious Shaktipeeth shrines in Sanatan tradition. Embark on the sacred 5 Devi Darshan circuit—Maa Jwala Ji (Eternal Flame), Maa Chintpurni (Chhinnamastika Dham), Maa Chamunda Devi, Maa Brajeshwari Kangra, and Maa Naina Devi—while soaking in the serene pines of Dharamshala, colonial majesty of Shimla, and alpine snowscapes of Manali.',
      bestTimeToVisit:
        'Devi Darshan shrines are open 365 days a year. Chaitra Navratri (March-April) and Ashwin/Sharad Navratri (September-October) are especially auspicious with 24-hour special aartis. For hill stations, March to June offers pleasant cool weather, while December to February brings magical snowfall to Manali, Shimla, and Solang Valley.',
      idealDuration: '3 to 5 Days for Sacred Devi Circuit; 6 to 9 Days for Complete Himachal & Devi Yatra',
      nearestAirport: 'Kangra Gaggal Airport (DHM), Kullu-Manali Airport (KUU), and Chandigarh International Airport (IXJ/IXC)',
      nearestRailway: 'Una Himachal (UHL), Pathankot Cantt (PTKC), and Chandigarh Junction (CDG) with direct Vande Bharat & Shatabdi trains',
      topAttractions: [
        {
          name: 'Maa Jwala Ji Temple',
          description:
            'World-renowned Shaktipeeth where the divine tongue of Sati fell. Worship centers on 9 natural eternal flames burning continuously out of rocky fissures without any fuel, oil, or carbon residue since prehistoric antiquity.',
        },
        {
          name: 'Maa Chintpurni Devi',
          description:
            'Sacred Shaktipeeth nestled in the Sivalik range where Goddess Sati feet fell. Disciples pray here for "Chinta Haran" (freedom from all worldly anxieties and worries) and receive blessed coconut prasad.',
        },
        {
          name: 'Maa Chamunda Devi',
          description:
            'Revered 16th-century temple on the banks of Baner River against the majestic snow peaks of Dhauladhar, dedicated to Goddess Kali after she vanquished the demon kings Chanda and Munda.',
        },
        {
          name: 'Maa Brajeshwari Devi',
          description:
            'Historic golden-domed Shaktipeeth in Kangra town where Sati left breast fell. Famous for its grand Makar Sankranti butter festival and deep spiritual resonance.',
        },
        {
          name: 'Maa Naina Devi',
          description:
            'Perched atop a triangular hill overlooking Gobind Sagar Lake where Sati eyes fell. Accessible comfortably via an aerial passenger ropeway from the parking base or by paved pilgrim steps.',
        },
        {
          name: 'Maa Baglamukhi Temple',
          description:
            'Ancient yellow-themed sanctuary dedicated to Maa Baglamukhi (the eighth Mahavidya), visited by devotees from across the world for victory over insurmountable life obstacles and legal hurdles.',
        },
        {
          name: 'Hadimba Devi Temple',
          description:
            'Unique 1553 AD four-tiered pagoda wooden temple surrounded by giant deodar trees in Old Manali, paired with the natural sulfur healing hot water springs in Vashisht village.',
        },
        {
          name: 'Solang Valley & Atal Tunnel',
          description:
            'Celebrated adventure haven for paragliding, snow quad biking, and zorbing, leading to the world-record 9.02 KM engineering marvel Atal Tunnel linking Kullu Valley to Lahaul.',
        },
        {
          name: 'Dalai Lama Temple',
          description:
            'Spiritual seat of His Holiness the Dalai Lama featuring the Tsuglagkhang monastery complex, prayer wheels, Tibetan handicraft markets, and the refreshing Bhagsu Nag waterfall and Shiva shrine.',
        },
        {
          name: 'Baijnath Temple',
          description:
            'Exquisite 13th-century Nagara stone architectural marvel on the Binwa River where Ravana worshipped Lord Shiva as Vaidyanath (Lord of Physicians) to attain invincibility.',
        },
        {
          name: 'Jakhoo Temple',
          description:
            'Historic hilltop shrine at 8,000 ft where Lord Hanuman rested while searching for Sanjeevani herb, topped with a towering 108-foot vermillion statue and sweeping vistas of the Himalayas.',
        },
        {
          name: 'Manikaran Sahib',
          description:
            'Holy Sikh and Hindu pilgrimage destination on the rushing Parvati River, famous for its natural boiling sulfur hot springs where community langar is cooked in geothermal waters.',
        },
        {
          name: 'Bijli Mahadev Temple',
          description:
            'Perched at 8,000 ft atop the Mathan plateau, this legendary Shiva temple features a 60-foot wooden staff that attracts cosmic lightning during storms, which shatters the Shivling before priests restore it using unsalted butter and sattu.',
        },
        {
          name: 'Tara Devi Temple',
          description:
            'Sacred hilltop temple nestled amid dense oak and rhododendron forests atop Tara Parvat in Shimla, featuring an Ashtadhatu idol of Goddess Tara Devi brought by the Sen kings of Bengal.',
        },
        {
          name: 'Maa Hatkoti Durga Temple',
          description:
            'Magnificent ancient riverside shrine on the Pabbar River housing a colossal solid bronze idol of eight-armed Mahishasuramardini, built by Adi Shankaracharya in the 8th century.',
        },
        {
          name: 'Bhootnath Temple',
          description:
            'Dating back to 1527 AD on the banks of River Beas, Mandi boasts over 81 historic stone Shiva temples, earning it the revered title of Chhoti Kashi of the Himalayas.',
        },
        {
          name: 'Gurudwara Paonta Sahib',
          description:
            'Sanctified historical Sikh pilgrimage site on the serene banks of the Yamuna River where tenth Sikh Guru Sri Guru Gobind Singh Ji stayed for over four years and composed the holy Dasam Granth.',
        },
        {
          name: 'Rewalsar Holy Lake',
          description:
            'A sacred natural mountain lake revered by Hindus (associated with Rishi Lomas), Sikhs (honoring Guru Gobind Singh Jis visit), and Tibetan Buddhists (birthplace of Guru Padmasambhava).',
        },
        {
          name: 'Masroor Rock-Cut Temples',
          description:
            'Remarkable 8th-century complex of 15 monolithic rock-cut shrines carved out of a single sandstone ridge with a sacred water pool, dedicated to Lord Shiva, Ram, Sita, and Lakshman.',
        },
      ],
      thingsToDo: [
        'Complete the blessed 5 Devi Shaktipeeth Darshan circuit with priority assistance and verified stays',
        'Witness the celestial 9 eternal holy flames burning continuously at Maa Jwala Ji without any fuel',
        'Take the scenic aerial passenger ropeway up to Maa Naina Devi overlooking Gobind Sagar Lake',
        'Perform special havan and yellow-flower puja at Maa Baglamukhi Temple in Bankhandi',
        'Drive through the monumental Atal Tunnel to witness the high-altitude snowfields of Sissu, Lahaul',
        'Taste authentic traditional Himachali Dham served on fresh leaves in Kangra and Kullu',
        'Stroll along the historic colonial British Mall Road and Lakkar Bazaar in Shimla',
      ],
      localCuisine: [
        { dish: 'Himachali Kangri Dham', description: 'Traditional celebratory satvik feast consisting of Madra (chickpeas in curd gravy), Mahni, Chana Dal, Khatta, and sweet Meethe Chawal.' },
        { dish: 'Siddu with Desi Ghee', description: 'Indigenous steamed wheat bread stuffed with seasoned walnuts, poppy seeds, and herbs, served piping hot with pure mountain cow ghee.' },
        { dish: 'Babru & Kadi', description: 'Himachali stuffed kachori-style puffed bread filled with black gram paste served with tangy spiced buttermilk curry.' },
        { dish: 'Kullu Sepu Vadi & Apple Halwa', description: 'Traditional Himachali urad dal dumplings simmered in a fragrant spinach and curd gravy, served alongside sweet mountain apple halwa cooked in pure desi ghee.' },
      ],
      travelTips: [
        'Plan the 5 Devi circuit in geographical order: Naina Devi (Bilaspur) → Chintpurni (Una) → Jwala Ji (Kangra) → Brajeshwari (Kangra) → Chamunda Devi (Dharamshala) for minimal travel time.',
        'During Navratri festivals, queues can be long. Holidays Hunt provides senior-friendly facilitation and verified nearby accommodations to ensure relaxed darshans.',
        'Carry a light jacket or shawl even during summer months for hill stations like Dharamshala, McLeodganj, Shimla, and Manali.',
        'Private sanitized SUVs (Innova, Crysta, Ertiga) with certified hill drivers are strongly recommended for seamless ghat travel.',
      ],
      faqs: [
        {
          question: '1. What is the traditional auspicious sequence to visit the Himachal 5 Devi Temples?',
          answer:
            'The most seamless and time-efficient route starts from Chandigarh/Una: (1) Maa Naina Devi (Bilaspur) → (2) Maa Chintpurni (Una) → (3) Maa Jwala Ji (Kangra) → (4) Maa Brajeshwari Devi (Kangra) → (5) Maa Chamunda Devi (Dharamshala). This circuit can be comfortably completed in 3 to 4 days.',
        },
        {
          question: '2. Which is the nearest railway station and airport for Himachal Devi Darshan?',
          answer:
            'For Devi Darshan, Una Himachal Railway Station (UHL) is the closest railhead connected by direct Vande Bharat Express from New Delhi. Pathankot Cantt (PTKC) and Chandigarh (CDG) are also convenient. Kangra Gaggal Airport (DHM) is just 20 km from Chamunda Devi and Kangra shrines.',
        },
        {
          question: '3. Are there ropeways or easy access options for senior citizens at the temples?',
          answer:
            'Yes, Maa Naina Devi features an aerial passenger cable car (ropeway) that lifts pilgrims directly from the base parking to the temple gates. Jwala Ji and Chintpurni have paved, gentle ramps and battery carts/wheelchair assistance for elderly devotees.',
        },
        {
          question: '4. What special ceremonies take place during Chaitra and Ashwin Navratris?',
          answer:
            'During Navratris, all Devi temples remain open 24 hours. They feature continuous Akhand Kirtan, grand floral shringar of the sanctums, morning and evening Mangala aartis, special Havan Yajnas, and continuous free community Langars serving satvik meals.',
        },
        {
          question: '5. Can we combine Himachal Devi Darshan with Manali, Shimla, or Dharamshala?',
          answer:
            'Yes! We offer highly popular 6-Day, 7-Day, and 9-Day customized itineraries that blend the sacred 5 Devi Darshan with refreshing leisure stays in Dharamshala (McLeodganj), Manali (Solang/Atal Tunnel), and Shimla.',
        },
        {
          question: '6. What kind of vehicles and roads are used for the Himachal Yatra?',
          answer:
            'The roads connecting all five Devi temples and major hill stations are well-maintained, wide National and State Highways. We provide sanitized, private AC vehicles (Innova Crysta, Ertiga, Dzire, or Tempo Traveller) driven by experienced, hill-certified chauffeurs.',
        },
        {
          question: '7. What is the significance of the 9 eternal flames at Maa Jwala Ji Temple?',
          answer:
            'Maa Jwala Ji is an extraordinary Shaktipeeth where no idol is worshipped. Instead, nine eternal flames burn naturally out of rock clefts, representing Goddess Mahakali, Annapurna, Chandi, Hinglaj, Vindhyavasini, Mahalakshmi, Saraswati, Ambika, and Anjana.',
        },
        {
          question: '8. Is pure vegetarian and satvik food available across Himachal Pradesh?',
          answer:
            'Yes, all towns along the Devi circuit are devotional hubs offering 100% pure vegetarian cuisine, traditional Himachali satvik Dham, and 24-hour free community langars operated by temple trusts.',
        },
        {
          question: '9. What clothing should we pack for Himachal Pradesh across different seasons?',
          answer:
            'For summer visits (April-June): Comfortable cotton clothes with light woolens or windproof jackets for cool evenings in Manali and Shimla. For winter visits (October-March): Thermal inners, heavy woolen jackets, gloves, woolen caps, and warm walking shoes.',
        },
        {
          question: '10. What are the photography and mobile phone rules inside the shrines?',
          answer:
            'Photography and videography are strictly prohibited inside the inner sanctums (Garbhagriha) of all Devi temples to preserve temple sanctity. Safe cloakrooms and lockers are available at the temple entrances for mobiles and cameras.',
        },
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
  if (
    clean === 'himachal-pradesh' ||
    clean === 'himachal_pradesh' ||
    clean === 'himachal_devi' ||
    clean === 'himachal-devi' ||
    clean === 'shimla' ||
    clean === 'manali' ||
    clean === 'dharamshala' ||
    clean === 'dalhousie' ||
    clean === 'spiti' ||
    clean === 'devi-darshan' ||
    clean === 'kangra'
  ) {
    return DESTINATIONS_REGISTRY['himachal'];
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

  // Combined Jammu & Kashmir
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

  // Himachal Pradesh (Devi Darshan & Hills)
  if (
    target === 'himachal' ||
    target === 'himachal-pradesh' ||
    target === 'himachal_pradesh' ||
    target === 'himachal_devi' ||
    target === 'himachal-devi'
  ) {
    return (
      destStr.includes('himachal') ||
      destStr.includes('shimla') ||
      destStr.includes('manali') ||
      destStr.includes('dharamshala') ||
      destStr.includes('kangra') ||
      destStr.includes('jwala') ||
      destStr.includes('chintpurni') ||
      destStr.includes('chamunda') ||
      destStr.includes('naina devi') ||
      destStr.includes('devi darshan') ||
      destStr.includes('dalhousie') ||
      destStr.includes('kullu') ||
      destStr.includes('solang') ||
      titleStr.includes('himachal') ||
      titleStr.includes('devi darshan') ||
      titleStr.includes('manali') ||
      titleStr.includes('shimla') ||
      titleStr.includes('kangra') ||
      slugStr.includes('himachal') ||
      locStr.includes('himachal') ||
      locStr.includes('manali') ||
      locStr.includes('shimla') ||
      locStr.includes('kangra') ||
      tagStr.includes('himachal')
    );
  }

  // Amritsar (Golden Temple & Heritage)
  if (target === 'amritsar' || target === 'punjab') {
    return (
      destStr.includes('amritsar') ||
      destStr.includes('punjab') ||
      destStr.includes('wagah') ||
      destStr.includes('golden temple') ||
      titleStr.includes('amritsar') ||
      titleStr.includes('golden temple') ||
      titleStr.includes('wagah') ||
      slugStr.includes('amritsar') ||
      locStr.includes('amritsar') ||
      tagStr.includes('amritsar')
    );
  }

  return (
    destStr.includes(target) ||
    titleStr.includes(target) ||
    slugStr.includes(target) ||
    locStr.includes(target) ||
    tagStr.includes(target)
  );
}

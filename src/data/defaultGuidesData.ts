import { GuideArticle, GuideCategory } from '../types/guide';

export const DEFAULT_GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'cat-devi-darshan',
    name: 'Devi Darshan',
    slug: 'devi-darshan',
    description: 'Sacred Shaktipeeth yatra and Devi temple darshan guides across India.',
    icon: 'Sparkles',
    guideCount: 3,
  },
  {
    id: 'cat-temple-guides',
    name: 'Temple Guides',
    slug: 'temple-guides',
    description: 'Detailed darshan guides, temple histories, etiquette, and visiting information.',
    icon: 'Building2',
    guideCount: 4,
  },
  {
    id: 'cat-yatra-guides',
    name: 'Yatra Guides',
    slug: 'yatra-guides',
    description: 'Comprehensive route itineraries, mountain treks, and holy circuit guides.',
    icon: 'Compass',
    guideCount: 3,
  },
  {
    id: 'cat-kashmir-travel',
    name: 'Kashmir Guides',
    slug: 'kashmir-travel-guides',
    description: 'Expert tips on Dal Lake houseboats, Gulmarg Gondola, Pahalgam valleys & seasonal snow.',
    icon: 'Mountain',
    guideCount: 2,
  },
  {
    id: 'cat-travel-guides',
    name: 'Travel Guides',
    slug: 'travel-guides',
    description: 'Logistics, cab information, weather advisories, and stay recommendations.',
    icon: 'MapPin',
    guideCount: 2,
  },
  {
    id: 'cat-tips-rates',
    name: 'Cab Rates & Tips',
    slug: 'cab-rates-and-tips',
    description: 'Transparent guide to taxi fares, toll permits, packing lists, and road travel.',
    icon: 'Car',
    guideCount: 1,
  },
];

export const DEFAULT_GUIDES: GuideArticle[] = [
  {
    id: 'guide-hp-devi-darshan',
    slug: 'himachal-pradesh-devi-darshan-guide',
    title: 'Himachal Pradesh Devi Darshan Guide',
    excerpt: 'A comprehensive guide to the revered Devi shrines of Himachal Pradesh, with route circuits, darshan tips, and seasonal travel advice.',
    content: `## Sacred Shrines of the Divine Mother in Himachal Pradesh

Himachal Pradesh is popularly venerated as *Devbhoomi* (the Abode of Gods). Nestled amidst the verdant valleys and snow-dusted Dhauladhar ranges are sacred Shaktipeeths where devotees have journeyed for centuries to seek blessings of the Divine Mother.

A Devi Darshan pilgrimage in Himachal Pradesh offers not only deep spiritual solace but also breathtaking journeys through mountain passes, serene river confluences, and ancient pine forests.

---

## Core Devi Temples in the Sacred Circuit

When planning a pilgrimage across the lower Shivalik and Kangra valleys, the following revered shrines form the spiritual nucleus:

### 1. Maa Chintpurni (Una District)
Situated on a gentle ridge in the Una district, Maa Chintpurni is revered as the fulfiller of devotees' heartfelt wishes (*Chhinnamastika Dham*). Pilgrims bring offerings of traditional halwa, coconut, and sacred chunri.

### 2. Maa Jwala Ji (Kangra District)
Famous worldwide for the eternal, unquenched blue-yellow flames burning naturally from rock crevices without any artificial fuel. The flame is worshipped as the divine tongue of Sati.

### 3. Maa Brajeshwari Devi (Kangra Town)
Located in the historical Nagarkot town, this ancient temple is one of the 51 Shaktipeeths where the left breast of Sati fell. It has withstood centuries of history and remains a major spiritual center.

### 4. Maa Chamunda Devi (Kangra Valley)
Set along the gushing Baner River near Dharamshala with views of the snow-clad Dhauladhars, this peaceful shrine is dedicated to the warrior manifestation of the goddess who vanquished demons Chanda and Munda.

### 5. Maa Naina Devi (Bilaspur District)
Overlooking the shimmering waters of Gobind Sagar Lake, Naina Devi sits atop a hill reached by stairs or a ropeway. The temple marks the spot where the eyes (*nain*) of Sati fell.

---

## Suggested Route Planning

A balanced 4 to 5-day journey from Chandigarh or Delhi allows unhurried darshans without long travel exhaustion:

- **Day 1:** Arrival in Chandigarh / Una → Maa Naina Devi → Maa Chintpurni (Night halt near Chintpurni or Kangra)
- **Day 2:** Maa Jwala Ji darshan → Maa Baglamukhi Bankhandi → Kangra Brajeshwari Devi
- **Day 3:** Maa Chamunda Devi → Scenic Dharamshala & peaceful stay
- **Day 4:** Departure towards Chandigarh / Delhi with holy prasad

---

## Practical Pilgrimage Advice

- **Appropriate Attire:** Modest and traditional Indian attire (kurta-pajama, salwar kameez, or saree) is customary and appreciated in all temple precincts.
- **Footwear Handling:** Designated shoe counters are available at the base of every shrine. Carry slip-on footwear for ease.
- **Mountain Driving:** Mountain roads involve curves; early morning departures ensure smooth travel before temple queues lengthen.`,
    category: 'Devi Darshan',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Devi Darshan', 'Himachal Pilgrimage', 'Shaktipeeth', 'Kangra Valley', 'Temple Guide'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Pilgrimage Specialist',
    },
    featuredImage: '/temple_pencil_sketch.jpg',
    featuredImageAlt: 'Traditional temple sketch representing sacred shrines of Himachal Pradesh',
    bodyImages: [
      {
        id: 'img-1',
        url: '/sacred_temple_complex.jpg',
        alt: 'Sacred temple complex in the foothills of Himachal Pradesh',
        caption: 'Sacred foothills setting of Himachal temple circuits',
      },
    ],
    status: 'published',
    publishedAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-05T11:30:00Z',
    createdAt: '2026-08-15T09:00:00Z',
    readTimeMinutes: 5,
    seo: {
      seoTitle: 'Himachal Pradesh Devi Darshan Guide | Bhakti Sathi',
      metaDescription: 'Complete Himachal Devi Darshan guide covering sacred Shaktipeeths, route planning, best visiting months and pilgrim tips.',
      primaryKeyword: 'Himachal Pradesh Devi Darshan',
      secondaryKeywords: ['Himachal Shaktipeeth circuit', 'Devi Darshan route map', 'Kangra temple darshan', 'Himachal yatra guide'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/himachal-pradesh-devi-darshan-guide',
    },
    faqs: [
      {
        id: 'faq-1',
        question: 'Which Devi temples are covered in the Himachal pilgrimage circuit?',
        answer: 'The prominent circuit includes Maa Chintpurni, Maa Jwala Ji, Maa Brajeshwari Devi (Kangra), Maa Chamunda Devi, Maa Naina Devi, and Maa Baglamukhi (Bankhandi).',
      },
      {
        id: 'faq-2',
        question: 'What is the best starting point for Himachal Devi Darshan?',
        answer: 'Chandigarh or Una railway station serve as the most convenient gateways with direct highway connectivity to Una, Kangra, and Bilaspur.',
      },
      {
        id: 'faq-3',
        question: 'How many days are recommended for a relaxed Devi yatra?',
        answer: 'A minimum of 4 to 5 days is recommended to comfortably visit all major shrines without long night journeys on mountain roads.',
      },
      {
        id: 'faq-4',
        question: 'Are there ropeway facilities available at the hill temples?',
        answer: 'Yes, Maa Naina Devi features a convenient cable car ropeway system for elderly pilgrims and families.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01', 'pkg-himachal-02'],
    relatedGuideSlugs: ['himachal-9-devi-yatra-guide', 'jwala-ji-temple-guide', 'chintpurni-temple-guide'],
  },
  {
    id: 'guide-9-devi-yatra',
    slug: 'himachal-9-devi-yatra-guide',
    title: 'Himachal 9 Devi Yatra Guide',
    excerpt: 'Detailed itinerary and spiritual significance of the sacred Nav Devi Yatra spanning Jammu, Punjab, and Himachal Pradesh.',
    content: `## The Revered Nav Devi (9 Devi) Pilgrimage Circuit

The Nav Devi Yatra is one of northern India's most cherished spiritual pilgrimages. It connects nine powerful manifestations of Shakti located across Jammu, Punjab, and the hill valleys of Himachal Pradesh.

Thousands of families undertake this journey every year, especially during the auspicious Navratri periods, seeking peace, protection, and prosperity.

---

## The Nine Holy Shrines in the Sequence

1. **Maa Mansa Devi (Panchkula, Haryana):** The benevolent wish-granting goddess situated near Chandigarh.
2. **Maa Chandi Devi (Haridwar / Chandigarh route connect):** Revered deity radiating divine strength.
3. **Maa Naina Devi (Bilaspur, Himachal):** Resting atop a scenic triangular hill where the eyes of Sati fell.
4. **Maa Chintpurni (Una, Himachal):** The Chhinnamastika form relieving earthly worries.
5. **Maa Jwala Ji (Kangra, Himachal):** The sacred eternal flame embodying living spiritual fire.
6. **Maa Brajeshwari Devi (Kangra, Himachal):** Historical Shaktipeeth in Nagarkot town.
7. **Maa Chamunda Devi (Dharamshala, Himachal):** Baner riverbank abode of the fierce warrior mother.
8. **Maa Baglamukhi (Bankhandi, Himachal):** Revered Peethambari deity bestowing victory over obstacles.
9. **Maa Vaishno Devi (Katra, Jammu):** The culminating holy cave shrine in Trikuta Hills.

---

## Suggested 7-Day Complete Yatra Plan

- **Day 1:** Arrival in Chandigarh → Maa Mansa Devi → Proceed to Bilaspur / Naina Devi
- **Day 2:** Maa Naina Devi darshan → Proceed to Chintpurni → Maa Chintpurni darshan
- **Day 3:** Maa Jwala Ji morning darshan → Maa Baglamukhi → Kangra Brajeshwari Devi
- **Day 4:** Maa Chamunda Devi darshan → Evening arrival at Katra (Jammu base)
- **Day 5:** Holy trek to Maa Vaishno Devi Bhawan → Darshan of Holy Pindies → Bhairon Ghati
- **Day 6:** Descend to Katra → Relax & spiritual reflection
- **Day 7:** Katra to Jammu railway station / airport for return journey`,
    category: 'Yatra Guides',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['9 Devi Yatra', 'Nav Devi', 'Himachal', 'Vaishno Devi', 'Shaktipeeth'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Pilgrimage Specialist',
    },
    featuredImage: '/sacred_temple_complex.jpg',
    featuredImageAlt: 'Sacred temple complex for Nav Devi Yatra',
    bodyImages: [],
    status: 'published',
    publishedAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-04T14:00:00Z',
    createdAt: '2026-08-20T10:00:00Z',
    readTimeMinutes: 6,
    seo: {
      seoTitle: 'Himachal 9 Devi Yatra Guide | Bhakti Sathi',
      metaDescription: 'Step-by-step 9 Devi Yatra route itinerary covering sacred temples across Himachal Pradesh and Katra Vaishno Devi.',
      primaryKeyword: 'Himachal 9 Devi Yatra',
      secondaryKeywords: ['Nav Devi yatra route', '9 Devi tour itinerary', 'Himachal Katra pilgrimage', 'Shaktipeeth tour'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/himachal-9-devi-yatra-guide',
    },
    faqs: [
      {
        id: 'faq-9d-1',
        question: 'Which are the 9 Devi temples in the complete yatra?',
        answer: 'The circuit covers Mansa Devi, Naina Devi, Chintpurni, Jwala Ji, Brajeshwari Devi, Chamunda Devi, Baglamukhi, and Vaishno Devi in Katra.',
      },
      {
        id: 'faq-9d-2',
        question: 'How many days are needed to complete the full 9 Devi circuit?',
        answer: '6 to 7 days provide a comfortable pace, allowing sufficient time for the Katra Vaishno Devi hill trek.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide', 'jwala-ji-temple-guide'],
  },
  {
    id: 'guide-jwala-ji',
    slug: 'jwala-ji-temple-guide',
    title: 'Jwala Ji Temple Guide',
    excerpt: 'Essential pilgrim guide to the eternal flame shrine of Maa Jwala Ji in Kangra, Himachal Pradesh.',
    content: `## The Miracle of the Eternal Flame at Jwala Ji

Maa Jwala Ji Temple in the Kangra district of Himachal Pradesh is one of the most venerated Shaktipeeths in India. Unlike most Hindu temples where deities are worshipped in sculpted stone murtis, Jwala Ji is unique because the Divine Mother is manifested as natural, eternal flames emerging from deep crevices in the rock.

Legend recounts that the tongue of Sati fell here when Lord Vishnu released the Sudarshana Chakra to calm Lord Shiva's sorrow.

---

## Temple Architecture and Sanctum

The temple features an eye-catching gilded dome presented in history by Mughal Emperor Akbar after witnessing the miraculous inextinguishable nature of the holy flames.

Within the sanctum sanctorum, nine flames are worshipped, representing Maa Mahakali, Maa Annapurna, Maa Chandi, Maa Hinglaj, Maa Vindhyavasini, Maa Mahalakshmi, Maa Saraswati, Maa Ambika, and Maa Anjana.

---

## Important Darshan Guidelines

- **Offerings:** Traditional offerings include dry fruits, rabri, coconuts, and red chunris.
- **Aarti Timings:** Temple priests perform traditional aartis throughout the day. Early morning (*Mangal Aarti*) and evening (*Shayan Aarti*) offer serene spiritual atmospheres.
- **Dress Code:** Traditional attire is customary for entering the inner parikrama.`,
    category: 'Temple Guides',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Jwala Ji', 'Kangra', 'Eternal Flame', 'Shaktipeeth'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Temple Researcher',
    },
    featuredImage: '/temple_pencil_sketch.jpg',
    featuredImageAlt: 'Detailed sketch of Jwala Ji temple shikhara',
    bodyImages: [],
    status: 'published',
    publishedAt: '2026-08-25T08:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
    createdAt: '2026-08-25T08:00:00Z',
    readTimeMinutes: 4,
    seo: {
      seoTitle: 'Jwala Ji Temple Guide | Bhakti Sathi',
      metaDescription: 'Discover history, darshan guidance and travel advice for Maa Jwala Ji temple in Kangra, Himachal Pradesh.',
      primaryKeyword: 'Jwala Ji temple guide',
      secondaryKeywords: ['Jwala Ji darshan', 'Kangra Jwalaji history', 'Jwala Ji eternal flame', 'Himachal Shaktipeeth'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/jwala-ji-temple-guide',
    },
    faqs: [
      {
        id: 'faq-jw-1',
        question: 'What is unique about Jwala Ji temple?',
        answer: 'The goddess is worshipped in the form of eternal natural flames emerging from the rock without any oil or wick.',
      },
      {
        id: 'faq-jw-2',
        question: 'Where is Jwala Ji temple located?',
        answer: 'It is situated in the Jwalamukhi town of Kangra district in Himachal Pradesh, approximately 55 km from Dharamshala.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide', 'chintpurni-temple-guide'],
  },
  {
    id: 'guide-chintpurni',
    slug: 'chintpurni-temple-guide',
    title: 'Chintpurni Temple Guide',
    excerpt: 'Pilgrim guide to Maa Chintpurni Devi temple in Una, Himachal Pradesh, including history and tips.',
    content: `## Maa Chintpurni Dham: The Dispeller of Worries

Maa Chintpurni Temple, nestled on a picturesque ridge in Una district, is revered by millions as the holy seat of Maa Chhinnamastika Devi—the mother who relieves worldly burdens and anxieties (*chinta*).

Legend attributes the discovery of this holy site to Mai Das, an ardent devotee who was blessed with the divine darshan of the mother under a sacred banyan tree.

---

## Visiting Chintpurni

- **Location:** Una district, easily accessible from Hoshiarpur and Jalandhar highways.
- **Darshan Experience:** The sanctum features a sacred pindi surrounded by floral garlands. Pilgrims circumambulate the ancient banyan tree where prayers are whispered.
- **Crowd Advisory:** Sundays, Tuesdays, and Navratri periods witness large gatherings of devotees. Weekdays offer quicker darshan.`,
    category: 'Temple Guides',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Chintpurni', 'Una', 'Shaktipeeth', 'Devi Darshan'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Pilgrimage Specialist',
    },
    featuredImage: '/pencil_temple_center.jpg',
    featuredImageAlt: 'Temple sketch of Chintpurni Dham',
    bodyImages: [],
    status: 'published',
    publishedAt: '2026-08-28T11:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    createdAt: '2026-08-28T11:00:00Z',
    readTimeMinutes: 4,
    seo: {
      seoTitle: 'Chintpurni Temple Guide | Bhakti Sathi',
      metaDescription: 'Detailed pilgrim guide to Maa Chintpurni temple in Una, Himachal Pradesh, with route information and darshan tips.',
      primaryKeyword: 'Chintpurni temple guide',
      secondaryKeywords: ['Maa Chintpurni Una', 'Chhinnamastika Dham', 'Chintpurni darshan tips', 'Himachal temple'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/chintpurni-temple-guide',
    },
    faqs: [
      {
        id: 'faq-cp-1',
        question: 'Which railway station is closest to Chintpurni temple?',
        answer: 'Una Himachal (UHL) and Amb Andaura (AAD) are the nearest railway stations, well-connected to Delhi.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide', 'jwala-ji-temple-guide'],
  },
  {
    id: 'guide-naina-devi',
    slug: 'naina-devi-temple-guide',
    title: 'Naina Devi Temple Guide',
    excerpt: 'Complete guide to Maa Naina Devi hilltop shrine overlooking Gobind Sagar Lake in Bilaspur, Himachal Pradesh.',
    content: `## Sacred Hilltop Abode of Maa Naina Devi

Perched on a scenic cliff in Bilaspur district of Himachal Pradesh, Maa Naina Devi temple overlooks the emerald waters of Gobind Sagar lake and Anandpur Sahib valley.

The temple is revered as the Shaktipeeth where the eyes (*nain*) of Sati fell during the divine cosmic dance.

---

## Cable Car (Ropeway) Access

Pilgrims can reach the temple summit either by climbing traditional stepped pathways or by using the modern ropeway (cable car) from the base station. The ropeway offers breathtaking aerial views of the reservoir and surrounding Shivalik hills.

---

## Practical Pilgrimage Tips

- **Best Season:** October to March offers pleasant mountain breezes. Navratri festivals feature vibrant community celebrations.
- **Combined Itinerary:** Easily combined with a visit to historic Anandpur Sahib Gurudwara located nearby.`,
    category: 'Temple Guides',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Naina Devi', 'Bilaspur', 'Gobind Sagar', 'Shaktipeeth'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Pilgrimage Specialist',
    },
    featuredImage: '/temple_pencil_sketch.png',
    featuredImageAlt: 'Naina Devi temple hilltop view',
    bodyImages: [],
    status: 'published',
    publishedAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-09-03T12:00:00Z',
    createdAt: '2026-08-30T10:00:00Z',
    readTimeMinutes: 4,
    seo: {
      seoTitle: 'Naina Devi Temple Guide | Bhakti Sathi',
      metaDescription: 'Explore Maa Naina Devi hilltop temple in Bilaspur with ropeway details, holy history and visiting guidelines.',
      primaryKeyword: 'Naina Devi temple guide',
      secondaryKeywords: ['Maa Naina Devi Bilaspur', 'Naina Devi ropeway', 'Himachal Shaktipeeth', 'Naina Devi darshan'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/naina-devi-temple-guide',
    },
    faqs: [
      {
        id: 'faq-nd-1',
        question: 'Is ropeway available for Naina Devi temple?',
        answer: 'Yes, a cable car ropeway is operational at the base and takes pilgrims directly to the hilltop entrance.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide', 'chintpurni-temple-guide'],
  },
  {
    id: 'guide-hp-from-delhi',
    slug: 'himachal-devi-darshan-from-delhi',
    title: 'Himachal Devi Darshan from Delhi',
    excerpt: 'Detailed route map, transport choices, and driving itinerary for devotees traveling from Delhi to Himachal Devi temples.',
    content: `## Planning Your Himachal Devi Yatra from Delhi NCR

For millions of devotees residing in Delhi, Noida, Gurugram, and Ghaziabad, undertaking a pilgrimage to the sacred Devi shrines of Himachal Pradesh is a deeply meaningful tradition.

With the expansion of modern expressways (Delhi–Panipat–Ambala–Chandigarh), traveling to the lower Shivalik and Kangra hills has become smoother and faster.

---

## Recommended Travel Modes

### 1. By Dedicated Private Chauffeur Cab
The most flexible option for families with seniors and children. A dedicated vehicle allows door-to-door comfort, customized halt stops, and effortless transitions between hill shrines.

### 2. By Vande Bharat Express to Una / Amb Andaura
The New Delhi - Amb Andaura Vande Bharat Express (Train No. 22447) reaches Una Himachal in approximately 5 hours, providing a high-speed, comfortable transit directly to the foothill base.

---

## 4-Day Suggested Itinerary from Delhi

- **Day 1:** Early departure from Delhi via NH44 → Kurukshetra → Chandigarh → Maa Naina Devi → Night stay near Una / Chintpurni
- **Day 2:** Maa Chintpurni morning darshan → Proceed to Jwala Ji → Afternoon darshan of the eternal flames → Night stay at Kangra / Dharamshala
- **Day 3:** Kangra Brajeshwari Devi → Maa Chamunda Devi → Evening spiritual relaxation in Dharamshala
- **Day 4:** Smooth highway return journey back to Delhi NCR`,
    category: 'guides',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Delhi to Himachal', 'Devi Darshan Route', 'Yatra Plan', 'Road Trip'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Travel Logistics Specialist',
    },
    featuredImage: '/sacred_temple_complex.jpg',
    featuredImageAlt: 'Pilgrimage journey route from Delhi to Himachal hills',
    bodyImages: [],
    status: 'published',
    publishedAt: '2026-09-02T08:00:00Z',
    updatedAt: '2026-09-06T15:00:00Z',
    createdAt: '2026-09-02T08:00:00Z',
    readTimeMinutes: 5,
    seo: {
      seoTitle: 'Himachal Devi Darshan from Delhi | Bhakti Sathi',
      metaDescription: 'Planning a Himachal Devi yatra from Delhi? Find highway route tips, Vande Bharat train advice and a 4-day travel plan.',
      primaryKeyword: 'Himachal Devi Darshan from Delhi',
      secondaryKeywords: ['Delhi to Himachal Devi tour', 'Delhi to Kangra route', 'Delhi to Chintpurni car', 'Vande Bharat Una darshan'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/himachal-devi-darshan-from-delhi',
    },
    faqs: [
      {
        id: 'faq-delhi-1',
        question: 'What is the best train from Delhi for Himachal Devi Darshan?',
        answer: 'The New Delhi - Amb Andaura Vande Bharat Express is the fastest train connecting Delhi to Una Himachal in around 5 hours.',
      },
      {
        id: 'faq-delhi-2',
        question: 'How long does it take to drive from Delhi to Chintpurni?',
        answer: 'Driving via NH44 and NH503 usually takes around 7.5 to 8.5 hours depending on traffic and rest stops.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide', 'himachal-9-devi-yatra-guide'],
  },
  {
    id: 'guide-chamunda-devi-draft',
    slug: 'chamunda-devi-temple-guide',
    title: 'Chamunda Devi Temple Guide',
    excerpt: 'Draft darshan guide for Maa Chamunda Devi temple on the banks of Baner river in Kangra valley.',
    content: `## Maa Chamunda Nandikeshwar Dham

Maa Chamunda Devi temple sits amidst majestic deodars and rushing waters of the Baner river near Dharamshala in Kangra valley.

The temple is dedicated to the fierce aspect of Devi Durga who manifested to vanquish demons Chanda and Munda.

*This guide is currently being reviewed by our editorial team.*`,
    category: 'Temple Guides',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Chamunda Devi', 'Kangra', 'Draft Guide'],
    author: {
      name: 'Bhakti Sathi Editorial Team',
      role: 'Researcher',
    },
    featuredImage: '/temple_pencil_sketch.jpg',
    featuredImageAlt: 'Chamunda Devi temple illustration',
    bodyImages: [],
    status: 'draft',
    updatedAt: '2026-09-07T09:00:00Z',
    createdAt: '2026-09-07T09:00:00Z',
    readTimeMinutes: 3,
    seo: {
      seoTitle: 'Chamunda Devi Temple Guide | Bhakti Sathi',
      metaDescription: 'Complete pilgrim guide to Maa Chamunda Devi shrine near Dharamshala with riverbank darshan information.',
      primaryKeyword: 'Chamunda Devi temple guide',
      secondaryKeywords: ['Maa Chamunda Dharamshala', 'Chamunda Devi darshan', 'Kangra temples'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/chamunda-devi-temple-guide',
    },
    faqs: [],
    relatedPackageIds: ['pkg-himachal-01'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide'],
  },
  {
    id: 'guide-kashmir-best-time',
    slug: 'best-time-to-visit-kashmir-season-wise-guide',
    title: 'Best Time to Visit Kashmir: Month-by-Month Weather & Snow Guide (2026)',
    excerpt: 'Whether you dream of blooming tulips in spring, golden chinar leaves in autumn, or fresh powder snow in Gulmarg, here is the complete seasonal travel guide.',
    content: `## Best Time to Visit Kashmir: Complete Seasonal & Snow Travel Guide

Planning your dream holiday to Kashmir? Known poetically as *Paradise on Earth*, Jammu & Kashmir transforms with every passing season. From snow-carpeted slopes in Gulmarg to lush saffron meadows in Pampore and floating shikaras on Dal Lake, every month brings a distinct charm.

---

### 1. Kashmir in Winter (December to February): The Snow Wonderland
If your goal is to experience heavy snowfall, ride the famous **Gulmarg Gondola Phase 2**, and enjoy cozy evenings with a Kashmiri Kangri and hot Kehwa:
- **Temperature:** -2°C to 7°C (Can dip to -10°C in Gulmarg & Sonmarg).
- **Key Attractions:** Snow sports in Gulmarg, frozen Dal Lake edges in Srinagar, and pony treks across snowy pine woods in Pahalgam.
- **Insider Tip:** Always book centrally heated hotels or luxury houseboats with electric blankets and diesel generators.

---

### 2. Kashmir in Spring (March to May): Tulips & Blossom Blooms
Spring awakens Kashmir with vibrant colors:
- **Indira Gandhi Memorial Tulip Garden:** Asia's largest tulip garden opens in Srinagar during late March and April, featuring over 1.5 million blooming bulbs.
- **Weather:** Crisp, pleasant days (10°C to 20°C).
- **Must-Try:** Shikara rides across Dal and Nigeen Lakes surrounded by blossoming almond and cherry trees.

---

### 3. Kashmir in Summer (June to August): Perfect Family Vacation
Escape the scorching heat of the plains:
- **Weather:** 15°C to 30°C.
- **Highlights:** Betaab Valley, Aru Valley, Chandanwari in Pahalgam, and white-water rafting in Lidder River.
- **Family Advice:** Ideal for senior citizens and young kids who prefer mild temperatures without freezing winds.

---

### 4. Kashmir in Autumn (September to November): The Golden Chinar Season
Autumn is favored by photographers and honeymooners:
- **Visual Delight:** Saffron harvesting in Pampore and rust-golden Chinar leaves carpeting the Mughal Gardens (Nishat & Shalimar Bagh).
- **Clear Blue Skies:** Crispy mountain air and panoramic Himalayan visibility.

---

### Recommended 6-Day Itinerary Overview
1. **Day 1:** Arrival in Srinagar + Romantic Shikara Ride at Sunset
2. **Day 2:** Srinagar to Gulmarg + Phase 1 & 2 Gondola Cable Car Ride
3. **Day 3:** Gulmarg to Pahalgam via Saffron Fields & Apple Orchards
4. **Day 4:** Pahalgam Sightseeing (Aru, Betaab & Baisaran Mini Switzerland)
5. **Day 5:** Excursion to Sonmarg (Thajiwas Glacier) + Night in Luxury Houseboat
6. **Day 6:** Mughal Gardens Tour & Airport Departure`,
    category: 'Kashmir Guides',
    destination: 'Kashmir',
    destinationSlug: 'kashmir',
    destinationName: 'Kashmir Valley',
    tags: ['Kashmir', 'Gulmarg', 'Srinagar', 'Best Time', 'Snow Guide', 'Houseboat'],
    author: {
      name: 'Peerzada Aadil',
      role: 'Senior Kashmir Destination Lead',
    },
    featuredImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=85',
    featuredImageAlt: 'Snow capped mountains and Dal Lake in Srinagar Kashmir',
    status: 'published',
    publishedAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-28T14:30:00Z',
    createdAt: '2026-08-15T10:00:00Z',
    readTimeMinutes: 5,
    viewsCount: 3420,
    likesCount: 284,
    featured: true,
    seo: {
      seoTitle: 'Best Time to Visit Kashmir (2026) - Snow & Weather Guide',
      metaDescription: 'Complete month-by-month guide to Kashmir weather, snowfall in Gulmarg, tulip garden timings, and recommended 6-day holiday itineraries.',
      primaryKeyword: 'Best Time to Visit Kashmir',
      secondaryKeywords: ['Kashmir snow season', 'Gulmarg gondola winter', 'Srinagar tulip festival'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/best-time-to-visit-kashmir-season-wise-guide',
    },
    faqs: [
      {
        id: 'faq-kashmir-snow',
        question: 'Which month is best to experience live snowfall in Kashmir?',
        answer: 'Late December through January and early February offers the highest probability of heavy snowfall in Gulmarg, Sonmarg, and upper Pahalgam.',
      },
      {
        id: 'faq-kashmir-tulip',
        question: 'When does the Srinagar Tulip Garden open in 2026?',
        answer: 'The Indira Gandhi Memorial Tulip Garden typically opens around mid-to-late March and stays open through late April depending on spring bloom conditions.',
      },
    ],
    relatedPackageIds: ['pkg-kashmir-01', 'pkg-kashmir-02'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide', 'vaishno-devi-yatra-guide'],
  },
  {
    id: 'guide-vaishno-devi-helicopter-guide',
    slug: 'mata-vaishno-devi-yatra-helicopter-booking-and-darshan-guide',
    title: 'Mata Vaishno Devi Yatra: Official Helicopter Booking, RFID Card & Darshan Guide',
    excerpt: 'Official advisory on booking SMVDSB helicopter tickets directly on the Shrine Board portal, mandatory RFID registration, battery cars, and Bhairon ropeway.',
    content: `## Mata Vaishno Devi Yatra: Official Helicopter & Darshan Guide

Every year, millions of devotees embark on the sacred pilgrimage to Shri Mata Vaishno Devi Shrine nestled in the Trikuta Hills of Katra, Jammu. Here is everything you need to know for a comfortable, hassle-free yatra for your family and senior citizens.

---

### 1. Mandatory Yatra Registration (RFID Tracking Card)
- **What is RFID?** The Shri Mata Vaishno Devi Shrine Board (SMVDSB) mandates RFID tracking cards for all yatris to ensure devotee safety and crowd tracking.
- **Where to collect:** Available 24/7 at Katra Railway Station counters, Yatra Parchi Counter at Katra Bus Stand, and Katra Helipad.
- **Cost:** Free of charge. Yatris must carry valid Government photo IDs (Aadhaar Card, Voter ID, or Passport).

---

### 2. Katra to Sanjichhat Official Helicopter Booking
- **Official SMVDSB Booking Only:** In strict compliance with Shrine Board rules, helicopter tickets can ONLY be booked by pilgrims directly on the official SMVDSB portal (\`maavaishnodeviboard.org\`). Beware of unauthorized touts or fake third-party booking websites.
- **Helipad Location:** Katra Helipad is situated approx. 2.5 KM from Katra main market.
- **Flight Duration:** 8 minutes scenic aerial flight over the sacred Trikuta ridges.
- **Sanjichhat to Bhawan:** The distance from Sanjichhat helipad to the Holy Bhawan is roughly 2.5 KM (approx. 35–45 minutes gentle walk, or accessible via battery car / palki for elderly).

---

### 3. Battery Car & Bhairon Ghati Passenger Ropeway
1. **Electric Battery Cars:** Operate along the Himkoti route between Ardhkuwari and Bhawan for elderly pilgrims and persons with disabilities.
2. **Bhairon Ropeway:** Connects Bhawan to Bhairon Ghati in just 3 minutes. Saves a steep 1.5 KM ascent and offers breathtaking Himalayan valley panoramas.`,
    category: 'Yatra Guides',
    destination: 'Jammu',
    destinationSlug: 'jammu',
    destinationName: 'Katra, Jammu',
    tags: ['Vaishno Devi', 'Katra', 'Helicopter Yatra', 'RFID Card', 'Jammu'],
    author: {
      name: 'Raman Sharma',
      role: 'Pilgrimage Operations Specialist',
    },
    featuredImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
    featuredImageAlt: 'Mata Vaishno Devi Bhawan in Katra Trikuta Hills',
    status: 'published',
    publishedAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    createdAt: '2026-08-10T09:00:00Z',
    readTimeMinutes: 4,
    viewsCount: 2890,
    likesCount: 195,
    featured: true,
    seo: {
      seoTitle: 'Mata Vaishno Devi Helicopter Booking & Darshan Guide (2026)',
      metaDescription: 'Step-by-step official guide on SMVDSB Katra to Sanjichhat helicopter tickets portal, RFID yatra pass, battery cars, and Bhairon Ghati ropeway.',
      primaryKeyword: 'Mata Vaishno Devi Helicopter Booking',
      secondaryKeywords: ['SMVDSB Katra helicopter', 'Vaishno Devi RFID card', 'Bhairon ropeway Katra'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/mata-vaishno-devi-yatra-helicopter-booking-and-darshan-guide',
    },
    faqs: [
      {
        id: 'faq-vd-heli',
        question: 'Can travel agents book Vaishno Devi helicopter tickets on our behalf?',
        answer: 'No. Shrine Board regulations strictly mandate that pilgrims must register and book helicopter tickets under their personal ID credentials directly on the official SMVDSB portal.',
      },
      {
        id: 'faq-vd-rfid',
        question: 'Is RFID card required for children under 5 years?',
        answer: 'Yes, all pilgrims regardless of age must possess an active RFID card issued before beginning the trek at Ban Ganga or boarding the helicopter at Katra helipad.',
      },
    ],
    relatedPackageIds: ['pkg-jammu-01', 'pkg-jammu-02'],
    relatedGuideSlugs: ['vaishno-devi-yatra-guide', 'himachal-pradesh-devi-darshan-guide'],
  },
  {
    id: 'guide-himachal-taxi-rates',
    slug: 'himachal-taxi-rates-delhi-chandigarh-to-shimla-manali-guide',
    title: 'Himachal Taxi Rates (2026): Delhi & Chandigarh to Shimla, Manali & Dharamshala',
    excerpt: 'Transparent breakdown of private sedan, Ertiga, and Innova Crysta cab fares, driver allowances, toll taxes, and Rohtang Pass permits.',
    content: `## Himachal Taxi Rates: Complete Pricing & Vehicle Guide

Planning a road trip through Himachal Pradesh? Knowing standard cab fares and inclusions helps avoid surprises at hill checkpoints.

---

### 1. Popular Route Cab Fares (Private Dedicated Vehicle)
- **Chandigarh to Shimla (115 KM / 3.5 Hrs):** ₹2,800 - ₹3,500 (Sedan / Dzire) | ₹4,200 - ₹5,000 (Innova Crysta)
- **Chandigarh to Manali (280 KM / 7-8 Hrs via new 4-lane expressway):** ₹4,800 - ₹6,000 (Sedan) | ₹7,500 - ₹9,500 (Innova Crysta)
- **Delhi to Shimla - Manali - Chandigarh (6 Days Complete Package):** ₹21,000 - ₹26,000 (Sedan) | ₹32,000 - ₹38,000 (Innova Crysta)

---

### 2. What Must Be Included in a Reliable Tour Cab Quote?
When booking with Bhakti Sathi, your quote always includes:
- Fuel (Diesel / Petrol)
- Commercial state entry permits for Himachal Pradesh
- Highway tolls & green cess taxes
- Driver day & night allowances + driver accommodation
- Local sightseeing in Shimla (Kufri, Mall Road) and Manali (Solang Valley, Hadimba Temple, Vashisht Hot Springs).

---

### 3. Rohtang Pass & Atal Tunnel Permits
- **Atal Tunnel (Rohtang):** Open year-round for all passenger vehicles connecting Manali to Sissu (Lahaul Valley).
- **Rohtang Pass Snow Point:** Requires an official NGT eco-permit. Our operations team arranges valid permits well in advance.`,
    category: 'Cab Rates & Tips',
    destination: 'Himachal Pradesh',
    destinationSlug: 'himachal-pradesh',
    destinationName: 'Himachal Pradesh',
    tags: ['Himachal', 'Manali', 'Shimla', 'Taxi Rates', 'Cab Booking', 'Innova'],
    author: {
      name: 'Vikram Singh',
      role: 'Fleet & Chauffeur Logistics Lead',
    },
    featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    featuredImageAlt: 'Mountain road trip with private cab in Himachal Pradesh',
    status: 'published',
    publishedAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    createdAt: '2026-08-01T12:00:00Z',
    readTimeMinutes: 4,
    viewsCount: 1980,
    likesCount: 142,
    featured: false,
    seo: {
      seoTitle: 'Himachal Taxi Rates (2026) - Chandigarh to Shimla & Manali Cabs',
      metaDescription: 'Complete price list for Delhi & Chandigarh to Shimla Manali cabs. Transparent Sedan and Innova Crysta rates with tolls included.',
      primaryKeyword: 'Himachal Taxi Rates',
      secondaryKeywords: ['Chandigarh to Shimla taxi fare', 'Manali Innova cab price', 'Himachal driver allowance'],
      canonicalUrl: 'https://mybhaktisathi.com/guide/himachal-taxi-rates-delhi-chandigarh-to-shimla-manali-guide',
    },
    faqs: [
      {
        id: 'faq-taxi-toll',
        question: 'Are highway tolls and state taxes included in Bhakti Sathi cab quotes?',
        answer: 'Yes, all toll taxes, interstate border permits, and driver charges are all-inclusive with zero surprise surcharges.',
      },
    ],
    relatedPackageIds: ['pkg-himachal-01', 'pkg-himachal-02'],
    relatedGuideSlugs: ['himachal-pradesh-devi-darshan-guide'],
  },
];

import { BlogPost, BlogCategory } from '../types/cms';

export const DEFAULT_BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-kashmir',
    name: 'Kashmir Travel Guides',
    slug: 'kashmir-travel-guides',
    description: 'Expert tips on Dal Lake houseboats, Gulmarg Gondola booking, Pahalgam valleys & seasonal snow weather.',
    icon: 'Mountain',
    postCount: 3,
  },
  {
    id: 'cat-himachal',
    name: 'Himachal & Devi Darshan',
    slug: 'himachal-and-devi-darshan',
    description: 'Complete itineraries for Manali, Shimla, Dharamshala, and sacred 9 Devi Yatra temple tours.',
    icon: 'Sparkles',
    postCount: 2,
  },
  {
    id: 'cat-tips-rates',
    name: 'Cab Rates & Travel Tips',
    slug: 'cab-rates-and-travel-tips',
    description: 'Transparent guide to taxi fares, toll permits, packing lists, and honeymoon planning advice.',
    icon: 'Car',
    postCount: 2,
  },
  {
    id: 'cat-spiritual',
    name: 'Pilgrimage & Yatra',
    slug: 'pilgrimage-and-yatra',
    description: 'Vaishno Devi SMVDSB official portal guidelines, Shivkhori cave routes, and Char Dham sacred travel advisories.',
    icon: 'Compass',
    postCount: 2,
  },
];

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-kashmir-best-time',
    slug: 'best-time-to-visit-kashmir-season-wise-guide',
    title: 'Best Time to Visit Kashmir: Month-by-Month Weather & Snow Guide (2026)',
    excerpt: 'Whether you dream of blooming tulips in spring, golden chinar leaves in autumn, or fresh powder snow in Gulmarg, here is the complete seasonal handbook.',
    content: `
# Best Time to Visit Kashmir: Complete Seasonal & Snow Travel Guide

Planning your dream holiday to Kashmir? Known poetically as *Paradise on Earth*, Jammu & Kashmir transforms with every passing season. From snow-carpeted slopes in Gulmarg to lush saffron meadows in Pampore and floating shikaras on Dal Lake, every month brings a distinct charm.

---

## 1. Kashmir in Winter (December to February): The Snow Wonderland

If your goal is to experience heavy snowfall, ride the famous **Gulmarg Gondola Phase 2**, and enjoy cozy evenings with a Kashmiri Kangri and hot Kehwa:
- **Temperature:** -2°C to 7°C (Can dip to -10°C in Gulmarg & Sonmarg).
- **Key Attractions:** Snow sports in Gulmarg, frozen Dal Lake edges in Srinagar, and pony treks across snowy pine woods in Pahalgam.
- **Insider Tip:** Always book centrally heated hotels or luxury houseboats with electric blankets and diesel generators.

---

## 2. Kashmir in Spring (March to May): Tulips & Blossom Blooms

Spring awakens Kashmir with vibrant colors:
- **Indira Gandhi Memorial Tulip Garden:** Asia's largest tulip garden opens in Srinagar during late March and April, featuring over 1.5 million blooming bulbs.
- **Weather:** Crisp, pleasant days (10°C to 20°C).
- **Must-Try:** Shikara rides across Dal and Nigeen Lakes surrounded by blossoming almond and cherry trees.

---

## 3. Kashmir in Summer (June to August): Perfect Family Vacation

Escape the scorching heat of the plains:
- **Weather:** 15°C to 30°C.
- **Highlights:** Betaab Valley, Aru Valley, Chandanwari in Pahalgam, and white-water rafting in Lidder River.
- **Family Advice:** Ideal for senior citizens and young kids who prefer mild temperatures without freezing winds.

---

## 4. Kashmir in Autumn (September to November): The Golden Chinar Season

Autumn is favored by photographers and honeymooners:
- **Visual Delight:** Saffron harvesting in Pampore and rust-golden Chinar leaves carpeting the Mughal Gardens (Nishat & Shalimar Bagh).
- **Clear Blue Skies:** Crispy mountain air and panoramic Himalayan visibility.

---

## Recommended 6-Day Itinerary Overview
1. **Day 1:** Arrival in Srinagar + Romantic Shikara Ride at Sunset
2. **Day 2:** Srinagar to Gulmarg + Phase 1 & 2 Gondola Cable Car Ride
3. **Day 3:** Gulmarg to Pahalgam via Saffron Fields & Apple Orchards
4. **Day 4:** Pahalgam Sightseeing (Aru, Betaab & Baisaran Mini Switzerland)
5. **Day 5:** Excursion to Sonmarg (Thajiwas Glacier) + Night in Luxury Houseboat
6. **Day 6:** Mughal Gardens Tour & Airport Departure

Book your customized Kashmir holiday with **Holidays Hunt** for verified 3★ to 5★ heated hotels, zero hidden costs, and dedicated chauffeur cabs!
    `,
    featuredImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=85',
    featuredImageAlt: 'Snow capped mountains and Dal Lake in Srinagar Kashmir',
    category: 'Kashmir Travel Guides',
    categorySlug: 'kashmir-travel-guides',
    tags: ['Kashmir', 'Gulmarg', 'Srinagar', 'Best Time', 'Snow', 'Houseboat'],
    author: {
      name: 'Peerzada Aadil',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Senior Kashmir Destination Lead',
      bio: 'Native of Srinagar with 12+ years of expertise crafting bespoke Himalayan holiday itineraries and VIP logistics.',
    },
    status: 'published',
    publishedAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-28T14:30:00Z',
    readTimeMinutes: 5,
    viewsCount: 3420,
    likesCount: 284,
    featured: true,
    seo: {
      focusKeyword: 'Best Time to Visit Kashmir',
      metaTitle: 'Best Time to Visit Kashmir (2026) - Snow & Weather Guide',
      metaDescription: 'Complete month-by-month guide to Kashmir weather, snowfall in Gulmarg, tulip garden timings, and recommended 6-day holiday itineraries.',
      schemaType: 'BlogPosting',
    },
    relatedDestinationSlug: 'kashmir',
    relatedTourIds: ['pkg-kashmir-honeymoon-01'],
  },
  {
    id: 'post-vaishno-devi-helicopter-guide',
    slug: 'mata-vaishno-devi-yatra-helicopter-booking-and-darshan-guide',
    title: 'Mata Vaishno Devi Yatra 2026: Helicopter Booking, RFID Card & Darshan Guide',
    excerpt: 'Official guide on booking SMVDSB helicopter tickets directly on the Shrine Board portal, RFID registration, battery cars, and Bhairon ropeway.',
    content: `
# Mata Vaishno Devi Yatra: Official Helicopter & Darshan Guide

Every year, millions of devotees embark on the sacred pilgrimage to Shri Mata Vaishno Devi Shrine nestled in the Trikuta Hills of Katra, Jammu. Here is everything you need to know for a comfortable, hassle-free yatra for your family and senior citizens.

---

## 1. Yatra Registration (Mandatory RFID Card)
- **What is RFID?** The Shri Mata Vaishno Devi Shrine Board (SMVDSB) mandates RFID tracking cards for all yatris.
- **Where to collect:** Available 24/7 at Katra Railway Station, Yatra Parchi Counters (Katra Bus Stand), and Helipad.
- **Cost:** Free of charge. Carry valid Government photo IDs (Aadhaar / Passport) for all travelers.

---

## 2. Katra to Sanjichhat Official Helicopter Booking
- **Official SMVDSB Booking Only:** Please note that in strict compliance with Shri Mata Vaishno Devi Shrine Board (SMVDSB) regulations, helicopter tickets can ONLY be booked by pilgrims directly on the official SMVDSB portal (maavaishnodeviboard.org). Beware of fake websites or unauthorized ticket sellers.
- **Helipad Location:** Katra Helipad is located 2.5 KM from Katra main market.
- **Flight Duration:** 8 minutes scenic flight over the Trikuta mountain range.
- **Sanjichhat to Bhawan:** The distance from Sanjichhat helipad to the Holy Bhawan is only 2.5 KM (approx. 35–45 minutes gentle walk, or accessible via battery car / palki).

---

## 3. Battery Car & Bhairon Ghati Passenger Ropeway
1. **Electric Battery Cars:** Operate on the Himkoti route between Ardhkuwari and Bhawan for elderly pilgrims and persons with disabilities.
2. **Bhairon Ropeway:** Connects Bhawan to Bhairon Ghati in just 3 minutes. Saves a steep 1.5 KM climb and provides panoramic valley views.

Book complete Katra + Vaishno Devi packages with dedicated cabs and verified deluxe hotels with Holidays Hunt!
    `,
    featuredImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
    featuredImageAlt: 'Mata Vaishno Devi Bhawan in Katra Trikuta Hills',
    category: 'Pilgrimage & Yatra',
    categorySlug: 'pilgrimage-and-yatra',
    tags: ['Vaishno Devi', 'Katra', 'Helicopter Yatra', 'Pilgrimage', 'Jammu'],
    author: {
      name: 'Raman Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Pilgrimage Operations Specialist',
      bio: 'Over a decade coordinating seamless Katra, Shivkhori, and Himachal Devi temple logistics.',
    },
    status: 'published',
    publishedAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    readTimeMinutes: 4,
    viewsCount: 2890,
    likesCount: 195,
    featured: true,
    seo: {
      focusKeyword: 'Mata Vaishno Devi Helicopter Booking',
      metaTitle: 'Mata Vaishno Devi Helicopter Booking & Darshan Guide (2026)',
      metaDescription: 'Step-by-step official guide on SMVDSB Katra to Sanjichhat helicopter tickets portal, RFID yatra pass, battery cars, and Bhairon Ghati ropeway.',
      schemaType: 'BlogPosting',
    },
    relatedDestinationSlug: 'amritsar',
    relatedTourIds: ['pkg-amritsar-01'],
  },
  {
    id: 'post-himachal-manali-shimla-cab-rates',
    slug: 'himachal-taxi-rates-delhi-chandigarh-to-shimla-manali-guide',
    title: 'Himachal Taxi Rates (2026): Delhi & Chandigarh to Shimla, Manali & Dharamshala',
    excerpt: 'Transparent breakdown of private sedan, Ertiga, and Innova Crysta cab fares, driver allowances, toll taxes, and Rohtang Pass permits.',
    content: `
# Himachal Taxi Rates: Complete Pricing & Vehicle Guide

Planning a road trip through Himachal Pradesh? Knowing standard cab fares and inclusions helps avoid surprises at hill checkpoints.

---

## 1. Popular Route Cab Fares (Private Dedicated Vehicle)
- **Chandigarh to Shimla (115 KM / 3.5 Hrs):** ₹2,800 - ₹3,500 (Sedan / Dzire) | ₹4,200 - ₹5,000 (Innova Crysta)
- **Chandigarh to Manali (280 KM / 7-8 Hrs via new 4-lane expressway):** ₹4,800 - ₹6,000 (Sedan) | ₹7,500 - ₹9,500 (Innova Crysta)
- **Delhi to Shimla - Manali - Chandigarh (6 Days Complete Package):** ₹21,000 - ₹26,000 (Sedan) | ₹32,000 - ₹38,000 (Innova Crysta)

---

## 2. What Must Be Included in a Honest Tour Cab Quote?
When booking with Holidays Hunt, your quote always includes:
- Fuel (Diesel / Petrol)
- Commercial state entry permits for Himachal Pradesh
- Highway tolls & green cess taxes
- Driver day & night allowances + driver accommodation
- Local sightseeing in Shimla (Kufri, Mall Road) and Manali (Solang Valley, Hadimba Temple, Vashisht Hot Springs).

---

## 3. Rohtang Pass & Atal Tunnel Permits
- **Atal Tunnel (Rohtang):** Open year-round for all passenger vehicles connecting Manali to Sissu (Lahaul Valley).
- **Rohtang Pass Snow Point:** Requires an official NGT eco-permit. Our operations team arranges valid permits well in advance.

Enjoy guaranteed clean cars, polite hill-experienced drivers, and on-time pickups with Holidays Hunt.
    `,
    featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    featuredImageAlt: 'Mountain road trip with private cab in Himachal Pradesh',
    category: 'Cab Rates & Travel Tips',
    categorySlug: 'cab-rates-and-travel-tips',
    tags: ['Himachal', 'Manali', 'Shimla', 'Taxi Rates', 'Cab Booking', 'Innova'],
    author: {
      name: 'Vikram Singh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Fleet & Chauffeur Logistics Lead',
      bio: 'Manages 60+ verified luxury cabs and hill chauffeurs across Delhi, Chandigarh, and Himachal.',
    },
    status: 'published',
    publishedAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    readTimeMinutes: 4,
    viewsCount: 1980,
    likesCount: 142,
    featured: false,
    seo: {
      focusKeyword: 'Himachal Taxi Rates',
      metaTitle: 'Himachal Taxi Rates (2026) - Chandigarh to Shimla & Manali Cabs',
      metaDescription: 'Complete price list for Delhi & Chandigarh to Shimla Manali cabs. Transparent Sedan and Innova Crysta rates with tolls included.',
      schemaType: 'BlogPosting',
    },
    relatedDestinationSlug: 'himachal',
    relatedTourIds: ['pkg-himachal-02'],
  },
];

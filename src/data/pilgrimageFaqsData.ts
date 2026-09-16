export interface CityFaq {
  question: string;
  answer: string;
}

export interface DestinationFaqs {
  id: string;
  name: string;
  region: 'North India' | 'Central & UP' | 'West & East' | 'South India';
  tagline: string;
  iconName?: string;
  faqs: CityFaq[];
}

export const PILGRIMAGE_FAQS_REGISTRY: DestinationFaqs[] = [
  {
    id: 'vaishnodevi',
    name: 'Mata Vaishno Devi (Katra)',
    region: 'North India',
    tagline: 'Holy Cave Shrine of Mata Rani in Trikuta Hills, Katra',
    faqs: [
      {
        question: 'Does Holidays Hunt sell or book Mata Vaishno Devi Helicopter tickets?',
        answer: 'NO. Holidays Hunt DOES NOT sell, resell, or book helicopter tickets for Mata Vaishno Devi. In strict compliance with Shri Mata Vaishno Devi Shrine Board (SMVDSB) regulations, helicopter tickets for Katra to Sanjichhat can ONLY be booked directly by pilgrims on the official SMVDSB website (maavaishnodeviboard.org). Beware of fraudulent agents or fake websites claiming to provide helicopter passes. Our tour packages include Katra hotel stays, private cab transfers, RFID registration assistance, and ground coordination, but helicopter tickets must be booked directly by devotees on the official portal.'
      },
      {
        question: 'What is the compulsory RFID Yatra Access Card and where do I get it?',
        answer: 'Every pilgrim must obtain a mandatory RFID Yatra Access Card before beginning the trek. It is issued free of charge at Katra Railway Station, Bus Stand, or counter near Banganga. Our driver assists your family in getting RFID cards smoothly.'
      },
      {
        question: 'What facilities are available for Senior Citizens and Elderly Pilgrims?',
        answer: 'Elderly pilgrims can utilize:\n1. Battery-operated e-cars between Ardhkuwari and Bhawan.\n2. Pre-booked Palkis (palanquins) or Ponies with fixed Shrine Board rates.\n3. Bhairon Ghati Passenger Cable Car (Ropeway) from Bhawan.\n4. Wheelchair accessible ground-floor rooms at our partner hotels in Katra.'
      },
      {
        question: 'What dining facilities are available in Katra?',
        answer: 'Katra town and the Yatra track offer a wide array of hygienic dining options, traditional sweets, and regional North Indian delicacies. Hotel dining can cater to specific guest meal preferences upon request.'
      },
      {
        question: 'What is the total trek distance from Katra to Vaishno Devi Bhawan?',
        answer: 'The trek from Banganga (Katra base) to Bhawan is approximately 12–13 KM. Walking takes 4–6 hours, pony takes 3 hours, battery car takes 30 minutes from Ardhkuwari, and helicopter takes just 8 minutes from Katra to Sanjichhat.'
      },
      {
        question: 'Is a visit to Bhairon Baba Temple mandatory to complete the Yatra?',
        answer: 'According to sacred tradition, Mata Vaishno Devi Yatra is considered complete only after paying homage at Bhairon Temple. The Bhairon Ropeway takes only 3 minutes from Bhawan to Bhairon Ghati at minimal fare.'
      },
      {
        question: 'Can we combine Mata Vaishno Devi with Shivkhori Cave or Patnitop?',
        answer: 'Yes! We offer popular combined yatra packages like Katra + Shivkhori Cave (80 KM from Katra) and Katra + Patnitop Hill Station (3D/4D itineraries) with dedicated private cab chauffeurs.'
      },
      {
        question: 'What are the best months for Mata Vaishno Devi Yatra?',
        answer: 'The shrine is open 365 days a year. March to June offers pleasant weather for families; September to November (Navratri) witnesses grand spiritual festivities; and December to February offers chilly mountain atmosphere with light snow at Bhawan.'
      }
    ]
  },
  {
    id: 'amarnath',
    name: 'Shri Amarnath Ji Yatra',
    region: 'North India',
    tagline: 'Sacred Ice Shivling Shrine in High Himalayas',
    faqs: [
      {
        question: 'What is the Compulsory Health Certificate (CHC) required for Amarnath Yatra?',
        answer: 'All pilgrims aged 13 to 70 years must obtain a Compulsory Health Certificate (CHC) issued by authorized doctors/hospitals designated by Shri Amarnathji Shrine Board (SASB) to register for the Yatra.'
      },
      {
        question: 'Which route is better: Baltal or Pahalgam?',
        answer: 'The Baltal route is shorter (14 KM trek) but steeper, ideal for quick 1-2 day yatras or helicopter flights. The Pahalgam route via Chandanwari, Sheshnag, and Panchtarni (46 KM) is traditional, scenic, and preferred for gradual acclimatization.'
      },
      {
        question: 'How does Amarnath Helicopter Yatra operate?',
        answer: 'Helicopters operate on two sectors: Neelgrath (Baltal) to Panchtarni, and Pahalgam to Panchtarni. From Panchtarni, the Holy Cave is a 6 KM trek (1.5 hours) which can be covered on foot, pony, or palki.'
      },
      {
        question: 'Are free Bhandara (Langar) meals available along the Yatra route?',
        answer: 'Yes, dozens of registered non-profit charitable organizations set up bhandaras providing hot meals, tea, dry fruits, and shelter throughout the Baltal, Pahalgam, and Panchtarni tracks free of cost.'
      },
      {
        question: 'What essential clothing and gear should pilgrims carry for Amarnath?',
        answer: 'High-altitude mountain gear is essential: thermal innerwear, heavy waterproof jackets, trek boots with anti-slip grip, raincoats, woollen socks, gloves, trek stick, and a small flask for hot water.'
      }
    ]
  },
  {
    id: 'himachal-devis',
    name: 'Himachal 5 Devi Darshan',
    region: 'North India',
    tagline: 'Mata Jwala Ji, Chintpurni, Kangra Brajeshwari, Chamunda & Naina Devi',
    faqs: [
      {
        question: 'Which sacred shrines are covered in the Himachal 5 Devi Darshan tour?',
        answer: 'The traditional circuit includes: 1. Mata Mansa Devi (Panchkula) 2. Mata Naina Devi (Bilaspur) 3. Mata Chintpurni (Una) 4. Mata Jwala Ji (Kangra) 5. Mata Brajeshwari Devi (Kangra) 6. Mata Chamunda Devi (Dharamshala).'
      },
      {
        question: 'What is the spiritual significance of the Eternal Flame at Mata Jwala Ji?',
        answer: 'Mata Jwala Ji is one of the 51 Shakti Peeths where Sati’s tongue fell. Here, natural blue flames burn continuously out of rock fissures without any fuel or oil, worshipped as the living incarnation of the Goddess.'
      },
      {
        question: 'How many days are needed for a comfortable 5 Devi Darshan with senior citizens?',
        answer: 'A 4 Nights / 5 Days or 5 Nights / 6 Days itinerary allows relaxed temple visits, easy check-ins, guided darshan assistance, and comfortable private vehicle travel without fatigue.'
      },
      {
        question: 'Are there ropeways or battery cars available at Naina Devi and Chintpurni?',
        answer: 'Yes, Mata Naina Devi features a modern passenger ropeway from the hill base to the temple top. Chintpurni and Jwala Ji offer golf cart/auto services from the parking areas for elderly devotees.'
      },
      {
        question: 'Can we add Dharamshala, McLeod Ganj, or Baijnath Shiva Temple to this yatra?',
        answer: 'Yes! Our Himachal Pilgrimage packages seamlessly include Chamunda Devi, Dharamshala (Dalai Lama Temple), and the ancient 13th-century Baijnath Shiva Temple.'
      }
    ]
  },
  {
    id: 'chardham',
    name: 'Uttarakhand Char Dham (Kedarnath & Badrinath)',
    region: 'North India',
    tagline: 'Kedarnath, Badrinath, Gangotri & Yamunotri High Himalayan Pilgrimage',
    faqs: [
      {
        question: 'Is Uttarakhand Tourist Care biometric registration mandatory for Char Dham?',
        answer: 'Yes, mandatory biometric registration is required for all pilgrims entering Uttarakhand Char Dham Yatra. Holidays Hunt registers all guests and issues valid QR yatra passes beforehand.'
      },
      {
        question: 'How do Kedarnath Helicopter bookings work from Phata, Guptkashi & Sirsi?',
        answer: 'Helicopters operate from Phata, Guptkashi, and Sirsi helipads to Kedarnath helipad (10-minute flight). Holidays Hunt secures confirmed helicopter tickets along with local yatra coordination.'
      },
      {
        question: 'What is the trek distance for Yamunotri and Kedarnath?',
        answer: 'Yamunotri trek is 6 KM from Jankichatti. Kedarnath trek is 16 KM from Gaurikund. Both tracks offer Pony, Palki (palanquin), and Kandi options for senior citizens and children.'
      },
      {
        question: 'What are the best months for Char Dham Yatra?',
        answer: 'May to June (spring window) and September to November (post-monsoon clear skies) are the best times. Shrines remain closed during peak winter snow (Nov to April).'
      },
      {
        question: 'What meal arrangements are available throughout Uttarakhand Char Dham?',
        answer: 'All major transit towns along the Yatra route (Haridwar, Rishikesh, Barkot, Uttarkashi, Guptkashi, Pipalkoti, Badrinath) provide clean, fresh hotel dining and regional local food.'
      }
    ]
  },
  {
    id: 'haridwar-rishikesh',
    name: 'Haridwar & Rishikesh (Ganga Yatra)',
    region: 'North India',
    tagline: 'Sacred Ganga Aarti at Har Ki Pauri, Mansa Devi & Rishikesh Ashrams',
    faqs: [
      {
        question: 'What is the timing of Ganga Aarti at Har Ki Pauri in Haridwar?',
        answer: 'Evening Ganga Aarti takes place at sunset (approx 6:00 PM to 7:00 PM depending on season). Arriving 45 minutes early ensures good seating near the sacred Brahmakund.'
      },
      {
        question: 'How do we visit Mansa Devi and Chandi Devi temples in Haridwar?',
        answer: 'Both hilltop temples are accessible via Udankhatola ropeway (cable car) or walking stairs. We provide combo ropeway passes for quick and comfortable visits.'
      },
      {
        question: 'Can Holidays Hunt arrange authentic Pandit pujas and Pind Daan rituals at Haridwar?',
        answer: 'Yes! We coordinate with hereditary Teerth Purohits at Har Ki Pauri for Pitru Dosh Shanti, Rudrabhishekam, Asthi Visarjan, and Ganga Puja with sacred Vedic mantras.'
      },
      {
        question: 'What are the key attractions in Rishikesh for spiritual seekers?',
        answer: 'Key highlights include Triveni Ghat Ganga Aarti, Parmarth Niketan Ashram, Ram Jhula, Lakshman Jhula, Bharat Mandir, and Shatrughna Temple.'
      }
    ]
  },
  {
    id: 'kashi-varanasi',
    name: 'Varanasi (Kashi Vishwanath)',
    region: 'Central & UP',
    tagline: 'Sacred City of Lord Shiva, Kashi Vishwanath Dham & Dashashwamedh Aarti',
    faqs: [
      {
        question: 'How does Kashi Vishwanath Sugam Darshan work?',
        answer: 'Sugam Darshan allows pilgrims convenient entry into the Kashi Vishwanath Sanctum through designated Sugam gates. Holidays Hunt assists with pre-booked Sugam Darshan passes.'
      },
      {
        question: 'How do we watch the world-famous Evening Ganga Aarti at Dashashwamedh Ghat?',
        answer: 'The best experience is from a private Bajra or motorboat anchored directly in front of Dashashwamedh Ghat on the river Ganges. We pre-book private boats for our guests.'
      },
      {
        question: 'Can we book Mangla Aarti or Rudrabhishekam at Kashi Vishwanath?',
        answer: 'Yes, Mangla Aarti (3:00 AM) and specialized Rudrabhishekam pujas are booked through the Shri Kashi Vishwanath Temple Trust portal. Our team assists in slot reservation.'
      },
      {
        question: 'Which other temples are must-visits in Varanasi?',
        answer: 'Maa Annapurna Mandir, Kaal Bhairav (Kotwal of Kashi), Sankat Mochan Hanuman Temple, Tulsi Manas Mandir, Durga Kund, and Sarnath Buddha Temple.'
      },
      {
        question: 'What famous local delicacies should we try in Varanasi?',
        answer: 'Varanasi is world-famous for its rich food culture: Banarasi Kachori Sabzi, Tamatar Chaat, Malaiyyo (winter sweet foam), Rabri, and Kulhad Meethi Lassi.'
      }
    ]
  },
  {
    id: 'ayodhya',
    name: 'Ayodhya (Shri Ram Janmabhoomi)',
    region: 'Central & UP',
    tagline: 'Birthplace of Lord Shri Ram, Magnificent Ram Mandir & Saryu Aarti',
    faqs: [
      {
        question: 'How can devotees book Sugam Darshan for Shri Ram Janmabhoomi Mandir?',
        answer: 'General darshan is free. Sugam Darshan and Aarti passes are issued by Shri Ram Janmabhoomi Teerth Kshetra Trust. We assist our guests in securing confirmed time slots.'
      },
      {
        question: 'What are the temple rules regarding electronic items inside Ram Mandir?',
        answer: 'Mobile phones, smartwatches, cameras, leather belts, and bags are strictly prohibited inside the main temple compound. Free locker counters are available outside.'
      },
      {
        question: 'What are the main places to visit in Ayodhya Sacred Circuit?',
        answer: '1. Shri Ram Janmabhoomi Mandir 2. Hanuman Garhi 3. Kanak Bhawan 4. Dashrath Mahal 5. Saryu Ghat & Evening Saryu Aarti 6. Treta Ke Thakur 7. Ram Ki Paidi.'
      },
      {
        question: 'Can we combine Ayodhya with Varanasi and Prayagraj in one trip?',
        answer: 'Yes! Our "UP Holy Trinity Yatra" (Varanasi + Prayagraj + Ayodhya, 5D/4N) is our top-selling package with private sedan/SUV chauffeurs.'
      }
    ]
  },
  {
    id: 'prayagraj',
    name: 'Prayagraj (Triveni Sangam)',
    region: 'Central & UP',
    tagline: 'Holy Confluence of Ganga, Yamuna & Saraswati Rivers',
    faqs: [
      {
        question: 'What is the significance of taking a holy dip at Triveni Sangam?',
        answer: 'Triveni Sangam is the sacred confluence of rivers Ganga, Yamuna, and subterranean Saraswati. Taking a dip here is believed to wash away sins and grant liberation (Moksha).'
      },
      {
        question: 'How do boat transfers work at Triveni Sangam?',
        answer: 'Devotees take private wooden or motorboats from VIP Ghats to the Sangam point where special wooden platforms are set up for safe bathing and rituals.'
      },
      {
        question: 'What other sacred sites should we visit in Prayagraj?',
        answer: 'Bade Hanuman Ji Temple (unique reclining Hanuman idol), Akshayavat (immortal banyan tree inside Fort), Patalpuri Temple, and Alopi Devi Shakti Peeth.'
      }
    ]
  },
  {
    id: 'mathura-vrindavan',
    name: 'Mathura & Vrindavan (Braj Bhoomi)',
    region: 'Central & UP',
    tagline: 'Shri Krishna Janmabhoomi, Bankey Bihari, Prem Mandir & Goverdhan',
    faqs: [
      {
        question: 'What are the temple timings for Bankey Bihari Ji in Vrindavan?',
        answer: 'Morning Darshan: 7:45 AM to 12:00 PM. Evening Darshan: 5:30 PM to 9:30 PM (timings shift slightly in winter/summer). Be mindful of monkeys and keep spectacles/wallets secure.'
      },
      {
        question: 'How do we visit Shri Krishna Janmabhoomi in Mathura?',
        answer: 'The prison cell (Garbha Griha) and Keshavdeo Temple complex are open daily. Strict security check is maintained; mobile phones and bags must be deposited in lockers.'
      },
      {
        question: 'What is the Goverdhan Parikrama and how can senior citizens complete it?',
        answer: 'Goverdhan Parikrama is a 21 KM sacred walk around Goverdhan Hill. For elderly pilgrims, Holidays Hunt arranges golf carts or e-rickshaws to complete the Parikrama comfortably.'
      },
      {
        question: 'What are the evening light show timings at Prem Mandir Vrindavan?',
        answer: 'The musical fountain and grand illumination at Prem Mandir take place every evening between 7:00 PM and 8:00 PM.'
      }
    ]
  },
  {
    id: 'amritsar-golden-temple',
    name: 'Golden Temple Amritsar (Harmandir Sahib)',
    region: 'North India',
    tagline: 'Sacred Sanctum of Sikhism, Durgiana Mandir & Wagah Border',
    faqs: [
      {
        question: 'What is the dress code and protocol inside the Golden Temple?',
        answer: 'Head covering is mandatory for everyone (scarves provided free at entry), shoes/socks must be deposited at Jora Ghar, and feet washed in holy water channels before entering.'
      },
      {
        question: 'Is Guru Ka Langar open 24/7 and free for everyone?',
        answer: 'Yes! The Golden Temple Langar feeds over 100,000 devotees daily regardless of religion, caste, or background with hot, wholesome traditional meals free of charge.'
      },
      {
        question: 'Which other sacred temples can we visit in Amritsar?',
        answer: 'Durgiana Temple (Shri Laxmi Narayan Mandir built in holy sarovar), Ram Tirth Temple (birthplace of Luv & Kush), and Jallianwala Bagh Memorial.'
      },
      {
        question: 'How can we watch the Wagah Border Beating Retreat Ceremony?',
        answer: 'Wagah Border is 30 KM from Amritsar. The ceremony starts around 4:30 PM. Our private cab takes you early to ensure comfortable seating in spectator stands.'
      }
    ]
  },
  {
    id: 'gujarat-dwarka-somnath',
    name: 'Gujarat Sacred Circuit (Dwarka & Somnath)',
    region: 'West & East',
    tagline: 'Dwarkadhish Mandir, Nageshwar Jyotirlinga & First Jyotirlinga Somnath',
    faqs: [
      {
        question: 'What is the significance of Dwarkadhish Temple in Char Dham Yatra?',
        answer: 'Dwarka is one of the four cardinal Char Dhams (North-Badrinath, East-Puri, South-Rameshwaram, West-Dwarka). The 52-yard flag (Dhwaja) atop Dwarkadhish temple is changed 5 times daily.'
      },
      {
        question: 'How do we reach Bet Dwarka holy island?',
        answer: 'Bet Dwarka (ancient residence of Lord Krishna) is now connected via the stunning Sudarshan Setu cable bridge, allowing smooth private vehicle access.'
      },
      {
        question: 'What are the evening highlights at Somnath Jyotirlinga Temple?',
        answer: 'The evening Ganga/Sea Aarti at 7:00 PM followed by the spectacular 3D Light & Sound Show ("Jai Somnath") on the ocean shore backdrop.'
      },
      {
        question: 'Are authentic Gujarati thalis easily available in Dwarka & Somnath?',
        answer: 'Yes, Gujarat is celebrated for its rich culinary heritage. Hotel stays and local eateries serve lavish traditional Gujarati thalis and regional specialties.'
      }
    ]
  },
  {
    id: 'ujjain-omkareshwar',
    name: 'Ujjain Mahakaleshwar & Omkareshwar',
    region: 'Central & UP',
    tagline: 'Mahakal Jyotirlinga, Bhasma Aarti, Mahakal Lok & Omkareshwar',
    faqs: [
      {
        question: 'How do devotees book the famous Bhasma Aarti at Mahakaleshwar Ujjain?',
        answer: 'Bhasma Aarti (4:00 AM) booking opens online 30 days prior on the Shri Mahakaleshwar Temple portal. Traditional Indian attire (Dhoti for men, Saree for women) is mandatory inside Garbha Griha.'
      },
      {
        question: 'What is Shri Mahakal Lok Corridor?',
        answer: 'A grand 900-meter architectural corridor featuring 108 majestic pillars, grand fountains, and 200+ statues illustrating Lord Shiva’s divine leelas.'
      },
      {
        question: 'How far is Omkareshwar Jyotirlinga from Ujjain?',
        answer: 'Omkareshwar is 140 KM (3.5 hours drive) from Ujjain. Situated on an Om-shaped island in River Narmada, devotees cross via motorboat or hanging suspension bridge.'
      }
    ]
  },
  {
    id: 'kolkata-shaktipeeth',
    name: 'Kolkata Sacred Shakti Peeths',
    region: 'West & East',
    tagline: 'Kalighat Kali Mandir, Dakshineswar & Belur Math',
    faqs: [
      {
        question: 'What are the timings and entry guide for Kalighat Kali Temple?',
        answer: 'Kalighat is one of the 51 Shakti Peeths (where Sati’s right toe fell). Temple opens 5:00 AM to 1:30 PM & 5:00 PM to 10:30 PM. We assist guests with local temple guide assistance.'
      },
      {
        question: 'How do we visit Dakshineswar Kali Temple and Belur Math together?',
        answer: 'Devotees visit Dakshineswar Temple on the banks of Hooghly River and take a serene 15-minute ferry boat ride across the river to Belur Math (Ramakrishna Mission HQ).'
      }
    ]
  },
  {
    id: 'tirupati-balaji',
    name: 'Tirupati Balaji (Tirumala)',
    region: 'South India',
    tagline: 'World Sacred Temple of Lord Venkateswara, Tirumala Hills',
    faqs: [
      {
        question: 'How do we book Rs. 300 Special Entry Darshan (SED) for Tirupati Balaji?',
        answer: 'Special Entry Darshan passes are released monthly on the official TTD (Tirumala Tirupati Devasthanams) portal. Holidays Hunt includes pre-reserved SED passes in our South Yatra packages.'
      },
      {
        question: 'What is the strict dress code enforced at Tirumala Temple?',
        answer: 'Men must wear Dhoti with Kurta/Shirt or Pyjama. Women must wear Saree, Half-Saree, or Chudidhar with Dupatta. Western clothes (jeans, t-shirts, shorts) are strictly barred.'
      },
      {
        question: 'How do devotees receive authentic TTD Laddu Prasadam?',
        answer: 'Every Rs. 300 SED ticket includes complimentary laddus. Additional laddus can be purchased at designated TTD Laddu counters in Tirumala.'
      }
    ]
  },
  {
    id: 'puri-jagannath',
    name: 'Puri Jagannath Dham',
    region: 'West & East',
    tagline: 'Shree Jagannath Temple, Mahaprasad, Konark Sun Temple & Puri Beach',
    faqs: [
      {
        question: 'What is the Mahaprasad (56 Bhog) of Lord Jagannath at Puri?',
        answer: 'Mahaprasad is cooked daily in earthenware pots inside the world’s largest temple kitchen using clay stoves and wood fire. It is available to all devotees at Ananda Bazar.'
      },
      {
        question: 'Are non-Hindus allowed inside Shree Jagannath Temple Puri?',
        answer: 'As per centuries-old temple tradition, entry inside the main temple compound is restricted to orthodox Hindus. Non-Hindu visitors can view the deity and temple spire from Raghunandan Library rooftop.'
      },
      {
        question: 'Can we visit Konark Sun Temple and Lingaraj Temple from Puri?',
        answer: 'Yes! Konark Sun Temple (UNESCO World Heritage) is 35 KM from Puri, and Lingaraj Temple in Bhubaneswar is 60 KM away, comfortably covered in day excursions.'
      }
    ]
  }
];

// Compatibility exports so existing imports don't break
export const jkFaqsDestinations = PILGRIMAGE_FAQS_REGISTRY.filter(d => d.id === 'vaishnodevi' || d.id === 'amarnath');
export const himachalFaqsDestinations = PILGRIMAGE_FAQS_REGISTRY.filter(d => d.id === 'himachal-devis' || d.id === 'chardham' || d.id === 'haridwar-rishikesh');

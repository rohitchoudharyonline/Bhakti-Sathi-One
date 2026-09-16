import { TourReview, GalleryItem } from '../types/tour';
import { resolveDisplayImage, normalizeGalleryImages } from '../utils/imageResolver';

export interface TourReviewExtended extends TourReview {
  categoryTag?: 'Family' | 'Honeymoon' | 'Friends' | 'Couple' | 'Senior Citizens';
  tourManagers?: string;
  photoThumbnail?: string;
}

export const DESTINATION_GUEST_PHOTOS: Record<string, GalleryItem[]> = {
  kashmir: [
    {
      id: 'k-1',
      url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Dal Lake shikara cruise at sunset with family',
    },
    {
      id: 'k-2',
      url: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80',
      caption: 'Snow gondola cable car ride at Apharwat Peak, Gulmarg',
    },
    {
      id: 'k-3',
      url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Pine forests and Lidder river valley in Pahalgam',
    },
    {
      id: 'k-4',
      url: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
      caption: 'Traditional heritage wooden houseboat stay on Nigeen Lake',
    },
    {
      id: 'k-5',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      caption: 'Betaab Valley lush green meadows and mountain backdrop',
    },
    {
      id: 'k-6',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
      caption: 'Snow clad peaks of Sonmarg Thajiwas Glacier',
    },
  ],
  himachal: [
    {
      id: 'h-1',
      url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      caption: 'Solang Valley paragliding and snow adventure activities',
    },
    {
      id: 'h-2',
      url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
      caption: 'Shimla Mall Road and Christ Church evening lights',
    },
    {
      id: 'h-3',
      url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Atal Tunnel drive towards Sissu waterfall, Lahaul',
    },
    {
      id: 'h-4',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      caption: 'River crossing and cedar woods in Old Manali',
    },
  ],
  rajasthan: [
    {
      id: 'r-1',
      url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      caption: 'Grand City Palace and Lake Pichola boat ride, Udaipur',
    },
    {
      id: 'r-2',
      url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      caption: 'Hawa Mahal Palace of Winds architecture, Jaipur',
    },
    {
      id: 'r-3',
      url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
      caption: 'Sam Sand Dunes desert camping and camel safari, Jaisalmer',
    },
    {
      id: 'r-4',
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      caption: 'Mehrangarh Fort majestic sunset panorama, Jodhpur',
    },
  ],
  ladakh: [
    {
      id: 'l-1',
      url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      caption: 'Deep azure Pangong Tso Lake and mountain reflection',
    },
    {
      id: 'l-2',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      caption: 'Nubra Valley double-humped camel safari at Hunder Dunes',
    },
    {
      id: 'l-3',
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      caption: 'Khardung La Pass top world motorable road milestone',
    },
  ],
  kerala: [
    {
      id: 'kl-1',
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      caption: 'Alleppey backwaters luxury houseboat cruise with traditional meals',
    },
    {
      id: 'kl-2',
      url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      caption: 'Munnar sprawling tea plantation rolling hills',
    },
  ],
  default: [
    {
      id: 'd-1',
      url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Scenic holiday tour destination overview',
    },
    {
      id: 'd-2',
      url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Comfortable hotel stay and sightseeing points',
    },
    {
      id: 'd-3',
      url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      caption: 'Group traveler photo with dedicated trip manager',
    },
  ],
};

export const SAMPLE_TOUR_REVIEWS: TourReviewExtended[] = [
  {
    id: 'rev-01',
    author: 'Bhagyashri & Family',
    rating: 5,
    date: 'Jul, 2026',
    categoryTag: 'Family',
    tourManagers: 'Santosh Dhamke, Saurabh Shinde',
    photoThumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    location: 'Mumbai, Maharashtra',
    verified: true,
    text: 'It was a great vacation planned by Holidays Hunt. The team was constantly in touch with us from Day 1. The tour managers and our dedicated cab chauffeur were extremely polite and ensured this tour was a grand success. Every sightseeing spot listed was covered on time with generous leisure intervals. The hotels were 4-star verified and reflected authentic local culture. Highly recommend Holidays Hunt!',
  },
  {
    id: 'rev-02',
    author: 'Vijay & Snehal Patil',
    rating: 5,
    date: 'Aug, 2026',
    categoryTag: 'Couple',
    tourManagers: 'Dipesh Ugale, Showkat Ahmad',
    photoThumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    location: 'Pune, Maharashtra',
    verified: true,
    text: 'Unforgettable holiday experience with Holidays Hunt! We completed our trip smoothly and memorably. The hotel stays, delicious meals, and comfortable private vehicle were exceptional. Our tour coordinator and chauffeur took wonderful care of our family. Heartfelt thanks to the Holidays Hunt team!',
  },
  {
    id: 'rev-03',
    author: 'Dr. Rajesh Sharma & Dr. Sunita Sharma',
    rating: 5,
    date: 'Jun, 2026',
    categoryTag: 'Honeymoon',
    tourManagers: 'Tariq Lone, Rahul Verma',
    photoThumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    location: 'New Delhi',
    verified: true,
    text: 'Seamless experience! The private cab was impeccably clean, sanitized, and our driver was gentle and knowledgeable. The houseboat stay on Dal Lake and the mountain resort in Pahalgam exceeded our expectations. No surprise charges, zero hassles. 5 stars without hesitation!',
  },
  {
    id: 'rev-04',
    author: 'Ananya Deshmukh & Friends',
    rating: 5,
    date: 'May, 2026',
    categoryTag: 'Friends',
    tourManagers: 'Aamir Sheikh, Rohit Jadhav',
    photoThumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    location: 'Nagpur, Maharashtra',
    verified: true,
    text: 'Our college reunion trip was organized to perfection. Adventure sports, campfire dinner, local shopping recommendations, and smooth airport transfers. Special thanks to the 24x7 WhatsApp coordination desk who assisted us anytime we needed.',
  },
  {
    id: 'rev-05',
    author: 'Col. K. S. Rathore (Retd.)',
    rating: 5,
    date: 'Apr, 2026',
    categoryTag: 'Senior Citizens',
    tourManagers: 'Bashir Ahmed, Manoj Kulkarni',
    photoThumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    location: 'Jaipur, Rajasthan',
    verified: true,
    text: 'We were traveling with senior citizen parents and were concerned about high altitudes and cold weather. The team provided oxygen backup, heated hotel rooms, and adjusted the pace gently. Punctual, courteous, and trustworthy agency.',
  },
];

export function getPackageGalleryPhotos(
  destination: string,
  customGallery?: GalleryItem[],
  coverImage?: string,
  mediaAssets?: any
): GalleryItem[] {
  const normalized = normalizeGalleryImages(customGallery, coverImage, mediaAssets);
  const result: GalleryItem[] = [...normalized];
  const seenUrls = new Set(result.map((r) => r.url));

  const destLower = (destination || '').toLowerCase();
  let baseList: GalleryItem[] = DESTINATION_GUEST_PHOTOS.kashmir;
  if (destLower.includes('kashmir') || destLower.includes('srinagar') || destLower.includes('gulmarg') || destLower.includes('pahalgam')) {
    baseList = DESTINATION_GUEST_PHOTOS.kashmir;
  } else if (destLower.includes('himachal') || destLower.includes('manali') || destLower.includes('shimla') || destLower.includes('dharamshala')) {
    baseList = DESTINATION_GUEST_PHOTOS.himachal;
  } else if (destLower.includes('rajasthan') || destLower.includes('jaipur') || destLower.includes('udaipur') || destLower.includes('jaisalmer')) {
    baseList = DESTINATION_GUEST_PHOTOS.rajasthan;
  } else if (destLower.includes('ladakh') || destLower.includes('leh') || destLower.includes('pangong')) {
    baseList = DESTINATION_GUEST_PHOTOS.ladakh;
  } else if (destLower.includes('kerala') || destLower.includes('munnar') || destLower.includes('alleppey')) {
    baseList = DESTINATION_GUEST_PHOTOS.kerala;
  }

  baseList.forEach((g) => {
    const resolved = resolveDisplayImage(g.url, mediaAssets);
    if (resolved && !seenUrls.has(resolved) && !seenUrls.has(g.url)) {
      seenUrls.add(resolved);
      result.push({
        ...g,
        url: resolved,
      });
    }
  });

  return result;
}

export function getPackageReviews(pkgTitle: string, customReviews?: TourReview[]): TourReviewExtended[] {
  if (customReviews && customReviews.length > 0) {
    return customReviews.map((r, i) => ({
      ...r,
      categoryTag: (['Family', 'Couple', 'Honeymoon', 'Friends'][i % 4] as any) || 'Family',
      tourManagers: 'Santosh Dhamke, Showkat Ahmad',
      photoThumbnail: SAMPLE_TOUR_REVIEWS[i % SAMPLE_TOUR_REVIEWS.length]?.photoThumbnail,
    }));
  }

  return SAMPLE_TOUR_REVIEWS.map(rev => ({
    ...rev,
    text: rev.text.replace(/Rajasthan|Kashmir/gi, pkgTitle.split(':')[0].trim()),
  }));
}

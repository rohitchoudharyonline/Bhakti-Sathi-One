import {
  BookingInquiry,
  HOTEL_CATEGORY_OPTIONS,
  HotelStarCategory,
  HotelStay,
  HotelTierKey,
  TourPackage,
} from '../types/tour';

export type HotelCategoryOption = (typeof HOTEL_CATEGORY_OPTIONS)[number];

export function normalizeHotelStar(val: unknown): 2 | 3 | 4 | 5 | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string') {
    const low = val.trim().toLowerCase();
    if (!low) return null;
    if (low === 'budget' || low === 'star2' || low === '2-star' || low === '2 star') return 2;
    if (low === 'star3' || low === '3-star' || low === '3 star') return 3;
    if (low === 'star4' || low === '4-star' || low === '4 star') return 4;
    if (low === 'star5' || low === '5-star' || low === '5 star') return 5;
  }
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return null;
  const clamped = Math.min(5, Math.max(2, Math.round(n)));
  return clamped as 2 | 3 | 4 | 5;
}

export function getHotelCategoryOptionByStar(star: unknown): HotelCategoryOption | undefined {
  const norm = normalizeHotelStar(star);
  if (!norm) return undefined;
  return HOTEL_CATEGORY_OPTIONS.find((opt) => opt.starRating === norm);
}

export function getHotelCategoryOptionByKey(keyOrValue: unknown): HotelCategoryOption | undefined {
  if (!keyOrValue || typeof keyOrValue !== 'string') return undefined;
  const low = keyOrValue.trim().toLowerCase();
  if (!low) return undefined;
  const direct = HOTEL_CATEGORY_OPTIONS.find(
    (opt) =>
      opt.key.toLowerCase() === low ||
      opt.value.toLowerCase() === low ||
      opt.label.toLowerCase() === low ||
      opt.tierName.toLowerCase() === low
  );
  if (direct) return direct;
  if (low.includes('budget') || low === 'star2' || low.includes('2-star') || low.includes('2 star')) {
    return HOTEL_CATEGORY_OPTIONS[0];
  }
  if (low.includes('3')) return HOTEL_CATEGORY_OPTIONS[1];
  if (low.includes('4')) return HOTEL_CATEGORY_OPTIONS[2];
  if (low.includes('5')) return HOTEL_CATEGORY_OPTIONS[3];
  return undefined;
}

export function formatHotelCategoryLabel(starOrKey: unknown): string {
  const byKey = typeof starOrKey === 'string' ? getHotelCategoryOptionByKey(starOrKey) : undefined;
  if (byKey) return byKey.label;
  const byStar = getHotelCategoryOptionByStar(starOrKey);
  return byStar ? byStar.label : '';
}

export function getPackageAvailableTiers(pkg?: TourPackage | null): HotelCategoryOption[] {
  if (!pkg) return [];

  const taggedHotelStars = new Set<number>(
    (pkg.hotels || [])
      .map((h) => normalizeHotelStar(h.starRating))
      .filter((s): s is 2 | 3 | 4 | 5 => s !== null)
  );

  const isLegacyNamedTier = (tier: any) =>
    Boolean(
      tier &&
        tier.enabled !== false &&
        typeof tier.hotelNames === 'string' &&
        tier.hotelNames.trim().length > 0 &&
        (Number(tier.discountedPrice || 0) > 0 || Number(tier.price || 0) > 0)
    );

  return HOTEL_CATEGORY_OPTIONS.filter((opt) => {
    const tier = pkg.pricingTiers?.[opt.key];
    if (taggedHotelStars.size > 0) {
      return (
        taggedHotelStars.has(opt.starRating) ||
        Boolean(tier && tier.enabled === true && typeof tier.hotelNames === 'string' && tier.hotelNames.trim().length > 0)
      );
    }
    return Boolean(tier && tier.enabled === true) || isLegacyNamedTier(tier);
  });
}

export function getHotelsForTier(
  pkg?: TourPackage | null,
  tierKey?: HotelTierKey | HotelStarCategory | string | null
): HotelStay[] {
  const allHotels = pkg?.hotels || [];
  if (allHotels.length === 0) return [];
  if (!tierKey) return allHotels;

  const opt = getHotelCategoryOptionByKey(tierKey);
  if (!opt) return allHotels;

  const hasTaggedHotels = allHotels.some((h) => normalizeHotelStar(h.starRating) !== null);
  if (!hasTaggedHotels) return allHotels;

  return allHotels.filter((h) => normalizeHotelStar(h.starRating) === opt.starRating);
}

export function getTierUnitPrice(
  pkg?: TourPackage | null,
  tierKey?: HotelTierKey | string | null
): { unitPrice: number; isPriceOnRequest: boolean } {
  if (!pkg) return { unitPrice: 15000, isPriceOnRequest: false };

  const baseRaw = Number(pkg.discountedPrice || pkg.price || 0);
  const basePor = Boolean(pkg.priceOnRequest) || baseRaw <= 0;

  if (!tierKey) {
    return { unitPrice: basePor ? 0 : baseRaw, isPriceOnRequest: basePor };
  }

  const opt = getHotelCategoryOptionByKey(tierKey);
  const tierObj = opt ? pkg.pricingTiers?.[opt.key] : undefined;
  if (tierObj && tierObj.enabled !== false) {
    const tierDiscounted = Number(tierObj.discountedPrice || 0);
    const tierPrice = Number(tierObj.price || 0);
    const hasOwnPrice = tierDiscounted > 0 || tierPrice > 0;
    const isPor = tierObj.priceOnRequest === true || (!hasOwnPrice && basePor);
    if (hasOwnPrice && !tierObj.priceOnRequest) {
      return {
        unitPrice: tierDiscounted > 0 ? tierDiscounted : tierPrice,
        isPriceOnRequest: false,
      };
    }
    return {
      unitPrice: isPor ? 0 : baseRaw,
      isPriceOnRequest: isPor,
    };
  }

  return { unitPrice: basePor ? 0 : baseRaw, isPriceOnRequest: basePor };
}

export function formatHotelsTextForTier(
  pkg?: TourPackage | null,
  tierKey?: HotelTierKey | string | null
): string {
  if (!pkg) return 'Handpicked Deluxe Hotels with Mountain View\n1 Night Luxury Houseboat Stay';

  const opt = tierKey ? getHotelCategoryOptionByKey(tierKey) : undefined;
  const filteredHotels = getHotelsForTier(pkg, opt?.key || tierKey);

  if (filteredHotels.length > 0) {
    return filteredHotels
      .map((h) => {
        const loc = (h.location || h.city || '').trim();
        const alt = h.alternativeHotel ? ` / ${h.alternativeHotel.trim()}` : '';
        const catLabel = formatHotelCategoryLabel(h.starRating) || (opt ? opt.label : '');
        const catSuffix = catLabel ? ` (${catLabel})` : '';
        const nightsSuffix = h.nights ? ` - ${h.nights}N` : '';
        return `${loc ? `${loc}: ` : ''}${h.name}${alt}${catSuffix}${nightsSuffix}`;
      })
      .join('\n');
  }

  if (opt && pkg.pricingTiers?.[opt.key]) {
    const tierData = pkg.pricingTiers[opt.key];
    if (tierData?.hotelNames && tierData.hotelNames.trim()) {
      return tierData.hotelNames
        .split(/[\r\n]+/)
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string) => (line.toLowerCase().includes(opt.label.toLowerCase()) ? line : `${line} (${opt.label})`))
        .join('\n');
    }
    if (Array.isArray(tierData?.hotels) && tierData.hotels.length > 0) {
      return tierData.hotels.join('\n');
    }
  }

  if (pkg.hotels && pkg.hotels.length === 0 && pkg.pricingTiers) {
    const legacyTier = pkg.pricingTiers.deluxe || pkg.pricingTiers.standard || pkg.pricingTiers.luxury;
    if (legacyTier?.hotels?.length) {
      return legacyTier.hotels.join('\n');
    }
  }

  if (opt) {
    return `${opt.label} Category Verified Hotels`;
  }

  return 'Handpicked Deluxe Stays with Mountain View\n1 Night Luxury Houseboat Stay';
}

export function detectTierFromInquiry(
  inq?: Partial<BookingInquiry> | null,
  pkg?: TourPackage | null
): HotelTierKey | undefined {
  const available = getPackageAvailableTiers(pkg);
  const candidates: string[] = [];

  if (inq?.quotation?.hotelTierKey) candidates.push(inq.quotation.hotelTierKey);
  if (inq?.quotation?.hotelCategory) candidates.push(inq.quotation.hotelCategory);

  const req = inq?.specialRequests || '';
  const reqMatch = req.match(/Selected Hotel Category:\s*([^.\n]+)/i);
  if (reqMatch?.[1]) candidates.push(reqMatch[1].trim());

  const titleMatch = (inq?.packageTitle || '').match(/\[([^\]]+)\]/);
  if (titleMatch?.[1]) candidates.push(titleMatch[1].trim());

  for (const cand of candidates) {
    const opt = getHotelCategoryOptionByKey(cand);
    if (opt) {
      if (available.length === 0 || available.some((a) => a.key === opt.key)) {
        return opt.key;
      }
    }
  }

  return available[0]?.key;
}

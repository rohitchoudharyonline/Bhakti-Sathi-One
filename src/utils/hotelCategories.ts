import {
  BookingInquiry,
  HOTEL_CATEGORY_OPTIONS,
  HotelStarCategory,
  HotelStay,
  HotelTierKey,
  ProposalHotelEntry,
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

  const quotationCandidates = [inq?.quotation?.hotelTierKey, inq?.quotation?.hotelCategory].filter(
    (v): v is string => Boolean(v && String(v).trim())
  );
  for (const cand of quotationCandidates) {
    const opt = getHotelCategoryOptionByKey(cand);
    if (opt) return opt.key;
  }

  const candidates: string[] = [];
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

export interface ResolvedDayStay {
  hotelName: string;
  alternativeHotel?: string;
  location: string;
  categoryLabel: string;
  starRating: 2 | 3 | 4 | 5 | null;
  verified: true;
  isCheckoutDay?: boolean;
}

interface StayCandidate {
  name: string;
  alternativeHotel?: string;
  location: string;
  nights: number;
  starRating: 2 | 3 | 4 | 5 | null;
  categoryLabel: string;
}

const parseRawHotelLines = (input: string): string[] => {
  const str = String(input || '').trim();
  if (!str) return [];
  let rawList: string[] = [];
  if (str.includes('\n')) {
    rawList = str.split(/\r?\n/);
  } else if (str.includes(';')) {
    rawList = str.split(/;/);
  } else if (/,\s*[A-Za-z0-9\s]+:/.test(str)) {
    rawList = str.split(/,\s*(?=[A-Za-z0-9\s]+:)/);
  } else if (str.includes(',') && !str.includes('(')) {
    const parts = str.split(/,\s*/);
    rawList =
      parts.length > 1 && parts.every((p) => p.trim().length > 0 && p.trim().length < 60)
        ? parts
        : [str];
  } else {
    rawList = [str];
  }
  return rawList.map((s) => s.replace(/^[-•*●\d+.)]\s*/, '').trim()).filter(Boolean);
};

const matchesDayLocation = (dayLocation?: string, hotelLocation?: string): boolean => {
  const d = (dayLocation || '').toLowerCase().trim();
  const h = (hotelLocation || '').toLowerCase().trim();
  if (!d || !h) return false;
  if (d.includes(h) || h.includes(d)) return true;
  const hTokens = h.split(/[\s,/()-]+/).filter((t) => t.length >= 4);
  return hTokens.some((tok) => d.includes(tok));
};

export function parseHotelsTextToEntries(
  hotelsText?: string,
  pkg?: TourPackage | null,
  tierKeyOrLabel?: HotelTierKey | string | null
): ProposalHotelEntry[] {
  const defaultOpt = getHotelCategoryOptionByKey(tierKeyOrLabel);
  const tierPkgConfig = defaultOpt ? pkg?.pricingTiers?.[defaultOpt.key] : undefined;
  const tierHotels = getHotelsForTier(pkg, defaultOpt?.key || tierKeyOrLabel);
  const rawLines = parseRawHotelLines(hotelsText || '');

  return rawLines.map((rawLine, idx) => {
    const normalizedLine = rawLine
      .replace(/\(2[\s-]*Star\)/gi, '(Budget)')
      .replace(/\b2[\s-]*Star\b/gi, 'Budget');
    const lineLower = normalizedLine.toLowerCase();
    const matched = tierHotels.find(
      (h) => h.name && lineLower.includes(h.name.trim().toLowerCase())
    );
    if (matched) {
      const star = normalizeHotelStar(matched.starRating) || defaultOpt?.starRating || undefined;
      return {
        id: matched.id || `prop-hotel-${idx}-${Date.now().toString(36)}`,
        name: matched.name,
        alternativeHotel: matched.alternativeHotel || '',
        location: matched.location || matched.city || pkg?.destination || '',
        nights: Math.max(1, Number(matched.nights || 1)),
        roomType: matched.roomType || tierPkgConfig?.roomType || 'Deluxe Room',
        mealPlan: matched.mealPlan || tierPkgConfig?.mealPlan || 'Daily Breakfast & Dinner Included',
        starRating: star,
        amenities: matched.amenities,
      };
    }

    const colonIdx = normalizedLine.indexOf(':');
    const locPart = colonIdx > 0 && colonIdx < 28 ? normalizedLine.slice(0, colonIdx).trim() : '';
    let restPart =
      colonIdx > 0 && colonIdx < 28 ? normalizedLine.slice(colonIdx + 1).trim() : normalizedLine.trim();
    const nightsMatch = restPart.match(/\s*[-–]\s*(\d+)\s*N(?:ights?)?\b/i);
    const parsedNights = nightsMatch ? Math.max(1, Number(nightsMatch[1])) : 1;
    if (nightsMatch) restPart = restPart.replace(nightsMatch[0], '').trim();
    const catMatch = restPart.match(/\((Budget|3[\s-]*Star|4[\s-]*Star|5[\s-]*Star)\)/i);
    const parsedStar =
      (catMatch ? normalizeHotelStar(catMatch[1]) : null) || defaultOpt?.starRating || undefined;
    if (catMatch) restPart = restPart.replace(catMatch[0], '').trim();

    const slashParts = restPart.split(/\s*\/\s*/);
    const primaryName = slashParts[0]?.trim() || restPart || normalizedLine;
    const altName =
      slashParts.length > 1 && !/^similar$/i.test(slashParts[1].trim())
        ? slashParts.slice(1).join(' / ').trim()
        : '';

    return {
      id: `prop-hotel-${idx}-${Date.now().toString(36)}`,
      name: primaryName,
      alternativeHotel: altName,
      location: locPart || pkg?.destination || '',
      nights: parsedNights,
      roomType: tierPkgConfig?.roomType || 'Deluxe Room',
      mealPlan: tierPkgConfig?.mealPlan || 'Daily Breakfast & Dinner Included',
      starRating: parsedStar,
    };
  });
}

export function buildProposalHotelEntriesForTier(
  pkg?: TourPackage | null,
  tierKeyOrLabel?: HotelTierKey | string | null
): ProposalHotelEntry[] {
  const opt = getHotelCategoryOptionByKey(tierKeyOrLabel);
  const tierPkgConfig = opt ? pkg?.pricingTiers?.[opt.key] : undefined;
  const tierHotels = getHotelsForTier(pkg, opt?.key || tierKeyOrLabel);

  if (tierHotels.length > 0) {
    return tierHotels.map((h, idx) => ({
      id: h.id || `prop-hotel-${idx}-${Date.now().toString(36)}`,
      name: h.name || '',
      alternativeHotel: h.alternativeHotel || '',
      location: (h.location || h.city || pkg?.destination || '').trim(),
      nights: Math.max(1, Number(h.nights || 1)),
      roomType: h.roomType || tierPkgConfig?.roomType || 'Deluxe Room',
      mealPlan: h.mealPlan || tierPkgConfig?.mealPlan || 'Daily Breakfast & Dinner Included',
      starRating: normalizeHotelStar(h.starRating) || opt?.starRating || undefined,
      amenities: h.amenities,
    }));
  }

  // Check legacy pricingTier hotelNames / hotels array
  if (tierPkgConfig?.hotelNames && tierPkgConfig.hotelNames.trim()) {
    const parsed = parseHotelsTextToEntries(tierPkgConfig.hotelNames, pkg, opt?.key || tierKeyOrLabel);
    if (parsed.length > 0) return parsed;
  }
  if (Array.isArray(tierPkgConfig?.hotels) && tierPkgConfig.hotels.length > 0) {
    const parsed = parseHotelsTextToEntries(tierPkgConfig.hotels.join('\n'), pkg, opt?.key || tierKeyOrLabel);
    if (parsed.length > 0) return parsed;
  }

  // No hotels uploaded in this category (e.g. 4-Star / 5-Star): pre-seed blank slots using tour's location/night blueprint
  const availableTiers = getPackageAvailableTiers(pkg);
  const blueprintHotels =
    availableTiers.length > 0 ? getHotelsForTier(pkg, availableTiers[0].key) : (pkg?.hotels || []);

  if (blueprintHotels.length > 0) {
    return blueprintHotels.map((h, idx) => ({
      id: `prop-custom-${idx}-${Date.now().toString(36)}`,
      name: '',
      alternativeHotel: '',
      location: (h.location || h.city || pkg?.destination || '').trim(),
      nights: Math.max(1, Number(h.nights || 1)),
      roomType: tierPkgConfig?.roomType || h.roomType || 'Deluxe Room',
      mealPlan: tierPkgConfig?.mealPlan || h.mealPlan || 'Daily Breakfast & Dinner Included',
      starRating: opt?.starRating || undefined,
    }));
  }

  return [
    {
      id: `prop-custom-0-${Date.now().toString(36)}`,
      name: '',
      alternativeHotel: '',
      location: pkg?.destination || '',
      nights: Math.max(1, Number(pkg?.durationNights || 1)),
      roomType: tierPkgConfig?.roomType || 'Deluxe Room',
      mealPlan: tierPkgConfig?.mealPlan || 'Daily Breakfast & Dinner Included',
      starRating: opt?.starRating || undefined,
    },
  ];
}

export function serializeProposalHotelEntries(
  entries: ProposalHotelEntry[],
  fallbackCategoryLabel?: string
): string {
  return (entries || [])
    .filter((e) => e.name && e.name.trim().length > 0)
    .map((e) => {
      const loc = (e.location || '').trim();
      const alt = e.alternativeHotel && e.alternativeHotel.trim() ? ` / ${e.alternativeHotel.trim()}` : '';
      const catLabel = formatHotelCategoryLabel(e.starRating) || fallbackCategoryLabel || '';
      const catSuffix = catLabel ? ` (${catLabel})` : '';
      const nightsSuffix = e.nights ? ` - ${e.nights}N` : '';
      return `${loc ? `${loc}: ` : ''}${e.name.trim()}${alt}${catSuffix}${nightsSuffix}`;
    })
    .join('\n');
}

export function resolveItineraryDayStays(
  pkg?: TourPackage | null,
  hotelsText?: string,
  tierKeyOrLabel?: HotelTierKey | string | null,
  hotelEntries?: ProposalHotelEntry[]
): Record<number, ResolvedDayStay> {
  const days = pkg?.itinerary || [];
  if (days.length === 0) return {};

  const defaultOpt = getHotelCategoryOptionByKey(tierKeyOrLabel);
  const tierHotels = getHotelsForTier(pkg, defaultOpt?.key || tierKeyOrLabel);
  const parsedLines = parseRawHotelLines(hotelsText || '');

  const candidates: StayCandidate[] = [];

  const validEntries = (hotelEntries || []).filter((e) => e.name && e.name.trim().length > 0);
  if (validEntries.length > 0) {
    for (const entry of validEntries) {
      const star = normalizeHotelStar(entry.starRating) || defaultOpt?.starRating || null;
      candidates.push({
        name: entry.name.trim(),
        alternativeHotel: entry.alternativeHotel?.trim() || undefined,
        location: (entry.location || pkg?.destination || '').trim(),
        nights: Math.max(1, Number(entry.nights || 1)),
        starRating: star,
        categoryLabel: formatHotelCategoryLabel(star) || defaultOpt?.label || '',
      });
    }
  } else if (parsedLines.length > 0) {
    for (const rawLine of parsedLines) {
      const normalizedLine = rawLine
        .replace(/\(2[\s-]*Star\)/gi, '(Budget)')
        .replace(/\b2[\s-]*Star\b/gi, 'Budget');
      const lineLower = normalizedLine.toLowerCase();
      const matched = tierHotels.find(
        (h) => h.name && lineLower.includes(h.name.trim().toLowerCase())
      );
      if (matched) {
        const star = normalizeHotelStar(matched.starRating) || defaultOpt?.starRating || null;
        const catLabel = formatHotelCategoryLabel(star) || defaultOpt?.label || '';
        candidates.push({
          name: matched.name,
          alternativeHotel: matched.alternativeHotel,
          location: matched.location || matched.city || pkg?.destination || '',
          nights: Math.max(1, Number(matched.nights || 1)),
          starRating: star,
          categoryLabel: catLabel,
        });
      } else {
        const colonIdx = normalizedLine.indexOf(':');
        const locPart = colonIdx > 0 && colonIdx < 28 ? normalizedLine.slice(0, colonIdx).trim() : '';
        let restPart =
          colonIdx > 0 && colonIdx < 28
            ? normalizedLine.slice(colonIdx + 1).trim()
            : normalizedLine.trim();
        const nightsMatch = restPart.match(/\s*[-–]\s*(\d+)\s*N(?:ights?)?\b/i);
        const parsedNights = nightsMatch ? Math.max(1, Number(nightsMatch[1])) : 1;
        if (nightsMatch) restPart = restPart.replace(nightsMatch[0], '').trim();
        const catMatch = restPart.match(/\((Budget|3[\s-]*Star|4[\s-]*Star|5[\s-]*Star)\)/i);
        const parsedStar =
          (catMatch ? normalizeHotelStar(catMatch[1]) : null) || defaultOpt?.starRating || null;
        if (catMatch) restPart = restPart.replace(catMatch[0], '').trim();

        const slashParts = restPart.split(/\s*\/\s*/);
        const primaryName = slashParts[0]?.trim() || restPart || normalizedLine;
        const altName =
          slashParts.length > 1 && !/^similar$/i.test(slashParts[1].trim())
            ? slashParts.slice(1).join(' / ').trim()
            : undefined;

        candidates.push({
          name: primaryName,
          alternativeHotel: altName,
          location: locPart || pkg?.destination || '',
          nights: parsedNights,
          starRating: parsedStar,
          categoryLabel: formatHotelCategoryLabel(parsedStar) || defaultOpt?.label || '',
        });
      }
    }
  } else if (tierHotels.length > 0) {
    for (const h of tierHotels) {
      const star = normalizeHotelStar(h.starRating) || defaultOpt?.starRating || null;
      candidates.push({
        name: h.name,
        alternativeHotel: h.alternativeHotel,
        location: h.location || h.city || pkg?.destination || '',
        nights: Math.max(1, Number(h.nights || 1)),
        starRating: star,
        categoryLabel: formatHotelCategoryLabel(star) || defaultOpt?.label || '',
      });
    }
  } else {
    candidates.push({
      name: defaultOpt ? `${defaultOpt.label} Verified Hotel` : 'Verified Comfort Hotel',
      location: pkg?.destination || '',
      nights: Math.max(1, days.length - 1),
      starRating: defaultOpt?.starRating || null,
      categoryLabel: defaultOpt?.label || '',
    });
  }

  // Expand cumulative night slots when hotel nights sum up meaningfully
  const nightSlots: StayCandidate[] = [];
  for (const cand of candidates) {
    const count = Math.max(1, cand.nights || 1);
    for (let n = 0; n < count; n++) {
      nightSlots.push(cand);
    }
  }

  const requiredNights = Math.max(1, days.length - 1);
  const nightsCoverTour = nightSlots.length >= requiredNights && candidates.some((c) => c.nights > 1 || candidates.length >= requiredNights);

  const result: Record<number, ResolvedDayStay> = {};

  days.forEach((day, idx) => {
    const isLastDay = idx === days.length - 1 && days.length > 1;
    const isDepartureLike =
      isLastDay &&
      /depart|drop|check[- ]?out|airport|station|return/i.test(
        `${day.title || ''} ${day.description || ''}`
      );

    let chosen: StayCandidate | undefined;

    if (nightsCoverTour) {
      chosen = nightSlots[idx] || nightSlots[nightSlots.length - 1];
    } else {
      const locMatches = candidates.filter((c) => matchesDayLocation(day.location, c.location));
      if (locMatches.length === 1) {
        chosen = locMatches[0];
      } else if (locMatches.length > 1) {
        const ratio = idx / Math.max(1, days.length - 1);
        const pickIdx = Math.min(locMatches.length - 1, Math.floor(ratio * locMatches.length));
        chosen = locMatches[pickIdx];
      } else {
        const denom = Math.max(1, days.length > 1 ? days.length - 1 : 1);
        const pickIdx = Math.min(candidates.length - 1, Math.floor((idx / denom) * candidates.length));
        chosen = candidates[pickIdx];
      }
    }

    const fallbackCand = chosen || candidates[0];
    result[day.dayNumber] = {
      hotelName: fallbackCand.name,
      alternativeHotel: fallbackCand.alternativeHotel,
      location: fallbackCand.location || day.location || pkg?.destination || '',
      categoryLabel: fallbackCand.categoryLabel || defaultOpt?.label || 'Verified',
      starRating: fallbackCand.starRating ?? defaultOpt?.starRating ?? null,
      verified: true,
      isCheckoutDay: isDepartureLike && idx >= nightSlots.length,
    };
  });

  return result;
}

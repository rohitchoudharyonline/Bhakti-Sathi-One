export interface ZodiacSign {
  id: string;
  name: string;
  english: string;
  symbol: string;
  dates: string;
  accent: string;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'mesha', name: 'Aries (Mesha)', english: 'Aries', symbol: '♈', dates: 'Mar 21 – Apr 19', accent: '#FF4B00' },
  { id: 'vrishabha', name: 'Taurus (Vrishabha)', english: 'Taurus', symbol: '♉', dates: 'Apr 20 – May 20', accent: '#B45309' },
  { id: 'mithuna', name: 'Gemini (Mithuna)', english: 'Gemini', symbol: '♊', dates: 'May 21 – Jun 20', accent: '#7C3AED' },
  { id: 'karka', name: 'Cancer (Karka)', english: 'Cancer', symbol: '♋', dates: 'Jun 21 – Jul 22', accent: '#2563EB' },
  { id: 'simha', name: 'Leo (Simha)', english: 'Leo', symbol: '♌', dates: 'Jul 23 – Aug 22', accent: '#D97706' },
  { id: 'kanya', name: 'Virgo (Kanya)', english: 'Virgo', symbol: '♍', dates: 'Aug 23 – Sep 22', accent: '#15803D' },
  { id: 'tula', name: 'Libra (Tula)', english: 'Libra', symbol: '♎', dates: 'Sep 23 – Oct 22', accent: '#DB2777' },
  { id: 'vrishchika', name: 'Scorpio (Vrishchika)', english: 'Scorpio', symbol: '♏', dates: 'Oct 23 – Nov 21', accent: '#BE123C' },
  { id: 'dhanu', name: 'Sagittarius (Dhanu)', english: 'Sagittarius', symbol: '♐', dates: 'Nov 22 – Dec 21', accent: '#9333EA' },
  { id: 'makara', name: 'Capricorn (Makara)', english: 'Capricorn', symbol: '♑', dates: 'Dec 22 – Jan 19', accent: '#475569' },
  { id: 'kumbha', name: 'Aquarius (Kumbha)', english: 'Aquarius', symbol: '♒', dates: 'Jan 20 – Feb 18', accent: '#0369A1' },
  { id: 'meena', name: 'Pisces (Meena)', english: 'Pisces', symbol: '♓', dates: 'Feb 19 – Mar 20', accent: '#0F766E' },
];

export interface HoroscopeContent {
  overview: string;
  career: string;
  finance: string;
  health: string;
  love: string;
  family: string;
  luckyNumber: string;
  luckyColor: string;
  remedy: string;
  mantra: string;
  auspiciousWindow: string;
}

const FALLBACK: Record<string, HoroscopeContent> = Object.fromEntries(ZODIAC_SIGNS.map((sign, index) => [sign.id, {
  overview: `Today indicates positive momentum and clarity for ${sign.english}. Organize pending tasks methodically and move forward with confidence.`,
  career: 'Strategic planning and effective communication will yield tangible results. Outline top priorities before making key commitments.',
  finance: 'Maintain a balanced approach towards expenditures and savings. Financial stability is well supported today.',
  health: 'Energy levels remain balanced. Ensure adequate hydration, nutritious meals, and mindful pauses between tasks.',
  love: 'Heartfelt communication and mutual understanding strengthen connections with your loved ones.',
  family: 'Warmth and supportive dialogue prevail at home. Valuable insights from family members will guide you well.',
  luckyNumber: String((index + 3) * 2),
  luckyColor: ['Crimson Red', 'Golden Yellow', 'Forest Green', 'Pure White', 'Royal Saffron', 'Deep Blue'][index % 6],
  remedy: 'Begin your day with grateful reflection and light a ceremonial lamp for peace and focus.',
  mantra: ['Om Namah Shivaya', 'Om Namo Bhagavate Vasudevaya', 'Om Gam Ganapataye Namah', 'Om Dum Durgayai Namah'][index % 4],
  auspiciousWindow: 'Morning 09:00 AM – 11:00 AM',
}]));

export const getFallbackHoroscope = (signId: string): HoroscopeContent => FALLBACK[signId] || FALLBACK.mesha;

/** First-party horoscope content source. No third-party horoscope API is used. */
export async function getHoroscopeContent(signId: string, date: string): Promise<HoroscopeContent> {
  const fallback = getFallbackHoroscope(signId);
  try {
    const params = new URLSearchParams({ sign_id: signId, date });
    const response = await fetch(`/api/horoscope?${params.toString()}`);
    if (!response.ok) return fallback;
    const data = await response.json() as any;
    if (!data || !data.overview) return fallback;
    return {
      overview: data.overview || fallback.overview,
      career: data.career || fallback.career,
      finance: data.finance || fallback.finance,
      health: data.health || fallback.health,
      love: data.love || fallback.love,
      family: data.family || fallback.family,
      luckyNumber: data.luckyNumber || fallback.luckyNumber,
      luckyColor: data.luckyColor || fallback.luckyColor,
      remedy: data.remedy || fallback.remedy,
      mantra: data.mantra || fallback.mantra,
      auspiciousWindow: data.auspiciousWindow || fallback.auspiciousWindow,
    };
  } catch {
    return fallback;
  }
}

export interface ZodiacSign {
  id: string;
  name: string;
  english: string;
  symbol: string;
  dates: string;
  accent: string;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'mesha', name: 'मेष राशि', english: 'Aries', symbol: '♈', dates: '21 मार्च – 19 अप्रैल', accent: '#FF4B00' },
  { id: 'vrishabha', name: 'वृषभ राशि', english: 'Taurus', symbol: '♉', dates: '20 अप्रैल – 20 मई', accent: '#B45309' },
  { id: 'mithuna', name: 'मिथुन राशि', english: 'Gemini', symbol: '♊', dates: '21 मई – 20 जून', accent: '#7C3AED' },
  { id: 'karka', name: 'कर्क राशि', english: 'Cancer', symbol: '♋', dates: '21 जून – 22 जुलाई', accent: '#2563EB' },
  { id: 'simha', name: 'सिंह राशि', english: 'Leo', symbol: '♌', dates: '23 जुलाई – 22 अगस्त', accent: '#D97706' },
  { id: 'kanya', name: 'कन्या राशि', english: 'Virgo', symbol: '♍', dates: '23 अगस्त – 22 सितंबर', accent: '#15803D' },
  { id: 'tula', name: 'तुला राशि', english: 'Libra', symbol: '♎', dates: '23 सितंबर – 22 अक्टूबर', accent: '#DB2777' },
  { id: 'vrishchika', name: 'वृश्चिक राशि', english: 'Scorpio', symbol: '♏', dates: '23 अक्टूबर – 21 नवंबर', accent: '#BE123C' },
  { id: 'dhanu', name: 'धनु राशि', english: 'Sagittarius', symbol: '♐', dates: '22 नवंबर – 21 दिसंबर', accent: '#9333EA' },
  { id: 'makara', name: 'मकर राशि', english: 'Capricorn', symbol: '♑', dates: '22 दिसंबर – 19 जनवरी', accent: '#475569' },
  { id: 'kumbha', name: 'कुंभ राशि', english: 'Aquarius', symbol: '♒', dates: '20 जनवरी – 18 फरवरी', accent: '#0369A1' },
  { id: 'meena', name: 'मीन राशि', english: 'Pisces', symbol: '♓', dates: '19 फरवरी – 20 मार्च', accent: '#0F766E' },
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
  overview: `आज ${sign.name} के लिए दिन सकारात्मक ऊर्जा और स्पष्ट निर्णयों का संकेत देता है। अधूरे कामों को व्यवस्थित करके आगे बढ़ें और जल्दबाज़ी से बचें।`,
  career: 'कामकाज में आपकी योजना और संवाद कौशल उपयोगी रहेंगे। किसी महत्वपूर्ण निर्णय से पहले प्राथमिकताएँ स्पष्ट करें।',
  finance: 'आर्थिक मामलों में संतुलित दृष्टिकोण रखें। आवश्यक खर्च और बचत के बीच अच्छा संतुलन बनाने का समय है।',
  health: 'स्वास्थ्य सामान्य रहने की संभावना है। पर्याप्त पानी, नियमित भोजन और थोड़े विश्राम पर ध्यान दें।',
  love: 'रिश्तों में खुला संवाद और धैर्य सकारात्मक वातावरण बनाएगा। प्रियजनों के साथ समय निकालें।',
  family: 'परिवार में सहयोग और अपनापन बढ़ेगा। किसी बड़े सदस्य की सलाह लाभदायक हो सकती है।',
  luckyNumber: String((index + 3) * 2),
  luckyColor: ['लाल','पीला','हरा','सफेद','केसरिया','नीला'][index % 6],
  remedy: 'प्रातः ईश्वर का स्मरण करें और अपनी श्रद्धा के अनुसार दीपक जलाएँ।',
  mantra: ['ॐ नमः शिवाय','ॐ नमो भगवते वासुदेवाय','ॐ श्री गणेशाय नमः','ॐ दुं दुर्गायै नमः'][index % 4],
  auspiciousWindow: 'प्रातः 09:00 – 11:00',
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

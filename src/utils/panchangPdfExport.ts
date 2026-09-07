import { jsPDF } from 'jspdf';
import { PanchangDay, formatLongDate } from '../data/panchangData';
import logoUrl from '../assets/images/logo-bhakti-sathi.png';

interface PanchangPdfOptions {
  panchang: PanchangDay;
  cityLabel: string;
  agencyName?: string;
  language?: 'hi' | 'en' | 'both';
}

const EN: Record<string, string> = {
  'रविवार': 'Sunday', 'सोमवार': 'Monday', 'मंगलवार': 'Tuesday', 'बुधवार': 'Wednesday', 'गुरुवार': 'Thursday', 'शुक्रवार': 'Friday', 'शनिवार': 'Saturday',
  'शुक्ल प्रतिपदा': 'Shukla Pratipada', 'शुक्ल द्वितीया': 'Shukla Dwitiya', 'शुक्ल तृतीया': 'Shukla Tritiya', 'शुक्ल चतुर्थी': 'Shukla Chaturthi', 'शुक्ल पंचमी': 'Shukla Panchami', 'शुक्ल षष्ठी': 'Shukla Shashthi', 'शुक्ल सप्तमी': 'Shukla Saptami', 'शुक्ल अष्टमी': 'Shukla Ashtami', 'शुक्ल नवमी': 'Shukla Navami', 'शुक्ल दशमी': 'Shukla Dashami', 'शुक्ल एकादशी': 'Shukla Ekadashi', 'शुक्ल द्वादशी': 'Shukla Dwadashi', 'शुक्ल त्रयोदशी': 'Shukla Trayodashi', 'शुक्ल चतुर्दशी': 'Shukla Chaturdashi', 'पूर्णिमा': 'Purnima',
  'कृष्ण प्रतिपदा': 'Krishna Pratipada', 'कृष्ण द्वितीया': 'Krishna Dwitiya', 'कृष्ण तृतीया': 'Krishna Tritiya', 'कृष्ण चतुर्थी': 'Krishna Chaturthi', 'कृष्ण पंचमी': 'Krishna Panchami', 'कृष्ण षष्ठी': 'Krishna Shashthi', 'कृष्ण सप्तमी': 'Krishna Saptami', 'कृष्ण अष्टमी': 'Krishna Ashtami', 'कृष्ण नवमी': 'Krishna Navami', 'कृष्ण दशमी': 'Krishna Dashami', 'कृष्ण एकादशी': 'Krishna Ekadashi', 'कृष्ण द्वादशी': 'Krishna Dwadashi', 'कृष्ण त्रयोदशी': 'Krishna Trayodashi', 'कृष्ण चतुर्दशी': 'Krishna Chaturdashi', 'अमावस्या': 'Amavasya',
  'अश्विनी': 'Ashwini', 'भरणी': 'Bharani', 'कृत्तिका': 'Krittika', 'रोहिणी': 'Rohini', 'मृगशिरा': 'Mrigashira', 'आर्द्रा': 'Ardra', 'पुनर्वसु': 'Punarvasu', 'पुष्य': 'Pushya', 'आश्लेषा': 'Ashlesha', 'मघा': 'Magha', 'पूर्वा फाल्गुनी': 'Purva Phalguni', 'उत्तरा फाल्गुनी': 'Uttara Phalguni', 'हस्त': 'Hasta', 'चित्रा': 'Chitra', 'स्वाती': 'Swati', 'विशाखा': 'Vishakha', 'अनुराधा': 'Anuradha', 'ज्येष्ठा': 'Jyeshtha', 'मूल': 'Mula', 'पूर्वाषाढ़ा': 'Purva Ashadha', 'उत्तराषाढ़ा': 'Uttara Ashadha', 'श्रवण': 'Shravana', 'धनिष्ठा': 'Dhanishtha', 'शतभिषा': 'Shatabhisha', 'पूर्वाभाद्रपद': 'Purva Bhadrapada', 'उत्तराभाद्रपद': 'Uttara Bhadrapada', 'रेवती': 'Revati',
  'विष्कम्भ': 'Vishkambha', 'प्रीति': 'Priti', 'आयुष्मान': 'Ayushman', 'सौभाग्य': 'Saubhagya', 'शोभन': 'Shobhana', 'अतिगण्ड': 'Atiganda', 'सुकर्मा': 'Sukarma', 'धृति': 'Dhriti', 'शूल': 'Shula', 'गण्ड': 'Ganda', 'वृद्धि': 'Vriddhi', 'ध्रुव': 'Dhruva', 'व्याघात': 'Vyaghata', 'हर्षण': 'Harshana', 'वज्र': 'Vajra', 'सिद्धि': 'Siddhi', 'व्यतीपात': 'Vyatipata', 'वरीयान': 'Variyan', 'परिघ': 'Parigha', 'शिव': 'Shiva', 'सिद्ध': 'Siddha', 'साध्य': 'Sadhya', 'शुभ': 'Shubha', 'शुक्ल': 'Shukla', 'ब्रह्म': 'Brahma', 'इन्द्र': 'Indra', 'वैधृति': 'Vaidhriti',
  'बव': 'Bava', 'बालव': 'Balava', 'कौलव': 'Kaulava', 'तैतिल': 'Taitila', 'गर': 'Gara', 'वणिज': 'Vanija', 'विष्टि': 'Vishti', 'शकुनि': 'Shakuni', 'चतुष्पाद': 'Chatushpada', 'नाग': 'Naga', 'किंस्तुघ्न': 'Kimstughna'
};

const en = (value: string) => EN[value] || value;
const display = (hi: string, language: 'hi' | 'en' | 'both') => language === 'hi' ? hi : language === 'en' ? en(hi) : `${hi} / ${en(hi)}`;
const loadLogo = async () => { const response = await fetch(logoUrl); const blob = await response.blob(); return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = URL.createObjectURL(blob); }); };
const text = (ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, weight = 600, color = '#171717', align: CanvasTextAlign = 'left') => { ctx.font = `${weight} ${size}px Arial, "Noto Sans Devanagari", "Nirmala UI", Mangal, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y); };
const rounded = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke = '#EDE1D8') => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); };

export async function generatePanchangPdf({ panchang, cityLabel, agencyName = 'Bhakti Sathi', language = 'both' }: PanchangPdfOptions): Promise<void> {
  const canvas = document.createElement('canvas'); canvas.width = 1240; canvas.height = 1754;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#FFFBF8'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#FF4B00'; ctx.fillRect(0, 0, canvas.width, 18);
  const logo = await loadLogo(); const logoW = 250; const logoH = Math.min(logoW * logo.naturalHeight / logo.naturalWidth, 86); ctx.drawImage(logo, 58, 48, logoW, logoH);
  text(ctx, language === 'en' ? 'DAILY PANCHANG' : language === 'hi' ? 'दैनिक पंचांग' : 'DAILY PANCHANG / दैनिक पंचांग', 1180, 82, 22, 800, '#625B56', 'right'); text(ctx, cityLabel, 1180, 116, 17, 600, '#918984', 'right');
  ctx.fillStyle = '#FF4B00'; ctx.fillRect(0, 178, canvas.width, 188); text(ctx, language === 'en' ? 'Panchang Calendar' : language === 'hi' ? 'पंचांग कैलेंडर' : 'Panchang Calendar / पंचांग कैलेंडर', 60, 242, 39, 800, '#FFFFFF'); text(ctx, formatLongDate(panchang.date), 60, 284, 20, 600, '#FFF4ED'); text(ctx, en(panchang.vara.name), 1180, 284, 20, 700, '#FFFFFF', 'right');
  rounded(ctx, 60, 398, 1120, 112, 22, '#FFF8F3', '#F2D7C8'); text(ctx, language === 'en' ? 'Location' : language === 'hi' ? 'स्थान' : 'Location / स्थान', 88, 432, 15, 800, '#9B6D54'); text(ctx, cityLabel, 88, 474, 23, 800); text(ctx, language === 'en' ? 'Calendar' : language === 'hi' ? 'कैलेंडर' : 'Calendar / कैलेंडर', 610, 432, 15, 800, '#9B6D54'); text(ctx, panchang.ayanamsa || 'Lahiri / Chitrapaksha', 610, 474, 21, 700);
  const cards = [['तिथि / Tithi', display(panchang.tithi.name, language)], ['नक्षत्र / Nakshatra', `${display(panchang.nakshatra.name, language)} • Pada ${panchang.nakshatra.pada || '—'}`], ['योग / Yoga', display(panchang.yoga.name, language)], ['करण / Karana', display(panchang.karana.name, language)]];
  cards.forEach(([label, value], i) => { const x = i % 2 ? 640 : 60; const y = 548 + Math.floor(i / 2) * 146; rounded(ctx, x, y, 540, 124, 20, '#FFFFFF'); ctx.fillStyle = i % 2 ? '#D97706' : '#FF4B00'; ctx.fillRect(x, y, 7, 124); text(ctx, label, x + 25, y + 32, 15, 800, '#81766F'); text(ctx, value || '—', x + 25, y + 77, 22, 800); });
  text(ctx, language === 'en' ? 'Sun & Auspicious Timings' : language === 'hi' ? 'सूर्य एवं शुभ समय' : 'Sun & Auspicious Timings / सूर्य एवं शुभ समय', 60, 862, 26, 800, '#2D2926');
  const timings = [['सूर्योदय / Sunrise', panchang.sun.sunrise], ['सूर्यास्त / Sunset', panchang.sun.sunset], ['राहुकाल / Rahu Kalam', panchang.muhurta.rahuKalam || 'Not available'], ['यमगण्ड / Yamagandam', panchang.muhurta.yamagandam || 'Not available'], ['अभिजित मुहूर्त / Abhijit Muhurtam', panchang.muhurta.abhijit || 'Not available'], ['दोपहर / Solar Noon', panchang.sun.noon || 'Not available'], ['गुलिक काल / Gulika Kalam', panchang.muhurta.gulikaKalam || 'Not available'], ['ब्रह्म मुहूर्त / Brahma Muhurta', panchang.muhurta.brahmaMuhurta || 'Not available']];
  timings.forEach(([label, value], i) => { const x = i % 2 ? 640 : 60; const y = 890 + Math.floor(i / 2) * 116; rounded(ctx, x, y, 540, 94, 18, '#FFFFFF'); text(ctx, label, x + 22, y + 30, 13, 800, '#81766F'); text(ctx, value || '—', x + 22, y + 68, 20, 800); });
  rounded(ctx, 60, 1404, 1120, 106, 20, '#FFF0E8', '#F6D4C5'); text(ctx, language === 'en' ? 'Daily information' : language === 'hi' ? 'दैनिक जानकारी' : 'Daily information / दैनिक जानकारी', 86, 1438, 16, 800, '#FF4B00'); text(ctx, language === 'en' ? 'Location-based sunrise, sunset and muhurta timings.' : language === 'hi' ? 'स्थान के अनुसार सूर्योदय, सूर्यास्त एवं मुहूर्त समय।' : 'Location-based sunrise, sunset and muhurta timings. / स्थान के अनुसार सूर्योदय, सूर्यास्त एवं मुहूर्त समय।', 86, 1475, 16, 600, '#5E5752');
  ctx.fillStyle = '#FF4B00'; ctx.fillRect(0, 1635, canvas.width, 119); text(ctx, `${agencyName} • Panchang Calendar`, 60, 1690, 19, 700, '#FFFFFF'); text(ctx, 'भक्ति के साथ हर दिन • Bhakti Sathi', 1180, 1690, 19, 700, '#FFFFFF', 'right');

  // Rasterize once and embed as JPEG so mobile/WhatsApp PDF previews reliably show the complete page.
  const imageData = canvas.toDataURL('image/jpeg', 0.94);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.addImage(imageData, 'JPEG', 0, 0, 210, 297, undefined, 'MEDIUM');
  doc.save(`BhaktiSathi_Panchang_${panchang.date}_${cityLabel.replace(/\s+/g, '-')}.pdf`);
}

import { jsPDF } from 'jspdf';
import { PanchangDay, formatLongDate } from '../data/panchangData';
import logoUrl from '../assets/images/logo-holidays-hunt.png';

interface PanchangPdfOptions {
  panchang: PanchangDay;
  cityLabel: string;
  agencyName?: string;
  language?: 'hi' | 'en' | 'both';
}

const EN: Record<string, string> = {};

const en = (value: string) => EN[value] || value;
const display = (val: string, _language?: string) => val;
const loadLogo = async () => { const response = await fetch(logoUrl); const blob = await response.blob(); return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = URL.createObjectURL(blob); }); };
const text = (ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, weight = 600, color = '#171717', align: CanvasTextAlign = 'left') => { ctx.font = `${weight} ${size}px Arial, "Noto Sans Devanagari", "Nirmala UI", Mangal, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y); };
const rounded = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke = '#EDE1D8') => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); };

export async function generatePanchangPdf({ panchang, cityLabel, agencyName = 'Holidays Hunt', language = 'both' }: PanchangPdfOptions): Promise<void> {
  const canvas = document.createElement('canvas'); canvas.width = 1240; canvas.height = 1754;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#FFFBF8'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#FF4B00'; ctx.fillRect(0, 0, canvas.width, 18);
  const logo = await loadLogo(); const logoW = 250; const logoH = Math.min(logoW * logo.naturalHeight / logo.naturalWidth, 86); ctx.drawImage(logo, 58, 48, logoW, logoH);
  text(ctx, 'DAILY PANCHANG', 1180, 82, 22, 800, '#625B56', 'right'); text(ctx, cityLabel, 1180, 116, 17, 600, '#918984', 'right');
  ctx.fillStyle = '#FF4B00'; ctx.fillRect(0, 178, canvas.width, 188); text(ctx, 'Panchang Calendar', 60, 242, 39, 800, '#FFFFFF'); text(ctx, formatLongDate(panchang.date), 60, 284, 20, 600, '#FFF4ED'); text(ctx, en(panchang.vara.name), 1180, 284, 20, 700, '#FFFFFF', 'right');
  rounded(ctx, 60, 398, 1120, 112, 22, '#FFF8F3', '#F2D7C8'); text(ctx, 'Location', 88, 432, 15, 800, '#9B6D54'); text(ctx, cityLabel, 88, 474, 23, 800); text(ctx, 'Calendar System', 610, 432, 15, 800, '#9B6D54'); text(ctx, panchang.ayanamsa || 'Lahiri / Chitrapaksha', 610, 474, 21, 700);
  const cards = [['Tithi', display(panchang.tithi.name, language)], ['Nakshatra', `${display(panchang.nakshatra.name, language)} • Pada ${panchang.nakshatra.pada || '—'}`], ['Yoga', display(panchang.yoga.name, language)], ['Karana', display(panchang.karana.name, language)]];
  cards.forEach(([label, value], i) => { const x = i % 2 ? 640 : 60; const y = 548 + Math.floor(i / 2) * 146; rounded(ctx, x, y, 540, 124, 20, '#FFFFFF'); ctx.fillStyle = i % 2 ? '#D97706' : '#FF4B00'; ctx.fillRect(x, y, 7, 124); text(ctx, label, x + 25, y + 32, 15, 800, '#81766F'); text(ctx, value || '—', x + 25, y + 77, 22, 800); });
  text(ctx, 'Sun & Auspicious Timings', 60, 862, 26, 800, '#2D2926');
  const timings = [['Sunrise', panchang.sun.sunrise], ['Sunset', panchang.sun.sunset], ['Rahu Kalam', panchang.muhurta.rahuKalam || 'Not available'], ['Yamagandam', panchang.muhurta.yamagandam || 'Not available'], ['Abhijit Muhurtam', panchang.muhurta.abhijit || 'Not available'], ['Solar Noon', panchang.sun.noon || 'Not available'], ['Gulika Kalam', panchang.muhurta.gulikaKalam || 'Not available'], ['Brahma Muhurta', panchang.muhurta.brahmaMuhurta || 'Not available']];
  timings.forEach(([label, value], i) => { const x = i % 2 ? 640 : 60; const y = 890 + Math.floor(i / 2) * 116; rounded(ctx, x, y, 540, 94, 18, '#FFFFFF'); text(ctx, label, x + 22, y + 30, 13, 800, '#81766F'); text(ctx, value || '—', x + 22, y + 68, 20, 800); });
  rounded(ctx, 60, 1404, 1120, 106, 20, '#FFF0E8', '#F6D4C5'); text(ctx, 'Daily Information', 86, 1438, 16, 800, '#FF4B00'); text(ctx, 'Location-based sunrise, sunset and auspicious muhurta timings calculated accurately.', 86, 1475, 16, 600, '#5E5752');
  ctx.fillStyle = '#FF4B00'; ctx.fillRect(0, 1635, canvas.width, 119); text(ctx, `${agencyName} • Panchang Calendar`, 60, 1690, 19, 700, '#FFFFFF'); text(ctx, 'Holidays Hunt • Your Travel Partner', 1180, 1690, 19, 700, '#FFFFFF', 'right');

  // Rasterize once and embed as JPEG so mobile/WhatsApp PDF previews reliably show the complete page.
  const imageData = canvas.toDataURL('image/jpeg', 0.94);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.addImage(imageData, 'JPEG', 0, 0, 210, 297, undefined, 'MEDIUM');
  doc.save(`HolidaysHunt_Panchang_${panchang.date}_${cityLabel.replace(/\s+/g, '-')}.pdf`);
}

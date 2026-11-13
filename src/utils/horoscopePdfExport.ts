import { jsPDF } from 'jspdf';
import { HoroscopeContent, ZodiacSign } from '../data/horoscopeContent';
import logoUrl from '../assets/images/holidayshunt-logo.png';

const loadLogo = async () => { const response = await fetch(logoUrl); const blob = await response.blob(); return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = URL.createObjectURL(blob); }); };
const text = (ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, weight = 600, color = '#171717', align: CanvasTextAlign = 'left') => { ctx.font = `${weight} ${size}px Arial, "Noto Sans Devanagari", "Nirmala UI", Mangal, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y); };
const wrap = (ctx: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines: number) => { const words = value.split(/\s+/); const lines: string[] = []; let line = ''; for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test; } if (line) lines.push(line); return lines.slice(0, maxLines); };
const bilingual = (hi: string, en: string) => `${hi} / ${en}`;

export async function generateHoroscopePdf({ sign, date, content }: { sign: ZodiacSign; date: string; content: HoroscopeContent }): Promise<void> {
  const canvas = document.createElement('canvas'); canvas.width = 1240; canvas.height = 1754;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#FDF9F9'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#9b0000'; ctx.fillRect(0, 0, canvas.width, 18);
  const logo = await loadLogo(); const logoW = 250; const logoH = Math.min(logoW * logo.naturalHeight / logo.naturalWidth, 86); ctx.drawImage(logo, 58, 48, logoW, logoH);
  text(ctx, 'DAILY HOROSCOPE', 1180, 82, 21, 800, '#625B56', 'right'); text(ctx, 'Holidays Hunt • Your Travel Partner', 1180, 116, 14, 600, '#918984', 'right');
  ctx.fillStyle = '#FDF2F2'; ctx.beginPath(); ctx.roundRect(60, 178, 1120, 230, 30); ctx.fill();
  text(ctx, sign.symbol, 620, 280, 76, 400, sign.accent, 'center'); text(ctx, sign.english, 620, 335, 36, 800, '#171717', 'center'); text(ctx, `${sign.dates}  •  ${date}`, 620, 374, 18, 600, '#756D67', 'center');
  text(ctx, 'Today’s Horoscope', 60, 466, 29, 800, '#171717');
  wrap(ctx, content.overview || '—', 1120, 4).forEach((line, i) => text(ctx, line, 60, 510 + i * 34, 22, 500, '#3D3834'));
  const sections: Array<[string, string]> = [['Career Guidance', content.career], ['Financial Outlook', content.finance], ['Health & Wellness', content.health], ['Love & Relationships', content.love], ['Family Life', content.family], ['Spiritual Reflection', content.remedy]];
  sections.forEach(([title, value], index) => { const x = index % 2 ? 640 : 60; const y = 680 + Math.floor(index / 2) * 168; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(x, y, 540, 140, 22); ctx.fill(); ctx.strokeStyle = '#EDE1D8'; ctx.lineWidth = 2; ctx.stroke(); text(ctx, title, x + 24, y + 35, 18, 800, '#9b0000'); wrap(ctx, value || '—', 490, 4).forEach((line, i) => text(ctx, line, x + 24, y + 70 + i * 25, 17, 500, '#4C4642')); });
  ctx.fillStyle = '#FDF2F2'; ctx.beginPath(); ctx.roundRect(60, 1210, 1120, 160, 22); ctx.fill(); text(ctx, 'Daily Highlights', 88, 1250, 20, 800, '#9b0000'); text(ctx, `Lucky Number: ${content.luckyNumber || '—'}`, 88, 1290, 18, 700); text(ctx, `Lucky Color: ${content.luckyColor || '—'}`, 88, 1324, 18, 700); text(ctx, `Auspicious Window: ${content.auspiciousWindow || '—'}`, 620, 1290, 18, 700); text(ctx, `Mantra: ${content.mantra || '—'}`, 620, 1324, 18, 700);
  ctx.fillStyle = '#9b0000'; ctx.fillRect(0, 1635, canvas.width, 119); text(ctx, 'Holidays Hunt • Your Travel Partner', 620, 1690, 20, 800, '#FFFFFF', 'center');
  const imageData = canvas.toDataURL('image/jpeg', 0.94); const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }); doc.addImage(imageData, 'JPEG', 0, 0, 210, 297); doc.save(`HolidaysHunt_Rashifal_${sign.id}_${date}.pdf`);
}

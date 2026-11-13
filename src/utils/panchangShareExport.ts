import { PanchangDay, formatLongDate } from '../data/panchangData';
import logoUrl from '../assets/images/holidayshunt-logo.png';

const FONT = 'Arial, sans-serif';
const bilingual: Record<string, string> = {};
const en = (value: string) => bilingual[value] || value;
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
const text = (ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, weight = 600, color = '#171717', align: CanvasTextAlign = 'left') => { ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y); };
const card = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, label: string, value: string, accent: string) => { ctx.beginPath(); ctx.roundRect(x, y, w, 125, 26); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = '#E9DDD5'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = accent; ctx.fillRect(x, y, 8, 125); text(ctx, label, x + 28, y + 35, 19, 800, '#7C716A'); text(ctx, value, x + 28, y + 78, 25, 800); };

export async function sharePanchangImage(panchang: PanchangDay, cityLabel: string): Promise<'shared' | 'downloaded'> {
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920; const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#FDF9F9'; ctx.fillRect(0, 0, 1080, 1920); ctx.fillStyle = '#9b0000'; ctx.fillRect(0, 0, 1080, 18);
  const logo = await loadImage(logoUrl); const logoW = 280; const logoH = Math.min(logoW * logo.naturalHeight / logo.naturalWidth, 95); ctx.drawImage(logo, 55, 48, logoW, logoH); text(ctx, 'DAILY PANCHANG', 1025, 82, 21, 800, '#665E59', 'right');
  text(ctx, 'Today\'s Panchang', 55, 210, 39, 800); text(ctx, formatLongDate(panchang.date), 55, 253, 22, 600, '#625A55'); text(ctx, `${cityLabel}`, 55, 288, 21, 600, '#625A55'); text(ctx, en(panchang.vara.name), 1025, 288, 21, 700, '#9b0000', 'right');
  const cards = [
    ['Tithi', `${en(panchang.tithi.name)}`], ['Nakshatra', `${en(panchang.nakshatra.name)} • Pada ${panchang.nakshatra.pada || '—'}`],
    ['Yoga', `${en(panchang.yoga.name)}`], ['Karana', `${en(panchang.karana.name)}`],
    ['Sunrise', panchang.sun.sunrise], ['Sunset', panchang.sun.sunset], ['Rahu Kalam', panchang.muhurta.rahuKalam || 'Not available'], ['Yamagandam', panchang.muhurta.yamagandam || 'Not available'],
    ['Abhijit Muhurtam', panchang.muhurta.abhijit || 'Not available'], ['Gulika Kalam', panchang.muhurta.gulikaKalam || 'Not available']
  ];
  cards.forEach(([label, value], i) => card(ctx, 40, 350 + i * 137, 1000, label, value, i < 4 ? '#9b0000' : i < 6 ? '#F59E0B' : '#7C3AED'));
  ctx.beginPath(); ctx.roundRect(40, 1730, 1000, 110, 24); ctx.fillStyle = '#FDF2F2'; ctx.fill(); text(ctx, 'Holidays Hunt • Your Travel Partner', 540, 1798, 25, 800, '#9b0000', 'center');
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Image export failed')), 'image/png')); const file = new File([blob], `HolidaysHunt_Panchang_${panchang.date}.png`, { type: 'image/png' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) { await navigator.share({ title: 'Holidays Hunt — Today\'s Panchang', text: `Today's Panchang • ${cityLabel}`, files: [file] }); return 'shared'; }
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); return 'downloaded';
}

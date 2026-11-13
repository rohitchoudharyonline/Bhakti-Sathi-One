import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JapSessionRecord, JapTimeframe } from '../types/japCounter';
import logoUrl from '../assets/images/holidayshunt-logo.png';

interface PdfExportOptions {
  pilgrimName: string;
  timeframe: JapTimeframe;
  totalChants: number;
  totalMalas: number;
  streakDays: number;
  activeMantra: string;
  records: JapSessionRecord[];
  agencyName?: string;
}

type StatCard = [string, string, string, [number, number, number], [number, number, number], [number, number, number]];

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const loadImage = async (src: string): Promise<LoadedImage> => {
  const response = await fetch(src);
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const image = new Image();
  image.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Unable to load PDF logo'));
  });

  return { dataUrl, width: image.naturalWidth, height: image.naturalHeight };
};

const mantraAsDataUrl = (mantra: string, fontSize = 28): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const font = `700 ${fontSize}px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif`;
  ctx.font = font;
  const width = Math.max(320, Math.ceil(ctx.measureText(mantra).width) + 36);
  canvas.width = width;
  canvas.height = fontSize + 24;
  ctx.font = font;
  ctx.fillStyle = '#172033';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mantra, canvas.width / 2, canvas.height / 2 + 1);
  return canvas.toDataURL('image/png');
};

const timeframeLabel = (timeframe: JapTimeframe): string => ({
  daily: 'TODAY', weekly: 'THIS WEEK', monthly: 'THIS MONTH', yearly: 'THIS YEAR', lifetime: 'LIFETIME',
}[timeframe]);

export async function generateJapSadhanaPdf(options: PdfExportOptions): Promise<void> {
  const { pilgrimName, timeframe, totalChants, totalMalas, streakDays, activeMantra, records, agencyName = 'Holidays Hunt' } = options;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const mantraImage = mantraAsDataUrl(activeMantra || 'Samba Sadashiva');
  const logo = await loadImage(logoUrl);
  const generatedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 31, 'F');
  const logoWidth = 34;
  const logoHeight = logo.width > 0 ? logoWidth * (logo.height / logo.width) : 14;
  const maxLogoHeight = 20;
  const renderedLogoHeight = Math.min(logoHeight, maxLogoHeight);
  const renderedLogoWidth = logoHeight > maxLogoHeight ? maxLogoHeight * (logo.width / logo.height) : logoWidth;
  doc.addImage(logo.dataUrl, 'PNG', margin, 5.5, renderedLogoWidth, renderedLogoHeight);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('JAPA MALA SADHANA REPORT', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(`Timeframe: ${timeframeLabel(timeframe)}`, pageWidth - margin, 17, { align: 'right' });
  doc.text(generatedDate, pageWidth - margin, 22, { align: 'right' });

  doc.setFillColor(155, 0, 0);
  doc.rect(0, 31, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('JAPA MALA SADHANA REPORT', pageWidth / 2, 42, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Your devotion, beautifully recorded.', pageWidth / 2, 47, { align: 'center' });

  doc.setFillColor(253, 242, 242);
  doc.setDrawColor(251, 146, 60);
  doc.roundedRect(margin, 57, pageWidth - margin * 2, 12, 2, 2, 'FD');
  if (mantraImage) doc.addImage(mantraImage, 'PNG', pageWidth / 2 - 34, 59.5, 68, 7);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 74, pageWidth - margin * 2, 23, 2.5, 2.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('DEVOTEE / PILGRIM NAME', 20, 81.5);
  doc.text('ACTIVE MANTRA', 82, 81.5);
  doc.text('DATE GENERATED', 145, 81.5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(pilgrimName || 'Devoted Pilgrim', 20, 90);
  if (mantraImage) doc.addImage(mantraImage, 'PNG', 82, 84, 48, 6.8);
  doc.text(generatedDate, 145, 90);

  const cardY = 103;
  const cardHeight = 26;
  const gap = 4;
  const cardWidth = (pageWidth - margin * 2 - gap * 3) / 4;
  const statCards: StatCard[] = [
    ['TOTAL JAPA CHANTS', totalChants.toLocaleString('en-IN'), `${timeframeLabel(timeframe)} PERIOD`, [253, 242, 242], [155, 0, 0], [155, 0, 0]],
    ['MALAS COMPLETED', `${totalMalas} Malas`, '1 MALA = 108 BEADS', [254, 243, 199], [217, 119, 6], [180, 83, 9]],
    ['DAILY STREAK', `${streakDays} Days`, 'CONTINUOUS DEVOTION', [236, 253, 245], [16, 185, 129], [5, 150, 105]],
    ['COMPLETION RATIO', '100%', 'VERIFIED JAPA LOG', [241, 245, 249], [71, 85, 105], [30, 41, 59]],
  ];

  statCards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap);
    doc.setFillColor(card[3][0], card[3][1], card[3][2]);
    doc.setDrawColor(card[4][0], card[4][1], card[4][2]);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text(card[0], x + 4, cardY + 6);
    doc.setTextColor(card[5][0], card[5][1], card[5][2]);
    doc.setFontSize(10.5);
    doc.text(card[1], x + 4, cardY + 15.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(card[2], x + 4, cardY + 21);
  });

  const tableData = records.length > 0 ? records.slice(0, 30).map((record, index) => [
    `#${index + 1}`,
    record.dateStr,
    new Date(record.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    '',
    `${record.beadCount} Japs`,
    `${record.malasCompleted} ${record.malasCompleted === 1 ? 'Mala' : 'Malas'}`,
    'Completed',
  ]) : [[
    '#1',
    new Date().toISOString().split('T')[0],
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    '',
    `${totalChants} Japs`,
    `${totalMalas} Malas`,
    'Completed',
  ]];

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Sadhana History & Detailed Chanting Records', margin, 140);

  autoTable(doc, {
    startY: 144,
    head: [['No.', 'Date', 'Time', 'Sacred Mantra', 'Japs Count', 'Mala Rounds', 'Status']],
    body: tableData,
    theme: 'grid',
    margin: { left: margin, right: margin, bottom: 22 },
    styles: { font: 'helvetica', fontSize: 7.3, textColor: [51, 65, 85], cellPadding: 2.1, valign: 'middle' },
    headStyles: { fillColor: [155, 0, 0], textColor: [255, 255, 255], fontSize: 7.2, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 13 }, 1: { cellWidth: 26 }, 2: { cellWidth: 23 }, 3: { cellWidth: 39 }, 4: { cellWidth: 25 }, 5: { cellWidth: 27 }, 6: { cellWidth: 28 } },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 3 && mantraImage) {
        doc.addImage(mantraImage, 'PNG', data.cell.x + 2, data.cell.y + 1.5, Math.min(34, data.cell.width - 4), 5.5);
      }
    },
    didDrawPage: () => {
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(0, pageHeight - 15, pageWidth, pageHeight - 15);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text(`${agencyName} • Devotional Sadhana Log`, margin, pageHeight - 6.5);
      doc.text('Dedicated to Sacred Yatras, Peace & Auspicious Grace', pageWidth - margin, pageHeight - 6.5, { align: 'right' });
    },
  });

  const filename = `HolidaysHunt_Japa_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

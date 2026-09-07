import { jsPDF } from 'jspdf';
import { AgencySettings } from '../types/tour';

export interface CustomItineraryData {
  itineraryTitle: string;
  destination: string;
  durationDays: number;
  hotelTier: string;
  vehicleType: string;
  mealPlan: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  travelMonth?: string;
  specialInterests?: string[];
  itineraryDays?: Array<{
    dayNumber: number;
    title: string;
    location: string;
    description: string;
    activities?: string[];
    stayHotel?: string;
    meals?: string[];
  }>;
  inclusions?: string[];
  exclusions?: string[];
  agencySettings: AgencySettings;
}

async function loadBrandLogoData(): Promise<{ dataUrl: string; width: number; height: number; format: string } | null> {
  const sources = ['/logo-bhakti-sathi.png', '/logo.png'];
  for (const src of sources) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = src;
      });

      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          return {
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: 'PNG',
          };
        }
      }
    } catch {
      // Continue to next fallback source
    }
  }
  return null;
}

export async function generateCustomItineraryPdf(data: CustomItineraryData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // ~182 mm

  // Brand Colors matching paymentReceiptPdf.ts
  const primaryOrange = [255, 75, 0]; // #FF4B00
  const darkCharcoal = [26, 26, 26]; // #1A1A1A
  const textMuted = [115, 115, 115]; // #737373
  const cardBg = [250, 250, 249]; // #FAFAF9
  const cardBorder = [228, 228, 231]; // #E4E4E7
  const accentGreen = [16, 149, 106]; // #10B981

  let pageNumber = 1;

  const drawHeaderAndFooter = () => {
    // Footer on current page
    const footerY = pageHeight - 12;
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(data.agencySettings.agencyName || 'Bhakti Sathi', margin, footerY);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const footerContact = `Phone: ${data.agencySettings.phone}  |  Email: ${data.agencySettings.email}  |  Website: www.mybhaktisathi.com`;
    doc.text(footerContact, margin, footerY + 3.5);

    doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY + 3.5, { align: 'right' });
  };

  let currentY = margin + 1;

  // -------------------------------------------------------------
  // 1. TOP HEADER: Official Brand Logo on Top Left
  // -------------------------------------------------------------
  const logoData = await loadBrandLogoData();

  if (logoData) {
    const aspectRatio = logoData.width / logoData.height;
    const targetHeight = 13.5;
    const targetWidth = Math.min(targetHeight * aspectRatio, 58);
    const calculatedHeight = targetWidth / aspectRatio;

    doc.addImage(
      logoData.dataUrl,
      'PNG',
      margin,
      currentY,
      targetWidth,
      calculatedHeight,
      undefined,
      'FAST'
    );
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text('holidays', margin, currentY + 7);

    const holidaysWidth = doc.getTextWidth('holidays');
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text('hunt', margin + holidaysWidth, currentY + 7);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('HOLIDAYS & TOURS', margin, currentY + 12);
  }

  // Top Right: Itinerary Badge & Metadata
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('CUSTOM TOUR ITINERARY', pageWidth - margin, currentY + 3.5, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Offline Tailored Travel Document', pageWidth - margin, currentY + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`Duration: ${data.durationDays} Days / ${Math.max(1, data.durationDays - 1)} Nights`, pageWidth - margin, currentY + 12.5, { align: 'right' });

  currentY += 17;

  // Subtle Header Divider
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5.5;

  // -------------------------------------------------------------
  // 2. SUMMARY RIBBON / STATUS BADGE
  // -------------------------------------------------------------
  const ribbonHeight = 13.5;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, contentWidth, ribbonHeight, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('DESTINATION:', margin + 4, currentY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const safeDest = data.destination.length > 35 ? `${data.destination.substring(0, 33)}...` : data.destination;
  doc.text(safeDest, margin + 28, currentY + 8.5);

  // Status Chip on Ribbon Right
  const statusX = pageWidth - margin - 34;
  const statusY = currentY + 2.2;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(statusX, statusY, 30, 9, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.text('CONFIRMED', statusX + 15, statusY + 6, { align: 'center' });

  currentY += ribbonHeight + 5.5;

  // -------------------------------------------------------------
  // 3. TWO-COLUMN CARDS: TRAVELER DETAILS & TOUR SPECIFICATIONS
  // -------------------------------------------------------------
  const colWidth = (contentWidth - 6) / 2;
  const cardHeight1 = 44;

  // Left Card: Traveler Details
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, colWidth, cardHeight1, 3, 3, 'FD');

  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.roundedRect(margin, currentY, colWidth, 1.5, 1, 1, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('TRAVELER DETAILS', margin + 4, currentY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Name:', margin + 4, currentY + 14);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.travelerName || 'Valued Guest', margin + 22, currentY + 14);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Email:', margin + 4, currentY + 22);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const safeEmail = data.travelerEmail.length > 26 ? `${data.travelerEmail.substring(0, 24)}...` : data.travelerEmail;
  doc.text(safeEmail || 'Provided', margin + 22, currentY + 22);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Contact:', margin + 4, currentY + 30);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.travelerPhone || 'Not provided', margin + 22, currentY + 30);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Status:', margin + 4, currentY + 38);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Verified Itinerary Record', margin + 22, currentY + 38);

  // Right Card: Tour Specifications
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(rightColX, currentY, colWidth, cardHeight1, 3, 3, 'FD');

  doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.roundedRect(rightColX, currentY, colWidth, 1.5, 1, 1, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('TOUR SPECIFICATIONS', rightColX + 4, currentY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Stay:', rightColX + 4, currentY + 14);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const safeHotel = data.hotelTier.length > 25 ? `${data.hotelTier.substring(0, 23)}...` : data.hotelTier;
  doc.text(safeHotel, rightColX + 22, currentY + 14);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Vehicle:', rightColX + 4, currentY + 22);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const safeVehicle = data.vehicleType.length > 25 ? `${data.vehicleType.substring(0, 23)}...` : data.vehicleType;
  doc.text(safeVehicle, rightColX + 22, currentY + 22);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Meals:', rightColX + 4, currentY + 30);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const safeMeals = data.mealPlan.length > 25 ? `${data.mealPlan.substring(0, 23)}...` : data.mealPlan;
  doc.text(safeMeals, rightColX + 22, currentY + 30);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Timing:', rightColX + 4, currentY + 38);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.travelMonth || 'Upcoming Season', rightColX + 22, currentY + 38);

  currentY += cardHeight1 + 8;

  // -------------------------------------------------------------
  // 4. DAY-BY-DAY ITINERARY CARDS
  // -------------------------------------------------------------
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('DAY-BY-DAY CUSTOMIZED ITINERARY', margin, currentY);
  currentY += 6;

  const daysList: Array<{
    dayNumber: number;
    title: string;
    location: string;
    description: string;
    activities?: string[];
    stayHotel?: string;
    meals?: string[];
  }> = data.itineraryDays && data.itineraryDays.length > 0
    ? data.itineraryDays
    : Array.from({ length: data.durationDays }, (_, i) => ({
        dayNumber: i + 1,
        title: i === 0 ? `Arrival & Welcome at ${data.destination.split('&')[0]}` : i === data.durationDays - 1 ? 'Departure & Return Journey' : `Scenic Exploration & Sightseeing Day ${i + 1}`,
        location: data.destination,
        description: `Enjoy a fully customized day exploring the finest scenic spots, chauffeured private transfers, and comfortable stays curated by Bhakti Sathi.`,
        activities: [],
        stayHotel: data.hotelTier,
        meals: [data.mealPlan || 'Daily Breakfast & Dinner'],
      }));

  for (const day of daysList) {
    const descLines = doc.splitTextToSize(day.description || '', contentWidth - 12);
    const cardH = 26 + descLines.length * 4.5 + (day.activities?.length ? 12 : 0);

    if (currentY + cardH > pageHeight - 20) {
      drawHeaderAndFooter();
      doc.addPage();
      pageNumber++;
      currentY = margin + 4;
    }

    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, currentY, contentWidth, cardH, 2.5, 2.5, 'FD');

    // Day badge
    doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.roundedRect(margin + 4, currentY + 4, 18, 6.5, 1.5, 1.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`DAY ${day.dayNumber}`, margin + 13, currentY + 8.8, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(day.title, margin + 26, currentY + 9);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Location: ${day.location}`, pageWidth - margin - 6, currentY + 9, { align: 'right' });

    // Divider inside day card
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, currentY + 13, pageWidth - margin - 4, currentY + 13);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(descLines, margin + 4, currentY + 18, { lineHeightFactor: 1.3 });

    currentY += cardH + 4;
  }

  // -------------------------------------------------------------
  // 5. INCLUSIONS & EXCLUSIONS CARD (IF ANY)
  // -------------------------------------------------------------
  const incExclH = 28;
  if (currentY + incExclH > pageHeight - 20) {
    drawHeaderAndFooter();
    doc.addPage();
    pageNumber++;
    currentY = margin + 4;
  }

  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, contentWidth, incExclH, 2.5, 2.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('OFFICIAL TOUR PROMISE & INCLUSIONS', margin + 4, currentY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('• Verified star accommodations, private hill-certified chauffeur cabs, and dedicated 24/7 guest support.', margin + 4, currentY + 12);
  doc.text('• Priority Darshan passes and custom travel assistance as configured.', margin + 4, currentY + 17);
  doc.text('• Document generated offline for personal travel reference and booking verification.', margin + 4, currentY + 22);

  // Draw final page header/footer
  drawHeaderAndFooter();

  // Save PDF
  const safeFilename = `BhaktiSathi_CustomItinerary_${data.travelerName.replace(/[^a-zA-Z0-9_-]/g, '') || 'Devotee'}.pdf`;
  doc.save(safeFilename);
}

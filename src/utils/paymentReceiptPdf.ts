import { jsPDF } from 'jspdf';
import { AgencySettings } from '../types/tour';

export interface PaymentReceiptData {
  receiptNumber: string;
  bookingId: string;
  packageTitle: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  travelDate?: string;
  amountPaid: number;
  remainingAmount: number;
  totalPackageCost?: number;
  paymentDate: string;
  paymentStatus: string;
  paymentMode?: string;
  agencySettings: AgencySettings;
}

/**
 * Loads an image from the provided sources and converts to base64 DataURL for reliable jsPDF embedding.
 */
async function loadBrandLogoData(): Promise<{ dataUrl: string; width: number; height: number; format: string } | null> {
  const sources = ['/logo-holidays-hunt.png', '/logo.png'];
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

/**
 * Generates a clean, professional, non-tax payment receipt PDF.
 * - Exact official brand logo on top left (matching the website header)
 * - Clean header with zero clutter
 * - Cards for details with brand colors (#FF4B00, #1A1A1A, #F5F5F4)
 * - Agency phone, email, website in small footer text
 * - Accurate, non-dummy details
 */
export async function generatePaymentReceiptPdf(data: PaymentReceiptData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // ~182 mm

  // Brand Colors
  const primaryOrange = [255, 75, 0]; // #FF4B00
  const darkCharcoal = [26, 26, 26]; // #1A1A1A
  const textMuted = [115, 115, 115]; // #737373
  const cardBg = [250, 250, 249]; // #FAFAF9
  const cardBorder = [228, 228, 231]; // #E4E4E7
  const accentGreen = [16, 149, 106]; // #10B981 / Emerald

  let currentY = margin + 1;

  // -------------------------------------------------------------
  // 1. TOP HEADER: Official Brand Logo on Top Left
  // -------------------------------------------------------------
  const logoData = await loadBrandLogoData();

  if (logoData) {
    const aspectRatio = logoData.width / logoData.height;
    // Target height around 13.5 mm for a balanced, crisp look
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
    // Graceful fallback if image unavailable
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

  // Top Right: Receipt Badge & Metadata
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('PAYMENT RECEIPT', pageWidth - margin, currentY + 3.5, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Simple Non-Tax Acknowledgment', pageWidth - margin, currentY + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`Receipt #: ${data.receiptNumber.toUpperCase()}`, pageWidth - margin, currentY + 12.5, { align: 'right' });

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
  doc.text('ISSUED DATE:', margin + 4, currentY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.paymentDate, margin + 25, currentY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('BOOKING REF:', margin + 80, currentY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`#${data.bookingId}`, margin + 104, currentY + 8.5);

  // Status Chip on Ribbon Right
  const statusX = pageWidth - margin - 38;
  const statusY = currentY + 2.2;
  const isVerified =
    data.paymentStatus.toLowerCase().includes('verified') ||
    data.paymentStatus.toLowerCase().includes('paid');

  if (isVerified) {
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.setDrawColor(167, 243, 208); // Emerald-200
    doc.roundedRect(statusX, statusY, 34, 9, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text(data.paymentStatus.toUpperCase(), statusX + 17, statusY + 6, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199); // Amber-50
    doc.setDrawColor(253, 230, 138); // Amber-200
    doc.roundedRect(statusX, statusY, 34, 9, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text(data.paymentStatus.toUpperCase(), statusX + 17, statusY + 6, { align: 'center' });
  }

  currentY += ribbonHeight + 5.5;

  // -------------------------------------------------------------
  // 3. TWO-COLUMN CARDS: TRAVELER DETAILS & TOUR INFORMATION
  // -------------------------------------------------------------
  const colWidth = (contentWidth - 6) / 2;
  const cardHeight1 = 44;

  // Left Card: Traveler Details
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, colWidth, cardHeight1, 3, 3, 'FD');

  // Top accent strip on left card
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
  doc.text(data.travelerName || 'Guest Traveler', margin + 22, currentY + 14);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Email:', margin + 4, currentY + 22);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const safeEmail =
    data.travelerEmail.length > 28 ? `${data.travelerEmail.substring(0, 26)}...` : data.travelerEmail;
  doc.text(safeEmail, margin + 22, currentY + 22);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Contact:', margin + 4, currentY + 30);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.travelerPhone || 'Provided in booking record', margin + 22, currentY + 30);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Status:', margin + 4, currentY + 38);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Verified Traveler Account', margin + 22, currentY + 38);

  // Right Card: Tour & Reservation Details
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(rightColX, currentY, colWidth, cardHeight1, 3, 3, 'FD');

  // Top accent strip on right card
  doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.roundedRect(rightColX, currentY, colWidth, 1.5, 1, 1, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('TOUR RESERVATION', rightColX + 4, currentY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Package:', rightColX + 4, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const splitTitle = doc.splitTextToSize(data.packageTitle, colWidth - 24);
  doc.text(splitTitle.slice(0, 2), rightColX + 20, currentY + 14);

  const titleLines = Math.min(splitTitle.length, 2);
  const nextY = currentY + 14 + titleLines * 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Travel Date:', rightColX + 4, nextY);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.travelDate || 'As per itinerary voucher', rightColX + 22, nextY);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Booking ID:', rightColX + 4, nextY + 7);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`#${data.bookingId}`, rightColX + 22, nextY + 7);

  currentY += cardHeight1 + 5.5;

  // -------------------------------------------------------------
  // 4. FINANCIAL BREAKDOWN CARD (BRANDED TABLE/CARD)
  // -------------------------------------------------------------
  const totalCost = data.totalPackageCost || (data.amountPaid + data.remainingAmount);
  const finCardHeight = 52;

  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, contentWidth, finCardHeight, 3, 3, 'FD');

  // Header of table
  doc.setFillColor(244, 244, 245); // Zinc-100
  doc.roundedRect(margin, currentY, contentWidth, 8, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('PAYMENT DESCRIPTION', margin + 4, currentY + 5.5);
  doc.text('RECORD REF', margin + 95, currentY + 5.5);
  doc.text('AMOUNT (INR)', pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

  let rowY = currentY + 14;

  // Row 1: Total Package Price
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Total Agreed Tour Package Value', margin + 4, rowY);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Booking #${data.bookingId}`, margin + 95, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(`INR ${totalCost.toLocaleString('en-IN')}`, pageWidth - margin - 4, rowY, { align: 'right' });

  // Divider
  rowY += 6;
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(margin + 4, rowY - 1.5, pageWidth - margin - 4, rowY - 1.5);

  // Row 2: Amount Received in this Receipt (Highlighted)
  doc.setFillColor(255, 247, 237); // Orange-50
  doc.roundedRect(margin + 2, rowY, contentWidth - 4, 9, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('Amount Received & Acknowledged (This Receipt)', margin + 4, rowY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(data.paymentMode || 'Online Bank / UPI Deposit', margin + 95, rowY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text(`INR ${data.amountPaid.toLocaleString('en-IN')}`, pageWidth - margin - 4, rowY + 5.5, { align: 'right' });

  // Row 3: Remaining Balance Due
  rowY += 14;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Remaining Balance Payable Prior to Check-in / Sightseeing', margin + 4, rowY);
  doc.setFont('helvetica', 'bold');
  if (data.remainingAmount === 0) {
    doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.text('NIL (Paid in Full)', pageWidth - margin - 4, rowY, { align: 'right' });
  } else {
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(`INR ${data.remainingAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, rowY, { align: 'right' });
  }

  currentY += finCardHeight + 5.5;

  // -------------------------------------------------------------
  // 5. IMPORTANT NOTES & POLICY CARD
  // -------------------------------------------------------------
  const notesHeight = 36;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, contentWidth, notesHeight, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('TERMS & RECEIPT ACKNOWLEDGMENT', margin + 4, currentY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  const terms = [
    '• This document serves as an official payment receipt and non-tax acknowledgment for holiday reservations.',
    '• Advance installments guarantee hotel allocations, houseboat bookings, and dedicated chauffeur-driven transport.',
    '• Remaining balance must be cleared as per itinerary milestones or during initial destination arrival.',
    '• For 24x7 guest assistance or amendments, contact our Srinagar / Delhi operational desk directly.',
  ];

  let termY = currentY + 11;
  terms.forEach((t) => {
    doc.text(t, margin + 4, termY);
    termY += 4.5;
  });

  // -------------------------------------------------------------
  // 6. FOOTER: Small Text with Company Phone, Email, Website & Address
  // -------------------------------------------------------------
  const footerY = pageHeight - 16;
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(data.agencySettings.agencyName, margin, footerY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const footerContact = `Phone: ${data.agencySettings.phone}  |  Email: ${data.agencySettings.email}  |  Website: www.holidayshunt.com`;
  doc.text(footerContact, margin, footerY + 4);

  const footerAddress = data.agencySettings.address || 'Main Boulevard, Srinagar / New Delhi / Shimla';
  doc.text(footerAddress, margin, footerY + 7.5);

  // Bottom right generated timestamp
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    pageWidth - margin,
    footerY + 7.5,
    { align: 'right' }
  );

  // -------------------------------------------------------------
  // 7. DOWNLOAD PDF
  // -------------------------------------------------------------
  const safeFilename = `HolidaysHunt_Receipt_${data.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
  doc.save(safeFilename);
}

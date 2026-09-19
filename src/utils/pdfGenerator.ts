import { jsPDF } from 'jspdf';
import { TourPackage, AgencySettings, Invoice, VendorPayment, Vendor, BookingInquiry, InquiryQuotation, PricingTiers } from '../types/tour';

const GOLD:[number,number,number]=[249,115,22], GOLD_DARK:[number,number,number]=[194,65,12], INK:[number,number,number]=[10,10,10], BODY:[number,number,number]=[68,64,60], MUTED:[number,number,number]=[120,113,108], LINE:[number,number,number]=[231,229,228], SOFT:[number,number,number]=[255,255,255], CREAM:[number,number,number]=[250,248,245], GREEN:[number,number,number]=[13,148,136];

function drawBackground(d: jsPDF, isCover = false, bgColor: [number,number,number] = CREAM) {
  const w = d.internal.pageSize.getWidth();
  const h = d.internal.pageSize.getHeight();
  d.setFillColor(...bgColor);
  d.rect(0, 0, w, h, 'F');
}

const clean=(v:unknown)=>{
  let str = String(v??'');
  return str
    .replace(/[•●]/g,'-')
    .replace(/[–—]/g,'-')
    .replace(/[“”]/g,'"')
    .replace(/[‘’]/g,"'")
    .replace(/₹/g,'INR ')
    .replace(/…/g,'...')
    .replace(/[⭐✨]/g, '*')
    .replace(/[✔✅]/g, 'Yes')
    .replace(/[❌✖]/g, 'No')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/[✓✗]/g, '');
};
const money=(v:number,c='INR')=>`${c} ${Math.round(v||0).toLocaleString('en-IN')}`;
const getHotelLocation = (hotel: any, pkg: any) => {
  let resolvedLoc = hotel.location || hotel.city || '';
  const hNameLower = (hotel.name || '').toLowerCase();
  if (hNameLower.includes('white water') || hNameLower.includes('pahalgam') || hNameLower.includes('lidder') || hNameLower.includes('chinar')) {
    resolvedLoc = 'Pahalgam';
  } else if (hNameLower.includes('gulmarg') || hNameLower.includes('snowland') || hNameLower.includes('pine palace')) {
    resolvedLoc = 'Gulmarg';
  } else if (hNameLower.includes('sonmarg') || hNameLower.includes('thajwas')) {
    resolvedLoc = 'Sonmarg';
  } else if (hNameLower.includes('katra') || hNameLower.includes('vaishno') || hNameLower.includes('white coral')) {
    resolvedLoc = 'Katra';
  } else if (hNameLower.includes('houseboat') || hNameLower.includes('srinagar') || hNameLower.includes('dal lake') || hNameLower.includes('blanco') || hNameLower.includes('grand kaiser')) {
    resolvedLoc = 'Srinagar';
  }
  return clean(resolvedLoc || hotel.country || pkg.destination);
};
const doc=()=>new jsPDF({orientation:'portrait',unit:'pt',format:'a4',compress:true});
function header(d:jsPDF,a:AgencySettings,label:string,p:number,logoData?:any){
  const w=d.internal.pageSize.getWidth(),h=d.internal.pageSize.getHeight();
  d.setFillColor(...INK);
  d.rect(0,0,w,5,'F');
  
  if (logoData) {
    const aspectRatio = logoData.width / logoData.height;
    const targetHeight = 34; // Increased logo size
    const targetWidth = Math.min(targetHeight * aspectRatio, 180);
    const calculatedHeight = targetWidth / aspectRatio;
    d.addImage(logoData.dataUrl, 'PNG', 28, 12, targetWidth, calculatedHeight, undefined, 'FAST');
    // Removed the "TRAVEL QUOTATION" label text below logo to avoid collision and keep it clean
  } else {
    d.setFont('helvetica','bold');
    d.setFontSize(13);
    d.setTextColor(...INK);
    d.text(clean(a.agencyName || 'Holidays Hunt'),28,26);
    d.setFontSize(8.5);
    d.setTextColor(...GOLD);
    d.text(clean(label).toUpperCase(),28,36);
  }

  d.setFont('helvetica','normal');
  d.setFontSize(8.5);
  d.setTextColor(...BODY);
  const displayEmail = a.email || 'info@holidayshunt.com';
  const displayWebsite = 'holidayshunt.com';
  if(a.phone)d.text(clean(a.phone),w-28,22,{align:'right'});
  d.text(displayEmail,w-28,34,{align:'right'});
  d.text(displayWebsite,w-28,46,{align:'right'});
  
  // Removed the top horizontal line entirely as requested ("Remove this line...")
  
  // Footer with contact details (Keep this)
  d.setDrawColor(...LINE);
  d.setLineWidth(0.5);
  d.line(28, h-26, w-28, h-26);
  d.setFontSize(7.5);
  d.setFont('helvetica', 'normal');
  d.setTextColor(...MUTED);
  d.text('Holidays Hunt Travel and Hospitality Pvt Ltd', 28, h-12);
  const contactStr = [a.phone, 'holidayshunt@gmail.com', 'holidayshunt.com'].filter(Boolean).map(clean).join('  |  ');
  if (contactStr) {
    d.text(contactStr, w/2 + 25, h-12, {align:'center'});
  }
  d.text(`Page ${p}`, w-28, h-12, {align:'right'});
}
function title(d:jsPDF,t:string,y:number,s=16){
  d.setFont('helvetica','bold');
  d.setFontSize(s);
  d.setTextColor(...INK);
  const w=d.internal.pageSize.getWidth();
  const l=d.splitTextToSize(clean(t),w-56);
  d.text(l,28,y,{lineHeightFactor:1.15});
  return y+l.length*s*1.15;
}
function sec(d:jsPDF,t:string,y:number){
  d.setFont('helvetica','bold');
  d.setFontSize(9);
  d.setTextColor(...GOLD);
  d.text(clean(t).toUpperCase(),28,y);
  d.setDrawColor(...GOLD);
  d.setLineWidth(1.5);
  d.line(28,y+4,70,y+4);
  return y+16;
}
function card(d:jsPDF,x:number,y:number,w:number,h:number,fill=SOFT,stroke=LINE){
  // Draw extremely subtle, elegant warm-pink drop shadow
  d.setFillColor(242, 239, 235);
  d.roundedRect(x + 1.5, y + 2, w, h, 6, 6, 'F');
  // Draw the actual card on top
  d.setFillColor(...fill);
  d.setDrawColor(...stroke);
  d.setLineWidth(0.45);
  d.roundedRect(x,y,w,h,6,6,'FD');
}
function para(d:jsPDF,t:string,y:number,width=539,size=9.5){
  d.setFont('helvetica','normal');
  d.setFontSize(size);
  d.setTextColor(...BODY);
  const l=d.splitTextToSize(clean(t),width);
  d.text(l,28,y,{lineHeightFactor:1.35});
  return y+l.length*size*1.35;
}
function bullets(d:jsPDF,items:string[],y:number,width=510){
  d.setFont('helvetica','normal');
  d.setFontSize(9);
  d.setTextColor(...BODY);
  for(const item of items||[]){
    const l=d.splitTextToSize(clean(item),width-16);
    d.setFillColor(...GOLD);
    d.circle(38,y-3,1.5,'F');
    d.text(l,48,y,{lineHeightFactor:1.35});
    y+=Math.max(16,l.length*9*1.35+4);
  }
  return y;
}
function next(d:jsPDF,a:AgencySettings,label:string,p:number,logoData?:any, bgColor: [number,number,number] = CREAM){
  d.addPage();
  drawBackground(d, false, bgColor);
  header(d,a,label,p,logoData);
  return 72;
}

export async function generateQuotationPDF(inq:BookingInquiry,pkg:TourPackage|undefined,q:InquiryQuotation,a:AgencySettings):Promise<void>{
  const d=doc();
  const logoData = await loadBrandLogoData();
  const margin = 28;
  const contentWidth = 539;
  const maxPageHeight = 770; // adjusted for footer

  d.setProperties({title:`Travel Proposal - ${inq.travelerName}`,author:a.agencyName||'Holidays Hunt'});
  let p=1,y=72;
  drawBackground(d,false,SOFT);
  header(d,a,'Travel Quotation & Proposal',p, logoData);

  // Local drawCard WITHOUT watermark as requested
  const drawCard = (docInstance: any, cx: number, cy: number, cw: number, ch: number, fill = SOFT, stroke = LINE) => {
    docInstance.setFillColor(242, 239, 235);
    docInstance.roundedRect(cx + 1.5, cy + 2, cw, ch, 6, 6, 'F');
    docInstance.setFillColor(...fill);
    docInstance.setDrawColor(...stroke);
    docInstance.setLineWidth(0.45);
    docInstance.roundedRect(cx, cy, cw, ch, 6, 6, 'FD');
  };

  const drawSecHeader = (docInstance: any, t: string, cy: number) => {
    if (cy + 40 > maxPageHeight) { p++; cy = next(docInstance, a, 'Travel Proposal', p, logoData, SOFT); }
    docInstance.setFont('helvetica','bold');
    docInstance.setFontSize(9);
    docInstance.setTextColor(...GOLD);
    docInstance.text(clean(t).toUpperCase(), margin, cy);
    docInstance.setDrawColor(...GOLD);
    docInstance.setLineWidth(1.5);
    docInstance.line(margin, cy+4, margin+42, cy+4);
    return cy+16;
  };

  d.setFont('helvetica','bold');
  d.setFontSize(8.5);
  d.setTextColor(...GOLD);
  d.text('PERSONALISED TRAVEL PROPOSAL', margin, y);
  y+=24;
  
  y=title(d,inq.packageTitle||pkg?.title||'Custom Holiday',y,15)+4;
  y=para(d,pkg?.tagline||'A thoughtfully designed journey by Holidays Hunt',y,539,9.5)+10;
  
  // Traveller & Validity Card
  drawCard(d, margin, y, contentWidth, 84, SOFT, LINE);
  d.setFont('helvetica','bold');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('TRAVELLER', margin+10, y+16);
  d.text('PROPOSAL VALIDITY', 320, y+16);
  
  d.setFontSize(11);
  d.setTextColor(...INK);
  d.text(clean(inq.travelerName), margin+10, y+30);
  
  d.setFont('helvetica','normal');
  d.setFontSize(8.5);
  d.setTextColor(...BODY);
  d.text(`Phone: ${clean(inq.phone)}`, margin+10, y+43);
  d.text(`Email: ${clean(inq.email)}`, margin+10, y+54);
  d.text(`${inq.adults||0} Adults  |  ${inq.children||0} Children`, margin+10, y+65);
  
  d.setFont('helvetica','bold');
  d.setFontSize(10);
  d.setTextColor(...GOLD);
  d.text(clean(q.validUntil), 320, y+30);
  
  d.setFont('helvetica','normal');
  d.setFontSize(8.5);
  d.setTextColor(...BODY);
  d.text('Rates subject to availability.', 320, y+43);
  d.text(`Travel date: ${clean(inq.travelDate)}`, 320, y+56);
  y+=110; // proper space
  
  // Snapshot Card with Dynamic Height & Full Multi-line Text Wrapping
  const destVal = q.destination || pkg?.destination || inq.packageTitle || 'Jammu & Kashmir';
  const durVal = q.duration || (pkg ? `${pkg.durationDays} Days / ${pkg.durationNights} Nights` : 'Customized Itinerary');
  const hotelVal = q.hotels || (pkg?.hotels?.length ? pkg.hotels.map(h => `${h.location ? h.location + ': ' : ''}${h.name}${h.alternativeHotel ? '/' + h.alternativeHotel : ''}`).join(', ') : 'Handpicked Deluxe Hotels + Luxury Houseboat');
  const transVal = q.cabType || (pkg?.transportation || 'Dedicated Private AC Chauffeur Vehicle');

  const halfWidth = (contentWidth - 28) / 2; // ~255.5pt
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  const destLines = d.splitTextToSize(clean(destVal), halfWidth);
  const durLines = d.splitTextToSize(clean(durVal), halfWidth);

  d.setFont('helvetica', 'normal');
  d.setFontSize(8.5);
  const hotelLines = d.splitTextToSize(clean(hotelVal), halfWidth);
  const transLines = d.splitTextToSize(clean(transVal), halfWidth);

  const row1TextH = Math.max(destLines.length, durLines.length) * 11.5;
  const row2TextH = Math.max(hotelLines.length, transLines.length) * 11.5;
  const snapH = 14 + 12 + row1TextH + 10 + 12 + row2TextH + 14;

  if (y + snapH > maxPageHeight) { p++; y = next(d, a, 'Travel Proposal', p, logoData, SOFT); }
  y = drawSecHeader(d, 'Journey snapshot', y);
  drawCard(d, margin, y, contentWidth, snapH);

  // Row 1: Destination & Duration
  let curSnapY = y + 14;
  d.setFont('helvetica', 'bold');
  d.setFontSize(7);
  d.setTextColor(...MUTED);
  d.text('DESTINATION', margin + 12, curSnapY);
  d.text('DURATION', margin + 12 + halfWidth + 14, curSnapY);

  curSnapY += 11;
  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...INK);
  d.text(destLines, margin + 12, curSnapY, { lineHeightFactor: 1.25 });
  d.text(durLines, margin + 12 + halfWidth + 14, curSnapY, { lineHeightFactor: 1.25 });

  curSnapY += row1TextH + 6;

  // Divider Line
  d.setDrawColor(...LINE);
  d.setLineWidth(0.4);
  d.line(margin + 12, curSnapY, margin + contentWidth - 12, curSnapY);

  curSnapY += 8;

  // Row 2: Hotels & Transport
  d.setFont('helvetica', 'bold');
  d.setFontSize(7);
  d.setTextColor(...MUTED);
  d.text('HOTELS & ACCOMMODATION', margin + 12, curSnapY);
  d.text('TRANSPORT & TRANSFERS', margin + 12 + halfWidth + 14, curSnapY);

  curSnapY += 11;
  d.setFont('helvetica', 'normal');
  d.setFontSize(8.5);
  d.setTextColor(...BODY);
  d.text(hotelLines, margin + 12, curSnapY, { lineHeightFactor: 1.3 });
  d.text(transLines, margin + 12 + halfWidth + 14, curSnapY, { lineHeightFactor: 1.3 });

  y += snapH + 24;
  
  // Commercial Proposal Card
  if (y + 86 > maxPageHeight) { p++; y = next(d, a, 'Travel Proposal', p, logoData, SOFT); }
  y=drawSecHeader(d,'Commercial proposal',y);
  drawCard(d, margin, y, contentWidth, 76, CREAM, GOLD);
  d.setFont('helvetica','normal');
  d.setFontSize(8.5);
  d.setTextColor(...MUTED);
  d.text('PROPOSED PACKAGE VALUE', margin+10, y+18);
  d.setFont('helvetica','bold');
  d.setFontSize(18);
  d.setTextColor(...GOLD);
  d.text(money(q.finalPrice), margin+10, y+38);
  
  d.setFont('helvetica','normal');
  d.setFontSize(8.5);
  d.setTextColor(...BODY);
  d.text(`Base ${money(q.basePrice||0)}    Discount ${money(q.discount||0)}`, margin+10, y+53);
  d.setFont('helvetica','bold');
  d.setFontSize(8);
  d.setTextColor(...GOLD); // changed from GREEN to GOLD (brand)
  d.text('CUSTOMISED PRICE - CONFIRMATION REQUIRED', margin+10, y+65);
  y+=106; // proper space
  
  // Inclusions & Exclusions Stacked (Dynamic Heights)
  const cleanList = (list: string[]) => {
    const res: string[] = [];
    for (const item of list || []) {
      if (!item) continue;
      const str = String(item);
      const subLines = str.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      for (const line of subLines) {
        const cleaned = line.replace(/^[-•*●\d+.)]\s*/, '').trim();
        if (!cleaned) continue;
        if (res.length > 0 && (cleaned.match(/^[a-z]/) || cleaned.match(/^[0-9]+$/) || cleaned.match(/^[0-9]+\)/) || cleaned.match(/^(or|and)\s/i))) {
          res[res.length - 1] += ' ' + cleaned;
        } else {
          res.push(cleaned);
        }
      }
    }
    return res;
  };
  const incList = cleanList(q.inclusions || []);
  const excList = cleanList(q.exclusions || []);
  
  if (incList.length > 0) {
    let incH = 48;
    d.setFont('helvetica','normal'); d.setFontSize(10.5); // SET FONT FIRST!
    incList.forEach(item => { incH += d.splitTextToSize(clean(item), contentWidth - 40).length * 13.5 + 8; });
    if (y + incH > maxPageHeight) { p++; y = next(d, a, 'Travel Proposal', p, logoData, SOFT); }
    y=drawSecHeader(d,'Inclusions',y);
    drawCard(d, margin, y, contentWidth, incH, SOFT, LINE);
    d.setFillColor(...GOLD); d.roundedRect(margin+10, y+10, 95, 20, 4, 4, 'F');
    d.setFont('helvetica','bold'); d.setFontSize(10); d.setTextColor(255,255,255);
    d.text('INCLUSIONS', margin+57.5, y+24, {align: 'center'});
    
    let curY = y + 44;
    d.setFont('helvetica','normal'); d.setFontSize(10.5); d.setTextColor(...BODY);
    incList.forEach(item => {
      d.setFillColor(...GOLD); d.circle(margin+16, curY - 3, 2.5, 'F');
      const lines = d.splitTextToSize(clean(item), contentWidth - 40);
      d.text(lines, margin+26, curY, { lineHeightFactor: 1.35 });
      curY += lines.length * 13.5 + 8;
    });
    y += incH + 36; // proper space
  }

  if (excList.length > 0) {
    let excH = 48;
    d.setFont('helvetica','normal'); d.setFontSize(10.5); // SET FONT FIRST!
    excList.forEach(item => { excH += d.splitTextToSize(clean(item), contentWidth - 40).length * 13.5 + 8; });
    if (y + excH > maxPageHeight) { p++; y = next(d, a, 'Travel Proposal', p, logoData, SOFT); }
    y=drawSecHeader(d,'Exclusions',y);
    drawCard(d, margin, y, contentWidth, excH, SOFT, LINE);
    d.setFillColor(...GOLD); d.roundedRect(margin+10, y+10, 100, 20, 4, 4, 'F');
    d.setFont('helvetica','bold'); d.setFontSize(10); d.setTextColor(255,255,255);
    d.text('EXCLUSIONS', margin+60, y+24, {align: 'center'});
    
    let curY = y + 44;
    d.setFont('helvetica','normal'); d.setFontSize(10.5); d.setTextColor(...BODY);
    excList.forEach(item => {
      d.setFillColor(...GOLD); d.circle(margin+16, curY - 3, 2.5, 'F');
      const lines = d.splitTextToSize(clean(item), contentWidth - 40);
      d.text(lines, margin+26, curY, { lineHeightFactor: 1.35 });
      curY += lines.length * 13.5 + 8;
    });
    y += excH + 36; // proper space
  }
  
  // Day-by-Day Itinerary if any
  if(pkg?.itinerary?.length){
    if (y + 100 > maxPageHeight) { p++; y = next(d, a, 'Travel Proposal - Itinerary', p, logoData, SOFT); }
    y=drawSecHeader(d,'Day-by-day itinerary',y);
    for(const day of pkg.itinerary){
      d.setFont('helvetica','bold'); d.setFontSize(10.5); // SET FONT BEFORE SPLIT
      const titleLines = d.splitTextToSize(clean(day.title), contentWidth - 90);
      d.setFont('helvetica','normal'); d.setFontSize(8.5);
      const locLines = day.location ? d.splitTextToSize(`Location: ${clean(day.location)}`, contentWidth - 90) : [];
      d.setFont('helvetica','normal'); d.setFontSize(10);
      const descLines = d.splitTextToSize(clean(day.description||''), contentWidth - 32);
      d.setFont('helvetica','italic'); d.setFontSize(9);
      const stayLines = (day as any).accommodation ? d.splitTextToSize(`Stay: ${clean((day as any).accommodation)} | Meals: ${clean(day.meals||'')}`, contentWidth - 32) : [];
      
      const topSectionH = Math.max(30, (titleLines.length * 13) + (locLines.length * 11) + 4);
      const dayCardH = 16 + topSectionH + 12 + (descLines.length * 14.5) + (stayLines.length ? stayLines.length * 12 + 8 : 0) + 16;
      
      if(y + dayCardH > maxPageHeight){
        p++;
        y = next(d, a, 'Travel Proposal - Itinerary', p, logoData, SOFT);
        y = drawSecHeader(d, 'Day-by-day itinerary (Cont.)', y);
      }
      
      drawCard(d, margin, y, contentWidth, dayCardH, SOFT, LINE);
      
      d.setFillColor(...GOLD); d.roundedRect(margin+12, y+14, 54, 20, 4, 4, 'F');
      d.setFont('helvetica','bold'); d.setFontSize(9); d.setTextColor(255,255,255);
      d.text(`DAY ${day.dayNumber}`, margin+39, y+27.5, {align:'center'});
      
      let cy = y + 26;
      d.setFont('helvetica','bold'); d.setFontSize(10.5); d.setTextColor(...INK);
      d.text(titleLines, margin+76, cy, {lineHeightFactor: 1.25});
      cy += titleLines.length * 13;
      
      if (locLines.length > 0) {
        d.setFont('helvetica','normal'); d.setFontSize(8.5); d.setTextColor(...MUTED);
        d.text(locLines, margin+76, cy, {lineHeightFactor: 1.25});
      }
      cy = y + 16 + topSectionH + 12;
      
      d.setFontSize(10); d.setTextColor(...BODY);
      d.text(descLines, margin+16, cy, {lineHeightFactor: 1.45});
      cy += descLines.length * 14.5 + 10;
      
      if (stayLines.length > 0) {
        d.setFont('helvetica','italic'); d.setFontSize(9); d.setTextColor(...MUTED);
        d.text(stayLines, margin+16, cy, {lineHeightFactor: 1.3});
      }
      
      y += dayCardH + 24; // proper space
    }
  }
  
  if(y+140>maxPageHeight){
    p++;
    y=next(d,a,'Travel Proposal - Notes',p, logoData, SOFT);
  }
  y=drawSecHeader(d,'Important notes',y);
  y=para(d,q.notes||'This proposal is prepared exclusively for the traveller named above and is subject to availability.',y,539,9.5)+10;
  
  drawCard(d, margin, y, contentWidth, 76, CREAM, GOLD);
  d.setFont('helvetica','bold');
  d.setFontSize(9.5);
  d.setTextColor(...INK);
  d.text('Ready to confirm?', margin+10, y+20);
  d.setFont('helvetica','normal');
  d.setFontSize(9);
  d.setTextColor(...BODY);
  d.text(d.splitTextToSize(`Reply to this proposal or contact ${clean(a.phone||'')} / ${clean(a.whatsapp||'')} to confirm availability and next steps.`, 510), margin+10, y+36, {lineHeightFactor:1.3});
  d.setFont('helvetica','bold');
  d.setFontSize(9);
  d.setTextColor(...GOLD);
  d.text('Thank you for choosing Holidays Hunt.', margin+10, y+62);
  
  d.save(`Holidays-Hunt-Proposal-${clean(inq.travelerName).replace(/[^a-z0-9]+/gi,'-')}.pdf`);
}
export async function generateInvoicePDF(inv:Invoice,a:AgencySettings):Promise<void>{
  const d=doc();
  const w=d.internal.pageSize.getWidth();
  const h=d.internal.pageSize.getHeight();
  const logoData = await loadBrandLogoData();
  const margin = 28;
  const contentWidth = 539;

  let y = margin;

  d.setFillColor(255, 255, 255);
  d.rect(0, 0, w, h, 'F');

  if (logoData) {
    const aspectRatio = logoData.width / logoData.height;
    const targetHeight = 34; 
    const targetWidth = Math.min(targetHeight * aspectRatio, 180);
    const calculatedHeight = targetWidth / aspectRatio;
    d.addImage(logoData.dataUrl, 'PNG', margin, y, targetWidth, calculatedHeight, undefined, 'FAST');
  } else {
    d.setFont('helvetica', 'bold');
    d.setFontSize(16);
    d.setTextColor(...INK);
    d.text('Holidays Hunt', margin, y + 16);
  }

  const isTax = inv.taxPercent && inv.taxPercent > 0;
  const mainTitle = isTax ? 'TAX INVOICE' : 'INVOICE';
  const subTitle = isTax ? 'Official Tax Invoice' : '';

  d.setFont('helvetica', 'bold');
  d.setFontSize(14);
  d.setTextColor(...GOLD);
  d.text(mainTitle, w - margin, y + 12, { align: 'right' });
  
  d.setFont('helvetica', 'normal');
  d.setFontSize(9);
  d.setTextColor(...MUTED);
  d.text(subTitle, w - margin, y + 26, { align: 'right' });
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...INK);
  d.text(`Receipt #: ${inv.invoiceNumber}`, w - margin, y + 40, { align: 'right' });

  y += 54;
  d.setDrawColor(...LINE);
  d.setLineWidth(1);
  d.line(margin, y, w - margin, y);
  y += 16;

  // SUMMARY BOX
  d.setDrawColor(...LINE);
  d.setFillColor(250, 250, 250);
  d.roundedRect(margin, y, contentWidth, 36, 6, 6, 'FD');
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('ISSUED DATE:', margin + 12, y + 22);
  d.setFont('helvetica', 'bold');
  d.setFontSize(8.5);
  d.setTextColor(...INK);
  d.text(clean(inv.issueDate || ''), margin + 74, y + 22);

  d.setFont('helvetica', 'bold');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('DUE DATE:', margin + 220, y + 22);
  d.setFont('helvetica', 'bold');
  d.setFontSize(8.5);
  d.setTextColor(...INK);
  d.text(clean(inv.dueDate || ''), margin + 270, y + 22);

  const statusStr = (inv.status || 'PENDING').toUpperCase();
  const isPaid = statusStr.includes('PAID');
  const statusColor = isPaid ? [16, 185, 129] : [245, 158, 11];
  d.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  d.setFillColor(255, 255, 255);
  d.roundedRect(w - margin - 100, y + 8, 88, 20, 10, 10, 'FD');
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  d.text(statusStr, w - margin - 56, y + 21, { align: 'center' });

  y += 56;

  // Measure content for dynamic card heights
  const cardW = (contentWidth - 16) / 2;
  let leftY = y + 40;
  let rightY = y + 40;

  const leftItems = [
    ['Name:', inv.clientName],
    ['Email:', inv.clientEmail],
    ['Phone:', inv.clientPhone],
    ['Travel Date:', inv.travelDate],
  ];
  
  const rightItems = [
    ['Package:', inv.packageTitle || 'Custom Tour'],
    ['Adults:', `${inv.paxAdults || 0}`],
    ['Children:', `${inv.paxChildren || 0}`],
    ['Status:', inv.status],
  ];

  let leftH = 50;
  leftItems.forEach(item => {
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    leftH += 16 * textLines.length;
  });

  let rightH = 50;
  rightItems.forEach(item => {
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    rightH += 16 * textLines.length;
  });

  const cardsHeight = Math.max(110, leftH, rightH);

  // Left Card (CLIENT DETAILS)
  d.setDrawColor(...LINE);
  d.setFillColor(252, 252, 252);
  d.roundedRect(margin, y, cardW, cardsHeight, 6, 6, 'FD');
  d.setDrawColor(...GOLD);
  d.setLineWidth(4);
  d.line(margin, y + 2, margin + cardW, y + 2);
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...GOLD);
  d.text('CLIENT DETAILS', margin + 12, y + 20);
  
  leftItems.forEach(item => {
    d.setFont('helvetica', 'bold');
    d.setFontSize(8);
    d.setTextColor(...MUTED);
    d.text(item[0], margin + 12, leftY);
    d.setFont('helvetica', 'bold');
    d.setFontSize(8.5);
    d.setTextColor(...INK);
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    d.text(textLines, margin + 60, leftY);
    leftY += 16 * textLines.length;
  });

  // Right Card (INVOICE DETAILS)
  d.setDrawColor(...LINE);
  d.setFillColor(252, 252, 252);
  d.setLineWidth(1);
  d.roundedRect(margin + cardW + 16, y, cardW, cardsHeight, 6, 6, 'FD');
  d.setDrawColor(...INK);
  d.setLineWidth(4);
  d.line(margin + cardW + 16, y + 2, margin + contentWidth, y + 2);

  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...INK);
  d.text('INVOICE DETAILS', margin + cardW + 16 + 12, y + 20);

  rightItems.forEach(item => {
    d.setFont('helvetica', 'bold');
    d.setFontSize(8);
    d.setTextColor(...MUTED);
    d.text(item[0], margin + cardW + 16 + 12, rightY);
    d.setFont('helvetica', 'bold');
    d.setFontSize(8.5);
    d.setTextColor(...INK);
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    d.text(textLines, margin + cardW + 16 + 60, rightY);
    rightY += 16 * textLines.length;
  });

  y += cardsHeight + 20;

  // ITEMS TABLE
  d.setDrawColor(...LINE);
  d.setLineWidth(1);
  d.setFillColor(252, 252, 252);
  
  d.roundedRect(margin, y, contentWidth, 30, 6, 6, 'FD');
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(...INK);
  d.text('ITEM DESCRIPTION', margin + 12, y + 19);
  d.text('QTY', margin + 360, y + 19);
  d.text('AMOUNT', margin + contentWidth - 12, y + 19, { align: 'right' });
  
  y += 40;

  const cur = inv.currency || 'INR';

  inv.items?.forEach(it => {
    // Page break check for items
    if (y > h - 100) {
      d.addPage();
      d.setFillColor(255, 255, 255);
      d.rect(0, 0, w, h, 'F');
      y = margin + 20;
    }

    d.setFont('helvetica', 'normal');
    d.setFontSize(8.5);
    d.setTextColor(...BODY);
    
    const lines = d.splitTextToSize(clean(it.description), 320);
    d.text(lines, margin + 12, y);
    
    d.text(`${it.quantity}`, margin + 360, y);
    d.setFont('helvetica', 'bold');
    d.setTextColor(...INK);
    d.text(money(it.amount, cur), margin + contentWidth - 12, y, { align: 'right' });
    
    y += lines.length * 16 + 8;
  });

  d.setDrawColor(...LINE);
  d.line(margin, y, margin + contentWidth, y);
  y += 20;

  // Page break check before totals
  if (y > h - 180) {
    d.addPage();
    d.setFillColor(255, 255, 255);
    d.rect(0, 0, w, h, 'F');
    y = margin + 20;
  }

  const tRow = (label: string, val: number, isBold = false, color = INK) => {
    d.setFont('helvetica', isBold ? 'bold' : 'normal');
    d.setFontSize(isBold ? 9 : 8.5);
    d.setTextColor(color[0], color[1], color[2]);
    d.text(label, margin + 300, y);
    d.text(money(val, cur), margin + contentWidth - 12, y, { align: 'right' });
    y += 20;
  };

  tRow('Subtotal', inv.subtotal);
  if (inv.discount > 0) tRow('Discount', -inv.discount);
  if (isTax) tRow(`Tax (${inv.taxPercent}%)`, inv.taxAmount);
  
  y -= 6;
  d.setDrawColor(...LINE);
  d.line(margin + 280, y, margin + contentWidth, y);
  y += 14;
  
  tRow('Total Agreed Value', inv.grandTotal, true);
  tRow('Amount Received (This Receipt)', inv.paidAmount, true, GOLD);
  
  const balColor = inv.balanceDue <= 0 ? [16, 185, 129] : INK;
  const balText = inv.balanceDue <= 0 ? 'NIL (Paid in Full)' : money(inv.balanceDue, cur);
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(9.5);
  d.setTextColor(balColor[0], balColor[1], balColor[2]);
  d.text('Remaining Balance', margin + 300, y);
  d.text(balText, margin + contentWidth - 12, y, { align: 'right' });
  
  y += 40;

  if (y + 100 > h) {
    d.addPage();
    d.setFillColor(255, 255, 255);
    d.rect(0, 0, w, h, 'F');
    y = margin + 20;
  }

  d.setDrawColor(...LINE);
  d.setFillColor(252, 252, 252);
  d.roundedRect(margin, y, contentWidth, 70, 6, 6, 'FD');
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(...INK);
  d.text('TERMS & RECEIPT ACKNOWLEDGMENT', margin + 12, y + 20);
  
  d.setFont('helvetica', 'normal');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('• This document serves as an official payment receipt and non-tax acknowledgment for holiday reservations.', margin + 12, y + 36);
  d.text('• Advance installments guarantee hotel allocations, houseboat bookings, and dedicated chauffeur-driven transport.', margin + 12, y + 48);
  d.text('• Remaining balance must be cleared as per itinerary milestones or during initial destination arrival.', margin + 12, y + 60);

  // FOOTER
  d.setDrawColor(...LINE);
  d.line(margin, h - 36, w - margin, h - 36);
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(...INK);
  d.text('Holidays Hunt Travel and Hospitality Pvt Ltd', margin, h - 22);
  
  d.setFont('helvetica', 'normal');
  d.setFontSize(7);
  d.setTextColor(...MUTED);
  const footContact = `Phone: ${a.phone||''}  |  Email: holidayshunt@gmail.com  |  Website: holidayshunt.com`;
  d.text(footContact, margin, h - 12);
  d.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, w - margin, h - 12, { align: 'right' });

  d.save(`Holidays-Hunt-${inv.invoiceNumber}.pdf`);
}

export async function generateVendorVoucherPDF(pay:VendorPayment,vendor:Vendor|undefined,a:AgencySettings):Promise<void>{
  const d=doc();
  const w=d.internal.pageSize.getWidth();
  const h=d.internal.pageSize.getHeight();
  const logoData = await loadBrandLogoData();
  const margin = 28;
  const contentWidth = 539;

  let y = margin;

  d.setFillColor(255, 255, 255);
  d.rect(0, 0, w, h, 'F');

  if (logoData) {
    const aspectRatio = logoData.width / logoData.height;
    const targetHeight = 34;
    const targetWidth = Math.min(targetHeight * aspectRatio, 180);
    const calculatedHeight = targetWidth / aspectRatio;
    d.addImage(logoData.dataUrl, 'PNG', margin, y, targetWidth, calculatedHeight, undefined, 'FAST');
  } else {
    d.setFont('helvetica', 'bold');
    d.setFontSize(16);
    d.setTextColor(...INK);
    d.text('Holidays Hunt', margin, y + 16);
  }

  d.setFont('helvetica', 'bold');
  d.setFontSize(14);
  d.setTextColor(...GOLD);
  d.text('PAYMENT RECEIPT', w - margin, y + 12, { align: 'right' });
  
  d.setFont('helvetica', 'normal');
  d.setFontSize(9);
  d.setTextColor(...MUTED);
  d.text('Vendor Service & Payment Acknowledgment', w - margin, y + 26, { align: 'right' });
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...INK);
  d.text(`Receipt #: ${pay.voucherNumber}`, w - margin, y + 40, { align: 'right' });

  y += 54;
  d.setDrawColor(...LINE);
  d.setLineWidth(1);
  d.line(margin, y, w - margin, y);
  y += 16;

  d.setDrawColor(...LINE);
  d.setFillColor(250, 250, 250); 
  d.roundedRect(margin, y, contentWidth, 36, 6, 6, 'FD');
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('ISSUED DATE:', margin + 12, y + 22);
  d.setFont('helvetica', 'bold');
  d.setFontSize(8.5);
  d.setTextColor(...INK);
  d.text(clean(pay.serviceDate || ''), margin + 74, y + 22);

  d.setFont('helvetica', 'bold');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('SERVICE TYPE:', margin + 220, y + 22);
  d.setFont('helvetica', 'bold');
  d.setFontSize(8.5);
  d.setTextColor(...INK);
  d.text(clean(pay.vendorCategory || ''), margin + 290, y + 22);

  const statusStr = (pay.paymentStatus || 'PENDING').toUpperCase();
  const isPaid = statusStr.includes('PAID');
  const statusColor = isPaid ? [16, 185, 129] : [245, 158, 11];
  d.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  d.setFillColor(255, 255, 255);
  d.roundedRect(w - margin - 100, y + 8, 88, 20, 10, 10, 'FD');
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  d.text(statusStr, w - margin - 56, y + 21, { align: 'center' });

  y += 56;

  const cardW = (contentWidth - 16) / 2;
  let leftY = y + 40;
  let rightY = y + 40;

  const leftItems = [
    ['Name:', vendor?.name || pay.vendorName],
    ['Email:', vendor?.email || '---'],
    ['Contact:', vendor?.phone || '---'],
    ['Status:', 'Verified Vendor'],
  ];
  
  const rightItems = [
    ['Details:', pay.serviceDescription || '---'],
    ['Traveler:', pay.travelerName || '---'],
    ['Due Date:', pay.dueDate || '---'],
  ];

  let leftH = 50;
  leftItems.forEach(item => {
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    leftH += 16 * textLines.length;
  });

  let rightH = 50;
  rightItems.forEach(item => {
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    rightH += 16 * textLines.length;
  });

  const cardsHeight = Math.max(110, leftH, rightH);

  d.setDrawColor(...LINE);
  d.setFillColor(252, 252, 252);
  d.roundedRect(margin, y, cardW, cardsHeight, 6, 6, 'FD');
  d.setDrawColor(...GOLD);
  d.setLineWidth(4);
  d.line(margin, y + 2, margin + cardW, y + 2);
  
  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...GOLD);
  d.text('VENDOR DETAILS', margin + 12, y + 20);
  
  leftItems.forEach(item => {
    d.setFont('helvetica', 'bold');
    d.setFontSize(8);
    d.setTextColor(...MUTED);
    d.text(item[0], margin + 12, leftY);
    d.setFont('helvetica', 'bold');
    d.setFontSize(8.5);
    d.setTextColor(...INK);
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    d.text(textLines, margin + 60, leftY);
    leftY += 16 * textLines.length;
  });

  d.setDrawColor(...LINE);
  d.setFillColor(252, 252, 252);
  d.setLineWidth(1);
  d.roundedRect(margin + cardW + 16, y, cardW, cardsHeight, 6, 6, 'FD');
  d.setDrawColor(...INK);
  d.setLineWidth(4);
  d.line(margin + cardW + 16, y + 2, margin + contentWidth, y + 2);

  d.setFont('helvetica', 'bold');
  d.setFontSize(9);
  d.setTextColor(...INK);
  d.text('SERVICE RESERVATION', margin + cardW + 16 + 12, y + 20);

  rightItems.forEach(item => {
    d.setFont('helvetica', 'bold');
    d.setFontSize(8);
    d.setTextColor(...MUTED);
    d.text(item[0], margin + cardW + 16 + 12, rightY);
    d.setFont('helvetica', 'bold');
    d.setFontSize(8.5);
    d.setTextColor(...INK);
    const textLines = d.splitTextToSize(clean(item[1] || '---'), cardW - 72);
    d.text(textLines, margin + cardW + 16 + 60, rightY);
    rightY += 16 * textLines.length;
  });

  y += cardsHeight + 20;

  if (y > h - 220) {
    d.addPage();
    d.setFillColor(255, 255, 255);
    d.rect(0, 0, w, h, 'F');
    y = margin + 20;
  }

  d.setDrawColor(...LINE);
  d.setLineWidth(1);
  d.setFillColor(252, 252, 252);
  
  d.roundedRect(margin, y, contentWidth, 30, 6, 6, 'FD');
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(...INK);
  d.text('PAYMENT DESCRIPTION', margin + 12, y + 19);
  d.text('RECORD REF', margin + 260, y + 19);
  d.text('AMOUNT (INR)', margin + contentWidth - 12, y + 19, { align: 'right' });
  
  y += 46;

  d.setFont('helvetica', 'bold');
  d.setFontSize(8.5);
  d.setTextColor(...BODY);
  d.text('Total Agreed Vendor Service Value', margin + 12, y);
  
  d.setFont('helvetica', 'normal');
  d.setTextColor(...MUTED);
  d.text(`Voucher ${pay.voucherNumber}`, margin + 260, y);

  d.setFont('helvetica', 'bold');
  d.setTextColor(...INK);
  d.text(money(pay.totalAmount), margin + contentWidth - 12, y, { align: 'right' });
  
  y += 30;

  d.setFont('helvetica', 'bold');
  d.setTextColor(...GOLD);
  d.text('Amount Received & Acknowledged (This Receipt)', margin + 12, y);
  
  d.setFont('helvetica', 'normal');
  d.setTextColor(...MUTED);
  d.text(pay.paymentMode || 'Bank Transfer', margin + 260, y);

  d.setFont('helvetica', 'bold');
  d.setTextColor(...GOLD);
  d.text(money(pay.paidAmount), margin + contentWidth - 12, y, { align: 'right' });
  
  y += 30;

  const balColor = pay.balanceAmount <= 0 ? [16, 185, 129] : INK;
  const balText = pay.balanceAmount <= 0 ? 'NIL (Paid in Full)' : money(pay.balanceAmount);

  d.setFont('helvetica', 'bold');
  d.setTextColor(...INK);
  d.text('Remaining Balance Payable', margin + 12, y);

  d.setFont('helvetica', 'bold');
  d.setTextColor(balColor[0], balColor[1], balColor[2]);
  d.text(balText, margin + contentWidth - 12, y, { align: 'right' });

  y += 50;

  if (y + 100 > h) {
    d.addPage();
    d.setFillColor(255, 255, 255);
    d.rect(0, 0, w, h, 'F');
    y = margin + 20;
  }

  d.setDrawColor(...LINE);
  d.setFillColor(252, 252, 252);
  d.roundedRect(margin, y, contentWidth, 70, 6, 6, 'FD');
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(...INK);
  d.text('TERMS & RECEIPT ACKNOWLEDGMENT', margin + 12, y + 20);
  
  d.setFont('helvetica', 'normal');
  d.setFontSize(7.5);
  d.setTextColor(...MUTED);
  d.text('• This document serves as an official payment receipt and non-tax acknowledgment for vendor services.', margin + 12, y + 36);
  d.text('• Payments are processed based on mutually agreed service levels and completion timelines.', margin + 12, y + 48);
  if (pay.notes) {
    d.text(`• Note: ${clean(pay.notes)}`, margin + 12, y + 60);
  }

  // FOOTER
  d.setDrawColor(...LINE);
  d.line(margin, h - 36, w - margin, h - 36);
  d.setFont('helvetica', 'bold');
  d.setFontSize(8);
  d.setTextColor(...INK);
  d.text('Holidays Hunt Travel and Hospitality Pvt Ltd', margin, h - 22);
  
  d.setFont('helvetica', 'normal');
  d.setFontSize(7);
  d.setTextColor(...MUTED);
  const footContact = `Phone: ${a.phone||''}  |  Email: holidayshunt@gmail.com  |  Website: holidayshunt.com`;
  d.text(footContact, margin, h - 12);
  d.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, w - margin, h - 12, { align: 'right' });

  d.save(`Holidays-Hunt-${clean(pay.voucherNumber)}.pdf`);
}

const DESTINATION_IMAGES: Record<string, string> = {
  srinagar: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
  dal_lake: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
  houseboat: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
  gulmarg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  gondola: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  pahalgam: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  sonmarg: 'https://images.unsplash.com/photo-1566838217578-1903568a76d9?auto=format&fit=crop&w=600&q=80',
  kashmir: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80',
  shimla: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
  manali: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
  dharamshala: 'https://images.unsplash.com/photo-1597074866923-dc0589db5137?auto=format&fit=crop&w=600&q=80',
};

function getBestImage(title: string, location: string): string {
  const t = (title + ' ' + location).toLowerCase();
  if (t.includes('gondola') || t.includes('gulmarg')) return DESTINATION_IMAGES.gulmarg;
  if (t.includes('pahalgam') || t.includes('lidder')) return DESTINATION_IMAGES.pahalgam;
  if (t.includes('sonmarg') || t.includes('thajiwas')) return DESTINATION_IMAGES.sonmarg;
  if (t.includes('shikara') || t.includes('dal lake') || t.includes('houseboat')) return DESTINATION_IMAGES.dal_lake;
  if (t.includes('srinagar')) return DESTINATION_IMAGES.srinagar;
  if (t.includes('shimla')) return DESTINATION_IMAGES.shimla;
  if (t.includes('manali') || t.includes('solang')) return DESTINATION_IMAGES.manali;
  if (t.includes('dharamshala') || t.includes('mcleod')) return DESTINATION_IMAGES.dharamshala;
  return DESTINATION_IMAGES.kashmir;
}

function getImageData(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
          return;
        }
      } catch (e) {
        // ignore
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 3000);
  });
}

function drawLandscapePlaceholder(d: jsPDF, x: number, y: number, w: number, h: number, label: string) {
  d.setFillColor(244, 241, 236);
  d.setDrawColor(180, 83, 9);
  d.setLineWidth(0.4);
  d.roundedRect(x, y, w, h, 4, 4, 'FD');
  
  const cx = x + w / 2;
  const cy = y + h / 2;
  
  // Center peak
  d.line(cx - 30, cy + 15, cx, cy - 25);
  d.line(cx, cy - 25, cx + 30, cy + 15);
  // Left peak
  d.line(cx - 45, cy + 15, cx - 15, cy - 10);
  d.line(cx - 15, cy - 10, cx + 15, cy + 15);
  // Right peak
  d.line(cx - 15, cy + 15, cx + 15, cy - 5);
  d.line(cx + 15, cy - 5, cx + 45, cy + 15);
  
  d.circle(cx + 15, cy - 15, 6, 'D');
  
  d.setFont('helvetica', 'italic');
  d.setFontSize(7.5);
  d.setTextColor(132, 120, 113);
  d.text(clean(label).toUpperCase().slice(0, 24), cx, cy + 32, { align: 'center' });
}

async function loadBrandLogoData(): Promise<{ dataUrl: string; width: number; height: number; format: string } | null> {
  const sources = ['/logo-holidays-hunt-v3.png', '/logo.png'];
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

export async function generateTourPDF(pkg:TourPackage,a:AgencySettings,onProgress?:(status:string)=>void):Promise<void>{
  onProgress?.('Preparing official mobile tour brochure...');
  
  const w = 430;
  const margin = 18;
  const contentWidth = w - (margin * 2);

  // Load brand logo if available
  const logoData = await loadBrandLogoData();

  // Helper for drawing cards
  const drawCard = (docInstance: jsPDF, cx: number, cy: number, cw: number, ch: number, fill = SOFT, stroke = LINE, withWatermark = false) => {
    docInstance.setFillColor(242, 239, 235); // subtle drop shadow
    docInstance.roundedRect(cx + 2, cy + 3, cw, ch, 8, 8, 'F');
    docInstance.setFillColor(...fill);
    docInstance.setDrawColor(...stroke);
    docInstance.setLineWidth(0.8);
    docInstance.roundedRect(cx, cy, cw, ch, 8, 8, 'FD');
    
    // Add Watermark if logo exists and requested
    if (withWatermark && logoData) {
      try {
        const gs = new (docInstance as any).GState({ opacity: 0.07 });
        docInstance.setGState(gs);
        const targetHeight = Math.min(ch * 0.4, 60); // Don't let watermark get too large
        const aspectRatio = logoData.width / logoData.height;
        const targetWidth = targetHeight * aspectRatio;
        
        // Calculate center offset for 40-degree rotation so it stays in the box
        const angleDeg = 40;
        const angleRad = angleDeg * Math.PI / 180;
        const dx = (targetWidth / 2) * Math.cos(angleRad) - (targetHeight / 2) * Math.sin(angleRad);
        const dy = (targetWidth / 2) * Math.sin(angleRad) + (targetHeight / 2) * Math.cos(angleRad);
        const imgX = (cx + cw / 2) - dx;
        const imgY = (cy + ch / 2) - dy;

        docInstance.addImage(
          logoData.dataUrl, 
          'PNG', 
          imgX, 
          imgY, 
          targetWidth, 
          targetHeight, 
          undefined, 
          'FAST',
          angleDeg
        );
        docInstance.setGState(new (docInstance as any).GState({ opacity: 1.0 }));
      } catch (e) {
        // Fallback if GState is unavailable
      }
    }
  };

  const drawSecHeader = (docInstance: jsPDF, secTitle: string, sy: number) => {
    docInstance.setFont('helvetica','bold');
    docInstance.setFontSize(14);
    docInstance.setTextColor(...GOLD);
    docInstance.text(clean(secTitle).toUpperCase(), margin, sy);
    docInstance.setDrawColor(...GOLD);
    docInstance.setLineWidth(2.5);
    docInstance.line(margin, sy + 6, margin + 80, sy + 6);
    return sy + 24;
  };

  // 1. Calculate dynamic total height using a temporary doc instance
  const tempD = new jsPDF({ unit: 'pt', format: [w, 20000] });
  let calcY = 40;

  calcY += 60; // Header area
  calcY += 32; // Category & duration (spaced generously to avoid touch)

  tempD.setFont('helvetica', 'bold');
  tempD.setFontSize(22);
  const titleLines = tempD.splitTextToSize(clean(pkg.title), contentWidth);
  calcY += titleLines.length * 26 + 12;

  tempD.setFont('helvetica', 'normal');
  tempD.setFontSize(12);
  const overviewText = pkg.overview || pkg.tagline || 'A thoughtfully crafted journey by Holidays Hunt.';
  const overviewLines = tempD.splitTextToSize(clean(overviewText), contentWidth);
  calcY += overviewLines.length * 16 + 24;

  calcY += 200 + 24; // Snapshot card (2x2 grid, conservative dynamic max)
  calcY += 24 + 140 + 24; // Selected Tier card (conservative dynamic max)

  if (pkg.hotels && pkg.hotels.length > 0) {
    calcY += 24;
    for (const _ of pkg.hotels) {
      calcY += 75 + 12;
    }
    calcY += 12;
  }

  calcY += 24; // Inclusions header
  const incList = pkg.inclusions && pkg.inclusions.length > 0 ? pkg.inclusions : ['Verified hotel stays with daily breakfast and dinner.', 'Private air-conditioned chauffeur vehicle.', 'Sightseeing transfers and toll taxes.'];
  const excList = pkg.exclusions && pkg.exclusions.length > 0 ? pkg.exclusions : ['Airfares or train tickets.', 'Personal expenses, tips, and laundry.', 'Adventure activity charges or monument entry fees.'];
  
  tempD.setFont('helvetica', 'normal');
  tempD.setFontSize(11);
  let incH = 56;
  incList.forEach(item => {
    incH += tempD.splitTextToSize(clean(item), contentWidth - 48).length * 14 + 10;
  });
  let excH = 56;
  excList.forEach(item => {
    excH += tempD.splitTextToSize(clean(item), contentWidth - 48).length * 14 + 10;
  });
  calcY += incH + 16 + excH + 24; // Stacked vertically

  if (pkg.itinerary && pkg.itinerary.length > 0) {
    calcY += 24; // Itinerary header
    for (const day of pkg.itinerary) {
      tempD.setFont('helvetica', 'bold');
      tempD.setFontSize(13);
      const titleLines = tempD.splitTextToSize(clean(day.title), contentWidth - 100);
      
      tempD.setFont('helvetica', 'normal');
      tempD.setFontSize(10.5);
      const locLines = tempD.splitTextToSize(`Location: ${clean(day.location)}`, contentWidth - 100);
      
      tempD.setFont('helvetica', 'normal');
      tempD.setFontSize(11.5);
      const descLines = tempD.splitTextToSize(clean(day.description || ''), contentWidth - 32);
      
      const hotelStayText = day.stayHotel ? `Stay: ${day.stayHotel}${day.meals?.length ? ` | Meals: ${day.meals.join(', ')}` : ''}` : (day.meals?.length ? `Meals: ${day.meals.join(', ')}` : '');
      tempD.setFont('helvetica', 'italic');
      tempD.setFontSize(10.5);
      const stayLines = hotelStayText ? tempD.splitTextToSize(hotelStayText, contentWidth - 32) : [];
      
      const topSectionH = Math.max(30, (titleLines.length * 14) + (locLines.length * 12) + 8);
      const dayCardH = 16 + topSectionH + 12 + (descLines.length * 16) + (stayLines.length ? stayLines.length * 14 + 8 : 0) + 16;
      calcY += dayCardH + 24; // ensure ample spacing between day cards
    }
  }

  calcY += 24; // Policies header
  const cancellationPolicy = pkg.policies?.cancellationPolicy || ['Standard cancellation policies apply as per booking terms.'];
  const termsAndConditions = pkg.policies?.termsAndConditions || ['All bookings are subject to confirmation and advance deposit.'];
  const importantNotes = ['Please carry valid photo identification for all guests during travel.', 'All bookings are subject to availability and weather conditions.'];

  const getPolicyBoxH = (arr: string[]) => {
    tempD.setFont('helvetica', 'normal');
    tempD.setFontSize(11);
    const pLines = tempD.splitTextToSize(clean(arr.join(' • ')), contentWidth - 32);
    return 45 + pLines.length * 15 + 16;
  };

  calcY += getPolicyBoxH(cancellationPolicy);
  calcY += getPolicyBoxH(termsAndConditions);
  calcY += getPolicyBoxH(importantNotes);

  const totalHeight = calcY + 400; // Generous extra space to ensure no clipping

  // 2. Initialize final continuous mobile PDF document
  const d = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [w, totalHeight], compress: true });
  d.setProperties({title:`Tour Brochure - ${pkg.title}`,author:a.agencyName||'Holidays Hunt'});

  // Background
  d.setFillColor(255, 255, 255);
  d.rect(0, 0, w, totalHeight, 'F');

  // Top Dark Bar
  d.setFillColor(...INK);
  d.rect(0, 0, w, 8, 'F');

  if (logoData) {
    const aspectRatio = logoData.width / logoData.height;
    const targetHeight = 32;
    const targetWidth = Math.min(targetHeight * aspectRatio, 200);
    const calculatedHeight = targetWidth / aspectRatio;
    d.addImage(logoData.dataUrl, 'PNG', margin, 24, targetWidth, calculatedHeight, undefined, 'FAST');
  } else {
    // Brand Header Text Fallback
    d.setFont('helvetica', 'bold');
    d.setFontSize(22);
    d.setTextColor(...INK);
    d.text('Holidays Hunt', margin, 46);
  }

  d.setFont('helvetica', 'normal');
  d.setFontSize(10);
  d.setTextColor(...MUTED);
  if (a.phone) d.text(clean(a.phone), w - margin, 50, { align: 'right' });
  if (a.email) d.text(clean(a.email), w - margin, 66, { align: 'right' });

  d.setDrawColor(...LINE);
  d.setLineWidth(1);
  d.line(margin, 84, w - margin, 84);

  let y = 110;

  // Category & Duration Badge
  d.setFont('helvetica','bold');
  d.setFontSize(10);
  d.setTextColor(...GOLD);
  d.text(`TOUR PACKAGE: ${clean(pkg.category || 'Verified Tour').toUpperCase()}`, margin, y);
  d.setFont('helvetica','normal');
  d.setFontSize(10);
  d.setTextColor(...MUTED);
  d.text(`${pkg.durationDays}D / ${pkg.durationNights}N`, w - margin, y, { align: 'right' });
  y += 32; // Increased space between category and title so they never touch

  // Tour Title
  d.setFont('helvetica', 'bold');
  d.setFontSize(22);
  d.setTextColor(...INK);
  d.text(titleLines, margin, y, { lineHeightFactor: 1.25 });
  y += titleLines.length * 26 + 12;

  // Overview / Tagline
  d.setFont('helvetica', 'normal');
  d.setFontSize(12);
  d.setTextColor(...BODY);
  d.text(overviewLines, margin, y, { lineHeightFactor: 1.45 });
  y += overviewLines.length * 16 + 24;

  // Specifications Snapshot Card (2x2 Grid)
  const specs = [
    ['DESTINATION', clean(pkg.destination)],
    ['TOUR TYPE', clean(pkg.tourType||'Private Tour')],
    ['START / END', `${clean(pkg.startLocation||'')} to ${clean(pkg.endLocation||'')}`],
    ['BEST TIME', clean(pkg.bestTimeToVisit||'Year-round')]
  ];
  
  // Calculate dynamic height for spec card
  let maxCol1H = 0;
  let maxCol2H = 0;
  
  d.setFont('helvetica','bold');
  d.setFontSize(11.5);
  specs.forEach((s, i) => {
    const isRight = i % 2 !== 0;
    const padding = isRight ? 32 : 16;
    const valLines = d.splitTextToSize(clean(s[1]), (contentWidth / 2) - padding);
    const h = 20 + (valLines.length * 14); // Label height + value height
    if (i < 2) {
        maxCol1H = Math.max(maxCol1H, h);
    } else {
        maxCol2H = Math.max(maxCol2H, h);
    }
  });
  const specCardH = maxCol1H + maxCol2H + 40;

  drawCard(d, margin, y, contentWidth, specCardH);
  
  specs.forEach((s, i) => {
    const isRight = i % 2 !== 0;
    const isBottom = i >= 2;
    const sx = margin + 16 + (isRight ? (contentWidth / 2) : 0);
    const sy = y + 24 + (isBottom ? maxCol1H + 16 : 0);
    const padding = isRight ? 32 : 16;
    
    d.setFont('helvetica','bold');
    d.setFontSize(9);
    d.setTextColor(...MUTED);
    d.text(s[0], sx, sy);
    d.setFont('helvetica','bold');
    d.setFontSize(11.5);
    d.setTextColor(...INK);
    const valLines = d.splitTextToSize(clean(s[1]), (contentWidth / 2) - padding);
    d.text(valLines, sx, sy + 14, { lineHeightFactor: 1.15 });
  });
  y += specCardH + 24;

  // Package Pricing & Inclusions Card
  y = drawSecHeader(d, 'Package Pricing & Inclusions', y);
  d.setFont('helvetica','normal');
  d.setFontSize(11);
  const hotelSummaryNames = pkg.hotels && pkg.hotels.length > 0 
    ? pkg.hotels.map(h => `${h.name} (${getHotelLocation(h, pkg)})`).join(', ')
    : 'Verified Accommodations & Stays';
  const hLines = d.splitTextToSize(`Hotels: ${clean(hotelSummaryNames)}`, contentWidth - 40);
  const mLines = d.splitTextToSize(`Meals: ${clean(pkg.hotels?.[0]?.mealPlan || 'Daily Breakfast & Dinner Included')}`, contentWidth - 40);
  const cLines = d.splitTextToSize(`Cab: ${clean(pkg.transportation || 'Private AC Chauffeur Vehicle')}`, contentWidth - 40);
  
  // Calculate dynamic height for details card
  const detailsCardH = 40 + 20 + (hLines.length * 14) + (mLines.length * 14) + (cLines.length * 14) + 16;
  
  const isPor = pkg.priceOnRequest || (!pkg.price && !pkg.discountedPrice) || ((pkg.price || 0) <= 0 && (!pkg.discountedPrice || pkg.discountedPrice <= 0));
  const effectivePrice = pkg.discountedPrice && pkg.discountedPrice > 0 ? pkg.discountedPrice : (pkg.price || 0);
  const priceDisplayStr = isPor ? 'Price on Request' : money(effectivePrice);
  const priceFontSize = isPor ? 15 : 20;

  drawCard(d, margin, y, contentWidth, detailsCardH, CREAM, GOLD, true);
  d.setFont('helvetica','bold');
  d.setFontSize(priceFontSize);
  d.setTextColor(...GOLD);
  d.text(priceDisplayStr, margin + 20, y + 34);
  d.setFont('helvetica','normal');
  d.setFontSize(11);
  d.setTextColor(...BODY);
  d.text(hLines, margin + 20, y + 54);
  let nextY = y + 54 + (hLines.length * 14);
  d.text(mLines, margin + 20, nextY);
  nextY += (mLines.length * 14);
  d.text(cLines, margin + 20, nextY);
  y += detailsCardH + 24;

  // Verified Accommodation & Stays
  if (pkg.hotels && pkg.hotels.length > 0) {
    y = drawSecHeader(d, 'Accommodation & Stays', y);
    for (const hotel of pkg.hotels) {
      d.setFont('helvetica','bold');
      d.setFontSize(13);
      const nameLines = d.splitTextToSize(clean(hotel.name), contentWidth - 32);
      d.setFont('helvetica','normal');
      d.setFontSize(10.5);
      const starText = hotel.starRating ? `${hotel.starRating}-Star | ` : '';
      const locText = getHotelLocation(hotel, pkg);
      const infoLines = d.splitTextToSize(`${starText}${locText} | ${clean(hotel.roomType || 'Deluxe Room')} (${hotel.nights}N)`, contentWidth - 32);
      let amLines: string[] = [];
      if (hotel.amenities?.length) {
        d.setFont('helvetica','italic');
        d.setFontSize(10);
        amLines = d.splitTextToSize(`Amenities: ${hotel.amenities.join(' • ')}`, contentWidth - 32);
      }
      
      const hCardH = 20 + (nameLines.length * 15) + (infoLines.length * 14) + (amLines.length ? amLines.length * 13 + 6 : 0) + 12;
      drawCard(d, margin, y, contentWidth, hCardH, [255, 255, 255], LINE);
      
      d.setFont('helvetica','bold');
      d.setFontSize(13);
      d.setTextColor(...INK);
      d.text(nameLines, margin + 16, y + 22);
      let curHY = y + 22 + (nameLines.length * 15);
      
      d.setFont('helvetica','normal');
      d.setFontSize(10.5);
      d.setTextColor(...MUTED);
      d.text(infoLines, margin + 16, curHY);
      curHY += (infoLines.length * 14) + 6;
      
      if (amLines.length) {
        d.setFont('helvetica','italic');
        d.setFontSize(10);
        d.setTextColor(...BODY);
        d.text(amLines, margin + 16, curHY);
      }
      y += hCardH + 16;
    }
    y += 12;
  }

  // Key Inclusions (Stacked Vertical)
  y = drawSecHeader(d, 'Inclusions & Exclusions', y);
  drawCard(d, margin, y, contentWidth, incH, [255, 255, 255], LINE, true);
  d.setFillColor(...GOLD); // Orange brand color
  d.roundedRect(margin + 16, y + 16, 95, 22, 4, 4, 'F');
  d.setFont('helvetica','bold');
  d.setFontSize(10.5);
  d.setTextColor(255, 255, 255);
  d.text('INCLUSIONS', margin + 63.5, y + 31, { align: 'center' });
  
  d.setFont('helvetica','normal');
  d.setFontSize(11);
  d.setTextColor(...BODY);
  let curY = y + 56;
  incList.forEach((item) => {
    d.setFillColor(...GOLD);
    d.circle(margin + 22, curY - 3, 2.5, 'F');
    const lines = d.splitTextToSize(clean(item), contentWidth - 48);
    d.text(lines, margin + 34, curY, { lineHeightFactor: 1.35 });
    curY += lines.length * 14 + 10;
  });
  y += incH + 16;

  // Key Exclusions (Stacked Vertical)
  drawCard(d, margin, y, contentWidth, excH, [255, 255, 255], LINE, true);
  d.setFillColor(...GOLD); // Orange brand color
  d.roundedRect(margin + 16, y + 16, 100, 22, 4, 4, 'F');
  d.setFont('helvetica','bold');
  d.setFontSize(10.5);
  d.setTextColor(255, 255, 255);
  d.text('EXCLUSIONS', margin + 66, y + 31, { align: 'center' });
  
  d.setFont('helvetica','normal');
  d.setFontSize(11);
  d.setTextColor(...BODY);
  curY = y + 56;
  excList.forEach((item) => {
    d.setFillColor(...GOLD);
    d.circle(margin + 22, curY - 3, 2.5, 'F');
    const lines = d.splitTextToSize(clean(item), contentWidth - 48);
    d.text(lines, margin + 34, curY, { lineHeightFactor: 1.35 });
    curY += lines.length * 14 + 10;
  });
  y += excH + 24;

  // Day-by-Day Itinerary (Fully Expanded)
  if (pkg.itinerary && pkg.itinerary.length > 0) {
    y = drawSecHeader(d, 'Detailed Itinerary', y);

    for (const day of pkg.itinerary) {
      d.setFont('helvetica','bold');
      d.setFontSize(13);
      const titleLines = d.splitTextToSize(clean(day.title), contentWidth - 100);
      
      d.setFont('helvetica','normal');
      d.setFontSize(10.5);
      const locLines = d.splitTextToSize(`Location: ${clean(day.location)}`, contentWidth - 100);
      
      d.setFont('helvetica', 'normal');
      d.setFontSize(11.5);
      const descLines = d.splitTextToSize(clean(day.description || ''), contentWidth - 32);
      
      const hotelStayText = day.stayHotel ? `Stay: ${day.stayHotel}${day.meals?.length ? ` | Meals: ${day.meals.join(', ')}` : ''}` : (day.meals?.length ? `Meals: ${day.meals.join(', ')}` : '');
      d.setFont('helvetica','italic');
      d.setFontSize(10.5);
      const stayLines = hotelStayText ? d.splitTextToSize(hotelStayText, contentWidth - 32) : [];

      const topSectionH = Math.max(30, (titleLines.length * 14) + (locLines.length * 12) + 8);
      const dayCardH = 16 + topSectionH + 12 + (descLines.length * 16) + (stayLines.length ? stayLines.length * 14 + 8 : 0) + 16;

      drawCard(d, margin, y, contentWidth, dayCardH, [255, 255, 255], LINE, true);
      d.setFillColor(...GOLD); // Orange brand color
      d.roundedRect(margin + 16, y + 16, 60, 24, 4, 4, 'F');
      d.setFont('helvetica','bold');
      d.setFontSize(11);
      d.setTextColor(255, 255, 255);
      d.text(`DAY ${day.dayNumber}`, margin + 46, y + 32, { align: 'center' });

      d.setFont('helvetica','bold');
      d.setFontSize(13);
      d.setTextColor(...INK);
      d.text(titleLines, margin + 86, y + 28, { lineHeightFactor: 1.15 });
      
      d.setFont('helvetica','normal');
      d.setFontSize(10.5);
      d.setTextColor(...MUTED);
      d.text(locLines, margin + 86, y + 28 + (titleLines.length * 14), { lineHeightFactor: 1.15 });

      let curY = y + 16 + topSectionH + 16;
      d.setFont('helvetica','normal');
      d.setFontSize(11.5);
      d.setTextColor(...BODY);
      d.text(descLines, margin + 16, curY, { lineHeightFactor: 1.4 });
      
      curY += (descLines.length * 16) + 8;
      if (stayLines.length) {
        d.setFont('helvetica','italic');
        d.setFontSize(10.5);
        d.setTextColor(...MUTED);
        d.text(stayLines, margin + 16, curY, { lineHeightFactor: 1.3 });
      }

      y += dayCardH + 24; // Ensure clean spacing between cards
    }
  }

  // Policies & Notes
  y = drawSecHeader(d, 'Policies & Notes', y);

  const addPolicyBlock = (titleText: string, contentArray: string[], isGold = false) => {
    const pLines = d.splitTextToSize(clean(contentArray.join(' • ')), contentWidth - 32);
    const boxH = 45 + pLines.length * 15;
    drawCard(d, margin, y, contentWidth, boxH, isGold ? CREAM : SOFT, isGold ? GOLD : LINE);
    d.setFont('helvetica', 'bold');
    d.setFontSize(12);
    d.setTextColor(isGold ? GOLD[0] : INK[0], isGold ? GOLD[1] : INK[1], isGold ? GOLD[2] : INK[2]);
    d.text(titleText, margin + 16, y + 26);
    d.setFont('helvetica', 'normal');
    d.setFontSize(11);
    d.setTextColor(...BODY);
    d.text(pLines, margin + 16, y + 46, { lineHeightFactor: 1.35 });
    y += boxH + 16;
  };

  addPolicyBlock('Cancellation Policy:', cancellationPolicy);
  addPolicyBlock('Terms & Conditions:', termsAndConditions);
  addPolicyBlock('Important Notes:', importantNotes, true);

  // Bottom Footer with Contact Details Only
  d.setFont('helvetica', 'bold');
  d.setFontSize(9.5);
  d.setTextColor(...INK);
  d.text('Holidays Hunt Travel and Hospitality Pvt Ltd', w / 2, totalHeight - 40, { align: 'center' });
  d.setFont('helvetica', 'normal');
  d.setFontSize(9);
  d.setTextColor(...MUTED);
  d.text(`Phone: ${clean(a.phone || '+91 94199 15255')}  |  Email: ${clean(a.email || 'holidayshunt@gmail.com')}`, w / 2, totalHeight - 26, { align: 'center' });

  const safeFilename = `HolidaysHunt_MobileBrochure_${clean(pkg.title).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
  d.save(safeFilename);
}


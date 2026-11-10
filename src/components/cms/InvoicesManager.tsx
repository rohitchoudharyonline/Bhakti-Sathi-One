import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Invoice, InvoiceItem, BookingInquiry } from '../../types/tour';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { formatBookingNumber } from '../../utils/bookingHelper';
import {
 FileText,
 Plus,
 Search,
 Download,
 CheckCircle2,
 Clock,
 AlertCircle,
 X,
 CreditCard,
 UserCheck,
 Building,
 Mail,
 Phone,
 Trash2,
 DollarSign,
 ArrowDownLeft,
 Receipt,
 Calendar,
 Sparkles,
} from 'lucide-react';

export const InvoicesManager: React.FC<{
 initialInquiryId?: string;
 initialInquiry?: BookingInquiry | null;
 onClearInitialInquiry?: () => void;
}> = ({ initialInquiryId, initialInquiry, onClearInitialInquiry }) => {
 const {
  invoices,
  packages,
  inquiries,
  agencySettings,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  recordInvoicePayment,
  currentStaffUser,
 } = useTours();

 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const [isCreating, setIsCreating] = useState(false);
 const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

 const canManage =
  currentStaffUser.role === 'super_admin' || currentStaffUser.permissions.canManageInvoices;

 // Payment Recording State
 const [paymentAmount, setPaymentAmount] = useState<number>(0);
 const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
 const [paymentRef, setPaymentRef] = useState<string>('');
 const [paymentNote, setPaymentNote] = useState<string>('');

 // Invoice Form State
 const [formClientName, setFormClientName] = useState('');
 const [formClientEmail, setFormClientEmail] = useState('');
 const [formClientPhone, setFormClientPhone] = useState('');
 const [formClientAddress, setFormClientAddress] = useState('');
 const [formClientGstin, setFormClientGstin] = useState('');
 const [formPackageId, setFormPackageId] = useState('');
 const [formTravelDates, setFormTravelDates] = useState('2026-06-15 to 2026-06-22');
 const [formPaxCount, setFormPaxCount] = useState(2);
 const [formDueDate, setFormDueDate] = useState(
  new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
 );
 const [formTaxRate, setFormTaxRate] = useState(5);
 const [formDiscount, setFormDiscount] = useState(0);
 const [formPaidAmount, setFormPaidAmount] = useState(0);
 const [formPaymentMode, setFormPaymentMode] = useState('Credit Card');
 const [formNotes, setFormNotes] = useState(() => Array.isArray(agencySettings.invoiceTerms) ? agencySettings.invoiceTerms.join('\n') : (agencySettings.invoiceTerms || 'Thank you for choosing Choudhary Vacations!'));

 const [formItems, setFormItems] = useState<InvoiceItem[]>([
  {
   id: 'item-1',
   description: 'Luxury Kashmir Holiday Package - 6N/7D (2 Adults)',
   quantity: 1,
   unitPrice: 1599,
   amount: 1599,
  },
 ]);

 const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
 const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
 const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

 const calculateSubtotal = () => formItems.reduce((sum, item) => sum + item.amount, 0);
 const subtotal = calculateSubtotal();
 const taxAmount = ((subtotal - formDiscount) * (formTaxRate / 100));
 const grandTotal = Math.max(0, subtotal - formDiscount + taxAmount);
 const balanceDue = Math.max(0, grandTotal - formPaidAmount);

 const handleAddItem = () => {
  const newItem: InvoiceItem = {
   id: `item-${Date.now()}`,
   description: 'Additional Tour Service / Room Upgrade',
   quantity: 1,
   unitPrice: 100,
   amount: 100,
  };
  setFormItems([...formItems, newItem]);
 };

 const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: string | number) => {
  setFormItems((prev) =>
   prev.map((item) => {
    if (item.id !== id) return item;
    const updated = { ...item, [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
     updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
    }
    return updated;
   })
  );
 };

 const handleRemoveItem = (id: string) => {
  if (formItems.length === 1) return;
  setFormItems(formItems.filter((i) => i.id !== id));
 };

 const handlePopulateFromPackage = (pkgId: string) => {
  setFormPackageId(pkgId);
  const pkg = packages.find((p) => p.id === pkgId);
  if (pkg) {
   setFormItems([
    {
     id: `item-${Date.now()}`,
     description: `${pkg.title} - ${pkg.durationDays}D / ${pkg.durationNights}N`,
     quantity: 1,
     unitPrice: pkg.discountedPrice || pkg.price || 0,
     amount: pkg.discountedPrice || pkg.price || 0,
    },
   ]);
  }
 };

 const populateFromInquiry = React.useCallback((inquiry: BookingInquiry) => {
   if (!inquiry) return;
   setFormClientName(inquiry.travelerName || '');
   setFormClientEmail(inquiry.email || '');
   setFormClientPhone(inquiry.phone || '');
   setFormClientAddress('');
   setFormClientGstin('');
   setFormTravelDates(inquiry.travelDate || '2026-11-10');
   setFormPaxCount(inquiry.adults || 2);

   // Match tour package if available
   const pkg = packages.find(
     (p) =>
       p.id === inquiry.packageId ||
       p.slug === inquiry.packageId ||
       p.title.toLowerCase().trim() === (inquiry.packageTitle || '').toLowerCase().trim()
   );
   if (pkg) {
     setFormPackageId(pkg.id);
   } else {
     setFormPackageId(inquiry.packageId || '');
   }

   // 1. If inquiry has an official quotation issued, prioritize quotation price & items
   if (inquiry.quotation && (inquiry.quotation.finalPrice > 0 || (inquiry.quotation.basePrice && inquiry.quotation.basePrice > 0))) {
     const q = inquiry.quotation;
     const qPrice = q.finalPrice || q.basePrice || 0;
     const pkgTitle = q.packageTitle || inquiry.packageTitle || pkg?.title || 'Custom Tour Proposal';
     const dur = q.duration || (pkg ? `${pkg.durationDays}D / ${pkg.durationNights}N` : '');
     const paxInfo = `${inquiry.adults || 2} Adults${inquiry.children ? `, ${inquiry.children} Children` : ''}`;

     setFormItems([
       {
         id: `item-quote-${Date.now()}`,
         description: `${pkgTitle}${dur ? ` (${dur})` : ''} - [${paxInfo}]`,
         quantity: 1,
         unitPrice: qPrice,
         amount: qPrice,
       },
     ]);
     setFormDiscount(q.discount || 0);

     const notesArr = [];
     if (q.hotels) notesArr.push(`Stays: ${q.hotels.replace(/\n/g, ', ')}`);
     if (q.cabType) notesArr.push(`Vehicle: ${q.cabType}`);
     if (q.notes) notesArr.push(q.notes);
     if (inquiry.specialRequests) notesArr.push(`Special Requests: ${inquiry.specialRequests}`);
     if (notesArr.length > 0) {
       setFormNotes(notesArr.join('\n'));
     }
   } else if (pkg) {
     // 2. Fallback to package price per pax or package total
     const pax = inquiry.adults || 2;
     const baseRate = pkg.discountedPrice || pkg.price || 0;
     const itemTotal = baseRate * pax;

     setFormItems([
       {
         id: `item-pkg-${Date.now()}`,
         description: `${pkg.title} - ${pkg.durationDays}D / ${pkg.durationNights}N (${pax} Guests)`,
         quantity: 1,
         unitPrice: itemTotal,
         amount: itemTotal,
       },
     ]);
     setFormDiscount(0);
     if (inquiry.specialRequests) {
       setFormNotes(`Guest Requests: ${inquiry.specialRequests}`);
     }
   } else {
     // 3. Fallback to inquiry estimated total or custom package title
     const estTotal = inquiry.estimatedTotal || 25000;
     setFormItems([
       {
         id: `item-inq-${Date.now()}`,
         description: `${inquiry.packageTitle || 'Custom Devotional Holiday Package'} (${inquiry.adults || 2} Adults)`,
         quantity: 1,
         unitPrice: estTotal,
         amount: estTotal,
       },
     ]);
     setFormDiscount(0);
     if (inquiry.specialRequests) {
       setFormNotes(`Guest Requests: ${inquiry.specialRequests}`);
     }
   }

   setIsCreating(true);
 }, [packages]);

 React.useEffect(() => {
   // 1. Direct object passed as prop
   if (initialInquiry) {
     populateFromInquiry(initialInquiry);
     return;
   }
   // 2. ID passed as prop
   if (initialInquiryId) {
     const found = inquiries.find(
       (i) =>
         i.id === initialInquiryId ||
         i.id.toLowerCase() === initialInquiryId.toLowerCase() ||
         formatBookingNumber(i.id).toLowerCase() === initialInquiryId.toLowerCase()
     );
     if (found) {
       populateFromInquiry(found);
       return;
     }
   }
   // 3. Persistent localStorage check if user was redirected from inquiries tab
   try {
     const saved = localStorage.getItem('hh_pending_invoice_inquiry');
     if (saved) {
       const parsed = JSON.parse(saved);
       if (parsed && (parsed.travelerName || parsed.id)) {
         populateFromInquiry(parsed);
         localStorage.removeItem('hh_pending_invoice_inquiry');
       }
     }
   } catch {}
 }, [initialInquiry, initialInquiryId, inquiries, populateFromInquiry]);

 const handleOpenCreate = () => {
  setFormClientName('');
  setFormClientEmail('');
  setFormClientPhone('');
  setFormClientAddress('');
  setFormClientGstin('');
  setFormPackageId(packages[0]?.id || '');
  setFormTravelDates('2026-06-15 to 2026-06-22');
  setFormPaxCount(2);
  setFormDueDate(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
  setFormTaxRate(5);
  setFormDiscount(0);
  setFormPaidAmount(0);
  setFormPaymentMode('Credit Card');
  setFormNotes(Array.isArray(agencySettings.invoiceTerms) ? agencySettings.invoiceTerms.join('\n') : (agencySettings.invoiceTerms || 'Thank you for traveling with us!'));

  if (packages[0]) {
   setFormItems([
    {
     id: `item-${Date.now()}`,
     description: `${packages[0].title} - ${packages[0].durationDays}D / ${packages[0].durationNights}N`,
     quantity: 1,
     unitPrice: packages[0].price,
     amount: packages[0].price,
    },
   ]);
  }

  setIsCreating(true);
 };

 const handleCreateSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formClientName.trim() || formItems.length === 0) return;

  const sub = calculateSubtotal();
  const tax = (sub - formDiscount) * (formTaxRate / 100);
  const total = Math.max(0, sub - formDiscount + tax);
  const bal = Math.max(0, total - formPaidAmount);
  const status: Invoice['status'] = bal === 0 ? 'Paid' : formPaidAmount > 0 ? 'Partial' : 'Unpaid';

  const selectedPkg = packages.find((p) => p.id === formPackageId);
  const pkgTitle = selectedPkg ? selectedPkg.title : 'Custom Devotional Tour / Yatra';

  const logs = [];
  if (formPaidAmount > 0) {
   logs.push({
    id: `iplog-${Date.now()}`,
    amount: formPaidAmount,
    date: new Date().toISOString().split('T')[0],
    method: formPaymentMode,
    transactionRef: 'Initial Booking Advance Deposit',
    note: 'Payment received upon tax invoice generation.',
   });
  }

  addInvoice({
   clientName: formClientName,
   clientEmail: formClientEmail,
   clientPhone: formClientPhone,
   clientAddress: formClientAddress,
   clientGstOrTaxId: formClientGstin,
   packageId: formPackageId || undefined,
   packageTitle: pkgTitle,
   travelDate: formTravelDates,
   paxAdults: formPaxCount,
   paxChildren: 0,
   issueDate: new Date().toISOString().split('T')[0],
   dueDate: formDueDate,
   currency: '₹',
   items: formItems,
   subtotal: sub,
   discount: formDiscount,
   taxPercent: formTaxRate,
   taxAmount: tax,
   grandTotal: total,
   paidAmount: formPaidAmount,
   balanceDue: bal,
   status,
   paymentMode: formPaymentMode,
   paymentReference: '',
   notes: formNotes,
   terms: agencySettings.invoiceTerms || ['Thank you for choosing Holidays Hunt!'],
   paymentLogs: logs,
  });

  setIsCreating(false);
 };

 const handleRecordPaymentSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedInvoiceForPayment || paymentAmount <= 0) return;

  recordInvoicePayment(
   selectedInvoiceForPayment.id,
   paymentAmount,
   paymentMethod,
   paymentRef || `PAY-${Date.now().toString().slice(-6)}`,
   paymentNote || 'Client payment deposit'
  );

  setSelectedInvoiceForPayment(null);
  setPaymentAmount(0);
  setPaymentRef('');
  setPaymentNote('');
 };

 const handleDownloadInvoice = (inv: Invoice) => {
  generateInvoicePDF(inv, agencySettings);
 };

 const filteredInvoices = invoices.filter((inv) => {
  const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();
  const matchesSearch =
   inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
   inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
   inv.clientPhone.includes(searchTerm);
  return matchesStatus && matchesSearch;
 });

 return (
  <div className="space-y-6" id="invoices-manager">
   {/* Header & Stats Banner */}
   <div className="bg-white dark:bg-[#18191E] p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
     <div>
      <div className="flex items-center gap-2">
       <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#FC3200] flex items-center justify-center font-bold">
        <Receipt className="w-5 h-5" />
       </div>
       <div>
        <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight">
         Client Invoices & Billing Engine
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
         Issue official GST/tax invoices, record traveler advance payments, and download print-ready PDFs.
        </p>
       </div>
      </div>
     </div>

     {canManage && (
      <button
       type="button"
       onClick={handleOpenCreate}
       className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl font-bold shadow-sm transition-all text-xs sm:text-sm shrink-0 w-full md:w-auto cursor-pointer"
       id="create-invoice-btn"
      >
       <Plus className="w-4 h-4" />
       <span>+ Generate Client Invoice</span>
      </button>
     )}
    </div>

    {/* Financial Stat Tiles */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 pt-5 border-t border-stone-100 dark:border-stone-800">
     <div className="bg-stone-50 dark:bg-[#1F2127] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
      <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Invoiced</p>
      <p className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white mt-1">
       ₹{totalInvoiced.toLocaleString('en-IN')}
      </p>
      <span className="text-[11px] text-stone-400">{invoices.length} Issued Invoices</span>
     </div>

     <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
       Total Collected (Advance + Final)
      </p>
      <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
       ₹{totalCollected.toLocaleString('en-IN')}
      </p>
      <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Realized Cash & Bank Deposits</span>
     </div>

     <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40">
      <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
       Outstanding Balance Due
      </p>
      <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
       ₹{totalOutstanding.toLocaleString('en-IN')}
      </p>
      <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Pending Client Balances</span>
     </div>
    </div>
   </div>

   {/* Filter & Search Bar */}
   <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
    <div className="relative w-full sm:w-80">
     <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
     <input
      type="text"
      placeholder="Search invoice #, client name, email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E2024] text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-[#FC3200] outline-none"
     />
    </div>

    <div className="flex bg-white dark:bg-[#1E2024] border border-stone-200 dark:border-stone-700 rounded-xl p-1 text-xs w-full sm:w-auto overflow-x-auto">
     {['all', 'unpaid', 'partial', 'paid'].map((st) => (
      <button
       key={st}
       type="button"
       onClick={() => setStatusFilter(st)}
       className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold capitalize transition cursor-pointer text-center ${
        statusFilter === st
         ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-stone-900 shadow-xs'
         : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
       }`}
      >
       {st}
      </button>
     ))}
    </div>
   </div>

   {/* Invoices List */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
    {filteredInvoices.map((invoice) => {
     const isFullyPaid = invoice.status === 'Paid';
     const isPartial = invoice.status === 'Partial';

     return (
      <div
       key={invoice.id}
       className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
       id={`invoice-card-${invoice.id}`}
      >
       <div>
        {/* Top: Invoice header & traveler info */}
        <div className="flex items-start gap-3">
         <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FC3200] border border-orange-200 dark:border-orange-900/40 shrink-0">
          <Receipt className="w-5 h-5" />
         </div>

         <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
           <span className="font-mono text-xs font-black text-stone-900 dark:text-white bg-stone-100 dark:bg-[#252830] px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
            {invoice.invoiceNumber}
           </span>
           <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
             isFullyPaid
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : isPartial
              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800'
            }`}
           >
            {invoice.status}
           </span>
          </div>

          <h3 className="font-black text-stone-900 dark:text-white text-base truncate">
           {invoice.clientName}
          </h3>

          <div className="space-y-1 mt-2 text-xs text-stone-500 dark:text-stone-400">
           {invoice.clientEmail && (
            <p className="flex items-center gap-1.5 truncate">
             <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
             <span className="truncate">{invoice.clientEmail}</span>
            </p>
           )}
           {invoice.clientPhone && (
            <p className="flex items-center gap-1.5">
             <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
             <span>{invoice.clientPhone}</span>
            </p>
           )}
           {invoice.travelDate && (
            <p className="flex items-center gap-1.5">
             <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
             <span>{invoice.travelDate} ({invoice.paxAdults} Pax)</span>
            </p>
           )}
          </div>

          {/* Line Items Snapshot */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-600 dark:text-stone-300 space-y-1">
           {invoice.items.slice(0, 2).map((item) => (
            <p key={item.id} className="truncate">
             • {item.quantity}x {item.description} (₹{item.amount.toLocaleString('en-IN')})
            </p>
           ))}
           {invoice.items.length > 2 && (
            <p className="text-stone-400 dark:text-stone-500 italic">
             +{invoice.items.length - 2} more services
            </p>
           )}
          </div>
         </div>
        </div>
       </div>

       {/* Bottom: Pricing & Actions */}
       <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
         <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Grand Total</span>
          <span className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
           ₹{invoice.grandTotal.toLocaleString('en-IN')}
          </span>
         </div>
         <div className="text-right">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Due Balance</span>
          <span className={`text-sm font-black ${invoice.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
           ₹{invoice.balanceDue.toLocaleString('en-IN')}
          </span>
         </div>
        </div>

        <div className="flex items-center gap-2">
         {canManage && invoice.balanceDue > 0 && (
          <button
           type="button"
           onClick={() => {
            setSelectedInvoiceForPayment(invoice);
            setPaymentAmount(invoice.balanceDue);
            setPaymentMethod('Credit Card');
            setPaymentRef('');
            setPaymentNote('');
           }}
           className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
           id={`record-payment-${invoice.id}`}
          >
           <ArrowDownLeft className="w-3.5 h-3.5" />
           <span>Record Advance</span>
          </button>
         )}

         <button
          type="button"
          onClick={() => handleDownloadInvoice(invoice)}
          className="flex-1 py-2 px-3 bg-stone-100 dark:bg-[#252830] hover:bg-stone-200 dark:hover:bg-[#2E323C] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          title="Download Official PDF Invoice"
          id={`download-invoice-${invoice.id}`}
         >
          <Download className="w-3.5 h-3.5 text-[#FC3200]" />
          <span>PDF Invoice</span>
         </button>
        </div>

        {/* Payment Receipts History */}
        {invoice.paymentLogs && invoice.paymentLogs.length > 0 && (
         <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center gap-1.5">
          {invoice.paymentLogs.map((log) => (
           <span
            key={log.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40"
           >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ₹{log.amount.toLocaleString('en-IN')} ({log.method})
           </span>
          ))}
         </div>
        )}
       </div>
      </div>
     );
    })}

    {filteredInvoices.length === 0 && (
     <div className="col-span-full text-center py-12 bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
      <FileText className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">No invoices found</p>
      <p className="text-xs text-stone-400 mt-1">Adjust search or issue a new client invoice from inquiry conversion.</p>
     </div>
    )}
   </div>

   {/* Record Payment Receipt Modal */}
   {selectedInvoiceForPayment && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
     <div className="bg-white dark:bg-[#18191E] rounded-2xl max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#1E2025]">
       <div className="flex items-center gap-2">
        <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
        <div>
         <h3 className="font-black text-stone-900 dark:text-white text-sm">
          Record Client Payment
         </h3>
         <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {selectedInvoiceForPayment.invoiceNumber} - {selectedInvoiceForPayment.clientName}
         </p>
        </div>
       </div>
       <button
        type="button"
        onClick={() => setSelectedInvoiceForPayment(null)}
        className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
       >
        <X className="w-4 h-4" />
       </button>
      </div>

      <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
       <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
         Received Amount (₹) *
        </label>
        <div className="relative">
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
         <input
          type="number"
          required
          min={1}
          max={selectedInvoiceForPayment.balanceDue}
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(Number(e.target.value))}
          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm font-bold focus:border-emerald-600 outline-none"
         />
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
         Current balance due: ₹{selectedInvoiceForPayment.balanceDue.toLocaleString('en-IN')}
        </p>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
         Payment Collection Method
        </label>
        <select
         value={paymentMethod}
         onChange={(e) => setPaymentMethod(e.target.value)}
         className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-semibold focus:border-emerald-600 outline-none"
        >
         <option value="Credit Card">Credit / Debit Card (Stripe / Razorpay)</option>
         <option value="Net Banking">Net Banking / NEFT / IMPS</option>
         <option value="UPI">UPI / QR Code Transfer (PhonePe/GPay)</option>
         <option value="Cash">Cash Handover at Office</option>
         <option value="Cheque">Bank Cheque</option>
        </select>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
         Txn ID / Bank Reference #
        </label>
        <input
         type="text"
         value={paymentRef}
         onChange={(e) => setPaymentRef(e.target.value)}
         className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-mono focus:border-emerald-600 outline-none"
         placeholder="e.g. UPI_REF_9021482"
        />
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
         Payment Receipt Note
        </label>
        <input
         type="text"
         value={paymentNote}
         onChange={(e) => setPaymentNote(e.target.value)}
         className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs focus:border-emerald-600 outline-none"
         placeholder="e.g. 50% Advance booking deposit"
        />
       </div>

       <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
        <button
         type="button"
         onClick={() => setSelectedInvoiceForPayment(null)}
         className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white cursor-pointer"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
         id="confirm-payment-btn"
        >
         Confirm & Update Invoice
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Create New Tax Invoice Modal */}
   {isCreating && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
     <div className="bg-white dark:bg-[#151619] rounded-2xl max-w-3xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
      {/* Modal Top Header */}
      <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#1E2025]">
       <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#FC3200] flex items-center justify-center font-bold">
         <Receipt className="w-5 h-5" />
        </div>
        <div>
         <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
          Generate Official Client Invoice
         </h3>
         <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          Pre-populated from customer booking & quotation data with full edit flexibility.
         </p>
        </div>
       </div>
       <button
        type="button"
        onClick={() => {
          setIsCreating(false);
          if (onClearInitialInquiry) onClearInitialInquiry();
        }}
        className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <form onSubmit={handleCreateSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
       {/* Client & Travel Details */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
         <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
          Client Full Name *
         </label>
         <input
          type="text"
          required
          value={formClientName}
          onChange={(e) => setFormClientName(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          placeholder="e.g. David Henderson"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
          Client Email *
         </label>
         <input
          type="email"
          required
          value={formClientEmail}
          onChange={(e) => setFormClientEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          placeholder="david@traveler.com"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
          Contact Phone *
         </label>
         <input
          type="text"
          required
          value={formClientPhone}
          onChange={(e) => setFormClientPhone(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          placeholder="+91 94199 15255"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
          Travel Dates
         </label>
         <input
          type="text"
          value={formTravelDates}
          onChange={(e) => setFormTravelDates(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          placeholder="e.g. 10 Nov 2026 to 18 Nov 2026"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
          Number of Guests (Pax)
         </label>
         <input
          type="number"
          min={1}
          value={formPaxCount}
          onChange={(e) => setFormPaxCount(Number(e.target.value))}
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
          Payment Due Date
         </label>
         <input
          type="date"
          value={formDueDate}
          onChange={(e) => setFormDueDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
         />
        </div>
       </div>

       {/* Package Quick Preset Dropdown */}
       <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3 sm:p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
         <Sparkles className="w-4 h-4 text-[#FC3200] shrink-0" />
         Auto-fill from Tour Package:
        </span>
        <select
         value={formPackageId}
         onChange={(e) => handlePopulateFromPackage(e.target.value)}
         className="w-full sm:w-auto px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-semibold focus:border-[#FC3200] outline-none cursor-pointer"
        >
         <option value="">Select Tour Package...</option>
         {packages.map((pkg) => (
          <option key={pkg.id} value={pkg.id}>
           {pkg.title} (₹{pkg.discountedPrice || pkg.price})
          </option>
         ))}
        </select>
       </div>

       {/* Line Items Table */}
       <div className="space-y-2">
        <div className="flex items-center justify-between">
         <h4 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
          Invoice Line Items & Tour Breakdown
         </h4>
         <button
          type="button"
          onClick={handleAddItem}
          className="text-xs text-[#FC3200] hover:text-red-700 dark:hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer"
         >
          <Plus className="w-3.5 h-3.5" /> Add Service Item
         </button>
        </div>

        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-2xs">
         <div className="grid grid-cols-12 gap-2 bg-stone-100 dark:bg-[#202227] p-2.5 text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
          <div className="col-span-6">Service Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Unit (₹)</div>
          <div className="col-span-2 text-right">Total (₹)</div>
         </div>

         <div className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-[#18191D]">
          {formItems.map((item) => (
           <div key={item.id} className="grid grid-cols-12 gap-2 p-2.5 items-center">
            <div className="col-span-6">
             <input
              type="text"
              value={item.description}
              onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
              placeholder="e.g. Tour package, Airport Transfer, Hotel Upgrade..."
             />
            </div>
            <div className="col-span-2">
             <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
              className="w-full px-2 py-1.5 text-center rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
             />
            </div>
            <div className="col-span-2">
             <input
              type="number"
              min={0}
              value={item.unitPrice}
              onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
              className="w-full px-2 py-1.5 text-right rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
             />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2 font-black text-xs text-stone-900 dark:text-white">
             <span>₹{item.amount.toLocaleString('en-IN')}</span>
             {formItems.length > 1 && (
              <button
               type="button"
               onClick={() => handleRemoveItem(item.id)}
               className="text-stone-400 hover:text-red-500 cursor-pointer p-1"
               title="Remove line item"
              >
               <Trash2 className="w-3.5 h-3.5" />
              </button>
             )}
            </div>
           </div>
          ))}
         </div>
        </div>
       </div>

       {/* Financial Calculation Box */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-100 dark:border-stone-800">
        <div className="space-y-3">
         <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
           Discount (₹)
          </label>
          <input
           type="number"
           min={0}
           value={formDiscount}
           onChange={(e) => setFormDiscount(Number(e.target.value))}
           className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          />
         </div>

         <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
           Applicable Tax Rate (GST % - Optional)
          </label>
          <input
           type="number"
           min={0}
           value={formTaxRate}
           onChange={(e) => setFormTaxRate(Number(e.target.value))}
           className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          />
         </div>

         <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
           Initial Advance Collected (₹)
          </label>
          <input
           type="number"
           min={0}
           max={grandTotal}
           value={formPaidAmount}
           onChange={(e) => setFormPaidAmount(Number(e.target.value))}
           className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs font-bold focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
          />
         </div>
        </div>

        {/* Summary Totals Card */}
        <div className="bg-stone-50 dark:bg-[#1E2025] p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
         <div className="flex justify-between text-stone-600 dark:text-stone-400">
          <span>Subtotal:</span>
          <span className="font-bold text-stone-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
         </div>
         {formDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
           <span>Discount:</span>
           <span>-₹{formDiscount.toLocaleString('en-IN')}</span>
          </div>
         )}
         <div className="flex justify-between text-stone-600 dark:text-stone-400">
          <span>Tax ({formTaxRate}%):</span>
          <span className="font-bold text-stone-900 dark:text-white">+₹{taxAmount.toLocaleString('en-IN')}</span>
         </div>
         <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-black text-sm text-stone-900 dark:text-white">
          <span>Grand Total:</span>
          <span>₹{grandTotal.toLocaleString('en-IN')}</span>
         </div>
         <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
          <span>Initial Deposit Collected:</span>
          <span>₹{formPaidAmount.toLocaleString('en-IN')}</span>
         </div>
         <div className="pt-1.5 border-t border-stone-200 dark:border-stone-700 flex justify-between font-black text-sm text-[#FC3200]">
          <span>Net Balance Due:</span>
          <span>₹{balanceDue.toLocaleString('en-IN')}</span>
         </div>
        </div>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
         Invoice Terms & Notes
        </label>
        <textarea
         rows={3}
         value={formNotes}
         onChange={(e) => setFormNotes(e.target.value)}
         className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1E2024] text-stone-900 dark:text-white text-xs focus:bg-white dark:focus:bg-[#252830] focus:border-[#FC3200] outline-none"
        />
       </div>

       {/* Modal Actions */}
       <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
        <button
         type="button"
         onClick={() => {
           setIsCreating(false);
           if (onClearInitialInquiry) onClearInitialInquiry();
         }}
         className="px-4 py-2.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-6 py-2.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
         id="save-invoice-btn"
        >
         Generate Invoice
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
};

import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Invoice, InvoiceItem } from '../../types/tour';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
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
}> = ({ initialInquiryId }) => {
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
     unitPrice: pkg.price,
     amount: pkg.price,
    },
   ]);
  }
 };

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
   terms: agencySettings.invoiceTerms || ['Thank you for choosing Bhakti Sathi!'],
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
   <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
     <div>
      <div className="flex items-center gap-2">
       <FileText className="w-5 h-5 text-[#FC3200]" />
       <h2 className="text-xl font-bold text-stone-900 dark:text-white">
        Client Invoices & Billing Engine
       </h2>
      </div>
      <p className="text-sm text-stone-500 mt-1">
       Issue professional tax invoices, track customer collections, and manage payment receipts with PDF export.
      </p>
     </div>

     {canManage && (
      <button
       type="button"
       onClick={handleOpenCreate}
       className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl font-medium shadow-sm transition-all text-sm shrink-0 w-full md:w-auto"
       id="create-invoice-btn"
      >
       <Plus className="w-4 h-4" />
       Create Invoice
      </button>
     )}
    </div>

    {/* Financial Stat Tiles */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100 ">
     <div className="bg-stone-50 dark:bg-stone-950/50 p-4 rounded-xl border border-stone-100 ">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Invoiced</p>
      <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
       ${totalInvoiced.toLocaleString()}
      </p>
      <span className="text-[11px] text-stone-400">{invoices.length} Client Invoices</span>
     </div>

     <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100">
      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
       Total Revenue Collected
      </p>
      <p className="text-2xl font-bold text-emerald-700 mt-1">
       ${totalCollected.toLocaleString()}
      </p>
      <span className="text-[11px] text-emerald-600/80">Received in Bank / Gateway</span>
     </div>

     <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100">
      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
       Outstanding Receivables
      </p>
      <p className="text-2xl font-bold text-amber-700 mt-1">
       ${totalOutstanding.toLocaleString()}
      </p>
      <span className="text-[11px] text-amber-600/80">Pending Client Balances</span>
     </div>
    </div>
   </div>

   {/* Filter & Search Bar */}
   <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
    <div className="relative w-full sm:w-80">
     <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -transtone-y-1/2" />
     <input
      type="text"
      placeholder="Search invoice #, client name, email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white dark:bg-stone-900 text-stone-900 "
     />
    </div>

    <div className="flex bg-white dark:bg-stone-900 border border-stone-200 rounded-xl p-1 text-xs">
     {['all', 'unpaid', 'partial', 'paid'].map((st) => (
      <button
       key={st}
       type="button"
       onClick={() => setStatusFilter(st)}
       className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
        statusFilter === st
         ? 'bg-stone-900 dark:bg-white text-white font-semibold'
         : 'text-stone-600 hover:text-stone-900'
       }`}
      >
       {st}
      </button>
     ))}
    </div>
   </div>

   {/* Invoices List */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
    {filteredInvoices.map((invoice) => {
     const isFullyPaid = invoice.status === 'Paid';
     const isPartial = invoice.status === 'Partial';

     return (
      <div
       key={invoice.id}
       className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all"
       id={`invoice-card-${invoice.id}`}
      >
       <div className="flex flex-col justify-between gap-4">
        {/* Left: Client & Invoice Info */}
        <div className="flex items-start gap-4">
         <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 shrink-0">
          <Receipt className="w-5 h-5 text-[#FC3200]" />
         </div>

         <div>
          <div className="flex items-center gap-2 flex-wrap">
           <span className="font-mono text-xs font-bold text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
            {invoice.invoiceNumber}
           </span>
           <h3 className="font-bold text-stone-900 dark:text-white text-base">
            {invoice.clientName}
           </h3>
           {invoice.clientGstOrTaxId && (
            <span className="text-[10px] text-stone-400 bg-stone-50 dark:bg-stone-800 px-1.5 py-0.5 rounded">
             GST: {invoice.clientGstOrTaxId}
            </span>
           )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-500">
           <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-stone-400" />
            {invoice.clientEmail}
           </span>
           <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            {invoice.clientPhone}
           </span>
           {invoice.travelDate && (
            <span>
             <strong className="text-stone-700 ">Travel:</strong>{' '}
             {invoice.travelDate} ({invoice.paxAdults + invoice.paxChildren} Pax)
            </span>
           )}
          </div>

          {/* Line Items Summary */}
          <div className="mt-2 text-[11px] text-stone-600 space-y-0.5">
           {invoice.items.slice(0, 2).map((item) => (
            <p key={item.id} className="truncate">
             • {item.quantity}x {item.description} (${item.amount})
            </p>
           ))}
           {invoice.items.length > 2 && (
            <p className="text-stone-400 italic">
             +{invoice.items.length - 2} more services/items
            </p>
           )}
          </div>
         </div>
        </div>

        {/* Right: Amounts & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 ">
         <div className="text-left">
          <div className="flex items-center gap-2">
           <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
             isFullyPaid
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border border-emerald-200'
              : isPartial
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 border border-amber-200'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 border border-red-200'
            }`}
           >
            {invoice.status}
           </span>
           <span className="text-base font-bold text-stone-900 dark:text-white">
            ${invoice.grandTotal.toLocaleString()}
           </span>
          </div>

          <div className="text-[11px] text-stone-500 mt-1">
           <span>Collected: ${invoice.paidAmount.toLocaleString()}</span>
           <span className="mx-1">•</span>
           <span className="font-semibold text-amber-600 ">
            Due: ${invoice.balanceDue.toLocaleString()}
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
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
            id={`record-payment-${invoice.id}`}
           >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Record Payment
           </button>
          )}

          <button
           type="button"
           onClick={() => handleDownloadInvoice(invoice)}
           className="px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 border border-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
           title="Download Invoice PDF"
           id={`download-invoice-${invoice.id}`}
          >
           <Download className="w-3.5 h-3.5 text-[#FC3200]" />
           Invoice PDF
          </button>
         </div>
        </div>
       </div>

       {/* Payment Logs */}
       {invoice.paymentLogs && invoice.paymentLogs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3">
         <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          Payment Receipts:
         </span>
         {invoice.paymentLogs.map((log) => (
          <div
           key={log.id}
           className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 dark:bg-stone-800/80 rounded-lg text-[11px] text-stone-600 border border-stone-100 "
          >
           <CheckCircle2 className="w-3 h-3 text-emerald-600" />
           <span className="font-semibold">${log.amount}</span>
           <span className="text-stone-400">via {log.method}</span>
           <span className="text-[10px] text-stone-400">({log.date})</span>
          </div>
         ))}
        </div>
       )}
      </div>
     );
    })}

    {filteredInvoices.length === 0 && (
     <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 p-6">
      <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
      <p className="text-sm font-semibold text-stone-700 ">No invoices found</p>
      <p className="text-xs text-stone-400 mt-1">Adjust search or issue a new client invoice.</p>
     </div>
    )}
   </div>

   {/* Record Payment Receipt Modal */}
   {selectedInvoiceForPayment && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
     <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
       <div className="flex items-center gap-2">
        <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
        <div>
         <h3 className="font-bold text-stone-900 dark:text-white text-sm">
          Record Client Payment
         </h3>
         <p className="text-[11px] text-stone-500">
          {selectedInvoiceForPayment.invoiceNumber} - {selectedInvoiceForPayment.clientName}
         </p>
        </div>
       </div>
       <button
        type="button"
        onClick={() => setSelectedInvoiceForPayment(null)}
        className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
       >
        <X className="w-4 h-4" />
       </button>
      </div>

      <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Received Amount (₹) *
        </label>
        <div className="relative">
         <span className="absolute left-3 top-1/2 -transtone-y-1/2 text-stone-400 font-bold">$</span>
         <input
          type="number"
          required
          min={1}
          max={selectedInvoiceForPayment.balanceDue}
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(Number(e.target.value))}
          className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm font-bold"
         />
        </div>
        <p className="text-[11px] text-stone-500 mt-1">
         Current balance due: ₹{selectedInvoiceForPayment.balanceDue.toLocaleString('en-IN')}
        </p>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Payment Collection Method
        </label>
        <select
         value={paymentMethod}
         onChange={(e) => setPaymentMethod(e.target.value)}
         className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs font-medium"
        >
         <option value="Credit Card">Credit / Debit Card (Stripe/Payment Gateway)</option>
         <option value="Net Banking">Net Banking Transfer / IMPS</option>
         <option value="UPI">UPI / QR Code Transfer</option>
         <option value="Cash">Cash Handover</option>
         <option value="Cheque">Bank Cheque</option>
        </select>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Gateway Txn ID / Bank Reference #
        </label>
        <input
         type="text"
         value={paymentRef}
         onChange={(e) => setPaymentRef(e.target.value)}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs font-mono"
         placeholder="e.g. STRIPE_CH_9021482"
        />
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Payment Receipt Note
        </label>
        <input
         type="text"
         value={paymentNote}
         onChange={(e) => setPaymentNote(e.target.value)}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs"
         placeholder="e.g. Final balance cleared prior to travel"
        />
       </div>

       <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 ">
        <button
         type="button"
         onClick={() => setSelectedInvoiceForPayment(null)}
         className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
     <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
       <div className="flex items-center gap-2">
        <Receipt className="w-5 h-5 text-[#FC3200]" />
        <h3 className="text-lg font-bold text-stone-900 dark:text-white">
         Generate Official Client Invoice
        </h3>
       </div>
       <button
        type="button"
        onClick={() => setIsCreating(false)}
        className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
       {/* Client & Travel Details */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Client Full Name *
         </label>
         <input
          type="text"
          required
          value={formClientName}
          onChange={(e) => setFormClientName(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm font-semibold"
          placeholder="e.g. David Henderson"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Client Email *
         </label>
         <input
          type="email"
          required
          value={formClientEmail}
          onChange={(e) => setFormClientEmail(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="david@traveler.com"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Contact Phone *
         </label>
         <input
          type="text"
          required
          value={formClientPhone}
          onChange={(e) => setFormClientPhone(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="+1 (555) 234-5678"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Travel Dates
         </label>
         <input
          type="text"
          value={formTravelDates}
          onChange={(e) => setFormTravelDates(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
          placeholder="e.g. 15-22 June 2026"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Number of Guests (Pax)
         </label>
         <input
          type="number"
          min={1}
          value={formPaxCount}
          onChange={(e) => setFormPaxCount(Number(e.target.value))}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Payment Due Date
         </label>
         <input
          type="date"
          value={formDueDate}
          onChange={(e) => setFormDueDate(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-sm"
         />
        </div>
       </div>

       {/* Package Quick Preset Dropdown */}
       <div className="bg-stone-50 dark:bg-stone-950/60 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 w-full sm:w-auto justify-center">
         <Sparkles className="w-3.5 h-3.5 text-[#FC3200]" />
         Auto-fill from Tour Package:
        </span>
        <select
         value={formPackageId}
         onChange={(e) => handlePopulateFromPackage(e.target.value)}
         className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white dark:bg-stone-900 text-xs font-medium"
        >
         <option value="">Select Tour Package...</option>
         {packages.map((pkg) => (
          <option key={pkg.id} value={pkg.id}>
           {pkg.title} (${pkg.price})
          </option>
         ))}
        </select>
       </div>

       {/* Line Items Table */}
       <div className="space-y-2">
        <div className="flex items-center justify-between">
         <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
          Invoice Line Items & Tour Breakdown
         </h4>
         <button
          type="button"
          onClick={handleAddItem}
          className="text-xs text-[#FC3200] hover:text-red-700 font-semibold flex items-center gap-1"
         >
          <Plus className="w-3.5 h-3.5" /> Add Service Item
         </button>
        </div>

        <div className="border border-stone-200 rounded-xl overflow-hidden">
         <div className="grid grid-cols-12 gap-2 bg-stone-50 dark:bg-stone-800 p-2.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          <div className="col-span-6">Service Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Unit (₹)</div>
          <div className="col-span-2 text-right">Total (₹)</div>
         </div>

         <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {formItems.map((item) => (
           <div key={item.id} className="grid grid-cols-12 gap-2 p-2.5 items-center">
            <div className="col-span-6">
             <input
              type="text"
              value={item.description}
              onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
              className="w-full px-2 py-1 rounded border border-stone-200 bg-white dark:bg-stone-950 text-xs"
              placeholder="e.g. Airport Transfer, Hotel Suite Upgrade..."
             />
            </div>
            <div className="col-span-2">
             <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
              className="w-full px-2 py-1 text-center rounded border border-stone-200 bg-white dark:bg-stone-950 text-xs"
             />
            </div>
            <div className="col-span-2">
             <input
              type="number"
              min={0}
              value={item.unitPrice}
              onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
              className="w-full px-2 py-1 text-right rounded border border-stone-200 bg-white dark:bg-stone-950 text-xs"
             />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2 font-bold text-xs">
             <span>₹{item.amount.toLocaleString('en-IN')}</span>
             {formItems.length > 1 && (
              <button
               type="button"
               onClick={() => handleRemoveItem(item.id)}
               className="text-stone-400 hover:text-red-500"
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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-100 ">
        <div className="space-y-3">
         <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
           Discount (₹)
          </label>
          <input
           type="number"
           min={0}
           value={formDiscount}
           onChange={(e) => setFormDiscount(Number(e.target.value))}
           className="w-full px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs"
          />
         </div>

         <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
           Applicable Tax Rate (GST / VAT % - Optional)
          </label>
          <input
           type="number"
           min={0}
           value={formTaxRate}
           onChange={(e) => setFormTaxRate(Number(e.target.value))}
           className="w-full px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs"
          />
         </div>

         <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
           Initial Advance Collected (₹)
          </label>
          <input
           type="number"
           min={0}
           max={grandTotal}
           value={formPaidAmount}
           onChange={(e) => setFormPaidAmount(Number(e.target.value))}
           className="w-full px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs"
          />
         </div>
        </div>

        {/* Summary Totals */}
        <div className="bg-stone-50 dark:bg-stone-950/60 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
         <div className="flex justify-between text-stone-600 ">
          <span>Subtotal:</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
         </div>
         {formDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
           <span>Discount:</span>
           <span>-₹{formDiscount.toLocaleString('en-IN')}</span>
          </div>
         )}
         <div className="flex justify-between text-stone-600 ">
          <span>Tax ({formTaxRate}%):</span>
          <span>+₹{taxAmount.toLocaleString('en-IN')}</span>
         </div>
         <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900 dark:text-white">
          <span>Grand Total:</span>
          <span>₹{grandTotal.toLocaleString('en-IN')}</span>
         </div>
         <div className="flex justify-between text-emerald-700 font-semibold">
          <span>Initial Deposit Collected:</span>
          <span>₹{formPaidAmount.toLocaleString('en-IN')}</span>
         </div>
         <div className="pt-1 border-t border-stone-200 flex justify-between font-bold text-[#FC3200] ">
          <span>Net Balance Due:</span>
          <span>₹{balanceDue.toLocaleString('en-IN')}</span>
         </div>
        </div>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Invoice Terms & Notes
        </label>
        <textarea
         rows={2}
         value={formNotes}
         onChange={(e) => setFormNotes(e.target.value)}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white dark:bg-stone-950 text-xs"
        />
       </div>

       <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 ">
        <button
         type="button"
         onClick={() => setIsCreating(false)}
         className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-5 py-2.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
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

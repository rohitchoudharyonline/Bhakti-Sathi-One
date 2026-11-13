import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { VendorPayment, VendorCategory } from '../../types/tour';
import { generateVendorVoucherPDF } from '../../utils/pdfGenerator';
import {
 CreditCard,
 Plus,
 Search,
 Filter,
 Download,
 Building2,
 Car,
 UserCheck,
 Compass,
 Ticket,
 Plane,
 CheckCircle2,
 Clock,
 AlertCircle,
 X,
 FileText,
 DollarSign,
 ArrowUpRight,
 Receipt,
 Calendar,
} from 'lucide-react';

export const VendorPaymentsManager: React.FC<{
 initialVendorId?: string;
}> = ({ initialVendorId }) => {
 const {
  vendorPayments,
  vendors,
  packages,
  inquiries,
  agencySettings,
  addVendorPayment,
  updateVendorPayment,
  deleteVendorPayment,
  recordVendorPaymentTransaction,
  currentStaffUser,
 } = useTours();

 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const [categoryFilter, setCategoryFilter] = useState<string>('all');
 const [isCreating, setIsCreating] = useState(false);
 const [selectedPaymentForTxn, setSelectedPaymentForTxn] = useState<VendorPayment | null>(null);

 const canManage =
  currentStaffUser.role === 'super_admin' || currentStaffUser.permissions.canManageVendorPayments;

 // Transaction Record Form State
 const [txnAmount, setTxnAmount] = useState<number>(0);
 const [txnMode, setTxnMode] = useState<string>('Bank Transfer');
 const [txnRef, setTxnRef] = useState<string>('');
 const [txnNote, setTxnNote] = useState<string>('');

 // Create Voucher Form State
 const [formData, setFormData] = useState<{
  vendorId: string;
  packageId: string;
  inquiryId: string;
  travelerName: string;
  serviceDescription: string;
  serviceDate: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  paymentMode: VendorPayment['paymentMode'];
  transactionRef: string;
  notes: string;
 }>({
  vendorId: initialVendorId || (vendors[0]?.id || ''),
  packageId: packages[0]?.id || '',
  inquiryId: '',
  travelerName: '',
  serviceDescription: '',
  serviceDate: new Date().toISOString().split('T')[0],
  totalAmount: 500,
  paidAmount: 0,
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  paymentMode: 'Bank Transfer',
  transactionRef: '',
  notes: '',
 });

 const getCategoryIcon = (cat: VendorCategory) => {
  switch (cat) {
   case 'Hotel':
    return <Building2 className="w-4 h-4 text-amber-600" />;
   case 'Cab / Taxi Fleet':
    return <Car className="w-4 h-4 text-blue-600" />;
   case 'Chauffeur / Driver':
    return <UserCheck className="w-4 h-4 text-emerald-600" />;
   case 'Tour Guide':
    return <Compass className="w-4 h-4 text-purple-600" />;
   case 'Activity / Excursion':
    return <Ticket className="w-4 h-4 text-rose-600" />;
   case 'Flight / Train Desk':
    return <Plane className="w-4 h-4 text-indigo-600" />;
  }
 };

 const totalCommitted = vendorPayments.reduce((sum, p) => sum + p.totalAmount, 0);
 const totalPaid = vendorPayments.reduce((sum, p) => sum + p.paidAmount, 0);
 const totalPending = vendorPayments.reduce((sum, p) => sum + p.balanceAmount, 0);

 const handleOpenCreate = () => {
  setFormData({
   vendorId: initialVendorId || (vendors[0]?.id || ''),
   packageId: packages[0]?.id || '',
   inquiryId: '',
   travelerName: '',
   serviceDescription: '',
   serviceDate: new Date().toISOString().split('T')[0],
   totalAmount: 500,
   paidAmount: 0,
   dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
   paymentMode: 'Bank Transfer',
   transactionRef: '',
   notes: '',
  });
  setIsCreating(true);
 };

 const handleCreateSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const vendor = vendors.find((v) => v.id === formData.vendorId);
  if (!vendor) return;

  const pkg = packages.find((p) => p.id === formData.packageId);
  const balance = Math.max(0, formData.totalAmount - formData.paidAmount);
  const status: VendorPayment['paymentStatus'] =
   balance === 0 ? 'Paid' : formData.paidAmount > 0 ? 'Partial' : 'Unpaid';

  const logs = [];
  if (formData.paidAmount > 0) {
   logs.push({
    id: `plog-${Date.now()}`,
    amount: formData.paidAmount,
    date: new Date().toISOString().split('T')[0],
    mode: formData.paymentMode,
    transactionRef: formData.transactionRef || 'Initial Advance Release',
    note: 'Advance recorded upon service booking voucher generation.',
   });
  }

  addVendorPayment({
   vendorId: vendor.id,
   vendorName: vendor.name,
   vendorCategory: vendor.category,
   packageId: pkg?.id,
   packageTitle: pkg?.title,
   inquiryId: formData.inquiryId || undefined,
   travelerName: formData.travelerName || 'Guest Group',
   serviceDescription: formData.serviceDescription || `Ground operations for ${pkg?.title || 'Tour'}`,
   serviceDate: formData.serviceDate,
   totalAmount: formData.totalAmount,
   paidAmount: formData.paidAmount,
   balanceAmount: balance,
   dueDate: formData.dueDate,
   paymentStatus: status,
   paymentMode: formData.paymentMode,
   transactionRef: formData.transactionRef,
   notes: formData.notes,
   paymentLogs: logs,
  });

  setIsCreating(false);
 };

 const handleRecordTxnSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedPaymentForTxn || txnAmount <= 0) return;

  recordVendorPaymentTransaction(
   selectedPaymentForTxn.id,
   txnAmount,
   txnMode,
   txnRef || `TXN-${Date.now().toString().slice(-6)}`,
   txnNote || 'Payout released to vendor account'
  );

  setSelectedPaymentForTxn(null);
  setTxnAmount(0);
  setTxnRef('');
  setTxnNote('');
 };

 const handleDownloadVoucher = (payment: VendorPayment) => {
  const vendor = vendors.find((v) => v.id === payment.vendorId);
  generateVendorVoucherPDF(payment, vendor, agencySettings);
 };

 const filteredPayments = vendorPayments.filter((p) => {
  const matchesStatus = statusFilter === 'all' || p.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
  const matchesCategory = categoryFilter === 'all' || p.vendorCategory === categoryFilter;
  const matchesSearch =
   p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   p.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
   (p.travelerName && p.travelerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
   (p.packageTitle && p.packageTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  return matchesStatus && matchesCategory && matchesSearch;
 });

 return (
  <div className="space-y-6" id="vendor-payments-manager">
   {/* Header & Stats Banner */}
   <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
     <div>
      <div className="flex items-center gap-2">
       <CreditCard className="w-5 h-5 text-[#9b0000]" />
       <h2 className="text-xl font-bold text-stone-900">
        Vendor Payments & Service Vouchers
       </h2>
      </div>
      <p className="text-sm text-stone-500 mt-1">
       Manage accounts payable for hotels, cabs, chauffeurs, guides, and activity operators.
      </p>
     </div>

     {canManage && (
      <button
       type="button"
       onClick={handleOpenCreate}
       className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9b0000] hover:bg-[#7D0000] text-white rounded-xl font-medium shadow-sm transition-all text-sm shrink-0 w-full md:w-auto"
       id="create-voucher-btn"
      >
       <Plus className="w-4 h-4" />
       Issue New Service Voucher
      </button>
     )}
    </div>

    {/* Financial Stat Tiles */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100 ">
     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 ">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Contracted</p>
      <p className="text-2xl font-bold text-stone-900 mt-1">
       ${totalCommitted.toLocaleString()}
      </p>
      <span className="text-[11px] text-stone-400">{vendorPayments.length} Active Vouchers</span>
     </div>

     <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
       Total Released / Paid
      </p>
      <p className="text-2xl font-bold text-emerald-700 mt-1">
       ${totalPaid.toLocaleString()}
      </p>
      <span className="text-[11px] text-emerald-600/80">Cleared via UPI & Net Banking</span>
     </div>

     <div className="bg-red-50 p-4 rounded-xl border border-red-100">
      <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
       Pending Balance Due
      </p>
      <p className="text-2xl font-bold text-red-700 mt-1">
       ${totalPending.toLocaleString()}
      </p>
      <span className="text-[11px] text-[#9b0000]/80">Accounts Payable</span>
     </div>
    </div>
   </div>

   {/* Filter & Search Bar */}
   <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
    <div className="relative w-full md:w-80">
     <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -transtone-y-1/2" />
     <input
      type="text"
      placeholder="Search voucher #, vendor, traveler..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white text-stone-900 "
     />
    </div>

    <div className="flex flex-wrap gap-2 w-full md:w-auto">
     {/* Status filter */}
     <div className="flex bg-white border border-stone-200 rounded-xl p-1 text-xs">
      {['all', 'unpaid', 'partial', 'paid'].map((st) => (
       <button
        key={st}
        type="button"
        onClick={() => setStatusFilter(st)}
        className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
         statusFilter === st
          ? 'bg-[#9b0000] text-white font-semibold'
          : 'text-stone-600 hover:text-stone-900'
        }`}
       >
        {st}
       </button>
      ))}
     </div>

     {/* Category Dropdown */}
     <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-700 font-medium"
     >
      <option value="all">All Vendor Categories</option>
      <option value="Hotel">Hotels</option>
      <option value="Cab / Taxi Fleet">Cab Fleets</option>
      <option value="Chauffeur / Driver">Drivers</option>
      <option value="Tour Guide">Tour Guides</option>
      <option value="Activity / Excursion">Activities</option>
     </select>
    </div>
   </div>

   {/* Vouchers Table / Card View */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
    {filteredPayments.map((payment) => {
     const isFullyPaid = payment.paymentStatus === 'Paid';
     const isPartial = payment.paymentStatus === 'Partial';
     const vendor = vendors.find((v) => v.id === payment.vendorId);

     return (
      <div
       key={payment.id}
       className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all"
       id={`voucher-card-${payment.id}`}
      >
       <div className="flex flex-col justify-between gap-4">
        {/* Left: Voucher & Vendor Details */}
        <div className="flex items-start gap-4">
         <div className="p-3 rounded-xl bg-stone-100 border border-stone-100 shrink-0">
          {getCategoryIcon(payment.vendorCategory)}
         </div>

         <div>
          <div className="flex items-center gap-2 flex-wrap">
           <span className="font-mono text-xs font-bold text-[#9b0000] bg-red-50  px-2 py-0.5 rounded border border-red-200 ">
            {payment.voucherNumber}
           </span>
           <h3 className="font-bold text-stone-900 text-base">
            {payment.vendorName}
           </h3>
           <span className="text-xs text-stone-400 font-normal">({payment.vendorCategory})</span>
          </div>

          <p className="text-xs text-stone-600 font-medium mt-1">
           {payment.serviceDescription}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-stone-500">
           {payment.travelerName && (
            <span>
             <strong className="text-stone-700 ">Guest:</strong>{' '}
             {payment.travelerName}
            </span>
           )}
           <span>
            <strong className="text-stone-700 ">Service Date:</strong>{' '}
            {payment.serviceDate}
           </span>
           <span>
            <strong className="text-stone-700 ">Due Date:</strong>{' '}
            {payment.dueDate}
           </span>
           {vendor?.phone && (
            <span className="text-stone-400">Tel: {vendor.phone}</span>
           )}
          </div>
         </div>
        </div>

        {/* Right: Financial Status & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 ">
         {/* Financials Breakdown */}
         <div className="text-left">
          <div className="flex items-center gap-2">
           <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
             isFullyPaid
              ? 'bg-emerald-50 text-emerald-700  border border-emerald-200'
              : isPartial
              ? 'bg-amber-50 text-amber-700  border border-amber-200'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 border border-red-200'
            }`}
           >
            {payment.paymentStatus}
           </span>
           <span className="text-base font-bold text-stone-900">
            ${payment.totalAmount.toLocaleString()}
           </span>
          </div>

          <div className="text-[11px] text-stone-500 mt-1">
           <span>Paid: ${payment.paidAmount.toLocaleString()}</span>
           <span className="mx-1">•</span>
           <span className="font-semibold text-[#9b0000] ">
            Balance: ${payment.balanceAmount.toLocaleString()}
           </span>
          </div>
         </div>

         {/* Actions */}
         <div className="flex items-center gap-2">
          {canManage && payment.balanceAmount > 0 && (
           <button
            type="button"
            onClick={() => {
             setSelectedPaymentForTxn(payment);
             setTxnAmount(payment.balanceAmount);
             setTxnMode('Bank Transfer');
             setTxnRef('');
             setTxnNote('');
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
            id={`release-payout-${payment.id}`}
           >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Release Payout
           </button>
          )}

          <button
           type="button"
           onClick={() => handleDownloadVoucher(payment)}
           className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
           title="Download Official Service Voucher PDF"
           id={`download-voucher-${payment.id}`}
          >
           <Download className="w-3.5 h-3.5 text-[#9b0000]" />
           Voucher PDF
          </button>
         </div>
        </div>
       </div>

       {/* Payment Logs History Timeline (if any logs exist) */}
       {payment.paymentLogs && payment.paymentLogs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3">
         <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          Released Payments:
         </span>
         {payment.paymentLogs.map((log) => (
          <div
           key={log.id}
           className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100/80 rounded-lg text-[11px] text-stone-600 border border-stone-100 "
          >
           <CheckCircle2 className="w-3 h-3 text-emerald-600" />
           <span className="font-semibold">${log.amount}</span>
           <span className="text-stone-400">via {log.mode}</span>
           <span className="text-[10px] text-stone-400">({log.date})</span>
          </div>
         ))}
        </div>
       )}
      </div>
     );
    })}

    {filteredPayments.length === 0 && (
     <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
      <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-2" />
      <p className="text-sm font-semibold text-stone-700 ">No vendor vouchers found</p>
      <p className="text-xs text-stone-400 mt-1">Adjust search or issue a new operational voucher.</p>
     </div>
    )}
   </div>

   {/* Record Payment Transaction Modal */}
   {selectedPaymentForTxn && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
     <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
       <div className="flex items-center gap-2">
        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
        <div>
         <h3 className="font-bold text-stone-900 text-sm">Release Payout to Vendor</h3>
         <p className="text-[11px] text-stone-500">{selectedPaymentForTxn.vendorName}</p>
        </div>
       </div>
       <button
        type="button"
        onClick={() => setSelectedPaymentForTxn(null)}
        className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
       >
        <X className="w-4 h-4" />
       </button>
      </div>

      <form onSubmit={handleRecordTxnSubmit} className="p-5 space-y-4">
       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Payout Amount (₹) *
        </label>
        <div className="relative">
         <span className="absolute left-3 top-1/2 -transtone-y-1/2 text-stone-400 font-bold">$</span>
         <input
          type="number"
          required
          min={1}
          max={selectedPaymentForTxn.balanceAmount}
          value={txnAmount}
          onChange={(e) => setTxnAmount(Number(e.target.value))}
          className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-bold"
         />
        </div>
        <p className="text-[11px] text-stone-500 mt-1">
         Maximum balance due: ₹{selectedPaymentForTxn.balanceAmount.toLocaleString('en-IN')}
        </p>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Payment Mode
        </label>
        <select
         value={txnMode}
         onChange={(e) => setTxnMode(e.target.value)}
         className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium"
        >
         <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS/IMPS)</option>
         <option value="UPI">UPI / QR Code Transfer</option>
         <option value="Credit Card">Corporate Credit Card</option>
         <option value="Cash">Cash Handover</option>
         <option value="Cheque">Bank Cheque</option>
        </select>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Bank UTR / Transaction Reference #
        </label>
        <input
         type="text"
         value={txnRef}
         onChange={(e) => setTxnRef(e.target.value)}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono"
         placeholder="e.g. NEFT-HDFC-9920194"
        />
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Internal Accounting Note
        </label>
        <input
         type="text"
         value={txnNote}
         onChange={(e) => setTxnNote(e.target.value)}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs"
         placeholder="e.g. 50% advance released before tour departure"
        />
       </div>

       <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 ">
        <button
         type="button"
         onClick={() => setSelectedPaymentForTxn(null)}
         className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
         id="confirm-payout-btn"
        >
         Confirm & Update Balance
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Create New Voucher Modal */}
   {isCreating && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
     <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
       <div className="flex items-center gap-2">
        <Receipt className="w-5 h-5 text-[#9b0000]" />
        <h3 className="text-lg font-bold text-stone-900">
         Issue Vendor Service Order / Payment Voucher
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

      <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Select Vendor Partner *
         </label>
         <select
          required
          value={formData.vendorId}
          onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold"
         >
          {vendors.map((v) => (
           <option key={v.id} value={v.id}>
            {v.name} ({v.category})
           </option>
          ))}
         </select>
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Associated Tour Package
         </label>
         <select
          value={formData.packageId}
          onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium"
         >
          <option value="">Custom Tour / Ad-hoc Service</option>
          {packages.map((pkg) => (
           <option key={pkg.id} value={pkg.id}>
            {pkg.title}
           </option>
          ))}
         </select>
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Guest / Traveler Name
         </label>
         <input
          type="text"
          value={formData.travelerName}
          onChange={(e) => setFormData({ ...formData, travelerName: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm"
          placeholder="e.g. Sophia Reynolds (2 Guests)"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Service Date *
         </label>
         <input
          type="date"
          required
          value={formData.serviceDate}
          onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Total Contracted Amount (₹) *
         </label>
         <input
          type="number"
          required
          min={1}
          value={formData.totalAmount}
          onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm font-bold"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Initial Advance Released (₹)
         </label>
         <input
          type="number"
          min={0}
          max={formData.totalAmount}
          value={formData.paidAmount}
          onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Balance Payment Due Date
         </label>
         <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm"
         />
        </div>

        <div>
         <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Payment Mode
         </label>
         <select
          value={formData.paymentMode}
          onChange={(e) =>
           setFormData({ ...formData, paymentMode: e.target.value as VendorPayment['paymentMode'] })
          }
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm"
         >
          <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
          <option value="UPI">UPI</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
         </select>
        </div>
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Service Description & Specific Inclusions *
        </label>
        <textarea
         rows={2}
         required
         value={formData.serviceDescription}
         onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs"
         placeholder="e.g. 5 Nights AC Innova Crysta Chauffeur for Srinagar - Gulmarg - Pahalgam with all toll/parking"
        />
       </div>

       <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
         Operational Notes / Special Driver or Hotel Instructions
        </label>
        <input
         type="text"
         value={formData.notes}
         onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
         className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs"
         placeholder="e.g. Provide bouquet on arrival; strictly non-smoking vehicle"
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
         className="px-5 py-2.5 bg-[#9b0000] hover:bg-[#7D0000] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
         id="save-voucher-btn"
        >
         Issue Service Voucher
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
};

import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { BookingInquiry, InquiryQuotation } from '../../types/tour';
import { generateQuotationPDF } from '../../utils/pdfGenerator';
import { formatBookingNumber, generateBookingNumber } from '../../utils/bookingHelper';
import {
  MessageSquare,
  Users,
  Calendar,
  Phone,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  MessageCircle,
  Search,
  Filter,
  FileText,
  UserCheck,
  Download,
  Plus,
  Sparkles,
  Receipt,
  ArrowRight,
  X,
  History,
  Copy,
  Check,
  Edit,
  Edit3,
} from 'lucide-react';

export const InquiriesManager: React.FC<{
  onConvertToInvoice?: (inquiry: BookingInquiry) => void;
}> = ({ onConvertToInvoice }) => {
  const {
    inquiries,
    packages,
    staff,
    currentStaffUser,
    updateInquiryStatus,
    assignInquiryStaff,
    updateInquiryQuotation,
    addInquiryTimelineLog,
    deleteInquiry,
    updateInquiry,
    submitInquiry,
    agencySettings,
  } = useTours();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [leadTypeFilter, setLeadTypeFilter] = useState<'all' | 'tours' | 'newsletter'>('all');
  const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);
  const [selectedInquiryForQuote, setSelectedInquiryForQuote] = useState<BookingInquiry | null>(null);
  const [selectedInquiryForTimeline, setSelectedInquiryForTimeline] = useState<BookingInquiry | null>(null);
  const [editingInquiry, setEditingInquiry] = useState<BookingInquiry | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogAction, setNewLogAction] = useState('Call Follow-up');

  // New Booking / Lead Form State
  const [newBookingForm, setNewBookingForm] = useState({
    travelerName: '',
    email: '',
    phone: '',
    packageId: '',
    packageTitle: 'Custom Tour Itinerary',
    travelDate: new Date().toISOString().split('T')[0],
    adults: 2,
    children: 0,
    estimatedTotal: 45000,
    specialRequests: '',
  });

  // Quotation form state
  const [quotePrice, setQuotePrice] = useState<number>(1500);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(100);
  const [quoteValidity, setQuoteValidity] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [quoteHotels, setQuoteHotels] = useState<string>('4-Star Luxury Deluxe / Heritage Resort');
  const [quoteCab, setQuoteCab] = useState<string>('Private AC Innova Crysta for all transfers and sightseeing');
  const [quoteInclusions, setQuoteInclusions] = useState<string>(
    'Daily Breakfast & Dinner, Airport pickup & drop, Shikara ride, Gondola Phase-1 passes'
  );
  const [quoteExclusions, setQuoteExclusions] = useState<string>(
    'Airfare, Personal expenses, Horse riding, Monument entry fees'
  );
  const [quoteNotes, setQuoteNotes] = useState<string>(
    'Special 10% seasonal discount applied. Rates valid for booking confirmation within 7 days.'
  );

  const canManage =
    currentStaffUser.role === 'super_admin' || currentStaffUser.permissions.canManageInquiries;

  const isNewsletterInquiry = (inq: BookingInquiry) => {
    if (!inq) return false;
    const pkgId = (inq.packageId || '').toLowerCase();
    const pkgTitle = (inq.packageTitle || '').toLowerCase();
    const req = (inq.specialRequests || '').toLowerCase();
    return (
      pkgId.includes('newsletter') ||
      pkgId.includes('subscribe') ||
      pkgTitle.includes('newsletter') ||
      pkgTitle.includes('subscriber') ||
      req.includes('subscribed to newsletter')
    );
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const isNewsletter = isNewsletterInquiry(inq);
    if (leadTypeFilter === 'tours' && isNewsletter) return false;
    if (leadTypeFilter === 'newsletter' && !isNewsletter) return false;

    if (statusFilter !== 'All' && inq.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const formattedNum = formatBookingNumber(inq.id).toLowerCase();
      return (
        formattedNum.includes(q) ||
        inq.id.toLowerCase().includes(q) ||
        inq.travelerName.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.phone.toLowerCase().includes(q) ||
        inq.packageTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedInquiryIds.length === filteredInquiries.length && filteredInquiries.length > 0) {
      setSelectedInquiryIds([]);
    } else {
      setSelectedInquiryIds(filteredInquiries.map((inq) => inq.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedInquiryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedInquiryIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedInquiryIds.length} selected inquiry/lead(s)? This action cannot be undone.`
      )
    ) {
      selectedInquiryIds.forEach((id) => deleteInquiry(id));
      setSelectedInquiryIds([]);
    }
  };

  const handleCopyBookingNumber = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = formatBookingNumber(id);
    navigator.clipboard.writeText(formatted);
    setCopiedBookingId(id);
    setTimeout(() => setCopiedBookingId(null), 2500);
  };

  const getStatusBadge = (status: BookingInquiry['status']) => {
    switch (status) {
      case 'New':
        return 'bg-red-500/10 text-red-700  border-red-200 ';
      case 'Contacted':
        return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800  border-blue-200 ';
      case 'Quotation Sent':
        return 'bg-purple-100 dark:bg-purple-950/40 text-purple-800  border-purple-200 ';
      case 'Confirmed':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800  border-emerald-200 ';
      case 'Cancelled':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-800  border-rose-200 ';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  const handleOpenQuoteModal = (inq: BookingInquiry) => {
    setSelectedInquiryForQuote(inq);
    const matchedPkg = packages.find((p) => p.id === inq.packageId);
    const baseP = matchedPkg ? matchedPkg.price * (inq.adults || 2) : 1500;
    setQuotePrice(baseP);
    setQuoteDiscount(0);
    setQuoteValidity(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setQuoteHotels('4-Star Deluxe Hotel with Valley View + 1 Night Luxury Houseboat');
    setQuoteCab('Dedicated Private AC Innova / Crysta with Professional Chauffeur');
    setQuoteInclusions(
      matchedPkg?.inclusions.join(', ') ||
        'Welcome drinks, Daily Buffet Breakfast & Dinner, Airport Transfers, Sightseeing, Tolls & Parking'
    );
    setQuoteExclusions(
      matchedPkg?.exclusions.join(', ') ||
        'Airfare / Train tickets, Personal expenses, Monument entry tickets'
    );
    setQuoteNotes('Customized tailored proposal prepared with complimentary honeymoon amenities.');
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryForQuote) return;

    const matchedPkg = packages.find((p) => p.id === selectedInquiryForQuote.packageId);
    const quotation: InquiryQuotation = {
      id: `quote-${Date.now().toString(36)}`,
      basePrice: quotePrice,
      discount: quoteDiscount,
      finalPrice: Math.max(0, quotePrice - quoteDiscount),
      validUntil: quoteValidity,
      hotels: quoteHotels,
      cabType: quoteCab,
      inclusions: quoteInclusions.split(',').map((s) => s.trim()).filter(Boolean),
      exclusions: quoteExclusions.split(',').map((s) => s.trim()).filter(Boolean),
      notes: quoteNotes,
      createdAt: new Date().toISOString(),
    };

    updateInquiryQuotation(selectedInquiryForQuote.id, quotation);
    generateQuotationPDF(selectedInquiryForQuote, matchedPkg, quotation, agencySettings);
    setSelectedInquiryForQuote(null);
  };

  const handleDownloadQuotationPDF = (inq: BookingInquiry) => {
    const matchedPkg = packages.find((p) => p.id === inq.packageId);
    const quotation = inq.quotation || {
      id: `quote-std-${inq.id}`,
      basePrice: 1599,
      discount: 100,
      finalPrice: 1499,
      validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      hotelTier: '4-Star Premium Hotel & Luxury Houseboat',
      cabType: 'Dedicated AC Innova Crysta for all transfers and tours',
      inclusions: [
        'Daily Breakfast & Dinner',
        'Private airport transfers',
        'Sightseeing with tolls & parking',
        'Dedicated tour coordinator',
      ],
      exclusions: ['Airfare', 'Personal tips & laundry', 'Gondola cable car ride tickets'],
      notes: 'Special promo package quote. Valid for 7 days.',
      createdAt: new Date().toISOString(),
    };
    generateQuotationPDF(inq, matchedPkg, quotation, agencySettings);
  };

  const handleAddTimelineLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryForTimeline || !newLogNote.trim()) return;

    addInquiryTimelineLog(selectedInquiryForTimeline.id, newLogAction, newLogNote);
    setNewLogNote('');
  };

  const generateWhatsAppDirectLink = (inq: BookingInquiry) => {
    const text = `Hi ${inq.travelerName}, this is ${agencySettings.agencyName}. Thank you for reaching out regarding *${inq.packageTitle}*! We have tailored a special itinerary for your travel date (${inq.travelDate}). Would you like to review the quotation?`;
    const cleanPhone = (inq?.phone || '').replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6" id="inquiries-manager">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200  shadow-sm">
          <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-black text-stone-900 dark:text-white mt-1">{inquiries.length}</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200  shadow-sm">
          <div className="text-red-600 text-xs font-bold uppercase tracking-wider">New Inquiries</div>
          <div className="text-2xl font-black text-red-600 mt-1">
            {inquiries.filter((i) => i.status === 'New').length}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200  shadow-sm">
          <div className="text-purple-600 text-xs font-bold uppercase tracking-wider">Proposals Sent</div>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {inquiries.filter((i) => i.status === 'Quotation Sent').length}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200  shadow-sm">
          <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Confirmed Bookings</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {inquiries.filter((i) => i.status === 'Confirmed').length}
          </div>
        </div>
      </div>

      {/* Lead Type Classification Tabs */}
      <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold gap-1 max-w-lg">
        <button
          type="button"
          onClick={() => setLeadTypeFilter('all')}
          className={`flex-1 px-3 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            leadTypeFilter === 'all' ? 'bg-white text-stone-900 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>📋 All Leads</span>
          <span className="bg-stone-200/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono">
            {inquiries.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setLeadTypeFilter('tours')}
          className={`flex-1 px-3 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            leadTypeFilter === 'tours' ? 'bg-white text-stone-900 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>✈️ Yatra Bookings</span>
          <span className="bg-stone-200/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono">
            {inquiries.filter(i => !isNewsletterInquiry(i)).length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setLeadTypeFilter('newsletter')}
          className={`flex-1 px-3 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            leadTypeFilter === 'newsletter' ? 'bg-white text-stone-900 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>📬 Newsletter Signups</span>
          <span className="bg-stone-200/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono">
            {inquiries.filter(i => isNewsletterInquiry(i)).length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Booking Number (e.g. HH76868), traveler name, email, phone, or package..."
              className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'New', 'Contacted', 'Quotation Sent', 'Confirmed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#FC3200] hover:bg-[#e02c00] text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm ml-auto sm:ml-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions Sub-Bar */}
        {filteredInquiries.length > 0 && (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedInquiryIds.length === filteredInquiries.length &&
                  filteredInquiries.length > 0
                }
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded border-stone-300 text-[#FC3200] focus:ring-[#FC3200] cursor-pointer"
              />
              <span>Select All Inquiries ({filteredInquiries.length})</span>
            </label>

            {selectedInquiryIds.length > 0 && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {selectedInquiryIds.length} Selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedInquiryIds.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inquiries Table / Cards */}
      <div className="space-y-4">
        {filteredInquiries.length > 0 ? (
          filteredInquiries.map((inq) => {
            const assignedStaff = staff.find((s) => s.id === inq.assignedStaffId);

            const isNewsletter = isNewsletterInquiry(inq);
            if (isNewsletter) {
              return (
                <div
                  key={inq.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition space-y-4 ${
                    selectedInquiryIds.includes(inq.id)
                      ? 'border-[#FC3200] ring-2 ring-[#FC3200]/20 bg-orange-50/30'
                      : 'bg-stone-50/50 border-stone-200 shadow-xs hover:shadow-md'
                  }`}
                  id={`newsletter-row-${inq.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedInquiryIds.includes(inq.id)}
                        onChange={() => handleToggleSelect(inq.id)}
                        className="w-4 h-4 rounded border-stone-300 text-[#FC3200] focus:ring-[#FC3200] cursor-pointer mt-1"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF4B00] border border-orange-200 text-[10px] font-black tracking-wider uppercase">
                            📬 Subscriber
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-stone-900 truncate">
                            {inq.email}
                          </h3>
                        </div>
                        <div className="text-xs text-stone-500 font-medium leading-relaxed">
                          Reader ID: <span className="font-mono font-bold text-stone-700">{formatBookingNumber(inq.id)}</span>
                          <span className="mx-2">•</span>
                          Signed up: <span className="font-bold text-stone-700">{new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inq.email);
                          alert("Email copied to clipboard!");
                        }}
                        className="p-1.5 text-stone-500 hover:text-[#FF4B00] hover:bg-orange-50 rounded-lg transition cursor-pointer"
                        title="Copy Email"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove subscriber ${inq.email}?`)) {
                              deleteInquiry(inq.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove Subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {inq.specialRequests && (
                    <div className="text-xs text-stone-600 bg-stone-100/75 p-3 rounded-xl border border-stone-200">
                      <strong>Source Context:</strong> <span className="italic">"{inq.specialRequests}"</span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={inq.id}
                className={`p-4 sm:p-5 rounded-2xl border transition space-y-4 ${
                  selectedInquiryIds.includes(inq.id)
                    ? 'border-[#FC3200] ring-2 ring-[#FC3200]/20 bg-orange-50/20'
                    : 'bg-white border-stone-200 shadow-sm hover:shadow-md'
                }`}
                id={`inquiry-row-${inq.id}`}
              >
                {/* Header: Name, Status, Ref */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedInquiryIds.includes(inq.id)}
                      onChange={() => handleToggleSelect(inq.id)}
                      className="w-4 h-4 rounded border-stone-300 text-[#FC3200] focus:ring-[#FC3200] cursor-pointer mt-1"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <h3 className="text-base sm:text-lg font-black text-stone-900">
                          {inq.travelerName}
                        </h3>
                      
                      {/* Memorable Booking Number Badge with 1-click Copy */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyBookingNumber(inq.id, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-black text-xs hover:bg-amber-200 transition cursor-pointer"
                        title="Click to copy booking number"
                      >
                        <span>{formatBookingNumber(inq.id)}</span>
                        {copiedBookingId === inq.id ? (
                          <Check className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <Copy className="w-3 h-3 text-amber-700" />
                        )}
                      </button>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          inq.status
                        )}`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-[#FC3200] leading-snug">
                      Package: {inq.packageTitle}
                    </div>
                  </div>
                </div>
              </div>

                {/* Assignment & Status Controls Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1.5 rounded-lg border border-stone-200 text-xs shrink-0">
                    <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                    <select
                      value={inq.assignedStaffId || ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const sMember = staff.find(s => s.id === selectedId);
                        assignInquiryStaff(inq.id, selectedId, sMember ? sMember.name : 'Unassigned');
                      }}
                      className="bg-transparent text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={inq.status}
                    onChange={(e) =>
                      updateInquiryStatus(inq.id, e.target.value as BookingInquiry['status'])
                    }
                    className="text-xs font-bold bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:border-[#FC3200] focus:ring-1 focus:ring-[#FC3200] outline-none cursor-pointer shrink-0"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setEditingInquiry(inq)}
                    className="p-1.5 text-stone-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer shrink-0"
                    title="Edit Booking Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {canManage && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete booking inquiry ${formatBookingNumber(inq.id)} for ${inq.travelerName}?`)) {
                          deleteInquiry(inq.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer shrink-0"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Travel Details Box (Grey) */}
                <div className="bg-stone-50 p-3 sm:p-4 rounded-xl border border-stone-100 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>
                      Travel Date: <strong className="text-stone-900">{inq.travelDate}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Users className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>
                      Travelers:{' '}
                      <strong className="text-stone-900">
                        {inq.adults} Adults {inq.children > 0 && `, ${inq.children} Kids`}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="truncate text-stone-900 font-medium">{inq.email}</span>
                  </div>
                </div>

                {/* Quotation Preview Pill (Purple) */}
                {inq.quotation && (
                  <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-purple-900">
                        Official Proposal Issued: <span className="text-lg">${inq.quotation.finalPrice}</span>
                      </div>
                      <div className="text-purple-600/80 font-medium mt-0.5">
                        (Valid until {inq.quotation.validUntil})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadQuotationPDF(inq)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" /> Download Proposal PDF
                    </button>
                  </div>
                )}

                {/* Traveler Notes Box (Yellow) */}
                {inq.specialRequests && (
                  <div className="text-xs sm:text-sm text-stone-800 bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                    <strong className="text-amber-900">Traveler Notes:</strong> <span className="italic">"{inq.specialRequests}"</span>
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                  <a
                    href={generateWhatsAppDirectLink(inq)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition w-full sm:w-auto justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Reply via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenQuoteModal(inq)}
                    className="px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 border border-purple-200 transition w-full sm:w-auto justify-center"
                    id={`quote-btn-${inq.id}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{inq.quotation ? 'Revise Quote PDF' : 'Generate Proposal PDF'}</span>
                  </button>

                  {onConvertToInvoice && (
                    <button
                      type="button"
                      onClick={() => onConvertToInvoice(inq)}
                      className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 border border-red-200 transition w-full sm:w-auto justify-center"
                      id={`convert-invoice-${inq.id}`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Convert to Invoice</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedInquiryForTimeline(inq)}
                    className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition w-full sm:w-auto justify-center sm:ml-auto mt-2 sm:mt-0"
                  >
                    <History className="w-4 h-4" />
                    <span>Activity Log ({inq.timelineLogs?.length || 0})</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 p-6 bg-white rounded-2xl border border-stone-200">
            <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">No Inquiries Found</h4>
            <p className="text-xs text-stone-500 mt-1">
              New booking inquiries from frontend travelers will appear here instantly.
            </p>
          </div>
        )}
      </div>

      {/* Proposal / Custom Quotation Modal */}
      {selectedInquiryForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200  shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-stone-100  flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Generate Holiday Proposal: {selectedInquiryForQuote.travelerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiryForQuote(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                    Base Quotation (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                    Special Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quoteDiscount}
                    onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                    Proposal Valid Until
                  </label>
                  <input
                    type="date"
                    value={quoteValidity}
                    onChange={(e) => setQuoteValidity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                  Proposed Hotel Tier / Properties
                </label>
                <input
                  type="text"
                  value={quoteHotels}
                  onChange={(e) => setQuoteHotels(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                  Transportation / Cab Type
                </label>
                <input
                  type="text"
                  value={quoteCab}
                  onChange={(e) => setQuoteCab(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                  Custom Inclusions (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={quoteInclusions}
                  onChange={(e) => setQuoteInclusions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                  Exclusions (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={quoteExclusions}
                  onChange={(e) => setQuoteExclusions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700  uppercase tracking-wider mb-1">
                  Proposal Notes / Greetings
                </label>
                <input
                  type="text"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200  bg-white dark:bg-stone-950 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 ">
                <button
                  type="button"
                  onClick={() => setSelectedInquiryForQuote(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save & Download Official Proposal PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Timeline Modal */}
      {selectedInquiryForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full border border-stone-200  shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-100  flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-stone-600" />
                <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                  Lead Activity History: {selectedInquiryForTimeline.travelerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiryForTimeline(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
              {/* Add Note Form */}
              <form onSubmit={handleAddTimelineLog} className="space-y-2 pb-3 border-b border-stone-100 ">
                <div className="flex gap-2">
                  <select
                    value={newLogAction}
                    onChange={(e) => setNewLogAction(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-stone-200  bg-white dark:bg-stone-950 font-medium"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp Note">WhatsApp</option>
                    <option value="Follow-up Scheduled">Follow-up</option>
                    <option value="Rate Negotiation">Negotiation</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Add operational notes / call summary..."
                    value={newLogNote}
                    onChange={(e) => setNewLogNote(e.target.value)}
                    className="flex-1 px-3 py-1 text-xs rounded-lg border border-stone-200  bg-white dark:bg-stone-950"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-stone-900 dark:bg-white text-white  rounded-lg text-xs font-semibold"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Timeline Items */}
              <div className="space-y-3">
                {selectedInquiryForTimeline.timelineLogs &&
                selectedInquiryForTimeline.timelineLogs.length > 0 ? (
                  selectedInquiryForTimeline.timelineLogs.map((log) => (
                    <div key={log.id} className="text-xs bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-stone-800">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-stone-400 font-normal">{log.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="text-stone-600">{log.note}</p>
                      <p className="text-[10px] text-stone-400">Logged by: {log.author}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-4">No activity logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BOOKING MODAL */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  Edit Booking: {formatBookingNumber(editingInquiry.id)}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Update traveler details, travel dates, passenger count, or financials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingInquiry(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateInquiry(editingInquiry);
                setEditingInquiry(null);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Traveler Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingInquiry.travelerName}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, travelerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingInquiry.phone}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editingInquiry.email}
                  onChange={(e) =>
                    setEditingInquiry({ ...editingInquiry, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Tour Package Title
                </label>
                <input
                  type="text"
                  required
                  value={editingInquiry.packageTitle}
                  onChange={(e) =>
                    setEditingInquiry({ ...editingInquiry, packageTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingInquiry.travelDate}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, travelDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Adults
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingInquiry.adults}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, adults: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingInquiry.children}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, children: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Estimated Total (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingInquiry.estimatedTotal || ''}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, estimatedTotal: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Booking Status
                  </label>
                  <select
                    value={editingInquiry.status}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Special Notes / Guest Requests
                </label>
                <textarea
                  rows={2}
                  value={editingInquiry.specialRequests || ''}
                  onChange={(e) =>
                    setEditingInquiry({ ...editingInquiry, specialRequests: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  placeholder="e.g. Honeymoon cake, houseboat candle-light dinner, vegetarian meal..."
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FC3200] hover:bg-[#e02c00] text-white text-xs font-black transition cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW BOOKING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#FC3200] text-white">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-white" />
                  Create Manual Booking / Lead
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Generates a clean memorable booking number (e.g. HHXXXXX) automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitInquiry({
                  travelerName: newBookingForm.travelerName,
                  email: newBookingForm.email,
                  phone: newBookingForm.phone,
                  packageId: newBookingForm.packageId || 'custom-pkg',
                  packageTitle: newBookingForm.packageTitle,
                  travelDate: newBookingForm.travelDate,
                  adults: newBookingForm.adults,
                  children: newBookingForm.children,
                  estimatedTotal: newBookingForm.estimatedTotal,
                  specialRequests: newBookingForm.specialRequests,
                });
                setIsCreateModalOpen(false);
                setNewBookingForm({
                  travelerName: '',
                  email: '',
                  phone: '',
                  packageId: '',
                  packageTitle: 'Custom Tour Itinerary',
                  travelDate: new Date().toISOString().split('T')[0],
                  adults: 2,
                  children: 0,
                  estimatedTotal: 45000,
                  specialRequests: '',
                });
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Traveler Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Malhotra"
                    value={newBookingForm.travelerName}
                    onChange={(e) =>
                      setNewBookingForm({ ...newBookingForm, travelerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98112 34567"
                    value={newBookingForm.phone}
                    onChange={(e) =>
                      setNewBookingForm({ ...newBookingForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.travel@gmail.com"
                  value={newBookingForm.email}
                  onChange={(e) =>
                    setNewBookingForm({ ...newBookingForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Select Package (Optional)
                </label>
                <select
                  value={newBookingForm.packageId}
                  onChange={(e) => {
                    const selPkg = packages.find((p) => p.id === e.target.value);
                    setNewBookingForm({
                      ...newBookingForm,
                      packageId: e.target.value,
                      packageTitle: selPkg?.title || 'Custom Tour Itinerary',
                      estimatedTotal: selPkg ? selPkg.price * newBookingForm.adults : 45000,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                >
                  <option value="">Custom Package Itinerary</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title} ({pkg.destination}) - ₹{pkg.price?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.travelDate}
                    onChange={(e) =>
                      setNewBookingForm({ ...newBookingForm, travelDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Adults
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newBookingForm.adults}
                    onChange={(e) =>
                      setNewBookingForm({ ...newBookingForm, adults: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newBookingForm.children}
                    onChange={(e) =>
                      setNewBookingForm({ ...newBookingForm, children: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Estimated Total Budget (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newBookingForm.estimatedTotal}
                  onChange={(e) =>
                    setNewBookingForm({ ...newBookingForm, estimatedTotal: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Special Notes / Requests
                </label>
                <textarea
                  rows={2}
                  value={newBookingForm.specialRequests}
                  onChange={(e) =>
                    setNewBookingForm({ ...newBookingForm, specialRequests: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FC3200]/30"
                  placeholder="Special cab requirement, hotel category, or preferences..."
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FC3200] hover:bg-[#e02c00] text-white text-xs font-black transition cursor-pointer shadow-sm"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  UploadCloud,
  FileText,
  CreditCard,
  Check,
  Building,
  Plus,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  Filter,
  Edit3,
  Phone,
  PhoneCall,
  Link2,
  Download,
  Sparkles,
  Award,
  Compass,
  Heart,
  Settings,
  LogOut,
  MapPin,
  Camera,
  Share2,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Lock,
  Trash2,
  UserPlus,
  LogIn,
  HelpCircle,
} from 'lucide-react';
import { generatePaymentReceiptPdf } from '../../utils/paymentReceiptPdf';
import { compressPaymentProof } from '../../utils/imageCompressor';
import { formatBookingNumber } from '../../utils/bookingHelper';
import { CoTraveler, TravelerUserProfile } from '../../types/tour';
import {
  sanitizeInput,
  isValidGoogleEmail,
  generateCsrfToken,
  verifyCsrfToken,
  authRateLimiter,
} from '../../utils/security';

export type PaymentStatus = 'Pending Verification' | 'Verified' | 'Partially Paid' | 'Paid in Full';

export interface TravelerPaymentRecord {
  id: string;
  bookingId: string;
  packageTitle: string;
  userEmail: string;
  amountPaid: number;
  remainingAmount: number;
  paymentDate: string;
  proofFileName: string;
  proofBase64: string;
  status: PaymentStatus;
  paymentMode?: string;
  notes?: string;
}

const DEFAULT_SAMPLE_PAYMENTS: TravelerPaymentRecord[] = [
  {
    id: 'HH-REC-8921',
    bookingId: 'inq-kashmir-892',
    packageTitle: 'Paradise Kashmir: Srinagar, Gulmarg, Pahalgam & Luxury Houseboat',
    userEmail: 'vip.traveler@gmail.com',
    amountPaid: 20000,
    remainingAmount: 28500,
    paymentDate: '31 Aug 2026, 02:45 PM',
    proofFileName: 'bank_transfer_adv_kashmir.jpg',
    proofBase64: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'Verified',
    paymentMode: 'Google Pay / UPI Deposit',
    notes: 'Advance installment approved for Houseboat and Innova Crysta allocation.',
  },
  {
    id: 'HH-REC-8922',
    bookingId: 'inq-kashmir-892',
    packageTitle: 'Paradise Kashmir: Srinagar, Gulmarg, Pahalgam & Luxury Houseboat',
    userEmail: 'vip.traveler@gmail.com',
    amountPaid: 10000,
    remainingAmount: 18500,
    paymentDate: '02 Sep 2026, 11:20 AM',
    proofFileName: 'upi_receipt_installment_2.png',
    proofBase64: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    status: 'Partially Paid',
    paymentMode: 'HDFC NetBanking IMPS',
    notes: 'Second installment recorded.',
  },
  {
    id: 'HH-REC-9011',
    bookingId: 'inq-hh-901',
    packageTitle: 'Paradise Kashmir: Srinagar, Gulmarg, Pahalgam & Luxury Houseboat',
    userEmail: 'care@mybhaktisathi.com',
    amountPaid: 48500,
    remainingAmount: 0,
    paymentDate: '01 Sep 2026, 04:30 PM',
    proofFileName: 'full_settlement_receipt.jpg',
    proofBase64: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'Paid in Full',
    paymentMode: 'Online Bank Transfer',
    notes: 'Holiday package paid in full. Ground transport and stays 100% reserved.',
  },
];

export const TravelerProfilePage: React.FC = () => {
  const {
    travelerUser,
    setTravelerUser,
    updateTravelerProfile,
    loginWithGoogle,
    connectGoogleCalendar,
    googleToken,
    logoutTraveler,
    inquiries,
    packages,
    wishlistIds,
    toggleWishlist,
    navigateToHome,
    navigateToPackage,
    navigateToAllTours,
    setIsTravelerAuthModalOpen,
    agencySettings,
    navigateToJapCounter,
  } = useTours();

  // Load Jap Counter statistics for the profile dashboard card dynamically
  const [japStats, setJapStats] = useState({ todayChants: 0, lifetimeChants: 0, lifetimeMalas: 0 });

  useEffect(() => {
    const loadJapStats = () => {
      try {
        const saved = localStorage.getItem('hh_jap_counter_data_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          const records = Array.isArray(parsed.records) ? parsed.records : [];
          const todayStr = new Date().toISOString().split('T')[0];
          const todayRecords = records.filter((r: any) => r.dateStr === todayStr);
          const todayChants = todayRecords.reduce((sum: number, r: any) => sum + (r.beadCount || 0), 0);
          const lifetimeChants = records.reduce((sum: number, r: any) => sum + (r.beadCount || 0), 0);
          const lifetimeMalas = records.reduce((sum: number, r: any) => sum + (r.malasCompleted || 0), 0);
          setJapStats({ todayChants, lifetimeChants, lifetimeMalas });
        }
      } catch (e) {
        console.error('Failed to load jap stats:', e);
      }
    };

    loadJapStats();
    
    // Refresh stats when user returns to this page/window tab or localStorage updates
    window.addEventListener('storage', loadJapStats);
    window.addEventListener('focus', loadJapStats);

    return () => {
      window.removeEventListener('storage', loadJapStats);
      window.removeEventListener('focus', loadJapStats);
    };
  }, []);

  // Google Calendar Integration states in Settings
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    try {
      return localStorage.getItem('hh_jap_auto_sync') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAutoSync = async () => {
    if (!googleToken) {
      // Directs user to grant calendar scopes with Supabase Auth
      await connectGoogleCalendar();
      return;
    }
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    try {
      localStorage.setItem('hh_jap_auto_sync', newValue ? 'true' : 'false');
    } catch {}
  };

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'trips' | 'payments' | 'cotravelers' | 'wishlist' | 'settings'>('trips');
  
  // Trips filter
  const [tripsFilter, setTripsFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');

  // Load payment records from localStorage
  const [paymentRecords, setPaymentRecords] = useState<TravelerPaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('hh_traveler_payments_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SAMPLE_PAYMENTS;
  });

  // Save payments to localStorage
  useEffect(() => {
    localStorage.setItem('hh_traveler_payments_v2', JSON.stringify(paymentRecords));
  }, [paymentRecords]);

  // Status Filter in Payment History
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | PaymentStatus>('All');
  
  // Record Payment Modal State (for recording bank transfer / UPI / cash deposits)
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentModeInput, setPaymentModeInput] = useState<string>('Google Pay / PhonePe UPI');
  const [paymentNotesInput, setPaymentNotesInput] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedBase64, setUploadedBase64] = useState<string>('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [recordSuccessToast, setRecordSuccessToast] = useState<string | null>(null);

  // Selected receipt image modal preview
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Co-Traveler Modal State
  const [isCoTravelerModalOpen, setIsCoTravelerModalOpen] = useState(false);
  const [coTravelerForm, setCoTravelerForm] = useState<Partial<CoTraveler>>({
    fullName: '',
    relationship: 'Spouse',
    gender: 'Female',
    age: 28,
    idNumber: '',
  });

  // Edit Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<TravelerUserProfile>>({});

  useEffect(() => {
    if (travelerUser) {
      setProfileForm({
        name: travelerUser.name,
        email: travelerUser.email,
        phone: travelerUser.phone,
        city: travelerUser.city,
        state: travelerUser.state,
        country: travelerUser.country,
        dietPreference: travelerUser.dietPreference,
        roomPreference: travelerUser.roomPreference,
        idType: travelerUser.idType,
        idNumber: travelerUser.idNumber,
        emergencyContact: travelerUser.emergencyContact,
      });
    }
  }, [travelerUser]);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Guest Google Login States
  const [guestAuthMode, setGuestAuthMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [guestAuthLoading, setGuestAuthLoading] = useState(false);
  const [guestAuthError, setGuestAuthError] = useState('');

  // Guest Continuation States
  const [profileGuestName, setProfileGuestName] = useState('');
  const [profileGuestEmail, setProfileGuestEmail] = useState('');
  const [profileGuestPhone, setProfileGuestPhone] = useState('');

  // Filter inquiries relevant to current traveler user
  const userInquiries = useMemo(() => {
    if (!travelerUser) return inquiries;
    const currentEmail = travelerUser.email.toLowerCase().trim();
    const currentPhone = (travelerUser.phone || '').replace(/[^0-9]/g, '');

    return inquiries.filter((inq) => {
      const inqEmail = (inq.email || '').toLowerCase().trim();
      const inqPhone = (inq.phone || '').replace(/[^0-9]/g, '');
      
      const emailMatch = inqEmail === currentEmail ||
        (currentEmail.includes('mybhaktisathi') && inqEmail.includes('mybhaktisathi')) ||
        (currentEmail.includes('vip') && inqEmail.includes('vip'));
      
      const phoneMatch = currentPhone.length >= 10 && inqPhone.includes(currentPhone.slice(-10));
      return emailMatch || phoneMatch;
    });
  }, [travelerUser, inquiries]);

  // Filtered trips based on sub-tab
  const filteredTrips = useMemo(() => {
    if (tripsFilter === 'confirmed') {
      return userInquiries.filter((inq) => inq.status === 'Confirmed');
    }
    if (tripsFilter === 'pending') {
      return userInquiries.filter((inq) => inq.status !== 'Confirmed' && inq.status !== 'Completed');
    }
    if (tripsFilter === 'completed') {
      return userInquiries.filter((inq) => inq.status === 'Completed');
    }
    return userInquiries;
  }, [userInquiries, tripsFilter]);

  // Relevant payments for current user
  const userPayments = useMemo(() => {
    if (!travelerUser) return paymentRecords;
    const currentEmail = travelerUser.email.toLowerCase().trim();

    return paymentRecords.filter((pay) => {
      const payEmail = pay.userEmail.toLowerCase().trim();
      const emailMatch = payEmail === currentEmail ||
        (currentEmail.includes('mybhaktisathi') && payEmail.includes('mybhaktisathi')) ||
        (currentEmail.includes('vip') && payEmail.includes('vip'));
      
      const inqMatch = userInquiries.some((inq) => inq.id === pay.bookingId);
      return emailMatch || inqMatch;
    });
  }, [travelerUser, paymentRecords, userInquiries]);

  // Filtered payments by status
  const filteredPayments = useMemo(() => {
    if (historyStatusFilter === 'All') return userPayments;
    return userPayments.filter((p) => p.status === historyStatusFilter);
  }, [userPayments, historyStatusFilter]);

  // Total amount paid by user across payments
  const totalVerifiedPaid = useMemo(() => {
    return userPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  }, [userPayments]);

  // Wishlisted tour packages
  const wishlistedPackages = useMemo(() => {
    return packages.filter((pkg) => wishlistIds.includes(pkg.id));
  }, [packages, wishlistIds]);

  // Download PDF receipt helper
  const handleDownloadReceipt = async (record: TravelerPaymentRecord) => {
    const matchingInquiry = inquiries.find((inq) => inq.id === record.bookingId);
    await generatePaymentReceiptPdf({
      receiptNumber: record.id,
      bookingId: record.bookingId,
      packageTitle: record.packageTitle,
      travelerName: travelerUser?.name || matchingInquiry?.travelerName || 'Guest Traveler',
      travelerEmail: record.userEmail || travelerUser?.email || matchingInquiry?.email || 'guest@mybhaktisathi.com',
      travelerPhone: travelerUser?.phone || matchingInquiry?.phone || '+91 94199 15255',
      travelDate: matchingInquiry?.travelDate,
      amountPaid: record.amountPaid,
      remainingAmount: record.remainingAmount,
      totalPackageCost: matchingInquiry?.estimatedTotal || (record.amountPaid + record.remainingAmount),
      paymentDate: record.paymentDate,
      paymentStatus: record.status,
      paymentMode: record.paymentMode || 'Online Bank Transfer',
      agencySettings,
    });
  };

  // Download booking-level receipt (supports full and partial advance payments)
  const handleDownloadBookingReceipt = async (trip: typeof inquiries[0], paidAmount: number, remainingAmount: number) => {
    const matching = userPayments.find((p) => p.bookingId === trip.id);
    const receiptId = matching?.id || `HH-REC-${trip.id.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
    const status: PaymentStatus = remainingAmount === 0 ? 'Paid in Full' : 'Partially Paid';
    
    await generatePaymentReceiptPdf({
      receiptNumber: receiptId,
      bookingId: trip.id,
      packageTitle: trip.packageTitle,
      travelerName: travelerUser?.name || trip.travelerName || 'Guest Traveler',
      travelerEmail: travelerUser?.email || trip.email || 'guest@mybhaktisathi.com',
      travelerPhone: travelerUser?.phone || trip.phone || '+91 94199 15255',
      travelDate: trip.travelDate,
      amountPaid: paidAmount,
      remainingAmount: remainingAmount,
      totalPackageCost: trip.estimatedTotal || (paidAmount + remainingAmount),
      paymentDate: matching?.paymentDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentStatus: status,
      paymentMode: matching?.paymentMode || 'Direct Bank Transfer / UPI',
      agencySettings,
    });
  };

  // Proof image upload helper with automatic 600px compression & background R2 sync
  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Auto compress to 600px and auto-prepare R2 Cloudflare storage seamlessly
      const processed = await compressPaymentProof(file);
      setUploadedFileName(processed.fileName);
      setUploadedBase64(processed.dataUrl);
    } catch (err) {
      // Fallback
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit recorded payment (offline / bank transfer / cash / advance)
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !paymentAmountInput || Number(paymentAmountInput) <= 0) {
      alert('Please select a booking and enter a valid payment amount.');
      return;
    }

    if (!uploadedBase64) {
      alert('Payment screenshot / deposit receipt is mandatory. Please attach your payment screenshot.');
      return;
    }

    setIsRecordingPayment(true);

    const targetInquiry = inquiries.find((inq) => inq.id === selectedBookingId);
    const totalCost = targetInquiry?.estimatedTotal || 58000;
    const paidNum = Number(paymentAmountInput);

    // Calculate existing payments for this booking
    const priorPaid = userPayments
      .filter((p) => p.bookingId === selectedBookingId)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const newTotalPaid = priorPaid + paidNum;
    const remaining = Math.max(0, totalCost - newTotalPaid);

    let calcStatus: PaymentStatus = 'Partially Paid';
    if (remaining === 0) calcStatus = 'Paid in Full';
    else if (paidNum > 0) calcStatus = 'Verified';

    const newReceiptId = `HH-REC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: TravelerPaymentRecord = {
      id: newReceiptId,
      bookingId: selectedBookingId,
      packageTitle: targetInquiry?.packageTitle || 'Custom Holiday Tour Package',
      userEmail: travelerUser?.email || 'care@mybhaktisathi.com',
      amountPaid: paidNum,
      remainingAmount: remaining,
      paymentDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      proofFileName: uploadedFileName || 'bank_transfer_receipt.png',
      proofBase64: uploadedBase64 || '',
      status: calcStatus,
      paymentMode: paymentModeInput,
      notes: paymentNotesInput || 'Direct payment recorded for holiday reservation.',
    };

    setPaymentRecords((prev) => [newRecord, ...prev]);
    setIsRecordingPayment(false);
    setIsRecordPaymentModalOpen(false);
    setRecordSuccessToast(`Payment of ₹${paidNum.toLocaleString('en-IN')} recorded successfully! Receipt #${newReceiptId} generated.`);
    
    // Auto-generate and download official PDF receipt
    await handleDownloadReceipt(newRecord);

    // Reset form
    setSelectedBookingId('');
    setPaymentAmountInput('');
    setUploadedFileName('');
    setUploadedBase64('');
    setPaymentNotesInput('');

    setTimeout(() => {
      setRecordSuccessToast(null);
    }, 6000);
  };

  // Add Co-Traveler
  const handleAddCoTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coTravelerForm.fullName) return;

    const newCoTraveler: CoTraveler = {
      id: `cotrav-${Date.now()}`,
      fullName: coTravelerForm.fullName,
      relationship: coTravelerForm.relationship as any || 'Friend',
      gender: coTravelerForm.gender as any || 'Female',
      age: coTravelerForm.age || 25,
      idNumber: coTravelerForm.idNumber || '',
      passportNumber: coTravelerForm.passportNumber || '',
    };

    const currentCo = travelerUser?.coTravelers || [];
    updateTravelerProfile({
      coTravelers: [...currentCo, newCoTraveler],
    });

    setIsCoTravelerModalOpen(false);
    setCoTravelerForm({
      fullName: '',
      relationship: 'Spouse',
      gender: 'Female',
      age: 28,
      idNumber: '',
    });
  };

  // Remove Co-Traveler
  const handleRemoveCoTraveler = (id: string) => {
    const currentCo = travelerUser?.coTravelers || [];
    updateTravelerProfile({
      coTravelers: currentCo.filter((c) => c.id !== id),
    });
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTravelerProfile(profileForm);
    setIsEditingProfile(false);
  };

  // -------------------------------------------------------------
  // VIEW: GUEST / NOT LOGGED IN STATE
  // -------------------------------------------------------------
  if (!travelerUser) {
    const handleProfileGuestSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!profileGuestName.trim() || !profileGuestEmail.trim()) return;
      setTravelerUser({
        name: profileGuestName.trim(),
        email: profileGuestEmail.trim().toLowerCase(),
        phone: profileGuestPhone.trim(),
        isGuest: true,
      });
    };

    const handleGuestGoogleAuth = async () => {
      const rateCheck = authRateLimiter.checkAllowed();
      if (!rateCheck.allowed) {
        setGuestAuthError(rateCheck.reason || 'Please wait before trying again.');
        return;
      }
      setGuestAuthError('');
      setGuestAuthLoading(true);

      try {
        await loginWithGoogle();
      } catch (err: any) {
        setGuestAuthError(err?.message || 'Failed to authenticate with Google. Please try again.');
      } finally {
        setGuestAuthLoading(false);
      }
    };

    return (
      <div className="w-full min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* Top Back Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={navigateToHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#FF4B00] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tours</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-stone-500">Secure Portal</span>
            </div>
          </div>

          {/* Secure Google Login Card */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white mx-auto flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5 text-[#FF4B00]" />
              </div>
              <h1 className="text-xl font-black text-stone-900 tracking-tight">
                {guestAuthMode === 'guest'
                  ? 'Continue as Guest'
                  : guestAuthMode === 'signin'
                  ? 'Sign In with Google'
                  : 'Sign Up with Google'}
              </h1>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {guestAuthMode === 'guest'
                  ? 'Access the portal instantly to track your inquiries'
                  : 'Secure 1-click verification for travelers'}
              </p>
            </div>

            {/* Sign In vs Sign Up Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setGuestAuthMode('signin');
                  setGuestAuthError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  guestAuthMode === 'signin'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGuestAuthMode('signup');
                  setGuestAuthError('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  guestAuthMode === 'signup'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {guestAuthError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{guestAuthError}</span>
              </div>
            )}

            {guestAuthMode !== 'guest' ? (
              <div className="space-y-4">
                {/* Main Google Login Button */}
                <button
                  type="button"
                  onClick={handleGuestGoogleAuth}
                  disabled={guestAuthLoading}
                  className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-stone-400 text-stone-900 font-extrabold text-sm flex items-center justify-center gap-3 transition shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-55"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {guestAuthLoading
                      ? 'Connecting to Google...'
                      : guestAuthMode === 'signin'
                      ? 'Sign in with Google'
                      : 'Sign up with Google'}
                  </span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-4 text-stone-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuestAuthMode('guest');
                    setGuestAuthError('');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#FF4B00]" />
                  <span>Continue as Guest Traveler</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileGuestSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={profileGuestName}
                    onChange={(e) => setProfileGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.traveler@gmail.com"
                    value={profileGuestEmail}
                    onChange={(e) => setProfileGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 94199 15255"
                    value={profileGuestPhone}
                    onChange={(e) => setProfileGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setGuestAuthMode('signin')}
                    className="w-1/3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Access Guest Portal</span>
                  </button>
                </div>
              </form>
            )}

            {/* Security Guarantee Badge */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11.5px] font-bold text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit Encrypted &bull; Phishing-Protected Google OAuth</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOGGED IN TRAVELER DASHBOARD (BIG-WEBSITE PROFILE)
  // -------------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-stone-100/60 pb-16">
      
      {/* Toast notification */}
      {recordSuccessToast && (
        <div className="fixed top-5 right-5 z-[120] max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-black text-white">Payment Recorded</p>
            <p className="text-stone-300 mt-0.5">{recordSuccessToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setRecordSuccessToast(null)}
            className="text-stone-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP PROFILE HERO BANNER */}
      <div className="bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <button
              type="button"
              onClick={navigateToHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#FF4B00] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore Tours</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Account</span>
              </span>
              
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 border border-stone-200 hover:border-red-200 text-xs font-extrabold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Profile Identity Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative group shrink-0">
                {travelerUser.avatar ? (
                  <img
                    src={travelerUser.avatar}
                    alt={travelerUser.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-stone-200 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-sm shrink-0">
                    {travelerUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Google or Verified Provider Icon Badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white shadow-md border border-stone-100 flex items-center justify-center">
                  {travelerUser.authProvider === 'google' ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                    {travelerUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>{travelerUser.memberTier || 'Bhakti Sathi Elite'}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-bold text-stone-500">
                  <span className="flex items-center gap-1 text-stone-700">
                    <Mail className="w-3.5 h-3.5 text-[#FF4B00]" />
                    <span>{travelerUser.email}</span>
                  </span>
                  {travelerUser.phone && (
                    <span className="flex items-center gap-1 text-stone-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{travelerUser.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{travelerUser.city || 'Srinagar / Delhi'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Edit / Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsEditingProfile(true);
                }}
                className="grow sm:grow-0 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-extrabold text-stone-800 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FF4B00]" />
                <span>Edit Profile</span>
              </button>

              <a
                href={`https://wa.me/${(agencySettings.whatsapp || '+919419915255').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi Bhakti Sathi Team, I am logged in as ${travelerUser.name} (${travelerUser.email}) and need assistance with my bookings.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grow sm:grow-0 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>

          {/* Main Profile Navigation as Interactive Cards with Brand Color */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-stone-100">
            {/* Card 1: My Trips & Bookings */}
            <button
              type="button"
              onClick={() => setActiveTab('trips')}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 relative overflow-hidden group ${
                activeTab === 'trips'
                  ? 'bg-white border-[#FF4B00] shadow-md ring-4 ring-[#FF4B00]/10'
                  : 'bg-stone-50/80 hover:bg-white border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === 'trips' ? 'bg-[#FF4B00] text-white' : 'bg-orange-50 text-[#FF4B00]'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'trips' ? 'bg-[#FF4B00] text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {userInquiries.length}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">My Trips</p>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Bookings & Itineraries</p>
              </div>
              {activeTab === 'trips' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4B00]" />
              )}
            </button>

            {/* Card 2: Payments & Receipts */}
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 relative overflow-hidden group ${
                activeTab === 'payments'
                  ? 'bg-white border-[#FF4B00] shadow-md ring-4 ring-[#FF4B00]/10'
                  : 'bg-stone-50/80 hover:bg-white border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === 'payments' ? 'bg-[#FF4B00] text-white' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'payments' ? 'bg-[#FF4B00] text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {userPayments.length}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">Payments</p>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Receipts & Invoices</p>
              </div>
              {activeTab === 'payments' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4B00]" />
              )}
            </button>

            {/* Card 3: Co-Travelers */}
            <button
              type="button"
              onClick={() => setActiveTab('cotravelers')}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 relative overflow-hidden group ${
                activeTab === 'cotravelers'
                  ? 'bg-white border-[#FF4B00] shadow-md ring-4 ring-[#FF4B00]/10'
                  : 'bg-stone-50/80 hover:bg-white border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === 'cotravelers' ? 'bg-[#FF4B00] text-white' : 'bg-purple-50 text-purple-600'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'cotravelers' ? 'bg-[#FF4B00] text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  {(travelerUser.coTravelers || []).length}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">Co-Travelers</p>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Family & Friends Hub</p>
              </div>
              {activeTab === 'cotravelers' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4B00]" />
              )}
            </button>

            {/* Card 4: Saved Wishlist */}
            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 relative overflow-hidden group ${
                activeTab === 'wishlist'
                  ? 'bg-white border-[#FF4B00] shadow-md ring-4 ring-[#FF4B00]/10'
                  : 'bg-stone-50/80 hover:bg-white border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === 'wishlist' ? 'bg-[#FF4B00] text-white' : 'bg-red-50 text-red-500'
                }`}>
                  <Heart className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'wishlist' ? 'bg-[#FF4B00] text-white' : 'bg-red-100 text-red-800'
                }`}>
                  {wishlistIds.length}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">Saved Wishlist</p>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Saved Tour Plans</p>
              </div>
              {activeTab === 'wishlist' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4B00]" />
              )}
            </button>

            {/* Card 5: Jap Counter */}
            <button
              type="button"
              onClick={navigateToJapCounter}
              className="p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 relative overflow-hidden group bg-stone-50/80 hover:bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-100 text-brand-orange">
                  <span className="text-base">📿</span>
                </div>
                {japStats.todayChants > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-brand-orange text-white whitespace-nowrap">
                    Today: {japStats.todayChants}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-stone-200 text-stone-600 whitespace-nowrap">
                    Sadhana
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-black text-stone-900 flex items-center gap-1">
                  <span>Jap Counter</span>
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
                </p>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis" title={japStats.lifetimeMalas > 0 ? `${japStats.lifetimeMalas} Malas Done` : 'Mantra chanting tool'}>
                  {japStats.lifetimeMalas > 0 ? `${japStats.lifetimeMalas} Malas Completed` : 'Mantra chanting tool'}
                </p>
              </div>
            </button>

            {/* Card 6: Account & Security */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 relative overflow-hidden group col-span-1 ${
                activeTab === 'settings'
                  ? 'bg-white border-[#FF4B00] shadow-md ring-4 ring-[#FF4B00]/10'
                  : 'bg-stone-50/80 hover:bg-white border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === 'settings' ? 'bg-[#FF4B00] text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  <Settings className="w-5 h-5" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Verified Account" />
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">Account</p>
                <p className="text-[11px] font-bold text-stone-500 mt-0.5">Profile & Security</p>
              </div>
              {activeTab === 'settings' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4B00]" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MAIN TAB CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ----------------------------------------------------------- */}
        {/* TAB 1: MY TRIPS & BOOKINGS */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            
            {/* Sub-Filter Chips - Responsive 4-Column Segmented Bar */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'completed', label: 'Completed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTripsFilter(tab.id)}
                  className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center ${
                    tripsFilter === tab.id
                      ? 'bg-[#FF4B00] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Bookings List */}
            {filteredTrips.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Compass className="w-8 h-8 text-[#FF4B00]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-stone-900">No Bookings Found in this Category</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    You don't have any bookings matching this filter. Select "All Bookings" or check back once your customized itinerary is updated.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredTrips.map((trip) => {
                  const matchingPayments = userPayments.filter((p) => p.bookingId === trip.id);
                  const paidForTrip = matchingPayments.reduce((sum, p) => sum + p.amountPaid, 0);
                  const totalTripCost = trip.estimatedTotal || 48500;
                  const remainingTripCost = Math.max(0, totalTripCost - paidForTrip);
                  const percentPaid = Math.min(100, Math.round((paidForTrip / totalTripCost) * 100));

                  const matchedPackage = packages.find((p) => p.id === trip.packageId || p.title === trip.packageTitle);
                  const coverImage = matchedPackage?.heroImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80';

                  const travelerStatusLabel = trip.status === 'Confirmed' 
                    ? 'Confirmed' 
                    : trip.status === 'Quotation Sent' 
                    ? 'Quote Received' 
                    : trip.status === 'Completed' 
                    ? 'Completed' 
                    : trip.status === 'New' 
                    ? 'Request Received' 
                    : trip.status;

                  return (
                    <div
                      key={trip.id}
                      className="bg-white rounded-3xl border border-stone-200 hover:border-[#FF4B00]/40 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 space-y-5"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#FF4B00] text-xs font-black">
                            REF #{trip.id}
                          </span>
                          <span className="text-xs text-stone-400 font-bold">
                            Booked on {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          trip.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : trip.status === 'Quotation Sent'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : trip.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}>
                          {travelerStatusLabel}
                        </span>
                      </div>

                      {/* Card Content Row */}
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Compact Thumbnail */}
                        <img
                          src={coverImage}
                          alt={trip.packageTitle}
                          className="w-full sm:w-36 h-36 rounded-2xl object-cover border border-stone-200 shrink-0"
                        />

                        {/* Details */}
                        <div className="grow space-y-3 w-full">
                          <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                            {trip.packageTitle}
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                              <p className="text-[10px] font-black uppercase text-stone-400">Travel Date</p>
                              <p className="text-xs font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#FF4B00]" />
                                <span>{trip.travelDate || 'Flexible 2026'}</span>
                              </p>
                            </div>

                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                              <p className="text-[10px] font-black uppercase text-stone-400">Travelers</p>
                              <p className="text-xs font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-stone-600" />
                                <span>{trip.adults} Adults {trip.children > 0 ? `+ ${trip.children} Child` : ''}</span>
                              </p>
                            </div>

                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 col-span-2 sm:col-span-1">
                              <p className="text-[10px] font-black uppercase text-stone-400">Agreed Price</p>
                              <p className="text-xs font-black text-stone-900 mt-0.5">
                                ₹{totalTripCost.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Progress */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-stone-700">
                            Payment: <strong className="text-emerald-700">₹{paidForTrip.toLocaleString('en-IN')}</strong> paid ({percentPaid}%)
                          </span>
                          <span className="text-stone-600">
                            Due Balance: <strong className="text-stone-900">₹{remainingTripCost.toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-200/70 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons Hub - Clean Unified Inline Layout */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        {paidForTrip > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadBookingReceipt(trip, paidForTrip, remainingTripCost)}
                            className="inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF4B00] border border-[#FF4B00]/30 text-xs font-black transition cursor-pointer shadow-2xs"
                            title={remainingTripCost === 0 ? 'Download Full Payment Receipt (PDF)' : 'Download Partial / Advance Payment Receipt (PDF)'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{remainingTripCost === 0 ? 'Download Receipt (PDF)' : `Download Receipt (₹${paidForTrip.toLocaleString('en-IN')})`}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-stone-400 italic py-1 px-1">No advance deposit recorded</span>
                        )}

                        <a
                          href={`https://wa.me/${(agencySettings.whatsapp || '+919419915255').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hi Bhakti Sathi Team, I am inquiring about my booking #${trip.id} for ${trip.packageTitle}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Support</span>
                        </a>

                        {/* ONLY show Record Payment if NOT 100% paid (remaining balance > 0) */}
                        {remainingTripCost > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingId(trip.id);
                              setPaymentAmountInput(String(remainingTripCost));
                              setIsRecordPaymentModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#FF4B00] hover:bg-[#E03E00] text-white text-xs font-black transition cursor-pointer shadow-xs"
                            title="Record offline payment or bank deposit for this booking"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Paid in Full</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: PAYMENTS */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            
            {/* Clean Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF4B00]" />
                <span>Payments</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookingId(userInquiries.length > 0 ? userInquiries[0].id : '');
                    setPaymentAmountInput('');
                    setIsRecordPaymentModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#FF4B00] hover:bg-[#E03E00] text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>

                <a
                  href={`https://wa.me/${(agencySettings.whatsapp || '+919419915255').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi Bhakti Sathi Accounts Team, I have a query regarding payment receipt / bank transfer verification.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Accounts</span>
                </a>
              </div>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['All', 'Verified', 'Partially Paid', 'Paid in Full', 'Pending Verification'] as const).map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setHistoryStatusFilter(statusKey)}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                    historyStatusFilter === statusKey
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {statusKey}
                </button>
              ))}
            </div>

            {/* Payment Records Table / Cards */}
            {filteredPayments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-3">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-black text-stone-800">No Payment Records Found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  No payment deposits match your selected filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPayments.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-mono text-xs font-black">
                            #{record.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            record.status === 'Paid in Full' || record.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
                          {record.packageTitle}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Booking Ref: <strong>#{record.bookingId}</strong> &bull; Paid on {record.paymentDate}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black uppercase text-stone-400">Amount Acknowledged</p>
                        <p className="text-lg font-black text-[#FF4B00]">
                          INR {record.amountPaid.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-stone-500 font-bold">
                          Remaining Due: {record.remainingAmount === 0 ? 'NIL (Settled)' : `INR ${record.remainingAmount.toLocaleString('en-IN')}`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                        <span>Mode: <strong className="text-stone-900">{record.paymentMode || 'Online Transfer'}</strong></span>
                        {record.proofBase64 && (
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(record.proofBase64)}
                            className="text-[#FF4B00] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(record)}
                        className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FF4B00]" />
                        <span>Download Official PDF Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 3: CO-TRAVELERS (FAMILY & FRIENDS) */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'cotravelers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Co-Travelers (Family & Friends List)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Save your family and group member details for seamless 1-click booking checkouts and domestic tourist permits.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCoTravelerModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#FF4B00]" />
                <span>Add Co-Traveler</span>
              </button>
            </div>

            {/* Co-Travelers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Primary User Card */}
              <div className="bg-white rounded-2xl border-2 border-[#FF4B00]/30 p-5 space-y-3 relative">
                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-orange-100 text-[#FF4B00] text-[10px] font-black uppercase">
                  Primary Traveler
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4B00] to-orange-600 text-white font-black flex items-center justify-center">
                  {travelerUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900">{travelerUser.name}</h4>
                  <p className="text-xs text-stone-500 font-medium">Account Owner</p>
                </div>
                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 space-y-1 font-medium">
                  <p>Email: {travelerUser.email}</p>
                  <p>Phone: {travelerUser.phone || 'Not specified'}</p>
                  <p>ID Type: {travelerUser.idType || 'Aadhaar / Passport'}</p>
                </div>
              </div>

              {/* Saved Co-Travelers */}
              {(travelerUser.coTravelers || []).map((cotrav) => (
                <div
                  key={cotrav.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 relative hover:border-stone-300 transition"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveCoTraveler(cotrav.id)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-red-600 transition"
                    title="Remove co-traveler"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center">
                    {cotrav.fullName.charAt(0)}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-stone-900">{cotrav.fullName}</h4>
                    <p className="text-xs text-purple-700 font-extrabold">{cotrav.relationship} &bull; {cotrav.gender}, {cotrav.age || 'N/A'} yrs</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 space-y-1 font-medium">
                    <p>ID Proof: {cotrav.idNumber || 'Verified on booking'}</p>
                    {cotrav.passportNumber && <p>Passport: {cotrav.passportNumber}</p>}
                  </div>
                </div>
              ))}

              {/* Add New Quick Button */}
              <button
                type="button"
                onClick={() => setIsCoTravelerModalOpen(true)}
                className="min-h-[160px] rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#FF4B00] bg-stone-50/50 hover:bg-orange-50/20 p-5 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-[#FF4B00] transition cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-black">Add Family or Friend</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 4: SAVED TOURS & WISHLIST */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span>Saved Packages & Wishlist</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Your curated bucket list of dream holiday tours and custom itineraries.
                </p>
              </div>
            </div>

            {wishlistedPackages.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
                <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-black text-stone-800">Your Wishlist is Empty</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Click the heart icon on any package to save it to your traveler dashboard for instant comparison.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={navigateToAllTours}
                  className="py-3 px-6 rounded-xl bg-[#FF4B00] text-white text-xs font-black hover:bg-[#E03E00] transition cursor-pointer shadow-sm"
                >
                  Browse Tour Packages
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlistedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div className="relative h-48">
                      <img
                        src={pkg.heroImage}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => toggleWishlist(pkg.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-md transition hover:scale-110"
                      >
                        <Heart className="w-4 h-4 fill-red-500" />
                      </button>
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-black">
                        {pkg.durationDays}D / {pkg.durationNights}N
                      </span>
                    </div>

                    <div className="p-5 space-y-3 flex flex-col grow justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#FF4B00]">{pkg.destination}</p>
                        <h4 className="text-sm font-black text-stone-900 line-clamp-2 leading-snug">{pkg.title}</h4>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400">Starting from</p>
                          <p className="text-sm font-black text-stone-900">₹{pkg.pricing?.standard?.toLocaleString('en-IN') || pkg.price?.toLocaleString('en-IN')}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigateToPackage(pkg.id)}
                          className="py-2 px-3.5 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl transition cursor-pointer"
                        >
                          View Tour
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 5: ACCOUNT SETTINGS & PREFERENCES */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* Personal Details Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-black text-stone-900">Personal Information & Preferences</h3>
                  <p className="text-xs text-stone-500">Update your traveler details for permits and vouchers</p>
                </div>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF4B00]" />
                    <span>Edit Info</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40 disabled:bg-stone-50 disabled:text-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled={!isEditingProfile}
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40 disabled:bg-stone-50 disabled:text-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40 disabled:bg-stone-50 disabled:text-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                      City & State
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      placeholder="e.g. New Delhi, Delhi"
                      value={profileForm.city || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40 disabled:bg-stone-50 disabled:text-stone-600"
                    />
                  </div>



                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                      Room / Bedding Preference
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      placeholder="e.g. Mountain View, King Bed, Lake Facing"
                      value={profileForm.roomPreference || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, roomPreference: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40 disabled:bg-stone-50 disabled:text-stone-600"
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black transition cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="py-2.5 px-4 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Connected Accounts & Security */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-stone-900">Connected Accounts & Authentication</h3>
              
              <div className="divide-y divide-stone-100">
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">Google Account</p>
                      <p className="text-[11px] text-stone-500">{travelerUser.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                    Connected
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-stone-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">Mobile SMS Alerts</p>
                      <p className="text-[11px] text-stone-500">{travelerUser.phone || 'Provided during reservation'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Google Calendar Sync Settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                  <Calendar className="w-4 h-4 text-[#FF4B00]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Google Calendar Synchronization</h3>
                  <p className="text-[11px] text-stone-500">Log your spiritual chanting progress as visual events in your calendar</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="max-w-md pr-4">
                  <p className="text-xs font-black text-stone-900">Daily Sadhana Sync</p>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    Once enabled, completing your mala rounds in the Jap Counter will automatically write an elegant, orange-colored "Jap Sadhana" event to your primary Google Calendar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoSync}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoSyncEnabled && googleToken ? 'bg-[#FF4B00]' : 'bg-stone-200'
                  }`}
                  role="switch"
                  aria-checked={autoSyncEnabled && !!googleToken}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      autoSyncEnabled && googleToken ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {!googleToken ? (
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Google Calendar access has not been authorized yet. Tap to connect your Gmail account and enable syncing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => connectGoogleCalendar()}
                    className="shrink-0 py-1.5 px-3 rounded-lg bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Connect Google Calendar</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Google Calendar is successfully authorized! Completing a 108-bead mala round on the Jap Counter will instantly log your sadhana in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Danger Zone: Logout */}
            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-200 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-800">Account Session</h4>
              <p className="text-xs text-stone-600">
                You are currently signed in as <strong>{travelerUser.email}</strong>. Logging out will clear active credentials on this device.
              </p>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECORD PAYMENT DEPOSIT */}
      {/* ------------------------------------------------------------- */}
      {isRecordPaymentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsRecordPaymentModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 max-h-[92vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsRecordPaymentModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-[#FF4B00]" />
                <span className="text-[10px] font-black uppercase text-[#FF4B00] tracking-widest">Payment & Receipt Ledger</span>
              </div>
              <h3 className="text-lg font-black text-white">Record Payment / Deposit</h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Records your offline bank transfer or cash deposit and instantly generates an official branded PDF receipt.
              </p>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Select Holiday Booking / Tour Reference *
                </label>
                <select
                  required
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                >
                  <option value="">-- Choose a tour reservation --</option>
                  {userInquiries.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {formatBookingNumber(inq.id)} - {inq.packageTitle} (Total: ₹{inq.estimatedTotal?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Payment Amount (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-black text-stone-500">₹</span>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="20000"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs font-black rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Payment Mode / Channel
                </label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                >
                  <option value="Google Pay / PhonePe UPI">Google Pay / PhonePe UPI</option>
                  <option value="IMPS / NEFT NetBanking">IMPS / NEFT NetBanking</option>
                  <option value="Direct Srinagar Front Desk Cash">Direct Srinagar Front Desk Cash</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Bank Cheque / DD">Bank Cheque / DD</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Transaction UTR / Reference No. / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 489201938102 / Bank IMPS transfer"
                  value={paymentNotesInput}
                  onChange={(e) => setPaymentNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Attach Screenshot / Deposit Slip (Mandatory) *</span>
                  {uploadedFileName && (
                    <span className="text-[10px] text-emerald-600 font-bold lowercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Attached & Verified
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={handleProofFileUpload}
                  className="w-full text-xs font-medium text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-stone-100 file:text-stone-800 hover:file:bg-stone-200 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="py-2.5 px-5 rounded-xl bg-[#FF4B00] hover:bg-[#E03E00] text-white text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isRecordingPayment ? 'Generating Receipt...' : 'Record & Generate Official Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD CO-TRAVELER */}
      {/* ------------------------------------------------------------- */}
      {isCoTravelerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsCoTravelerModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10">
            <div className="bg-stone-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsCoTravelerModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black text-white">Add Co-Traveler</h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Save family or friend details for fast permit issuance and reservations.
              </p>
            </div>

            <form onSubmit={handleAddCoTraveler} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={coTravelerForm.fullName}
                  onChange={(e) => setCoTravelerForm({ ...coTravelerForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Relationship
                  </label>
                  <select
                    value={coTravelerForm.relationship}
                    onChange={(e) => setCoTravelerForm({ ...coTravelerForm, relationship: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={coTravelerForm.gender}
                    onChange={(e) => setCoTravelerForm({ ...coTravelerForm, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={coTravelerForm.age || ''}
                    onChange={(e) => setCoTravelerForm({ ...coTravelerForm, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                    ID / Aadhaar No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-1234"
                    value={coTravelerForm.idNumber || ''}
                    onChange={(e) => setCoTravelerForm({ ...coTravelerForm, idNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/40"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCoTravelerModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black transition cursor-pointer"
                >
                  Save Co-Traveler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PROOF IMAGE PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setPreviewReceiptUrl(null)} />
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl z-10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-stone-900 uppercase">Payment Attachment Proof</h4>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-stone-700" />
              </button>
            </div>
            <img
              src={previewReceiptUrl}
              alt="Payment proof"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-stone-200"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LOGOUT CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-stone-900">Sign Out of Traveler Account?</h3>
              <p className="text-xs text-stone-500">
                You will need to sign in again to access your live itineraries, vouchers, and payment receipts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 text-stone-700 text-xs font-black hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logoutTraveler();
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { TourPackage, BookingInquiry } from '../../types/tour';
import { BlogPost } from '../../types/cms';
import { PackageEditor } from './PackageEditor';
import { InquiriesManager } from './InquiriesManager';
import { SettingsManager } from './SettingsManager';
import { FaqsManager } from './FaqsManager';
import { StaffManager } from './StaffManager';
import { VendorsManager } from './VendorsManager';
import { VendorPaymentsManager } from './VendorPaymentsManager';
import { InvoicesManager } from './InvoicesManager';
import { StaffRoleSwitcher } from './StaffRoleSwitcher';
import { DestinationsManager } from './DestinationsManager';
import { TemplesManager } from './TemplesManager';
import { CustomPagesManager } from './CustomPagesManager';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import { PushNotificationsManager } from './PushNotificationsManager';
import { UsersManager } from './UsersManager';
import { GroupToursManager } from './GroupToursManager';
import { GuideManager } from './GuideManager';
import { CategoriesManager } from "./CategoriesManager";
import { TagsManager } from "./TagsManager";
import { SEOManager } from "./SEOManager";
import { GuideEditor } from './GuideEditor';
import { GuideArticle } from '../../types/guide';
import { PDFBrochureModal } from '../traveler/PDFBrochureModal';
import { TourContentStudio } from './TourContentStudio';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  LayoutDashboard,
  BookOpen,
  PackagePlus,
  Compass,
  MessageSquare,
  Settings,
  Tag,
  Folder,
  Globe,
  Search,
  Plus,
  ImagePlus,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  MapPin,
  Building,
  Landmark,
  Layers,
  Filter,
  FileText,
  Download,
  CreditCard,
  Receipt,
  Car,
  Shield,
  ShieldAlert,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  KeyRound,
  ChevronRight,
  Newspaper,
  Cloud,
  FileEdit,
  Bell,
  Bus,
  HelpCircle,
  LogOut,
  Menu,
} from 'lucide-react';

export const CMSDashboard: React.FC = () => {
  const {
    packages,
    inquiries,
    hotels,
    vendors,
    vendorPayments,
    invoices,
    staff,
    currentStaffUser,
    agencySettings,
    pushNotifications,
    registeredUsers,
    guides,
    guideCategories,
    customPages,
    mediaAssets,
    temples,
    addGuide,
    updateGuide,
    deletePackage,
    duplicatePackage,
    togglePublishStatus,
    toggleFeatured,
    setSelectedPackageId,
    setActiveView,
  } = useTours();

    const [activeCmsTab, setActiveCmsTab] = useState<
    | 'dashboard'
    | 'packages'
    | 'group-tours'
    | 'guides'
    | 'categories'
    | 'tags'
    | 'seo'
    | 'editor'
    | 'destinations'
    | 'temples'
    | 'pages'
    | 'media'
    | 'push-notifications'
    | 'inquiries'
    | 'users'
    | 'invoices'
    | 'payments'
    | 'vendors'
    | 'staff'
    | 'settings'
    | 'faqs'
    | 'bottom-menus'
    | 'hotels'
    | 'post-editor'
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const qTab = urlParams.get('tab');
        if (qTab) return qTab as any;
        const saved = localStorage.getItem('hh_admin_active_tab');
        if (saved) return saved as any;
      } catch {}
    }
    return 'dashboard';
  });

  // Keep URL tab param & local storage in sync across browser refreshes
  useEffect(() => {
    try {
      localStorage.setItem('hh_admin_active_tab', activeCmsTab);
      if (typeof window !== 'undefined' && window.history.replaceState && window.location.pathname.startsWith('/admin-rudra-0712')) {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeCmsTab);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, [activeCmsTab]);

  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideArticle | null>(null);
  const [guidesSubView, setGuidesSubView] = useState<'list' | 'editor'>('list');
  const [pdfModalPkg, setPdfModalPkg] = useState<TourPackage | null>(null);
  const [contentStudioPackageId, setContentStudioPackageId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [isTabLoading, setIsTabLoading] = useState(false);

  useEffect(() => {
    setIsTabLoading(true);
    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [activeCmsTab]);

  // RBAC Permission Checks
  const isSuperAdmin = currentStaffUser.role === 'super_admin';
  const perms = currentStaffUser.permissions;

  const canAccess = (tab: typeof activeCmsTab) => {
    if (isSuperAdmin) return true;
    switch (tab) {
      case 'dashboard':
        return true;
      case 'guides':
      case 'categories':
      case 'tags':
      case 'seo':
      case 'destinations':
      case 'temples':
      case 'pages':
      case 'media':
      case 'users':
      case 'faqs':
        return true;
      case 'inquiries':
        return perms.canManageInquiries;
      case 'invoices':
        return perms.canManageInvoices;
      case 'payments':
        return perms.canManageVendorPayments;
      case 'vendors':
        return perms.canManageVendors;
      case 'hotels':
        return perms.canManageHotels;
      case 'packages':
      case 'group-tours':
      case 'editor':
        return perms.canManagePackages;
      case 'staff':
        return perms.canManageStaff;
      case 'settings':
      case 'bottom-menus':
        return perms.canManageSettings;
      default:
        return false;
    }
  };

  // Financial Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalVendorPayouts = vendorPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPendingVendor = vendorPayments.reduce((sum, p) => sum + p.balanceAmount, 0);
  const estimatedGrossProfit = Math.max(0, totalCollected - totalVendorPayouts);

  const publishedCount = packages.filter((p) => p.status === 'published').length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length;

  const filteredPackages = packages.filter((pkg) => {
    if (statusFilter !== 'All' && pkg.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && pkg.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        pkg.title.toLowerCase().includes(q) ||
        pkg.destination.toLowerCase().includes(q) ||
        pkg.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartCreate = () => {
    setEditingPackage(null);
    setActiveCmsTab('editor');
  };

  const handleStartEdit = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setActiveCmsTab('editor');
  };

  const handlePreviewLive = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('traveler');
  };

  const handleConvertInquiryToInvoice = (inquiry: BookingInquiry) => {
    setActiveCmsTab('invoices');
  };

  // If on editor tab, render the PackageEditor
  if (activeCmsTab === 'editor') {
    return (
      <PackageEditor
        initialPackage={editingPackage}
        onSaveComplete={() => {
          setActiveCmsTab('packages');
          setEditingPackage(null);
        }}
        onCancel={() => {
          setActiveCmsTab('packages');
          setEditingPackage(null);
        }}
      />
    );
  }


    const tabsConfig = [
    { id: 'dashboard', label: 'Operations Hub', icon: LayoutDashboard, count: null, show: canAccess('dashboard') },
    
    // Core WordPress-style Content Management Tabs
    { id: 'guides', label: 'All Posts', icon: BookOpen, count: guides.length, show: canAccess('guides') },
    { id: 'categories', label: 'Category', icon: Folder, count: guideCategories.length, show: canAccess('guides') },
    { id: 'tags', label: 'Tags', icon: Tag, count: null, show: canAccess('tags') },
    { id: 'media', label: 'Image Library', icon: ImagePlus, count: mediaAssets.length, show: canAccess('media') },
    { id: 'pages', label: 'Pages', icon: FileEdit, count: customPages.length, show: canAccess('pages') },
    { id: 'seo', label: 'SEO Meta', icon: Globe, count: null, show: canAccess('seo') },

    { id: 'packages', label: 'Tour Packages', icon: Compass, count: packages.length, show: canAccess('packages') },
    {
      id: 'group-tours',
      label: 'Group Tours & Batches',
      icon: Bus,
      count: packages.filter((p) => p.isGroupTour || p.tourType === 'Group Tour').length,
      show: canAccess('group-tours'),
    },
    { id: 'destinations', label: 'Destinations Hub', icon: MapPin, count: null, show: canAccess('destinations') },
    { id: 'temples', label: 'Temples & Shrines', icon: Landmark, count: temples.length, show: canAccess('temples') },
    { id: 'push-notifications', label: 'Push Broadcasts', icon: Bell, count: pushNotifications.length, show: true },
    { id: 'inquiries', label: 'Inquiries & Leads', icon: MessageSquare, count: inquiries.length, badgeNew: newInquiriesCount > 0, show: canAccess('inquiries') },
    { id: 'users', label: 'Travelers & Signups', icon: Users, count: registeredUsers?.length || 0, show: true },
    { id: 'invoices', label: 'Client Invoices', icon: Receipt, count: invoices.length, show: canAccess('invoices') },
    { id: 'payments', label: 'Vendor Payouts', icon: CreditCard, count: vendorPayments.length, show: canAccess('payments') },
    { id: 'vendors', label: 'Vendors & Fleets', icon: Car, count: vendors.length, show: canAccess('vendors') },
    { id: 'staff', label: 'Staff & RBAC', icon: Shield, count: staff.length, show: canAccess('staff') },
    { id: 'bottom-menus', label: 'Bottom Menus & Footer', icon: Menu, count: agencySettings.footerMenus?.length || 4, show: canAccess('settings') },
    { id: 'faqs', label: 'FAQ Management', icon: HelpCircle, count: agencySettings.faqs?.length || 10, show: canAccess('faqs') },
    { id: 'settings', label: 'Agency Settings', icon: Settings, count: null, show: canAccess('settings') },
  ];

  return (
    <div className="bg-stone-50 min-h-screen pb-20 text-stone-900 font-sans" id="cms-main-container">
      {/* 1. Clean Top Header Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Title & Badge */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FF4B00] text-white flex items-center justify-center font-sans text-lg font-black shadow-xs shrink-0">
                HH
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-lg font-black text-[#1A1A1A] truncate font-sans tracking-tight">
                    {agencySettings.agencyName} ERP
                  </h1>
                  <span className="hidden lg:inline-flex bg-[#FFF0EB] border border-[#FF4B00]/30 text-[#FF4B00] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Operations
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#1A1A1A]/60 truncate font-medium">
                  Travel & Hospitality Management • RBAC Staff Access
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <StaffRoleSwitcher />

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.pushState) {
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                  setActiveView('traveler');
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1A1A1A] text-[11px] sm:text-xs font-bold border border-stone-200 transition cursor-pointer"
                title="Switch to Storefront"
              >
                <Globe className="w-3.5 h-3.5 text-[#FF4B00]" />
                <span className="hidden md:inline">Storefront</span>
                <span className="md:hidden">Web</span>
              </button>

              {canAccess('packages') && (
                <button
                  type="button"
                  id="cms-create-package-btn"
                  onClick={handleStartCreate}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">New Tour Package</span>
                  <span className="md:hidden">New</span>
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    localStorage.removeItem('bs_cms_session_token');
                    localStorage.removeItem('bs_cms_pin_token');
                    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                    window.location.href = '/admin-rudra-0712';
                  } catch (e) {
                    console.error('Logout failed', e);
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[11px] sm:text-xs font-bold border border-red-200 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main CMS Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6 pb-36">
        {/* Sacred Dashboard Mantra Card with Majestic Spiritual Styling */}
        <div className="bg-gradient-to-r from-stone-950 via-[#18181B] to-stone-950 border border-amber-500/35 hover:border-amber-500/55 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-6 shadow-xl relative overflow-hidden transition-all duration-300">
          {/* Subtle Ambient Glow and Geometric Shimmer */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-24 bg-[#FF4B00]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-center text-center">
            {/* Core Sacred Mantra Typography */}
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-[0.16em] sm:tracking-[0.26em] font-serif py-1 drop-shadow-md select-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#FF5500] to-amber-300">
                {agencySettings?.sacredMantra || 'साम्ब सदाशिव'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar: Grid of Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
          {tabsConfig
            .filter((t) => t.show)
            .map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeCmsTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCmsTab(tab.id as any)}
                  className={`relative p-3 sm:p-4 rounded-2xl text-left font-bold transition flex flex-col justify-between h-full gap-2 cursor-pointer select-none border ${
                    isActive
                      ? 'bg-[#FF4B00] text-white border-[#FF4B00] shadow-md shadow-[#FF4B00]/20'
                      : 'bg-white text-[#1A1A1A] border-stone-200 hover:bg-stone-50 hover:border-[#FF4B00]/40 hover:shadow-sm'
                  }`}
                  id={`tab-${tab.id}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    {(tab.count !== null || tab.badgeNew) && (
                      <div className="flex items-center gap-1.5">
                        {tab.badgeNew && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                        {tab.count !== null && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                              isActive
                                ? 'bg-white text-[#FC3200]'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-black mt-1">{tab.label}</span>
                </button>
              );
            })}
        </div>

        {/* ACCESS RESTRICTION NOTICE IF ATTEMPTING UNAUTHORIZED MODULE */}
        {!canAccess(activeCmsTab) && (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-3 shadow-sm mb-6">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">Module Access Restricted</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto font-medium">
              Your staff role (<strong>{currentStaffUser.name} - {currentStaffUser.role}</strong>) does not have
              authorization to access this operational module. Please switch roles or contact your Super Admin.
            </p>
            <button
              type="button"
              onClick={() => setActiveCmsTab('dashboard')}
              className="px-4 py-2 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer mt-2"
            >
              Return to Operations Hub
            </button>
          </div>
        )}

        {/* LOADING SKELETON / SUBTLE SPINNER STATE DURING TRANSITIONS */}
        {isTabLoading && canAccess(activeCmsTab) && (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-6 my-6 shadow-xs animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4B00]/10 text-[#FF4B00] flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <div className="h-4 bg-stone-200 rounded-lg w-3/4 mx-auto"></div>
              <div className="h-3 bg-stone-100 rounded-lg w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">
              <div className="h-32 bg-stone-100 rounded-2xl"></div>
              <div className="h-32 bg-stone-100 rounded-2xl"></div>
              <div className="h-32 bg-stone-100 rounded-2xl"></div>
            </div>
          </div>
        )}

        {/* TAB 1: OPERATIONS HUB (DASHBOARD) */}
        {activeCmsTab === 'dashboard' && canAccess('dashboard') && !isTabLoading && (
          <div className="space-y-4 sm:space-y-6" id="cms-dashboard-tab">
            {/* Financial Overview & KPIs: Refined Bento Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-l-4 border-l-blue-500 border-y border-r border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Total Invoiced
                  </span>
                  <Receipt className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-stone-900 truncate">
                  ₹{totalInvoiced.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium mt-1">
                  {invoices.length} Client Invoices
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Total Collected
                  </span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-emerald-700 truncate">
                  ₹{totalCollected.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Realized Inflow</span>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Vendor Payouts
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-amber-800 truncate">
                  ₹{totalVendorPayouts.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium mt-1">
                  Pending: ₹{totalPendingVendor.toLocaleString()}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border-l-4 border-l-purple-500 border-y border-r border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Gross Margin
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-purple-700 truncate">
                  ₹{estimatedGrossProfit.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-purple-700 font-bold mt-1">
                  Operating Margin
                </div>
              </div>
            </div>

            {/* Operations Quick Actions: List on Mobile, Grid on Desktop */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-3 sm:mb-4 pl-1">
                Operations Quick Shortcuts
              </h3>
              <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('traveler');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-[#1D1C1C] hover:bg-black border border-stone-800 hover:shadow-md text-left transition-all cursor-pointer group"
                >
                  <div className="p-2 sm:p-0 bg-stone-800 sm:bg-transparent rounded-lg border sm:border-none border-stone-700 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">Storefront Preview</p>
                    <p className="text-[11px] text-stone-400 font-medium line-clamp-1">View public traveler site</p>
                  </div>
                </button>
                {canAccess("packages") && (
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-blue-500 hover:shadow-md text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border sm:border-none border-stone-200 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                      <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 group-hover:text-blue-600 transition-colors">Add Tour</p>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">Create new package</p>
                    </div>
                  </button>
                )}
                {canAccess("post-editor") && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlogPost(null);
                      setActiveCmsTab("post-editor");
                    }}
                    className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-amber-500 hover:shadow-md text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border sm:border-none border-stone-200 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                      <FileEdit className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 group-hover:text-amber-600 transition-colors">Post Editor</p>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">Guides & R2 media</p>
                    </div>
                  </button>
                )}
                {canAccess("invoices") && (
                  <button
                    type="button"
                    onClick={() => setActiveCmsTab("invoices")}
                    className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-[#FC3200]/30 hover:shadow-md text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border sm:border-none border-stone-200 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                      <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-[#FC3200] group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 group-hover:text-[#FC3200] transition-colors">Create Tax Invoice</p>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">Bill guest & track advance</p>
                    </div>
                  </button>
                )}
                {canAccess("payments") && (
                  <button
                    type="button"
                    onClick={() => setActiveCmsTab("payments")}
                    className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-emerald-300 hover:shadow-md text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border sm:border-none border-stone-200 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 group-hover:text-emerald-700 transition-colors">Vendor Voucher</p>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">Book cab, hotel, heli</p>
                    </div>
                  </button>
                )}
                {canAccess("inquiries") && (
                  <button
                    type="button"
                    onClick={() => setActiveCmsTab("inquiries")}
                    className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-purple-300 hover:shadow-md text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border sm:border-none border-stone-200 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 group-hover:text-purple-700 transition-colors">Tour Leads & Quotes</p>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">Manage family inquiries</p>
                    </div>
                  </button>
                )}
                {canAccess("vendors") && (
                  <button
                    type="button"
                    onClick={() => setActiveCmsTab('vendors')}
                    className="flex items-center sm:flex-col sm:items-start p-3 sm:p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-blue-300 hover:shadow-md text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border sm:border-none border-stone-200 mr-3 sm:mr-0 sm:mb-3 shrink-0">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 group-hover:text-blue-700 transition-colors">Mountain Fleets</p>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">Hill certified drivers</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Split Data Cards: Recent Inquiries & Service Vouchers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Traveler Inquiries */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#FC3200]" />
                    Recent Traveler Inquiries & Quotes
                  </h3>
                  {canAccess('inquiries') && (
                    <button
                      type="button"
                      onClick={() => setActiveCmsTab('inquiries')}
                      className="text-xs font-bold text-[#FC3200] hover:text-[#e02c00] cursor-pointer"
                    >
                      View All ({inquiries.length})
                    </button>
                  )}
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {inquiries.slice(0, 4).map((inq) => (
                    <div key={inq.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-stone-900">{inq.travelerName}</p>
                        <p className="text-stone-500 text-[11px]">{inq.packageTitle} • {inq.travelDate}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#FC3200] border border-amber-200">
                        {inq.status}
                      </span>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <p className="py-4 text-center text-stone-400 font-medium">No inquiries received yet.</p>
                  )}
                </div>
              </div>

              {/* Pending Vendor Payout Vouchers */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    Operational Ground Vouchers
                  </h3>
                  {canAccess('payments') && (
                    <button
                      type="button"
                      onClick={() => setActiveCmsTab('payments')}
                      className="text-xs font-bold text-[#FC3200] hover:text-[#e02c00] cursor-pointer"
                    >
                      View All ({vendorPayments.length})
                    </button>
                  )}
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {vendorPayments.slice(0, 4).map((vp) => (
                    <div key={vp.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-stone-900">{vp.vendorName}</p>
                        <p className="text-stone-500 text-[11px]">
                          {vp.voucherNumber} • {vp.serviceDescription}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-stone-900">₹{vp.totalAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-rose-700 font-bold">Bal: ₹{vp.balanceAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {vendorPayments.length === 0 && (
                    <p className="py-4 text-center text-stone-400 font-medium">No vendor vouchers recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

                {/* WORDPRESS STYLE: RANK MATH SEO */}
        {activeCmsTab === 'seo' && canAccess('seo') && !isTabLoading && <SEOManager />}

        {/* WORDPRESS STYLE: CATEGORIES */}
        {activeCmsTab === 'categories' && canAccess('guides') && !isTabLoading && <CategoriesManager />}

        {/* WORDPRESS STYLE: TAGS */}
        {activeCmsTab === 'tags' && canAccess('tags') && !isTabLoading && <TagsManager />}

        {/* TAB 2.5: PILGRIMAGE & TRAVEL GUIDES CMS (WITH AI SEO GENERATOR) */}
        {activeCmsTab === 'guides' && canAccess('guides') && !isTabLoading && (
          guidesSubView === 'editor' ? (
            <GuideEditor
              initialGuide={editingGuide}
              onSave={(savedGuide) => {
                if (editingGuide) {
                  updateGuide(savedGuide);
                } else {
                  addGuide(savedGuide);
                }
                setGuidesSubView('list');
                setEditingGuide(null);
              }}
              onBack={() => {
                setGuidesSubView('list');
                setEditingGuide(null);
              }}
            />
          ) : (
            <GuideManager
              onCreateGuide={() => {
                setEditingGuide(null);
                setGuidesSubView('editor');
              }}
              onEditGuide={(g) => {
                setEditingGuide(g);
                setGuidesSubView('editor');
              }}
            />
          )
        )}

        {/* TAB 3: DESTINATIONS & TRAVEL GUIDES CMS */}
        {activeCmsTab === 'destinations' && canAccess('destinations') && !isTabLoading && <DestinationsManager />}

        {/* TAB 3.5: SACRED TEMPLES & SHRINES CMS */}
        {activeCmsTab === 'temples' && canAccess('temples') && !isTabLoading && (
          <ErrorBoundary fallbackTitle="Temples & Shrines Manager" fallbackMessage="There was an issue rendering the Temples Manager. Please reload to refresh the database.">
            <TemplesManager />
          </ErrorBoundary>
        )}

        {/* TAB 4: CUSTOM PAGES CMS */}
        {activeCmsTab === 'pages' && canAccess('pages') && !isTabLoading && <CustomPagesManager />}

        {/* TAB 5: CLOUDFLARE R2 & D1 MEDIA STUDIO */}
        {activeCmsTab === 'media' && canAccess('media') && !isTabLoading && <MediaR2StorageManager />}

        {/* TAB 5.5: PUSH NOTIFICATIONS BROADCAST CENTER */}
        {activeCmsTab === 'push-notifications' && !isTabLoading && <PushNotificationsManager />}

        {/* TAB 6: INQUIRIES & LEADS */}
        {activeCmsTab === 'inquiries' && canAccess('inquiries') && !isTabLoading && (
          <InquiriesManager onConvertToInvoice={handleConvertInquiryToInvoice} />
        )}

        {/* TAB 6.5: REGISTERED TRAVELERS & SIGNUPS DIRECTORY */}
        {activeCmsTab === 'users' && !isTabLoading && <UsersManager />}

        {/* TAB 3: CLIENT INVOICES */}
        {activeCmsTab === 'invoices' && canAccess('invoices') && !isTabLoading && <InvoicesManager />}

        {/* TAB 4: VENDOR PAYOUTS & VOUCHERS */}
        {activeCmsTab === 'payments' && canAccess('payments') && !isTabLoading && <VendorPaymentsManager />}

        {/* TAB 5: VENDORS DIRECTORY */}
        {activeCmsTab === 'vendors' && canAccess('vendors') && !isTabLoading && (
          <VendorsManager
            onOpenVendorPayment={(vId) => {
              setActiveCmsTab('payments');
            }}
          />
        )}

        {/* TAB 6: HOTELS */}

        {/* TAB 7: STAFF & RBAC */}
        {activeCmsTab === 'staff' && canAccess('staff') && !isTabLoading && <StaffManager />}

        {/* TAB 8: SETTINGS & BOTTOM MENUS */}
        {activeCmsTab === 'settings' && canAccess('settings') && !isTabLoading && <SettingsManager />}
        {activeCmsTab === 'bottom-menus' && canAccess('bottom-menus') && !isTabLoading && <SettingsManager initialTab="footer" initialSubTab="mobile-nav" />}

        {/* TAB 8.5: FAQ MANAGEMENT */}
        {activeCmsTab === 'faqs' && canAccess('faqs') && !isTabLoading && <FaqsManager />}

        {/* TAB: GROUP TOURS & FIXED DEPARTURES ERP */}
        {activeCmsTab === 'group-tours' && canAccess('group-tours') && !isTabLoading && (
          <GroupToursManager
            onEditPackage={handleStartEdit}
            onCreateGroupTour={() => {
              setEditingPackage({
                id: '',
                slug: '',
                title: 'New Sacred Devotee Group Tour',
                tagline: 'Guaranteed departure with dedicated tour coordinator and AC pushback coach',
                destination: 'Jammu (Katra & Vaishno Devi)',
                destinationTag: 'jammu',
                country: 'India',
                category: 'Pilgrimage',
                badge: 'Best Seller',
                durationDays: 4,
                durationNights: 3,
                price: 12500,
                discountedPrice: 8999,
                isGroupTour: true,
                tourType: 'Group Tour',
                groupTourDetails: {
                  isGroupTour: true,
                  groupTheme: 'Sacred Devotee Sangha & Fixed Departure',
                  coachType: '2x2 AC Pushback Luxury Coach',
                  batchSchedule: 'Weekly Departures (Every Friday & 15th)',
                  nextDeparture: '15 Oct 2025',
                  totalSeats: 24,
                  bookedSeats: 16,
                  minGroupSize: 10,
                  maxGroupSize: 24,
                  perPersonSavings: 3500,
                  tourLeader: 'Dedicated Tour Guide & On-Ground Coordinator Included',
                  boardingPoints: [
                    'Delhi (Kashmere Gate / Majnu Ka Tila)',
                    'Chandigarh (Sector 43 Bus Stand)',
                    'Jammu Tawi Railway Station',
                  ],
                  batches: [
                    {
                      id: `b-${Date.now()}-1`,
                      batchName: 'Diwali Sangha Batch',
                      startDate: '15 Oct 2025',
                      totalSeats: 24,
                      bookedSeats: 19,
                      status: 'Filling Fast',
                    },
                    {
                      id: `b-${Date.now()}-2`,
                      batchName: 'Kartik Purnima Batch',
                      startDate: '28 Oct 2025',
                      totalSeats: 24,
                      bookedSeats: 12,
                      status: 'Guaranteed Departure',
                    },
                  ],
                },
                coverImage:
                  'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
                gallery: [],
                overview:
                  'Join fellow devotees on this spiritually uplifting fixed departure yatra with AC coach transfers and verified stays.',
                startLocation: 'Delhi / Jammu',
                endLocation: 'Jammu / Delhi',
                groupSizeLimit: 'Max 24 Yatris (Group Coach)',
                bestTimeToVisit: 'Round the Year',
                itinerary: [],
                inclusions: [
                  'AC Pushback Coach transfers throughout the yatra',
                  'Verified clean hotel accommodation on twin/triple sharing',
                  'Pure vegetarian sattvik meals as per itinerary',
                  'RFID yatra card assistance & Banganga drop',
                  'Dedicated devotee group leader & tour coordinator',
                ],
                exclusions: [
                  'Pony / Palki / Helicopter tickets (can be arranged on request)',
                  'Personal expenses & monument entry fees',
                ],
                includedIcons: [],
                hotels: [],
                policies: {
                  cancellationPolicy: ['15 days prior: 90% refund.'],
                  termsAndConditions: ['Valid photo ID required for yatra registration.'],
                  paymentPolicy: ['25% advance to lock seat.'],
                },
                importantNotes: ['Senior citizen assistance provided.'],
                status: 'published',
                featured: true,
                rating: 4.9,
                reviewCount: 38,
                createdAt: new Date().toISOString(),
              } as TourPackage);
              setActiveCmsTab('editor');
            }}
          />
        )}

        {/* TAB 9: PACKAGES CATALOG */}
        {activeCmsTab === 'packages' && canAccess('packages') && !isTabLoading && (
          <div className="space-y-6">
            {/* Packages Management Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div>
                <h2 className="text-base font-black text-stone-900">Tour Packages Catalog</h2>
                <p className="text-xs text-stone-500">Manage itineraries, pricing, photo galleries & traveler reviews</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setContentStudioPackageId(packages[0]?.id || '')}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Manage Tour Photos & Verified Reviews"
                >
                  <ImagePlus className="w-4 h-4 text-amber-500" />
                  <span>Photos & Reviews Studio</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-3.5 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E02c00] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Tour Package</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tour packages by destination, title, duration..."
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-hidden focus:border-[#FC3200] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2.5 text-stone-800 focus:outline-hidden truncate"
                >
                  <option value="All">All Categories</option>
                  <option value="Family">Family</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Pilgrimage">Pilgrimage</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2.5 text-stone-800 focus:outline-hidden"
                >
                  <option value="All">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>

                <div className="col-span-2 sm:col-span-1 flex items-center justify-center bg-stone-100 rounded-xl p-1 border border-stone-200 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
                      viewMode === 'table' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
                      viewMode === 'cards' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                    }`}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>

            {/* Packages List: Table Mode */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="sm:hidden px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>Showing {filteredPackages.length} Packages</span>
                  <span className="text-[#FC3200] font-bold">Scroll right for actions →</span>
                </div>
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-left text-xs text-stone-700 min-w-[760px]">
                    <thead className="bg-stone-50 text-stone-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="py-3.5 px-4 min-w-[220px]">Tour Package</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Duration</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Pricing</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Hotels</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-amber-50/30 transition">
                          <td className="py-3.5 px-4 min-w-[220px] max-w-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={pkg.coverImage}
                                alt={pkg.title}
                                className="w-14 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                              />
                              <div className="min-w-0">
                                <div
                                  className="font-black text-stone-900 truncate hover:text-[#FC3200] cursor-pointer"
                                  onClick={() => handleStartEdit(pkg)}
                                  title={pkg.title}
                                >
                                  {pkg.title}
                                </div>
                                <div className="text-[11px] text-stone-500 flex items-center gap-1 truncate font-medium">
                                  <MapPin className="w-3 h-3 text-[#FC3200] shrink-0" />
                                  <span className="truncate">{pkg.destination}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-black text-stone-900">
                              {pkg.durationDays}D / {pkg.durationNights}N
                            </div>
                            <div className="text-[11px] text-stone-500 font-medium">
                              {pkg.itinerary.length} Days Itinerary
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-bold text-[11px] border border-stone-200">
                              {pkg.category}
                            </span>
                            {pkg.badge && (
                              <div className="text-[10px] font-black text-[#FC3200] mt-1">
                                {pkg.badge}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-[#FC3200] border border-amber-200">
                              Price on Request
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-stone-800">
                              <Building className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-bold">{pkg.hotels.length} Stays</span>
                            </div>
                            <div className="text-[10px] text-stone-500 font-medium">
                              {pkg.inclusions.length} Inclusions
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => togglePublishStatus(pkg.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                pkg.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}
                            >
                              {pkg.status === 'published' ? '● Published' : '○ Draft'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setContentStudioPackageId(pkg.id)}
                                className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Manage Photos Gallery & Reviews"
                              >
                                <ImagePlus className="w-4 h-4 text-amber-500" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setPdfModalPkg(pkg)}
                                className="p-1.5 text-[#FC3200] hover:text-[#e02c00] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Download PDF Brochure"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePreviewLive(pkg.id)}
                                className="p-1.5 text-stone-500 hover:text-[#FC3200] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="Preview on Guest Portal"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartEdit(pkg)}
                                className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit Itinerary"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => duplicatePackage(pkg.id)}
                                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="Duplicate Package"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete package "${pkg.title}"?`)) {
                                    deletePackage(pkg.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Package"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] bg-stone-100">
                      <img src={pkg.coverImage} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pkg.status === 'published'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-800 text-white'
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-sm text-stone-900 line-clamp-1 mb-1 font-serif">
                          {pkg.title}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mb-3 font-medium">
                          {pkg.destination} • {pkg.durationDays}D/{pkg.durationNights}N •{' '}
                          {pkg.itinerary.length} Days Itinerary
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="font-black text-xs text-[#FC3200] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          Price on Request
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setContentStudioPackageId(pkg.id)}
                            className="p-1.5 text-stone-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                            title="Manage Photos & Reviews"
                          >
                            <ImagePlus className="w-4 h-4 text-amber-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPdfModalPkg(pkg)}
                            className="p-1.5 text-[#FC3200] hover:text-[#e02c00] rounded-lg hover:bg-amber-50 transition cursor-pointer"
                            title="PDF Brochure"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePreviewLive(pkg.id)}
                            className="p-1.5 text-stone-600 hover:text-[#FC3200] rounded-lg hover:bg-stone-100 transition cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(pkg)}
                            className="p-1.5 text-stone-600 hover:text-blue-600 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicatePackage(pkg.id)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePackage(pkg.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Brochure Preview / Print Modal */}
      {pdfModalPkg && (
        <PDFBrochureModal
          pkg={pdfModalPkg}
          isOpen={true}
          onClose={() => setPdfModalPkg(null)}
        />
      )}

      {/* Tour Photos & Reviews Studio Modal */}
      {contentStudioPackageId !== null && (
        <TourContentStudio
          initialPackageId={contentStudioPackageId || undefined}
          onClose={() => setContentStudioPackageId(null)}
        />
      )}
    </div>
  );
};

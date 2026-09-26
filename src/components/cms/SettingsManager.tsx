import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { AgencySettings, FAQItem, FooterMenuSection, FooterMenuItem, MobileBottomNavItem } from '../../types/tour';
import { DEFAULT_BOTTOM_NAV_ITEMS } from '../../data/defaultPackages';
import {
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Menu,
  Plus,
  Trash,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Link,
  Smartphone,
  Compass,
  Luggage,
  MessageCircle,
  Star,
  Info,
  Globe,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Eye,
} from 'lucide-react';

export const SettingsManager: React.FC<{ initialTab?: 'branding' | 'faqs' | 'footer'; initialSubTab?: 'footer' | 'mobile-nav' }> = ({ initialTab = 'branding', initialSubTab = 'footer' }) => {
  const { agencySettings, updateAgencySettings, packages, resetToDefaults } = useTours();

  const [activeTab, setActiveTab] = useState<'branding' | 'faqs' | 'footer'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [form, setForm] = useState<AgencySettings>({
    ...agencySettings,
    faqs: agencySettings.faqs || [
      {
        id: 'faq-1',
        question: 'How does Holidays Hunt assist in planning customizable spiritual Yatras?',
        answer: 'Holidays Hunt is a premier digital platform and travel facilitator. We coordinate customized travel itineraries, connecting you with verified local transport coordinators and accommodation providers. Our expert team assists you in selecting custom routes, durations, and comfort-aligned options suitable for families and senior citizens.'
      },
      {
        id: 'faq-2',
        question: 'How does Holidays Hunt help ensure comfort for senior citizens on pilgrimages like Vaishno Devi or Char Dham?',
        answer: 'Holidays Hunt is dedicated to organizing stress-free, senior-friendly spiritual journeys. While hotels and helicopter services are managed by independent third-party operators, Holidays Hunt coordinators handpick recommended hotels with elevators and close proximity to the shrines. We also assist in coordinating priority assist requests, planning gentle travel paces, and arranging dedicated, comfortable ground vehicles with experienced chauffeurs to support our elderly guests.'
      },
      {
        id: 'faq-3',
        question: 'What is Holidays Hunt\'s role regarding meals and restaurant suggestions?',
        answer: 'Holidays Hunt does not operate restaurants, kitchens, or hotel dining services. However, we understand the importance of dietary preferences on a sacred journey. We provide curated recommendations for reputable local vegetarian restaurants and hotel kitchens along your yatra route that offer clean, high-quality vegetarian food.'
      },
      {
        id: 'faq-4',
        question: 'Can Holidays Hunt customize a spiritual tour itinerary for my family?',
        answer: 'Absolutely! Holidays Hunt is famous for custom-made, private spiritual itineraries. Whether you are planning a family trip to Kashi Vishwanath, Ayodhya Ram Mandir, or Himachal Devi Darshans, our expert team can adjust the travel duration, suggest select category stays, and coordinate private transport matching your family\'s speed and requirements.'
      },
      {
        id: 'faq-5',
        question: 'What is Holidays Hunt\'s payment schedule and booking policy?',
        answer: 'To secure your preferred hotels and dedicated vehicle bookings, Holidays Hunt requires a standard 30% advance deposit. The remaining 70% balance can be settled in easy installments up to 7 days before your departure. We accept UPI, bank transfer, Net Banking, and all major debit/credit cards with 100% transparent invoicing.'
      },
      {
        id: 'faq-6',
        question: 'What is the cancellation and refund policy for a Holidays Hunt coordinated yatra?',
        answer: 'Cancellations attract charges based on the departure timeline. Prior to 46 days from departure, the 30% advance booking deposit (or ₹30,000, whichever is lower) is non-refundable. Cancellations made between 31 to 45 days attract a 70% charge, and cancellations within 30 days or less are 100% non-refundable. Eligible refunds are processed within 21 working days.'
      },
      {
        id: 'faq-7',
        question: 'Are local tour guides and temple historians provided by Holidays Hunt?',
        answer: 'Yes, upon request, Holidays Hunt can connect you with certified, knowledgeable local guides and religious experts at various historical temples. They help explain the historical significance, temple legends, and rich cultural heritage of the sacred shrines.'
      },
      {
        id: 'faq-8',
        question: 'Does Holidays Hunt coordinate helicopter bookings for Yatras like Vaishno Devi or Kedarnath?',
        answer: 'Holidays Hunt assists travelers by providing guidance, booking schedule updates, and facilitation support for third-party helicopter tickets. Please note that helicopter tickets are subject to official government portal schedules, verification requirements, and availability.'
      },
      {
        id: 'faq-9',
        question: 'How does Holidays Hunt handle travel logistics in hilly and mountainous regions?',
        answer: 'We coordinate with licensed local drivers who are highly experienced with hilly terrains. For the safety of our guests, we strictly adhere to mountain safety guidelines, such as completing travel before dark, maintaining safe speed limits, and ensuring proper vehicle fitness.'
      },
      {
        id: 'faq-10',
        question: 'What sets Holidays Hunt apart from conventional tour operators?',
        answer: 'Holidays Hunt is a specialized platform focusing exclusively on custom-made devotional, family, and senior-friendly yatras. We provide personalized 24/7 travel desk support during your trip, complete billing transparency, and reliable local partners to make your pilgrimage seamless and spiritually enriching.'
      }
    ],
    footerMenus: agencySettings.footerMenus || [
      {
        id: 'fm-discover',
        title: 'DISCOVER US',
        items: [
          { id: 'fmi-about', label: 'About us', url: 'about' },
          { id: 'fmi-careers', label: 'Careers', url: 'careers' },
          { id: 'fmi-contact', label: 'Contact us', url: 'locate_us' },
          { id: 'fmi-faq', label: 'FAQ', url: 'faq' },
          { id: 'fmi-guide', label: 'Guide', url: 'guide' }
        ]
      },
      {
        id: 'fm-yatras',
        title: 'POPULAR DESTINATIONS',
        items: [
          { id: 'fmi-vd', label: 'Vaishno Devi & Katra', url: 'pilgrimage' },
          { id: 'fmi-hd', label: 'Himachal & Kashmir', url: 'family' },
          { id: 'fmi-fam', label: 'Family & Honeymoon Tours', url: 'family' }
        ]
      },
      {
        id: 'fm-tours',
        title: 'TOP TOURS',
        items: [
          { id: 'fmi-t-kashmir', label: 'Kashmir Paradise', url: 'kashmir' },
          { id: 'fmi-t-himachal', label: 'Himachal Mountains', url: 'himachal' },
          { id: 'fmi-t-vaishno', label: 'Mata Vaishno Devi', url: 'jammu' },
          { id: 'fmi-t-hd', label: 'Himachal Devi Darshan', url: 'himachal_devi' }
        ]
      },
      {
        id: 'fm-security',
        title: 'SECURITY & TRUST',
        items: [
          { id: 'fmi-terms', label: 'Terms & Conditions', url: 'terms' },
          { id: 'fmi-cancel', label: 'Cancellation Policy', url: 'cancellation' },
          { id: 'fmi-privacy', label: 'Privacy Policy', url: 'privacy' },
          { id: 'fmi-sec', label: '100% Verified Stays', url: 'security' }
        ]
      }
    ],
    bottomNavItems: agencySettings.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS
  });

  // Sync form state whenever agencySettings updates in context
  useEffect(() => {
    if (agencySettings) {
      setForm(prev => ({
        ...prev,
        ...agencySettings,
        footerMenus: agencySettings.footerMenus || prev.footerMenus,
        bottomNavItems: agencySettings.bottomNavItems || prev.bottomNavItems,
      }));
    }
  }, [agencySettings]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // Subtab for Bottom Menus Manager
  const [bottomMenuSubTab, setBottomMenuSubTab] = useState<'footer' | 'mobile-nav'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setBottomMenuSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // FAQ addition temp state
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Footer addition temp states
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Inline quick add for a specific footer column
  const [inlineAddSectionId, setInlineAddSectionId] = useState<string | null>(null);
  const [inlineLinkLabel, setInlineLinkLabel] = useState('');
  const [inlineLinkUrl, setInlineLinkUrl] = useState('');

  // Mobile bottom nav addition temp state
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavIcon, setNewNavIcon] = useState<'home' | 'tours' | 'destinations' | 'chat' | 'phone' | 'compass' | 'star' | 'info' | 'custom'>('home');
  const [newNavAction, setNewNavAction] = useState<'home' | 'tours' | 'destinations' | 'whatsapp' | 'call' | 'custom'>('home');
  const [newNavUrl, setNewNavUrl] = useState('');

  const handleSaveAll = () => {
    updateAgencySettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(packages, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `choudhary-vacations-packages-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem('hh_tour_packages_v1', JSON.stringify(parsed));
          window.location.reload();
        } else {
          setImportStatus('Invalid package JSON format');
        }
      } catch {
        setImportStatus('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  // FAQ CRUD Helpers
  const addFAQ = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
    };
    const updated = [...(form.faqs || []), newItem];
    setForm({ ...form, faqs: updated });
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const deleteFAQ = (id: string) => {
    const updated = (form.faqs || []).filter(item => item.id !== id);
    setForm({ ...form, faqs: updated });
  };

  const updateFAQField = (id: string, field: 'question' | 'answer', value: string) => {
    const updated = (form.faqs || []).map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setForm({ ...form, faqs: updated });
  };

  // Footer Menu CRUD Helpers with immediate sync
  const addFooterSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSection: FooterMenuSection = {
      id: `fm-${Date.now()}`,
      title: newSectionTitle.toUpperCase().trim(),
      items: []
    };
    const updated = [...(form.footerMenus || []), newSection];
    const updatedForm = { ...form, footerMenus: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setNewSectionTitle('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const editFooterSection = (sectionId: string) => {
    const section = (form.footerMenus || []).find(sec => sec.id === sectionId);
    if (!section) return;
    const nextTitle = window.prompt('Edit footer column title', section.title);
    if (nextTitle === null || !nextTitle.trim()) return;
    const updated = (form.footerMenus || []).map(sec => sec.id === sectionId ? { ...sec, title: nextTitle.trim().toUpperCase() } : sec);
    const updatedForm = { ...form, footerMenus: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
  };

  const deleteFooterSection = (sectionId: string) => {
    const updated = (form.footerMenus || []).filter(sec => sec.id !== sectionId);
    const updatedForm = { ...form, footerMenus: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const addFooterLink = (sectionId: string, label?: string, url?: string) => {
    const linkText = (label !== undefined ? label : newLinkLabel).trim();
    const linkHref = (url !== undefined ? url : newLinkUrl).trim();
    if (!linkText || !linkHref) return;

    const newLink: FooterMenuItem = {
      id: `fmi-${Date.now()}`,
      label: linkText,
      url: linkHref
    };
    const updated = (form.footerMenus || []).map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newLink] };
      }
      return sec;
    });
    const updatedForm = { ...form, footerMenus: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setSelectedSectionId('');
    setInlineAddSectionId(null);
    setInlineLinkLabel('');
    setInlineLinkUrl('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const editFooterLink = (sectionId: string, linkId: string) => {
    const section = (form.footerMenus || []).find(sec => sec.id === sectionId);
    const item = section?.items.find(link => link.id === linkId);
    if (!item) return;
    const nextLabel = window.prompt('Edit menu label', item.label);
    if (nextLabel === null || !nextLabel.trim()) return;
    const nextUrl = window.prompt('Edit target URL / page slug', item.url);
    if (nextUrl === null || !nextUrl.trim()) return;
    const updated = (form.footerMenus || []).map(sec => sec.id === sectionId ? { ...sec, items: sec.items.map(link => link.id === linkId ? { ...link, label: nextLabel.trim(), url: nextUrl.trim() } : link) } : sec);
    const updatedForm = { ...form, footerMenus: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
  };

  const deleteFooterLink = (sectionId: string, linkId: string) => {
    const updated = (form.footerMenus || []).map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.filter(item => item.id !== linkId) };
      }
      return sec;
    });
    const updatedForm = { ...form, footerMenus: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Mobile Bottom Navigation CRUD Helpers with immediate sync
  const addBottomNavItem = () => {
    if (!newNavLabel.trim()) return;
    const current = form.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS;
    const newItem: MobileBottomNavItem = {
      id: `nav-${Date.now()}`,
      label: newNavLabel.trim(),
      icon: newNavIcon,
      actionType: newNavAction,
      url: newNavUrl.trim() || undefined,
      enabled: true
    };
    const updated = [...current, newItem];
    const updatedForm = { ...form, bottomNavItems: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setNewNavLabel('');
    setNewNavUrl('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const editBottomNavItem = (id: string) => {
    const current = form.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS;
    const item = current.find(nav => nav.id === id);
    if (!item) return;
    const nextLabel = window.prompt('Edit bottom menu label', item.label);
    if (nextLabel === null || !nextLabel.trim()) return;
    const nextUrl = window.prompt('Edit target URL / page slug (leave blank to keep current)', item.url || '');
    if (nextUrl === null) return;
    const updated = current.map(nav => nav.id === id ? { ...nav, label: nextLabel.trim(), url: nextUrl.trim() || undefined } : nav);
    const updatedForm = { ...form, bottomNavItems: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
  };

  const deleteBottomNavItem = (id: string) => {
    const current = form.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS;
    const updated = current.filter(item => item.id !== id);
    const updatedForm = { ...form, bottomNavItems: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const toggleBottomNavItem = (id: string) => {
    const current = form.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS;
    const updated = current.map(item => {
      if (item.id === id) {
        return { ...item, enabled: !item.enabled };
      }
      return item;
    });
    const updatedForm = { ...form, bottomNavItems: updated };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const resetBottomNavToDefault = () => {
    const updatedForm = { ...form, bottomNavItems: DEFAULT_BOTTOM_NAV_ITEMS };
    setForm(updatedForm);
    updateAgencySettings(updatedForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Tabs Control */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'branding'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Agency Profile & Branding
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Homepage FAQ Accordion
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'footer'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-4 h-4" />
          Bottom Menus & Footer Manager
        </button>
      </div>

      {/* Save Success Alert Floating */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span className="text-xs font-extrabold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Changes saved successfully! All updates are immediately loaded in the traveler experience.
          </span>
        </div>
      )}

      {/* Tab Content 1: Agency Profile */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-brand" />
                Contact Profile & Brand Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure agency parameters that display across headers, footers, PDFs, and invoices.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Branding
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Agency Name *
              </label>
              <input
                type="text"
                required
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Helpline / Phone *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                WhatsApp Business Number (with country code) *
              </label>
              <input
                type="text"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Agency Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Default Currency Symbol
              </label>
              <input
                type="text"
                required
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Sacred Dashboard Mantra / Invocational Blessing
              </label>
              <input
                type="text"
                value={form.sacredMantra || ''}
                onChange={(e) => setForm({ ...form, sacredMantra: e.target.value })}
                placeholder="e.g. साम्ब सदाशिव"
                className="w-full text-xs font-bold text-amber-700 bg-amber-50/50 border border-amber-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Office Address / Location
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: FAQ Editor */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-600" />
                Frequently Asked Questions (FAQ) Editor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, remove, and edit questions displayed on the homepage. Optimized for Google SEO schema rankings.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save FAQs
            </button>
          </div>

          {/* Add FAQ Sub-form */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Add New FAQ
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Question (e.g. How does Holidays Hunt handle booking details?)"
                value={newFaqQuestion}
                onChange={(e) => setNewFaqQuestion(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
              />
              <textarea
                rows={3}
                placeholder="Answer text..."
                value={newFaqAnswer}
                onChange={(e) => setNewFaqAnswer(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
              />
              <button
                type="button"
                onClick={addFAQ}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add FAQ
              </button>
            </div>
          </div>

          {/* Current FAQs List */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Current Live FAQs</h4>
            {form.faqs && form.faqs.length > 0 ? (
              <div className="space-y-4">
                {form.faqs.map((faq, index) => (
                  <div key={faq.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs space-y-2">
                    <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold text-slate-400"># {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => deleteFAQ(faq.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <Trash className="w-3 h-3" /> Delete
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQField(faq.id, 'question', e.target.value)}
                        className="w-full text-xs font-extrabold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFAQField(faq.id, 'answer', e.target.value)}
                        className="w-full text-xs text-slate-600 bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No FAQs created yet. Live travelers will see fallback answers.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: Bottom Menus & Footer Manager */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          {/* Header & Sub-Tabs */}
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Menu className="w-5 h-5 text-brand" />
                Bottom Menus & Footer Navigation Manager
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, or delete options from your website footer columns and the mobile bottom navigation bar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Bottom Menus
              </button>
            </div>
          </div>

          {/* Subtabs Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setBottomMenuSubTab('footer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                bottomMenuSubTab === 'footer'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Menu className="w-3.5 h-3.5" />
              Footer Multi-Column Menus ({form.footerMenus?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setBottomMenuSubTab('mobile-nav')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                bottomMenuSubTab === 'mobile-nav'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile Bottom Navigation Bar ({form.bottomNavItems?.length || 0})
            </button>
          </div>

          {/* SUBTAB 1: FOOTER MULTI-COLUMN MENUS */}
          {bottomMenuSubTab === 'footer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (5 Cols): Add Column & Add Link Controls */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Add Column Section Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> Create New Footer Column
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add a new vertical category list in the footer (e.g., SACRED YATRAS, QUICK LINKS, TEMPLE GUIDES).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Column Title (e.g. SACRED YATRAS)"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFooterSection();
                        }
                      }}
                      className="flex-1 text-xs font-extrabold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:border-brand focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={addFooterSection}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Add Link Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-brand" /> Add Menu Link Option
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Column</label>
                      <select
                        value={selectedSectionId}
                        onChange={(e) => setSelectedSectionId(e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden"
                      >
                        <option value="">-- Choose Column to Add To --</option>
                        {(form.footerMenus || []).map(sec => (
                          <option key={sec.id} value={sec.id}>{sec.title} ({sec.items.length} links)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Option Display Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Vaishno Devi Yatra, About Us, Terms"
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target URL or Page Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. pilgrimage, about, faq, or https://..."
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[9.5px] font-bold text-slate-500 mr-1 self-center">Quick Presets:</span>
                        {[
                          { label: 'All Packages', url: 'packages' },
                          { label: 'Destinations', url: 'destinations' },
                          { label: 'Sitemap', url: 'sitemap' },
                          { label: 'About Us', url: 'about' },
                          { label: 'Contact Us', url: 'locate_us' },
                          { label: 'Guide Hub', url: 'guide' },
                          { label: 'FAQ', url: 'faq' },
                          { label: 'Careers', url: 'careers' },
                          { label: 'Terms', url: 'terms' },
                          { label: 'Privacy', url: 'privacy' },
                          { label: 'Panchang', url: '/panchang' },
                          { label: 'Rashifal', url: '/rashifal' },
                        ].map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => {
                              setNewLinkLabel(preset.label);
                              setNewLinkUrl(preset.url);
                            }}
                            className="px-2 py-0.5 bg-white hover:bg-brand/10 hover:text-brand text-[9.5px] font-semibold text-slate-600 rounded-md border border-slate-200 transition cursor-pointer"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedSectionId || !newLinkLabel.trim() || !newLinkUrl.trim()}
                      onClick={() => addFooterLink(selectedSectionId)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedSectionId && newLinkLabel.trim() && newLinkUrl.trim()
                          ? 'bg-brand hover:bg-brand-dark text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Add Link Option
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Live Footer Columns with Delete Controls */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Menu className="w-4 h-4 text-slate-500" />
                    Active Footer Columns ({form.footerMenus?.length || 0})
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500">
                    Changes are saved automatically
                  </span>
                </div>
                
                {form.footerMenus && form.footerMenus.length > 0 ? (
                  <div className="space-y-4">
                    {form.footerMenus.map(section => (
                      <div key={section.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
                        {/* Section Header */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                              {section.title}
                            </span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded-full">
                              {section.items.length} items
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setInlineAddSectionId(inlineAddSectionId === section.id ? null : section.id);
                                setInlineLinkLabel('');
                                setInlineLinkUrl('');
                              }}
                              className="text-[10.5px] font-bold text-brand hover:text-brand-dark px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 transition cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Link
                            </button>
                            <button type="button" onClick={() => editFooterSection(section.id)} className="text-[10.5px] font-bold text-slate-600 hover:text-brand px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 transition cursor-pointer flex items-center gap-1" title="Edit this column"><Edit2 className="w-3 h-3" /> Edit</button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteFooterSection(section.id);
                              }}
                              className="text-[10.5px] font-bold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                              title="Delete this entire column"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete Column
                            </button>
                          </div>
                        </div>

                        {/* Inline Quick Add Form */}
                        {inlineAddSectionId === section.id && (
                          <div className="p-3 mb-3 bg-white border border-brand/30 rounded-xl space-y-2 shadow-2xs animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                                <Plus className="w-3 h-3 text-brand" /> Quick Add to "{section.title}"
                              </span>
                              <button
                                type="button"
                                onClick={() => setInlineAddSectionId(null)}
                                className="text-[10px] text-slate-400 hover:text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Link Label (e.g. Tour Guide)"
                                value={inlineLinkLabel}
                                onChange={(e) => setInlineLinkLabel(e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-brand focus:bg-white focus:outline-hidden"
                              />
                              <input
                                type="text"
                                placeholder="Target URL / Slug (e.g. guide)"
                                value={inlineLinkUrl}
                                onChange={(e) => setInlineLinkUrl(e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-brand focus:bg-white focus:outline-hidden"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => addFooterLink(section.id, inlineLinkLabel, inlineLinkUrl)}
                              disabled={!inlineLinkLabel.trim() || !inlineLinkUrl.trim()}
                              className="w-full py-1.5 px-3 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition disabled:opacity-50 cursor-pointer"
                            >
                              Save Link to Column
                            </button>
                          </div>
                        )}

                        {/* Link Items List with explicit Delete buttons */}
                        {section.items && section.items.length > 0 ? (
                          <ul className="space-y-1.5">
                            {section.items.map(item => (
                              <li key={item.id} className="flex items-center justify-between bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs transition group">
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <Link className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-bold text-slate-800 truncate">{item.label}</span>
                                  <span className="text-[10.5px] text-slate-400 truncate">({item.url})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => editFooterLink(section.id, item.id)}
                                  title={`Edit ${item.label}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span className="hidden group-hover:inline text-brand">Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteFooterLink(section.id, item.id)
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0"
                                  title={`Delete ${item.label}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span className="hidden group-hover:inline text-rose-600">Delete</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic py-2 text-center bg-white/50 rounded-xl border border-dashed border-slate-200">
                            No menu links in this column yet. Click "+ Add Link" above.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500 font-medium">No footer columns created yet. Use the form on the left to create your first column.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SUBTAB 2: MOBILE BOTTOM NAVIGATION BAR */}
          {bottomMenuSubTab === 'mobile-nav' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (5 Cols): Add New Bottom Nav Item Form */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-brand" /> Add Mobile Bottom Menu Option
                    </h4>
                    <button
                      type="button"
                      onClick={resetBottomNavToDefault}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200"
                      title="Reset back to default 4 items"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Defaults
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Add buttons that appear on the sticky mobile bottom bar on smartphone and tablet screens.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Menu Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Explore, Tours, Contact, Deals"
                        value={newNavLabel}
                        onChange={(e) => setNewNavLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addBottomNavItem();
                          }
                        }}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:border-brand focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Icon</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'home', label: 'Home', icon: Building },
                          { id: 'tours', label: 'Tours', icon: Luggage },
                          { id: 'destinations', label: 'Locations', icon: MapPin },
                          { id: 'chat', label: 'Chat', icon: MessageCircle },
                          { id: 'phone', label: 'Phone', icon: Phone },
                          { id: 'compass', label: 'Compass', icon: Compass },
                          { id: 'star', label: 'Star', icon: Star },
                          { id: 'info', label: 'Info', icon: Info },
                          { id: 'custom', label: 'Custom', icon: Globe },
                        ].map(ic => {
                          const IconComp = ic.icon;
                          return (
                            <button
                              key={ic.id}
                              type="button"
                              onClick={() => setNewNavIcon(ic.id as any)}
                              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 font-bold transition cursor-pointer ${
                                newNavIcon === ic.id
                                  ? 'border-brand bg-orange-50 text-brand'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                              <span className="text-[10px]">{ic.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Click Action Type</label>
                      <select
                        value={newNavAction}
                        onChange={(e) => setNewNavAction(e.target.value as any)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden"
                      >
                        <option value="home">Navigate to Home / Explore</option>
                        <option value="tours">Open All Tours Packages</option>
                        <option value="destinations">Open Destinations Hub</option>
                        <option value="whatsapp">Open WhatsApp Concierge Chat</option>
                        <option value="call">Trigger Direct Phone Call</option>
                        <option value="custom">Open Custom Web Link or Page</option>
                      </select>
                    </div>

                    {newNavAction === 'custom' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Custom Link Target / URL</label>
                        <input
                          type="text"
                          placeholder="e.g. /about, /terms, or https://..."
                          value={newNavUrl}
                          onChange={(e) => setNewNavUrl(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={!newNavLabel.trim()}
                      onClick={addBottomNavItem}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        newNavLabel.trim()
                          ? 'bg-brand hover:bg-brand-dark text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Add to Bottom Navigation
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Current Bottom Nav Items with Delete */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-brand" />
                    Configured Mobile Bottom Menus ({form.bottomNavItems?.length || 0})
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500">
                    Visible on mobile & tablet
                  </span>
                </div>

                {/* Visual Preview Box */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" /> Live Mobile Bottom Bar Preview
                    </span>
                    <span className="text-[10px] text-slate-500">Fixed at bottom of screen</span>
                  </div>
                  <div className="flex items-center justify-around pt-1">
                    {(form.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS).filter(item => item.enabled !== false).map((item, idx) => (
                      <div key={item.id} className="flex flex-col items-center gap-1 px-2 py-1 text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-brand text-white' : 'bg-slate-800 text-slate-300'}`}>
                          {item.icon === 'home' && <Building className="w-4 h-4" />}
                          {item.icon === 'tours' && <Luggage className="w-4 h-4" />}
                          {item.icon === 'destinations' && <MapPin className="w-4 h-4" />}
                          {item.icon === 'chat' && <MessageCircle className="w-4 h-4" />}
                          {item.icon === 'phone' && <Phone className="w-4 h-4" />}
                          {item.icon === 'compass' && <Compass className="w-4 h-4" />}
                          {item.icon === 'star' && <Star className="w-4 h-4" />}
                          {item.icon === 'info' && <Info className="w-4 h-4" />}
                          {item.icon === 'custom' && <Globe className="w-4 h-4" />}
                        </div>
                        <span className={`text-[10px] font-bold ${idx === 0 ? 'text-brand' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items List with Delete & Toggle controls */}
                <div className="space-y-2">
                  {(form.bottomNavItems || DEFAULT_BOTTOM_NAV_ITEMS).map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        item.enabled !== false
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                          {item.icon === 'home' && <Building className="w-4 h-4" />}
                          {item.icon === 'tours' && <Luggage className="w-4 h-4" />}
                          {item.icon === 'destinations' && <MapPin className="w-4 h-4" />}
                          {item.icon === 'chat' && <MessageCircle className="w-4 h-4" />}
                          {item.icon === 'phone' && <Phone className="w-4 h-4" />}
                          {item.icon === 'compass' && <Compass className="w-4 h-4" />}
                          {item.icon === 'star' && <Star className="w-4 h-4" />}
                          {item.icon === 'info' && <Info className="w-4 h-4" />}
                          {item.icon === 'custom' && <Globe className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{item.label}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded capitalize">
                              {item.actionType}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Icon: {item.icon} {item.url ? `• Target: ${item.url}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Active Status */}
                        <button
                          type="button"
                          onClick={() => toggleBottomNavItem(item.id)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            item.enabled !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                          }`}
                          title="Toggle visibility in mobile bottom bar"
                        >
                          {item.enabled !== false ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          type="button"
                          onClick={() => editBottomNavItem(item.id)}
                          className="text-slate-600 hover:text-brand hover:bg-orange-50 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Edit this bottom menu option"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        {/* Explicit Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            deleteBottomNavItem(item.id);
                          }}
                          className="text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Delete this option from bottom menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Backup & Sample Data Management - Maintained */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-600" />
          Catalog Backup & Data Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Export Packages Backup</h4>
            <p className="text-[11px] text-slate-500">
              Download complete tour packages JSON file including day-wise itineraries and hotel stays.
            </p>
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Import Packages JSON</h4>
            <p className="text-[11px] text-slate-500">
              Upload a previously exported tour catalog JSON file to restore packages.
            </p>
            <label className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
            {importStatus && <p className="text-[10px] text-rose-600 font-bold">{importStatus}</p>}
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
            <h4 className="text-xs font-bold text-rose-900">Reset Demo Catalog</h4>
            <p className="text-[11px] text-rose-700">
              Restore the default system packages configuration.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset catalog to default packages?')) {
                  resetToDefaults();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

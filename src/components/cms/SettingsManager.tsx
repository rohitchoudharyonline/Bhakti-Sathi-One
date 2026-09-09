import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { AgencySettings, FAQItem, FooterMenuSection, FooterMenuItem } from '../../types/tour';
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
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { agencySettings, updateAgencySettings, packages, resetToDefaults } = useTours();

  const [activeTab, setActiveTab] = useState<'branding' | 'faqs' | 'footer'>('branding');
  const [form, setForm] = useState<AgencySettings>({
    ...agencySettings,
    faqs: agencySettings.faqs || [
      {
        id: 'faq-1',
        question: 'How does Bhakti Sathi assist in planning customizable spiritual Yatras?',
        answer: 'Bhakti Sathi is a premier digital platform and travel facilitator. We coordinate customized travel itineraries, connecting you with verified local transport coordinators and accommodation providers. Our expert team assists you in selecting custom routes, durations, and comfort-aligned options suitable for families and senior citizens.'
      },
      {
        id: 'faq-2',
        question: 'How does Bhakti Sathi help ensure comfort for senior citizens on pilgrimages like Vaishno Devi or Char Dham?',
        answer: 'Bhakti Sathi is dedicated to organizing stress-free, senior-friendly spiritual journeys. While hotels and helicopter services are managed by independent third-party operators, Bhakti Sathi coordinators handpick recommended hotels with elevators and close proximity to the shrines. We also assist in coordinating priority assist requests, planning gentle travel paces, and arranging dedicated, comfortable ground vehicles with experienced chauffeurs to support our elderly guests.'
      },
      {
        id: 'faq-3',
        question: 'What is Bhakti Sathi\'s role regarding meals and restaurant suggestions?',
        answer: 'Bhakti Sathi does not operate restaurants, kitchens, or hotel dining services. However, we understand the importance of dietary preferences on a sacred journey. We provide curated recommendations for reputable local vegetarian restaurants and hotel kitchens along your yatra route that offer clean, high-quality vegetarian food.'
      },
      {
        id: 'faq-4',
        question: 'Can Bhakti Sathi customize a spiritual tour itinerary for my family?',
        answer: 'Absolutely! Bhakti Sathi is famous for custom-made, private spiritual itineraries. Whether you are planning a family trip to Kashi Vishwanath, Ayodhya Ram Mandir, or Himachal Devi Darshans, our expert team can adjust the travel duration, suggest select category stays, and coordinate private transport matching your family\'s speed and requirements.'
      },
      {
        id: 'faq-5',
        question: 'What is Bhakti Sathi\'s payment schedule and booking policy?',
        answer: 'To secure your preferred hotels and dedicated vehicle bookings, Bhakti Sathi requires a standard 30% advance deposit. The remaining 70% balance can be settled in easy installments up to 7 days before your departure. We accept UPI, bank transfer, Net Banking, and all major debit/credit cards with 100% transparent invoicing.'
      },
      {
        id: 'faq-6',
        question: 'What is the cancellation and rescheduling policy for a Bhakti Sathi coordinated yatra?',
        answer: 'We offer flexible terms to ensure peace of mind. For cancellations done 30 days or more before departure, we provide a full refund of your deposit. Within 15-29 days, a 50% refund is applicable. If you need to postpone, Bhakti Sathi allows you to reschedule or transfer your booking to a family member within 6 months, subject to seasonal rate differences from hotels and transport partners.'
      },
      {
        id: 'faq-7',
        question: 'Are local tour guides and temple historians provided by Bhakti Sathi?',
        answer: 'Yes, upon request, Bhakti Sathi can connect you with certified, knowledgeable local guides and religious experts at various historical temples. They help explain the historical significance, temple legends, and rich cultural heritage of the sacred shrines.'
      },
      {
        id: 'faq-8',
        question: 'Does Bhakti Sathi coordinate helicopter bookings for Yatras like Vaishno Devi or Kedarnath?',
        answer: 'Bhakti Sathi assists travelers by providing guidance, booking schedule updates, and facilitation support for third-party helicopter tickets. Please note that helicopter tickets are subject to official government portal schedules, verification requirements, and availability.'
      },
      {
        id: 'faq-9',
        question: 'How does Bhakti Sathi handle travel logistics in hilly and mountainous regions?',
        answer: 'We coordinate with licensed local drivers who are highly experienced with hilly terrains. For the safety of our guests, we strictly adhere to mountain safety guidelines, such as completing travel before dark, maintaining safe speed limits, and ensuring proper vehicle fitness.'
      },
      {
        id: 'faq-10',
        question: 'What sets Bhakti Sathi apart from conventional tour operators?',
        answer: 'Bhakti Sathi is a specialized platform focusing exclusively on custom-made devotional, family, and senior-friendly yatras. We provide personalized 24/7 travel desk support during your trip, complete billing transparency, and reliable local partners to make your pilgrimage seamless and spiritually enriching.'
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
        title: 'SACRED YATRAS',
        items: [
          { id: 'fmi-vd', label: 'Vaishno Devi Yatra', url: 'pilgrimage' },
          { id: 'fmi-hd', label: 'Himachal Devi Darshan', url: 'pilgrimage' },
          { id: 'fmi-fam', label: 'Family Devotional Tours', url: 'family' }
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
    ]
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // FAQ addition temp state
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Footer addition temp states
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

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

  // Footer Menu CRUD Helpers
  const addFooterSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSection: FooterMenuSection = {
      id: `fm-${Date.now()}`,
      title: newSectionTitle.toUpperCase().trim(),
      items: []
    };
    const updated = [...(form.footerMenus || []), newSection];
    setForm({ ...form, footerMenus: updated });
    setNewSectionTitle('');
  };

  const deleteFooterSection = (sectionId: string) => {
    const updated = (form.footerMenus || []).filter(sec => sec.id !== sectionId);
    setForm({ ...form, footerMenus: updated });
  };

  const addFooterLink = (sectionId: string) => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    const newLink: FooterMenuItem = {
      id: `fmi-${Date.now()}`,
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim()
    };
    const updated = (form.footerMenus || []).map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newLink] };
      }
      return sec;
    });
    setForm({ ...form, footerMenus: updated });
    setNewLinkLabel('');
    setNewLinkUrl('');
    setSelectedSectionId('');
  };

  const deleteFooterLink = (sectionId: string, linkId: string) => {
    const updated = (form.footerMenus || []).map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.filter(item => item.id !== linkId) };
      }
      return sec;
    });
    setForm({ ...form, footerMenus: updated });
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
          Footer Menus Manager
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
                placeholder="Question (e.g. How does Bhakti Sathi handle booking details?)"
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

      {/* Tab Content 3: Footer Menus */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Menu className="w-4 h-4 text-brand" />
                Footer Column Menus Builder
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize structural columns and link navigation items in the main footer. Supports target pages and absolute external URLs.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Footer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Add Column Section & Add Link Controls */}
            <div className="space-y-6">
              
              {/* Add Column Section Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" /> Create New Column Column Section
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Column Title (e.g. QUICK LINKS)"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="flex-1 text-xs font-extrabold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:border-brand focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={addFooterSection}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Add Link Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" /> Add Link to Column Section
                </h4>
                <div className="space-y-2">
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden"
                  >
                    <option value="">-- Select Destination Column --</option>
                    {(form.footerMenus || []).map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.title}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Link Display Text (e.g. About Bhakti Sathi)"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                  />

                  <div>
                    <input
                      type="text"
                      placeholder="Link Target URL / Slug (e.g. about, terms, or https://google.com)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-brand focus:outline-hidden"
                    />
                    <p className="text-[9.5px] text-slate-500 mt-1 font-semibold pl-1">
                      Use simple slugs (e.g. <span className="text-brand font-bold">about</span>, <span className="text-brand font-bold">careers</span>, <span className="text-brand font-bold">locate_us</span>, <span className="text-brand font-bold">terms</span>) or full URL paths.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedSectionId}
                    onClick={() => addFooterLink(selectedSectionId)}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedSectionId ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Add Link
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Columns List with delete */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Live Footer Columns Configuration</h4>
              
              {form.footerMenus && form.footerMenus.length > 0 ? (
                <div className="space-y-4">
                  {form.footerMenus.map(section => (
                    <div key={section.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">{section.title}</span>
                        <button
                          type="button"
                          onClick={() => deleteFooterSection(section.id)}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 px-2 py-1 rounded bg-rose-50"
                        >
                          Remove Section
                        </button>
                      </div>

                      {section.items && section.items.length > 0 ? (
                        <ul className="space-y-2">
                          {section.items.map(item => (
                            <li key={item.id} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Link className="w-3 h-3 text-slate-400" />
                                {item.label} <span className="text-[10px] text-slate-400 font-medium">({item.url})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteFooterLink(section.id, item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No links in this column yet.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No columns created yet.</p>
              )}
            </div>

          </div>
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

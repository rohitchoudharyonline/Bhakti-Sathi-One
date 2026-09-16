import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import {
  Search,
  Save,
  Edit3,
  X,
  Globe,
  Tag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  Sparkles,
  FileText,
  Layers,
  Layout,
  ExternalLink,
  Shield,
  Eye,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { UniversalImageUploader } from './UniversalImageUploader';
import { GuideArticle } from '../../types/guide';
import { CustomPage, PageSeoConfig } from '../../types/cms';

export const SEOManager: React.FC = () => {
  const {
    guides,
    updateGuide,
    customPages,
    updateCustomPage,
    pageSeoConfigs,
    updatePageSeoConfig,
  } = useTours();

  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState<'all' | 'site-pages' | 'custom-pages' | 'posts'>('all');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const [editingSitePage, setEditingSitePage] = useState<PageSeoConfig | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideArticle | null>(null);
  const [editingCustomPage, setEditingCustomPage] = useState<CustomPage | null>(null);

  const sitePageList: PageSeoConfig[] = Object.values(pageSeoConfigs || {});

  // Filter items
  const filteredSitePages = sitePageList.filter(
    (sp) =>
      sp.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.focusKeyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.seo?.primaryKeyword?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomPages = customPages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seo?.focusKeyword?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SEO Score & Audit helper for Rank Math
  const calculateSeoAudit = (
    title: string,
    seoTitle?: string,
    metaDescription?: string,
    primaryKeyword?: string
  ) => {
    const activeTitle = seoTitle || title || '';
    const activeDesc = metaDescription || '';
    const kw = (primaryKeyword || '').toLowerCase().trim();

    const checks = [
      {
        id: 'title_len',
        label: 'SEO Title Length (40 - 65 chars)',
        status: activeTitle.length >= 35 && activeTitle.length <= 65 ? 'pass' : activeTitle.length > 0 ? 'warn' : 'fail',
        message: activeTitle ? `${activeTitle.length} characters` : 'Title is missing',
      },
      {
        id: 'desc_len',
        label: 'Meta Description Length (110 - 165 chars)',
        status: activeDesc.length >= 110 && activeDesc.length <= 165 ? 'pass' : activeDesc.length > 0 ? 'warn' : 'fail',
        message: activeDesc ? `${activeDesc.length} characters` : 'Description is missing',
      },
      {
        id: 'kw_present',
        label: 'Focus Keyword Defined',
        status: kw.length > 0 ? 'pass' : 'fail',
        message: kw ? `"${kw}"` : 'No focus keyword set',
      },
      {
        id: 'kw_in_title',
        label: 'Focus Keyword in SEO Title',
        status: kw && activeTitle.toLowerCase().includes(kw) ? 'pass' : kw ? 'fail' : 'warn',
        message: kw && activeTitle.toLowerCase().includes(kw) ? 'Keyword found in title' : 'Keyword not found in title',
      },
      {
        id: 'kw_in_desc',
        label: 'Focus Keyword in Meta Description',
        status: kw && activeDesc.toLowerCase().includes(kw) ? 'pass' : kw ? 'fail' : 'warn',
        message: kw && activeDesc.toLowerCase().includes(kw) ? 'Keyword found in meta description' : 'Keyword missing from meta description',
      },
    ];

    const passCount = checks.filter((c) => c.status === 'pass').length;
    const score = Math.round((passCount / checks.length) * 100);

    return { score, checks };
  };

  const handleSaveSitePageSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSitePage) {
      updatePageSeoConfig(editingSitePage);
      setSaveSuccessNotice(`SEO settings for "${editingSitePage.pageName}" saved successfully!`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
      setEditingSitePage(null);
    }
  };

  const handleSaveGuideSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      updateGuide(editingGuide);
      setSaveSuccessNotice(`SEO settings for post "${editingGuide.title}" saved successfully!`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
      setEditingGuide(null);
    }
  };

  const handleSaveCustomPageSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomPage) {
      updateCustomPage(editingCustomPage);
      setSaveSuccessNotice(`SEO settings for page "${editingCustomPage.title}" saved successfully!`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
      setEditingCustomPage(null);
    }
  };

  // 1. EDITING A WEBSITE CORE PAGE SEO (Homepage, Tours, Destinations, Blog, FAQ, etc.)
  if (editingSitePage) {
    const audit = calculateSeoAudit(
      editingSitePage.pageName,
      editingSitePage.metaTitle,
      editingSitePage.metaDescription,
      editingSitePage.focusKeyword
    );

    const displaySlug = editingSitePage.path === '/' ? '' : editingSitePage.path.replace(/^\//, '');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FF4B00]/10 text-[#FF4B00] rounded-lg">
                <Globe className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">Rank Math SEO Editor</h2>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 flex items-center gap-2 flex-wrap">
              Editing: <span className="font-bold text-stone-900">{editingSitePage.pageName}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Core Website Page
              </span>
              <span className="text-stone-400 font-mono text-xs">{editingSitePage.canonicalUrl}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingSitePage(null)}
            className="p-2 text-stone-400 hover:text-stone-900 transition rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <form onSubmit={handleSaveSitePageSeo} className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 space-y-6 shadow-2xs">
            {/* Previews: Google Search & Social Share */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Search Result Preview */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Google Search Snippet Preview
                </h3>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 font-sans space-y-1 h-[140px] flex flex-col justify-center overflow-hidden">
                  <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-1 break-all">
                    <span className="font-semibold text-stone-700">https://holidayshunt.com</span>
                    {displaySlug && (
                      <>
                        <span>›</span>
                        <span className="font-semibold text-stone-600">{displaySlug}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[#1a0dab] text-sm sm:text-base font-medium cursor-pointer hover:underline line-clamp-2 leading-tight">
                    {editingSitePage.metaTitle || editingSitePage.pageName}
                  </div>
                  <div className="text-[#4d5156] text-xs line-clamp-2 leading-relaxed">
                    {editingSitePage.metaDescription || 'No meta description set. Search engines will automatically extract a snippet from your page body.'}
                  </div>
                </div>
              </div>

              {/* Social Share Card Preview (WhatsApp, Facebook, Twitter) */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-sky-600" />
                  WhatsApp & Social Share Preview
                </h3>
                <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden font-sans flex h-[140px]">
                  <div className="w-36 bg-stone-200 shrink-0 relative overflow-hidden flex items-center justify-center">
                    {editingSitePage.ogImage ? (
                      <img
                        src={editingSitePage.ogImage}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-2 text-center text-stone-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[9px] block font-semibold leading-tight">No Pic Uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-white flex-1 flex flex-col justify-between overflow-hidden border-l border-stone-200">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">HOLIDAYSHUNT.COM</div>
                      <div className="text-xs font-bold text-stone-900 line-clamp-2 leading-tight mt-0.5">
                        {editingSitePage.metaTitle || editingSitePage.pageName}
                      </div>
                      <div className="text-[10px] text-stone-500 line-clamp-2 leading-tight mt-1">
                        {editingSitePage.metaDescription || 'Holidays Hunt spiritual pilgrimage tours.'}
                      </div>
                    </div>
                    <div className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>OG Metadata Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Focus Keyword (Primary Ranking Keyword)
                </label>
                <input
                  type="text"
                  value={editingSitePage.focusKeyword || ''}
                  onChange={(e) =>
                    setEditingSitePage({
                      ...editingSitePage,
                      focusKeyword: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
                  placeholder="e.g. Pilgrimage & Yatra Packages, Katra Vaishno Devi Tour..."
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  The primary search term you want this page to rank for on Google, Bing, and search engines.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    SEO Meta Title
                  </label>
                  <span className={`text-xs font-bold ${editingSitePage.metaTitle.length > 65 ? 'text-amber-600' : 'text-stone-400'}`}>
                    {editingSitePage.metaTitle.length} / 65
                  </span>
                </div>
                <input
                  type="text"
                  value={editingSitePage.metaTitle || ''}
                  onChange={(e) =>
                    setEditingSitePage({
                      ...editingSitePage,
                      metaTitle: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
                  placeholder="Page title displayed in search engine results..."
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Recommended: 40-60 characters. Keep it under 65 to avoid truncation on mobile screens.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Meta Description
                  </label>
                  <span className={`text-xs font-bold ${editingSitePage.metaDescription.length > 165 ? 'text-amber-600' : 'text-stone-400'}`}>
                    {editingSitePage.metaDescription.length} / 165
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingSitePage.metaDescription || ''}
                  onChange={(e) =>
                    setEditingSitePage({
                      ...editingSitePage,
                      metaDescription: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00] resize-none"
                  placeholder="A clear, compelling summary encouraging searchers to click..."
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Recommended: 120-160 characters. Clearly state what travelers will find on this page.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={editingSitePage.canonicalUrl || ''}
                  onChange={(e) =>
                    setEditingSitePage({
                      ...editingSitePage,
                      canonicalUrl: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-[#FF4B00]"
                  placeholder="https://holidayshunt.com/..."
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Canonical link helps prevent duplicate content penalties across different protocols or domains.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Social Sharing / Open Graph Image (og:image)
                  </label>
                  <span className="text-[10px] text-stone-400 font-medium">
                    1200 × 630px Recommended
                  </span>
                </div>

                <UniversalImageUploader
                  label="Upload Social Share Image (OG:IMAGE)"
                  description="Auto-compress & upload directly to Cloudflare R2 bucket. Choose output dimension & format (WebP, PNG, JPG). Displayed when shared on WhatsApp, Facebook, X/Twitter, and LinkedIn."
                  folder="seo-og"
                  defaultWidth={1200}
                  defaultFormat="webp"
                  currentUrl={editingSitePage.ogImage || ''}
                  onImageSelected={(url, asset) => {
                    const finalImg = url || asset?.url || asset?.storagePath || asset?.dataUrl || '';
                    setEditingSitePage({
                      ...editingSitePage,
                      ogImage: finalImg,
                    });
                  }}
                  showR2LibraryPicker={true}
                />

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="url"
                    value={editingSitePage.ogImage || ''}
                    onChange={(e) =>
                      setEditingSitePage({
                        ...editingSitePage,
                        ogImage: e.target.value,
                      })
                    }
                    className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono outline-none focus:border-[#FF4B00] text-stone-700 bg-stone-50/70"
                    placeholder="Or paste direct image URL (e.g. https://images.unsplash.com/...)"
                  />
                  {editingSitePage.ogImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSitePage({
                          ...editingSitePage,
                          ogImage: '',
                        })
                      }
                      className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 font-semibold transition cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  The image preview shown when this link is shared on WhatsApp, Facebook, or Twitter.
                </p>
              </div>

              {/* Robots Directives */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={editingSitePage.noIndex || false}
                    onChange={(e) =>
                      setEditingSitePage({
                        ...editingSitePage,
                        noIndex: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#FF4B00] focus:ring-[#FF4B00]"
                  />
                  <span>No-Index (Hide from Search Engines)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={editingSitePage.noFollow || false}
                    onChange={(e) =>
                      setEditingSitePage({
                        ...editingSitePage,
                        noFollow: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#FF4B00] focus:ring-[#FF4B00]"
                  />
                  <span>No-Follow (Do not follow links)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSitePage(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF4B00] hover:bg-[#e04200] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save SEO Settings
              </button>
            </div>
          </form>

          {/* Rank Math Audit Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF4B00]" />
                  Rank Math Audit Score
                </h3>
                <span className={`text-xl font-black ${audit.score >= 80 ? 'text-emerald-600' : audit.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {audit.score}/100
                </span>
              </div>

              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full transition-all duration-300 ${
                    audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${audit.score}%` }}
                />
              </div>

              <div className="space-y-3">
                {audit.checks.map((chk) => (
                  <div key={chk.id} className="flex items-start gap-2.5 text-xs">
                    {chk.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                    {chk.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                    {chk.status === 'fail' && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <div className="font-bold text-stone-800">{chk.label}</div>
                      <div className="text-stone-500">{chk.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 text-xs text-stone-600 space-y-2">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Live Search Engine Sync
              </div>
              <p>
                When you click Save, your custom title, meta description, and canonical tags update dynamically across the entire website and are verified for search engine crawlers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. EDITING A GUIDE POST SEO
  if (editingGuide) {
    const seoData = editingGuide.seo || {
      metaTitle: editingGuide.title,
      metaDescription: editingGuide.excerpt || '',
      primaryKeyword: '',
      secondaryKeywords: [],
      canonicalUrl: `https://holidayshunt.com/guides/${editingGuide.slug}`,
    };

    const audit = calculateSeoAudit(
      editingGuide.title,
      seoData.metaTitle,
      seoData.metaDescription,
      seoData.primaryKeyword
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#FF4B00]" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">Rank Math SEO Editor</h2>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Post: <span className="font-bold text-stone-900">{editingGuide.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingGuide(null)}
            className="p-2 text-stone-400 hover:text-stone-900 transition rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <form onSubmit={handleSaveGuideSeo} className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 space-y-6 shadow-2xs">
            {/* Search Result Snippet Card */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Google Search Result Preview
              </h3>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 font-sans space-y-1">
                <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-1 break-all">
                  <span>https://holidayshunt.com</span>
                  <span>›</span>
                  <span>guides</span>
                  <span>›</span>
                  <span className="font-semibold">{editingGuide.slug}</span>
                </div>
                <div className="text-[#1a0dab] text-base sm:text-lg font-medium cursor-pointer hover:underline line-clamp-2">
                  {seoData.metaTitle || editingGuide.title} | Holidays Hunt
                </div>
                <div className="text-[#4d5156] text-xs line-clamp-2">
                  {seoData.metaDescription || 'No description set. Google will display a snippet from your body text.'}
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Focus Keyword (Primary Keyword)
                </label>
                <input
                  type="text"
                  value={seoData.primaryKeyword || ''}
                  onChange={(e) =>
                    setEditingGuide({
                      ...editingGuide,
                      seo: { ...seoData, primaryKeyword: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
                  placeholder="e.g. kedarnath yatra guide 2026"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    SEO Meta Title
                  </label>
                  <span className={`text-xs font-bold ${(seoData.metaTitle?.length || 0) > 60 ? 'text-amber-600' : 'text-stone-400'}`}>
                    {seoData.metaTitle?.length || 0} / 60
                  </span>
                </div>
                <input
                  type="text"
                  value={seoData.metaTitle || ''}
                  onChange={(e) =>
                    setEditingGuide({
                      ...editingGuide,
                      seo: { ...seoData, metaTitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
                  placeholder="Meta title for Google search..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Meta Description
                  </label>
                  <span className={`text-xs font-bold ${(seoData.metaDescription?.length || 0) > 160 ? 'text-amber-600' : 'text-stone-400'}`}>
                    {seoData.metaDescription?.length || 0} / 160
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoData.metaDescription || ''}
                  onChange={(e) =>
                    setEditingGuide({
                      ...editingGuide,
                      seo: { ...seoData, metaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00] resize-none"
                  placeholder="A compelling summary that increases search clicks..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={seoData.canonicalUrl || ''}
                  onChange={(e) =>
                    setEditingGuide({
                      ...editingGuide,
                      seo: { ...seoData, canonicalUrl: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-[#FF4B00]"
                  placeholder="https://holidayshunt.com/guides/your-post-slug"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Social Sharing / Open Graph Image (og:image)
                  </label>
                  <span className="text-[10px] text-stone-400 font-medium">
                    1200 × 630px Recommended
                  </span>
                </div>

                <UniversalImageUploader
                  label="Upload Post Social Image (OG:IMAGE)"
                  description="Auto-compress & upload directly to Cloudflare R2 bucket. If blank, the post's featured cover photo will be used."
                  folder="seo-og"
                  defaultWidth={1200}
                  defaultFormat="webp"
                  currentUrl={seoData.ogImage || editingGuide.featuredImage || ''}
                  onImageSelected={(url) =>
                    setEditingGuide({
                      ...editingGuide,
                      seo: { ...seoData, ogImage: url },
                    })
                  }
                  showR2LibraryPicker={true}
                />

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="url"
                    value={seoData.ogImage || ''}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        seo: { ...seoData, ogImage: e.target.value },
                      })
                    }
                    className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono outline-none focus:border-[#FF4B00] text-stone-700 bg-stone-50/70"
                    placeholder="Or paste direct image URL (e.g. https://images.unsplash.com/...)"
                  />
                  {seoData.ogImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingGuide({
                          ...editingGuide,
                          seo: { ...seoData, ogImage: '' },
                        })
                      }
                      className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 font-semibold transition cursor-pointer shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingGuide(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF4B00] hover:bg-[#e04200] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Meta Fields
              </button>
            </div>
          </form>

          {/* Audit Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF4B00]" />
                  Rank Math Audit Score
                </h3>
                <span className={`text-xl font-black ${audit.score >= 80 ? 'text-emerald-600' : audit.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {audit.score}/100
                </span>
              </div>

              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full transition-all duration-300 ${
                    audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${audit.score}%` }}
                />
              </div>

              <div className="space-y-3">
                {audit.checks.map((chk) => (
                  <div key={chk.id} className="flex items-start gap-2.5 text-xs">
                    {chk.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                    {chk.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                    {chk.status === 'fail' && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <div className="font-bold text-stone-800">{chk.label}</div>
                      <div className="text-stone-500">{chk.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. EDITING A CUSTOM PAGE SEO
  if (editingCustomPage) {
    const pageSeo = editingCustomPage.seo || {
      focusKeyword: '',
      metaTitle: editingCustomPage.title,
      metaDescription: '',
    };

    const audit = calculateSeoAudit(
      editingCustomPage.title,
      pageSeo.metaTitle,
      pageSeo.metaDescription,
      pageSeo.focusKeyword
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#FF4B00]" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">Custom Page SEO Editor</h2>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">Page: <span className="font-bold text-stone-900">{editingCustomPage.title}</span></p>
          </div>
          <button
            type="button"
            onClick={() => setEditingCustomPage(null)}
            className="p-2 text-stone-400 hover:text-stone-900 transition rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSaveCustomPageSeo} className="max-w-2xl bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 space-y-6 shadow-2xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Focus Keyword
            </label>
            <input
              type="text"
              value={pageSeo.focusKeyword || ''}
              onChange={(e) =>
                setEditingCustomPage({
                  ...editingCustomPage,
                  seo: { ...pageSeo, focusKeyword: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
              placeholder="Primary keyword..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              SEO Title
            </label>
            <input
              type="text"
              value={pageSeo.metaTitle || ''}
              onChange={(e) =>
                setEditingCustomPage({
                  ...editingCustomPage,
                  seo: { ...pageSeo, metaTitle: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
              placeholder="SEO Page Title..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={pageSeo.metaDescription || ''}
              onChange={(e) =>
                setEditingCustomPage({
                  ...editingCustomPage,
                  seo: { ...pageSeo, metaDescription: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00] resize-none"
              placeholder="Meta Description..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Social Sharing / Open Graph Image (og:image)
              </label>
              <span className="text-[10px] text-stone-400 font-medium">
                1200 × 630px Recommended
              </span>
            </div>

            <UniversalImageUploader
              label="Upload Custom Page Social Image (OG:IMAGE)"
              description="Auto-compress & upload directly to Cloudflare R2 bucket. Displayed when this custom page is shared on WhatsApp, Facebook, or Twitter."
              folder="seo-og"
              defaultWidth={1200}
              defaultFormat="webp"
              currentUrl={pageSeo.ogImage || editingCustomPage.heroImage || ''}
              onImageSelected={(url, asset) => {
                const finalImg = url || asset?.url || asset?.storagePath || asset?.dataUrl || '';
                setEditingCustomPage({
                  ...editingCustomPage,
                  heroImage: finalImg,
                  seo: { ...pageSeo, ogImage: finalImg },
                });
              }}
              showR2LibraryPicker={true}
            />

            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="url"
                value={pageSeo.ogImage || ''}
                onChange={(e) =>
                  setEditingCustomPage({
                    ...editingCustomPage,
                    seo: { ...pageSeo, ogImage: e.target.value },
                  })
                }
                className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono outline-none focus:border-[#FF4B00] text-stone-700 bg-stone-50/70"
                placeholder="Or paste direct image URL (e.g. https://images.unsplash.com/...)"
              />
              {pageSeo.ogImage && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingCustomPage({
                      ...editingCustomPage,
                      seo: { ...pageSeo, ogImage: '' },
                    })
                  }
                  className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 font-semibold transition cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingCustomPage(null)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF4B00] hover:bg-[#e04200] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Page SEO
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 4. MAIN SEO OVERVIEW TABLE & MOBILE CARDS
  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {saveSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#FF4B00]" />
            <h2 className="text-2xl font-black text-stone-900">Rank Math SEO Interface</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Configure focus keywords, meta titles, descriptions, and canonical URLs for every page of your website.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pages or keywords..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00]"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setContentType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            contentType === 'all'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All Content ({sitePageList.length + customPages.length + guides.length})
        </button>

        <button
          type="button"
          onClick={() => setContentType('site-pages')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            contentType === 'site-pages'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-emerald-600" />
          Website Pages ({sitePageList.length})
        </button>

        <button
          type="button"
          onClick={() => setContentType('custom-pages')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            contentType === 'custom-pages'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Custom Pages ({customPages.length})
        </button>

        <button
          type="button"
          onClick={() => setContentType('posts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            contentType === 'posts'
              ? 'bg-[#FF4B00] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-600" />
          Guides & Posts ({guides.length})
        </button>
      </div>

      {/* 1. MOBILE CARD VIEW */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {/* Core Website Pages */}
        {(contentType === 'all' || contentType === 'site-pages') &&
          filteredSitePages.map((sitePage) => {
            const audit = calculateSeoAudit(
              sitePage.pageName,
              sitePage.metaTitle,
              sitePage.metaDescription,
              sitePage.focusKeyword
            );

            return (
              <div
                key={`mobile-site-page-${sitePage.id}`}
                className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <Layout className="w-3 h-3" />
                    Website Page
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingSitePage(sitePage)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] bg-[#FF4B00] text-white text-xs font-bold rounded-xl active:bg-[#e04200] transition cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit SEO
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-base leading-snug">{sitePage.pageName}</h4>
                  <div className="text-xs font-mono text-stone-500 mt-1">{sitePage.canonicalUrl}</div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      Focus Keyword
                    </div>
                    {sitePage.focusKeyword ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                        <Tag className="w-3 h-3 text-[#FF4B00]" />
                        {sitePage.focusKeyword}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 italic">No keyword set</span>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      SEO Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${audit.score}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          audit.score >= 80
                            ? 'text-emerald-600'
                            : audit.score >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {audit.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Custom Pages */}
        {(contentType === 'all' || contentType === 'custom-pages') &&
          filteredCustomPages.map((page) => {
            const pageKw = page.seo?.focusKeyword || '';
            const audit = calculateSeoAudit(page.title, page.seo?.metaTitle, page.seo?.metaDescription, pageKw);

            return (
              <div
                key={`mobile-seo-page-${page.id}`}
                className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                    <Layers className="w-3 h-3" />
                    Custom Page
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingCustomPage(page)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] bg-indigo-600 text-white text-xs font-bold rounded-xl active:bg-indigo-700 transition cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit SEO
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-base leading-snug">{page.title}</h4>
                  <div className="text-xs font-mono text-stone-500 mt-1">/page/{page.slug}</div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      Focus Keyword
                    </div>
                    {pageKw ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                        <Tag className="w-3 h-3 text-indigo-600" />
                        {pageKw}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 italic">No keyword set</span>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      SEO Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${audit.score}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          audit.score >= 80 ? 'text-emerald-600' : audit.score >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}
                      >
                        {audit.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Guides / Posts */}
        {(contentType === 'all' || contentType === 'posts') &&
          filteredGuides.map((guide) => {
            const audit = calculateSeoAudit(
              guide.title,
              guide.seo?.metaTitle,
              guide.seo?.metaDescription,
              guide.seo?.primaryKeyword
            );

            return (
              <div
                key={`mobile-seo-guide-${guide.id}`}
                className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                    <FileText className="w-3 h-3" />
                    Post
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingGuide(guide)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] bg-[#FF4B00] text-white text-xs font-bold rounded-xl active:bg-[#e04200] transition cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit SEO
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-base leading-snug">{guide.title}</h4>
                  <div className="text-xs font-mono text-stone-500 mt-1">/guides/{guide.slug}</div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      Focus Keyword
                    </div>
                    {guide.seo?.primaryKeyword ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                        <Tag className="w-3 h-3 text-[#FF4B00]" />
                        {guide.seo.primaryKeyword}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 italic">No keyword set</span>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      SEO Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full ${
                            audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${audit.score}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          audit.score >= 80
                            ? 'text-emerald-600'
                            : audit.score >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {audit.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 2. DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Type</th>
                <th className="p-4">Page Title & URL</th>
                <th className="p-4">Focus Keyword</th>
                <th className="p-4">SEO Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {/* Render Core Website Pages */}
              {(contentType === 'all' || contentType === 'site-pages') &&
                filteredSitePages.map((sitePage) => {
                  const audit = calculateSeoAudit(
                    sitePage.pageName,
                    sitePage.metaTitle,
                    sitePage.metaDescription,
                    sitePage.focusKeyword
                  );

                  return (
                    <tr key={`desktop-site-page-${sitePage.id}`} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <Layout className="w-3 h-3" />
                          Website Page
                        </span>
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {sitePage.ogImage ? (
                            <img
                              src={sitePage.ogImage}
                              alt="Social OG"
                              className="w-11 h-8 rounded-lg object-cover border border-stone-200 shrink-0 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-300 shrink-0" title="No social share image">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 flex items-center gap-1.5 truncate">
                              <span>{sitePage.pageName}</span>
                              {sitePage.id === 'home' && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded shrink-0">
                                  Main Storefront
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-stone-400 mt-0.5 truncate">
                              {sitePage.canonicalUrl}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {sitePage.focusKeyword ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                            <Tag className="w-3 h-3 text-[#FF4B00]" />
                            {sitePage.focusKeyword}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">No keyword set</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${audit.score}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              audit.score >= 80
                                ? 'text-emerald-600'
                                : audit.score >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {audit.score}/100
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingSitePage(sitePage)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FF4B00] bg-[#FF4B00]/10 hover:bg-[#FF4B00]/20 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit SEO
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {/* Render Custom Pages */}
              {(contentType === 'all' || contentType === 'custom-pages') &&
                filteredCustomPages.map((page) => {
                  const pageKw = page.seo?.focusKeyword || '';
                  const audit = calculateSeoAudit(page.title, page.seo?.metaTitle, page.seo?.metaDescription, pageKw);

                  return (
                    <tr key={`desktop-page-${page.id}`} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                          <Layers className="w-3 h-3" />
                          Custom Page
                        </span>
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {(page.seo?.ogImage || page.heroImage) ? (
                            <img
                              src={page.seo?.ogImage || page.heroImage}
                              alt="Social OG"
                              className="w-11 h-8 rounded-lg object-cover border border-stone-200 shrink-0 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-300 shrink-0" title="No social share image">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 line-clamp-1">{page.title}</div>
                            <div className="text-xs font-mono text-stone-400 mt-0.5 truncate">/page/{page.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {pageKw ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                            <Tag className="w-3 h-3 text-indigo-600" />
                            {pageKw}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">No keyword set</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${audit.score}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              audit.score >= 80 ? 'text-emerald-600' : audit.score >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}
                          >
                            {audit.score}/100
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingCustomPage(page)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit SEO
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {/* Render Posts (Guides) */}
              {(contentType === 'all' || contentType === 'posts') &&
                filteredGuides.map((guide) => {
                  const audit = calculateSeoAudit(
                    guide.title,
                    guide.seo?.metaTitle,
                    guide.seo?.metaDescription,
                    guide.seo?.primaryKeyword
                  );

                  return (
                    <tr key={`desktop-guide-${guide.id}`} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                          <FileText className="w-3 h-3" />
                          Post
                        </span>
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {(guide.seo?.ogImage || guide.featuredImage) ? (
                            <img
                              src={guide.seo?.ogImage || guide.featuredImage}
                              alt="Social OG"
                              className="w-11 h-8 rounded-lg object-cover border border-stone-200 shrink-0 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-300 shrink-0" title="No social share image">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 line-clamp-1">{guide.title}</div>
                            <div className="text-xs font-mono text-stone-400 mt-0.5 truncate">/guides/{guide.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {guide.seo?.primaryKeyword ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                            <Tag className="w-3 h-3 text-[#FF4B00]" />
                            {guide.seo.primaryKeyword}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">No keyword set</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${audit.score}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              audit.score >= 80
                                ? 'text-emerald-600'
                                : audit.score >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {audit.score}/100
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingGuide(guide)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FF4B00] bg-[#FF4B00]/10 hover:bg-[#FF4B00]/20 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit SEO
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

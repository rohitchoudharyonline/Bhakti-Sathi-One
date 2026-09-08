import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Search, Save, Edit3, X, Globe, Tag, CheckCircle2, AlertTriangle, XCircle, Share2, Sparkles, FileText, Layers } from 'lucide-react';
import { GuideArticle } from '../../types/guide';
import { CustomPage } from '../../types/cms';

export const SEOManager: React.FC = () => {
  const { guides, updateGuide, customPages, updateCustomPage } = useTours();
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState<'all' | 'posts' | 'pages'>('all');
  
  const [editingGuide, setEditingGuide] = useState<GuideArticle | null>(null);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  // Filter items
  const filteredGuides = guides.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPages = customPages.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveGuideSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      updateGuide(editingGuide);
      setEditingGuide(null);
    }
  };

  const handleSavePageSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updateCustomPage(editingPage);
      setEditingPage(null);
    }
  };

  // SEO Score & Audit helper
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
        label: 'SEO Title Length (40 - 60 chars)',
        status: activeTitle.length >= 35 && activeTitle.length <= 65 ? 'pass' : activeTitle.length > 0 ? 'warn' : 'fail',
        message: activeTitle ? `${activeTitle.length} characters` : 'Title is missing',
      },
      {
        id: 'desc_len',
        label: 'Meta Description Length (120 - 160 chars)',
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

  // 1. EDITING A GUIDE POST SEO
  if (editingGuide) {
    const seoData = editingGuide.seo || {
      metaTitle: editingGuide.title,
      metaDescription: editingGuide.excerpt || '',
      primaryKeyword: '',
      secondaryKeywords: [],
      canonicalUrl: `https://mybhaktisathi.com/guides/${editingGuide.slug}`,
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
                  <span>https://mybhaktisathi.com</span>
                  <span>›</span>
                  <span>guides</span>
                  <span>›</span>
                  <span className="font-semibold">{editingGuide.slug}</span>
                </div>
                <div className="text-[#1a0dab] text-base sm:text-lg font-medium cursor-pointer hover:underline line-clamp-2">
                  {seoData.metaTitle || editingGuide.title} | Bhakti Sathi
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
                  placeholder="https://mybhaktisathi.com/guides/your-post-slug"
                />
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
                  Yoast / Rank Math Audit Score
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

  // 2. EDITING A CUSTOM PAGE SEO
  if (editingPage) {
    const pageSeo = editingPage.seo || {
      focusKeyword: '',
      metaTitle: editingPage.title,
      metaDescription: '',
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#FF4B00]" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">Page SEO Editor</h2>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">Page: <span className="font-bold text-stone-900">{editingPage.title}</span></p>
          </div>
          <button
            type="button"
            onClick={() => setEditingPage(null)}
            className="p-2 text-stone-400 hover:text-stone-900 transition rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSavePageSeo} className="max-w-2xl bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 space-y-6 shadow-2xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Focus Keyword
            </label>
            <input
              type="text"
              value={pageSeo.focusKeyword || ''}
              onChange={(e) =>
                setEditingPage({
                  ...editingPage,
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
                setEditingPage({
                  ...editingPage,
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
                setEditingPage({
                  ...editingPage,
                  seo: { ...pageSeo, metaDescription: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00] resize-none"
              placeholder="Meta Description..."
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingPage(null)}
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

  // 3. SEO OVERVIEW TABLE & MOBILE CARDS
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#FF4B00]" />
            <h2 className="text-2xl font-black text-stone-900">Rank Math SEO Interface</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Manage SEO titles, descriptions, and keywords for all pages and posts.
          </p>
        </div>

        {/* Content Type Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setContentType('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition cursor-pointer ${
                contentType === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              All Content
            </button>
            <button
              type="button"
              onClick={() => setContentType('posts')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition cursor-pointer ${
                contentType === 'posts' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              Posts ({guides.length})
            </button>
            <button
              type="button"
              onClick={() => setContentType('pages')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition cursor-pointer ${
                contentType === 'pages' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              Pages ({customPages.length})
            </button>
          </div>

          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm bg-white outline-none focus:border-[#FF4B00]"
            />
          </div>
        </div>
      </div>

      {/* 1. MOBILE CARD VIEW (visible on small screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {/* Posts */}
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] bg-[#FF4B00] text-white text-xs font-bold rounded-xl active:bg-[#d43e00] transition cursor-pointer shadow-2xs"
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

        {/* Custom Pages */}
        {(contentType === 'all' || contentType === 'pages') &&
          filteredPages.map((page) => {
            const pageKw = page.seo?.focusKeyword || '';
            const score = pageKw && page.seo?.metaTitle && page.seo?.metaDescription ? 100 : page.seo?.metaTitle ? 60 : 30;

            return (
              <div
                key={`mobile-seo-page-${page.id}`}
                className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                    <Layers className="w-3 h-3" />
                    Page
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingPage(page)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] bg-indigo-600 text-white text-xs font-bold rounded-xl active:bg-indigo-700 transition cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit SEO
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-base leading-snug">{page.title}</h4>
                  <div className="text-xs font-mono text-stone-500 mt-1">/{page.slug}</div>
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
                            score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}
                      >
                        {score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 2. DESKTOP TABLE VIEW (visible on md screens and up) */}
      <div className="hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Type</th>
                <th className="p-4">Title & Slug</th>
                <th className="p-4">Focus Keyword</th>
                <th className="p-4">SEO Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
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
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-stone-900 line-clamp-1">{guide.title}</div>
                        <div className="text-xs font-mono text-stone-400 mt-0.5">/guides/{guide.slug}</div>
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

              {/* Render Custom Pages */}
              {(contentType === 'all' || contentType === 'pages') &&
                filteredPages.map((page) => {
                  const pageKw = page.seo?.focusKeyword || '';
                  const score = pageKw && page.seo?.metaTitle && page.seo?.metaDescription ? 100 : page.seo?.metaTitle ? 60 : 30;

                  return (
                    <tr key={`desktop-page-${page.id}`} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                          <Layers className="w-3 h-3" />
                          Page
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-stone-900 line-clamp-1">{page.title}</div>
                        <div className="text-xs font-mono text-stone-400 mt-0.5">/{page.slug}</div>
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
                                score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}
                          >
                            {score}/100
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingPage(page)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
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

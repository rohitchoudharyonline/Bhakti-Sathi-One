import React, { useState } from 'react';
import { Sparkles, Globe, Search, Link as LinkIcon, RefreshCw, Bot } from 'lucide-react';
import { generateAutoSEO, SEOData } from '../../utils/seoHelper';

interface CMSSEOEditorProps {
  type: 'destination' | 'temple' | 'package' | 'blog' | 'guide' | 'custom_page' | 'website_page';
  itemName: string;
  extraData?: {
    city?: string;
    state?: string;
    tagline?: string;
    price?: number;
    overview?: string;
  };
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
  slug?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  onChange: (field: string, value: string) => void;
  onApplyAll: (data: SEOData & { slug?: string; canonicalUrl?: string; ogTitle?: string; ogDescription?: string }) => void;
}

export const CMSSEOEditor: React.FC<CMSSEOEditorProps> = ({
  type,
  itemName,
  extraData,
  seoMetaTitle = '',
  seoMetaDescription = '',
  seoKeywords = '',
  slug = '',
  canonicalUrl = '',
  ogTitle = '',
  ogDescription = '',
  onChange,
  onApplyAll,
}) => {
  const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAutoGenerate = () => {
    if (!itemName || itemName.trim() === '') {
      alert('Please enter an Item / Page Name first before generating Auto SEO.');
      return;
    }
    const autoData = generateAutoSEO(type, itemName, extraData);
    const generatedSlug = (slug || itemName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    onApplyAll({
      ...autoData,
      slug: generatedSlug,
      canonicalUrl: canonicalUrl || `https://holidayshunt.com/${type}/${generatedSlug}`,
      ogTitle: autoData.seoMetaTitle,
      ogDescription: autoData.seoMetaDescription,
    });
  };

  const handleGeminiGenerate = async () => {
    if (!itemName || itemName.trim() === '') {
      alert('Please enter an Item / Page Name first before requesting Gemini SEO.');
      return;
    }
    setIsGeneratingGemini(true);
    setGeminiStatus('idle');

    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: itemName,
          destination: extraData?.state || extraData?.city || itemName,
          tagline: extraData?.tagline || '',
          overview: extraData?.overview || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate SEO with Gemini');

      const data = await response.json();

      onApplyAll({
        seoMetaTitle: data.seoTitle || `${itemName} Tour Packages | Holidays Hunt`,
        seoMetaDescription: data.metaDescription || `Book customized holiday packages for ${itemName} with Holidays Hunt. Verified stays, private cabs, 24/7 travel support.`,
        seoKeywords: data.keywords || `${itemName}, tour packages, holidays hunt`,
        slug: data.slug || itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        canonicalUrl: `https://holidayshunt.com/${type}/${data.slug || itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        ogTitle: data.ogTitle || data.seoTitle,
        ogDescription: data.ogDescription || data.metaDescription,
      });

      setGeminiStatus('success');
    } catch (err) {
      console.error('Gemini SEO error, applying smart local fallback:', err);
      handleAutoGenerate();
      setGeminiStatus('error');
    } finally {
      setIsGeneratingGemini(false);
    }
  };

  const generateCleanSlug = (text: string) => {
    const clean = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    onChange('slug', clean);
    if (!canonicalUrl) {
      onChange('canonicalUrl', `https://holidayshunt.com/${type}/${clean}`);
    }
  };

  const titleLength = seoMetaTitle.length;
  const descLength = seoMetaDescription.length;

  const currentSlug = slug || itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return (
    <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs">
      {/* SEO Generator Header Bar */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-stone-100 p-4 rounded-xl border border-orange-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4B00] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <span>SEO Management & AI Generator</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-[#FF4B00] border border-orange-200">
                Yoast & SERP Ready
              </span>
            </h4>
            <p className="text-xs text-stone-600 font-medium">
              Optimize titles, meta descriptions, slugs, canonical URLs, and Open Graph cards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gemini AI SEO Button */}
          <button
            type="button"
            onClick={handleGeminiGenerate}
            disabled={isGeneratingGemini}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isGeneratingGemini ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span>Generate SEO with Gemini</span>
          </button>

          {/* Quick 1-Click Button */}
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="px-3.5 py-2.5 bg-[#FF4B00] hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto Fill</span>
          </button>
        </div>
      </div>

      {geminiStatus === 'success' && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
          ✓ Gemini SEO metadata generated and applied successfully!
        </div>
      )}

      {/* Main Form Fields */}
      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>SEO Meta Title *</span>
              <span className="text-stone-400 font-normal">(Target: 30–60 characters)</span>
            </label>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                titleLength === 0
                  ? 'bg-stone-100 text-stone-500'
                  : titleLength >= 30 && titleLength <= 60
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : titleLength < 30
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {titleLength}/60 chars
            </span>
          </div>
          <input
            type="text"
            value={seoMetaTitle}
            onChange={(e) => onChange('seoMetaTitle', e.target.value)}
            placeholder={`e.g. ${itemName || 'Destination'} Tour Packages & Travel Guide | Holidays Hunt`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] focus:border-transparent text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>SEO Meta Description *</span>
              <span className="text-stone-400 font-normal">(Target: 120–160 characters)</span>
            </label>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                descLength === 0
                  ? 'bg-stone-100 text-stone-500'
                  : descLength >= 120 && descLength <= 160
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : descLength < 120
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {descLength}/160 chars
            </span>
          </div>
          <textarea
            rows={2}
            value={seoMetaDescription}
            onChange={(e) => onChange('seoMetaDescription', e.target.value)}
            placeholder="Book customized holiday & yatra tour packages with Holidays Hunt. Verified hotel stays, private cabs & 24/7 travel concierge."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] focus:border-transparent text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* Focus Keywords */}
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1.5">
            Focus Keywords (Comma Separated)
          </label>
          <input
            type="text"
            value={seoKeywords}
            onChange={(e) => onChange('seoKeywords', e.target.value)}
            placeholder="tour packages, holidays hunt, family travel, honeymoon specials"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] focus:border-transparent text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* URL Slug & Canonical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-stone-400" />
                <span>URL Slug</span>
              </label>
              <button
                type="button"
                onClick={() => generateCleanSlug(itemName || 'page')}
                className="text-[11px] font-bold text-[#FF4B00] hover:underline"
              >
                Auto-Generate Slug
              </button>
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
              placeholder={currentSlug}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] text-xs font-mono text-stone-800 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Canonical URL (Optional)
            </label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={(e) => onChange('canonicalUrl', e.target.value)}
              placeholder={`https://holidayshunt.com/${type}/${currentSlug}`}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] text-xs font-mono text-stone-800 bg-stone-50/50"
            />
          </div>
        </div>

        {/* OpenGraph Fields */}
        <div className="border-t border-stone-100 pt-3 mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              OpenGraph Title (Social Card)
            </label>
            <input
              type="text"
              value={ogTitle || seoMetaTitle}
              onChange={(e) => onChange('ogTitle', e.target.value)}
              placeholder={seoMetaTitle || `${itemName} | Holidays Hunt`}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              OpenGraph Description (Social Card)
            </label>
            <input
              type="text"
              value={ogDescription || seoMetaDescription}
              onChange={(e) => onChange('ogDescription', e.target.value)}
              placeholder={seoMetaDescription || 'Explore handcrafted travel packages.'}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50/50"
            />
          </div>
        </div>
      </div>

      {/* Google Live SERP Preview Box */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#FF4B00]" />
          <span>Live Google SERP Preview Box</span>
        </h5>

        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-sans space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate">https://holidayshunt.com › {type}s › {currentSlug}</span>
          </div>
          <h3 className="text-blue-700 text-base font-bold hover:underline cursor-pointer line-clamp-1 leading-snug">
            {seoMetaTitle || `${itemName || 'Page Title'} | Holidays Hunt`}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {seoMetaDescription ||
              'Book customized holiday and tour packages across India with Holidays Hunt. Verified hotels, private cabs & 24/7 concierge support.'}
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles, CheckCircle2, Globe, Search } from 'lucide-react';
import { generateAutoSEO, SEOData } from '../../utils/seoHelper';

interface CMSSEOEditorProps {
  type: 'destination' | 'temple' | 'package' | 'blog';
  itemName: string;
  extraData?: {
    city?: string;
    state?: string;
    tagline?: string;
    price?: number;
  };
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
  onChange: (field: 'seoMetaTitle' | 'seoMetaDescription' | 'seoKeywords', value: string) => void;
  onApplyAll: (data: SEOData) => void;
}

export const CMSSEOEditor: React.FC<CMSSEOEditorProps> = ({
  type,
  itemName,
  extraData,
  seoMetaTitle = '',
  seoMetaDescription = '',
  seoKeywords = '',
  onChange,
  onApplyAll,
}) => {
  const handleAutoGenerate = () => {
    if (!itemName || itemName.trim() === '') {
      alert('Please enter a Name first before generating Auto SEO.');
      return;
    }
    const autoData = generateAutoSEO(type, itemName, extraData);
    onApplyAll(autoData);
  };

  const titleLength = seoMetaTitle.length;
  const descLength = seoMetaDescription.length;

  return (
    <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs">
      {/* Auto SEO Generator Header Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-stone-100 p-4 rounded-xl border border-orange-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4B00] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <span>Auto SEO Generator</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-[#FF4B00] border border-orange-200">
                1-Click Optimized
              </span>
            </h4>
            <p className="text-xs text-stone-600 font-medium">
              Automatically creates Google-optimized Meta Title (&le;60 chars) and Meta Description (&le;130 chars).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoGenerate}
          className="px-4 py-2.5 bg-[#FF4B00] hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Auto SEO (Click to Generate)</span>
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>SEO Meta Title</span>
              <span className="text-stone-400 font-normal">(Target: max 60 characters)</span>
            </label>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                titleLength === 0
                  ? 'bg-stone-100 text-stone-500'
                  : titleLength <= 60
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
            placeholder={`e.g. ${itemName || 'Page'} Tour Packages & Yatra Guide | Bhakti Sathi`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] focus:border-transparent text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>SEO Meta Description</span>
              <span className="text-stone-400 font-normal">(Target: max 130 characters)</span>
            </label>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                descLength === 0
                  ? 'bg-stone-100 text-stone-500'
                  : descLength <= 130
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {descLength}/130 chars
            </span>
          </div>
          <textarea
            rows={2}
            value={seoMetaDescription}
            onChange={(e) => onChange('seoMetaDescription', e.target.value)}
            placeholder="Book customized pilgrimage tour packages with Bhakti Sathi. Verified hotels, private cabs & 24/7 yatra support."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] focus:border-transparent text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1.5">
            SEO Keywords (Comma Separated)
          </label>
          <input
            type="text"
            value={seoKeywords}
            onChange={(e) => onChange('seoKeywords', e.target.value)}
            placeholder="pilgrimage packages, yatra, temple darshan, Bhakti Sathi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#FF4B00] focus:border-transparent text-sm font-medium text-stone-900 bg-stone-50/50"
          />
        </div>
      </div>

      {/* Google Search Snippet Preview */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Google Search Result Preview</span>
        </h5>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 font-sans space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate">https://mybhaktisathi.com › {type}s</span>
          </div>
          <h3 className="text-blue-700 text-sm font-bold hover:underline cursor-pointer line-clamp-1">
            {seoMetaTitle || `${itemName || 'Page Title'} | Bhakti Sathi`}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {seoMetaDescription || 'Book customized sacred pilgrimage tour packages across India with Bhakti Sathi. Verified hotels, private vehicle transfers & 24/7 yatra support.'}
          </p>
        </div>
      </div>
    </div>
  );
};

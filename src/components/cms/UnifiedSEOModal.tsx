import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Globe,
  Check,
  AlertTriangle,
  X,
  Smartphone,
  Monitor,
  Eye,
  Tag,
  Compass,
  Layers,
  Image as ImageIcon,
  Share2,
  FolderOpen,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { TourPackage } from '../../types/tour';
import { DestinationMeta } from '../../data/destinationsData';
import { PageSeoConfig, BlogPost, CustomPage } from '../../types/cms';
import { UniversalImageUploader } from './UniversalImageUploader';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import { useTours } from '../../context/TourContext';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

export interface UnifiedSeoItem {
  id: string;
  itemType: 'tour' | 'page' | 'destination' | 'guide' | 'custom-page';
  name: string;
  slug?: string;
  path?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  // Tour-specific fields
  tourType?: string;
  destination?: string;
  duration?: string;
  tagline?: string;
  overview?: string;
}

interface UnifiedSEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: UnifiedSeoItem | null;
  onSave: (updatedItem: UnifiedSeoItem) => void;
}

const TOUR_TYPES = [
  'Family',
  'Honeymoon',
  'Pilgrimage',
  'Group',
  'Adventure',
  'Luxury',
  'Cultural',
  'Other',
];

export const UnifiedSEOModal: React.FC<UnifiedSEOModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [metaTitle, setMetaTitle] = useState(item.metaTitle || item.name || '');
  const [metaDescription, setMetaDescription] = useState(
    item.metaDescription || item.tagline || item.overview || ''
  );
  const [focusKeyword, setFocusKeyword] = useState(item.focusKeyword || '');
  const [canonicalUrl, setCanonicalUrl] = useState(() => {
    let url = item.canonicalUrl || '';
    if (!url) {
      if (item.itemType === 'page') {
        url = `https://holidayshunt.com${item.path || ''}`;
      } else if (item.itemType === 'tour') {
        url = `https://holidayshunt.com/tours/${item.slug || item.id}`;
      } else if (item.itemType === 'destination') {
        url = `https://holidayshunt.com/destination/${item.slug || item.id}`;
      } else if (item.itemType === 'guide') {
        url = `https://holidayshunt.com/guides/${item.slug || item.id}`;
      } else if (item.itemType === 'custom-page') {
        url = `https://holidayshunt.com/page/${item.slug || item.id}`;
      } else {
        url = `https://holidayshunt.com/${item.slug || ''}`;
      }
    }
    // Clean old domain
    return url.replace(/https?:\/\/([^/]*\.)?mybhaktisathi\.com/gi, 'https://holidayshunt.com');
  });

  const { mediaAssets } = useTours();
  const [tourType, setTourType] = useState(item.tourType || 'Family');
  const [ogTitle, setOgTitle] = useState(item.ogTitle || item.metaTitle || '');
  const [ogDescription, setOgDescription] = useState(item.ogDescription || item.metaDescription || '');
  const [ogImage, setOgImage] = useState(item.ogImage || '');
  const [noIndex, setNoIndex] = useState(item.noIndex || false);
  const [noFollow, setNoFollow] = useState(item.noFollow || false);

  const [previewTab, setPreviewTab] = useState<'google' | 'social'>('google');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [showR2Modal, setShowR2Modal] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync state if item changes
  useEffect(() => {
    if (item) {
      setMetaTitle(item.metaTitle || item.name || '');
      setMetaDescription(item.metaDescription || item.tagline || item.overview || '');
      setFocusKeyword(item.focusKeyword || '');
      setTourType(item.tourType || 'Family');
      setOgTitle(item.ogTitle || item.metaTitle || '');
      setOgDescription(item.ogDescription || item.metaDescription || '');
      setOgImage(item.ogImage || '');
      setNoIndex(item.noIndex || false);
      setNoFollow(item.noFollow || false);

      let url = item.canonicalUrl || '';
      if (!url) {
        if (item.itemType === 'page') url = `https://holidayshunt.com${item.path || ''}`;
        else if (item.itemType === 'tour') url = `https://holidayshunt.com/tours/${item.slug || item.id}`;
        else if (item.itemType === 'destination') url = `https://holidayshunt.com/destination/${item.slug || item.id}`;
        else if (item.itemType === 'guide') url = `https://holidayshunt.com/guides/${item.slug || item.id}`;
        else if (item.itemType === 'custom-page') url = `https://holidayshunt.com/page/${item.slug || item.id}`;
        else url = `https://holidayshunt.com/${item.slug || ''}`;
      }
      setCanonicalUrl(url.replace(/https?:\/\/([^/]*\.)?mybhaktisathi\.com/gi, 'https://holidayshunt.com'));
    }
  }, [item]);

  const handleAiOptimize = async () => {
    try {
      setGeneratingAi(true);
      setAiError(null);

      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: item.itemType === 'tour' ? 'tour package' : item.itemType,
          title: item.name,
          destination: item.destination || item.name,
          tagline: item.tagline || '',
          overview: item.overview || metaDescription || '',
        }),
      });

      if (!res.ok) throw new Error('AI SEO generation unavailable');

      const data = await res.json();
      if (data.seoTitle) setMetaTitle(data.seoTitle);
      if (data.metaDescription) setMetaDescription(data.metaDescription);
      if (data.keywords) setFocusKeyword(data.keywords.split(',')[0].trim());
      if (data.ogTitle) setOgTitle(data.ogTitle);
      if (data.ogDescription) setOgDescription(data.ogDescription);
    } catch (err: any) {
      console.warn('AI optimize error:', err);
      setAiError('Could not connect to Gemini AI. Using smart defaults.');
      // Smart deterministic fallback
      const smartTitle = `${item.name} | Holidays Hunt`;
      const smartDesc = `Explore ${item.name} with Holidays Hunt. Customized packages, verified hotels, private cabs, and 24/7 on-tour assistance.`;
      setMetaTitle(smartTitle.slice(0, 60));
      setMetaDescription(smartDesc.slice(0, 160));
      setFocusKeyword(item.name.toLowerCase());
      setTimeout(() => setAiError(null), 4000);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      focusKeyword: focusKeyword.trim(),
      canonicalUrl: canonicalUrl.trim(),
      tourType: item.itemType === 'tour' ? tourType : undefined,
      ogTitle: ogTitle.trim() || metaTitle.trim(),
      ogDescription: ogDescription.trim() || metaDescription.trim(),
      ogImage: ogImage.trim(),
      noIndex,
      noFollow,
    });
    onClose();
  };

  // Live Score Calculator
  const titleLen = metaTitle.length;
  const descLen = metaDescription.length;
  const hasKeyword = focusKeyword.trim().length > 0;
  const keywordInTitle = hasKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase());
  const keywordInDesc = hasKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase());
  const hasImage = Boolean(ogImage && ogImage.trim().length > 0);

  let score = 0;
  if (titleLen >= 30 && titleLen <= 65) score += 25;
  else if (titleLen > 0) score += 15;
  if (descLen >= 110 && descLen <= 165) score += 25;
  else if (descLen > 0) score += 15;
  if (hasKeyword) score += 15;
  if (keywordInTitle) score += 15;
  if (keywordInDesc) score += 10;
  if (hasImage) score += 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-black uppercase tracking-wider">
                {item.itemType.replace('-', ' ')}
              </span>
              {item.itemType === 'tour' && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#9b0000]/10 text-[#9b0000] border border-[#9b0000]/20 text-[10px] font-black uppercase tracking-wider">
                  {tourType} Tour
                </span>
              )}
              <span className="text-xs text-stone-400 font-mono">ID: {item.id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 line-clamp-1">
              SEO Editor: {item.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* SEO Health Score */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div
                className={`w-3 h-3 rounded-full ${
                  score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
              <span className="text-xs font-black text-stone-800">{score}/100</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Banner */}
          <div className="bg-gradient-to-r from-[#FDF2F2] via-amber-50/50 to-[#FDF2F2] border border-[#F5C2C2]/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#9b0000]">
                <Sparkles className="w-4 h-4" />
                Gemini AI Smart Assistant
              </div>
              <p className="text-stone-600 text-xs">
                Auto-generate click-worthy, search-optimized meta title, description, and keywords for Holidays Hunt.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAiOptimize}
              disabled={generatingAi}
              className="px-4 py-2 bg-[#9b0000] text-white text-xs font-extrabold rounded-xl hover:bg-[#7D0000] transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generatingAi ? 'Generating...' : '✨ Generate with Gemini'}
            </button>
          </div>

          {aiError && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Tour Type Selector (If Tour Package) */}
          {item.itemType === 'tour' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-black text-stone-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-[#9b0000]" />
                Tour Type Classification
              </label>
              <p className="text-stone-500 text-xs">
                Select the primary tour type so this package displays accurately in search filters and SEO schema.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {TOUR_TYPES.map((t) => {
                  const isSelected = tourType.toLowerCase() === t.toLowerCase();
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTourType(t)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#9b0000] text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {t} Tour
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview Card (Google Search & Social Share Preview Tabs) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Tab Selector: Google Search vs Social / WhatsApp */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab('google')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'google'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Search Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('social')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'social'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp &amp; Social Card</span>
                  {ogImage && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  )}
                </button>
              </div>

              {/* Sub-device toggle for Google preview */}
              {previewTab === 'google' && (
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded text-xs transition cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded text-xs transition cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Preview Display */}
            {previewTab === 'google' ? (
              /* Google Search Card */
              <div
                className={`p-4 rounded-xl border border-stone-200 bg-white font-sans ${
                  previewDevice === 'mobile' ? 'max-w-md mx-auto shadow-xs' : ''
                }`}
              >
                {previewDevice === 'mobile' ? (
                  /* Mobile Search Card with Rich Thumbnail */
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-[#9b0000] text-white flex items-center justify-center text-[9px] font-black">
                          H
                        </div>
                        <div className="text-[12px] text-stone-800 leading-tight">
                          <span className="font-semibold text-stone-900">Holidays Hunt</span>
                          <span className="text-stone-400 mx-1">›</span>
                          <span className="text-stone-500 text-[11px] font-mono truncate max-w-[150px] inline-block align-bottom">
                            {canonicalUrl || 'https://holidayshunt.com'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer line-clamp-2">
                        {metaTitle || `${item.name} | Holidays Hunt`}
                      </h3>

                      <p className="text-xs text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                        {metaDescription ||
                          `Explore ${item.name} with Holidays Hunt. Book verified luxury stays, expert local guidance, private cab transfers, and customized holiday packages.`}
                      </p>
                    </div>

                    {ogImage ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs mt-1">
                        <img
                          src={resolveDisplayImage(ogImage, mediaAssets)}
                          alt="SEO Thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, ogImage, mediaAssets)}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-stone-200 bg-stone-50 shrink-0 flex flex-col items-center justify-center text-[10px] text-stone-400 text-center p-1 mt-1">
                        <ImageIcon className="w-4 h-4 text-stone-300 mb-0.5" />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Desktop Search Card */
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-[#9b0000] text-white flex items-center justify-center text-[9px] font-black">
                        H
                      </div>
                      <div className="text-[12px] text-stone-800 leading-tight">
                        <span className="font-semibold text-stone-900">Holidays Hunt</span>
                        <span className="text-stone-400 mx-1">›</span>
                        <span className="text-stone-500 text-[11px] font-mono truncate max-w-[240px] inline-block align-bottom">
                          {canonicalUrl || 'https://holidayshunt.com'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer line-clamp-2">
                      {metaTitle || `${item.name} | Holidays Hunt`}
                    </h3>

                    <p className="text-xs text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                      {metaDescription ||
                        `Explore ${item.name} with Holidays Hunt. Book verified luxury stays, expert local guidance, private cab transfers, and customized holiday packages.`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* WhatsApp / Facebook / Twitter Card Preview */
              <div className="max-w-md mx-auto border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="relative aspect-[1.91/1] w-full bg-stone-900 overflow-hidden flex items-center justify-center">
                  {ogImage ? (
                    <img
                      src={resolveDisplayImage(ogImage, mediaAssets)}
                      alt="OpenGraph Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, ogImage, mediaAssets)}
                    />
                  ) : (
                    <div className="text-center p-6 text-stone-400 flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                      <div className="text-xs font-bold text-stone-300">No Social Image Set</div>
                      <div className="text-[11px] text-stone-400">
                        Upload or select an R2 image below to generate rich WhatsApp cards
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    WhatsApp &amp; Social Card (1200×630)
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 border-t border-stone-100 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                    holidayshunt.com
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                    {ogTitle || metaTitle || `${item.name} | Holidays Hunt`}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {ogDescription || metaDescription || 'Discover handpicked itineraries and luxury tours with Holidays Hunt.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Controls */}
          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">
                  Meta Title (Browser Tab &amp; Google Title) *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    titleLen >= 40 && titleLen <= 60
                      ? 'text-emerald-600'
                      : titleLen > 60
                      ? 'text-red-500'
                      : 'text-stone-400'
                  }`}
                >
                  {titleLen} / 60 characters {titleLen >= 40 && titleLen <= 60 ? '✓ Optimal' : ''}
                </span>
              </div>
              <input
                type="text"
                required
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Kashmir Paradise Luxury Houseboat Tour | Holidays Hunt"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#9b0000] font-medium"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">
                  Meta Description (Google Snippet Text) *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    descLen >= 120 && descLen <= 160
                      ? 'text-emerald-600'
                      : descLen > 160
                      ? 'text-red-500'
                      : 'text-stone-400'
                  }`}
                >
                  {descLen} / 160 characters {descLen >= 120 && descLen <= 160 ? '✓ Optimal' : ''}
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="e.g. Experience luxury shikara rides, Dal Lake houseboats, and scenic Gulmarg excursions with Holidays Hunt. 24/7 local support and verified stays."
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#9b0000] font-medium"
              />
            </div>

            {/* Focus Keyword & Canonical URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Primary Focus Keyword
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. kashmir tour package"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#9b0000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Canonical URL (Protected Domain)
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://holidayshunt.com/tours/..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#9b0000] font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* R2 Cloudflare Image System for SEO */}
            <div className="bg-stone-50/90 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200/80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#9b0000]" />
                    <label className="text-xs font-black text-stone-800 uppercase tracking-wider">
                      SEO &amp; OpenGraph Image (R2 Media Storage)
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      R2 Cloud Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Optimal 1200×630px (1.91:1). Used for Google mobile rich snippets, WhatsApp chat previews, Twitter Cards, and Facebook shares.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowR2Modal(true)}
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Browse R2 Media Library</span>
                  </button>

                  {ogImage && (
                    <button
                      type="button"
                      onClick={() => setOgImage('')}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Remove Current Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Universal Image Uploader with R2 auto-compression */}
              <UniversalImageUploader
                currentUrl={ogImage}
                onImageSelected={(url) => setOgImage(url)}
                folder="seo"
                defaultWidth={1200}
                defaultFormat="webp"
                label="Upload New Image to R2"
                description="Auto-optimizes format (WebP/JPG) and dimensions (1200px wide for crisp social cards), then syncs to Cloudflare R2 bucket."
                buttonLabel="Upload &amp; Auto-Compress to R2"
                showR2LibraryPicker={true}
              />

              {/* Active Image Details Badge */}
              {ogImage && (
                <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={resolveDisplayImage(ogImage, mediaAssets)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, ogImage, mediaAssets)}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-stone-800 truncate">
                        Active SEO Image (1200×630 optimal)
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 truncate">
                        {ogImage}
                      </div>
                    </div>
                  </div>
                  <a
                    href={resolveDisplayImage(ogImage, mediaAssets)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-stone-400 hover:text-stone-600 rounded"
                    title="View Full Size Image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Indexing & Social Tags Accordion/Options */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!noIndex}
                  onChange={(e) => setNoIndex(!e.target.checked)}
                  className="rounded text-[#9b0000] focus:ring-[#9b0000]"
                />
                <span className="font-bold text-stone-700">Allow search engines to index this page (Index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!noFollow}
                  onChange={(e) => setNoFollow(!e.target.checked)}
                  className="rounded text-[#9b0000] focus:ring-[#9b0000]"
                />
                <span className="font-bold text-stone-700">Follow links on this page (Follow)</span>
              </label>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#9b0000] text-white text-xs font-black rounded-xl hover:bg-[#7D0000] transition cursor-pointer shadow-xs active:scale-98"
            >
              Save SEO Changes
            </button>
          </div>
        </form>
      </div>

      {/* R2 Media Catalog Modal */}
      {showR2Modal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-stone-900 text-sm">Select Image from R2 Media Catalog</span>
              </div>
              <button
                type="button"
                onClick={() => setShowR2Modal(false)}
                className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MediaR2StorageManager
                isModal={true}
                onCloseModal={() => setShowR2Modal(false)}
                onSelectMedia={(url) => {
                  setOgImage(url);
                  setShowR2Modal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

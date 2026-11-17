import React, { useState, useMemo, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { GuideArticle, GuideFaq, GuideSeo, GuideStatus } from '../../types/guide';
import { analyzeOnPageSeo } from '../../utils/seoEngine';
import { UniversalImageUploader } from './UniversalImageUploader';
import { WordPressInlineImageModal } from './WordPressInlineImageModal';
import { CMSSEOEditor } from './CMSSEOEditor';
import {
  ArrowLeft,
  Save,
  Send,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Globe,
  Eye,
  Edit3,
  HelpCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Code,
  FileText,
  Tag,
  MapPin,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  Minus,
  Table as TableIcon,
  RefreshCw,
  Info,
} from 'lucide-react';

interface GuideEditorProps {
  initialGuide?: GuideArticle | null;
  onSave: (guide: GuideArticle) => void;
  onBack: () => void;
}

export const GuideEditor: React.FC<GuideEditorProps> = ({
  initialGuide,
  onSave,
  onBack,
}) => {
  const { guideCategories, packages } = useTours();

  // Form State
  const [title, setTitle] = useState(initialGuide?.title || '');
  const [slug, setSlug] = useState(initialGuide?.slug || '');
  const [category, setCategory] = useState(initialGuide?.category || '');
  const [destination, setDestination] = useState(initialGuide?.destination || 'Himachal Pradesh');
  const [excerpt, setExcerpt] = useState(initialGuide?.excerpt || '');
  const [content, setContent] = useState(initialGuide?.content || '');
  const [featuredImage, setFeaturedImage] = useState(
    initialGuide?.featuredImage ||
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
  );
  const [imageAlt, setImageAlt] = useState(initialGuide?.imageAlt || '');
  const [status, setStatus] = useState<GuideStatus>(initialGuide?.status || 'draft');
  const [authorName, setAuthorName] = useState(
    initialGuide?.authorName || 'Holidays Hunt Yatra Team'
  );
  const [relatedPackageIds, setRelatedPackageIds] = useState<string[]>(
    initialGuide?.relatedPackageIds || []
  );

  // SEO State
  const [metaTitle, setMetaTitle] = useState(initialGuide?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(
    initialGuide?.seo?.metaDescription || ''
  );
  const [primaryKeyword, setPrimaryKeyword] = useState(
    initialGuide?.seo?.primaryKeyword || ''
  );
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(
    initialGuide?.seo?.secondaryKeywords || []
  );
  const [canonicalUrl, setCanonicalUrl] = useState(initialGuide?.seo?.canonicalUrl || '');
  const [ogTitle, setOgTitle] = useState(initialGuide?.seo?.ogTitle || '');
  const [ogDescription, setOgDescription] = useState(initialGuide?.seo?.ogDescription || '');
  const [ogImage, setOgImage] = useState(initialGuide?.seo?.ogImage || '');
  const [newSecondaryKeyword, setNewSecondaryKeyword] = useState('');

  // FAQs State
  const [faqs, setFaqs] = useState<GuideFaq[]>(initialGuide?.faqs || []);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // UI Active Sub-tab
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faqs' | 'settings'>('content');
  const [previewMode, setPreviewMode] = useState(false);
  const [showWpImgModal, setShowWpImgModal] = useState(false);

  // AI Loading states
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isGeneratingFaqs, setIsGeneratingFaqs] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  // Auto-slug generator from title if slug is untouched
  const generateSlugFromTitle = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 75);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialGuide || !slug) {
      setSlug(generateSlugFromTitle(val));
    }
  };

  // Word count & reading time
  const wordCount = useMemo(() => {
    const raw = content.replace(/<[^>]*>/g, ' ').replace(/[#*`_\[\]()]/g, ' ');
    return raw.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }, [content]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Live SEO Audit
  const seoAudit = useMemo(() => {
    return analyzeOnPageSeo({
      title,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      slug,
      content,
      focusKeyword: primaryKeyword,
      featuredImage,
      imageAlt,
    });
  }, [title, metaTitle, metaDescription, excerpt, slug, content, primaryKeyword, featuredImage, imageAlt]);

  // Markdown Toolbar helper
  const insertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = document.getElementById('guide-content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // AI Content Generator
  const handleAiGenerateArticle = async () => {
    if (!title.trim() && !destination.trim()) {
      setAiError('Please enter a guide title or destination before generating.');
      return;
    }

    setIsGeneratingArticle(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const res = await fetch('/api/generate-guide-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title || `${destination} Travel Guide`,
          destination,
          category,
          contextNotes: excerpt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate article with AI');
      }

      const data = await res.json();
      if (data.title && !title) setTitle(data.title);
      if (data.slug && !slug) setSlug(data.slug);
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.content) setContent(data.content);

      // AI-generated content MUST strictly remain DRAFT per project rules!
      setStatus('draft');

      setAiSuccess('Article generated successfully! Saved in Draft mode for editorial review.');
    } catch (err: any) {
      setAiError(err.message || 'Error generating article');
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  // AI SEO Generator
  const handleAiGenerateSeo = async () => {
    if (!title.trim()) {
      setAiError('Please enter a title before generating SEO metadata.');
      return;
    }

    setIsGeneratingSeo(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const res = await fetch('/api/generate-guide-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          destination,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate SEO metadata');
      }

      const data = await res.json();
      if (data.metaTitle) setMetaTitle(data.metaTitle.slice(0, 60));
      if (data.metaDescription) setMetaDescription(data.metaDescription.slice(0, 130));
      if (data.primaryKeyword) setPrimaryKeyword(data.primaryKeyword);
      if (data.secondaryKeywords && Array.isArray(data.secondaryKeywords)) {
        setSecondaryKeywords(data.secondaryKeywords);
      }
      if (data.slug && !slug) setSlug(data.slug);

      setAiSuccess('SEO metadata optimized (Title <= 60 chars, Description <= 130 chars).');
    } catch (err: any) {
      setAiError(err.message || 'Error generating SEO');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  // AI FAQs Generator
  const handleAiGenerateFaqs = async () => {
    if (!content.trim() && !title.trim()) {
      setAiError('Please write or generate guide content first.');
      return;
    }

    setIsGeneratingFaqs(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const res = await fetch('/api/generate-guide-faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          destination,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate FAQs');
      }

      const data = await res.json();
      if (Array.isArray(data.faqs) && data.faqs.length > 0) {
        setFaqs(data.faqs);
        setAiSuccess(`Generated ${data.faqs.length} structured yatra FAQs.`);
      }
    } catch (err: any) {
      setAiError(err.message || 'Error generating FAQs');
    } finally {
      setIsGeneratingFaqs(false);
    }
  };

  // Add custom FAQ
  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Secondary Keyword
  const handleAddSecondaryKeyword = () => {
    if (!newSecondaryKeyword.trim()) return;
    const clean = newSecondaryKeyword.trim().toLowerCase();
    if (!secondaryKeywords.includes(clean)) {
      setSecondaryKeywords((prev) => [...prev, clean]);
    }
    setNewSecondaryKeyword('');
  };

  const handleRemoveSecondaryKeyword = (kw: string) => {
    setSecondaryKeywords((prev) => prev.filter((k) => k !== kw));
  };

  // Save Guide handler
  const handleSave = (targetStatus?: GuideStatus) => {
    if (!title.trim()) {
      setAiError('Please provide a title for the guide.');
      return;
    }

    const cleanSlug = (slug || generateSlugFromTitle(title)).toLowerCase().trim();
    const finalStatus = targetStatus || status;

    const updatedGuide: GuideArticle = {
      id: initialGuide?.id || `guide-${Date.now()}`,
      title: title.trim(),
      slug: cleanSlug,
      excerpt: excerpt.trim(),
      content,
      category,
      destination,
      featuredImage: featuredImage.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      status: finalStatus,
      authorName: authorName.trim() || 'Holidays Hunt Yatra Team',
      readingTimeMinutes: readingTime,
      wordCount,
      relatedPackageIds,
      seo: {
        metaTitle: metaTitle.trim() || title.trim(),
        metaDescription: metaDescription.trim() || excerpt.trim(),
        primaryKeyword: primaryKeyword.trim(),
        secondaryKeywords,
        canonicalUrl: canonicalUrl.trim() || `https://holidayshunt.com/guides/${cleanSlug}`,
        ogTitle: ogTitle.trim() || undefined,
        ogDescription: ogDescription.trim() || undefined,
        ogImage: ogImage.trim() || undefined,
      },
      faqs,
      createdAt: initialGuide?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt:
        finalStatus === 'published'
          ? initialGuide?.publishedAt || new Date().toISOString()
          : initialGuide?.publishedAt,
    };

    onSave(updatedGuide);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Top Workflow Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
            title="Back to Guides"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {initialGuide ? 'Edit Guide' : 'New Guide'}
              </span>
              {status === 'published' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Published
                </span>
              )}
              {status === 'review' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  In Review
                </span>
              )}
              {status === 'draft' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Draft
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-stone-900 truncate max-w-xs sm:max-w-md">
              {title || 'Untitled Guide'}
            </h2>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Save Draft */}
          <button
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-stone-500" />
            <span>Save Draft</span>
          </button>

          {/* Move to Review */}
          {status !== 'review' && status !== 'published' && (
            <button
              onClick={() => handleSave('review')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Submit to Review</span>
            </button>
          )}

          {/* Unpublish option if currently published */}
          {status === 'published' && (
            <button
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition cursor-pointer"
              title="Convert back to draft status"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Unpublish</span>
            </button>
          )}

          {/* Publish / Update Live Button */}
          <button
            onClick={() => handleSave('published')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{status === 'published' ? 'Update & Publish Live' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* AI Success / Error Banner */}
      {aiSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{aiSuccess}</span>
        </div>
      )}
      {aiError && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* AI Copilot Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-4 sm:p-5 rounded-2xl border border-amber-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Pilgrimage Content Copilot</span>
          </div>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
            Draft Safeguard Active
          </span>
        </div>
        <p className="text-xs text-stone-600">
          Use Gemini to craft rich, respectful guides with local darshan tips, SEO metadata, and FAQ schema.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleAiGenerateArticle}
            disabled={isGeneratingArticle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            {isGeneratingArticle ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            )}
            <span>{isGeneratingArticle ? 'Generating Article...' : '✨ Generate Full Article'}</span>
          </button>

          <button
            onClick={handleAiGenerateSeo}
            disabled={isGeneratingSeo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 text-amber-900 bg-white hover:bg-amber-50 disabled:opacity-50 text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            {isGeneratingSeo ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{isGeneratingSeo ? 'Optimizing SEO...' : '✨ Generate SEO & Meta'}</span>
          </button>

          <button
            onClick={handleAiGenerateFaqs}
            disabled={isGeneratingFaqs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 text-amber-900 bg-white hover:bg-amber-50 disabled:opacity-50 text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            {isGeneratingFaqs ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{isGeneratingFaqs ? 'Generating FAQs...' : '✨ Generate FAQs'}</span>
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-stone-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Article Content</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'seo'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO & Metadata</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              seoAudit.score >= 80
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {seoAudit.score}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs Schema ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Related Tours & Settings</span>
        </button>
      </div>

      {/* TAB 1: ARTICLE CONTENT */}
      {activeTab === 'content' && (
        <div className="space-y-5">
          {/* Core Fields Grid */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Guide Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Complete 9 Devi Darshan Yatra Guide: Route, Timings & Essential Tips"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Slug *</label>
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
                  <span className="text-stone-400 select-none">/guide/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(generateSlugFromTitle(e.target.value))}
                    placeholder="9-devi-yatra-guide"
                    className="w-full bg-transparent text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                >
                  {guideCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Destination / State</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Himachal Pradesh, Kashmir"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Summary / Excerpt (Used in search cards and meta snippet)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="2-3 crisp sentences introducing the sacred destination and what the traveler will learn..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-700 block">Featured Cover Image (R2 / Cloud Catalog)</label>
              <UniversalImageUploader
                label="Upload Guide Cover"
                description="Compresses to R2 Cloudflare with custom dimension & format"
                folder="guides"
                defaultWidth={1200}
                defaultFormat="webp"
                currentUrl={featuredImage}
                onImageSelected={(url) => setFeaturedImage(url)}
              />

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-stone-700">Image Alt Text (Crucial for Google Image SEO)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Holy Darshan of Mata Vaishno Devi Bhawan in Katra"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Markdown Toolbar & Content Area */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 border-b border-stone-200 bg-stone-50/70 gap-2">
              <div className="flex flex-wrap items-center gap-1 text-stone-600">
                <button
                  type="button"
                  onClick={() => setShowWpImgModal(true)}
                  className="px-2.5 py-1 bg-[#9b0000] hover:bg-[#7D0000] text-white rounded-lg text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-xs mr-1"
                  title="WordPress-style inline image builder (Upload to R2, set alignment & caption)"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-white" />
                  <span>📷 Add Photo</span>
                </button>
                <span className="w-px h-4 bg-stone-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ', '\n', 'Heading 2')}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-xs font-bold"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ', '\n', 'Heading 3')}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-xs font-bold"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-stone-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**', 'bold text')}
                  className="p-1.5 rounded-lg hover:bg-stone-200"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*', 'italic text')}
                  className="p-1.5 rounded-lg hover:bg-stone-200"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-stone-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ', '\n', 'List item')}
                  className="p-1.5 rounded-lg hover:bg-stone-200"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('1. ', '\n', 'Ordered item')}
                  className="p-1.5 rounded-lg hover:bg-stone-200"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ', '\n', 'Important note or quote')}
                  className="p-1.5 rounded-lg hover:bg-stone-200"
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('\n---\n\n', '', '')}
                  className="p-1.5 rounded-lg hover:bg-stone-200"
                  title="Horizontal Rule"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>~{readingTime} min read</span>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
                    previewMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{previewMode ? 'Edit Raw' : 'Live Preview'}</span>
                </button>
              </div>
            </div>

            {/* Editor vs Preview */}
            {previewMode ? (
              <div className="p-6 prose prose-stone max-w-none min-h-[400px]">
                {content ? (
                  <div className="space-y-4 text-stone-800 leading-relaxed">
                    {content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={idx} className="text-xl font-bold text-stone-900 pt-3">
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-base font-bold text-stone-900 pt-2">
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (paragraph.startsWith('> ')) {
                        return (
                          <blockquote
                            key={idx}
                            className="border-l-4 border-amber-500 pl-4 italic text-stone-700 my-2"
                          >
                            {paragraph.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return (
                        <p key={idx} className="text-sm">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">No content written yet...</p>
                )}
              </div>
            ) : (
              <textarea
                id="guide-content-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder="Write your comprehensive guide in Markdown... (Use ## Headings to automatically create an interactive Table of Contents for devotees!)"
                className="w-full p-4 text-sm font-mono text-stone-800 focus:outline-none resize-y leading-relaxed"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="space-y-5">
          {/* Google Search Snippet Preview */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">Google Search Snippet Preview</span>
              <span className="text-[11px] text-stone-400">Real-time Serp Rendering</span>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 max-w-2xl flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800">Holidays Hunt</span>
                  <span>›</span>
                  <span>guide</span>
                  <span>›</span>
                  <span className="text-stone-500 font-mono text-[11px]">{slug || 'article-slug'}</span>
                </div>
                <h4 className="text-base sm:text-lg font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1">
                  {metaTitle || title || 'Guide Title Preview'}
                </h4>
                <p className="text-xs text-stone-600 line-clamp-2">
                  {metaDescription || excerpt || 'Guide meta description preview will appear here on Google searches.'}
                </p>
              </div>
              {(ogImage || featuredImage) && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                  <img src={ogImage || featuredImage} alt="SEO preview thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* 1-Click Auto SEO Editor */}
          <CMSSEOEditor
            type="guide"
            itemName={title || 'Travel Guide'}
            extraData={{ city: destination, state: destination }}
            seoMetaTitle={metaTitle}
            seoMetaDescription={metaDescription}
            seoKeywords={primaryKeyword}
            canonicalUrl={canonicalUrl}
            ogTitle={ogTitle}
            ogDescription={ogDescription}
            ogImage={ogImage}
            defaultFallbackImage={featuredImage}
            onChange={(field, val) => {
              if (field === 'seoMetaTitle') setMetaTitle(val);
              if (field === 'seoMetaDescription') setMetaDescription(val);
              if (field === 'seoKeywords') setPrimaryKeyword(val);
              if (field === 'canonicalUrl') setCanonicalUrl(val);
              if (field === 'ogTitle') setOgTitle(val);
              if (field === 'ogDescription') setOgDescription(val);
              if (field === 'ogImage') setOgImage(val);
            }}
            onApplyAll={(seoData) => {
              setMetaTitle(seoData.seoMetaTitle);
              setMetaDescription(seoData.seoMetaDescription);
              setPrimaryKeyword(seoData.seoKeywords);
              if (seoData.ogTitle !== undefined) setOgTitle(seoData.ogTitle);
              if (seoData.ogDescription !== undefined) setOgDescription(seoData.ogDescription);
              if (seoData.ogImage !== undefined) setOgImage(seoData.ogImage);
            }}
          />

          {/* Secondary Keywords Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-black text-stone-700 uppercase tracking-wider">Secondary LSI Keywords</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Add helper keywords to assist search engines in contextualizing your guide's contents.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSecondaryKeyword}
                onChange={(e) => setNewSecondaryKeyword(e.target.value)}
                placeholder="e.g. patnitop climate, patnitop hotel deals"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSecondaryKeyword();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSecondaryKeyword}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition"
              >
                Add
              </button>
            </div>

            {/* Secondary Keyword Badges */}
            {secondaryKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {secondaryKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSecondaryKeyword(kw)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* On-Page SEO Checklist Audit */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">On-Page SEO Audit Score</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  seoAudit.score >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {seoAudit.score} / 100 Score
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {seoAudit.checks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 text-xs"
                >
                  {check.status === 'pass' && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {check.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  {check.status === 'fail' && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-stone-800">{check.label}: </span>
                    <span className="text-stone-600">{check.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQS SCHEMA */}
      {activeTab === 'faqs' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Guide FAQs & Schema.org Markup</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Frequently asked questions automatically generate Google FAQPage JSON-LD schema.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiGenerateFaqs}
                disabled={isGeneratingFaqs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-Generate FAQs</span>
              </button>
            </div>

            {/* Add FAQ form */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-700">Add New FAQ</span>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question (e.g. What is the best time to visit Vaishno Devi?)"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
              />
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={2}
                placeholder="Detailed and informative answer for pilgrims..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFaq}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-black disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
              >
                Add FAQ
              </button>
            </div>

            {/* FAQs List */}
            {faqs.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">
                No FAQs added yet. Use &quot;Auto-Generate FAQs&quot; or add them manually above.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-stone-200 bg-white space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-stone-900">
                        Q{index + 1}: {faq.question}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RELATED TOURS & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Related Tour Packages Call-To-Action</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Select tour packages to showcase at the bottom and sidebar of this guide for booking inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {packages.map((pkg) => {
                const isSelected = relatedPackageIds.includes(pkg.id);
                return (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => {
                      if (isSelected) {
                        setRelatedPackageIds((prev) => prev.filter((id) => id !== pkg.id));
                      } else {
                        setRelatedPackageIds((prev) => [...prev, pkg.id]);
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                      <img
                        src={pkg.coverImage}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-800 truncate">
                          {pkg.durationDays}D / {pkg.durationNights}N
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate">{pkg.title}</h4>
                      <p className="text-[11px] text-stone-500">{pkg.destination}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Author & Publisher Details</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Author Display Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Holidays Hunt Yatra Team"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* WordPress Style Inline Image Tool Modal */}
      <WordPressInlineImageModal
        isOpen={showWpImgModal}
        onClose={() => setShowWpImgModal(false)}
        onInsertImage={(snippet) => insertMarkdown(snippet, '', '')}
        folder="guides"
      />
    </div>
  );
};

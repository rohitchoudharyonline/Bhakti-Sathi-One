import React, { useState, useRef, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { BlogPost, BlogCategory, MediaAsset } from '../../types/cms';
import { analyzeOnPageSeo, generateBlogPostingSchema } from '../../utils/seoEngine';
import { compressAndProcessImage, uploadToR2 } from '../../utils/imageCompressor';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import { UniversalImageUploader } from './UniversalImageUploader';
import { WordPressInlineImageModal } from './WordPressInlineImageModal';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import {
  FileText,
  Eye,
  Check,
  ArrowLeft,
  UploadCloud,
  FileImage,
  Sparkles,
  Folder,
  Tag,
  User,
  Globe,
  Code,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Monitor,
  Smartphone,
  RefreshCw,
  Zap,
  Plus,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Table,
  Link,
  Layers,
  Heading2,
  Heading3,
  Calendar,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sliders,
  HardDrive,
  Copy,
  Save,
} from 'lucide-react';

const POPULAR_TAGS = [
  'Kashmir',
  'Gulmarg',
  'Pahalgam',
  'Dal Lake',
  'Sonmarg',
  'Snowfall',
  'Houseboat',
  'Honeymoon',
  'Budget Travel',
  'Family Vacation',
  'Ladakh',
  'Himachal',
  'Trekking',
  'Shikara',
  'Local Food',
  'Winter Season',
  'Tulip Festival',
  'Vaishno Devi',
];

interface PostEditorProps {
  initialPost?: BlogPost | null;
  onSaveComplete: (savedPost: BlogPost) => void;
  onCancel: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  onSaveComplete,
  onCancel,
}) => {
  const {
    blogCategories,
    addBlogPost,
    updateBlogPost,
    addBlogCategory,
    addMediaAsset,
    mediaAssets,
    cloudStorageSettings,
    agencySettings,
    navigateToBlogPost,
  } = useTours();

  // Active Editor Sub-Tab
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'preview' | 'seo' | 'schema' | 'media'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [serpPreviewMode, setSerpPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Media Pick Modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showWpImgModal, setShowWpImgModal] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<'featured' | 'inline'>('featured');

  // Inline Category Creator Modal
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatDesc, setInlineCatDesc] = useState('');

  // Automated R2 Compression States
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingInline, setIsCompressingInline] = useState(false);
  const [coverCompressionStats, setCoverCompressionStats] = useState<{
    originalKb: number;
    compressedKb: number;
    savingsPercent: number;
    format: string;
    dimensions?: { width: number; height: number };
    storagePath?: string;
  } | null>(null);

  const [inlineUploadNotice, setInlineUploadNotice] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // File Input References
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    featuredImageAlt: string;
    category: string;
    categorySlug: string;
    tags: string;
    authorName: string;
    authorRole: string;
    authorAvatar: string;
    status: 'published' | 'draft';
    focusKeyword: string;
    metaTitle: string;
    metaDescription: string;
    schemaType: 'BlogPosting' | 'Article';
    isFeatured: boolean;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageAlt: '',
    category: blogCategories[0]?.name || 'Kashmir Travel Guides',
    categorySlug: blogCategories[0]?.slug || 'kashmir-travel-guides',
    tags: 'Kashmir, Travel Guide, Snow, Houseboat',
    authorName: 'Bhakti Sathi Editorial Team',
    authorRole: 'Senior Travel Specialist',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'published',
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
    schemaType: 'BlogPosting',
    isFeatured: false,
  });

  // Populate initial post data or default template
  useEffect(() => {
    if (initialPost) {
      setFormData({
        id: initialPost.id,
        title: initialPost.title || '',
        slug: initialPost.slug || '',
        excerpt: initialPost.excerpt || '',
        content: initialPost.content || '',
        featuredImage: initialPost.featuredImage || '',
        featuredImageAlt: initialPost.featuredImageAlt || '',
        category: initialPost.category || blogCategories[0]?.name || 'Travel Guides',
        categorySlug: initialPost.categorySlug || blogCategories[0]?.slug || 'travel-guides',
        tags: initialPost.tags?.join(', ') || '',
        authorName: initialPost.author?.name || 'Bhakti Sathi Team',
        authorRole: initialPost.author?.role || 'Travel Specialist',
        authorAvatar: initialPost.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        status: (initialPost.status as any) || 'published',
        focusKeyword: initialPost.seo?.focusKeyword || '',
        metaTitle: initialPost.seo?.metaTitle || '',
        metaDescription: initialPost.seo?.metaDescription || '',
        schemaType: (initialPost.seo?.schemaType as any) || 'BlogPosting',
        isFeatured: initialPost.featured || false,
      });
    } else {
      // Default initial starter template
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: `# Comprehensive Travel Guide & Itinerary

Planning a memorable holiday? Discover verified local tips, must-see sights, and seamless mountain transfers.

---

## 1. Top Highlights & Must-Visit Attractions
- **Scenic Valleys & Alpine Lakes**: Experience pristine natural beauty and serene walking trails.
- **Local Stays & Warm Hospitality**: Enjoy verified 3-Star to 5-Star handpicked mountain resorts.
- **Dedicated Chauffeur Cab**: Travel safely with hill-certified, private sanitized vehicles.

> 💡 **Travel Tip**: Reserve your permit passes and gondola tickets at least 2 weeks in advance during high season.

## 2. Best Time to Visit & Climate
| Season | Months | Highlights |
|---|---|---|
| **Spring** | March – April | Fresh blossoms & pleasant temperatures |
| **Summer** | May – August | Lush meadows & ideal family holiday weather |
| **Autumn** | Sept – Nov | Golden Chinar foliage & crystal clear skies |
| **Winter** | Dec – Feb | Deep snowfall, skiing & snow adventures |

## 3. Essential Packing & Local Recommendations
Carry layered clothing, comfortable walking footwear, and keep valid ID proofs handy for airport and hotel check-ins.
`,
        featuredImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=85',
        featuredImageAlt: 'Scenic Himalayan landscape with snow-capped peaks and serene valleys',
        category: blogCategories[0]?.name || 'Kashmir Travel Guides',
        categorySlug: blogCategories[0]?.slug || 'kashmir-travel-guides',
        tags: 'Kashmir, Gulmarg, Dal Lake, Itinerary, Vacation',
        authorName: 'Bhakti Sathi Editorial Team',
        authorRole: 'Senior Travel Specialist',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        status: 'published',
        focusKeyword: '',
        metaTitle: '',
        metaDescription: '',
        schemaType: 'BlogPosting',
        isFeatured: true,
      });
    }
  }, [initialPost, blogCategories]);

  // Real-time statistics & SEO audit
  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const seoAudit = analyzeOnPageSeo({
    title: formData.title,
    focusKeyword: formData.focusKeyword,
    metaTitle: formData.metaTitle || formData.title,
    metaDescription: formData.metaDescription || formData.excerpt,
    content: formData.content,
    slug: formData.slug,
    featuredImage: formData.featuredImage,
    imageAlt: formData.featuredImageAlt,
  });

  const schemaJson = JSON.stringify(
    generateBlogPostingSchema(
      {
        id: formData.id || 'post-preview',
        title: formData.title || 'Untitled Article',
        slug: formData.slug || 'untitled-article',
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        featuredImageAlt: formData.featuredImageAlt,
        category: formData.category,
        categorySlug: formData.categorySlug,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        author: {
          name: formData.authorName,
          role: formData.authorRole,
          avatar: formData.authorAvatar,
          bio: 'Bhakti Sathi Travel Writer & Himalayan Expert',
        },
        status: formData.status,
        publishedAt: initialPost?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readTimeMinutes: estimatedReadMinutes,
        viewsCount: initialPost?.viewsCount || 1,
        seo: {
          focusKeyword: formData.focusKeyword,
          metaTitle: formData.metaTitle || formData.title,
          metaDescription: formData.metaDescription || formData.excerpt,
          schemaType: formData.schemaType,
        },
      },
      agencySettings
    ),
    null,
    2
  );

  // Auto-generate slug from title
  const handleAutoSlug = () => {
    if (!formData.title) return;
    const clean = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: clean }));
  };

  // Automated R2 WebP Image Compression for Cover
  const handleUploadCoverImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsCompressingCover(true);

    try {
      const result = await compressAndProcessImage(file, {
        quality: cloudStorageSettings?.compressionQuality || 0.8,
        maxWidth: 1920,
        outputFormat: 'webp',
        r2PublicDomain: cloudStorageSettings?.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
        folder: 'blog-covers',
      });

      // Upload directly to real Cloudflare R2 bucket via server-side proxy
      await uploadToR2(
        result.dataUrl,
        result.asset.fileName,
        result.blob.type,
        result.asset.storagePath,
        cloudStorageSettings
      );

      // Save to media assets catalog
      addMediaAsset(result.asset);

      // Update form state with compressed image URL and metadata
      setFormData((prev) => ({
        ...prev,
        featuredImage: result.asset.url,
        featuredImageAlt: prev.featuredImageAlt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));

      setCoverCompressionStats({
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb,
        savingsPercent: result.percentSavings,
        format: result.asset.fileType.toUpperCase(),
        dimensions: result.asset.dimensions,
        storagePath: result.asset.storagePath,
      });
    } catch (err) {
      console.error('Failed to compress and upload cover image:', err);
    } finally {
      setIsCompressingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Automated R2 WebP Image Compression for Inline Content
  const handleUploadInlineImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsCompressingInline(true);

    try {
      const result = await compressAndProcessImage(file, {
        quality: cloudStorageSettings?.compressionQuality || 0.78,
        maxWidth: 1400,
        outputFormat: 'webp',
        r2PublicDomain: cloudStorageSettings?.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
        folder: 'blog-inline',
      });

      // Upload directly to real Cloudflare R2 bucket via server-side proxy
      await uploadToR2(
        result.dataUrl,
        result.asset.fileName,
        result.blob.type,
        result.asset.storagePath,
        cloudStorageSettings
      );

      addMediaAsset(result.asset);

      const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const imageUrlToInsert = result.asset.url;
      const markdownSnippet = `\n\n![${altText}](${imageUrlToInsert})\n*Caption: ${altText} (Compressed WebP ${result.compressedSizeKb} KB)*\n\n`;

      insertTextAtCursor(markdownSnippet);

      setInlineUploadNotice(
        `✓ Compressed ${result.originalSizeKb} KB → ${result.compressedSizeKb} KB (${result.percentSavings}% saved WebP) & generated R2 path: ${result.asset.storagePath}`
      );
      setTimeout(() => setInlineUploadNotice(null), 5000);
    } catch (err) {
      console.error('Failed to compress inline image:', err);
    } finally {
      setIsCompressingInline(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  };

  // Select existing asset from R2 Library Modal
  const handleSelectFromMediaModal = (url: string, asset: MediaAsset) => {
    if (mediaModalTarget === 'featured') {
      setFormData((prev) => ({
        ...prev,
        featuredImage: url,
        featuredImageAlt: prev.featuredImageAlt || asset.altText || asset.name,
      }));
      setCoverCompressionStats({
        originalKb: asset.originalSizeKb,
        compressedKb: asset.compressedSizeKb,
        savingsPercent: asset.compressionRatioPercent,
        format: asset.fileType.toUpperCase(),
        dimensions: asset.dimensions,
        storagePath: asset.storagePath,
      });
    } else {
      const markdownSnippet = `\n\n![${asset.altText || asset.name}](${url})\n*Caption: ${asset.altText || asset.name}*\n\n`;
      insertTextAtCursor(markdownSnippet);
    }
    setShowMediaModal(false);
  };

  // Helper to insert markdown at cursor position
  const insertTextAtCursor = (snippet: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setFormData((prev) => ({ ...prev, content: prev.content + snippet }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.content;
    const updated = current.substring(0, start) + snippet + current.substring(end);

    setFormData((prev) => ({ ...prev, content: updated }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Inline Category Creator
  const handleSaveInlineCategory = () => {
    if (!inlineCatName.trim()) return;
    const slug = inlineCatName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newCategory: BlogCategory = {
      id: `cat_${Date.now()}`,
      name: inlineCatName.trim(),
      slug,
      description: inlineCatDesc.trim() || `${inlineCatName} travel stories, tips, and itineraries`,
      icon: 'Compass',
      postCount: 1,
    };

    addBlogCategory(newCategory);

    setFormData((prev) => ({
      ...prev,
      category: newCategory.name,
      categorySlug: newCategory.slug,
    }));

    setInlineCatName('');
    setInlineCatDesc('');
    setShowNewCatModal(false);
  };

  // Toggle quick tag chip
  const handleToggleTag = (tag: string) => {
    const currentTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (currentTags.includes(tag)) {
      const updated = currentTags.filter((t) => t !== tag).join(', ');
      setFormData({ ...formData, tags: updated });
    } else {
      const updated = [...currentTags, tag].join(', ');
      setFormData({ ...formData, tags: updated });
    }
  };

  // Save / Publish post handler
  const handleSavePost = (overrideStatus?: 'published' | 'draft') => {
    const finalStatus = overrideStatus || formData.status;

    const cleanSlug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const postPayload: BlogPost = {
      id: initialPost?.id || `blog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: formData.title || 'Untitled Post',
      slug: cleanSlug || 'untitled-post',
      excerpt: formData.excerpt || formData.content.slice(0, 160).replace(/[#*`_>]/g, ''),
      content: formData.content,
      featuredImage: formData.featuredImage,
      featuredImageAlt: formData.featuredImageAlt,
      category: formData.category,
      categorySlug: formData.categorySlug,
      tags: tagsArray,
      author: {
        name: formData.authorName,
        role: formData.authorRole,
        avatar: formData.authorAvatar,
        bio: 'Bhakti Sathi Travel Writer & Himalayan Destination Expert.',
      },
      status: finalStatus,
      publishedAt: initialPost?.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      viewsCount: initialPost?.viewsCount || 1,
      likesCount: initialPost?.likesCount || 0,
      featured: formData.isFeatured,
      seo: {
        focusKeyword: formData.focusKeyword,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
        schemaType: formData.schemaType,
      },
    };

    if (initialPost) {
      updateBlogPost(postPayload);
    } else {
      addBlogPost(postPayload);
    }

    onSaveComplete(postPayload);
  };

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 pb-24 font-sans selection:bg-stone-900 selection:text-white" id="post-editor-module">
      {/* 1. Sticky Action & Mode Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left Back & Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer shrink-0"
                title="Back to Blog Manager"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-[#FC3200] border border-amber-200">
                    Post Editor
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-stone-900 truncate">
                    {initialPost ? `Edit: ${initialPost.title}` : 'Create New Travel Article'}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{estimatedReadMinutes} min read</span>
                  <span>•</span>
                  <span className="text-stone-700 font-bold">SEO Score: {seoAudit.score}/100</span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons & Status Selector */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none"
              >
                <option value="published">🟢 Published Online</option>
                <option value="draft">🟡 Save as Draft</option>
              </select>

              {/* Save Draft Button */}
              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                className="px-3 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 bg-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Save Draft</span>
              </button>

              {/* Publish / Update Live Button */}
              <button
                type="button"
                onClick={() => handleSavePost('published')}
                className="px-4 py-2 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <Check className="w-4 h-4 text-white" />
                <span>
                  {formData.status === 'published' && initialPost
                    ? 'Update Live'
                    : 'Publish Live'}
                </span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-stone-100 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveEditorTab('content')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeEditorTab === 'content'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Write & Format</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeEditorTab === 'preview'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Live Device Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('seo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeEditorTab === 'seo'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3. Yoast SEO Audit ({seoAudit.score}/100)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('schema')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeEditorTab === 'schema'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>4. Schema.org JSON-LD</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMediaModalTarget('inline');
                setShowMediaModal(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-700" />
              <span>R2 Cloud Media Library</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* TAB 1: CONTENT & WRITE */}
        {activeEditorTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Left 2 Columns: Main Article Details, Markdown Editor, Live Inline Upload */}
            <div className="lg:col-span-2 space-y-4">
              {/* Article Headline & Permalink */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 uppercase tracking-wider mb-1">
                    Article Title / Headline <span className="text-[#FC3200]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Best Places to Visit in Kashmir in Winter: Complete Snow Guide"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-base sm:text-lg font-black p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FC3200] transition"
                  />
                </div>

                {/* Slug Generator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono overflow-x-auto no-scrollbar">
                    <span className="text-stone-400">/travel-blog/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="article-url-slug"
                      className="px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="text-[11px] font-bold text-[#FC3200] hover:text-[#e02c00] flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Slug from Title</span>
                  </button>
                </div>

                {/* Excerpt Lead */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                      Lead Summary / Social Excerpt
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {formData.excerpt.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief intro summary displayed on blog cards, search engine snippets, and WhatsApp shares..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-[#FC3200] font-medium transition"
                  />
                </div>
              </div>

              {/* Rich Markdown Editor Canvas with R2 Compression Upload Toolbar */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                {/* Editor Toolbar with Format Actions and R2 Image Upload */}
                <div className="bg-stone-50 border-b border-stone-200 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2">
                  {/* Left Format Buttons */}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('## ')}
                      title="Heading 2"
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-black text-stone-800 cursor-pointer"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('### ')}
                      title="Heading 3"
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-black text-stone-800 cursor-pointer"
                    >
                      H3
                    </button>
                    <div className="h-4 w-px bg-stone-300 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('**bold text**')}
                      title="Bold text"
                      className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 cursor-pointer"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('*italic text*')}
                      title="Italic text"
                      className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 cursor-pointer"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-4 w-px bg-stone-300 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('\n- Item 1\n- Item 2\n- Item 3\n')}
                      title="Bullet list"
                      className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('\n1. First step\n2. Second step\n3. Third step\n')}
                      title="Numbered list"
                      className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('\n> 💡 **Travel Tip**: Write local traveler advice and insider tips here.\n')}
                      title="Travel Tip Callout Box"
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-900 cursor-pointer flex items-center gap-1"
                    >
                      💡 Tip Box
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor('\n| Destination | Best Time | Top Attraction |\n|---|---|---|\n| Gulmarg | Dec - Feb | Gondola Ski Peak |\n| Pahalgam | May - Oct | Betaab Valley |\n')}
                      title="Comparison Table"
                      className="p-1.5 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 cursor-pointer hidden sm:inline-flex"
                    >
                      <Table className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right: Automated R2 WebP Inline Image Upload */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={inlineFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleUploadInlineImage(e.target.files)}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setShowWpImgModal(true)}
                      className="px-3 py-1.5 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="WordPress-style inline image builder (Upload to R2, set alignment & caption)"
                    >
                      <FileImage className="w-3.5 h-3.5 text-white" />
                      <span>📷 Add Photo (WordPress Builder)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCompressingInline}
                      onClick={() => inlineFileInputRef.current?.click()}
                      className="px-2 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Quick upload image to R2"
                    >
                      {isCompressingInline ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Quick Upload</span>
                    </button>
                  </div>
                </div>

                {/* Inline Compression Notification Bar */}
                {inlineUploadNotice && (
                  <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 text-xs font-bold text-emerald-950 flex items-center justify-between">
                    <span className="truncate">{inlineUploadNotice}</span>
                    <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                      R2 WebP Stored
                    </span>
                  </div>
                )}

                {/* Textarea Input */}
                <div className="p-3 sm:p-4">
                  <textarea
                    ref={contentTextareaRef}
                    rows={18}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your comprehensive travel article, itinerary details, markdown headers, and advice here..."
                    className="w-full font-mono text-xs sm:text-sm p-3 bg-stone-50/70 border border-stone-200 rounded-xl leading-relaxed focus:bg-white focus:outline-hidden focus:border-[#FC3200] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Column: Featured Cover Photo, Category, Tags, Author, SEO */}
            <div className="space-y-4">
              {/* 1. Featured Cover Photo with Automated R2 Compression Options */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-[#FC3200]" />
                    <span>Featured Cover Photo</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaModalTarget('featured');
                      setShowMediaModal(true);
                    }}
                    className="text-xs text-[#FC3200] font-bold hover:underline cursor-pointer"
                  >
                    R2 Cloud Library
                  </button>
                </div>

                <UniversalImageUploader
                  label="Upload Blog Cover"
                  description="Auto-compresses to R2 Cloudflare with custom dimension & format"
                  folder="blogs"
                  defaultWidth={1200}
                  defaultFormat="webp"
                  currentUrl={formData.featuredImage}
                  onImageSelected={(url) => setFormData((prev) => ({ ...prev, featuredImage: url }))}
                />

                {/* Cover Alt Tag */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Image Alt Tag (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={formData.featuredImageAlt}
                    onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
                    placeholder="e.g. Traditional wooden shikara boat on Dal Lake Srinagar"
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 2. Category Selection & Inline Category Creator */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-[#FC3200]" />
                    <span>Category & Taxonomy</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewCatModal(true)}
                    className="text-xs text-[#FC3200] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Category</span>
                  </button>
                </div>

                <select
                  value={formData.categorySlug}
                  onChange={(e) => {
                    const cat = blogCategories.find((c) => c.slug === e.target.value);
                    if (cat) {
                      setFormData({
                        ...formData,
                        category: cat.name,
                        categorySlug: cat.slug,
                      });
                    }
                  }}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-[#FC3200]"
                >
                  {blogCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Inline Category Creation Drawer */}
                {showNewCatModal && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-300 space-y-2 text-xs">
                    <span className="font-black text-stone-900 block">Create Category</span>
                    <input
                      type="text"
                      placeholder="Category name (e.g. Ladakh Expeditions)"
                      value={inlineCatName}
                      onChange={(e) => setInlineCatName(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={inlineCatDesc}
                      onChange={(e) => setInlineCatDesc(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowNewCatModal(false)}
                        className="px-2.5 py-1 text-stone-500 hover:text-black font-semibold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveInlineCategory}
                        className="px-3 py-1 bg-stone-900 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Save Category
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Tags & Popular Tags */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#FC3200]" />
                  <span>Tags & Topics</span>
                </span>

                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Kashmir, Gulmarg, Snowfall, Itinerary"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-[#FC3200]"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-500 block">Quick Tag Suggestions:</span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_TAGS.map((tag) => {
                      const isSelected = formData.tags
                        .split(',')
                        .map((t) => t.trim())
                        .includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}#{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Author Attribution */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#FC3200]" />
                  <span>Author Attribution</span>
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Author Role / Title</label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DEVICE PREVIEW */}
        {activeEditorTab === 'preview' && (
          <div className="bg-white p-4 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-black text-stone-700 uppercase tracking-wider">
                  Live Viewport Simulator
                </span>
              </div>

              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile App View</span>
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div
              className={`mx-auto transition-all ${
                previewDevice === 'mobile'
                  ? 'max-w-sm border-4 border-stone-800 rounded-3xl p-4 bg-white shadow-2xl'
                  : 'max-w-3xl'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md text-xs font-black uppercase">
                    {formData.category}
                  </span>
                  <h1 className="text-xl sm:text-3xl font-black text-stone-900 mt-3 leading-tight font-serif">
                    {formData.title || 'Untitled Article Preview'}
                  </h1>

                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-3 pb-3 border-b border-stone-200">
                    <img
                      src={formData.authorAvatar}
                      alt={formData.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <span className="font-black text-stone-900">{formData.authorName}</span>
                      <span className="text-[10px] text-stone-400 block">{formData.authorRole}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{estimatedReadMinutes} min read</span>
                  </div>
                </div>

                {formData.featuredImage && (
                  <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                    <img
                      src={resolveDisplayImage(formData.featuredImage, mediaAssets)}
                      alt={formData.featuredImageAlt}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, formData.featuredImage, mediaAssets)}
                    />
                  </div>
                )}

                <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed">
                  <ArticleContentRenderer content={formData.content} />
                </div>

                <div className="pt-6 border-t border-stone-200 flex flex-wrap gap-1.5">
                  {formData.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-bold">
                        #{tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: YOAST SEO AUDIT & GOOGLE SERP SIMULATOR */}
        {activeEditorTab === 'seo' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#FC3200]" />
                  <span>Yoast & RankMath On-Page SEO Engine</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time audit scoring for Google Search and social sharing previews.
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-xl text-center font-black ${
                  seoAudit.score >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : seoAudit.score >= 50
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <div className="text-2xl leading-none">{seoAudit.score}</div>
                <div className="text-[10px] uppercase font-black">{seoAudit.rating}</div>
              </div>
            </div>

            {/* Keyword Input */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                  Focus Target Keyword
                </label>
                <input
                  type="text"
                  value={formData.focusKeyword}
                  onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                  placeholder="e.g. Kashmir Travel Guide or Gulmarg Snowfall"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Custom SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder={formData.title || 'Page Title in Google'}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Meta Description</label>
                  <input
                    type="text"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder={formData.excerpt || 'Google SERP snippet...'}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Google SERP Snippet Simulator */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                Google Search Result Snippet Preview
              </span>

              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono">
                  <span className="font-black text-stone-900">mybhaktisathi.com</span>
                  <span>› travel-blog › {formData.slug || 'article-slug'}</span>
                </div>
                <h4 className="text-blue-800 text-sm sm:text-base font-medium hover:underline cursor-pointer line-clamp-1">
                  {formData.metaTitle || formData.title || 'Untitled Article Title - Bhakti Sathi'}
                </h4>
                <p className="text-xs text-stone-600 line-clamp-2">
                  {formData.metaDescription || formData.excerpt || 'Read this comprehensive travel guide to plan your dream vacation.'}
                </p>
              </div>
            </div>

            {/* Detailed SEO Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                Audit Checklist & Recommendations
              </span>
              <div className="space-y-1.5">
                {seoAudit.checks.map((check, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      check.status === 'pass'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : check.status === 'warning'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {check.status === 'pass' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : check.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block">{check.label}</span>
                        <span className="text-[11px] opacity-80">{check.description}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-black">
                      {check.scoreImpact >= 0 ? `+${check.scoreImpact}` : check.scoreImpact} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STRUCTURED SCHEMA (JSON-LD) */}
        {activeEditorTab === 'schema' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-stone-900">Google Structured Data Schema (JSON-LD)</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Injected automatically into &lt;script type="application/ld+json"&gt; for Google Rich Articles and Carousels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(schemaJson);
                  setCopySuccess('Copied Schema JSON-LD!');
                  setTimeout(() => setCopySuccess(null), 3000);
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess || 'Copy Schema'}</span>
              </button>
            </div>

            <pre className="bg-stone-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
              {schemaJson}
            </pre>
          </div>
        )}
      </main>

      {/* R2 Cloud Media Selection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-300 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">
                  Pick Compressed Asset from Cloudflare R2 / D1 Storage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-stone-50">
              <MediaR2StorageManager
                isModal={true}
                onSelectMedia={(url, asset) => handleSelectFromMediaModal(url, asset)}
                onCloseModal={() => setShowMediaModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* WordPress Style Inline Image Tool Modal */}
      <WordPressInlineImageModal
        isOpen={showWpImgModal}
        onClose={() => setShowWpImgModal(false)}
        onInsertImage={(snippet) => insertTextAtCursor(snippet)}
        folder="blogs"
      />
    </div>
  );
};

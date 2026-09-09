import React, { useState, useRef } from 'react';
import { useTours } from '../../context/TourContext';
import { BlogPost, BlogCategory, MediaAsset } from '../../types/cms';
import { analyzeOnPageSeo, generateBlogPostingSchema } from '../../utils/seoEngine';
import { compressAndProcessImage, uploadToR2 } from '../../utils/imageCompressor';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import { PostEditor } from './PostEditor';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Tag,
  Folder,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Globe,
  Share2,
  Calendar,
  User,
  ArrowLeft,
  Sliders,
  Code,
  UploadCloud,
  FileImage,
  Layers,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Table,
  Link,
  Maximize2,
  Smartphone,
  Monitor,
  RefreshCw,
  Zap,
  Info,
  ShieldCheck,
} from 'lucide-react';

const POPULAR_TAGS = [
  'Kashmir',
  'Gulmarg',
  'Pahalgam',
  'Dal Lake',
  'Snowfall',
  'Houseboat',
  'Honeymoon',
  'Budget Travel',
  'Family Vacation',
  'Ladakh',
  'Himachal',
  'Trekking',
  'Local Food',
  'Winter Season',
];

export interface TravelBlogManagerProps {
  initialSubTab?: 'posts' | 'editor' | 'categories' | 'media';
  initialPost?: BlogPost | null;
  onPostEditorClose?: () => void;
}

export const TravelBlogManager: React.FC<TravelBlogManagerProps> = ({
  initialSubTab = 'posts',
  initialPost = null,
  onPostEditorClose,
}) => {
  const {
    blogPosts,
    blogCategories,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    duplicateBlogPost,
    toggleBlogPostStatus,
    addBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    navigateToBlogPost,
    navigateToBlogHub,
    mediaAssets,
    addMediaAsset,
    cloudStorageSettings,
    agencySettings,
  } = useTours();

  // Navigation & View States
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'editor' | 'categories' | 'media'>(initialSubTab);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(initialPost);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'readTime'>('date-desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // Modals
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<'featured' | 'inline'>('featured');
  const [showNewCatInlineModal, setShowNewCatInlineModal] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatDesc, setInlineCatDesc] = useState('');

  // Editor Tabs & Modes
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'preview' | 'seo' | 'schema'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [serpPreviewMode, setSerpPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Direct Image Upload & Compression State for Editor
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingInline, setIsCompressingInline] = useState(false);
  const [coverCompressionStats, setCoverCompressionStats] = useState<{
    originalKb: number;
    compressedKb: number;
    savingsPercent: number;
    format: string;
  } | null>(null);
  const [inlineUploadNotice, setInlineUploadNotice] = useState<string | null>(null);
  const [copiedLinkPostId, setCopiedLinkPostId] = useState<string | null>(null);

  // File Input Refs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Form State for Post Editor
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

  // Category Tab Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  // --- Handlers for Post Management ---

  const handleStartCreate = () => {
    setEditingPost(null);
    setCoverCompressionStats(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: `# Complete Guide to Kashmir: Unforgettable Itinerary & Tips

Planning a holiday to the paradise on Earth? Kashmir offers breathtaking snow peaks, serene alpine lakes, and hospitable shikara houseboats.

---

## 1. Top Highlights & Must-Visit Attractions
- **Srinagar & Dal Lake**: Stay in a heritage pine-wood houseboat and enjoy sunrise Shikara rides through floating vegetable gardens.
- **Gulmarg Gondola**: Ascend to Phase 2 (Apharwat Peak) at 13,780 ft for world-class skiing and deep powder snow.
- **Pahalgam Valley of Shepherds**: Stroll along the gushing Lidder River and visit Betaab & Aru Valleys.

> 💡 **Travel Tip**: Always book your Gulmarg Gondola Phase 2 tickets at least 2 weeks in advance to avoid last-minute rush.

## 2. Best Time to Visit Kashmir
| Season | Months | Highlights |
|---|---|---|
| **Spring** | March – April | Blooming Tulip Garden & Mustard Blossoms |
| **Summer** | May – August | Pleasant 20°C weather & lush green meadows |
| **Autumn** | Sept – Nov | Golden Chinar leaves & crystal blue skies |
| **Winter** | Dec – Feb | Heavy snowfall & skiing in Gulmarg |

## 3. Essential Packing & Local Etiquette
Bring thermal layers in winter, comfortable walking boots, and modest attire for visiting historical shrines and temples.
      `,
      featuredImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=85',
      featuredImageAlt: 'Scenic Shikara on Dal Lake Srinagar with snow capped Himalayas',
      category: blogCategories[0]?.name || 'Kashmir Travel Guides',
      categorySlug: blogCategories[0]?.slug || 'kashmir-travel-guides',
      tags: 'Kashmir, Gulmarg, Dal Lake, Itinerary, Honeymoon',
      authorName: 'Bhakti Sathi Editorial Team',
      authorRole: 'Senior Travel Specialist',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: 'published',
      focusKeyword: 'Kashmir Travel Guide',
      metaTitle: 'Complete Kashmir Travel Guide 2026: Itinerary, Tips & Places | Bhakti Sathi',
      metaDescription: 'Discover the ultimate Kashmir travel guide featuring top sights in Srinagar, Gulmarg, and Pahalgam, best seasons to visit, and local travel tips.',
      schemaType: 'BlogPosting',
      isFeatured: true,
    });
    setActiveSubTab('editor');
    setActiveEditorTab('content');
  };

  const handleStartEdit = (post: BlogPost) => {
    setEditingPost(post);
    setCoverCompressionStats(null);
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt || '',
      category: post.category,
      categorySlug: post.categorySlug,
      tags: post.tags?.join(', ') || '',
      authorName: post.author?.name || 'Bhakti Sathi Team',
      authorRole: post.author?.role || 'Travel Specialist',
      authorAvatar: post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: (post.status as any) || 'published',
      focusKeyword: post.seo?.focusKeyword || '',
      metaTitle: post.seo?.metaTitle || '',
      metaDescription: post.seo?.metaDescription || '',
      schemaType: (post.seo?.schemaType as any) || 'BlogPosting',
      isFeatured: false,
    });
    setActiveSubTab('editor');
    setActiveEditorTab('content');
  };

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

  const handleSavePost = () => {
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

    const postPayload = {
      title: formData.title || 'Untitled Post',
      slug: cleanSlug,
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
        bio: 'Bhakti Sathi Travel Writer & Destination Expert.',
      },
      status: formData.status,
      readTimeMinutes: Math.max(1, Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200)),
      seo: {
        focusKeyword: formData.focusKeyword,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
        schemaType: formData.schemaType,
      },
    };

    if (editingPost) {
      updateBlogPost({
        ...editingPost,
        ...postPayload,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addBlogPost(postPayload as any);
    }

    setActiveSubTab('posts');
  };

  // --- Compression & R2 Image Upload Handlers ---

  const handleUploadCoverImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsCompressingCover(true);

    try {
      const result = await compressAndProcessImage(file, {
        quality: cloudStorageSettings.compressionQuality || 0.8,
        maxWidth: 1920,
        outputFormat: 'webp',
        r2PublicDomain: cloudStorageSettings.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
        folder: 'blog-covers',
      });

      // Save to cloud assets immediately
      addMediaAsset(result.asset);

      // Upload directly to real Cloudflare R2 bucket via server-side proxy
      try {
        const r2Uploaded = await uploadToR2(
          result.dataUrl,
          result.asset.fileName,
          result.blob.type,
          result.asset.storagePath,
          cloudStorageSettings
        );
        if (r2Uploaded) {
          addMediaAsset({ ...result.asset, r2Synced: true });
        }
      } catch (r2Err) {
        console.warn('R2 sync notice:', r2Err);
      }

      // Update form state with compressed image URL
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
      });
    } catch (err) {
      console.error('Failed to compress and upload cover photo:', err);
    } finally {
      setIsCompressingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleUploadInlineImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsCompressingInline(true);

    try {
      const result = await compressAndProcessImage(file, {
        quality: cloudStorageSettings.compressionQuality || 0.78,
        maxWidth: 1400,
        outputFormat: 'webp',
        r2PublicDomain: cloudStorageSettings.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
        folder: 'blog-inline',
      });

      // Save to media assets immediately
      addMediaAsset(result.asset);

      // Upload directly to real Cloudflare R2 bucket via server-side proxy
      try {
        const r2Uploaded = await uploadToR2(
          result.dataUrl,
          result.asset.fileName,
          result.blob.type,
          result.asset.storagePath,
          cloudStorageSettings
        );
        if (r2Uploaded) {
          addMediaAsset({ ...result.asset, r2Synced: true });
        }
      } catch (r2Err) {
        console.warn('R2 sync notice:', r2Err);
      }

      const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const imageUrlToInsert = result.asset.url;
      const markdownSnippet = `\n\n![${altText}](${imageUrlToInsert})\n*Caption: ${altText}*\n\n`;

      insertTextAtCursor(markdownSnippet);

      setInlineUploadNotice(
        `✓ Compressed ${result.originalSizeKb} KB → ${result.compressedSizeKb} KB (${result.percentSavings}% saved WebP) & inserted!`
      );
      setTimeout(() => setInlineUploadNotice(null), 4000);
    } catch (err) {
      console.error('Failed to compress inline image:', err);
    } finally {
      setIsCompressingInline(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  };

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
      });
    } else {
      const markdownSnippet = `\n\n![${asset.altText || asset.name}](${url})\n\n`;
      insertTextAtCursor(markdownSnippet);
    }
    setShowMediaModal(false);
  };

  // Insert markdown snippet helper
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

  // --- Category Management Handlers ---

  const handleSaveInlineCategory = () => {
    if (!inlineCatName.trim()) return;
    const slug = inlineCatName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    addBlogCategory({
      name: inlineCatName.trim(),
      slug,
      description: inlineCatDesc.trim() || `${inlineCatName} travel stories and guides`,
      icon: 'Compass',
    });

    setFormData((prev) => ({
      ...prev,
      category: inlineCatName.trim(),
      categorySlug: slug,
    }));

    setInlineCatName('');
    setInlineCatDesc('');
    setShowNewCatInlineModal(false);
  };

  const handleAddCategoryFromTab = () => {
    if (!newCatName.trim()) return;
    const slug =
      newCatSlug.trim() ||
      newCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    if (editingCategory) {
      updateBlogCategory({
        ...editingCategory,
        name: newCatName.trim(),
        slug,
        description: newCatDesc.trim(),
      });
      setEditingCategory(null);
    } else {
      addBlogCategory({
        name: newCatName.trim(),
        slug,
        description: newCatDesc.trim(),
        icon: 'Compass',
      });
    }

    setNewCatName('');
    setNewCatSlug('');
    setNewCatDesc('');
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let updatedTags: string[];
    if (currentTags.includes(tag)) {
      updatedTags = currentTags.filter((t) => t !== tag);
    } else {
      updatedTags = [...currentTags, tag];
    }
    setFormData((prev) => ({ ...prev, tags: updatedTags.join(', ') }));
  };

  const handleCopyLink = (post: BlogPost) => {
    const url = `${window.location.origin}/travel-blog/${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkPostId(post.id);
    setTimeout(() => setCopiedLinkPostId(null), 2000);
  };

  // SEO Calculation on current formData
  const seoAudit = analyzeOnPageSeo({
    title: formData.title,
    metaTitle: formData.metaTitle,
    metaDescription: formData.metaDescription,
    slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
    content: formData.content,
    focusKeyword: formData.focusKeyword,
    featuredImage: formData.featuredImage,
    imageAlt: formData.featuredImageAlt,
  });

  const schemaJson = JSON.stringify(
    generateBlogPostingSchema(
      {
        id: formData.id || 'preview',
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        featuredImageAlt: formData.featuredImageAlt,
        category: formData.category,
        categorySlug: formData.categorySlug,
        tags: formData.tags.split(',').map((t) => t.trim()),
        author: {
          name: formData.authorName,
          role: formData.authorRole,
          avatar: formData.authorAvatar,
          bio: 'Bhakti Sathi Editorial Writer & Travel Specialist.',
        },
        status: formData.status,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewsCount: 0,
        readTimeMinutes: Math.max(1, Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200)),
        seo: {
          focusKeyword: formData.focusKeyword,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          schemaType: formData.schemaType,
        },
      },
      agencySettings.companyName || 'Bhakti Sathi Travel'
    ),
    null,
    2
  );

  // Filter & Sort Posts
  const filteredPosts = blogPosts
    .filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = categoryFilter === 'all' || post.categorySlug === categoryFilter;
      const matchStatus = statusFilter === 'all' || post.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.publishedAt || b.updatedAt || '').getTime() - new Date(a.publishedAt || a.updatedAt || '').getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.publishedAt || a.updatedAt || '').getTime() - new Date(b.publishedAt || b.updatedAt || '').getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'readTime') {
        return (b.readTimeMinutes || 1) - (a.readTimeMinutes || 1);
      }
      return 0;
    });

  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const charCount = formData.content.length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const publishedCount = blogPosts.filter((p) => p.status === 'published').length;
  const draftCount = blogPosts.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 bg-gradient-to-l from-amber-400 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold tracking-wider uppercase border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                WordPress-Style CMS & R2 Media Studio
              </span>
              <span className="text-xs text-stone-400">• SEO Engine & Auto-Compression</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Travel Blog & Article Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Create, edit, and publish engaging holiday guides, destination itineraries, and travel advice with
              automated Cloudflare R2 image compression, taxonomy categories, and Google Rich Snippet schema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartCreate}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Write New Article</span>
            </button>
            <button
              onClick={() => setActiveSubTab('media')}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-stone-700 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>R2 Cloud Storage</span>
            </button>
            <button
              onClick={navigateToBlogHub}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Blog</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <span className="text-stone-400 block text-[10px] font-bold uppercase">Total Articles</span>
            <span className="text-lg font-black text-white">{blogPosts.length}</span>
          </div>
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <span className="text-emerald-400 block text-[10px] font-bold uppercase">Published Online</span>
            <span className="text-lg font-black text-emerald-400">{publishedCount}</span>
          </div>
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <span className="text-amber-400 block text-[10px] font-bold uppercase">Drafts & Scheduled</span>
            <span className="text-lg font-black text-amber-300">{draftCount}</span>
          </div>
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <span className="text-blue-400 block text-[10px] font-bold uppercase">R2 Media Assets</span>
            <span className="text-lg font-black text-blue-300">{mediaAssets.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'posts'
                ? 'bg-black text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Articles ({blogPosts.length})</span>
          </button>

          <button
            onClick={() => {
              if (activeSubTab !== 'editor') handleStartCreate();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'editor'
                ? 'bg-black text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>
              {editingPost ? `Editing: ${editingPost.title.slice(0, 20)}...` : 'Post Editor / Creator'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-black text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Categories ({blogCategories.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'media'
                ? 'bg-black text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>R2 Cloud Media Studio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: ALL ARTICLES TABLE & GRID VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title, keywords, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-black font-medium text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none truncate"
              >
                <option value="all">All Categories</option>
                {blogCategories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-2.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-2.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="readTime">Read Time</option>
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

          {/* Posts View: Table or Cards */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
              <FileText className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-black">No articles found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No blog posts match your current filter criteria. Write your first post or adjust search terms.
              </p>
              <button
                onClick={handleStartCreate}
                className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Article</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category & Tags</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Read Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-stone-50/70 transition group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-11 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative group">
                              <img
                                src={resolveDisplayImage(post.featuredImage, mediaAssets)}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                onError={(e) => handleImageError(e, post.featuredImage, mediaAssets)}
                              />
                            </div>
                            <div className="space-y-0.5 max-w-md">
                              <h4
                                onClick={() => handleStartEdit(post)}
                                className="font-bold text-stone-900 hover:text-amber-700 cursor-pointer line-clamp-1 transition"
                              >
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                                <span className="font-mono text-stone-500">/travel-blog/{post.slug}</span>
                                {post.seo?.focusKeyword && (
                                  <span className="bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded text-[10px]">
                                    🎯 {post.seo.focusKeyword}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-800 font-bold rounded text-[11px]">
                              {post.category}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {post.tags?.slice(0, 2).map((t, idx) => (
                                <span key={idx} className="text-[10px] text-stone-500">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author?.avatar}
                              alt={post.author?.name}
                              className="w-6 h-6 rounded-full object-cover border border-stone-200"
                            />
                            <div className="text-[11px] font-medium text-stone-700">
                              {post.author?.name}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleBlogPostStatus(post.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition cursor-pointer ${
                              post.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {post.status}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center text-stone-500 font-medium">
                          <div className="flex items-center justify-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{post.readTimeMinutes || 4} min</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleCopyLink(post)}
                              title="Copy Public Permalink"
                              className="p-1.5 text-stone-400 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            >
                              {copiedLinkPostId === post.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Link className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => navigateToBlogPost(post.slug)}
                              title="View Article on Traveler Site"
                              className="p-1.5 text-stone-400 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleStartEdit(post)}
                              title="Edit Article"
                              className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer font-bold"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => duplicateBlogPost(post.id)}
                              title="Duplicate Post"
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Delete article "${post.title}"?`)) {
                                  deleteBlogPost(post.id);
                                }
                              }}
                              title="Delete Post"
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-[16/10] bg-stone-100">
                    <img
                      src={resolveDisplayImage(post.featuredImage, mediaAssets)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, post.featuredImage, mediaAssets)}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <button
                        onClick={() => toggleBlogPostStatus(post.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs cursor-pointer ${
                          post.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {post.status}
                      </button>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-stone-800 shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4
                        onClick={() => handleStartEdit(post)}
                        className="font-black text-sm text-stone-900 hover:text-amber-700 cursor-pointer line-clamp-2 transition mb-1"
                      >
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="font-mono text-stone-500 truncate">/travel-blog/{post.slug}</span>
                        <div className="flex items-center gap-1 text-stone-500 shrink-0">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{post.readTimeMinutes || 4}m</span>
                        </div>
                      </div>
                      {post.seo?.focusKeyword && (
                        <div className="mt-1.5 text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded inline-block font-medium">
                          🎯 {post.seo.focusKeyword}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={post.author?.avatar} alt={post.author?.name} className="w-6 h-6 rounded-full object-cover border border-stone-200" />
                        <span className="text-xs font-medium text-stone-700 truncate max-w-[110px]">{post.author?.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(post)}
                          title="Copy Permalink"
                          className="p-1.5 text-stone-400 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer"
                        >
                          {copiedLinkPostId === post.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Link className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => navigateToBlogPost(post.slug)}
                          title="View Live"
                          className="p-1.5 text-stone-400 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(post)}
                          title="Edit"
                          className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateBlogPost(post.id)}
                          title="Duplicate"
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete post "${post.title}"?`)) {
                              deleteBlogPost(post.id);
                            }
                          }}
                          title="Delete"
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

      {/* ========================================================================= */}
      {/* SUB-TAB 2: POST EDITOR (CREATE / EDIT) */}
      {/* ========================================================================= */}
      {activeSubTab === 'editor' && (
        <PostEditor
          initialPost={editingPost}
          onSaveComplete={() => {
            setActiveSubTab('posts');
            setEditingPost(null);
            if (onPostEditorClose) onPostEditorClose();
          }}
          onCancel={() => {
            setActiveSubTab('posts');
            setEditingPost(null);
            if (onPostEditorClose) onPostEditorClose();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CATEGORIES & TAXONOMY MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add / Edit Category Form */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs h-fit">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category Name</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  if (!editingCategory) {
                    setNewCatSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    );
                  }
                }}
                placeholder="e.g. Kashmir Travel Guides"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                placeholder="e.g. kashmir-travel-guides"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Describe what kind of travel guides and stories belong in this category..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCatName('');
                    setNewCatSlug('');
                    setNewCatDesc('');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleAddCategoryFromTab}
                className="w-full py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="md:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Active Taxonomy Categories ({blogCategories.length})
                </span>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {blogCategories.map((cat) => {
                  const postCount = blogPosts.filter((p) => p.categorySlug === cat.slug).length;
                  return (
                    <div key={cat.id} className="p-4 hover:bg-stone-50/70 transition flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-black">{cat.name}</h4>
                          <span className="font-mono text-[11px] text-stone-400">/{cat.slug}</span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-stone-500 line-clamp-1">{cat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-800 rounded-full font-bold text-[11px]">
                          {postCount} {postCount === 1 ? 'article' : 'articles'}
                        </span>

                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCatName(cat.name);
                            setNewCatSlug(cat.slug);
                            setNewCatDesc(cat.description || '');
                          }}
                          className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${cat.name}"?`)) {
                              deleteBlogCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: R2 CLOUD STORAGE MANAGER TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'media' && <MediaR2StorageManager />}

      {/* ========================================================================= */}
      {/* MODAL: CLOUDFLARE R2 MEDIA PICKER MODAL */}
      {/* ========================================================================= */}
      {showMediaModal && (
        <MediaR2StorageManager
          isModal={true}
          onCloseModal={() => setShowMediaModal(false)}
          onSelectMedia={(url, asset) => handleSelectFromMediaModal(url, asset)}
        />
      )}
    </div>
  );
};

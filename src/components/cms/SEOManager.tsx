import React, { useState, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import {
  Search,
  Globe,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye,
  Check,
  Compass,
  Shuffle,
  RefreshCw,
  FolderTree,
  Filter,
  CheckCheck,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { TourPackage } from '../../types/tour';
import { DestinationMeta } from '../../data/destinationsData';
import { GuideArticle } from '../../types/guide';
import { CustomPage, PageSeoConfig } from '../../types/cms';
import { UnifiedSEOModal, UnifiedSeoItem } from './UnifiedSEOModal';
import { RedirectsManager } from './RedirectsManager';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';

type ContentSection =
  | 'all'
  | 'tours'
  | 'tour-types'
  | 'site-pages'
  | 'destinations'
  | 'guides'
  | 'custom-pages'
  | 'redirects';

type TourTypeFilter = 'all' | 'Family' | 'Honeymoon' | 'Pilgrimage' | 'Group' | 'Other';

export const SEOManager: React.FC = () => {
  const {
    packages,
    updatePackage,
    destinations,
    updateDestination,
    guides,
    updateGuide,
    customPages,
    updateCustomPage,
    pageSeoConfigs,
    updatePageSeoConfig,
    deletePageSeoConfig,
    mediaAssets,
  } = useTours();

  const [activeSection, setActiveSection] = useState<ContentSection>('all');
  const [tourTypeFilter, setTourTypeFilter] = useState<TourTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'needs-work' | 'good' | 'optimal'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Unified modal state
  const [selectedItem, setSelectedItem] = useState<UnifiedSeoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalized list of site pages
  const sitePageList: PageSeoConfig[] = useMemo(() => {
    return Object.values(pageSeoConfigs || {}).map((sp) => ({
      ...sp,
      canonicalUrl: (sp.canonicalUrl || '').replace(
        /https?:\/\/([^/]*\.)?mybhaktisathi\.com/gi,
        'https://holidayshunt.com'
      ),
      metaTitle: (sp.metaTitle || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt'),
      metaDescription: (sp.metaDescription || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt'),
    }));
  }, [pageSeoConfigs]);

  // Normalized list of destinations
  const destinationList = useMemo(() => {
    return Object.entries(destinations || {}).map(([slug, meta]) => ({
      slug,
      meta,
    }));
  }, [destinations]);

  // Convert everything into a unified array for instant searching & auditing
  const allUnifiedItems: UnifiedSeoItem[] = useMemo(() => {
    const items: UnifiedSeoItem[] = [];

    // 1. Tour Packages
    packages.forEach((pkg) => {
      const canonical = `https://holidayshunt.com/tours/${pkg.slug || pkg.id}`;
      items.push({
        id: pkg.id,
        itemType: 'tour',
        name: pkg.title,
        slug: pkg.slug || pkg.id,
        path: `/tours/${pkg.slug || pkg.id}`,
        canonicalUrl: canonical,
        focusKeyword: pkg.seoKeywords?.split(',')[0]?.trim() || `${pkg.title.toLowerCase()} tour`,
        metaTitle: pkg.seoMetaTitle || pkg.seoTitle || `${pkg.title} | Holidays Hunt`,
        metaDescription:
          pkg.seoMetaDescription ||
          pkg.metaDescription ||
          pkg.tagline ||
          `Book ${pkg.title} with Holidays Hunt. Premium stays, private transfers, and curated itineraries.`,
        tourType: pkg.tourType || pkg.category || 'Family',
        destination: pkg.destination,
        tagline: pkg.tagline,
        overview: pkg.overview,
        ogImage: (pkg as any).ogImage || pkg.coverImage || (pkg.gallery && pkg.gallery[0]?.url) || '',
        ogTitle: (pkg as any).ogTitle,
        ogDescription: (pkg as any).ogDescription,
      });
    });

    // 2. Core Site Pages
    sitePageList.forEach((sp) => {
      items.push({
        id: sp.id,
        itemType: 'page',
        name: sp.pageName,
        path: sp.path,
        canonicalUrl: sp.canonicalUrl || `https://holidayshunt.com${sp.path}`,
        focusKeyword: sp.focusKeyword || '',
        metaTitle: sp.metaTitle || `${sp.pageName} | Holidays Hunt`,
        metaDescription: sp.metaDescription || '',
        ogTitle: sp.ogTitle,
        ogDescription: sp.ogDescription,
        ogImage: sp.ogImage,
        noIndex: sp.noIndex,
        noFollow: sp.noFollow,
      });
    });

    // 3. Destinations
    destinationList.forEach(({ slug, meta }) => {
      const canonical = `https://holidayshunt.com/destination/${slug}`;
      items.push({
        id: slug,
        itemType: 'destination',
        name: meta.name || slug,
        slug,
        path: `/destination/${slug}`,
        canonicalUrl: canonical,
        focusKeyword: meta.seoKeywords?.split(',')[0]?.trim() || `${meta.name || slug} tourism`,
        metaTitle: meta.seoMetaTitle || `${meta.name || slug} Tour Packages & Travel Guide | Holidays Hunt`,
        metaDescription:
          meta.seoMetaDescription ||
          meta.tagline ||
          `Explore ${meta.name || slug} with customized holiday packages by Holidays Hunt. Best hotels, cabs, and sightseeing.`,
        destination: meta.name || slug,
        tagline: meta.tagline,
        overview: meta.guide?.overview || meta.tagline,
        ogImage: (meta as any).ogImage || meta.heroImage || '',
        ogTitle: (meta as any).ogTitle,
        ogDescription: (meta as any).ogDescription,
      });
    });

    // 4. Guides & Blog Posts
    guides.forEach((g) => {
      const canonical = `https://holidayshunt.com/guides/${g.slug || g.id}`;
      items.push({
        id: g.id,
        itemType: 'guide',
        name: g.title,
        slug: g.slug || g.id,
        path: `/guides/${g.slug || g.id}`,
        canonicalUrl: canonical,
        focusKeyword: g.seo?.primaryKeyword || g.destination,
        metaTitle: g.seo?.metaTitle || `${g.title} | Holidays Hunt Guide`,
        metaDescription: g.seo?.metaDescription || g.excerpt || '',
        destination: g.destination,
        overview: g.excerpt,
        ogImage: g.seo?.ogImage || g.featuredImage || '',
        ogTitle: g.seo?.ogTitle,
        ogDescription: g.seo?.ogDescription,
      });
    });

    // 5. Custom CMS Pages
    customPages.forEach((cp) => {
      const canonical = `https://holidayshunt.com/page/${cp.slug || cp.id}`;
      items.push({
        id: cp.id,
        itemType: 'custom-page',
        name: cp.title,
        slug: cp.slug || cp.id,
        path: `/page/${cp.slug || cp.id}`,
        canonicalUrl: canonical,
        focusKeyword: cp.seo?.focusKeyword || cp.title.toLowerCase(),
        metaTitle: cp.seo?.metaTitle || `${cp.title} | Holidays Hunt`,
        metaDescription: cp.seo?.metaDescription || cp.subtitle || '',
        overview: cp.subtitle,
        ogImage: cp.seo?.ogImage || cp.heroImage || '',
        ogTitle: cp.seo?.ogTitle,
        ogDescription: cp.seo?.ogDescription,
      });
    });

    return items;
  }, [packages, sitePageList, destinationList, guides, customPages]);

  // Calculate SEO Health Score helper
  const getItemScore = (item: UnifiedSeoItem) => {
    let score = 0;
    const title = item.metaTitle || '';
    const desc = item.metaDescription || '';
    const kw = item.focusKeyword || '';

    if (title.length >= 35 && title.length <= 65) score += 30;
    else if (title.length > 0) score += 15;

    if (desc.length >= 110 && desc.length <= 165) score += 30;
    else if (desc.length > 0) score += 15;

    if (kw.trim().length > 0) score += 15;
    if (kw.trim().length > 0 && title.toLowerCase().includes(kw.toLowerCase())) score += 15;
    if (item.ogImage && item.ogImage.trim().length > 0) score += 10;

    return Math.min(100, score);
  };

  // Filter items by Section, Search, Tour Type, and Score
  const filteredItems = useMemo(() => {
    return allUnifiedItems.filter((item) => {
      // Section Filter
      if (activeSection === 'tours' && item.itemType !== 'tour') return false;
      if (activeSection === 'tour-types' && !(item.path?.startsWith('/tour-type/') || item.id.startsWith('tour-type-'))) return false;
      if (activeSection === 'site-pages' && (item.itemType !== 'page' || item.path?.startsWith('/tour-type/') || item.id.startsWith('tour-type-'))) return false;
      if (activeSection === 'destinations' && item.itemType !== 'destination') return false;
      if (activeSection === 'guides' && item.itemType !== 'guide') return false;
      if (activeSection === 'custom-pages' && item.itemType !== 'custom-page') return false;

      // Tour Type Filter (applies to tours or when viewing all)
      if (tourTypeFilter !== 'all') {
        if (item.itemType === 'tour') {
          const tType = (item.tourType || '').toLowerCase();
          if (tourTypeFilter === 'Other') {
            if (['family', 'honeymoon', 'pilgrimage', 'group'].includes(tType)) return false;
          } else if (!tType.includes(tourTypeFilter.toLowerCase())) {
            return false;
          }
        } else if (activeSection === 'tours') {
          return false;
        }
      }

      // Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(query) ||
          item.path?.toLowerCase().includes(query) ||
          item.canonicalUrl?.toLowerCase().includes(query) ||
          item.focusKeyword?.toLowerCase().includes(query) ||
          item.tourType?.toLowerCase().includes(query) ||
          item.destination?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Score Filter
      const score = getItemScore(item);
      if (scoreFilter === 'needs-work' && score >= 60) return false;
      if (scoreFilter === 'good' && (score < 60 || score >= 80)) return false;
      if (scoreFilter === 'optimal' && score < 80) return false;

      return true;
    });
  }, [allUnifiedItems, activeSection, tourTypeFilter, searchTerm, scoreFilter]);

  // 1-Click Normalize all domains to holidayshunt.com
  const handleNormalizeAllDomains = () => {
    let count = 0;

    // 1. Normalize pageSeoConfigs
    const updatedSeo: Record<string, PageSeoConfig> = {};
    Object.entries(pageSeoConfigs || {}).forEach(([k, sp]) => {
      const fixedCanonical = (sp.canonicalUrl || `https://holidayshunt.com${sp.path}`).replace(
        /https?:\/\/([^/]*\.)?mybhaktisathi\.com/gi,
        'https://holidayshunt.com'
      );
      const fixedTitle = (sp.metaTitle || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt');
      const fixedDesc = (sp.metaDescription || '').replace(/Bhakti\s*Sathi/gi, 'Holidays Hunt');
      updatedSeo[k] = {
        ...sp,
        canonicalUrl: fixedCanonical,
        metaTitle: fixedTitle,
        metaDescription: fixedDesc,
      };
      updatePageSeoConfig(updatedSeo[k]);
      count++;
    });

    setNotice(
      `✓ Successfully audited and normalized ${count} pages to canonical domain https://holidayshunt.com!`
    );
    setTimeout(() => setNotice(null), 5000);
  };

  // Handle Save from UnifiedSEOModal
  const handleSaveItem = (updated: UnifiedSeoItem) => {
    if (updated.itemType === 'tour') {
      const existing = packages.find((p) => p.id === updated.id);
      if (existing) {
        updatePackage({
          ...existing,
          title: updated.name,
          tourType: updated.tourType as any,
          category: (updated.tourType as any) || existing.category,
          seoMetaTitle: updated.metaTitle,
          seoMetaDescription: updated.metaDescription,
          seoKeywords: updated.focusKeyword,
          seoTitle: updated.metaTitle,
          metaDescription: updated.metaDescription,
          coverImage: updated.ogImage || existing.coverImage,
          ...((updated.ogImage ? { ogImage: updated.ogImage } : {}) as any),
          ...((updated.ogTitle ? { ogTitle: updated.ogTitle } : {}) as any),
          ...((updated.ogDescription ? { ogDescription: updated.ogDescription } : {}) as any),
        });
      }
    } else if (updated.itemType === 'page') {
      const existing = pageSeoConfigs[updated.id];
      updatePageSeoConfig({
        ...(existing || {}),
        id: updated.id,
        pageName: updated.name || (existing ? existing.pageName : 'Tour Type Page'),
        path: updated.path || (existing ? existing.path : `/tour-type/${updated.id.replace('tour-type-', '')}`),
        metaTitle: updated.metaTitle || (existing ? existing.metaTitle : updated.name),
        metaDescription: updated.metaDescription || (existing ? existing.metaDescription : ''),
        focusKeyword: updated.focusKeyword || (existing ? existing.focusKeyword : ''),
        canonicalUrl: updated.canonicalUrl || (existing ? existing.canonicalUrl : `https://holidayshunt.com${updated.path || ''}`),
        ogTitle: updated.ogTitle,
        ogDescription: updated.ogDescription,
        ogImage: updated.ogImage,
        noIndex: updated.noIndex || false,
        noFollow: updated.noFollow || false,
        updatedAt: new Date().toISOString(),
      });
    } else if (updated.itemType === 'destination') {
      const existing = destinations[updated.id];
      if (existing) {
        updateDestination({
          ...existing,
          seoMetaTitle: updated.metaTitle,
          seoMetaDescription: updated.metaDescription,
          seoKeywords: updated.focusKeyword,
          heroImage: updated.ogImage || existing.heroImage,
          ...((updated.ogImage ? { ogImage: updated.ogImage } : {}) as any),
        });
      }
    } else if (updated.itemType === 'guide') {
      const existing = guides.find((g) => g.id === updated.id);
      if (existing) {
        updateGuide({
          ...existing,
          featuredImage: updated.ogImage || existing.featuredImage,
          seo: {
            ...existing.seo,
            metaTitle: updated.metaTitle || '',
            metaDescription: updated.metaDescription || '',
            primaryKeyword: updated.focusKeyword || '',
            ogImage: updated.ogImage || existing.seo?.ogImage,
            ogTitle: updated.ogTitle || existing.seo?.ogTitle,
            ogDescription: updated.ogDescription || existing.seo?.ogDescription,
          },
        });
      }
    } else if (updated.itemType === 'custom-page') {
      const existing = customPages.find((p) => p.id === updated.id);
      if (existing) {
        updateCustomPage({
          ...existing,
          heroImage: updated.ogImage || existing.heroImage,
          seo: {
            ...existing.seo,
            focusKeyword: updated.focusKeyword || '',
            metaTitle: updated.metaTitle || '',
            metaDescription: updated.metaDescription || '',
            ogImage: updated.ogImage || existing.seo?.ogImage,
          },
        });
      }
    }

    setNotice(`✓ Saved SEO metadata & R2 image for "${updated.name}"`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleAddNewPageSeo = () => {
    const rawSlug = window.prompt('Enter category/page slug (e.g. "corporate", "adventure", "cultural", "spiritual"):');
    if (!rawSlug || !rawSlug.trim()) return;
    const cleanSlug = rawSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const newId = `tour-type-${cleanSlug}`;
    const newPath = `/tour-type/${cleanSlug}`;
    const pageTitleName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);

    const newItem: UnifiedSeoItem = {
      id: newId,
      itemType: 'page',
      name: `${pageTitleName} Tours`,
      path: newPath,
      canonicalUrl: `https://holidayshunt.com${newPath}`,
      focusKeyword: `${cleanSlug} tour packages`,
      metaTitle: `${pageTitleName} Tour Packages & Trips 2026 | Holidays Hunt`,
      metaDescription: `Book verified ${cleanSlug} tour packages with private chauffeur transfers, handpicked hotel stays, and 24/7 travel assistance.`,
      ogImage: '',
      noIndex: false,
      noFollow: false,
    };
    setSelectedItem(newItem);
    setIsModalOpen(true);
  };

  const handleDeletePageSeo = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the SEO entry for "${name}"?`)) {
      deletePageSeoConfig(id);
      setNotice(`✓ Deleted SEO entry for "${name}"`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#9b0000]/10 text-[#9b0000] border border-[#9b0000]/20 text-[10px] font-black uppercase tracking-wider">
                Holidays Hunt CMS
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Canonical: https://holidayshunt.com
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              SEO &amp; Traffic Control Center
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-3xl">
              Configure search engine metadata, tour type classifications, canonical URLs, and 301 permanent redirects to preserve Google PageRank and backlink traffic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={handleAddNewPageSeo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9b0000] text-white text-xs font-bold hover:bg-[#7D0000] transition cursor-pointer shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              Add Tour Type / Page SEO
            </button>
            <button
              type="button"
              onClick={handleNormalizeAllDomains}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#9b0000]" />
              Normalize All Canonical URLs
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Sitemap.xml
            </a>
          </div>
        </div>

        {/* Primary Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-100 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            All Content
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'all' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {allUnifiedItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tour-types')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'tour-types'
                ? 'bg-[#9b0000] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Tour Type Pages
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'tour-types' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {sitePageList.filter((sp) => sp.path?.startsWith('/tour-type/') || sp.id.startsWith('tour-type-')).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tours')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'tours'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Tour Packages
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'tours' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {packages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('site-pages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'site-pages'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Website Pages
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'site-pages' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {sitePageList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('destinations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'destinations'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Destinations
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'destinations' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {destinationList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('guides')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'guides'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Guides &amp; Blogs
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'guides' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {guides.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('custom-pages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'custom-pages'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Custom Pages
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeSection === 'custom-pages' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {customPages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('redirects')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'redirects'
                ? 'bg-[#9b0000] text-white shadow-xs'
                : 'bg-[#FDF2F2] text-[#9b0000] border border-[#F5C2C2] hover:bg-[#FCE8E8]'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            301 Redirects &amp; Migration
          </button>
        </div>
      </div>

      {/* When 301 Redirects tab is selected, render RedirectsManager */}
      {activeSection === 'redirects' ? (
        <RedirectsManager />
      ) : (
        <>
          {/* Sub-Filters: Search Bar + Tour Type Pills + Score */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search pages, tour packages, destinations, keywords, or URLs..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#9b0000] font-medium"
                />
              </div>

              {/* SEO Score Selector */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#9b0000] font-bold text-stone-700"
                >
                  <option value="all">All SEO Scores</option>
                  <option value="needs-work">Needs Work (&lt; 60)</option>
                  <option value="good">Good (60 - 79)</option>
                  <option value="optimal">Optimal (80 - 100)</option>
                </select>
              </div>
            </div>

            {/* Tour Type Filter Row (Shows whenever viewing All or Tour Packages) */}
            {(activeSection === 'all' || activeSection === 'tours') && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#9b0000]" />
                  Tour Type:
                </span>

                {(['all', 'Family', 'Honeymoon', 'Pilgrimage', 'Group', 'Other'] as TourTypeFilter[]).map(
                  (type) => {
                    const isSelected = tourTypeFilter === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTourTypeFilter(type)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#9b0000] text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : `${type} Tours`}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Content Listing - Clean, Uncluttered Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-bold">
              <span>Showing {filteredItems.length} indexed items</span>
              <span>All links verified with https://holidayshunt.com</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-2 shadow-xs">
                <Search className="w-8 h-8 text-stone-300 mx-auto" />
                <h4 className="text-base font-bold text-stone-800">No content items found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your search query, section tab, or Tour Type filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredItems.map((item) => {
                  const score = getItemScore(item);
                  return (
                    <div
                      key={`${item.itemType}-${item.id}`}
                      className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-4 sm:p-5 shadow-xs transition hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Item Info */}
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* SEO / OG Image Thumbnail */}
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                          {item.ogImage ? (
                            <img
                              src={resolveDisplayImage(item.ogImage, mediaAssets)}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, item.ogImage, mediaAssets)}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 bg-stone-50">
                              <ImageIcon className="w-4 h-4 text-stone-300" />
                              <span className="text-[8px] font-bold text-stone-400 mt-0.5">No Img</span>
                            </div>
                          )}
                        </div>

                        {/* Title, Category & Canonical URL */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-black uppercase tracking-wider">
                              {item.itemType.replace('-', ' ')}
                            </span>

                            {item.itemType === 'tour' && (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  (item.tourType || '').toLowerCase().includes('honeymoon')
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : (item.tourType || '').toLowerCase().includes('pilgrimage')
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : (item.tourType || '').toLowerCase().includes('family')
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-sky-50 text-sky-800 border border-sky-200'
                                }`}
                              >
                                {item.tourType || 'Family'} Tour
                              </span>
                            )}

                            {item.destination && (
                              <span className="text-[11px] font-medium text-stone-400">
                                • {item.destination}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-black text-stone-900 truncate">
                            {item.name}
                          </h3>

                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500 truncate">
                            <Globe className="w-3 h-3 text-[#9b0000] shrink-0" />
                            <span className="text-stone-700 font-semibold truncate">
                              {item.canonicalUrl}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Focus Keyword & Snippet Status */}
                      <div className="hidden lg:flex flex-col gap-1 w-64 shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-stone-600">
                          <Tag className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="font-bold text-stone-700 truncate">
                            {item.focusKeyword || 'No keyword set'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                          <span
                            className={
                              item.metaTitle && item.metaTitle.length <= 60
                                ? 'text-emerald-700 font-bold'
                                : 'text-amber-600 font-bold'
                            }
                          >
                            Title: {item.metaTitle?.length || 0}c
                          </span>
                          <span className="text-stone-300">•</span>
                          <span
                            className={
                              item.metaDescription && item.metaDescription.length <= 160
                                ? 'text-emerald-700 font-bold'
                                : 'text-amber-600 font-bold'
                            }
                          >
                            Desc: {item.metaDescription?.length || 0}c
                          </span>
                          <span className="text-stone-300">•</span>
                          {item.ogImage ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> R2
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold">No OG</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Score Meter & Quick Edit Action */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 border border-stone-200">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="text-xs font-black text-stone-800">{score}/100</span>
                        </div>

                        {item.itemType === 'page' && (
                          <button
                            type="button"
                            onClick={() => handleDeletePageSeo(item.id, item.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-extrabold rounded-xl transition cursor-pointer active:scale-95"
                            title="Delete SEO Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9b0000] text-white text-xs font-extrabold rounded-xl hover:bg-[#7D0000] transition cursor-pointer shadow-2xs active:scale-98"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Edit SEO {item.itemType === 'tour' ? '& Tour Type' : ''}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Unified SEO Modal */}
      <UnifiedSEOModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import { GuideArticle, GuideStatus } from '../../types/guide';
import { analyzeOnPageSeo } from '../../utils/seoEngine';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  Sparkles,
  Tag,
  MapPin,
  Check,
  AlertCircle,
  ArrowRight,
  Filter,
  FileText,
  Send,
  RotateCcw,
  Globe,
} from 'lucide-react';

interface GuideManagerProps {
  onEditGuide: (guide: GuideArticle) => void;
  onCreateGuide: () => void;
}

export const GuideManager: React.FC<GuideManagerProps> = ({ onEditGuide, onCreateGuide }) => {
  const {
    guides,
    guideCategories,
    deleteGuide,
    moveGuideToReview,
    publishGuide,
    returnGuideToDraft,
    navigateToGuideDetail,
  } = useTours();

  const [activeTab, setActiveTab] = useState<'all' | GuideStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  // Workflow statistics
  const stats = useMemo(() => {
    const total = guides.length;
    const published = guides.filter((g) => g.status === 'published').length;
    const review = guides.filter((g) => g.status === 'review').length;
    const draft = guides.filter((g) => g.status === 'draft').length;
    return { total, published, review, draft };
  }, [guides]);

  // Filtered guides
  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      // Status filter
      if (activeTab !== 'all' && g.status !== activeTab) return false;

      // Category filter
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = g.title.toLowerCase().includes(query);
        const matchDest = g.destination.toLowerCase().includes(query);
        const matchKeyword = (g.seo?.primaryKeyword || '').toLowerCase().includes(query);
        const matchSlug = g.slug.toLowerCase().includes(query);
        if (!matchTitle && !matchDest && !matchKeyword && !matchSlug) return false;
      }

      return true;
    });
  }, [guides, activeTab, selectedCategory, searchQuery]);

  const handleDeleteConfirm = () => {
    if (deleteModalId) {
      deleteGuide(deleteModalId);
      setDeleteModalId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Content & SEO Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Pilgrimage & Travel Guides
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage comprehensive temple guides, yatra routes, and AI-optimized SEO articles for devotees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 bg-stone-50 hover:bg-stone-100 text-xs font-semibold transition"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>View Public /guide</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
          <button
            onClick={onCreateGuide}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md shadow-stone-900/15 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create New Guide</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Guides</span>
            <BookOpen className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-stone-400">All registered articles</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Published (Public)</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">{stats.published}</p>
          <span className="text-[11px] text-emerald-700">Live on /guide section</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">In Review</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-950 mt-2">{stats.review}</p>
          <span className="text-[11px] text-blue-700">Awaiting editorial sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Drafts</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-2">{stats.draft}</p>
          <span className="text-[11px] text-amber-700">In progress / hidden</span>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Guides ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Published ({stats.published})
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'review'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
              In Review ({stats.review})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'draft'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              Drafts ({stats.draft})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, keywords..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
            >
              <option value="all">All Categories</option>
              {guideCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Guide List */}
      {filteredGuides.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No guides match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search keywords, status tab, or category filter to discover articles.
          </p>
          <button
            onClick={onCreateGuide}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-black"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Guide</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredGuides.map((guide) => {
            // Run quick on-page SEO analysis
            const seoResult = analyzeOnPageSeo({
              title: guide.title,
              metaTitle: guide.seo?.metaTitle || guide.title,
              metaDescription: guide.seo?.metaDescription || guide.excerpt,
              slug: guide.slug,
              content: guide.content,
              focusKeyword: guide.seo?.primaryKeyword || '',
              featuredImage: guide.featuredImage,
              imageAlt: guide.imageAlt,
            });

            return (
              <div
                key={guide.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-stone-300 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: thumbnail + info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                    <img
                      src={
                        guide.featuredImage ||
                        'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={guide.imageAlt || guide.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      {guide.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      )}
                      {guide.status === 'review' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          In Review
                        </span>
                      )}
                      {guide.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <FileText className="w-3 h-3" />
                          Draft
                        </span>
                      )}

                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium">
                        {guide.category}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {guide.destination}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 truncate" title={guide.title}>
                      {guide.title}
                    </h3>

                    <p className="text-xs text-stone-500 line-clamp-1 max-w-2xl">
                      {guide.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 pt-0.5">
                      <span>{guide.wordCount || 0} words</span>
                      <span>•</span>
                      <span>{guide.readingTimeMinutes || 1} min read</span>
                      {guide.seo?.primaryKeyword && (
                        <>
                          <span>•</span>
                          <span className="text-stone-600 font-medium">
                            KW: &quot;{guide.seo.primaryKeyword}&quot;
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        Updated:{' '}
                        {new Date(guide.updatedAt || guide.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: SEO score + Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* SEO Score Pill */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                      seoResult.score >= 80
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : seoResult.score >= 50
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                    title={`SEO Audit: ${seoResult.score}/100`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SEO {seoResult.score}%</span>
                  </div>

                  {/* Workflow State Buttons */}
                  <div className="flex items-center gap-1.5">
                    {guide.status === 'draft' && (
                      <button
                        onClick={() => moveGuideToReview(guide.id)}
                        className="p-2 rounded-xl text-stone-600 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="Submit for Review"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {(guide.status === 'draft' || guide.status === 'review') && (
                      <button
                        onClick={() => publishGuide(guide.id)}
                        className="p-2 rounded-xl text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Publish Article Live"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {guide.status === 'published' && (
                      <button
                        onClick={() => returnGuideToDraft(guide.id)}
                        className="p-2 rounded-xl text-stone-600 hover:text-amber-700 hover:bg-amber-50 transition"
                        title="Unpublish (Return to Draft)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    {/* View Live / Preview */}
                    <button
                      onClick={() => navigateToGuideDetail(guide.slug)}
                      className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                      title="View Article"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditGuide(guide)}
                      className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                      title="Edit Guide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteModalId(guide.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Guide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">Delete Guide Article?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete this guide? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

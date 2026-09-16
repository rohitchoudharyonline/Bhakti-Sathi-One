import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { CustomPage } from '../../types/cms';
import { analyzeOnPageSeo } from '../../utils/seoEngine';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import { UniversalImageUploader } from './UniversalImageUploader';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const CustomPagesManager: React.FC = () => {
  const {
    customPages,
    addCustomPage,
    updateCustomPage,
    deleteCustomPage,
    navigateToCustomPage,
  } = useTours();

  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    slug: string;
    subtitle: string;
    heroImage: string;
    content: string;
    showInHeaderNav: boolean;
    showInFooterNav: boolean;
    status: 'published' | 'draft';
    focusKeyword: string;
    metaTitle: string;
    metaDescription: string;
  }>({
    title: '',
    slug: '',
    subtitle: '',
    heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
    content: `# Page Title\n\nWrite your page content here...`,
    showInHeaderNav: false,
    showInFooterNav: true,
    status: 'published',
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
  });

  const handleStartCreate = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
      content: `# New Page Title\n\nProvide rich information for your travelers...`,
      showInHeaderNav: false,
      showInFooterNav: true,
      status: 'published',
      focusKeyword: '',
      metaTitle: '',
      metaDescription: '',
    });
    setActiveTab('editor');
  };

  const handleStartEdit = (page: CustomPage) => {
    setEditingPage(page);
    setFormData({
      id: page.id,
      title: page.title,
      slug: page.slug,
      subtitle: page.subtitle || '',
      heroImage: page.heroImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
      content: page.content,
      showInHeaderNav: page.showInHeaderNav,
      showInFooterNav: page.showInFooterNav,
      status: page.status,
      focusKeyword: page.seo?.focusKeyword || '',
      metaTitle: page.seo?.metaTitle || '',
      metaDescription: page.seo?.metaDescription || '',
    });
    setActiveTab('editor');
  };

  const handleSavePage = () => {
    const cleanSlug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload = {
      title: formData.title || 'Untitled Page',
      slug: cleanSlug,
      subtitle: formData.subtitle,
      heroImage: formData.heroImage,
      content: formData.content,
      showInHeaderNav: formData.showInHeaderNav,
      showInFooterNav: formData.showInFooterNav,
      status: formData.status,
      seo: {
        focusKeyword: formData.focusKeyword,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.subtitle,
      },
    };

    if (editingPage) {
      updateCustomPage({
        ...editingPage,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addCustomPage(payload as any);
    }

    setActiveTab('list');
  };

  const seoAudit = analyzeOnPageSeo({
    title: formData.title,
    metaTitle: formData.metaTitle,
    metaDescription: formData.metaDescription,
    slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
    content: formData.content,
    focusKeyword: formData.focusKeyword,
    featuredImage: formData.heroImage,
  });

  const filteredPages = customPages.filter((p) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }
    return true;
  });

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedPageIds.length === filteredPages.length && filteredPages.length > 0) {
      setSelectedPageIds([]);
    } else {
      setSelectedPageIds(filteredPages.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedPageIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedPageIds.length} selected page(s)? This action cannot be undone.`
      )
    ) {
      selectedPageIds.forEach((id) => deleteCustomPage(id));
      setSelectedPageIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Custom Pages CMS
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create and edit static pages (About Us, Policies, Honeymoon Perks, FAQ) with custom slugs and Yoast SEO.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      {/* VIEW 1: PAGES LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Bulk Actions Sub-Bar */}
            {filteredPages.length > 0 && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      selectedPageIds.length === filteredPages.length &&
                      filteredPages.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span>Select All Pages ({filteredPages.length})</span>
                </label>

                {selectedPageIds.length > 0 && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {selectedPageIds.length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedPageIds.length})</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedPageIds.length === filteredPages.length &&
                        filteredPages.length > 0
                      }
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Page Title & Slug</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Placement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPages.map((page) => (
                  <tr
                    key={page.id}
                    className={`hover:bg-stone-50 transition ${
                      selectedPageIds.includes(page.id) ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedPageIds.includes(page.id)}
                        onChange={() => handleToggleSelect(page.id)}
                        className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-black">{page.title}</p>
                      <p className="text-[10px] text-stone-400 font-mono">/page/{page.slug}</p>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        {page.showInHeaderNav && (
                          <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] text-stone-700 font-medium">
                            Header Nav
                          </span>
                        )}
                        {page.showInFooterNav && (
                          <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] text-stone-700 font-medium">
                            Footer Links
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {page.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigateToCustomPage(page.slug)}
                          className="p-1.5 hover:bg-stone-100 rounded-md text-stone-600 transition cursor-pointer"
                          title="Preview Live"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(page)}
                          className="p-1.5 hover:bg-stone-100 rounded-md text-stone-800 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${page.title}"?`)) {
                              deleteCustomPage(page.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PAGE EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <button
              onClick={() => setActiveTab('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pages</span>
            </button>

            <button
              onClick={handleSavePage}
              className="px-5 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {editingPage ? 'Update Page' : 'Publish Page'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                    Page Title (H1)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. About Holidays Hunt Travel"
                    value={formData.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        title: val,
                        slug: formData.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      });
                    }}
                    className="w-full text-lg font-bold p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold">Permalink:</span>
                  <span className="text-stone-400 font-mono">holidayshunt.com/page/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 p-1 bg-stone-50 border border-stone-200 rounded-md font-mono text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                    Subtitle / Hero Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description underneath title..."
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-600 uppercase">
                  Page Content (Markdown / HTML)
                </label>
                <textarea
                  rows={14}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right Column: Hero Image, Placement, SEO */}
            <div className="space-y-4">
              {/* Hero Image */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <UniversalImageUploader
                  label="Hero Banner Photo"
                  description="Upload banner photo for this page. Auto-compressed & stored in R2 bucket."
                  folder="pages"
                  defaultWidth={1600}
                  defaultFormat="webp"
                  currentUrl={formData.heroImage}
                  onImageSelected={(url, asset) => {
                    const chosen = url || asset?.url || asset?.storagePath || asset?.dataUrl || '';
                    setFormData({ ...formData, heroImage: chosen });
                  }}
                  showR2LibraryPicker={true}
                />
              </div>

              {/* Navigation Placements */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <span className="font-bold text-black uppercase tracking-wider block">
                  Menu Placements
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInHeaderNav}
                    onChange={(e) => setFormData({ ...formData, showInHeaderNav: e.target.checked })}
                    className="rounded text-black"
                  />
                  <span className="text-stone-700 font-medium">Show in Top Header Navigation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInFooterNav}
                    onChange={(e) => setFormData({ ...formData, showInFooterNav: e.target.checked })}
                    className="rounded text-black"
                  />
                  <span className="text-stone-700 font-medium">Show in Global Footer Links</span>
                </label>
              </div>

              {/* SEO Box */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black uppercase tracking-wider">Yoast SEO</span>
                  <span className="font-bold text-emerald-600">{seoAudit.score}/100</span>
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    value={formData.focusKeyword}
                    onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                    placeholder="e.g. Holidays Hunt Travel"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Title for search engines"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">SEO Description</label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Description for search snippets"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* R2 Media Selector Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                Select Photo from Cloudflare R2 Library
              </h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-stone-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <MediaR2StorageManager
              onSelectMedia={(url) => {
                setFormData({ ...formData, heroImage: url });
                setShowMediaModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

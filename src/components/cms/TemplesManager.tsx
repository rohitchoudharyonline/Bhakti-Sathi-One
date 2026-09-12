import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { TemplePlace, TempleCategory } from '../../data/templesData';
import { DestinationMeta } from '../../data/destinationsData';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { UniversalImageUploader } from './UniversalImageUploader';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import {
  Landmark,
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  Shirt,
  Calendar,
  Layers,
  ArrowLeft,
  Check,
  ExternalLink,
  PackageCheck,
  Tag,
  Eye,
  Info,
} from 'lucide-react';

const TEMPLE_CATEGORIES: { id: TempleCategory; label: string; bg: string; text: string; border: string }[] = [
  { id: 'Shaktipeeth', label: 'Shaktipeeth', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { id: 'Jyotirlinga', label: 'Jyotirlinga', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { id: 'Char Dham', label: 'Char Dham', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { id: 'Cave Shrine', label: 'Cave Shrine', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'Ancient Dham', label: 'Ancient Dham', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { id: 'Divya Desam', label: 'Divya Desam', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { id: 'Panch Kedar', label: 'Panch Kedar', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { id: 'Holy River Ghat', label: 'Holy River Ghat', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
];

export const TemplesManager: React.FC = () => {
  const {
    temples,
    packages,
    destinations,
    addTemple,
    updateTemple,
    deleteTemple,
    navigateToSearch,
  } = useTours();

  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [editingTemple, setEditingTemple] = useState<TemplePlace | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const destinationOptions = (Object.values(destinations || {}) as DestinationMeta[]);

  // Form State
  const [formData, setFormData] = useState<TemplePlace>({
    id: '',
    slug: '',
    name: '',
    hindiName: '',
    deity: '',
    category: 'Cave Shrine',
    city: '',
    state: '',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1000&q=80',
    tagline: '',
    description: '',
    darshanTimings: '',
    dressCode: '',
    bestTimeToVisit: '',
    featured: true,
    order: 1,
    destinationSlug: '',
  });

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleStartCreate = () => {
    setEditingTemple(null);
    setFormData({
      id: '',
      slug: '',
      name: '',
      hindiName: '',
      deity: '',
      category: 'Shaktipeeth',
      city: '',
      state: 'India',
      image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1000&q=80',
      tagline: '',
      description: '',
      darshanTimings: '5:00 AM - 9:00 PM',
      dressCode: 'Modest Devotional Attire',
      bestTimeToVisit: 'Year-Round',
      featured: true,
      order: temples.length + 1,
      destinationSlug: '',
    });
    setActiveTab('editor');
  };

  const handleStartEdit = (t: TemplePlace) => {
    setEditingTemple(t);
    setFormData({ ...t });
    setActiveTab('editor');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification('Temple or Place Name is required.', 'error');
      return;
    }

    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (editingTemple) {
      updateTemple({
        ...formData,
        slug,
      });
      showNotification(`"${formData.name}" updated successfully!`);
    } else {
      addTemple({
        ...formData,
        slug,
      });
      showNotification(`"${formData.name}" added to sacred shrines registry!`);
    }

    setActiveTab('list');
  };

  const handleDelete = (t: TemplePlace) => {
    if (window.confirm(`Are you sure you want to remove "${t.name}"? Packages linked to this temple will remain safe.`)) {
      deleteTemple(t.id);
      showNotification(`"${t.name}" removed successfully.`);
    }
  };

  // Helper: Count linked packages
  const getLinkedPackagesCount = (t: TemplePlace): number => {
    const tId = t.id.toLowerCase();
    const tSlug = t.slug.toLowerCase();
    const tName = t.name.toLowerCase();

    return packages.filter((pkg) => {
      if (pkg.templeIds?.includes(t.id) || pkg.templeIds?.includes(t.slug)) return true;
      if (pkg.temples?.some((name) => name.toLowerCase() === tName || name.toLowerCase().includes(tSlug))) return true;
      if (pkg.title.toLowerCase().includes(tName) || pkg.tagline?.toLowerCase().includes(tName)) return true;
      if (pkg.destination?.toLowerCase().includes(tName) || pkg.overview?.toLowerCase().includes(tName)) return true;
      return false;
    }).length;
  };

  // Filtered List
  const filteredTemples = temples.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.hindiName && t.hindiName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.deity && t.deity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-sm font-semibold transition-all ${
            feedbackMsg.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-stone-900 text-white border-stone-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Sacred Circuit Database
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {temples.length} Shrines Registered
            </span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#FF4B00]" />
            <span>Temples & Sacred Places Management</span>
          </h1>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Register and manage holy temples, Shaktipeeths, Jyotirlingas, and pilgrim places. Link them to Tour Packages for seamless frontend discovery and filtering.
          </p>
        </div>

        {activeTab === 'list' && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white font-bold text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sacred Temple / Place</span>
          </button>
        )}
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search temples, deities, cities, or categories..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00] transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All ({temples.length})
              </button>
              {TEMPLE_CATEGORIES.map((cat) => {
                const count = temples.filter((t) => t.category === cat.id).length;
                if (count === 0 && selectedCategoryFilter !== cat.id) return null;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-[#FF4B00] text-white border-[#FF4B00] shadow-xs'
                        : `${cat.bg} ${cat.text} ${cat.border} hover:opacity-80`
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temples Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemples.map((temple) => {
              const catConfig =
                TEMPLE_CATEGORIES.find((c) => c.id === temple.category) || TEMPLE_CATEGORIES[0];
              const linkedCount = getLinkedPackagesCount(temple);

              return (
                <div
                  key={temple.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image Card Header */}
                  <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                    <img
                      src={resolveDisplayImage(temple.image, temple.name)}
                      alt={temple.name}
                      onError={(e) => handleImageError(e, temple.name)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-xs ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
                      >
                        {temple.category}
                      </span>
                      {temple.featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-white backdrop-blur-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Title Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                      <h3 className="text-base font-black leading-tight drop-shadow-sm line-clamp-1">
                        {temple.name}
                      </h3>
                      {temple.hindiName && (
                        <p className="text-[11px] text-stone-300 font-medium drop-shadow-xs">
                          {temple.hindiName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#FF4B00] shrink-0" />
                        <span>
                          {temple.city}, {temple.state}
                        </span>
                      </div>

                      {temple.deity && (
                        <div className="text-[11px] text-stone-700 bg-stone-50 border border-stone-200/70 px-2.5 py-1 rounded-lg">
                          <span className="font-bold text-stone-900">Deity: </span>
                          <span>{temple.deity}</span>
                        </div>
                      )}

                      {temple.tagline && (
                        <p className="text-xs text-stone-500 italic line-clamp-2">
                          "{temple.tagline}"
                        </p>
                      )}
                    </div>

                    {/* Linked Packages & Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigateToSearch({
                            templeId: temple.id,
                            templeName: temple.name,
                          })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          linkedCount > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-50 text-stone-500 border border-stone-200'
                        }`}
                        title="View packages matching this temple"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>{linkedCount} {linkedCount === 1 ? 'Package' : 'Packages'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(temple)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Temple"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(temple)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Temple"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTemples.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-stone-200/80 p-8 space-y-3">
                <Landmark className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-bold text-stone-800">No temples found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your search query or category filter, or add a new temple.
                </p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Temple</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
           EDITOR TAB (ADD / EDIT TEMPLE & PLACE)
           ======================================================== */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-stone-900">
                    {editingTemple ? `Edit Shrine: ${editingTemple.name}` : 'Register New Temple / Sacred Place'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Configure names, holy category, image, and pilgrim guidelines.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Shrine Details</span>
                </button>
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* English Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <span>Temple / Sacred Place Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mata Vaishno Devi Bhawan"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              {/* Hindi Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Hindi / Sanskrit Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.hindiName || ''}
                  onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
                  placeholder="e.g., श्री माता वैष्णो देवी भवन"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              {/* Deity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Presiding Deity / Bhagwan
                </label>
                <input
                  type="text"
                  value={formData.deity || ''}
                  onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                  placeholder="e.g., Maa Vaishno Devi (Mahalakshmi, Mahakali, Mahasaraswati)"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Sacred Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TempleCategory })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                >
                  {TEMPLE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <span>City / Town / Mountain Region</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Katra (Trikuta Hills)"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <span>State / Union Territory</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Jammu & Kashmir"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              {/* Linked Destination (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Link to Destination Region (Optional)
                </label>
                <select
                  value={formData.destinationSlug || ''}
                  onChange={(e) => setFormData({ ...formData, destinationSlug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                >
                  <option value="">None (Standalone Temple)</option>
                  {destinationOptions.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name} ({d.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order & Featured */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                  />
                </div>

                <div className="space-y-1.5 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#FF4B00] focus:ring-[#FF4B00]"
                    />
                    <span className="text-xs font-bold text-stone-800">Featured Shrine</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Spiritual Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g., Holy Trikuta Hills Divine Shrine & Miraculous Natural Pindis"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
              />
            </div>

            {/* Image Upload & Management */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  Temple Photo / Image (Cloudflare R2 Auto-Optimized)
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="text-xs font-bold text-[#FF4B00] hover:underline"
                >
                  Pick from Media Catalog
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2 space-y-2">
                  <UniversalImageUploader
                    currentUrl={formData.image}
                    folder="destinations"
                    onImageSelected={(url) => setFormData({ ...formData, image: url })}
                    label="Upload High-Res Temple Photo"
                    defaultWidth={1200}
                    defaultFormat="webp"
                  />
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Or paste direct image URL here..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                  />
                </div>

                <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative h-32">
                  <img
                    src={resolveDisplayImage(formData.image, formData.name)}
                    alt="Preview"
                    onError={(e) => handleImageError(e, formData.name)}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Live Preview
                  </span>
                </div>
              </div>
            </div>

            {/* Pilgrim Guidelines & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Darshan Timings / Aartis</span>
                </label>
                <input
                  type="text"
                  value={formData.darshanTimings || ''}
                  onChange={(e) => setFormData({ ...formData, darshanTimings: e.target.value })}
                  placeholder="e.g., 24 Hours Open (Aarti 5:00 AM & 6:00 PM)"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-stone-500" />
                  <span>Dress Code</span>
                </label>
                <input
                  type="text"
                  value={formData.dressCode || ''}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  placeholder="e.g., Traditional Indian Attire"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Best Time to Visit</span>
                </label>
                <input
                  type="text"
                  value={formData.bestTimeToVisit || ''}
                  onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                  placeholder="e.g., March to November & Navratris"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700">
                Spiritual Overview & Historical Significance
              </label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the holy shrine, mythology, sacred vibrations, and pilgrimage rituals..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-[#FF4B00]"
              />
            </div>
          </div>
        </form>
      )}

      {/* Media Catalog Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#FF4B00]" />
                <span>Select from Media Catalog</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-stone-400 hover:text-stone-900 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            <MediaR2StorageManager
              isModalPicker
              onSelectAsset={(asset) => {
                setFormData({ ...formData, image: asset.url });
                setShowMediaModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Tag, Save, Plus, Trash2, Edit3, X, Search, FileText, Hash } from 'lucide-react';

export interface GuideTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const TagsManager: React.FC = () => {
  const { guides } = useTours();

  const [tags, setTags] = useState<GuideTag[]>(() => {
    try {
      const saved = localStorage.getItem('holidayshunt_guide_tags') || localStorage.getItem('bhakti_guide_tags');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'tag-1', name: 'Char Dham Yatra', slug: 'char-dham-yatra', description: 'Guides related to Yamunotri, Gangotri, Kedarnath, and Badrinath.' },
      { id: 'tag-2', name: 'Darshan Booking', slug: 'darshan-booking', description: 'VIP tickets and online slot registration rules.' },
      { id: 'tag-3', name: 'Travel Itinerary', slug: 'travel-itinerary', description: 'Day-by-day route maps and packing lists.' },
      { id: 'tag-4', name: 'Temple Architecture', slug: 'temple-architecture', description: 'Historical & spiritual background of ancient shrines.' },
      { id: 'tag-5', name: 'Senior Citizen Tips', slug: 'senior-citizen-tips', description: 'Helicopter, palki, and accessibility advice.' },
    ];
  });

  const saveTagsToStorage = (newTags: GuideTag[]) => {
    setTags(newTags);
    try {
      localStorage.setItem('holidayshunt_guide_tags', JSON.stringify(newTags));
    } catch {}
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<GuideTag | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({ name: '', slug: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (tagItem: GuideTag) => {
    setEditingTag(tagItem);
    setFormData({
      name: tagItem.name,
      slug: tagItem.slug,
      description: tagItem.description || '',
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingTag ? prev.slug : slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newTag: GuideTag = {
      id: editingTag ? editingTag.id : `tag-${Date.now()}`,
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim(),
    };

    let updated: GuideTag[];
    if (editingTag) {
      updated = tags.map((t) => (t.id === editingTag.id ? newTag : t));
    } else {
      updated = [...tags, newTag];
    }

    saveTagsToStorage(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete tag "${name}"?`)) {
      const updated = tags.filter((t) => t.id !== id);
      saveTagsToStorage(updated);
    }
  };

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedTagIds.length === filteredTags.length && filteredTags.length > 0) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(filteredTags.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedTagIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedTagIds.length} selected tag(s)?`
      )
    ) {
      const updated = tags.filter((t) => !selectedTagIds.includes(t.id));
      saveTagsToStorage(updated);
      setSelectedTagIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#FF4B00]" />
            <h2 className="text-2xl font-black text-stone-900">Tag Manager</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Manage post tags for keyword grouping, search indexing, and internal cross-linking.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#FF4B00] active:bg-[#d43e00] text-white rounded-xl font-bold hover:bg-[#e04200] transition shadow-xs cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Tag
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm bg-white outline-none focus:border-[#FF4B00]"
            />
          </div>
          <span className="text-xs font-bold text-stone-500 self-end sm:self-center">
            {filteredTags.length} Tags Total
          </span>
        </div>

        {/* Bulk Actions Sub-Bar */}
        {filteredTags.length > 0 && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedTagIds.length === filteredTags.length && filteredTags.length > 0
                }
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
              />
              <span>Select All Tags ({filteredTags.length})</span>
            </label>

            {selectedTagIds.length > 0 && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {selectedTagIds.length} Selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedTagIds.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1. MOBILE CARD LIST (visible on phones < 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredTags.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-sm">
            No tags found. Click "Add Tag" to create one.
          </div>
        ) : (
          filteredTags.map((tagItem) => {
            const count = guides.filter((g) =>
              g.tags?.some(
                (t) =>
                  t.toLowerCase() === tagItem.name.toLowerCase() ||
                  t.toLowerCase() === tagItem.slug.toLowerCase()
              )
            ).length;

            return (
              <div
                key={`mobile-tag-${tagItem.id}`}
                className={`border rounded-2xl p-4 space-y-3 shadow-2xs transition ${
                  selectedTagIds.includes(tagItem.id)
                    ? 'border-[#FF4B00] ring-2 ring-[#FF4B00]/20 bg-orange-50/20'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tagItem.id)}
                      onChange={() => handleToggleSelect(tagItem.id)}
                      className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer mt-1"
                    />
                    <div>
                      <div className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-[#FF4B00]" />
                        {tagItem.name}
                      </div>
                      <div className="text-xs font-mono text-stone-500 mt-1">/tag/{tagItem.slug}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold shrink-0">
                    <FileText className="w-3 h-3" />
                    {count} posts
                  </span>
                </div>

                {tagItem.description && (
                  <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    {tagItem.description}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(tagItem)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 active:bg-stone-200 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-[#FF4B00]" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tagItem.id, tagItem.name)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 active:bg-rose-100 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. DESKTOP TABLE VIEW (visible on md screens and up) */}
      <div className="hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedTagIds.length === filteredTags.length &&
                      filteredTags.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                  />
                </th>
                <th className="p-4">Tag Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Tagged Posts</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No tags found. Click "Add Tag" to create one.
                  </td>
                </tr>
              ) : (
                filteredTags.map((tagItem) => {
                  const count = guides.filter((g) =>
                    g.tags?.some(
                      (t) =>
                        t.toLowerCase() === tagItem.name.toLowerCase() ||
                        t.toLowerCase() === tagItem.slug.toLowerCase()
                    )
                  ).length;

                  return (
                    <tr
                      key={`desktop-tag-${tagItem.id}`}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        selectedTagIds.includes(tagItem.id) ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedTagIds.includes(tagItem.id)}
                          onChange={() => handleToggleSelect(tagItem.id)}
                          className="w-4 h-4 rounded border-stone-300 text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Hash className="w-4 h-4 text-[#FF4B00]" />
                          {tagItem.name}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-stone-500 whitespace-nowrap">
                        /tag/{tagItem.slug}
                      </td>
                      <td className="p-4 text-sm text-stone-600 max-w-xs truncate">
                        {tagItem.description || <span className="text-stone-300 italic">No description</span>}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                          <FileText className="w-3 h-3" />
                          {count} posts
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(tagItem)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                            title="Edit Tag"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#FF4B00]" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tagItem.id, tagItem.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                            title="Delete Tag"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-black text-stone-900 text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF4B00]" />
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 transition rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kedarnath Helicopter"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Tag Slug
                </label>
                <input
                  type="text"
                  placeholder="kedarnath-helicopter"
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-[#FF4B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Tag description for search archives..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00] resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF4B00] hover:bg-[#e04200] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {editingTag ? 'Update Tag' : 'Save Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

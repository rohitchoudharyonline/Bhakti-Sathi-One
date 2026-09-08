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
      const saved = localStorage.getItem('bhakti_guide_tags');
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
      localStorage.setItem('bhakti_guide_tags', JSON.stringify(newTags));
    } catch {}
  };

  const [searchTerm, setSearchTerm] = useState('');
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
    if (confirm(`Are you sure you want to delete tag "${name}"?`)) {
      const updated = tags.filter((t) => t.id !== id);
      saveTagsToStorage(updated);
    }
  };

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#FF4B00]" />
            <h2 className="text-2xl font-black text-stone-900">Tags</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Manage post tags for keyword grouping, search indexing, and internal cross-linking.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF4B00] text-white rounded-xl font-bold hover:bg-[#e04200] transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Tag
        </button>
      </div>

      {/* Tags Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-sm bg-white outline-none focus:border-[#FF4B00]"
            />
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {filteredTags.length} Tags Total
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-bold uppercase tracking-wider">
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
                <td colSpan={5} className="p-8 text-center text-stone-400">
                  No tags found. Click "Add Tag" to create one.
                </td>
              </tr>
            ) : (
              filteredTags.map((tagItem) => {
                const count = guides.filter((g) =>
                  g.tags?.some((t) => t.toLowerCase() === tagItem.name.toLowerCase() || t.toLowerCase() === tagItem.slug.toLowerCase())
                ).length;

                return (
                  <tr key={tagItem.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-[#FF4B00]" />
                        {tagItem.name}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-500">
                      /tag/{tagItem.slug}
                    </td>
                    <td className="p-4 text-sm text-stone-600 max-w-xs truncate">
                      {tagItem.description || <span className="text-stone-300 italic">No description</span>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                        <FileText className="w-3 h-3" />
                        {count} posts
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(tagItem)}
                          className="p-1.5 text-stone-500 hover:text-[#FF4B00] transition rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Edit Tag"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tagItem.id, tagItem.name)}
                          className="p-1.5 text-stone-500 hover:text-red-600 transition rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-4 h-4" />
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
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
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
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-[#FF4B00]"
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
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00] resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#FF4B00] hover:bg-[#e04200] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
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

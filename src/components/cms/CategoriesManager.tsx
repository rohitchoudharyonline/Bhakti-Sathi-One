import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Folder, Save, Plus, Trash2, Edit3, X, Search, FileText } from 'lucide-react';
import { GuideCategory } from '../../types/guide';

export const CategoriesManager: React.FC = () => {
  const { guideCategories, addGuideCategory, updateGuideCategory, deleteGuideCategory, guides } = useTours();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GuideCategory | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: GuideCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
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
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const categoryData: GuideCategory = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim(),
    };

    if (editingCategory) {
      updateGuideCategory(categoryData);
    } else {
      addGuideCategory(categoryData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteGuideCategory(id);
    }
  };

  const filteredCategories = guideCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#9b0000]" />
            <h2 className="text-2xl font-black text-stone-900">Category Manager</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Organize posts and guides into hierarchical categories.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#9b0000] active:bg-[#7D0000] text-white rounded-xl font-bold hover:bg-[#7D0000] transition shadow-xs cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm bg-white outline-none focus:border-[#9b0000]"
          />
        </div>
        <span className="text-xs font-bold text-stone-500 self-end sm:self-center">
          {filteredCategories.length} Categories Total
        </span>
      </div>

      {/* 1. MOBILE CARD LIST (visible on phones < 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-sm">
            No categories found. Click "Add Category" to create one.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const count = guides.filter(
              (g) =>
                g.category?.toLowerCase() === cat.name.toLowerCase() ||
                g.category?.toLowerCase() === cat.slug.toLowerCase()
            ).length;

            return (
              <div
                key={`mobile-cat-${cat.id}`}
                className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-stone-900 text-base flex items-center gap-2">
                      <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                      {cat.name}
                    </div>
                    <div className="text-xs font-mono text-stone-500 mt-1">
                      /category/{cat.slug}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold shrink-0">
                    <FileText className="w-3 h-3" />
                    {count} posts
                  </span>
                </div>

                {cat.description && (
                  <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    {cat.description}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 active:bg-stone-200 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-[#9b0000]" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
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
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Posts Count</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const count = guides.filter(
                    (g) =>
                      g.category?.toLowerCase() === cat.name.toLowerCase() ||
                      g.category?.toLowerCase() === cat.slug.toLowerCase()
                  ).length;

                  return (
                    <tr key={`desktop-cat-${cat.id}`} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          {cat.name}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-stone-500 whitespace-nowrap">
                        /category/{cat.slug}
                      </td>
                      <td className="p-4 text-sm text-stone-600 max-w-xs truncate">
                        {cat.description || <span className="text-stone-300 italic">No description</span>}
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
                            onClick={() => openEditModal(cat)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#9b0000]" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                            title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-black text-stone-900 text-lg flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#9b0000]" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jyotirlinga Yatra"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#9b0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Category Slug
                </label>
                <input
                  type="text"
                  placeholder="jyotirlinga-yatra"
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-[#9b0000]"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  URL-friendly version of the name. Auto-generated if left untouched.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description for SEO archive pages..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#9b0000] resize-none"
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
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#9b0000] hover:bg-[#7D0000] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

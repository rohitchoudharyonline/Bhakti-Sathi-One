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
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#FF4B00]" />
            <h2 className="text-2xl font-black text-stone-900">Category</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Organize posts and guides into hierarchical categories (WordPress Taxonomy).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF4B00] text-white rounded-xl font-bold hover:bg-[#e04200] transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-sm bg-white outline-none focus:border-[#FF4B00]"
            />
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {filteredCategories.length} Categories Total
          </span>
        </div>

        <table className="w-full text-left border-collapse">
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
                  (g) => g.category?.toLowerCase() === cat.name.toLowerCase() || g.category?.toLowerCase() === cat.slug.toLowerCase()
                ).length;

                return (
                  <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                        {cat.name}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-500">
                      /category/{cat.slug}
                    </td>
                    <td className="p-4 text-sm text-stone-600 max-w-xs truncate">
                      {cat.description || <span className="text-stone-300 italic">No description</span>}
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
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-stone-500 hover:text-[#FF4B00] transition rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-stone-500 hover:text-red-600 transition rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-black text-stone-900 text-lg flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#FF4B00]" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jyotirlinga Yatra"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#FF4B00]"
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
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-[#FF4B00]"
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

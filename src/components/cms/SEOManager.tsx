import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Search, Save, Edit3, X, BarChart, Globe, Tag } from 'lucide-react';
import { GuideArticle } from '../../types/guide';

export const SEOManager: React.FC = () => {
  const { guides, updateGuide } = useTours();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuide, setEditingGuide] = useState<GuideArticle | null>(null);

  const filteredGuides = guides.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      updateGuide(editingGuide);
      setEditingGuide(null);
    }
  };

  if (editingGuide) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900">Rank Math SEO</h2>
            <p className="text-stone-500">Editing SEO for: {editingGuide.title}</p>
          </div>
          <button 
            onClick={() => setEditingGuide(null)}
            className="p-2 text-stone-400 hover:text-stone-900 transition rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSaveSeo} className="bg-white rounded-xl border border-stone-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Search Snippet Preview</h3>
              <p className="text-sm text-stone-500">How this post appears in search results</p>
            </div>
          </div>
          
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 mb-6 font-sans">
             <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate">
               {editingGuide.seo?.metaTitle || editingGuide.title}
             </div>
             <div className="text-[#006621] text-sm mb-1 truncate">
               https://mybhaktisathi.com/guides/{editingGuide.slug}
             </div>
             <div className="text-[#545454] text-sm line-clamp-2">
               {editingGuide.seo?.metaDescription || "No description provided. Search engines will generate a snippet from the page content."}
             </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Focus Keyword</label>
              <input
                type="text"
                value={editingGuide.seo?.primaryKeyword || ''}
                onChange={(e) => setEditingGuide({ ...editingGuide, seo: { ...editingGuide.seo, primaryKeyword: e.target.value } as any })}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Enter focus keyword..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">SEO Title</label>
              <input
                type="text"
                value={editingGuide.seo?.metaTitle || ''}
                onChange={(e) => setEditingGuide({ ...editingGuide, seo: { ...editingGuide.seo, metaTitle: e.target.value } as any })}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Enter meta title..."
              />
              <div className="text-xs text-stone-500 mt-1 text-right">
                {(editingGuide.seo?.metaTitle?.length || 0)} / 60 chars
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={editingGuide.seo?.metaDescription || ''}
                onChange={(e) => setEditingGuide({ ...editingGuide, seo: { ...editingGuide.seo, metaDescription: e.target.value } as any })}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                placeholder="Enter meta description..."
              />
              <div className="text-xs text-stone-500 mt-1 text-right">
                {(editingGuide.seo?.metaDescription?.length || 0)} / 160 chars
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setEditingGuide(null)}
              className="px-4 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update SEO
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900">Rank Math SEO</h2>
          <p className="text-stone-500">Manage SEO titles, descriptions, and keywords for all pages.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
          <Search className="w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search pages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 outline-none text-sm bg-transparent"
          />
        </div>
      </div>
      
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm font-semibold">
              <th className="p-4">Page / Post Title</th>
              <th className="p-4">Focus Keyword</th>
              <th className="p-4">SEO Score</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuides.map((guide) => {
              // Basic mock score calculation based on presence of data
              let score = 0;
              if (guide.seo?.metaTitle) score += 33;
              if (guide.seo?.metaDescription) score += 33;
              if (guide.seo?.primaryKeyword) score += 34;

              return (
                <tr key={guide.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-4">
                    <div className="font-bold text-stone-900">{guide.title}</div>
                    <div className="text-xs text-stone-400 mt-1">/guides/{guide.slug}</div>
                  </td>
                  <td className="p-4">
                    {guide.seo?.primaryKeyword ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
                        <Tag className="w-3 h-3" />
                        {guide.seo.primaryKeyword}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs italic">Not set</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div 
                          className={`h-full ${score > 80 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${score}%` }} 
                        />
                      </div>
                      <span className={`text-xs font-bold ${score > 80 ? 'text-emerald-600' : score > 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {score}/100
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setEditingGuide(guide)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit SEO
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

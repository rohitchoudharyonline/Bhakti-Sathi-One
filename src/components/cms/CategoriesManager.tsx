import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { Tag, Save, Plus, Trash2, Edit3, X } from 'lucide-react';
import { GuideCategory } from '../../types/guide';

export const CategoriesManager: React.FC = () => {
  const { guideCategories } = useTours();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900">Categories & Tags</h2>
          <p className="text-stone-500">Manage post categories and tags for your content.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg font-bold hover:bg-stone-800 transition">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>
      
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm font-semibold">
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Count</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guideCategories.map((cat) => (
              <tr key={cat.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="p-4 font-bold text-stone-900">{cat.name}</td>
                <td className="p-4 text-stone-500">{cat.slug}</td>
                <td className="p-4 text-stone-500">--</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-stone-400 hover:text-amber-600 transition rounded-lg hover:bg-amber-50">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-stone-400 hover:text-red-600 transition rounded-lg hover:bg-red-50">
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
  );
};

import React, { useState } from 'react';
import { DEFAULT_MANTRAS, MantraPreset } from '../../../types/japCounter';
import { X, Sparkles, Check, Plus } from 'lucide-react';

interface MantraSelectorModalProps {
  isOpen: boolean;
  activeMantra: string;
  onSelectMantra: (mantra: string) => void;
  onClose: () => void;
}

export const MantraSelectorModal: React.FC<MantraSelectorModalProps> = ({
  isOpen,
  activeMantra,
  onSelectMantra,
  onClose,
}) => {
  const [customMantraInput, setCustomMantraInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Shiva' | 'Devi' | 'Vishnu' | 'Universal'>('All');

  if (!isOpen) return null;

  const filteredMantras = selectedCategory === 'All'
    ? DEFAULT_MANTRAS
    : DEFAULT_MANTRAS.filter((m) => m.category === selectedCategory);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMantraInput.trim()) return;
    onSelectMantra(customMantraInput.trim());
    setCustomMantraInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden text-stone-900">
        {/* Header */}
        <div className="bg-stone-50 text-stone-900 p-5 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9b0000] to-amber-500 text-white grid place-items-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-serif text-stone-900">
                Choose Sacred Mantra
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Select your devotional focus for Japa chanting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 grid place-items-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-3 bg-stone-100/80 border-b border-stone-200 overflow-x-auto">
          {(['All', 'Shiva', 'Devi', 'Vishnu', 'Universal'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#9b0000] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {cat === 'All' ? 'All Mantras' : cat}
            </button>
          ))}
        </div>

        {/* Mantras List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredMantras.map((m: MantraPreset) => {
            const isSelected = activeMantra === m.name;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMantra(m.name);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FDF2F2] border-[#9b0000] ring-1 ring-[#9b0000]/40 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:border-amber-300 hover:bg-white'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black font-serif text-stone-900">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      {m.category}
                    </span>
                  </div>
                  <div className="text-xs text-[#9b0000] font-semibold italic">
                    {m.transliteration}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {m.meaning}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#9b0000] text-white grid place-items-center shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Mantra Input Box */}
          <form onSubmit={handleCustomSubmit} className="pt-2">
            <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1.5">
              Or Type Custom Sacred Mantra
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customMantraInput}
                onChange={(e) => setCustomMantraInput(e.target.value)}
                placeholder="e.g. ॐ गं गणपतये नमः"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-[#9b0000] bg-white shadow-2xs"
              />
              <button
                type="submit"
                disabled={!customMantraInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#9b0000] hover:bg-[#7D0000] disabled:bg-stone-200 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Use Mantra</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { FAQItem } from '../../types/tour';
import {
  Save,
  HelpCircle,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  FileEdit,
  RotateCcw,
} from 'lucide-react';

export const FaqsManager: React.FC = () => {
  const { agencySettings, updateAgencySettings } = useTours();

  const [faqs, setFaqs] = useState<FAQItem[]>(() => agencySettings.faqs || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // New FAQ form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Editing FAQ temporary state
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAll = (updatedFaqs: FAQItem[]) => {
    updateAgencySettings({
      ...agencySettings,
      faqs: updatedFaqs,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };

    const updated = [...faqs, newItem];
    setFaqs(updated);
    handleSaveAll(updated);

    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ? This will be updated on the storefront immediately.')) {
      const updated = faqs.filter((faq) => faq.id !== id);
      setFaqs(updated);
      handleSaveAll(updated);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const handleStartEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;

    const updated = faqs.map((faq) => {
      if (faq.id === id) {
        return {
          ...faq,
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
        };
      }
      return faq;
    });

    setFaqs(updated);
    handleSaveAll(updated);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setFaqs(updated);
    handleSaveAll(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setFaqs(updated);
    handleSaveAll(updated);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6" id="faq-cms-manager">
      {/* Top Title and Actions */}
      <div className="pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF4B00]" />
            Homepage FAQ Questions & Answers
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage the FAQ schema and accordions. These items sync dynamically with the search engine schemas on the guest homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
              <CheckCircle2 className="w-4 h-4" />
              Synced with Storefront
            </span>
          )}
        </div>
      </div>

      {/* Grid Layout: Left Add form, Right interactive FAQ list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Create New FAQ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#FF4B00]" /> Create New FAQ Question
            </h4>
            
            <form onSubmit={handleAddFaq} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Question text *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Does Bhakti Sathi offer senior citizen assistance?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#FF4B00] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Detailed Answer *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write a clear, professional answer explaining Bhakti Sathi's facilitation..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#FF4B00] focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add & Publish FAQ
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Manage FAQs with Order Buttons */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search existing questions & answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden font-medium"
            />
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const globalIndex = faqs.findIndex((item) => item.id === faq.id);
                const isEditing = editingId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`p-4 rounded-2xl border transition ${
                      isEditing
                        ? 'border-[#FF4B00] bg-orange-50/25'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    {isEditing ? (
                      // Inline edit form
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <span className="text-[10px] font-extrabold text-[#FF4B00] uppercase tracking-wider">
                            Editing Question #{globalIndex + 1}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-[11px] font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(faq.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                            >
                              Save Edit
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                            className="w-full text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-lg px-2.5 py-2"
                          />
                          <textarea
                            rows={3}
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            className="w-full text-xs text-stone-600 bg-white border border-stone-200 rounded-lg px-2.5 py-2"
                          />
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-stone-400">
                              FAQ #{globalIndex + 1}
                            </span>
                            <h5 className="text-xs font-extrabold text-stone-900 leading-snug">
                              {faq.question}
                            </h5>
                          </div>

                          {/* Control actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={globalIndex === 0}
                              onClick={() => handleMoveUp(globalIndex)}
                              className={`p-1 rounded-md transition ${
                                globalIndex === 0
                                  ? 'text-stone-300 cursor-not-allowed'
                                  : 'text-stone-500 hover:text-[#FF4B00] hover:bg-stone-100'
                              }`}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={globalIndex === faqs.length - 1}
                              onClick={() => handleMoveDown(globalIndex)}
                              className={`p-1 rounded-md transition ${
                                globalIndex === faqs.length - 1
                                  ? 'text-stone-300 cursor-not-allowed'
                                  : 'text-stone-500 hover:text-[#FF4B00] hover:bg-stone-100'
                              }`}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(faq)}
                              className="p-1 text-stone-500 hover:text-blue-600 hover:bg-stone-100 rounded-md transition"
                              title="Edit"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                              title="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed pl-px">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-stone-400 border border-dashed border-stone-200 rounded-2xl">
                <p className="text-xs font-semibold">No questions found matching your search.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

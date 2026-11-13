import React, { useMemo, useState } from 'react';
import { useTours } from '../../context/TourContext';
import { GalleryItem, TourPackage, TourReview } from '../../types/tour';
import { Check, ChevronDown, ChevronUp, ImagePlus, Pencil, Plus, Star, Trash2, X, Sparkles } from 'lucide-react';
import { UniversalImageUploader } from './UniversalImageUploader';

export const TourContentStudio: React.FC<{
  onClose: () => void;
  initialPackageId?: string;
}> = ({ onClose, initialPackageId }) => {
  const { packages, updatePackage } = useTours();
  const [packageId, setPackageId] = useState(
    initialPackageId || packages[0]?.id || ''
  );
  const [mode, setMode] = useState<'media' | 'reviews'>('media');
  const pkg = packages.find((p) => p.id === packageId) || packages[0];
  const [mediaForm, setMediaForm] = useState({ url: '', caption: '' });
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    text: '',
    location: '',
    date: new Date().toISOString().slice(0, 10),
    verified: false,
    photoUrl: '',
  });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const reviews = pkg?.reviews ?? [];
  const avg = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0,
    [reviews]
  );

  if (!pkg) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="p-8 bg-white rounded-3xl max-w-md text-center space-y-4 shadow-xl">
          <p className="font-bold text-stone-700">No tour packages available.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const persist = (next: TourPackage) => {
    updatePackage(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const addMedia = () => {
    if (!mediaForm.url.trim()) return;
    const item: GalleryItem = {
      id: `gallery-${Date.now()}`,
      url: mediaForm.url.trim(),
      caption: mediaForm.caption.trim() || pkg.title,
    };
    persist({
      ...pkg,
      gallery: [...(pkg.gallery ?? []), item],
      coverImage: pkg.coverImage || item.url,
    });
    setMediaForm({ url: '', caption: '' });
  };

  const removeMedia = (id: string) =>
    persist({
      ...pkg,
      gallery: (pkg.gallery ?? []).filter((g) => g.id !== id),
    });

  const setCover = (id: string) => {
    const item = (pkg.gallery ?? []).find((g) => g.id === id);
    if (item) persist({ ...pkg, coverImage: item.url });
  };

  const moveMedia = (index: number, direction: -1 | 1) => {
    const next = [...(pkg.gallery ?? [])];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persist({ ...pkg, gallery: next });
  };

  const resetReviewForm = () =>
    setReviewForm({
      author: '',
      rating: 5,
      text: '',
      location: '',
      date: new Date().toISOString().slice(0, 10),
      verified: false,
      photoUrl: '',
    });

  const saveReview = () => {
    if (!reviewForm.author.trim() || !reviewForm.text.trim()) return;
    const current = [...reviews];
    const item: TourReview = {
      id: editingReviewId ?? `review-${Date.now()}`,
      author: reviewForm.author.trim(),
      rating: reviewForm.rating,
      text: reviewForm.text.trim(),
      date: reviewForm.date,
      location: reviewForm.location.trim(),
      verified: reviewForm.verified,
      photoUrl: reviewForm.photoUrl.trim(),
    };
    const next = editingReviewId
      ? current.map((r) => (r.id === editingReviewId ? item : r))
      : [item, ...current];
    const rating = next.length
      ? Number((next.reduce((s, r) => s + r.rating, 0) / next.length).toFixed(1))
      : pkg.rating;
    persist({ ...pkg, reviews: next, rating, reviewCount: next.length });
    resetReviewForm();
    setEditingReviewId(null);
  };

  const editReview = (r: TourReview) => {
    setEditingReviewId(r.id);
    setReviewForm({
      author: r.author,
      rating: r.rating,
      text: r.text,
      location: r.location ?? '',
      date: r.date,
      verified: r.verified === true,
      photoUrl: r.photoUrl ?? '',
    });
  };

  const deleteReview = (id: string) => {
    const next = reviews.filter((r) => r.id !== id);
    const rating = next.length
      ? Number((next.reduce((s, r) => s + r.rating, 0) / next.length).toFixed(1))
      : 0;
    persist({ ...pkg, reviews: next, rating, reviewCount: next.length });
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-auto flex items-center justify-center">
      <div className="w-full max-w-6xl bg-stone-50 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-stone-200">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-stone-200 p-4 sm:p-5 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#9b0000] text-white grid place-items-center font-black text-sm">
            <ImagePlus className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <b className="block text-sm sm:text-base font-black truncate text-stone-900">
              Tour Content Studio & Cloudflare R2
            </b>
            <span className="text-[11px] text-stone-500 font-medium">
              High-resolution photo galleries & verified traveler testimonials
            </span>
          </div>
          {saved && (
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition cursor-pointer text-stone-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Studio Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                Selected Tour Package:
              </label>
              <select
                value={packageId}
                onChange={(e) => {
                  setPackageId(e.target.value);
                  setEditingReviewId(null);
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-black text-stone-900"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex bg-stone-100 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setMode('media')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'media' ? 'bg-[#9b0000] text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                <ImagePlus className="w-3.5 h-3.5" /> Photos Gallery ({pkg.gallery?.length ?? 0})
              </button>
              <button
                onClick={() => setMode('reviews')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'reviews' ? 'bg-[#9b0000] text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                <Star className="w-3.5 h-3.5" /> Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* MODE 1: PHOTOS GALLERY */}
          {mode === 'media' ? (
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
              {/* Left: Universal Uploader */}
              <div className="space-y-4">
                <UniversalImageUploader
                  label="Upload & Compress Gallery Photo"
                  description="Auto-compresses to R2 WebP/PNG with selectable width (700, 800, 1000, 1200, 1600)"
                  folder="tours"
                  defaultWidth={1000}
                  defaultFormat="webp"
                  currentUrl={mediaForm.url}
                  onImageSelected={(url) => setMediaForm((f) => ({ ...f, url }))}
                />

                <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
                  <label className="text-xs font-bold text-stone-700 block">
                    Photo Caption / Title (Optional)
                  </label>
                  <input
                    value={mediaForm.caption}
                    onChange={(e) =>
                      setMediaForm({ ...mediaForm, caption: e.target.value })
                    }
                    placeholder={`e.g. Kedarnath Mandir Sunset View`}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={addMedia}
                    disabled={!mediaForm.url.trim()}
                    className="w-full py-2.5 rounded-xl bg-[#9b0000] hover:bg-[#7D0000] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Tour Gallery</span>
                  </button>
                </div>
              </div>

              {/* Right: Existing Gallery Photos */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">
                      {pkg.title} Gallery
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {pkg.gallery?.length ?? 0} photos uploaded · Drag order or set cover image
                    </p>
                  </div>
                  {pkg.coverImage && (
                    <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                      Cover Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {(pkg.gallery ?? []).map((photo, index) => (
                    <div
                      key={photo.id}
                      className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 flex flex-col group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-stone-900">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] font-black backdrop-blur-xs">
                          #{index + 1}
                        </span>
                        {pkg.coverImage === photo.url && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[9px] font-black shadow-xs">
                            COVER
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-[11px] font-bold text-stone-800 line-clamp-2">
                          {photo.caption || 'Tour Attraction'}
                        </p>
                        <div className="flex items-center gap-1 pt-1 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setCover(photo.id)}
                            className="flex-1 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-black text-stone-800 cursor-pointer"
                          >
                            Set Cover
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMedia(index, -1)}
                            className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                            title="Move Left"
                          >
                            <ChevronUp className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMedia(index, 1)}
                            className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                            title="Move Right"
                          >
                            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMedia(photo.id)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!pkg.gallery || pkg.gallery.length === 0) && (
                    <div className="col-span-full py-16 text-center space-y-2">
                      <ImagePlus className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-xs text-stone-400 font-bold">
                        No photos added to this tour gallery yet.
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Use the upload tool on the left to upload images directly to Cloudflare R2.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: REVIEWS & TESTIMONIALS */
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
              {/* Left: Review Creator with Traveler Photo Uploader */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-[10px] uppercase tracking-wider text-[#9b0000] font-black">
                    {editingReviewId ? 'EDIT REVIEW' : 'ADD NEW REVIEW'}
                  </span>
                  {editingReviewId && (
                    <button
                      onClick={() => {
                        setEditingReviewId(null);
                        resetReviewForm();
                      }}
                      className="text-xs font-bold text-stone-500 hover:text-stone-800"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Traveler Name
                    </label>
                    <input
                      value={reviewForm.author}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, author: e.target.value })
                      }
                      placeholder="e.g. Ramesh Chandra Sharma"
                      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Location / City
                      </label>
                      <input
                        value={reviewForm.location}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, location: e.target.value })
                        }
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Rating (1 to 5)
                      </label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            rating: Number(e.target.value),
                          })
                        }
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-black bg-stone-50"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {'★'.repeat(n)} ({n}/5 Stars)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={reviewForm.date}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, date: e.target.value })
                      }
                      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Review Experience
                    </label>
                    <textarea
                      value={reviewForm.text}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, text: e.target.value })
                      }
                      placeholder="Write customer feedback about hotels, helicopter darshan, fleet, and driver..."
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-xs bg-stone-50 min-h-24"
                    />
                  </div>

                  {/* Compact Traveler Photo Uploader with Auto-Compression */}
                  <UniversalImageUploader
                    variant="compact"
                    label="Traveler Photo (Auto-compressed to R2)"
                    folder="reviews"
                    defaultWidth={800}
                    defaultFormat="webp"
                    currentUrl={reviewForm.photoUrl}
                    onImageSelected={(url) =>
                      setReviewForm((f) => ({ ...f, photoUrl: url }))
                    }
                  />

                  <label className="flex items-center gap-2 text-xs font-bold text-stone-800 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewForm.verified}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          verified: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#9b0000] rounded"
                    />
                    <span>Verified Pilgrimage Traveler (Checked by Admin)</span>
                  </label>

                  <button
                    type="button"
                    onClick={saveReview}
                    className="w-full py-3 rounded-xl bg-[#9b0000] hover:bg-[#7D0000] text-white text-xs font-black transition shadow-xs cursor-pointer"
                  >
                    {editingReviewId ? 'Update Review' : 'Publish Review'}
                  </button>
                </div>
              </div>

              {/* Right: Published Reviews List */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
                <div className="flex items-end justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">
                      Published Reviews ({reviews.length})
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Average Rating: {avg.toFixed(1)} / 5.0
                    </p>
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {reviews.map((r) => (
                    <article
                      key={r.id}
                      className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {r.photoUrl ? (
                            <img
                              src={r.photoUrl}
                              alt={r.author}
                              className="w-10 h-10 rounded-full object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 font-black grid place-items-center text-xs">
                              {r.author.charAt(0)}
                            </div>
                          )}
                          <div>
                            <b className="text-xs font-black text-stone-900">
                              {r.author}
                            </b>
                            <span className="block text-[10px] text-stone-500">
                              {r.location ? `${r.location} · ` : ''}
                              {r.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-xs font-black">
                            {'★'.repeat(r.rating)}
                          </span>
                          <button
                            type="button"
                            onClick={() => editReview(r)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteReview(r.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed">
                        {r.text}
                      </p>

                      {r.verified && (
                        <span className="inline-block text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified Traveler
                        </span>
                      )}
                    </article>
                  ))}

                  {reviews.length === 0 && (
                    <div className="py-16 text-center space-y-2">
                      <Star className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-xs text-stone-400 font-bold">
                        No reviews published for this tour yet.
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Add customer testimonials using the form on the left.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

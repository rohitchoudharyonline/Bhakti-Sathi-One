import React, { useState } from 'react';
import { Bot, X, Sparkles, Loader2, Save, AlertCircle } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { TourPackage, ItineraryDay, HotelStay, GalleryItem, TourInclusionItem } from '../../types/tour';

interface AITourCreatorProps {
  onCreated: (pkg: TourPackage) => void;
  onClose: () => void;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const normalizeAiTour = (raw: any): Omit<TourPackage, 'id' | 'createdAt'> => {
  const title = String(raw?.title || 'New Tour Package').trim();
  const destination = String(raw?.destination || 'India').trim();
  const days = Math.max(1, Number(raw?.durationDays) || Number(raw?.itinerary?.length) || 1);
  const nights = Math.max(0, Number(raw?.durationNights) || days - 1);
  const itinerary: ItineraryDay[] = Array.isArray(raw?.itinerary)
    ? raw.itinerary.map((d: any, i: number) => ({
        id: String(d?.id || `day-${i + 1}`),
        dayNumber: Number(d?.dayNumber) || i + 1,
        title: String(d?.title || `Day ${i + 1}`),
        location: String(d?.location || destination),
        description: String(d?.description || ''),
        meals: Array.isArray(d?.meals) ? d.meals : [],
        stayHotel: '',
        activities: Array.isArray(d?.activities) ? d.activities.map(String) : [],
        highlights: Array.isArray(d?.highlights) ? d.highlights.map(String) : [],
      }))
    : [];

  const hotels: HotelStay[] = Array.isArray(raw?.hotels)
    ? raw.hotels.map((h: any, i: number) => ({
        id: String(h?.id || `hotel-${i + 1}`),
        name: String(h?.name || 'Hotel as per itinerary'),
        alternativeHotel: h?.alternativeHotel ? String(h.alternativeHotel) : undefined,
        city: h?.city ? String(h.city) : undefined,
        country: h?.country ? String(h.country) : 'India',
        location: h?.location ? String(h.location) : undefined,
        roomType: String(h?.roomType || 'Standard Room'),
        nights: Number(h?.nights) || 1,
        starRating: Number(h?.starRating) || undefined,
        mealPlan: h?.mealPlan ? String(h.mealPlan) : undefined,
        amenities: Array.isArray(h?.amenities) ? h.amenities.map(String) : [],
      }))
    : [];

  const gallery: GalleryItem[] = Array.isArray(raw?.gallery)
    ? raw.gallery.slice(0, 4).map((g: any, i: number) => ({
        id: String(g?.id || `gallery-${i + 1}`),
        url: String(g?.url || ''),
        caption: String(g?.caption || 'Tour view'),
      })).filter((g: GalleryItem) => g.url)
    : [];

  const inclusions = Array.isArray(raw?.inclusions) ? raw.inclusions.map(String) : [];
  const exclusions = Array.isArray(raw?.exclusions) ? raw.exclusions.map(String) : [];
  const includedIcons: TourInclusionItem[] = Array.isArray(raw?.includedIcons)
    ? raw.includedIcons.map((x: any, i: number) => ({
        id: String(x?.id || `inc-${i + 1}`),
        icon: String(x?.icon || 'sightseeing') as any,
        label: String(x?.label || 'Sightseeing'),
      }))
    : [];

  return {
    slug: String(raw?.slug || slugify(title)),
    title,
    tagline: String(raw?.tagline || raw?.shortDescription || '').trim(),
    destination,
    destinationTag: String(raw?.destinationTag || slugify(destination)),
    country: String(raw?.country || 'India'),
    category: (['Family', 'Honeymoon', 'Pilgrimage'].includes(raw?.category) ? raw.category : 'Family') as any,
    badge: raw?.badge || undefined,
    durationDays: days,
    durationNights: nights,
    price: Number(raw?.price) || 0,
    discountedPrice: Number(raw?.discountedPrice) > 0 ? Number(raw.discountedPrice) : undefined,
    priceOnRequest: true,
    currency: String(raw?.currency || '₹'),
    rating: 0,
    reviewCount: 0,
    coverImage: String(raw?.coverImage || ''),
    gallery,
    overview: String(raw?.overview || raw?.shortDescription || ''),
    startLocation: String(raw?.startLocation || destination),
    endLocation: String(raw?.endLocation || destination),
    groupSizeLimit: String(raw?.groupSizeLimit || 'Private tour'),
    bestTimeToVisit: String(raw?.bestTimeToVisit || 'Year Round'),
    tourType: String(raw?.tourType || 'Customizable Tour'),
    isGroupTour: false,
    itinerary,
    inclusions,
    exclusions,
    includedIcons,
    hotels,
    pricingTiers: {},
    transportation: raw?.transportation || undefined,
    policies: {
      cancellationPolicy: Array.isArray(raw?.policies?.cancellationPolicy) ? raw.policies.cancellationPolicy.map(String) : [],
      termsAndConditions: Array.isArray(raw?.policies?.termsAndConditions) ? raw.policies.termsAndConditions.map(String) : [],
      paymentPolicy: Array.isArray(raw?.policies?.paymentPolicy) ? raw.policies.paymentPolicy.map(String) : [],
    },
    importantNotes: Array.isArray(raw?.importantNotes) ? raw.importantNotes.map(String) : [],
    status: 'draft',
    featured: false,
    seoTitle: String(raw?.seoTitle || ''),
    seoMetaTitle: String(raw?.seoMetaTitle || raw?.seoTitle || ''),
    seoMetaDescription: String(raw?.seoMetaDescription || raw?.metaDescription || ''),
    metaDescription: String(raw?.metaDescription || raw?.seoMetaDescription || ''),
    seoKeywords: String(raw?.seoKeywords || ''),
    templeIds: Array.isArray(raw?.templeIds) ? raw.templeIds.map(String) : [],
    temples: Array.isArray(raw?.temples) ? raw.temples.map(String) : [],
    places: Array.isArray(raw?.places) ? raw.places.map(String) : [],
  };
};

export const AITourCreator: React.FC<AITourCreatorProps> = ({ onCreated, onClose }) => {
  const { addPackage } = useTours();
  const [command, setCommand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const createDraft = async () => {
    if (!command.trim()) {
      setError('Enter a tour command first.');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ command: command.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.tour) throw new Error(data?.error || 'Unable to generate tour.');
      const draft = normalizeAiTour(data.tour);
      const id = addPackage(draft);
      const saved: TourPackage = { ...draft, id, createdAt: new Date().toISOString() };
      onCreated(saved);
    } catch (e: any) {
      setError(e?.message || 'Unable to create tour draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F2] text-[#9b0000] grid place-items-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">Create Tour with AI</h3>
              <p className="text-[11px] text-stone-500">Describe the tour in your own words. It will be saved as a draft.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-black text-stone-800 block mb-1.5">Tour command</label>
            <textarea
              autoFocus
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Example: Create a 5 days Kashmir tour covering Srinagar, Gulmarg and Pahalgam. MAP plan, airport pickup/drop, Srinagar hotels The Azara/Karam Gold/Blanco, Pahalgam White Water Resort. Include SEO, inclusions and exclusions."
              className="w-full min-h-36 border border-stone-200 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white focus:border-[#9b0000] focus:outline-none resize-y"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9b0000]" />
              Gemini creates the content; you review it before publishing.
            </div>
            <button
              type="button"
              onClick={createDraft}
              disabled={isGenerating || !command.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#9b0000] hover:bg-[#7D0000] disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isGenerating ? 'Creating Draft…' : 'Generate & Save Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

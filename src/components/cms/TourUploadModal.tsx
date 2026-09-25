import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Copy,
  Download,
  Eye,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Image as ImageIcon,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { TourPackage } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { UniversalImageUploader } from './UniversalImageUploader';

interface TourUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TourUploadModal: React.FC<TourUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { packages, importTourPackages, clearAllPackages, exportTourPackagesJson, addPackage } = useTours();
  
  const [activeTab, setActiveTab] = useState<'file' | 'paste' | 'quick-form'>('file');
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<TourPackage[] | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Quick form state for building a custom tour
  const [quickTour, setQuickTour] = useState<Partial<TourPackage>>({
    title: '',
    tagline: '',
    destination: 'Jammu & Kashmir',
    destinationTag: 'jammu-kashmir',
    country: 'India',
    category: 'Family',
    tourType: 'Family',
    durationDays: 5,
    durationNights: 4,
    price: 18500,
    discountedPrice: 14999,
    coverImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
    overview: '',
    startLocation: 'Srinagar Airport',
    endLocation: 'Srinagar Airport',
    status: 'published',
    featured: true,
    rating: 4.9,
    reviewCount: 45,
    inclusions: [
      'Accommodation in verified category hotels / houseboats',
      'Daily Breakfast and Dinner included (MAP Plan)',
      'Dedicated AC Chauffeur Vehicle for all transfers & sightseeing',
      'All toll taxes, parking fees, and driver allowances',
      '24x7 local on-ground concierge support',
    ],
    exclusions: [
      'Airfare / Train tickets to destination',
      'Personal expenses, laundry, and guide tips',
      'Entry tickets and optional adventure activities',
    ],
    itinerary: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival & Welcome Transfer',
        location: 'Arrival point to Hotel',
        description: 'Traditional warm welcome and private transfer to your hotel. Evening at leisure.',
        meals: ['Dinner'],
        stayHotel: 'Selected Deluxe Hotel',
        activities: ['Airport Transfer', 'Welcome Refreshments', 'Leisure Walk'],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Full Day Sightseeing & Local Experiences',
        location: 'Scenic Valley Sightseeing',
        description: 'Explore scenic landmarks, nature trails, and authentic cultural highlights.',
        meals: ['Breakfast', 'Dinner'],
        stayHotel: 'Selected Deluxe Hotel',
        activities: ['Guided Sightseeing', 'Photo Points', 'Local Cuisine'],
      },
    ],
    hotels: [
      {
        id: 'h-stay-1',
        name: 'Deluxe Heritage Hotel',
        location: 'City Center / Scenic Valley',
        roomType: 'Deluxe Valley View Room',
        nights: 4,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        amenities: ['Free Wi-Fi', '24/7 Hot Water', 'Mountain View', 'Restaurant'],
      },
    ],
    pricingTiers: {
      star3: {
        tierName: 'Deluxe (3-Star) • Standard',
        price: 18500,
        discountedPrice: 14999,
        hotelNames: 'Selected 3-Star Deluxe Hotel',
        roomType: 'Deluxe Room',
        mealPlan: 'MAP Plan (Breakfast & Dinner)',
        cabType: 'Dedicated AC Sedan (Dzire / Etios)',
        keyHighlights: ['Buffet Breakfast & Dinner', 'Private AC Sedan', '24/7 Support'],
      },
      star4: {
        tierName: 'Super Deluxe (4-Star Premium)',
        price: 26000,
        discountedPrice: 21500,
        hotelNames: 'Selected 4-Star Mountain Resort',
        roomType: 'Super Deluxe Suite with Balcony',
        mealPlan: 'MAP Plan (Lavish Buffet Breakfast & Dinner)',
        cabType: 'Dedicated AC Toyota Innova Crysta SUV',
        keyHighlights: ['4-Star Mountain Resort', 'Toyota Innova Crysta', 'Special Welcome Amenities'],
      },
    },
  });

  if (!isOpen) return null;

  const handleValidateAndParse = (text: string) => {
    setParseError(null);
    setParsedPreview(null);
    setStatusMessage(null);

    if (!text.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(text);
      let items: any[] = [];

      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.packages)) {
          items = parsed.packages;
        } else if (Array.isArray(parsed.tours)) {
          items = parsed.tours;
        } else if (Array.isArray(parsed.data)) {
          items = parsed.data;
        } else {
          // Single package object
          items = [parsed];
        }
      }

      if (items.length === 0) {
        setParseError('No valid tour package items found in the provided JSON.');
        return;
      }

      // Sanitize and validate basic structure
      const normalized: TourPackage[] = items.map((item, index) => {
        const title = item.title || item.name || `My Tour Package ${index + 1}`;
        const slug = item.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const id = item.id || `pkg-${Date.now()}-${index}`;
        const days = Number(item.durationDays) || Number(item.days) || 5;
        const nights = Number(item.durationNights) || Number(item.nights) || Math.max(1, days - 1);
        const price = Number(item.price) || 15000;
        const discountedPrice = Number(item.discountedPrice) || Math.round(price * 0.8);

        return {
          id,
          slug,
          title,
          tagline: item.tagline || item.subtitle || `Custom tour to ${item.destination || 'Himalayas'}`,
          destination: item.destination || 'Jammu & Kashmir',
          destinationTag: item.destinationTag || 'jammu-kashmir',
          country: item.country || 'India',
          category: item.category || item.tourType || 'Family',
          tourType: item.tourType || item.category || 'Family',
          badge: item.badge || 'Verified Tour',
          durationDays: days,
          durationNights: nights,
          price,
          discountedPrice,
          currency: item.currency || '₹',
          rating: Number(item.rating) || 4.9,
          reviewCount: Number(item.reviewCount) || 28,
          coverImage: item.coverImage || item.image || item.heroImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
          gallery: Array.isArray(item.gallery) ? item.gallery : [],
          overview: item.overview || item.description || `Custom tailored itinerary exploring ${title}.`,
          startLocation: item.startLocation || 'Airport / Railway Station',
          endLocation: item.endLocation || 'Airport / Railway Station',
          status: item.status || 'published',
          featured: Boolean(item.featured ?? true),
          itinerary: Array.isArray(item.itinerary) && item.itinerary.length > 0 ? item.itinerary : [
            {
              id: `it-${id}-1`,
              dayNumber: 1,
              title: 'Arrival & Destination Check-in',
              location: 'Arrival point',
              description: 'Chauffeur pickup and hotel check-in.',
              meals: ['Dinner'],
              stayHotel: 'Selected Hotel',
              activities: ['Welcome Pickup', 'Check-in'],
            }
          ],
          inclusions: Array.isArray(item.inclusions) && item.inclusions.length > 0 ? item.inclusions : [
            'Hotel accommodation as per chosen category',
            'Daily Breakfast and Dinner included',
            'Private dedicated AC vehicle for transfers and sightseeing',
            'All toll taxes, parking, and driver allowances',
          ],
          exclusions: Array.isArray(item.exclusions) ? item.exclusions : [
            'Airfare or train tickets',
            'Personal laundry and telephone expenses',
          ],
          hotels: Array.isArray(item.hotels) ? item.hotels : [],
          pricingTiers: item.pricingTiers || {
            star3: {
              tierName: 'Deluxe (3-Star)',
              price,
              discountedPrice,
              hotelNames: 'Selected 3-Star Deluxe Hotel',
              roomType: 'Deluxe Valley View Room',
              mealPlan: 'MAP Plan (Breakfast & Dinner)',
              cabType: 'Dedicated AC Sedan',
              keyHighlights: ['Breakfast & Dinner', 'Private Cab', '24/7 Support'],
            }
          },
          policies: item.policies || {
            cancellationPolicy: ['20 days prior: 90% refund.', '10 to 19 days: 50% refund.'],
            termsAndConditions: ['Valid photo ID required for all travelers.'],
            paymentPolicy: ['25% advance to confirm booking.'],
          },
          createdAt: item.createdAt || new Date().toISOString(),
        } as TourPackage;
      });

      setParsedPreview(normalized);
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message || 'Invalid JSON format'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      handleValidateAndParse(content);
    };
    reader.onerror = () => {
      setParseError('Failed to read the uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      handleValidateAndParse(content);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) {
      setStatusMessage({ type: 'error', text: 'No tour packages ready to import.' });
      return;
    }

    setIsProcessing(true);
    try {
      const res = importTourPackages(parsedPreview, replaceExisting);
      setStatusMessage({
        type: 'success',
        text: `Successfully ${replaceExisting ? 'replaced all tours with' : 'imported'} ${res.count} tour package(s)! They are now live on your site.`,
      });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to import tour packages.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveQuickTour = () => {
    if (!quickTour.title || !quickTour.title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a title for your tour package.' });
      return;
    }

    setIsProcessing(true);
    try {
      const newPkgId = addPackage(quickTour as any);
      setStatusMessage({
        type: 'success',
        text: `Tour "${quickTour.title}" created and published successfully!`,
      });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create tour package.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSampleJson = () => {
    const sample = [
      {
        id: "pkg-my-custom-tour-01",
        slug: "5-days-kashmir-heaven-deluxe-tour",
        title: "5 Days Kashmir Heavenly Escape | Srinagar, Gulmarg & Pahalgam",
        tagline: "Unforgettable alpine meadows, Dal Lake luxury houseboat stay, and private mountain chauffeur",
        destination: "Kashmir (Srinagar, Gulmarg, Pahalgam)",
        destinationTag: "jammu-kashmir",
        country: "India",
        category: "Family",
        tourType: "Family",
        badge: "Custom Tour",
        durationDays: 5,
        durationNights: 4,
        price: 22000,
        discountedPrice: 17500,
        currency: "₹",
        rating: 4.95,
        reviewCount: 36,
        coverImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80",
        overview: "Discover pristine snow mountains, blooming Mughal gardens, and tranquil Shikara rides with our dedicated personalized care.",
        startLocation: "Srinagar Airport (SXR)",
        endLocation: "Srinagar Airport (SXR)",
        status: "published",
        featured: true,
        inclusions: [
          "4 Nights accommodation in verified Deluxe Hotels & 1 Night Houseboat",
          "Daily Breakfast and Dinner included (MAP Plan)",
          "Dedicated AC Sedan/SUV for all sightseeing and airport transfers",
          "1-Hour Sunset Shikara Ride on Dal Lake",
          "All toll taxes, parking fees, and driver allowances"
        ],
        exclusions: [
          "Flight tickets to Srinagar",
          "Gulmarg Gondola tickets (available as add-on)",
          "Personal laundry and tips"
        ],
        itinerary: [
          {
            id: "day-1",
            dayNumber: 1,
            title: "Arrival in Srinagar & Sunset Shikara on Dal Lake",
            location: "Srinagar Airport to Dal Lake",
            description: "Chauffeur welcome at Srinagar airport. Transfer to hotel/houseboat. Evening Shikara ride.",
            meals: ["Dinner"],
            stayHotel: "Deluxe Dal Lake Houseboat",
            activities: ["Airport Pickup", "1-Hour Shikara Ride", "Kashmiri Kehwa"]
          },
          {
            id: "day-2",
            dayNumber: 2,
            title: "Srinagar to Gulmarg Day Trip – Gondola & Snow Meadows",
            location: "Gulmarg",
            description: "Full day excursion to Gulmarg. Cable car Gondola ride to Apharwat peak.",
            meals: ["Breakfast", "Dinner"],
            stayHotel: "Deluxe Hotel Srinagar",
            activities: ["Gondola Phase 1 & 2", "Snow Walk", "St. Mary Church"]
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holidays-hunt-sample-tour-upload.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExistingTours = () => {
    const jsonStr = exportTourPackagesJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holidays-hunt-tours-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4B00] text-white flex items-center justify-center font-bold shadow-md">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Import & Upload My Created Tours
              </h2>
              <p className="text-xs text-stone-300">
                Upload your custom tour files, paste JSON data, or build your own tours
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-3 bg-stone-100 border-b border-stone-200 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'file'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FileJson className="w-4 h-4 text-[#FF4B00]" />
            <span>Upload JSON File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Copy className="w-4 h-4 text-blue-600" />
            <span>Paste Tour JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick-form')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'quick-form'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Create Tour Maker</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSampleJson}
              className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Download Sample JSON Format"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample JSON</span>
            </button>
            <button
              type="button"
              onClick={handleExportExistingTours}
              className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Backup current tours"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export All ({packages.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition cursor-pointer ${
                  dragOver
                    ? 'border-[#FF4B00] bg-[#FFF0EB]'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white text-[#FF4B00] shadow-sm flex items-center justify-center mx-auto mb-3 border border-stone-200">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-stone-800 mb-1">
                  Drag & Drop your Tour JSON file here
                </h3>
                <p className="text-xs text-stone-500 mb-3">
                  or <span className="text-[#FF4B00] underline font-bold">browse from your computer</span> (.json files supported)
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-[11px] text-stone-600 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Supports single tour package or array of multiple tours</span>
                </div>
              </div>

              {parseError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">File Parsing Error:</strong> {parseError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE JSON */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700">
                    Paste Tour JSON Data (Array or Single Object):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(jsonText);
                        setJsonText(JSON.stringify(parsed, null, 2));
                        handleValidateAndParse(JSON.stringify(parsed, null, 2));
                      } catch {}
                    }}
                    className="text-[11px] text-[#FF4B00] hover:underline font-bold"
                  >
                    Format & Prettify JSON
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    handleValidateAndParse(e.target.value);
                  }}
                  placeholder='[ { "title": "My 6 Days Tour", "durationDays": 6, "price": 18500, "destination": "Kashmir", ... } ]'
                  className="w-full font-mono text-xs p-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00] focus:bg-white transition"
                />
              </div>

              {parseError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">JSON Error:</strong> {parseError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUICK TOUR CREATOR FORM */}
          {activeTab === 'quick-form' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tour Package Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickTour.title || ''}
                    onChange={(e) => setQuickTour({ ...quickTour, title: e.target.value })}
                    placeholder="e.g. 6 Days Kashmir Honeymoon Package with Houseboat & Gulmarg"
                    className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tagline / Subheading
                  </label>
                  <input
                    type="text"
                    value={quickTour.tagline || ''}
                    onChange={(e) => setQuickTour({ ...quickTour, tagline: e.target.value })}
                    placeholder="e.g. Luxury houseboat, private cab & alpine snow meadows"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Destination Region
                  </label>
                  <input
                    type="text"
                    value={quickTour.destination || ''}
                    onChange={(e) => setQuickTour({ ...quickTour, destination: e.target.value })}
                    placeholder="e.g. Kashmir (Srinagar, Gulmarg, Pahalgam)"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tour Category
                  </label>
                  <select
                    value={quickTour.category || 'Family'}
                    onChange={(e) => setQuickTour({ ...quickTour, category: e.target.value as any, tourType: e.target.value as any })}
                    className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  >
                    <option value="Family">Family Holiday</option>
                    <option value="Honeymoon">Honeymoon Special</option>
                    <option value="Pilgrimage">Sacred Pilgrimage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={quickTour.durationDays || 5}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setQuickTour({ ...quickTour, durationDays: d, durationNights: Math.max(1, d - 1) });
                    }}
                    className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Starting Price (₹)
                  </label>
                  <input
                    type="number"
                    value={quickTour.discountedPrice || 14999}
                    onChange={(e) => setQuickTour({ ...quickTour, discountedPrice: Number(e.target.value), price: Math.round(Number(e.target.value) * 1.25) })}
                    className="w-full text-xs font-bold p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cover Photo URL / Upload
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={quickTour.coverImage || ''}
                      onChange={(e) => setQuickTour({ ...quickTour, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                    />
                    <UniversalImageUploader
                      currentUrl={quickTour.coverImage}
                      onImageSelected={(url) => setQuickTour({ ...quickTour, coverImage: url })}
                      label="Upload Tour Photo"
                      folder="tours"
                      variant="inline-button"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Overview / Description
                  </label>
                  <textarea
                    rows={3}
                    value={quickTour.overview || ''}
                    onChange={(e) => setQuickTour({ ...quickTour, overview: e.target.value })}
                    placeholder="Describe the experience, hotel stays, private cab, and sightseeing inclusions..."
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#FF4B00]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveQuickTour}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-[#FF4B00] hover:bg-[#E02c00] text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish & Save My Tour Package</span>
                </button>
              </div>
            </div>
          )}

          {/* PARSED PREVIEW SECTION (For File / Paste) */}
          {parsedPreview && parsedPreview.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-black text-stone-900">
                    Ready to Import ({parsedPreview.length} Tour Package{parsedPreview.length > 1 ? 's' : ''})
                  </h4>
                </div>
                <span className="text-xs text-stone-500 font-medium">Review preview below</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {parsedPreview.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-stone-100/80 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={pkg.coverImage}
                        alt={pkg.title}
                        className="w-12 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-stone-900 truncate">{pkg.title}</p>
                        <p className="text-[11px] text-stone-500 flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-[#FF4B00]" />
                            {pkg.destination}
                          </span>
                          <span>•</span>
                          <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                          <span>•</span>
                          <span className="font-bold text-[#FF4B00]">₹{pkg.discountedPrice.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[10px] font-bold text-stone-700 shrink-0">
                      {pkg.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Import Options */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF4B00] focus:ring-[#FF4B00] cursor-pointer"
                    />
                    <span>Replace all existing tours with my uploaded tours (clean wipe)</span>
                  </label>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    {replaceExisting ? 'Will replace current catalog' : 'Will merge / append'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 pl-6">
                  Check this if you only want YOUR uploaded tours to appear and remove default placeholder packages.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 px-4 bg-[#FF4B00] hover:bg-[#E02c00] text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Importing...' : `Import & Activate ${parsedPreview.length} Tour(s) Now`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setParsedPreview(null);
                    setJsonText('');
                  }}
                  className="py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Quick Clear Default Tours Helper */}
          <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-stone-800">Clear Default Tours & Start Fresh</p>
              <p className="text-[11px] text-stone-500">
                Want to remove any default placeholder tours so only your own uploaded tours remain?
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all existing packages? You can upload your own tours immediately.')) {
                  clearAllPackages();
                  setStatusMessage({ type: 'success', text: 'All packages cleared. Ready for your uploaded tours.' });
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              <span>Clear All Packages</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

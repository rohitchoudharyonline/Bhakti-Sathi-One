import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { DestinationMeta, DestinationGuide } from '../../data/destinationsData';
import { generateTouristDestinationSchema } from '../../utils/seoEngine';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { MediaR2StorageManager } from './MediaR2StorageManager';
import { UniversalImageUploader } from './UniversalImageUploader';
import { CMSSEOEditor } from './CMSSEOEditor';
import { ImageDiagnosticModal } from './ImageDiagnosticModal';
import {
  MapPin,
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Compass,
  ArrowLeft,
  Check,
  Building,
  HelpCircle,
  ExternalLink,
  Activity,
} from 'lucide-react';

export const DestinationsManager: React.FC = () => {
  const {
    destinations,
    mediaAssets,
    addDestination,
    updateDestination,
    deleteDestination,
    duplicateDestination,
    navigateToDestination,
    agencySettings,
  } = useTours();

  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [editingDest, setEditingDest] = useState<DestinationMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editorSubTab, setEditorSubTab] = useState<'basic' | 'guide' | 'attractions' | 'faqs' | 'seo' | 'schema'>('basic');
  const [diagnosticTarget, setDiagnosticTarget] = useState<{ url: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<DestinationMeta>({
    id: '',
    slug: '',
    name: '',
    displayName: '',
    state: 'India',
    tagline: '',
    heroImage: '',
    guideTitle: '',
    weatherInfo: '15°C - 25°C',
    bestSeason: 'Year-Round',
    startingPrice: 12999,
    popularCities: ['City Center', 'Old Town', 'Valley Point'],
    categoryFilters: [
      { id: 'all', label: 'All Packages', iconName: 'Compass' },
      { id: 'family', label: 'Family & Hills', iconName: 'Hotel' },
      { id: 'honeymoon', label: 'Honeymoon Special', iconName: 'Sparkles' },
    ],
    guide: {
      overview: 'Comprehensive travel overview describing this breathtaking mountain destination...',
      bestTimeToVisit: 'September to May for pleasant climate and scenic vistas.',
      idealDuration: '4 to 6 Days',
      nearestAirport: 'Domestic Airport (30 KM)',
      nearestRailway: 'Central Railway Junction (45 KM)',
      topAttractions: [
        {
          name: 'Scenic Valley Viewpoint',
          description: 'Panoramic mountain vistas and pine-covered ridges.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          badge: 'Must Visit',
        },
      ],
      thingsToDo: [
        'Scenic nature walks and pine trail trekking',
        'Traditional handicraft and souvenir shopping',
        'Local tea tasting and authentic culinary experience',
      ],
      localCuisine: [
        { dish: 'Traditional Thali', description: 'Authentic regional feast with fragrant spices.' },
      ],
      travelTips: [
        'Carry warm layer jackets even in summer months.',
        'Book verified cabs and certified hotels in advance.',
      ],
      faqs: [
        {
          question: 'What is the best time to visit?',
          answer: 'The weather remains pleasant from March to October, while winter brings heavy snow.',
        },
      ],
    },
  });

  const handleStartCreate = () => {
    setEditingDest(null);
    setFormData({
      id: '',
      slug: '',
      name: '',
      displayName: '',
      state: 'India',
      destinationType: 'regular',
      tagline: '',
      heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
      guideTitle: '',
      weatherInfo: '18°C - 28°C',
      bestSeason: 'Year-Round',
      startingPrice: 14999,
      popularCities: ['City Center', 'Valley Point', 'Snow Peak'],
      categoryFilters: [
        { id: 'all', label: 'All Packages', iconName: 'Compass' },
        { id: 'family', label: 'Family & Hills', iconName: 'Hotel' },
      ],
      guide: {
        overview: 'Comprehensive travel overview describing this mountain destination...',
        bestTimeToVisit: 'September to May for pleasant climate.',
        idealDuration: '5 to 7 Days',
        nearestAirport: 'Nearest Domestic Airport',
        nearestRailway: 'Nearest Major Railway Station',
        topAttractions: [
          {
            name: 'Scenic Mountain Pass',
            description: 'Stunning alpine meadows and glacier points.',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            badge: 'Top Rated',
          },
        ],
        thingsToDo: ['Nature trails', 'Local shopping', 'Scenic driving'],
        localCuisine: [{ dish: 'Local Specialties', description: 'Freshly prepared traditional delights.' }],
        travelTips: ['Carry photo IDs', 'Pre-book verified chauffeurs'],
        faqs: [
          {
            question: 'Is it safe for families and children?',
            answer: 'Yes, fully secure with dedicated chauffeur services and inspected hotel properties.',
          },
        ],
      },
    });
    setActiveTab('editor');
    setEditorSubTab('basic');
  };

  const handleStartEdit = (dest: DestinationMeta) => {
    setEditingDest(dest);
    setFormData(JSON.parse(JSON.stringify(dest)));
    setActiveTab('editor');
    setEditorSubTab('basic');
  };

  const handleSaveDestination = () => {
    const cleanSlug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const finalDest: DestinationMeta = {
      ...formData,
      slug: cleanSlug,
      id: cleanSlug,
      displayName: formData.displayName || formData.name.toUpperCase(),
      guideTitle: formData.guideTitle || `${formData.name} Travel Guide`,
    };

    if (editingDest) {
      updateDestination(finalDest);
    } else {
      addDestination(finalDest);
    }

    setActiveTab('list');
  };

  const destinationList: DestinationMeta[] = Object.values(destinations) as DestinationMeta[];
  const filteredDestinations = destinationList.filter((d) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const liveSchema = generateTouristDestinationSchema(formData, agencySettings);

  const handleToggleSelectAll = () => {
    if (selectedSlugs.length === filteredDestinations.length && filteredDestinations.length > 0) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(filteredDestinations.map((d) => d.slug));
    }
  };

  const handleToggleSelect = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const handleBulkDelete = () => {
    if (selectedSlugs.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedSlugs.length} selected destination(s)? This action cannot be undone.`
      )
    ) {
      selectedSlugs.forEach((slug) => deleteDestination(slug));
      setSelectedSlugs([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            Destination Hub & Travel Guides Manager
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create and edit destination portals, sightseeing guides, FAQs, and Google Schema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/destinations', '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live Destinations Hub</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </button>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Destination</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DESTINATIONS LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            {filteredDestinations.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      selectedSlugs.length === filteredDestinations.length &&
                      filteredDestinations.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span>Select All ({filteredDestinations.length})</span>
                </label>

                {selectedSlugs.length > 0 && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {selectedSlugs.length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedSlugs.length})</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.slug}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:border-black transition flex flex-col justify-between group relative ${
                  selectedSlugs.includes(dest.slug)
                    ? 'border-black ring-2 ring-black/20 bg-stone-50'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="aspect-16/9 relative overflow-hidden bg-stone-100">
                    {/* Checkbox overlay */}
                    <div className="absolute top-2 left-2 z-20">
                      <input
                        type="checkbox"
                        checked={selectedSlugs.includes(dest.slug)}
                        onChange={() => handleToggleSelect(dest.slug)}
                        className="w-5 h-5 rounded border-2 border-white shadow-md text-black focus:ring-black cursor-pointer bg-black/40"
                      />
                    </div>

                    <img
                      src={resolveDisplayImage(dest.heroImage, mediaAssets)}
                      alt={dest.name}
                      onError={(e) => handleImageError(e, dest.heroImage, mediaAssets)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-1 bg-black/75 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider backdrop-blur-xs">
                      {dest.state}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-bold text-black leading-snug">{dest.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{dest.tagline}</p>
                    
                    <div className="pt-2 flex flex-wrap gap-1">
                      {dest.popularCities?.slice(0, 4).map((city, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-stone-100 rounded text-[10px] text-stone-600 font-medium">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => navigateToDestination(dest.slug)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-stone-200 hover:border-black rounded-lg text-xs font-bold text-stone-800 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Page</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(dest)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Guide</span>
                  </button>

                  <button
                    onClick={() => setDiagnosticTarget({ url: dest.heroImage || '', title: `Image Diagnostics: ${dest.name}` })}
                    className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg transition cursor-pointer"
                    title="Inspect Image Diagnostics"
                  >
                    <Activity className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => duplicateDestination(dest.slug)}
                    className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 transition cursor-pointer"
                    title="Duplicate Destination"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteDestination(dest.slug)}
                    className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                    title="Delete Destination"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: DESTINATION EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <button
              onClick={() => setActiveTab('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Destinations</span>
            </button>

            <button
              onClick={handleSaveDestination}
              className="px-5 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {editingDest ? 'Update Destination' : 'Save Destination'}
            </button>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <button
              onClick={() => setEditorSubTab('basic')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                editorSubTab === 'basic' ? 'bg-black text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              Basic Info & Hero
            </button>
            <button
              onClick={() => setEditorSubTab('guide')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                editorSubTab === 'guide' ? 'bg-black text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              Guide Overview & Logistics
            </button>
            <button
              onClick={() => setEditorSubTab('attractions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                editorSubTab === 'attractions' ? 'bg-black text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              Top Attractions ({formData.guide?.topAttractions?.length || 0})
            </button>
            <button
              onClick={() => setEditorSubTab('faqs')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                editorSubTab === 'faqs' ? 'bg-black text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              Destination FAQs ({formData.guide?.faqs?.length || 0})
            </button>
            <button
              onClick={() => setEditorSubTab('seo')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                editorSubTab === 'seo' ? 'bg-black text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              SEO Meta Tags
            </button>
            <button
              onClick={() => setEditorSubTab('schema')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                editorSubTab === 'schema' ? 'bg-black text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              Google Schema (JSON-LD)
            </button>
          </div>

          {/* SUB-TAB 1: BASIC INFO */}
          {editorSubTab === 'basic' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Destination Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kashmir"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        name: val,
                        slug: formData.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        displayName: formData.displayName || val.toUpperCase(),
                      });
                    }}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">URL Slug (e.g. jammu-and-kashmir)</label>
                  <input
                    type="text"
                    placeholder="kashmir"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block font-bold text-stone-700 mb-1">State / Union Territory</label>
                  <input
                    type="text"
                    placeholder="Jammu & Kashmir / Himachal Pradesh"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block font-bold text-stone-700 mb-1">Destination Type</label>
                  <select
                    value={formData.destinationType || 'regular'}
                    onChange={(e) => setFormData({ ...formData, destinationType: e.target.value as 'regular' | 'temple' })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="regular">Regular Destination</option>
                    <option value="temple">Temple Destination</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">Tagline / Catchphrase</label>
                <input
                  type="text"
                  placeholder="Snow-capped peaks, shikara cruise on Dal Lake, and pine valleys..."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <UniversalImageUploader
                  label="Hero Banner Photo (Auto-compressed to R2)"
                  description="Upload destination hero banner. Choose width (700, 800, 1000, 1200, 1600px) & format (WebP, PNG, JPG, GIF). Shows exact compression reduction."
                  folder="destinations"
                  defaultWidth={1600}
                  defaultFormat="webp"
                  currentUrl={formData.heroImage}
                  onImageSelected={(url) => setFormData({ ...formData, heroImage: url })}
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500 font-medium">Or pick from existing cloud assets:</span>
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(true)}
                    className="text-xs text-black font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Open R2 Media Library</span>
                  </button>
                </div>
              </div>

              {/* Popular Cities */}
              <div>
                <label className="block font-bold text-stone-700 mb-1 text-xs">
                  Popular Hubs & Cities (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.popularCities?.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      popularCities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Srinagar, Gulmarg, Pahalgam, Sonmarg"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SUB-TAB 2: GUIDE LOGISTICS */}
          {editorSubTab === 'guide' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Destination Overview Guide</label>
                <textarea
                  rows={6}
                  value={formData.guide?.overview}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guide: { ...formData.guide, overview: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Best Time to Visit</label>
                  <input
                    type="text"
                    value={formData.guide?.bestTimeToVisit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guide: { ...formData.guide, bestTimeToVisit: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ideal Trip Duration</label>
                  <input
                    type="text"
                    value={formData.guide?.idealDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guide: { ...formData.guide, idealDuration: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nearest Airport</label>
                  <input
                    type="text"
                    value={formData.guide?.nearestAirport}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guide: { ...formData.guide, nearestAirport: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nearest Railway</label>
                  <input
                    type="text"
                    value={formData.guide?.nearestRailway}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guide: { ...formData.guide, nearestRailway: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: TOP ATTRACTIONS */}
          {editorSubTab === 'attractions' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                  Key Attractions & Places to Visit
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const nextAttractions = [
                      ...(formData.guide?.topAttractions || []),
                      {
                        name: 'New Attraction',
                        description: 'Detailed description of this must-see spot...',
                        image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
                        badge: 'Featured',
                      },
                    ];
                    setFormData({
                      ...formData,
                      guide: { ...formData.guide, topAttractions: nextAttractions },
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attraction</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.guide?.topAttractions?.map((att, idx) => (
                  <div key={idx} className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF4B00]" />
                        <span className="font-black text-stone-900 text-xs">Attraction #{idx + 1}</span>
                        {att.badge && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                            {att.badge}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.guide?.topAttractions || []).filter((_, i) => i !== idx);
                          setFormData({
                            ...formData,
                            guide: { ...formData.guide, topAttractions: updated },
                          });
                        }}
                        className="text-stone-400 hover:text-rose-600 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-stone-700 block">Attraction / Spot Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Gulmarg Gondola, Vaishno Devi Bhawan, Patnitop"
                          value={att.name}
                          onChange={(e) => {
                            const updated = [...(formData.guide?.topAttractions || [])];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, guide: { ...formData.guide, topAttractions: updated } });
                          }}
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF4B00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700 block">Badge / Tag (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Must Visit, Top Scenic, Sacred"
                          value={att.badge || ''}
                          onChange={(e) => {
                            const updated = [...(formData.guide?.topAttractions || [])];
                            updated[idx].badge = e.target.value;
                            setFormData({ ...formData, guide: { ...formData.guide, topAttractions: updated } });
                          }}
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF4B00]"
                        />
                      </div>
                    </div>

                    {/* Attraction Highlights */}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">Highlights & Key Details</label>
                      <textarea
                        rows={2}
                        placeholder="Attraction highlights, timings, spiritual or scenic significance..."
                        value={att.description}
                        onChange={(e) => {
                          const updated = [...(formData.guide?.topAttractions || [])];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, guide: { ...formData.guide, topAttractions: updated } });
                        }}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#FF4B00]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: FAQS */}
          {editorSubTab === 'faqs' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                  Destination FAQs (Google FAQPage Schema)
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const nextFaqs = [
                      ...(formData.guide?.faqs || []),
                      {
                        question: 'Frequently Asked Question?',
                        answer: 'Accurate and comprehensive travel answer.',
                      },
                    ];
                    setFormData({
                      ...formData,
                      guide: { ...formData.guide, faqs: nextFaqs },
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.guide?.faqs?.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">FAQ #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.guide.faqs.filter((_, i) => i !== idx);
                          setFormData({
                            ...formData,
                            guide: { ...formData.guide, faqs: updated },
                          });
                        }}
                        className="text-stone-400 hover:text-rose-600 font-bold"
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Question..."
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...formData.guide.faqs];
                        updated[idx].question = e.target.value;
                        setFormData({ ...formData, guide: { ...formData.guide, faqs: updated } });
                      }}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg font-bold"
                    />

                    <textarea
                      rows={2}
                      placeholder="Detailed answer..."
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...formData.guide.faqs];
                        updated[idx].answer = e.target.value;
                        setFormData({ ...formData, guide: { ...formData.guide, faqs: updated } });
                      }}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB: SEO META TAGS */}
          {editorSubTab === 'seo' && (
            <CMSSEOEditor
              type="destination"
              itemName={formData.name}
              extraData={{
                state: formData.state,
                tagline: formData.tagline,
              }}
              seoMetaTitle={formData.seoMetaTitle}
              seoMetaDescription={formData.seoMetaDescription}
              seoKeywords={formData.seoKeywords}
              onChange={(field, val) => setFormData({ ...formData, [field]: val })}
              onApplyAll={(data) => setFormData({ ...formData, ...data })}
            />
          )}

          {/* SUB-TAB 5: SCHEMA */}
          {editorSubTab === 'schema' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="text-sm font-bold text-black">TouristDestination Schema (JSON-LD)</h4>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96">
                {JSON.stringify(liveSchema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* R2 Media Selector Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                Select Photo from Cloudflare R2 Library
              </h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-stone-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <MediaR2StorageManager
              onSelectMedia={(url) => {
                setFormData({
                  ...formData,
                  heroImage: url,
                });
                setShowMediaModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Image Diagnostic Telemetry Inspector Modal */}
      <ImageDiagnosticModal
        isOpen={Boolean(diagnosticTarget)}
        onClose={() => setDiagnosticTarget(null)}
        imageUrl={diagnosticTarget?.url}
        title={diagnosticTarget?.title || 'Destination Image Diagnostics'}
      />
    </div>
  );
};

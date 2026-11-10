import React, { useState, useMemo, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { GuideArticle } from '../../types/guide';
import { generateBreadcrumbSchema } from '../../utils/seoEngine';
import { GlobalFooter } from './GlobalFooter';
import { Navbar } from '../common/Navbar';
import {
  BookOpen,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  ChevronRight,
  Home,
  Compass,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';

export const PublicGuidesHub: React.FC = () => {
  const {
    guides,
    guideCategories,
    navigateToGuideDetail,
    navigateToHome,
    agencySettings,
  } = useTours();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SEO: Update page title and meta description
  useEffect(() => {
    document.title = 'Travel & Holiday Guides | Holidays Hunt';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Explore useful travel guides, destination information, holiday tips and itinerary planning resources curated by Holidays Hunt.'
    );

    // Inject Breadcrumb JSON-LD
    const breadcrumbData = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://holidayshunt.com/' },
      { name: 'Travel & Holiday Guides', url: 'https://holidayshunt.com/guides' },
    ]);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'guide-hub-breadcrumbs-schema';
    script.textContent = JSON.stringify(breadcrumbData);

    const oldScript = document.getElementById('guide-hub-breadcrumbs-schema');
    if (oldScript) oldScript.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('guide-hub-breadcrumbs-schema');
      if (el) el.remove();
    };
  }, []);

  // Filter ONLY published guides (Public requirement!)
  const publishedGuides = useMemo(() => {
    return guides.filter((g) => {
      // Must be published!
      if (g.status !== 'published') return false;

      // Category filter
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchDest = (g.destination || g.destinationName || '').toLowerCase().includes(q);
        const matchExcerpt = g.excerpt.toLowerCase().includes(q);
        const matchKeyword = (g.seo?.primaryKeyword || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDest && !matchExcerpt && !matchKeyword) return false;
      }

      return true;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col justify-between">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-48 md:pt-8 md:pb-28 w-full space-y-8">
        {/* Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500">
          <button
            onClick={navigateToHome}
            className="flex items-center gap-1 hover:text-amber-800 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="font-semibold text-stone-800">Travel & Holiday Guides</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-200/80 text-amber-900 text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Destination & Travel Guide Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Travel & Holiday Guides
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Explore useful destination guides, sightseeing info, holiday tips and itinerary planning resources curated for travelers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search travel guides, sightseeing tips, itineraries..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Published Guides Grid */}
        {publishedGuides.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs max-w-md mx-auto space-y-3">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">No guides found</h3>
            <p className="text-xs text-stone-500">
              No published guides match your search criteria. Try a different search term or category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {publishedGuides.map((guide) => (
              <article
                key={guide.id}
                onClick={() => navigateToGuideDetail(guide.slug)}
                className="group bg-white rounded-3xl border border-stone-200/90 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                    <img
                      src={
                        guide.featuredImage ||
                        'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={guide.imageAlt || guide.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                      loading="lazy"
                    />
                    {guide.category && guide.category !== 'Temple Guides' && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg">
                          {guide.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-stone-500">
                      <span className="inline-flex items-center gap-1 font-medium text-amber-800">
                        <MapPin className="w-3.5 h-3.5" />
                        {guide.destination || guide.destinationName || 'Sacred Yatra'}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {guide.readingTimeMinutes || 4} min read
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition line-clamp-2 leading-snug">
                      {guide.title}
                    </h2>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800 group-hover:text-amber-900">
                  <span>Read Guide</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pilgrimage Support Banner */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 mt-12 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Need Personalized Yatra Guidance?
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">
              Plan Your Sacred Yatra With Holidays Hunt
            </h2>
            <p className="text-xs text-stone-300 max-w-xl">
              From local shrine guidance and temple logistics to verified clean accommodation, our team helps ensure a hassle-free pilgrimage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${(agencySettings.whatsapp || '919419915255').replace(/\D/g, '')}?text=Hello%20Holidays%20Hunt%2C%20I%20need%20assistance%20planning%20my%20yatra`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </a>
            <a
              href={`tel:${agencySettings.phone || '+91 94199 15255'}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Yatra Desk</span>
            </a>
          </div>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
};

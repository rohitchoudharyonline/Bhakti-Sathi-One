import React, { useState, useMemo, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import { updatePageSeo } from '../../utils/seo';
import { generateBreadcrumbSchema } from '../../utils/seoEngine';
import {
  Map,
  Compass,
  FileText,
  BookOpen,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Download,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe
} from 'lucide-react';

export const SitemapPage: React.FC = () => {
  const {
    packages,
    destinations,
    guides,
    customPages,
    navigateToHome,
    navigateToPackage,
    navigateToDestination,
    navigateToGuideDetail,
    navigateToCustomPage,
    navigateToInfoPage,
    navigateToGuideHub,
    navigateToAllTours,
    navigateToDestinationsExplorer,
  } = useTours();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'packages' | 'destinations' | 'guides' | 'pages'>('all');
  const [viewingXml, setViewingXml] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';

  useEffect(() => {
    updatePageSeo({
      title: 'HTML & XML Sitemap | Bhakti Sathi Pilgrimage & Yatra Directory',
      description: 'Explore the complete directory of sacred yatra packages, spiritual destinations, temple travel guides, and policy pages on Bhakti Sathi.',
      canonicalPath: '/sitemap',
      schemaData: generateBreadcrumbSchema([
        { name: 'Home', url: origin },
        { name: 'Sitemap', url: `${origin}/sitemap` },
      ]),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [origin]);

  // Core Pages
  const corePages = useMemo(() => [
    { title: 'Home Storefront', path: '/', slug: 'home', category: 'Main' },
    { title: 'All Sacred Yatra Packages', path: '/tours', slug: 'tours', category: 'Tours', action: navigateToAllTours },
    { title: 'Explore Destinations & Circuits', path: '/destinations', slug: 'destinations', category: 'Destinations', action: navigateToDestinationsExplorer },
    { title: 'Spiritual Guide & Yatra Hub', path: '/guide', slug: 'guide', category: 'Guides', action: navigateToGuideHub },
    { title: 'Daily Panchang & Tithi Calendar', path: '/panchang', slug: 'panchang', category: 'Spiritual Utility' },
    { title: 'Daily Rashifal (Horoscope)', path: '/rashifal', slug: 'rashifal', category: 'Spiritual Utility' },
    { title: 'Verified Traveller Reviews', path: '/reviews', slug: 'reviews', category: 'Company', action: () => navigateToInfoPage('reviews') },
    { title: 'About Bhakti Sathi', path: '/info/about', slug: 'about', category: 'Company', action: () => navigateToInfoPage('about') },
    { title: 'Contact Us & Office Locations', path: '/info/locate_us', slug: 'locate_us', category: 'Company', action: () => navigateToInfoPage('locate_us') },
    { title: 'Frequently Asked Questions (FAQ)', path: '/info/faq', slug: 'faq', category: 'Help', action: () => navigateToInfoPage('faq') },
    { title: 'Careers & Join Our Team', path: '/info/careers', slug: 'careers', category: 'Company', action: () => navigateToInfoPage('careers') },
    { title: 'Terms & Conditions', path: '/info/terms', slug: 'terms', category: 'Legal', action: () => navigateToInfoPage('terms') },
    { title: 'Cancellation & Refund Policy', path: '/info/cancellation', slug: 'cancellation', category: 'Legal', action: () => navigateToInfoPage('cancellation') },
    { title: 'Privacy Policy & Data Security', path: '/info/privacy', slug: 'privacy', category: 'Legal', action: () => navigateToInfoPage('privacy') },
    { title: '100% Verified Stays & Safe Travels', path: '/info/security', slug: 'security', category: 'Trust', action: () => navigateToInfoPage('security') },
  ], [navigateToAllTours, navigateToDestinationsExplorer, navigateToGuideHub, navigateToInfoPage]);

  const destinationList = useMemo(() => {
    if (!destinations) return [];
    return Array.isArray(destinations) ? destinations : Object.values(destinations);
  }, [destinations]);

  // Live filtered sets
  const filteredCorePages = useMemo(() => {
    if (!searchQuery.trim()) return corePages;
    const q = searchQuery.toLowerCase();
    return corePages.filter(p => p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q));
  }, [corePages, searchQuery]);

  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const q = searchQuery.toLowerCase();
    return packages.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.destination?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q)
    );
  }, [packages, searchQuery]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return destinationList;
    const q = searchQuery.toLowerCase();
    return destinationList.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.tagline?.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q)
    );
  }, [destinationList, searchQuery]);

  const filteredGuides = useMemo(() => {
    const published = guides.filter(g => g.status === 'published');
    if (!searchQuery.trim()) return published;
    const q = searchQuery.toLowerCase();
    return published.filter(g => 
      g.title.toLowerCase().includes(q) || 
      g.destination?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q)
    );
  }, [guides, searchQuery]);

  const filteredCustomPages = useMemo(() => {
    const published = customPages.filter(p => p.status === 'published');
    if (!searchQuery.trim()) return published;
    const q = searchQuery.toLowerCase();
    return published.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.slug.toLowerCase().includes(q)
    );
  }, [customPages, searchQuery]);

  const totalUrls = corePages.length + packages.length + destinationList.length + guides.filter(g => g.status === 'published').length + customPages.filter(p => p.status === 'published').length;

  // Auto-generate XML content
  const xmlContent = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://mybhaktisathi.com';
    let entries: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

    // Core
    corePages.forEach(p => {
      entries.push({ loc: `${baseUrl}${p.path}`, lastmod: today, changefreq: 'daily', priority: p.path === '/' ? '1.0' : '0.8' });
    });

    // Packages
    packages.forEach(pkg => {
      entries.push({ loc: `${baseUrl}/package/${pkg.slug || pkg.id}`, lastmod: today, changefreq: 'weekly', priority: '0.9' });
    });

    // Destinations
    destinationList.forEach(d => {
      entries.push({ loc: `${baseUrl}/destination/${d.slug}`, lastmod: today, changefreq: 'weekly', priority: '0.8' });
    });

    // Guides
    guides.filter(g => g.status === 'published').forEach(g => {
      entries.push({ loc: `${baseUrl}/guide/${g.slug}`, lastmod: today, changefreq: 'weekly', priority: '0.8' });
    });

    // Custom Pages
    customPages.filter(p => p.status === 'published').forEach(p => {
      entries.push({ loc: `${baseUrl}/page/${p.slug}`, lastmod: today, changefreq: 'monthly', priority: '0.7' });
    });

    const body = entries.map(e => 
`  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }, [corePages, packages, destinationList, guides, customPages]);

  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between font-sans pb-32 md:pb-24">
      <div>
        <Navbar />

        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <button onClick={navigateToHome} className="hover:text-black font-medium transition cursor-pointer">
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-black font-bold">Dynamic Site Map</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {totalUrls} Indexed URLs
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white border-b border-stone-200 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4B00]/10 text-[#FF4B00] text-xs font-bold mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  Auto-Discovered & Live Synchronized
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  Complete Website Sitemap
                </h1>
                <p className="text-stone-500 text-xs sm:text-sm max-w-2xl mt-1">
                  Browse all live and newly coming sacred pilgrimage tour packages, spiritual destinations, travel guides, and information pages.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setViewingXml(!viewingXml)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-stone-300"
                >
                  <FileText className="w-4 h-4 text-stone-600" />
                  {viewingXml ? 'View Visual Sitemap' : 'View XML Schema'}
                </button>
                <button
                  onClick={handleDownloadXml}
                  className="px-4 py-2.5 bg-[#FF4B00] hover:bg-[#E04200] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download sitemap.xml
                </button>
              </div>
            </div>

            {/* Search & Tabs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search pages, packages, destinations, temple guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#FF4B00] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Links', count: totalUrls },
                  { id: 'packages', label: 'Yatra Packages', count: packages.length },
                  { id: 'destinations', label: 'Destinations', count: destinationList.length },
                  { id: 'guides', label: 'Temple Guides', count: guides.filter(g => g.status === 'published').length },
                  { id: 'pages', label: 'Core & Custom Pages', count: corePages.length + customPages.filter(p => p.status === 'published').length },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === t.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === t.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* XML Viewer Mode */}
        {viewingXml ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-stone-900 rounded-2xl p-4 sm:p-6 border border-stone-800 text-emerald-400 font-mono text-xs overflow-x-auto shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4 text-stone-400">
                <span className="font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#FF4B00]" />
                  https://mybhaktisathi.com/sitemap.xml
                </span>
                <span className="text-[11px]">{totalUrls} URL entries generated</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{xmlContent}</pre>
            </div>
          </div>
        ) : (
          /* Visual Directory Mode */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* 1. Sacred Yatra & Tour Packages */}
            {(activeTab === 'all' || activeTab === 'packages') && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                      <Compass className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-stone-900">
                        Sacred Pilgrimage & Yatra Tour Packages
                      </h2>
                      <p className="text-xs text-stone-500">
                        Auto-updates whenever a new package is published in CMS ({filteredPackages.length} packages)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={navigateToAllTours}
                    className="text-xs font-bold text-[#FF4B00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Browse All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => navigateToPackage(pkg.id)}
                      className="p-3.5 rounded-xl border border-stone-200 hover:border-[#FF4B00] hover:shadow-xs transition bg-stone-50/50 hover:bg-white cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700 uppercase">
                            {pkg.category || 'Pilgrimage'}
                          </span>
                          <span className="text-[11px] font-extrabold text-stone-900">
                            {pkg.priceOnRequest || (!pkg.price && !pkg.discountedPrice) || ((pkg.price || 0) <= 0 && (!pkg.discountedPrice || pkg.discountedPrice <= 0))
                              ? 'Price on Request'
                              : `₹${(pkg.discountedPrice || pkg.price)?.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#FF4B00] transition line-clamp-2 leading-snug pt-1">
                          {pkg.title}
                        </h3>
                        <p className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                          /package/{pkg.slug || pkg.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Spiritual Destinations & Sacred Circuits */}
            {(activeTab === 'all' || activeTab === 'destinations') && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
                      <Map className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-stone-900">
                        Spiritual Destinations & Shrines
                      </h2>
                      <p className="text-xs text-stone-500">
                        Sacred regions and temple circuits across India ({filteredDestinations.length} destinations)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={navigateToDestinationsExplorer}
                    className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Explore Map <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => navigateToDestination(dest.slug)}
                      className="p-3 rounded-xl border border-stone-200 hover:border-sky-500 hover:shadow-xs transition bg-stone-50/50 hover:bg-white cursor-pointer group space-y-1"
                    >
                      <h3 className="text-xs font-bold text-stone-900 group-hover:text-sky-700 transition">
                        {dest.name}
                      </h3>
                      {dest.subtitle && (
                        <p className="text-[10px] text-stone-500 line-clamp-1">
                          {dest.subtitle}
                        </p>
                      )}
                      <p className="text-[10px] text-stone-400 font-mono">
                        /destination/{dest.slug}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Temple Guides & Devotional Articles */}
            {(activeTab === 'all' || activeTab === 'guides') && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-stone-900">
                        Temple Travel Guides & Darshan Information
                      </h2>
                      <p className="text-xs text-stone-500">
                        Detailed pilgrimage itineraries, aarti timings & tips ({filteredGuides.length} articles)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={navigateToGuideHub}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Guide Hub <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredGuides.map((guide) => (
                    <div
                      key={guide.id}
                      onClick={() => navigateToGuideDetail(guide.slug)}
                      className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition bg-stone-50/50 hover:bg-white cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {guide.category || 'Guide'}
                        </span>
                        {guide.destination && (
                          <span className="text-[10px] text-stone-500 font-medium">
                            {guide.destination}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-stone-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-[10px] text-stone-400 font-mono truncate">
                        /guide/{guide.slug}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Core Website & Policy Pages */}
            {(activeTab === 'all' || activeTab === 'pages') && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Layers className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-stone-900">
                      Core Website & Information Pages
                    </h2>
                    <p className="text-xs text-stone-500">
                      Storefront, agency information, booking guidelines, legal policies & custom pages
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredCorePages.map((page) => (
                    <div
                      key={page.slug}
                      onClick={() => {
                        if (page.action) {
                          page.action();
                        } else if (page.path === '/panchang') {
                          window.location.href = '/panchang';
                        } else if (page.path === '/rashifal') {
                          window.location.href = '/rashifal';
                        } else {
                          navigateToHome();
                        }
                      }}
                      className="p-3 rounded-xl border border-stone-200 hover:border-purple-500 hover:shadow-xs transition bg-stone-50/50 hover:bg-white cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                          {page.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-stone-900 group-hover:text-purple-700 transition">
                        {page.title}
                      </h3>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {page.path}
                      </p>
                    </div>
                  ))}

                  {/* Custom Pages */}
                  {filteredCustomPages.map((page) => (
                    <div
                      key={page.id}
                      onClick={() => navigateToCustomPage(page.slug)}
                      className="p-3 rounded-xl border border-stone-200 hover:border-purple-500 hover:shadow-xs transition bg-stone-50/50 hover:bg-white cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          Custom Page
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-stone-900 group-hover:text-purple-700 transition line-clamp-1">
                        {page.title}
                      </h3>
                      <p className="text-[10px] text-stone-400 font-mono">
                        /page/{page.slug}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <GlobalFooter />
    </div>
  );
};

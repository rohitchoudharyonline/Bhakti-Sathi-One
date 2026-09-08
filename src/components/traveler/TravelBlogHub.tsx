import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { BlogPost, BlogCategory } from '../../types/cms';
import { updatePageSeo } from '../../utils/seo';
import { generateBreadcrumbSchema } from '../../utils/seoEngine';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import {
  Compass,
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Tag,
  Bookmark,
  Share2,
  ChevronRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

export const TravelBlogHub: React.FC = () => {
  const {
    blogPosts,
    blogCategories,
    navigateToBlogPost,
    navigateToHome,
    agencySettings,
  } = useTours();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SEO & Schema Initialization
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: origin },
      { name: 'Travel Blog & Guides', url: `${origin}/travel-blog` },
    ]);

    updatePageSeo({
      title: 'Sacred Yatra Blog & Pilgrimage Destination Guides (2026) | Bhakti Sathi',
      description:
        'Read expert pilgrimage travel guides, Vaishno Devi SMVDSB yatra registration instructions, Char Dham advisories, Kashi Vishwanath darshan tips, and transparent yatra packages.',
      canonicalPath: '/travel-blog',
      schemaData: breadcrumbSchema,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const publishedPosts = blogPosts.filter((p) => p.status === 'published');

  const filteredPosts = publishedPosts.filter((post) => {
    if (selectedCategory !== 'all' && post.categorySlug !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q)) ||
        post.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featuredPost = publishedPosts.find((p) => p.featured) || publishedPosts[0];
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between font-sans selection:bg-stone-900 selection:text-white pb-20 lg:pb-0">
      <div>
        {/* Unified Top Navbar */}
        <Navbar />

        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-stone-200 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-stone-500">
            <button
              onClick={navigateToHome}
              className="hover:text-black font-semibold transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-black font-bold">Travel Blog & Destination Guides</span>
          </div>
        </div>



        {/* Main Content Hub */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-36 sm:pt-12 sm:pb-16 space-y-12">
          {/* Featured Hero Article */}
          {featuredPost && selectedCategory === 'all' && !searchQuery && (
            <div
              onClick={() => navigateToBlogPost(featuredPost.slug)}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:border-black transition duration-300 grid grid-cols-1 lg:grid-cols-12 cursor-pointer group"
            >
              <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto relative overflow-hidden bg-stone-100">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.featuredImageAlt || featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 text-amber-400 font-bold text-xs rounded-lg uppercase tracking-wider backdrop-blur-xs">
                  Featured Guide
                </span>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="px-2.5 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-800">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-black leading-snug group-hover:text-stone-700 transition">
                    {featuredPost.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author?.avatar}
                      alt={featuredPost.author?.name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-black">{featuredPost.author?.name}</p>
                      <p className="text-[10px] text-stone-500">{featuredPost.author?.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-black group-hover:translate-x-1 transition">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-stone-600" />
                Latest Guides & Articles ({filteredPosts.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory === 'all' && !searchQuery ? regularPosts : filteredPosts).map(
                (post) => (
                  <article
                    key={post.id}
                    onClick={() => navigateToBlogPost(post.slug)}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-black transition duration-300 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="aspect-16/10 relative overflow-hidden bg-stone-100">
                        <img
                          src={post.featuredImage}
                          alt={post.featuredImageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 text-white text-[10px] font-bold rounded-md uppercase tracking-wider backdrop-blur-xs">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTimeMinutes} min read
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-black leading-snug group-hover:text-stone-700 transition line-clamp-2">
                          {post.title}
                        </h4>

                        <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author?.avatar}
                          alt={post.author?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-stone-700">
                          {post.author?.name}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-black flex items-center gap-1 group-hover:translate-x-0.5 transition">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>

            {filteredPosts.length === 0 && (
              <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
                <Compass className="w-10 h-10 text-stone-400 mx-auto" />
                <h4 className="text-base font-bold text-black">No articles found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your search keywords or explore all available categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <GlobalFooter />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useTours } from '../../context/TourContext';
import { BlogPost } from '../../types/cms';
import { updatePageSeo } from '../../utils/seo';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '../../utils/seoEngine';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';
import { resolveDisplayImage, handleImageError } from '../../utils/imageResolver';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ChevronRight,
  Share2,
  Check,
  Tag,
  Compass,
  Bookmark,
  Sparkles,
  MapPin,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

interface BlogPostDetailViewProps {
  slug: string;
}

export const BlogPostDetailView: React.FC<BlogPostDetailViewProps> = ({ slug }) => {
  const {
    blogPosts,
    navigateToBlogHub,
    navigateToHome,
    navigateToBlogPost,
    navigateToAllTours,
    packages,
    agencySettings,
    mediaAssets,
    submitInquiry,
  } = useTours();

  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const post = blogPosts.find((p) => p.slug === slug) || blogPosts[0];

  useEffect(() => {
    if (!post) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
    const postUrl = `${origin}/travel-blog/${post.slug}`;

    const breadcrumbs = generateBreadcrumbSchema([
      { name: 'Home', url: origin },
      { name: 'Travel Blog', url: `${origin}/travel-blog` },
      { name: post.title, url: postUrl },
    ]);

    const blogSchema = generateBlogPostingSchema(post, agencySettings);

    updatePageSeo({
      title: post.seo?.metaTitle || `${post.title} | Bhakti Sathi`,
      description: post.seo?.metaDescription || post.excerpt,
      canonicalPath: `/travel-blog/${post.slug}`,
      schemaData: [breadcrumbs, blogSchema],
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [post, agencySettings]);

  if (!post) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-black">Article Not Found</h2>
          <button
            onClick={navigateToBlogHub}
            className="px-5 py-2 bg-black text-white rounded-xl text-xs font-bold"
          >
            Back to Travel Blog
          </button>
        </div>
      </div>
    );
  }

  const relatedPackages = packages.slice(0, 3);
  const otherPosts = blogPosts.filter((p) => p.id !== post.id && p.status === 'published').slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`*${post.title}*\n${post.excerpt}\nRead more at: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTwitterShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between font-sans selection:bg-stone-900 selection:text-white pb-48 md:pb-28">
      <div>
        {/* Unified Top Navbar */}
        <Navbar />

        {/* Breadcrumbs Navigation */}
        <div className="bg-stone-50 border-b border-stone-200 py-3 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-stone-500 overflow-x-auto no-scrollbar">
            <button onClick={navigateToHome} className="hover:text-black font-medium shrink-0">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <button onClick={navigateToBlogHub} className="hover:text-black font-medium shrink-0">
              Travel Blog
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-black font-bold truncate">{post.title}</span>
          </div>
        </div>

        {/* Article Header Container */}
        <article className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 bg-stone-100 text-stone-900 font-bold text-xs rounded-full uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} min read
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
              {post.title}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          </div>

          {/* Featured Image */}
          <div className="aspect-16/9 bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
            <img
              src={resolveDisplayImage(post.featuredImage, mediaAssets)}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, post.featuredImage, mediaAssets)}
            />
          </div>

          {/* Author | Date Row (Below photo, reduced size, Instagram verified style) */}
          <div className="my-6 py-2.5 px-4 bg-stone-50/80 rounded-xl border border-stone-200/80 text-xs text-stone-600 flex items-center justify-between gap-4 max-w-fit shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 tracking-tight">By Bhakti Sathi Staff</span>
              <span title="Verified Staff" className="inline-flex">
                <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.99 14.5l-3.99-4 1.41-1.42L10.01 13.67l7.59-7.59 1.41 1.41-9 9z"/>
                </svg>
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-500 font-medium">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="text-stone-400 text-[11px] font-medium border-l border-stone-200 pl-3">
              {post.readTimeMinutes}m read
            </div>
          </div>

          {/* Article Main Body (Markdown / Clean Typography / WordPress Inline Images) */}
          <ArticleContentRenderer content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
                Tagged:
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share buttons */}
          <div className="bg-stone-50 border border-stone-200/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Share this article</h4>
              <p className="text-xs text-stone-500">Spread the word with friends & fellow travelers</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsAppShare}
                title="Share on WhatsApp"
                className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition cursor-pointer shadow-2xs border border-emerald-200"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              <button
                onClick={handleFacebookShare}
                title="Share on Facebook"
                className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition cursor-pointer shadow-2xs border border-blue-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              <button
                onClick={handleTwitterShare}
                title="Share on X / Twitter"
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 flex items-center justify-center transition cursor-pointer shadow-2xs border border-stone-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>

              <button
                onClick={handleShare}
                title="Copy Link"
                className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition cursor-pointer shadow-2xs border border-amber-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Elegant Newsletter Signup Card */}
          <div className="bg-stone-50 border border-stone-200 p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-[#FF4B00] text-xs font-bold uppercase tracking-wider">
              <span className="p-1 bg-[#FF4B00]/10 rounded-md">📬</span>
              <span>Spiritual Pilgrimage Newsletter</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                Join Bhakti Sathi's Devotee Community
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
                Subscribe to get direct sacred temple histories, upcoming pilgrimage muhurats (timings), and professional travel tips for elderly devotees in India. No spam, unsubscribe anytime.
              </p>
            </div>

            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800">
                <span className="text-xl">✨</span>
                <div>
                  <p className="font-bold text-sm">Thank you for subscribing!</p>
                  <p className="text-xs text-emerald-700/90 mt-0.5">We have registered your email. You will receive our next spiritual updates soon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const cleanEmail = emailInput.trim();
                if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
                  alert("Please enter a valid email address");
                  return;
                }
                setSubscribing(true);
                submitInquiry({
                  packageId: 'newsletter-signup',
                  packageTitle: 'Newsletter Subscriber',
                  travelerName: cleanEmail.split('@')[0],
                  email: cleanEmail,
                  phone: '-',
                  travelDate: new Date().toISOString().split('T')[0],
                  adults: 1,
                  children: 0,
                  specialRequests: `Signed up to newsletter via blog post: "${post.title}"`,
                  estimatedTotal: 0,
                });
                setSubscribed(true);
                setEmailInput('');
                setSubscribing(false);
              }} className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  disabled={subscribing}
                  className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-hidden focus:border-[#FF4B00] focus:ring-1 focus:ring-[#FF4B00] text-stone-900 placeholder-stone-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-3 bg-[#FF4B00] hover:bg-[#d43e00] text-white rounded-xl text-xs font-black tracking-wide shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe Now'}
                </button>
              </form>
            )}
          </div>

          {/* Read this also / Recommended Articles */}
          {otherPosts.length > 0 && (
            <div className="pt-12 border-t border-stone-200 space-y-6">
              <h3 className="text-lg font-black text-black">Read this also</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {otherPosts.map((other) => (
                  <div
                    key={other.id}
                    onClick={() => navigateToBlogPost(other.slug)}
                    className="p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 transition cursor-pointer space-y-2 group"
                  >
                    <div className="aspect-16/10 rounded-xl overflow-hidden bg-stone-200">
                      <img
                        src={other.featuredImage}
                        alt={other.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <p className="text-xs font-bold text-black line-clamp-2">{other.title}</p>
                    <p className="text-[11px] text-stone-500">{other.readTimeMinutes} min read</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add articles / Booking CTA */}
          <div className="bg-black text-white p-6 sm:p-8 rounded-3xl space-y-4 mt-8 border border-stone-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Ready for your Himalayan Tour?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Book a Customized Himalayan Tour Package with Certified Drivers & Inspected Hotels
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Get direct transparent quotes with zero middlemen, 24/7 dedicated trip support, and flexible cancellation policies.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  window.open(`https://wa.me/${(agencySettings?.whatsapp || agencySettings?.phone || '').replace(/[^0-9]/g, '')}?text=Hi+Bhakti+Sathi,+I+read+your+article+${encodeURIComponent(post.title)}+and+want+a+custom+tour+quote!`, '_blank');
                }}
                className="px-6 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-stone-100 transition cursor-pointer"
              >
                Request Custom Itinerary & Quote
              </button>
              <button
                onClick={navigateToAllTours}
                className="px-5 py-3 bg-stone-900 border border-stone-700 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition cursor-pointer"
              >
                Browse All Tour Packages
              </button>
            </div>
          </div>
        </article>
      </div>

      <GlobalFooter />
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { GuideArticle, GuideFaq } from '../../types/guide';
import {
  generateGuideArticleSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
} from '../../utils/seoEngine';
import {
  ChevronRight,
  Home,
  BookOpen,
  MapPin,
  Clock,
  Calendar,
  User,
  Share2,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  ArrowRight,
  List,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface GuideDetailViewProps {
  slug: string;
}

export const GuideDetailView: React.FC<GuideDetailViewProps> = ({ slug }) => {
  const {
    guides,
    packages,
    agencySettings,
    navigateToGuideHub,
    navigateToGuideDetail,
    navigateToHome,
    navigateToPackage,
  } = useTours();

  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Find guide by slug
  const guide = useMemo(() => {
    return guides.find((g) => g.slug === slug);
  }, [guides, slug]);

  // Extract Table of Contents from content ## headings
  const tableOfContents = useMemo(() => {
    if (!guide?.content) return [];
    const headings: { id: string; title: string }[] = [];
    const lines = guide.content.split('\n');

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '').trim();
        const id = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        headings.push({ id, title });
      }
    });

    return headings;
  }, [guide?.content]);

  // Related Packages
  const relatedPackages = useMemo(() => {
    if (!guide) return [];
    if (guide.relatedPackageIds && guide.relatedPackageIds.length > 0) {
      return packages.filter((p) => guide.relatedPackageIds?.includes(p.id));
    }
    // Fallback: match by destination or category
    const dest = (guide.destination || guide.destinationName || '').toLowerCase();
    return packages
      .filter(
        (p) =>
          (dest && p.destination.toLowerCase().includes(dest)) ||
          p.category?.toLowerCase().includes('pilgrimage') ||
          p.category?.toLowerCase().includes('yatra')
      )
      .slice(0, 3);
  }, [guide, packages]);

  // Other Related Guides
  const otherGuides = useMemo(() => {
    if (!guide) return [];
    return guides
      .filter((g) => g.id !== guide.id && g.status === 'published')
      .slice(0, 3);
  }, [guide, guides]);

  // SEO Injection
  useEffect(() => {
    if (!guide) return;

    // 1. Title & Meta Description
    const metaTitle = guide.seo?.metaTitle || guide.title;
    const metaDesc = guide.seo?.metaDescription || guide.excerpt;
    document.title = `${metaTitle} | Bhakti Sathi`;

    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.setAttribute('name', 'description');
      document.head.appendChild(descEl);
    }
    descEl.setAttribute('content', metaDesc);

    // 2. Canonical Tag
    const canonicalUrl = guide.seo?.canonicalUrl || `https://mybhaktisathi.com/guides/${guide.slug}`;
    let canonEl = document.querySelector('link[rel="canonical"]');
    if (!canonEl) {
      canonEl = document.createElement('link');
      canonEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonEl);
    }
    canonEl.setAttribute('href', canonicalUrl);

    // 3. Inject Article Schema
    const articleSchema = generateGuideArticleSchema(guide, agencySettings);
    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.id = 'guide-article-schema';
    articleScript.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    // 4. Inject FAQ Schema if present
    let faqScript: HTMLScriptElement | null = null;
    if (guide.faqs && guide.faqs.length > 0) {
      const faqSchema = generateFAQPageSchema(guide.faqs);
      faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.id = 'guide-faq-schema';
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
    }

    // 5. Inject Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://mybhaktisathi.com/' },
      { name: 'Pilgrimage & Travel Guides', url: 'https://mybhaktisathi.com/guides' },
      { name: guide.title, url: canonicalUrl },
    ]);
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.id = 'guide-breadcrumb-schema';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.getElementById('guide-article-schema')?.remove();
      document.getElementById('guide-faq-schema')?.remove();
      document.getElementById('guide-breadcrumb-schema')?.remove();
    };
  }, [guide, agencySettings]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!guide) return;
    const url = typeof window !== 'undefined' ? window.location.href : `https://mybhaktisathi.com/guides/${guide.slug}`;
    const text = encodeURIComponent(`*${guide.title}*\n\nRead this holy Guide by Bhakti Sathi:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 max-w-md w-full space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Guide Not Found</h2>
          <p className="text-xs text-stone-600">
            The Guide you are looking for may have moved or is currently in draft review.
          </p>
          <button
            onClick={navigateToGuideHub}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition"
          >
            <span>Explore All Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-stone-200/80 bg-white/70 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={navigateToHome}
              className="flex items-center gap-1 hover:text-amber-800 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
            <button
              onClick={navigateToGuideHub}
              className="hover:text-amber-800 transition"
            >
              Guides
            </button>
            <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="font-semibold text-stone-800 truncate max-w-[200px] sm:max-w-xs">
              {guide.title}
            </span>
          </nav>

          {/* Quick Share */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition text-xs"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Guide Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Article Meta Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 bg-amber-100/80 text-amber-900 font-bold text-xs rounded-lg border border-amber-200/80">
              {guide.category}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-700 text-xs rounded-lg font-medium">
              <MapPin className="w-3 h-3 text-stone-500" />
              {guide.destination || guide.destinationName || 'Sacred Pilgrimage'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-500 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              {guide.readingTimeMinutes || 4} min read
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight">
            {guide.title}
          </h1>

          {/* Excerpt Callout */}
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal border-l-3 border-amber-600 pl-4 py-1 text-left bg-amber-50/40 rounded-r-xl">
            {guide.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200/80 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs">
                {guide.authorName?.charAt(0) || 'B'}
              </div>
              <div>
                <span className="font-semibold text-stone-800">{guide.authorName || 'Bhakti Sathi Yatra Team'}</span>
                <span className="text-stone-400 block sm:inline sm:ml-2">Editorial Staff</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-stone-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Updated:{' '}
                {new Date(guide.updatedAt || guide.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 aspect-16/9 bg-stone-100">
          <img
            src={
              guide.featuredImage ||
              'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
            }
            alt={guide.imageAlt || guide.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Table of Contents Box (if ## headings exist) */}
        {tableOfContents.length > 1 && (
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <List className="w-4 h-4 text-amber-700" />
              <span>In This Guide</span>
            </div>
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {tableOfContents.map((item, i) => (
                <a
                  key={i}
                  href={`#${item.id}`}
                  className="text-xs text-stone-600 hover:text-amber-800 hover:underline flex items-center gap-1.5 truncate"
                >
                  <span className="text-stone-400 font-mono text-[11px]">{i + 1}.</span>
                  <span className="truncate">{item.title}</span>
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-stone max-w-none space-y-6 text-stone-800 leading-relaxed text-sm sm:text-base">
          {guide.content.split('\n\n').map((block, idx) => {
            // Heading 2
            if (block.startsWith('## ')) {
              const text = block.replace('## ', '').trim();
              const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
              return (
                <h2
                  key={idx}
                  id={id}
                  className="text-xl sm:text-2xl font-bold text-stone-900 pt-6 pb-2 border-b border-stone-200 scroll-mt-20"
                >
                  {text}
                </h2>
              );
            }

            // Heading 3
            if (block.startsWith('### ')) {
              const text = block.replace('### ', '').trim();
              return (
                <h3 key={idx} className="text-lg font-bold text-stone-900 pt-3 pb-1">
                  {text}
                </h3>
              );
            }

            // Blockquote
            if (block.startsWith('> ')) {
              const text = block.replace(/^>\s*/gm, '');
              return (
                <blockquote
                  key={idx}
                  className="border-l-4 border-amber-600 bg-amber-50/40 p-4 rounded-r-xl italic text-stone-700 my-4 text-sm"
                >
                  {text}
                </blockquote>
              );
            }

            // Horizontal rule
            if (block.trim() === '---') {
              return <hr key={idx} className="my-8 border-stone-200" />;
            }

            // Bullet list
            if (block.startsWith('- ') || block.startsWith('* ')) {
              const items = block.split('\n').map((l) => l.replace(/^[-*]\s+/, ''));
              return (
                <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 my-3">
                  {items.map((item, i) => (
                    <li key={i} className="text-stone-700 text-sm sm:text-base">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            // Numbered list
            if (/^\d+\.\s+/.test(block)) {
              const items = block.split('\n').map((l) => l.replace(/^\d+\.\s+/, ''));
              return (
                <ol key={idx} className="list-decimal list-inside space-y-1.5 pl-2 my-3">
                  {items.map((item, i) => (
                    <li key={i} className="text-stone-700 text-sm sm:text-base">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            }

            // Normal paragraph
            return (
              <p key={idx} className="text-stone-700 leading-relaxed text-sm sm:text-base">
                {block}
              </p>
            );
          })}
        </div>

        {/* FAQs Accordion Section */}
        {guide.faqs && guide.faqs.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5 mt-10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Devotee Questions & Answers</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Frequently Asked Questions About {guide.destination} Yatra
            </h2>

            <div className="space-y-3 pt-2">
              {guide.faqs.map((faq, i) => {
                const isOpen = expandedFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-stone-200 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 bg-stone-50/70 hover:bg-stone-100 transition"
                    >
                      <span className="text-sm font-bold text-stone-900">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Pilgrimage Tour Packages */}
        {relatedPackages.length > 0 && (
          <section className="bg-amber-50/50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 space-y-6 mt-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Recommended Yatra Packages
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  Guided Pilgrimages for {guide.destination || guide.destinationName || 'This Yatra'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-16/10 bg-stone-100 overflow-hidden">
                      <img
                        src={pkg.coverImage}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[11px] font-bold text-amber-800">
                        {pkg.durationDays}D / {pkg.durationNights}N
                      </span>
                      <h3 className="text-sm font-bold text-stone-900 line-clamp-2">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2">
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Starting from</span>
                      <span className="text-sm font-extrabold text-stone-900">
                        ₹{(pkg.discountedPrice || pkg.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${(agencySettings.whatsapp || '919419915255').replace(/\D/g, '')}?text=Namaste%20Bhakti%20Sathi%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(pkg.title)}%20package`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other Published Guides */}
        {otherGuides.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-stone-200">
            <h2 className="text-lg font-bold text-stone-900">Explore More Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherGuides.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateToGuideDetail(item.slug)}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-amber-400 cursor-pointer shadow-xs transition space-y-2"
                >
                  <span className="text-[11px] font-bold text-amber-800">{item.category}</span>
                  <h3 className="text-xs font-bold text-stone-900 line-clamp-2 hover:text-amber-700">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-stone-400 block">
                    {item.readingTimeMinutes || 3} min read
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Floating Yatra Desk Inquiry Pill for Mobile Devotees */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-40">
        <a
          href={`https://wa.me/${(agencySettings.whatsapp || '919419915255').replace(/\D/g, '')}?text=Namaste%20Bhakti%20Sathi%2C%20I%20am%20reading%20the%20${encodeURIComponent(guide.title)}%20and%20would%20like%20to%20plan%20my%20yatra`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between sm:justify-start gap-3 bg-stone-900 text-white px-5 py-3 rounded-full shadow-lg border border-stone-800 hover:bg-black transition"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold">Have questions about this yatra?</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </span>
        </a>
      </div>
    </div>
  );
};

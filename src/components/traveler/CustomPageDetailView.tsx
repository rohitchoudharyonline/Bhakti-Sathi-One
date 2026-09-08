import React, { useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { updatePageSeo } from '../../utils/seo';
import { generateBreadcrumbSchema } from '../../utils/seoEngine';
import { Navbar } from '../common/Navbar';
import { GlobalFooter } from './GlobalFooter';
import { ChevronRight, ArrowLeft, ShieldCheck, Sparkles, Phone, Mail } from 'lucide-react';

interface CustomPageDetailViewProps {
  slug: string;
}

export const CustomPageDetailView: React.FC<CustomPageDetailViewProps> = ({ slug }) => {
  const { customPages, navigateToHome, agencySettings } = useTours();

  const page = customPages.find((p) => p.slug === slug) || customPages[0];

  useEffect(() => {
    if (!page) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
    const pageUrl = `${origin}/page/${page.slug}`;

    const breadcrumbs = generateBreadcrumbSchema([
      { name: 'Home', url: origin },
      { name: page.title, url: pageUrl },
    ]);

    updatePageSeo({
      title: page.seo?.metaTitle || `${page.title} | Bhakti Sathi Travel`,
      description: page.seo?.metaDescription || page.subtitle || page.content.slice(0, 150),
      canonicalPath: `/page/${page.slug}`,
      schemaData: breadcrumbs,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (!page) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-black">Page Not Found</h2>
          <button
            onClick={navigateToHome}
            className="px-5 py-2 bg-black text-white rounded-xl text-xs font-bold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between font-sans selection:bg-stone-900 selection:text-white pb-48 md:pb-28">
      <div>
        {/* Unified Top Navbar */}
        <Navbar />

        {/* Breadcrumb Bar */}
        <div className="bg-stone-50 border-b border-stone-200 py-3 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-stone-500">
            <button onClick={navigateToHome} className="hover:text-black font-medium transition cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-black font-bold">{page.title}</span>
          </div>
        </div>

        {/* Hero Section */}
        {page.heroImage ? (
          <div className="relative h-64 sm:h-80 bg-black overflow-hidden flex items-center justify-center">
            <img
              src={page.heroImage}
              alt={page.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{page.title}</h1>
              {page.subtitle && (
                <p className="text-stone-200 text-xs sm:text-base max-w-2xl mx-auto">
                  {page.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-black text-white py-12 px-4 sm:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-black">{page.title}</h1>
            {page.subtitle && <p className="text-stone-300 text-sm mt-2">{page.subtitle}</p>}
          </div>
        )}

        {/* Content Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-8">
          <div className="prose max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-6">
            {page.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl sm:text-2xl font-bold text-black mt-8 mb-3 pt-4 border-t border-stone-100">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg sm:text-xl font-bold text-black mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter((l) => l.startsWith('- '));
                return (
                  <ul key={index} className="space-y-2 my-4 pl-4 list-disc text-stone-700">
                    {items.map((item, i) => (
                      <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-stone-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Direct Support Box */}
          <div className="p-6 bg-stone-50 border border-stone-200 rounded-3xl mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-black">Need assistance with your booking?</h4>
              <p className="text-xs text-stone-500">
                Our destination travel team in Srinagar & Jammu is available 24/7.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${agencySettings.phone}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 hover:border-black rounded-xl text-xs font-bold text-black transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {agencySettings.phone}</span>
              </a>
              <a
                href={`mailto:${agencySettings.email}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Us</span>
              </a>
            </div>
          </div>
        </main>
      </div>

      <GlobalFooter />
    </div>
  );
};

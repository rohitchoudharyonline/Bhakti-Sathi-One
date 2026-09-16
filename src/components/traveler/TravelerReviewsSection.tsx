import React from 'react';
import { Star, CheckCircle, ExternalLink, ShieldCheck, ThumbsUp } from 'lucide-react';

export const TravelerReviewsSection: React.FC = () => {
  const googleReviewsUrl = "https://share.google/Nan7Zhv4S4omnYeOM";

  // JSON-LD Schema for Google Reviews / AggregateRating SEO indexing
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Holidays Hunt",
    "url": googleReviewsUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "1300",
      "bestRating": "5"
    }
  };

  return (
    <section id="google-reviews-section" className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Inject Google Reviews JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 p-5 sm:p-6">
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/40 via-amber-50/30 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Left Side: Google G Logo & Business Details */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Premium Google G Logo */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-center p-2.5 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-extrabold text-stone-900 tracking-tight leading-tight">
                    Holidays Hunt Travel & Hospitality
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    Google Verified
                  </span>
                </div>

                {/* Rating Stars & Count */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-stone-900 leading-none">4.7</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    (1,300+ Verified Reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Trust Pills & CTA Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  98% Recommended
                </span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">
                  100% Authentic Stays & Trips
                </span>
              </div>

              <a
                href={googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-2xs group shrink-0"
              >
                <span>Read Google Reviews</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SeoHelmetProps {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string | string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  siteName?: string;
  authorName?: string;
  type?: 'website' | 'article';
}

export const SeoHelmet: React.FC<SeoHelmetProps> = ({
  title,
  metaTitle,
  metaDescription,
  keywords,
  canonicalUrl,
  ogImage,
  noIndex = false,
  siteName = 'Holidays Hunt',
  authorName = 'Holidays Hunt Team',
  type = 'article',
}) => {
  const displayTitle = metaTitle || title || 'Holidays Hunt - Spiritual Pilgrimage & Travel Guides';
  const fullTitle = displayTitle.includes('Holidays Hunt') ? displayTitle : `${displayTitle} | ${siteName}`;
  const description = metaDescription || 'Discover spiritual pilgrimage packages, travel guides, VIP temple darshan updates, and cultural heritage itineraries across India.';
  
  const formattedKeywords = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || 'pilgrimage, spiritual travel, temple guides, darshan, yatra';

  const defaultOgImage = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
  const finalOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={formattedKeywords} />
      <meta name="author" content={authorName} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalOgImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalOgImage} />
    </Helmet>
  );
};

/**
 * SEO & Google URL Indexing Helper
 * Complies with Google Search Central indexing guidelines:
 * - Dynamic Title & Meta Description
 * - Canonical link updates
 * - Open Graph, Twitter Card & Google thumbnail tags
 * - Schema.org JSON-LD structured data (TouristDestination, TourPackage, BreadcrumbList)
 */

import { extractStorageKey, formatApiFilesUrl } from './imageResolver';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaData?: Record<string, unknown> | Array<Record<string, unknown>>;
  type?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Converts R2 keys, relative /api/files/ paths, or media domain URLs into a public HTTPS URL
 * that search engines and social crawlers can directly fetch from the worker bucket proxy.
 */
export function toPublicSeoImageUrl(
  rawUrl?: string | null,
  origin: string = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://holidayshunt.com'
): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const clean = rawUrl.trim();
  if (!clean || clean.startsWith('data:') || clean.startsWith('blob:')) return undefined;

  const baseOrigin = origin.replace(/\/$/, '');
  const storageKey = extractStorageKey(clean);
  if (storageKey) {
    return `${baseOrigin}${formatApiFilesUrl(storageKey)}`;
  }

  if (clean.startsWith('/')) {
    return `${baseOrigin}${clean}`;
  }

  return clean;
}

export function updatePageSeo(config: SeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = config.title;

  // 2. Update Meta Description & Keywords
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  if (config.keywords) {
    updateMetaTag('name', 'keywords', config.keywords);
  }

  // 3. Update Robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  const robotsIndex = config.noIndex ? 'noindex' : 'index';
  const robotsFollow = config.noFollow ? 'nofollow' : 'follow';
  metaRobots.setAttribute('content', `${robotsIndex}, ${robotsFollow}, max-snippet:-1, max-image-preview:large, max-video-preview:-1`);

  // 4. Update Canonical Link
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  const targetCanonical = config.canonicalUrl || (config.canonicalPath
    ? `${window.location.origin}${config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`}`
    : window.location.href.split('?')[0]);
  linkCanonical.setAttribute('href', targetCanonical);

  // 5. Update Open Graph, Twitter Card & Thumbnail Meta
  const resolvedOgTitle = config.ogTitle || config.title;
  const resolvedOgDesc = config.ogDescription || config.description;

  updateMetaTag('property', 'og:title', resolvedOgTitle);
  updateMetaTag('property', 'og:description', resolvedOgDesc);
  updateMetaTag('property', 'og:url', targetCanonical);
  updateMetaTag('property', 'og:type', config.type || 'website');

  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', resolvedOgTitle);
  updateMetaTag('name', 'twitter:description', resolvedOgDesc);

  const publicImage = toPublicSeoImageUrl(config.ogImage);
  if (publicImage) {
    updateMetaTag('property', 'og:image', publicImage);
    updateMetaTag('name', 'twitter:image', publicImage);
    updateMetaTag('name', 'thumbnail', publicImage);
  }

  // 6. JSON-LD Structured Data
  let scriptSchema = document.querySelector('#seo-schema-jsonld') as HTMLScriptElement | null;
  if (!scriptSchema) {
    scriptSchema = document.createElement('script');
    scriptSchema.setAttribute('type', 'application/ld+json');
    scriptSchema.setAttribute('id', 'seo-schema-jsonld');
    document.head.appendChild(scriptSchema);
  }
  if (config.schemaData) {
    scriptSchema.textContent = JSON.stringify(config.schemaData);
  }
}

function updateMetaTag(attrName: string, attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

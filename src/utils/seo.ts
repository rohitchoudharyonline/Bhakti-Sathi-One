/**
 * SEO & Google URL Indexing Helper
 * Complies with Google Search Central indexing guidelines:
 * - Dynamic Title & Meta Description
 * - Canonical link updates
 * - Open Graph & Twitter Card tags
 * - Schema.org JSON-LD structured data (TouristDestination, TourPackage, BreadcrumbList)
 */

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  schemaData?: Record<string, unknown> | Array<Record<string, unknown>>;
  type?: string;
}

export function updatePageSeo(config: SeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = config.title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Update Robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // 4. Update Canonical Link
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}${config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`}`;
  linkCanonical.setAttribute('href', canonicalUrl);

  // 5. Update Open Graph & Twitter Card Meta
  updateMetaTag('property', 'og:title', config.title);
  updateMetaTag('property', 'og:description', config.description);
  updateMetaTag('property', 'og:url', canonicalUrl);
  updateMetaTag('property', 'og:type', config.type || 'website');
  
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', config.title);
  updateMetaTag('name', 'twitter:description', config.description);

  if (config.ogImage) {
    updateMetaTag('property', 'og:image', config.ogImage);
    updateMetaTag('name', 'twitter:image', config.ogImage);
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

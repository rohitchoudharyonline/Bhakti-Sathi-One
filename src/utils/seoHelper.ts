export interface SEOData {
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
}

/**
  Generates SEO metadata adhering strictly to title <= 60 chars & description <= 130 chars.
 */
export function generateAutoSEO(type: 'destination' | 'temple' | 'package' | 'blog', name: string, extra?: { city?: string; state?: string; tagline?: string; price?: number }): SEOData {
  const cleanName = name.trim();
  const locationStr = extra?.city ? `${extra.city}` : extra?.state ? `${extra.state}` : 'India';

  let title = '';
  let description = '';
  let keywords = '';

  if (type === 'temple') {
    // Target Title: <= 60 chars
    title = `${cleanName} ${extra?.city || 'Yatra'} Guide | Bhakti Sathi`;
    if (title.length > 60) {
      title = `${cleanName} Guide | Bhakti Sathi`;
    }
    if (title.length > 60) {
      title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;
    }

    // Target Description: <= 130 chars
    const baseDesc = extra?.tagline 
      ? `Visit ${cleanName} in ${locationStr}. ${extra.tagline}`
      : `Complete travel & pilgrimage guide for ${cleanName} in ${locationStr}. Darshan timings, history & tour packages.`;

    if (baseDesc.length <= 130) {
      description = baseDesc;
    } else {
      description = `Visit ${cleanName} in ${locationStr}. Check darshan timings, sacred significance & yatra packages with Bhakti Sathi.`;
      if (description.length > 130) {
        description = `Explore ${cleanName} in ${locationStr}. Complete yatra guide, darshan info & tour packages by Bhakti Sathi.`;
      }
      if (description.length > 130) {
        description = `${cleanName} yatra guide, darshan timings & pilgrimage tour packages with Bhakti Sathi.`;
      }
    }

    keywords = `${cleanName}, ${cleanName} darshan, ${locationStr} temples, ${cleanName} yatra packages, Bhakti Sathi`;

  } else if (type === 'destination') {
    // Target Title: <= 60 chars
    title = `${cleanName} Tour Packages & Yatra Guide | Bhakti Sathi`;
    if (title.length > 60) {
      title = `${cleanName} Tour Packages | Bhakti Sathi`;
    }

    // Target Description: <= 130 chars
    description = `Book ${cleanName} tour packages with Bhakti Sathi. Explore sacred temples, verified hotels, private cabs & 24/7 yatra support.`;
    if (description.length > 130) {
      description = `Book ${cleanName} tour packages. Verified hotels, private cabs & 24/7 yatra support with Bhakti Sathi.`;
    }

    keywords = `${cleanName} tour packages, ${cleanName} yatra, ${cleanName} sacred temples, ${cleanName} holiday package, Bhakti Sathi`;

  } else if (type === 'package') {
    // Target Title: <= 60 chars
    title = `${cleanName} Package | Bhakti Sathi`;
    if (title.length > 60) {
      title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;
    }

    // Target Description: <= 130 chars
    const priceText = extra?.price ? ` Starting ₹${extra.price}.` : '';
    description = `Book ${cleanName}.${priceText} Private vehicle, verified hotel stays & 24/7 yatra support by Bhakti Sathi.`;
    if (description.length > 130) {
      description = `Book ${cleanName} with Bhakti Sathi. Verified hotels, private cab transfers & 24/7 yatra assistance.`;
    }

    keywords = `${cleanName}, pilgrimage tour, yatra booking, Bhakti Sathi packages`;

  } else {
    // Blog or default
    title = `${cleanName} | Bhakti Sathi`;
    description = `Read about ${cleanName} on Bhakti Sathi. Discover sacred Indian yatra guides, temple histories & travel tips.`;
    if (description.length > 130) {
      description = `Discover ${cleanName} with Bhakti Sathi. Sacred pilgrimage guides & yatra tips across India.`;
    }
    keywords = `${cleanName}, yatra guide, temple history, Bhakti Sathi`;
  }

  return {
    seoMetaTitle: title,
    seoMetaDescription: description,
    seoKeywords: keywords,
  };
}

/**
  Dynamically applies SEO tags to HTML document
 */
export function updateDocumentSEO(title?: string, description?: string, keywords?: string) {
  if (typeof document === 'undefined') return;

  const defaultTitle = 'Bhakti Sathi — All India Sacred Pilgrimage & Yatra Tour Packages';
  const defaultDesc = 'Book customized All India Sacred Pilgrimage Tour Packages with Bhakti Sathi. Explore Mata Vaishno Devi, Kashi Vishwanath, Ayodhya, Char Dham & more.';

  document.title = title || defaultTitle;

  // Description meta
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', description || defaultDesc);

  // OG Title & Desc
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title || defaultTitle);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description || defaultDesc);

  // Keywords
  if (keywords) {
    let kwMeta = document.querySelector('meta[name="keywords"]');
    if (!kwMeta) {
      kwMeta = document.createElement('meta');
      kwMeta.setAttribute('name', 'keywords');
      document.head.appendChild(kwMeta);
    }
    kwMeta.setAttribute('content', keywords);
  }
}

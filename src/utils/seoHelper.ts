export interface SEOData {
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
}

/**
  Generates SEO metadata adhering strictly to title <= 60 chars & description <= 130 chars.
 */
export function generateAutoSEO(
  type: 'destination' | 'temple' | 'package' | 'blog' | 'guide' | 'custom_page' | 'website_page',
  name: string,
  extra?: { city?: string; state?: string; tagline?: string; price?: number; category?: string }
): SEOData {
  const cleanName = name.trim();
  const locationStr = extra?.city ? `${extra.city}` : extra?.state ? `${extra.state}` : 'India';

  let title = '';
  let description = '';
  let keywords = '';

  if (type === 'temple') {
    title = `${cleanName} ${extra?.city || 'Yatra'} Guide | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName} Guide | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;

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
    title = `${cleanName} Tour Packages & Yatra Guide | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName} Tour Packages | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;

    description = `Book ${cleanName} tour packages with Bhakti Sathi. Explore sacred temples, verified hotels, private cabs & 24/7 yatra support.`;
    if (description.length > 130) {
      description = `Book ${cleanName} tour packages. Verified hotels, private cabs & 24/7 yatra support with Bhakti Sathi.`;
    }
    keywords = `${cleanName} tour packages, ${cleanName} yatra, ${cleanName} sacred temples, ${cleanName} holiday package, Bhakti Sathi`;

  } else if (type === 'package') {
    title = `${cleanName} Package | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;

    const priceText = extra?.price ? ` Starting ₹${extra.price}.` : '';
    description = `Book ${cleanName}.${priceText} Private vehicle, verified hotel stays & 24/7 yatra support by Bhakti Sathi.`;
    if (description.length > 130) {
      description = `Book ${cleanName} with Bhakti Sathi. Verified hotels, private cab transfers & 24/7 yatra assistance.`;
    }
    keywords = `${cleanName}, pilgrimage tour, yatra booking, Bhakti Sathi packages`;

  } else if (type === 'guide') {
    title = `${cleanName} Travel Guide & Tips | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName} Guide | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;

    description = `Read official travel guide for ${cleanName}. Darshan tips, best time to visit, weather & tour packages by Bhakti Sathi.`;
    if (description.length > 130) {
      description = `Complete ${cleanName} yatra guide. Darshan timings, itinerary tips & travel packages by Bhakti Sathi.`;
    }
    keywords = `${cleanName}, ${cleanName} guide, yatra tips, pilgrimage travel, Bhakti Sathi`;

  } else if (type === 'custom_page' || type === 'website_page') {
    title = `${cleanName} | Bhakti Sathi Sacred Yatra`;
    if (title.length > 60) title = `${cleanName} | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;

    description = `${cleanName} page on Bhakti Sathi. Book verified pilgrimage tours, private cabs & hotel stays across India.`;
    if (description.length > 130) {
      description = `${cleanName} on Bhakti Sathi. Verified yatra packages, temple darshan & travel services across India.`;
    }
    keywords = `${cleanName}, Bhakti Sathi, yatra packages, pilgrimage tours`;

  } else {
    // Blog
    title = `${cleanName} | Bhakti Sathi`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Bhakti Sathi`;

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

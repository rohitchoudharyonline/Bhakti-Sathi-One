import { toPublicSeoImageUrl } from './seo';

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
    title = `${cleanName} ${extra?.city || 'Yatra'} Guide | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName} Guide | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Holidays Hunt`;

    const baseDesc = extra?.tagline 
      ? `Visit ${cleanName} in ${locationStr}. ${extra.tagline}`
      : `Complete travel & pilgrimage guide for ${cleanName} in ${locationStr}. Darshan timings, history & tour packages.`;

    if (baseDesc.length <= 130) {
      description = baseDesc;
    } else {
      description = `Visit ${cleanName} in ${locationStr}. Check darshan timings, sacred significance & yatra packages with Holidays Hunt.`;
      if (description.length > 130) {
        description = `Explore ${cleanName} in ${locationStr}. Complete yatra guide, darshan info & tour packages by Holidays Hunt.`;
      }
      if (description.length > 130) {
        description = `${cleanName} yatra guide, darshan timings & pilgrimage tour packages with Holidays Hunt.`;
      }
    }
    keywords = `${cleanName}, ${cleanName} darshan, ${locationStr} temples, ${cleanName} yatra packages, Holidays Hunt`;

  } else if (type === 'destination') {
    title = `${cleanName} Tour Packages & Yatra Guide | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName} Tour Packages | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Holidays Hunt`;

    description = `Book ${cleanName} tour packages with Holidays Hunt. Explore sacred temples, verified hotels, private cabs & 24/7 yatra support.`;
    if (description.length > 130) {
      description = `Book ${cleanName} tour packages. Verified hotels, private cabs & 24/7 yatra support with Holidays Hunt.`;
    }
    keywords = `${cleanName} tour packages, ${cleanName} yatra, ${cleanName} sacred temples, ${cleanName} holiday package, Holidays Hunt`;

  } else if (type === 'package') {
    title = `${cleanName} Package | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Holidays Hunt`;

    const priceText = extra?.price ? ` Starting ₹${extra.price}.` : '';
    description = `Book ${cleanName}.${priceText} Private vehicle, verified hotel stays & 24/7 yatra support by Holidays Hunt.`;
    if (description.length > 130) {
      description = `Book ${cleanName} with Holidays Hunt. Verified hotels, private cab transfers & 24/7 yatra assistance.`;
    }
    keywords = `${cleanName}, pilgrimage tour, yatra booking, Holidays Hunt packages`;

  } else if (type === 'guide') {
    title = `${cleanName} Travel Guide & Tips | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName} Guide | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Holidays Hunt`;

    description = `Read official travel guide for ${cleanName}. Darshan tips, best time to visit, weather & tour packages by Holidays Hunt.`;
    if (description.length > 130) {
      description = `Complete ${cleanName} yatra guide. Darshan timings, itinerary tips & travel packages by Holidays Hunt.`;
    }
    keywords = `${cleanName}, ${cleanName} guide, yatra tips, pilgrimage travel, Holidays Hunt`;

  } else if (type === 'custom_page' || type === 'website_page') {
    title = `${cleanName} | Holidays Hunt Sacred Yatra`;
    if (title.length > 60) title = `${cleanName} | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Holidays Hunt`;

    description = `${cleanName} page on Holidays Hunt. Book verified pilgrimage tours, private cabs & hotel stays across India.`;
    if (description.length > 130) {
      description = `${cleanName} on Holidays Hunt. Verified yatra packages, temple darshan & travel services across India.`;
    }
    keywords = `${cleanName}, Holidays Hunt, yatra packages, pilgrimage tours`;

  } else {
    // Blog
    title = `${cleanName} | Holidays Hunt`;
    if (title.length > 60) title = `${cleanName.substring(0, 42)}... | Holidays Hunt`;

    description = `Read about ${cleanName} on Holidays Hunt. Discover sacred Indian yatra guides, temple histories & travel tips.`;
    if (description.length > 130) {
      description = `Discover ${cleanName} with Holidays Hunt. Sacred pilgrimage guides & yatra tips across India.`;
    }
    keywords = `${cleanName}, yatra guide, temple history, Holidays Hunt`;
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
export function updateDocumentSEO(
  title?: string,
  description?: string,
  keywords?: string,
  ogImage?: string
) {
  if (typeof document === 'undefined') return;

  const defaultTitle = 'Holidays Hunt — All India Sacred Pilgrimage & Yatra Tour Packages';
  const defaultDesc = 'Book customized All India Sacred Pilgrimage Tour Packages with Holidays Hunt. Explore Mata Vaishno Devi, Kashi Vishwanath, Ayodhya, Char Dham & more.';

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

  const resolvedImg = toPublicSeoImageUrl(ogImage);
  if (resolvedImg) {
    for (const [attr, key] of [
      ['property', 'og:image'],
      ['name', 'twitter:image'],
      ['name', 'thumbnail'],
    ] as const) {
      let imgMeta = document.querySelector(`meta[${attr}="${key}"]`);
      if (!imgMeta) {
        imgMeta = document.createElement('meta');
        imgMeta.setAttribute(attr, key);
        document.head.appendChild(imgMeta);
      }
      imgMeta.setAttribute('content', resolvedImg);
    }
  }

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

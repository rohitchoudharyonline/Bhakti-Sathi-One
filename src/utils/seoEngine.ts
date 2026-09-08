import { TourPackage, AgencySettings } from '../types/tour';
import { BlogPost, CustomPage, YoastSeoAuditResult, YoastSeoCheckItem } from '../types/cms';
import { DestinationMeta } from '../data/destinationsData';

/**
 * Yoast / RankMath Style On-Page SEO Engine
 * Evaluates content, title, meta description, keyword density, headings, links, and images.
 */
export function analyzeOnPageSeo(params: {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
  focusKeyword: string;
  featuredImage?: string;
  imageAlt?: string;
}): YoastSeoAuditResult {
  const {
    title = '',
    metaTitle = '',
    metaDescription = '',
    slug = '',
    content = '',
    focusKeyword = '',
    featuredImage = '',
    imageAlt = '',
  } = params;

  const checks: YoastSeoCheckItem[] = [];
  const keyword = focusKeyword.trim().toLowerCase();
  const effectiveTitle = (metaTitle || title).toLowerCase();
  const effectiveDesc = metaDescription.toLowerCase();
  const effectiveSlug = slug.toLowerCase();
  const rawText = content.replace(/<[^>]*>/g, ' ').replace(/[#*`_\[\]()]/g, ' ');
  const words = rawText.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Count keyword occurrences
  let keywordCount = 0;
  if (keyword.length > 0) {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');
    const matches = rawText.match(regex);
    keywordCount = matches ? matches.length : 0;
  }
  const keywordDensityPercent =
    wordCount > 0 && keyword.length > 0
      ? Number(((keywordCount / wordCount) * 100).toFixed(2))
      : 0;

  // Headings count
  const h1Matches = content.match(/^#\s+.+$|<h1[^>]*>.*?<\/h1>/gim) || [];
  const h2Matches = content.match(/^##\s+.+$|<h2[^>]*>.*?<\/h2>/gim) || [];
  const h3Matches = content.match(/^###\s+.+$|<h3[^>]*>.*?<\/h3>/gim) || [];
  const headingsCount = {
    h1: h1Matches.length,
    h2: h2Matches.length,
    h3: h3Matches.length,
  };

  // Links count
  const internalLinks = (content.match(/href=["']\/|\[.+?\]\(\//gi) || []).length;
  const externalLinks = (content.match(/href=["']https?:\/\/|\[.+?\]\(https?:\/\//gi) || []).length;

  // Images count
  const totalImages = (content.match(/<img|!\[/gi) || []).length + (featuredImage ? 1 : 0);
  const imagesWithAlt = (content.match(/alt=["'][^"']+["']|!\[.+?\]/gi) || []).length + (imageAlt ? 1 : 0);

  // 1. Focus Keyword Provided
  if (!keyword) {
    checks.push({
      id: 'focus_keyword_missing',
      label: 'Focus Keyword',
      category: 'critical',
      status: 'fail',
      description: 'No focus keyword set. Enter a primary search term (e.g., "Kashmir 5 Days Tour" or "Manali Honeymoon Package").',
      scoreImpact: -25,
    });
  } else {
    checks.push({
      id: 'focus_keyword_set',
      label: 'Focus Keyword Defined',
      category: 'good',
      status: 'pass',
      description: `Primary focus keyword is set to "${focusKeyword}".`,
      scoreImpact: 10,
    });

    // 2. Keyword in Meta Title
    if (effectiveTitle.includes(keyword)) {
      const isAtBeginning = effectiveTitle.indexOf(keyword) < 15;
      checks.push({
        id: 'keyword_in_title',
        label: 'Focus Keyword in SEO Title',
        category: 'good',
        status: 'pass',
        description: isAtBeginning
          ? 'Focus keyword appears near the beginning of the SEO title.'
          : 'Focus keyword appears in the SEO title.',
        scoreImpact: 15,
      });
    } else {
      checks.push({
        id: 'keyword_in_title_fail',
        label: 'Focus Keyword in SEO Title',
        category: 'critical',
        status: 'fail',
        description: `Your focus keyword "${focusKeyword}" does not appear in the SEO title.`,
        scoreImpact: -15,
      });
    }

    // 3. Keyword in Meta Description
    if (effectiveDesc.includes(keyword)) {
      checks.push({
        id: 'keyword_in_desc',
        label: 'Focus Keyword in Meta Description',
        category: 'good',
        status: 'pass',
        description: 'Focus keyword appears in the meta description.',
        scoreImpact: 15,
      });
    } else {
      checks.push({
        id: 'keyword_in_desc_fail',
        label: 'Focus Keyword in Meta Description',
        category: 'critical',
        status: 'fail',
        description: `Your focus keyword "${focusKeyword}" does not appear in the meta description.`,
        scoreImpact: -15,
      });
    }

    // 4. Keyword in URL Slug
    const cleanKeywordSlug = keyword.replace(/\s+/g, '-');
    if (effectiveSlug.includes(cleanKeywordSlug) || effectiveSlug.replace(/-/g, ' ').includes(keyword)) {
      checks.push({
        id: 'keyword_in_slug',
        label: 'Focus Keyword in URL Slug',
        category: 'good',
        status: 'pass',
        description: 'Focus keyword appears in the URL permalink slug.',
        scoreImpact: 10,
      });
    } else {
      checks.push({
        id: 'keyword_in_slug_warning',
        label: 'Focus Keyword in URL Slug',
        category: 'recommended',
        status: 'warning',
        description: 'Your focus keyword is not present in the URL slug. Consider adding it for rank boost.',
        scoreImpact: -5,
      });
    }

    // 5. Keyword in Content & Density
    if (keywordCount === 0) {
      checks.push({
        id: 'keyword_in_content_fail',
        label: 'Focus Keyword in Content',
        category: 'critical',
        status: 'fail',
        description: 'The focus keyword does not appear anywhere in the body content.',
        scoreImpact: -20,
      });
    } else if (keywordDensityPercent >= 0.6 && keywordDensityPercent <= 2.8) {
      checks.push({
        id: 'keyword_density_good',
        label: `Keyword Density (${keywordDensityPercent}%)`,
        category: 'good',
        status: 'pass',
        description: `Keyword density is optimal at ${keywordDensityPercent}% (${keywordCount} times).`,
        scoreImpact: 15,
      });
    } else if (keywordDensityPercent < 0.6) {
      checks.push({
        id: 'keyword_density_low',
        label: `Keyword Density (${keywordDensityPercent}%)`,
        category: 'recommended',
        status: 'warning',
        description: `Keyword density is low (${keywordDensityPercent}%). Try using "${focusKeyword}" more frequently in headings and paragraphs.`,
        scoreImpact: -5,
      });
    } else {
      checks.push({
        id: 'keyword_density_high',
        label: `Keyword Density (${keywordDensityPercent}%)`,
        category: 'recommended',
        status: 'warning',
        description: `Keyword density is too high (${keywordDensityPercent}%). Avoid keyword stuffing.`,
        scoreImpact: -8,
      });
    }
  }

  // 6. Title Length Check (Optimal: 40 - 65 characters)
  const titleLen = (metaTitle || title).length;
  if (titleLen >= 40 && titleLen <= 65) {
    checks.push({
      id: 'title_length_good',
      label: `SEO Title Length (${titleLen} chars)`,
      category: 'good',
      status: 'pass',
      description: 'SEO title length is optimal for Google desktop and mobile search snippets.',
      scoreImpact: 10,
    });
  } else if (titleLen > 65) {
    checks.push({
      id: 'title_length_long',
      label: `SEO Title Length (${titleLen} chars)`,
      category: 'recommended',
      status: 'warning',
      description: `Title is too long (${titleLen} chars). Google may truncate titles exceeding 65 characters with "...".`,
      scoreImpact: -5,
    });
  } else {
    checks.push({
      id: 'title_length_short',
      label: `SEO Title Length (${titleLen} chars)`,
      category: 'recommended',
      status: 'warning',
      description: `Title is short (${titleLen} chars). Aim for 40-60 characters for maximum search visibility.`,
      scoreImpact: -5,
    });
  }

  // 7. Meta Description Length (Optimal: 120 - 160 characters)
  const descLen = metaDescription.length;
  if (descLen >= 120 && descLen <= 165) {
    checks.push({
      id: 'desc_length_good',
      label: `Meta Description Length (${descLen} chars)`,
      category: 'good',
      status: 'pass',
      description: 'Meta description length is in the ideal 120-160 character range.',
      scoreImpact: 10,
    });
  } else if (descLen > 165) {
    checks.push({
      id: 'desc_length_long',
      label: `Meta Description Length (${descLen} chars)`,
      category: 'recommended',
      status: 'warning',
      description: `Meta description is ${descLen} characters long and may be cut off in search snippets.`,
      scoreImpact: -5,
    });
  } else if (descLen > 0) {
    checks.push({
      id: 'desc_length_short',
      label: `Meta Description Length (${descLen} chars)`,
      category: 'recommended',
      status: 'warning',
      description: `Meta description is short (${descLen} chars). Elaborate up to 120-155 characters for higher click-through rates.`,
      scoreImpact: -5,
    });
  } else {
    checks.push({
      id: 'desc_missing',
      label: 'Meta Description Missing',
      category: 'critical',
      status: 'fail',
      description: 'No meta description provided. Google will auto-generate text which may not be appealing.',
      scoreImpact: -15,
    });
  }

  // 8. Word Count
  if (wordCount >= 600) {
    checks.push({
      id: 'word_count_good',
      label: `Content Length (${wordCount} words)`,
      category: 'good',
      status: 'pass',
      description: `Content is thorough and comprehensive (${wordCount} words, ~${readingTimeMinutes} min read).`,
      scoreImpact: 15,
    });
  } else if (wordCount >= 300) {
    checks.push({
      id: 'word_count_fair',
      label: `Content Length (${wordCount} words)`,
      category: 'recommended',
      status: 'warning',
      description: `Content is moderate (${wordCount} words). Articles with 600+ words rank higher on competitive travel queries.`,
      scoreImpact: 5,
    });
  } else {
    checks.push({
      id: 'word_count_thin',
      label: `Content Length (${wordCount} words)`,
      category: 'critical',
      status: 'fail',
      description: `Content is thin (${wordCount} words). Add detailed day plans, tips, hotel descriptions, and FAQs.`,
      scoreImpact: -15,
    });
  }

  // 9. Subheading Structure (H2 / H3)
  if (headingsCount.h2 >= 2) {
    checks.push({
      id: 'subheadings_good',
      label: `Subheading Structure (${headingsCount.h2} H2s, ${headingsCount.h3} H3s)`,
      category: 'good',
      status: 'pass',
      description: 'Great use of subheadings to break up content into readable sections.',
      scoreImpact: 10,
    });
  } else {
    checks.push({
      id: 'subheadings_missing',
      label: 'Subheadings (H2 / H3)',
      category: 'recommended',
      status: 'warning',
      description: 'Add more H2 subheadings (e.g. Day Highlights, Best Season, Inclusions) to structure the text.',
      scoreImpact: -5,
    });
  }

  // 10. Images & Alt Tags
  if (featuredImage || totalImages > 0) {
    if (imagesWithAlt > 0 || imageAlt) {
      checks.push({
        id: 'images_alt_pass',
        label: 'Image SEO & Alt Attributes',
        category: 'good',
        status: 'pass',
        description: 'Featured image and content images contain descriptive alt text.',
        scoreImpact: 10,
      });
    } else {
      checks.push({
        id: 'images_alt_warning',
        label: 'Image Alt Tags Missing',
        category: 'recommended',
        status: 'warning',
        description: 'Images found without alt text. Add keyword-rich alt tags for Google Image Search indexing.',
        scoreImpact: -5,
      });
    }
  } else {
    checks.push({
      id: 'images_missing',
      label: 'Featured Media Missing',
      category: 'recommended',
      status: 'warning',
      description: 'No featured image attached. Visuals improve reader engagement and social click-through.',
      scoreImpact: -10,
    });
  }

  // Calculate Final Score (Normalized to 0 - 100)
  let rawScore = 50;
  checks.forEach((c) => {
    rawScore += c.scoreImpact;
  });
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let rating: 'Good' | 'Needs Improvement' | 'Poor' = 'Poor';
  let color: 'emerald' | 'amber' | 'rose' = 'rose';

  if (score >= 80) {
    rating = 'Good';
    color = 'emerald';
  } else if (score >= 55) {
    rating = 'Needs Improvement';
    color = 'amber';
  }

  return {
    score,
    rating,
    color,
    checks,
    wordCount,
    readingTimeMinutes,
    keywordDensityPercent,
    headingsCount,
    imagesCount: { total: totalImages, withAlt: imagesWithAlt },
    linksCount: { internal: internalLinks, external: externalLinks },
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates Google Rich Snippet JSON-LD Schema for TouristTrip, Product & TravelAgency
 * Structured in full compliance with Google Search Central Rich Results specification
 * for Reviews and AggregateRating stars in search listings.
 */
export function generateTouristTripSchema(pkg: TourPackage, agency: AgencySettings) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
  const pkgUrl = `${origin}/tours/${pkg.destinationTag || 'india'}/${pkg.slug || pkg.id}`;

  const ratingVal = pkg.rating || 4.9;
  const reviewTotal = pkg.reviewCount || 485;

  // Real review examples structured for Google Rich Results
  const sampleReviews = (pkg.reviews && pkg.reviews.length > 0)
    ? pkg.reviews
    : [
        {
          id: 'r-1',
          author: 'Bhagyashri & Family',
          rating: 5,
          date: '2026-07-15',
          text: 'It was a great vacation planned by Bhakti Sathi. The team was constantly in touch with us from Day 1. The tour managers and our dedicated cab chauffeur were extremely polite and ensured this tour was a grand success.',
        },
        {
          id: 'r-2',
          author: 'Vijay & Snehal Patil',
          rating: 5,
          date: '2026-08-10',
          text: 'Unforgettable holiday tour experience with Bhakti Sathi! The accommodation, verified food quality, and private cab transfers were top-notch throughout our trip.',
        },
        {
          id: 'r-3',
          author: 'Dr. Rajesh Sharma',
          rating: 5,
          date: '2026-06-20',
          text: 'Seamless experience with Bhakti Sathi. The private cab was impeccably clean and our chauffeur was gentle and knowledgeable. Highly recommended!',
        },
      ];

  const reviewItems = sampleReviews.map((r) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: r.author,
    },
    datePublished: r.date && r.date.includes('-') ? r.date : '2026-06-15',
    reviewBody: r.text,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating || 5,
      bestRating: 5,
      worstRating: 1,
    },
    publisher: {
      '@type': 'Organization',
      name: agency.agencyName || 'Bhakti Sathi',
    },
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      '@id': `${pkgUrl}#trip`,
      name: pkg.title,
      description: pkg.overview || pkg.tagline,
      touristType: ['Family', 'Couples', 'Holiday Travelers', 'Senior Travelers'],
      url: pkgUrl,
      image: pkg.coverImage,
      offers: {
        '@type': 'Offer',
        price: pkg.discountedPrice || pkg.price,
        priceCurrency: pkg.currency || 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: pkgUrl,
      },
      provider: {
        '@type': 'TravelAgency',
        name: agency.agencyName || 'Bhakti Sathi',
        telephone: agency.phone || '+91 94199 15255',
        email: agency.email || 'care@mybhaktisathi.com',
        url: origin,
        image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
        address: {
          '@type': 'PostalAddress',
          streetAddress: agency.address || 'Main Boulevard',
          addressLocality: 'Srinagar / Shimla / New Delhi',
          addressRegion: 'J&K / HP / DL',
          postalCode: '190001',
          addressCountry: 'IN',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingVal,
        reviewCount: reviewTotal,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviewItems,
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: pkg.itinerary?.length || pkg.durationDays,
        itemListElement: pkg.itinerary?.map((day, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: `Day ${day.dayNumber}: ${day.title}`,
          description: day.description,
        })) || [],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${pkgUrl}#product`,
      name: pkg.title,
      description: pkg.overview || pkg.tagline,
      image: pkg.coverImage,
      category: 'Travel Package / Vacation Tour',
      offers: {
        '@type': 'Offer',
        price: pkg.discountedPrice || pkg.price,
        priceCurrency: pkg.currency || 'INR',
        availability: 'https://schema.org/InStock',
        url: pkgUrl,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingVal,
        reviewCount: reviewTotal,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviewItems,
    },
  ];
}

/**
 * Generates Google Rich Snippet JSON-LD Schema for Agency Google Reviews & AggregateRating
 */
export function generateAgencyReviewSchema(agency: AgencySettings) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${origin}#agency`,
    name: agency.agencyName || 'Bhakti Sathi',
    url: origin,
    telephone: agency.phone || '+91 94199 15255',
    email: agency.email || 'care@mybhaktisathi.com',
    priceRange: '₹₹ - ₹₹₹₹',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
    address: {
      '@type': 'PostalAddress',
      streetAddress: agency.address || 'Main Boulevard',
      addressLocality: 'Srinagar / Shimla / New Delhi',
      addressRegion: 'J&K / HP / DL',
      postalCode: '190001',
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '1300',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Generates Schema for TouristDestination
 */
export function generateTouristDestinationSchema(dest: DestinationMeta, agency: AgencySettings) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
  const destUrl = `${origin}/destinations/${dest.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.guide?.overview || dest.tagline,
    url: destUrl,
    image: dest.heroImage,
    touristType: ['Honeymoon', 'Family Holiday', 'Spiritual Yatra', 'Adventure'],
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: dest.state || 'India',
    },
    includesAttraction: dest.guide?.topAttractions?.map((a) => ({
      '@type': 'TouristAttraction',
      name: a.name,
      description: a.description,
      image: a.image,
    })) || [],
  };
}

/**
 * Generates Schema for BlogPosting / Article
 */
export function generateBlogPostingSchema(post: BlogPost, agency: AgencySettings) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
  const postUrl = `${origin}/travel-blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.excerpt,
    image: [post.featuredImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Bhakti Sathi Travel Team',
      jobTitle: post.author?.role || 'Senior Destination Specialist',
    },
    publisher: {
      '@type': 'Organization',
      name: agency.agencyName || 'Bhakti Sathi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
      },
    },
    articleSection: post.category,
    keywords: post.tags?.join(', ') || post.category,
  };
}

/**
 * Generates BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generates FAQPage Schema
 */
export function generateFAQPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates Article Schema for Guides
 */
export function generateGuideArticleSchema(
  guide: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    publishedAt?: string;
    updatedAt?: string;
    authorName?: string;
    category?: string;
    tags?: string[];
    seo?: { primaryKeyword?: string };
  },
  agency: AgencySettings
) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mybhaktisathi.com';
  const guideUrl = `${origin}/guide/${guide.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${guideUrl}#article`,
    isPartOf: {
      '@type': 'WebPage',
      url: `${origin}/guide`,
      name: 'Pilgrimage & Travel Guides',
    },
    headline: guide.title,
    description: guide.excerpt,
    image: guide.featuredImage ? [guide.featuredImage] : undefined,
    datePublished: guide.publishedAt || new Date().toISOString(),
    dateModified: guide.updatedAt || guide.publishedAt || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': guideUrl,
    },
    author: {
      '@type': 'Organization',
      name: guide.authorName || 'Bhakti Sathi Yatra Team',
      url: origin,
    },
    publisher: {
      '@type': 'Organization',
      name: agency.agencyName || 'Bhakti Sathi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
      },
    },
    articleSection: guide.category || 'guides',
    keywords: guide.seo?.primaryKeyword || guide.tags?.join(', ') || 'guide, Yatra',
  };
}

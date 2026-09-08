export interface GuideFaq {
  id: string;
  question: string;
  answer: string;
}

export interface GuideBodyImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export type GuideStatus = 'draft' | 'review' | 'published';

export interface GuideSeo {
  seoTitle?: string;
  metaTitle?: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown formatted body
  category: string;
  destination?: string;
  destinationSlug?: string;
  destinationName?: string;
  tags?: string[];
  author?: {
    name: string;
    role: string;
    avatar?: string;
  };
  authorName?: string;
  featuredImage: string;
  imageAlt?: string;
  featuredImageAlt?: string;
  bodyImages?: GuideBodyImage[];
  status: GuideStatus;
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
  readingTimeMinutes?: number;
  readTimeMinutes?: number;
  wordCount?: number;
  seo: GuideSeo;
  faqs: GuideFaq[];
  relatedPackageIds?: string[];
  relatedGuideSlugs?: string[];
  viewsCount?: number;
  likesCount?: number;
  featured?: boolean;
}

export interface GuideCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  guideCount?: number;
  postCount?: number;
}

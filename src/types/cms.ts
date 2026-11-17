export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  icon?: string;
  postCount?: number;
}

export interface BlogAuthor {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

export interface BlogPostSeo {
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  schemaType?: 'BlogPosting' | 'Article' | 'NewsArticle' | 'TouristTrip';
  noIndex?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown / HTML
  featuredImage: string;
  featuredImageAlt?: string;
  category: string;
  categorySlug: string;
  tags: string[];
  author: BlogAuthor;
  status: 'published' | 'draft' | 'archived';
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  viewsCount: number;
  likesCount?: number;
  featured?: boolean;
  seo: BlogPostSeo;
  relatedDestinationSlug?: string;
  relatedTourIds?: string[];
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  heroImage?: string;
  status: 'published' | 'draft';
  showInHeaderNav: boolean;
  showInFooterNav: boolean;
  createdAt: string;
  updatedAt: string;
  isSystemPage?: boolean;
  seo: {
    focusKeyword: string;
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
}

export interface MediaAsset {
  id: string;
  name: string;
  fileName: string;
  fileType: 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'svg';
  url: string; // R2 CDN / Cloudflare D1 URL
  dataUrl?: string; // Local preview data url
  storagePath: string; // e.g. "uploads/2026/08/kashmir-snow.webp"
  storageProvider: 'cloudflare_r2' | 'cloudflare_d1' | 'local_cdn';
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatioPercent: number;
  dimensions?: { width: number; height: number };
  altText: string;
  caption?: string;
  uploadedAt: string;
  folder?: string;
  r2Synced?: boolean;
}

export interface CloudStorageSettings {
  // Cloudflare R2
  r2AccountId: string;
  r2BucketName: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2PublicDomain: string; // e.g. "https://media.holidayshunt.com"
  
  // Cloudflare D1 Database & Storage
  d1DatabaseId: string;
  d1DatabaseName: string;
  d1ApiToken: string;
  d1BucketName: string;
  
  // Auto Image Compression Settings
  autoCompressOnUpload: boolean;
  compressionQuality: number; // 0.6 to 0.95
  maxImageWidth: number; // e.g. 1920
  outputFormat: 'webp' | 'jpeg' | 'png' | 'original';
}

export interface YoastSeoCheckItem {
  id: string;
  label: string;
  category: 'critical' | 'recommended' | 'good';
  status: 'pass' | 'warning' | 'fail';
  description: string;
  scoreImpact: number;
}

export interface YoastSeoAuditResult {
  score: number; // 0 - 100
  rating: 'Good' | 'Needs Improvement' | 'Poor';
  color: 'emerald' | 'amber' | 'rose';
  checks: YoastSeoCheckItem[];
  wordCount: number;
  readingTimeMinutes: number;
  keywordDensityPercent: number;
  headingsCount: { h1: number; h2: number; h3: number };
  imagesCount: { total: number; withAlt: number };
  linksCount: { internal: number; external: number };
}

export interface RegisteredTravelerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  status: 'active' | 'blocked';
  memberTier: 'Member' | 'Silver Explorer' | 'Gold Explorer' | 'Holidays Hunt Elite';
  authProvider: 'google' | 'email' | 'phone';
  signupDate: string;
  lastLogin: string;
  totalBookings: number;
  totalSpent: number;
  avatar?: string;
  notes?: string;
  bookingIds?: string[];
}

export interface PageSeoConfig {
  id: string; // unique identifier: 'home', 'tours', 'destinations', 'blog', 'faq', 'about-us', 'locate_us', 'cancellation', 'terms', 'privacy', 'security'
  pageName: string; // readable page label
  path: string; // route path: '/', '/tours', '/destinations', etc.
  canonicalUrl: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  updatedAt: string;
}

export interface RedirectRule {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  hits: number;
  lastAccessed?: string;
  notes?: string;
  createdAt: string;
}

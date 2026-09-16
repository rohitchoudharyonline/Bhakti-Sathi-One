import React from 'react';
import { MediaAsset } from '../types/cms';
import { GalleryItem } from '../types/tour';
import { getCachedMediaDataUrl } from './mediaStorage';

export interface ImageDiagnostic {
  id: string;
  timestamp: string;
  originalInput: string | null | undefined;
  resolvedUrl: string;
  matchedAsset: boolean;
  assetSource: 'inline_uri' | 'public_asset' | 'indexeddb_cache' | 'asset_dataUrl' | 'asset_url' | 'r2_api_path' | 'direct_url' | 'fallback';
  storageKey?: string;
  reason: string;
  status: 'active' | 'retrying' | 'failed' | 'fallback_applied';
  errorDetails?: string;
}

declare global {
  interface Window {
    __IMAGE_DIAGNOSTICS_LOG__?: ImageDiagnostic[];
    debugImage?: (url: string) => void;
    getImageDiagnosticsReport?: () => ImageDiagnostic[];
  }
}

const MAX_DIAGNOSTIC_ENTRIES = 200;

function recordDiagnostic(diag: ImageDiagnostic) {
  if (typeof window === 'undefined') return;
  if (!window.__IMAGE_DIAGNOSTICS_LOG__) {
    window.__IMAGE_DIAGNOSTICS_LOG__ = [];
  }
  window.__IMAGE_DIAGNOSTICS_LOG__.unshift(diag);
  if (window.__IMAGE_DIAGNOSTICS_LOG__.length > MAX_DIAGNOSTIC_ENTRIES) {
    window.__IMAGE_DIAGNOSTICS_LOG__.pop();
  }
}

const STORAGE_PREFIXES = [
  'destinations/',
  'temples/',
  'tours/',
  'packages/',
  'media/',
  'uploads/',
  'blogs/',
  'blog/',
  'guides/',
  'guide/',
  'payments/',
  'reviews/',
  'itinerary/',
  'hotels/',
  'custom/',
  'shrine/',
  'shrines/',
  'misc/',
  'banners/',
  'hero/',
];

/**
 * Formats a clean /api/files/ URL while preserving '/' folder separators.
 * For example, "tours/2026/09/image.webp" -> "/api/files/tours/2026/09/image.webp"
 */
export function formatApiFilesUrl(rawKey: string): string {
  if (!rawKey || typeof rawKey !== 'string') return '';
  let cleanKey = rawKey.trim();

  // Strip leading protocols or api/files prefix if present
  cleanKey = cleanKey.replace(/^https?:\/\/[^/]+\/api\/files\/?/i, '');
  cleanKey = cleanKey.replace(/^\/?api\/files\/?/i, '');
  cleanKey = cleanKey.replace(/^r2:\/\//i, '');

  // Decode to prevent double encoding
  try {
    cleanKey = decodeURIComponent(cleanKey);
  } catch {}

  cleanKey = cleanKey.replace(/^\/+/, '');
  if (!cleanKey) return '';

  // Encode each segment so slashes are preserved as '/'
  const safePath = cleanKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `/api/files/${safePath}`;
}

/**
 * Extracts a clean relative storage key from any URL or path
 * e.g., "https://pub-r2.holidayshunt.com/destinations/2026/09/sample.webp" -> "destinations/2026/09/sample.webp"
 */
export function extractStorageKey(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return null;

  // Handle direct /api/files/ paths
  if (clean.startsWith('/api/files/') || clean.startsWith('api/files/')) {
    let unproxied = clean.replace(/^\/?api\/files\/?/i, '').replace(/^\/+/, '');
    try { unproxied = decodeURIComponent(unproxied); } catch {}
    if (unproxied) return unproxied;
  }

  // Handle r2:// prefix
  if (clean.startsWith('r2://')) {
    let unproxied = clean.replace(/^r2:\/\//i, '').replace(/^\/+/, '');
    try { unproxied = decodeURIComponent(unproxied); } catch {}
    if (unproxied) return unproxied;
  }

  // Public static assets (e.g. /logo-holidays-hunt.png, /icon-holidays-hunt.png)
  if (clean.startsWith('/') && (
    clean.includes('logo-') ||
    clean.includes('icon-') ||
    clean.startsWith('/assets/') ||
    clean.startsWith('/vite') ||
    clean.endsWith('.ico')
  )) {
    return null;
  }

  // If already a relative storage path or key
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    const withoutSlash = clean.replace(/^\/+/, '');
    let decoded = withoutSlash;
    try { decoded = decodeURIComponent(withoutSlash); } catch {}

    if (STORAGE_PREFIXES.some((prefix) => decoded.startsWith(prefix))) {
      return decoded;
    }
    if (decoded.includes('/') && /\.[a-zA-Z0-9]+$/.test(decoded)) {
      return decoded;
    }
  }

  // If full HTTP/HTTPS URL
  try {
    const parsed = new URL(clean);
    let pathname = parsed.pathname.replace(/^\/+/, '');
    try { pathname = decodeURIComponent(pathname); } catch {}

    if (pathname.startsWith('api/files/')) {
      return pathname.replace(/^api\/files\/?/, '');
    }

    for (const prefix of STORAGE_PREFIXES) {
      if (pathname.startsWith(prefix)) return pathname;
      const idx = pathname.indexOf(prefix);
      if (idx !== -1) return pathname.slice(idx);
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host === 'media.holidayshunt.com' ||
      host === 'pub-r2.holidayshunt.com' ||
      host.includes('r2.cloudflarestorage.com') ||
      host.includes('.r2.dev') ||
      host.includes('holidayshunt.com')
    ) {
      if (pathname && !pathname.startsWith('http')) {
        return pathname;
      }
    }
  } catch {
    const withoutSlash = clean.replace(/^\/+/, '');
    let decoded = withoutSlash;
    try { decoded = decodeURIComponent(withoutSlash); } catch {}

    for (const prefix of STORAGE_PREFIXES) {
      const idx = decoded.indexOf(prefix);
      if (idx !== -1) return decoded.slice(idx);
    }
  }

  return null;
}

/**
 * Comprehensive diagnostic inspector for an image URL.
 */
export function diagnoseDisplayImage(
  url?: string | null,
  mediaAssets?: MediaAsset[] | unknown
): ImageDiagnostic {
  const timestamp = new Date().toISOString();
  const id = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (!url || typeof url !== 'string' || !url.trim()) {
    const diag: ImageDiagnostic = {
      id,
      timestamp,
      originalInput: url,
      resolvedUrl: '',
      matchedAsset: false,
      assetSource: 'fallback',
      reason: 'Empty or undefined URL input provided',
      status: 'fallback_applied',
    };
    recordDiagnostic(diag);
    return diag;
  }

  const cleanUrl = url.trim();

  // 1. Inline Data or Blob URIs
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    const diag: ImageDiagnostic = {
      id,
      timestamp,
      originalInput: url,
      resolvedUrl: cleanUrl,
      matchedAsset: false,
      assetSource: 'inline_uri',
      reason: 'Direct inline Data URL or Blob Object URI',
      status: 'active',
    };
    recordDiagnostic(diag);
    return diag;
  }

  // 2. Public local static assets (logos, icons, assets folder)
  if (cleanUrl.startsWith('/') && (
    cleanUrl.includes('logo-') ||
    cleanUrl.includes('icon-') ||
    cleanUrl.startsWith('/assets/') ||
    cleanUrl.startsWith('/vite') ||
    cleanUrl.endsWith('.ico')
  )) {
    const diag: ImageDiagnostic = {
      id,
      timestamp,
      originalInput: url,
      resolvedUrl: cleanUrl,
      matchedAsset: false,
      assetSource: 'public_asset',
      reason: 'Local static asset in public folder',
      status: 'active',
    };
    recordDiagnostic(diag);
    return diag;
  }

  const storageKey = extractStorageKey(cleanUrl);

  // 3. Check IndexedDB in-memory cache for an existing dataUrl
  const cachedDataUrl = getCachedMediaDataUrl(storageKey || cleanUrl);
  if (cachedDataUrl) {
    const diag: ImageDiagnostic = {
      id,
      timestamp,
      originalInput: url,
      resolvedUrl: cachedDataUrl,
      matchedAsset: true,
      assetSource: 'indexeddb_cache',
      storageKey: storageKey || undefined,
      reason: 'Resolved from persistent IndexedDB media cache',
      status: 'active',
    };
    recordDiagnostic(diag);
    return diag;
  }

  // 4. Check mediaAssets array passed via React context
  if (Array.isArray(mediaAssets) && mediaAssets.length > 0) {
    const match = mediaAssets.find((a) => {
      if (!a) return false;
      if (a.url === cleanUrl || a.dataUrl === cleanUrl) return true;
      if (a.storagePath && (a.storagePath === cleanUrl || (storageKey && a.storagePath === storageKey))) return true;
      if (a.storagePath && cleanUrl.includes(a.storagePath)) return true;
      if (a.fileName && cleanUrl.includes(a.fileName)) return true;
      if (a.name && cleanUrl.toLowerCase().includes(a.name.toLowerCase().replace(/\.[^/.]+$/, ''))) return true;
      return false;
    });

    if (match?.dataUrl) {
      const diag: ImageDiagnostic = {
        id,
        timestamp,
        originalInput: url,
        resolvedUrl: match.dataUrl,
        matchedAsset: true,
        assetSource: 'asset_dataUrl',
        storageKey: match.storagePath,
        reason: 'Resolved from media catalog cached base64 dataUrl',
        status: 'active',
      };
      recordDiagnostic(diag);
      return diag;
    }

    if (match?.storagePath) {
      const resolved = formatApiFilesUrl(match.storagePath);
      const diag: ImageDiagnostic = {
        id,
        timestamp,
        originalInput: url,
        resolvedUrl: resolved,
        matchedAsset: true,
        assetSource: 'r2_api_path',
        storageKey: match.storagePath,
        reason: 'Resolved from matched asset storagePath via /api/files endpoint',
        status: 'active',
      };
      recordDiagnostic(diag);
      return diag;
    }
  }

  // 5. If storage key exists or URL points to /api/files/ or r2:// or storage path
  if (storageKey) {
    const resolved = formatApiFilesUrl(storageKey);
    const diag: ImageDiagnostic = {
      id,
      timestamp,
      originalInput: url,
      resolvedUrl: resolved,
      matchedAsset: false,
      assetSource: 'r2_api_path',
      storageKey,
      reason: `Routed storage key '${storageKey}' to server proxy /api/files/`,
      status: 'active',
    };
    recordDiagnostic(diag);
    return diag;
  }

  // 6. If input starts with /api/files/
  if (cleanUrl.startsWith('/api/files/') || cleanUrl.startsWith('api/files/')) {
    const resolved = formatApiFilesUrl(cleanUrl);
    const diag: ImageDiagnostic = {
      id,
      timestamp,
      originalInput: url,
      resolvedUrl: resolved,
      matchedAsset: false,
      assetSource: 'r2_api_path',
      reason: 'Formatted /api/files/ endpoint URL',
      status: 'active',
    };
    recordDiagnostic(diag);
    return diag;
  }

  // 7. Standard external URL (e.g. Unsplash, CDN, etc.)
  const diag: ImageDiagnostic = {
    id,
    timestamp,
    originalInput: url,
    resolvedUrl: cleanUrl,
    matchedAsset: false,
    assetSource: 'direct_url',
    reason: 'Standard external HTTP/HTTPS URL',
    status: 'active',
  };
  recordDiagnostic(diag);
  return diag;
}

/**
 * Resolves an image URL for display. Prioritizes persistent IndexedDB cache,
 * media catalog dataUrl, server storage proxy, and optional fallbacks.
 */
export function resolveDisplayImage(
  url?: string | null,
  mediaAssets?: MediaAsset[] | unknown,
  fallbackUrl: string = ''
): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallbackUrl;
  const diagnostic = diagnoseDisplayImage(url, mediaAssets);
  return diagnostic.resolvedUrl || fallbackUrl;
}

/**
 * Handles image rendering errors with graceful progressive recovery:
 * 1. Attempt IndexedDB / dataUrl recovery
 * 2. Attempt /api/files/ proxy recovery
 * 3. Fallback to provided fallback URL if specified
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string,
  mediaAssets?: MediaAsset[] | unknown,
  fallbackUrl: string = ''
) {
  const target = e.currentTarget;
  const cleanOrig = typeof originalUrl === 'string' ? originalUrl.trim() : '';

  // Step 1: Check IndexedDB in-memory cache
  if (!target.dataset.triedDataUrl && cleanOrig) {
    const storageKey = extractStorageKey(cleanOrig);
    const cachedData = getCachedMediaDataUrl(storageKey || cleanOrig);
    if (cachedData && target.src !== cachedData) {
      target.dataset.triedDataUrl = 'true';
      target.src = cachedData;
      recordDiagnostic({
        id: `err_rec_${Date.now()}`,
        timestamp: new Date().toISOString(),
        originalInput: originalUrl,
        resolvedUrl: cachedData,
        matchedAsset: true,
        assetSource: 'indexeddb_cache',
        storageKey: storageKey || undefined,
        reason: 'Image load failed. Recovered from local IndexedDB cache dataUrl.',
        status: 'retrying',
      });
      return;
    }

    // Also check mediaAssets array
    if (Array.isArray(mediaAssets) && mediaAssets.length > 0) {
      const match = mediaAssets.find((a) =>
        a && (
          a.url === cleanOrig ||
          a.storagePath === cleanOrig ||
          (storageKey && a.storagePath === storageKey) ||
          (a.fileName && cleanOrig.includes(a.fileName))
        )
      );

      if (match?.dataUrl && target.src !== match.dataUrl) {
        target.dataset.triedDataUrl = 'true';
        target.src = match.dataUrl;
        recordDiagnostic({
          id: `err_rec_${Date.now()}`,
          timestamp: new Date().toISOString(),
          originalInput: originalUrl,
          resolvedUrl: match.dataUrl,
          matchedAsset: true,
          assetSource: 'asset_dataUrl',
          storageKey: match.storagePath,
          reason: 'Image load failed. Recovered from media catalog dataUrl.',
          status: 'retrying',
        });
        return;
      }
    }
  }

  // Step 2: If failed remote URL, attempt server proxy /api/files/
  if (!target.dataset.triedApiProxy && cleanOrig) {
    const storageKey = extractStorageKey(cleanOrig);
    if (storageKey) {
      const proxyUrl = formatApiFilesUrl(storageKey);
      if (target.src !== proxyUrl && !target.src.endsWith(proxyUrl)) {
        target.dataset.triedApiProxy = 'true';
        target.src = proxyUrl;
        recordDiagnostic({
          id: `err_proxy_${Date.now()}`,
          timestamp: new Date().toISOString(),
          originalInput: originalUrl,
          resolvedUrl: proxyUrl,
          matchedAsset: false,
          assetSource: 'r2_api_path',
          storageKey,
          reason: 'Image load failed. Retrying via local /api/files/ proxy endpoint.',
          status: 'retrying',
        });
        return;
      }
    }
  }

  // Step 3: Optional fallback if provided
  if (fallbackUrl && !target.dataset.triedFallback && target.src !== fallbackUrl) {
    target.dataset.triedFallback = 'true';
    target.src = fallbackUrl;
    recordDiagnostic({
      id: `err_fallback_${Date.now()}`,
      timestamp: new Date().toISOString(),
      originalInput: originalUrl,
      resolvedUrl: fallbackUrl,
      matchedAsset: false,
      assetSource: 'fallback',
      reason: `Failed to load image '${originalUrl}'. Applied fallback placeholder.`,
      status: 'fallback_applied',
      errorDetails: 'Failed all recovery steps (cache, local proxy, asset catalog)',
    });
  }
}

/**
 * Normalizes any single image input (URL, object, JSON string, or array) into a single resolved URL.
 */
export function normalizeImageInput(input: unknown, mediaAssets?: MediaAsset[] | unknown): string | null {
  if (!input) return null;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeImageInput(parsed, mediaAssets);
      } catch {}
    }
    return resolveDisplayImage(trimmed, mediaAssets);
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const resolved = normalizeImageInput(item, mediaAssets);
      if (resolved) return resolved;
    }
    return null;
  }

  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>;
    const candidate = obj.url || obj.key || obj.path || obj.src || obj.storagePath || obj.r2_key;
    if (typeof candidate === 'string') {
      return resolveDisplayImage(candidate, mediaAssets);
    }
  }

  return null;
}

/**
 * Normalizes gallery inputs (customGallery array, cover image, JSON strings, objects)
 * into a safe, ordered list of GalleryItems.
 */
export function normalizeGalleryImages(
  customGallery?: unknown,
  coverImage?: unknown,
  mediaAssets?: MediaAsset[] | unknown
): GalleryItem[] {
  const result: GalleryItem[] = [];
  const seenUrls = new Set<string>();

  const addImage = (rawImg: unknown, defaultCaption?: string) => {
    if (!rawImg) return;

    if (typeof rawImg === 'string') {
      const trimmed = rawImg.trim();
      if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          addImage(parsed, defaultCaption);
          return;
        } catch {}
      }
    }

    if (Array.isArray(rawImg)) {
      rawImg.forEach((item, idx) => addImage(item, defaultCaption || `Gallery Photo ${idx + 1}`));
      return;
    }

    let rawUrl: string | null = null;
    let caption = defaultCaption;
    let id: string | undefined;

    if (typeof rawImg === 'string') {
      rawUrl = rawImg;
    } else if (typeof rawImg === 'object' && rawImg !== null) {
      const obj = rawImg as Record<string, unknown>;
      rawUrl = (obj.url || obj.key || obj.path || obj.src || obj.storagePath || obj.r2_key) as string | null;
      if (typeof obj.caption === 'string' && obj.caption) caption = obj.caption;
      if (typeof obj.title === 'string' && obj.title) caption = obj.title;
      if (typeof obj.id === 'string' && obj.id) id = obj.id;
    }

    if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim()) {
      const resolved = resolveDisplayImage(rawUrl, mediaAssets);
      if (resolved && !seenUrls.has(resolved)) {
        seenUrls.add(resolved);
        result.push({
          id: id || `gallery_${result.length + 1}_${Math.random().toString(36).substring(2, 7)}`,
          url: resolved,
          caption: caption || `Tour Photo ${result.length + 1}`,
        });
      }
    }
  };

  // Add cover image first if available
  if (coverImage) {
    addImage(coverImage, 'Tour Main Photo');
  }

  // Add custom gallery photos
  if (customGallery) {
    addImage(customGallery);
  }

  return result;
}

/**
 * Diagnostic helper exposed to window for inspection in DevTools
 */
if (typeof window !== 'undefined') {
  window.debugImage = (url: string) => {
    const diag = diagnoseDisplayImage(url);
    console.group(`[Image Diagnostic] ${url}`);
    console.table({
      'Original Input': diag.originalInput,
      'Resolved URL': diag.resolvedUrl,
      'Asset Source': diag.assetSource,
      'Matched Asset': diag.matchedAsset ? 'YES' : 'NO',
      'Storage Key': diag.storageKey || 'N/A',
      'Reason': diag.reason,
      'Status': diag.status,
    });
    console.groupEnd();
  };

  window.getImageDiagnosticsReport = () => {
    return window.__IMAGE_DIAGNOSTICS_LOG__ || [];
  };
}


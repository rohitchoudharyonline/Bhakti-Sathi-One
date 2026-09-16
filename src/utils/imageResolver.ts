import React from 'react';
import { MediaAsset } from '../types/cms';
import { getCachedMediaDataUrl } from './mediaStorage';

export interface ImageDiagnostic {
  id: string;
  timestamp: string;
  originalInput: string | null | undefined;
  resolvedUrl: string;
  matchedAsset: boolean;
  assetSource: 'inline_uri' | 'indexeddb_cache' | 'asset_dataUrl' | 'asset_url' | 'r2_api_path' | 'direct_url' | 'fallback';
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
const DEFAULT_FALLBACK_URL = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80';

function recordDiagnostic(diag: ImageDiagnostic) {
  if (typeof window === 'undefined') return;
  if (!window.__IMAGE_DIAGNOSTICS_LOG__) window.__IMAGE_DIAGNOSTICS_LOG__ = [];
  window.__IMAGE_DIAGNOSTICS_LOG__.unshift(diag);
  if (window.__IMAGE_DIAGNOSTICS_LOG__.length > MAX_DIAGNOSTIC_ENTRIES) window.__IMAGE_DIAGNOSTICS_LOG__.pop();
}

const STORAGE_PREFIXES = [
  'destinations/', 'temples/', 'tours/', 'packages/', 'media/', 'uploads/', 'blogs/', 'blog/',
  'guides/', 'guide/', 'payments/', 'reviews/', 'itinerary/', 'hotels/', 'custom/', 'shrine/',
  'shrines/', 'misc/', 'banners/', 'hero/',
];

/** Encode each R2 key segment separately. This preserves `/` path separators and
 * avoids Cloudflare/Workers treating an encoded `%2F` as a different route. */
export function buildMediaProxyUrl(storageKey: string): string {
  const normalized = storageKey.replace(/^\/+/, '');
  return `/api/files/${normalized.split('/').map((segment) => encodeURIComponent(segment)).join('/')}`;
}

export function extractStorageKey(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return null;

  if (clean.startsWith('/api/files/') || clean.startsWith('api/files/')) {
    const raw = clean.replace(/^\/?api\/files\/?/, '').replace(/^\/+/, '');
    try {
      const decoded = decodeURIComponent(raw);
      return decoded || null;
    } catch {
      return raw || null;
    }
  }

  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    const withoutSlash = clean.replace(/^\/+/, '');
    if (STORAGE_PREFIXES.some((prefix) => withoutSlash.startsWith(prefix))) return withoutSlash;
  }

  try {
    const parsed = new URL(clean);
    const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    if (pathname.startsWith('api/files/')) return pathname.replace(/^api\/files\/?/, '');
    for (const prefix of STORAGE_PREFIXES) {
      if (pathname.startsWith(prefix)) return pathname;
      const idx = pathname.indexOf(prefix);
      if (idx !== -1) return pathname.slice(idx);
    }
    const host = parsed.hostname.toLowerCase();
    if (host === 'media.holidayshunt.com' || host === 'pub-r2.holidayshunt.com' || host.includes('r2.cloudflarestorage.com') || host.includes('.r2.dev') || host.includes('holidayshunt')) {
      return pathname || null;
    }
  } catch {
    const withoutSlash = clean.replace(/^\/+/, '');
    for (const prefix of STORAGE_PREFIXES) {
      const idx = withoutSlash.indexOf(prefix);
      if (idx !== -1) return withoutSlash.slice(idx);
    }
  }
  return null;
}

export function diagnoseDisplayImage(url?: string | null, mediaAssets?: MediaAsset[] | unknown): ImageDiagnostic {
  const timestamp = new Date().toISOString();
  const id = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  if (!url || typeof url !== 'string' || !url.trim()) {
    const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: DEFAULT_FALLBACK_URL, matchedAsset: false, assetSource: 'fallback', reason: 'Empty or undefined URL input provided', status: 'fallback_applied' };
    recordDiagnostic(diag);
    return diag;
  }

  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: cleanUrl, matchedAsset: false, assetSource: 'inline_uri', reason: 'Direct inline Data URL or Blob Object URI', status: 'active' };
    recordDiagnostic(diag);
    return diag;
  }

  const storageKey = extractStorageKey(cleanUrl);
  const cachedDataUrl = getCachedMediaDataUrl(storageKey || cleanUrl);
  if (cachedDataUrl) {
    const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: cachedDataUrl, matchedAsset: true, assetSource: 'indexeddb_cache', storageKey: storageKey || undefined, reason: 'Resolved from persistent IndexedDB media cache', status: 'active' };
    recordDiagnostic(diag);
    return diag;
  }

  if (Array.isArray(mediaAssets) && mediaAssets.length > 0) {
    const match = mediaAssets.find((a) => a && (a.url === cleanUrl || a.dataUrl === cleanUrl || (a.storagePath && (a.storagePath === cleanUrl || (storageKey && a.storagePath === storageKey))) || (a.storagePath && cleanUrl.includes(a.storagePath)) || (a.fileName && cleanUrl.includes(a.fileName)) || (a.name && cleanUrl.toLowerCase().includes(a.name.toLowerCase().replace(/\.[^/.]+$/, '')))));
    if (match?.dataUrl) {
      const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: match.dataUrl, matchedAsset: true, assetSource: 'asset_dataUrl', storageKey: match.storagePath, reason: 'Resolved from media catalog cached base64 dataUrl', status: 'active' };
      recordDiagnostic(diag);
      return diag;
    }
    if (match?.storagePath) {
      const resolved = buildMediaProxyUrl(match.storagePath);
      const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: resolved, matchedAsset: true, assetSource: 'r2_api_path', storageKey: match.storagePath, reason: 'Resolved from matched asset storagePath via /api/files endpoint', status: 'active' };
      recordDiagnostic(diag);
      return diag;
    }
  }

  if (storageKey) {
    const resolved = buildMediaProxyUrl(storageKey);
    const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: resolved, matchedAsset: false, assetSource: 'r2_api_path', storageKey, reason: `Routed storage key '${storageKey}' to server proxy /api/files/`, status: 'active' };
    recordDiagnostic(diag);
    return diag;
  }

  const diag: ImageDiagnostic = { id, timestamp, originalInput: url, resolvedUrl: cleanUrl, matchedAsset: false, assetSource: 'direct_url', reason: 'Standard external HTTP/HTTPS URL', status: 'active' };
  recordDiagnostic(diag);
  return diag;
}

export function resolveDisplayImage(url?: string | null, mediaAssets?: MediaAsset[] | unknown, fallbackUrl: string = DEFAULT_FALLBACK_URL): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallbackUrl;
  return diagnoseDisplayImage(url, mediaAssets).resolvedUrl || fallbackUrl;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl?: string, mediaAssets?: MediaAsset[] | unknown, fallbackUrl: string = DEFAULT_FALLBACK_URL) {
  const target = e.currentTarget;
  const cleanOrig = typeof originalUrl === 'string' ? originalUrl.trim() : '';

  if (!target.dataset.triedDataUrl && cleanOrig) {
    const storageKey = extractStorageKey(cleanOrig);
    const cachedData = getCachedMediaDataUrl(storageKey || cleanOrig);
    if (cachedData && target.src !== cachedData) {
      target.dataset.triedDataUrl = 'true';
      target.src = cachedData;
      recordDiagnostic({ id: `err_rec_${Date.now()}`, timestamp: new Date().toISOString(), originalInput: originalUrl, resolvedUrl: cachedData, matchedAsset: true, assetSource: 'indexeddb_cache', storageKey: storageKey || undefined, reason: 'Image load failed. Recovered from local IndexedDB cache dataUrl.', status: 'retrying' });
      return;
    }
    if (Array.isArray(mediaAssets) && mediaAssets.length > 0) {
      const match = mediaAssets.find((a) => a && (a.url === cleanOrig || a.storagePath === cleanOrig || (storageKey && a.storagePath === storageKey) || (a.fileName && cleanOrig.includes(a.fileName))));
      if (match?.dataUrl && target.src !== match.dataUrl) {
        target.dataset.triedDataUrl = 'true';
        target.src = match.dataUrl;
        recordDiagnostic({ id: `err_rec_${Date.now()}`, timestamp: new Date().toISOString(), originalInput: originalUrl, resolvedUrl: match.dataUrl, matchedAsset: true, assetSource: 'asset_dataUrl', storageKey: match.storagePath, reason: 'Image load failed. Recovered from media catalog dataUrl.', status: 'retrying' });
        return;
      }
    }
  }

  if (!target.dataset.triedApiProxy && cleanOrig) {
    const storageKey = extractStorageKey(cleanOrig);
    if (storageKey) {
      const proxyUrl = buildMediaProxyUrl(storageKey);
      if (target.src !== proxyUrl && !target.src.endsWith(proxyUrl)) {
        target.dataset.triedApiProxy = 'true';
        target.src = proxyUrl;
        recordDiagnostic({ id: `err_proxy_${Date.now()}`, timestamp: new Date().toISOString(), originalInput: originalUrl, resolvedUrl: proxyUrl, matchedAsset: false, assetSource: 'r2_api_path', storageKey, reason: 'Image load failed. Retrying via local /api/files/ proxy endpoint.', status: 'retrying' });
        return;
      }
    }
  }

  if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
    target.dataset.triedFallback = 'true';
    target.src = fallbackUrl;
    recordDiagnostic({ id: `err_fallback_${Date.now()}`, timestamp: new Date().toISOString(), originalInput: originalUrl, resolvedUrl: fallbackUrl, matchedAsset: false, assetSource: 'fallback', reason: `Failed to load image '${originalUrl}'. Applied fallback placeholder.`, status: 'fallback_applied', errorDetails: 'Failed all recovery steps (cache, local proxy, asset catalog)' });
  }
}

if (typeof window !== 'undefined') {
  window.debugImage = (url: string) => {
    const diag = diagnoseDisplayImage(url);
    console.group(`[Image Diagnostic] ${url}`);
    console.table({ 'Original Input': diag.originalInput, 'Resolved URL': diag.resolvedUrl, 'Asset Source': diag.assetSource, 'Matched Asset': diag.matchedAsset ? 'YES' : 'NO', 'Storage Key': diag.storageKey || 'N/A', 'Reason': diag.reason, 'Status': diag.status });
    console.groupEnd();
  };
  window.getImageDiagnosticsReport = () => window.__IMAGE_DIAGNOSTICS_LOG__ || [];
}

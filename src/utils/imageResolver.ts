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

/**
 * Extracts a clean relative storage key from any URL or path
 * e.g., "https://pub-r2.mybhaktisathi.com/destinations/2026/09/sample.webp" -> "destinations/2026/09/sample.webp"
 */
export function extractStorageKey(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return null;

  // If already relative
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    const withoutSlash = clean.replace(/^\/+/, '');
    if (
      withoutSlash.startsWith('destinations/') ||
      withoutSlash.startsWith('temples/') ||
      withoutSlash.startsWith('packages/') ||
      withoutSlash.startsWith('media/') ||
      withoutSlash.startsWith('uploads/') ||
      withoutSlash.startsWith('blogs/') ||
      withoutSlash.startsWith('guides/') ||
      withoutSlash.startsWith('payments/')
    ) {
      return withoutSlash;
    }
  }

  // If contains known R2 domain or storage prefixes
  try {
    const parsed = new URL(clean);
    const pathname = parsed.pathname.replace(/^\/+/, '');
    if (
      pathname.startsWith('destinations/') ||
      pathname.startsWith('temples/') ||
      pathname.startsWith('packages/') ||
      pathname.startsWith('media/') ||
      pathname.startsWith('uploads/') ||
      pathname.startsWith('blogs/') ||
      pathname.startsWith('guides/') ||
      pathname.startsWith('payments/')
    ) {
      return pathname;
    }
  } catch {
    // Non-parseable or relative with weird formatting
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
      resolvedUrl: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
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

  const storageKey = extractStorageKey(cleanUrl);

  // 2. Check IndexedDB in-memory cache for an existing dataUrl
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

  // 3. Check mediaAssets array passed via React context
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
      const resolved = `/api/files/${encodeURIComponent(match.storagePath.replace(/^\//, ''))}`;
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

  // 4. If URL points to R2 public domain or relative storage key, map to server proxy
  if (storageKey) {
    const resolved = `/api/files/${encodeURIComponent(storageKey)}`;
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

  // 5. Standard external URL (e.g. Unsplash, CDN, etc.)
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
 * media catalog dataUrl, server storage proxy, and fallbacks.
 */
export function resolveDisplayImage(
  url?: string | null,
  mediaAssets?: MediaAsset[] | unknown,
  fallbackUrl: string = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallbackUrl;
  const diagnostic = diagnoseDisplayImage(url, mediaAssets);
  return diagnostic.resolvedUrl || fallbackUrl;
}

/**
 * Handles image rendering errors with graceful progressive recovery:
 * 1. Attempt IndexedDB / dataUrl recovery
 * 2. Attempt /api/files/ proxy recovery
 * 3. Fallback to default high quality placeholder
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string,
  mediaAssets?: MediaAsset[] | unknown,
  fallbackUrl: string = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
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
      const proxyUrl = `/api/files/${encodeURIComponent(storageKey)}`;
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

  // Step 3: Final fallback to default high quality placeholder
  if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
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

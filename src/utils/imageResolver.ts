import React from 'react';
import { MediaAsset } from '../types/cms';

/**
 * Resolves an image URL for display. Prioritizes the direct URL,
 * falling back to local asset dataUrl if available in mediaAssets catalog.
 */
export function resolveDisplayImage(
  url?: string | null,
  mediaAssets?: MediaAsset[],
  fallbackUrl: string = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
): string {
  if (!url || !url.trim()) return fallbackUrl;
  const cleanUrl = url.trim();

  // If already a valid data URL or blob, return directly
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // If mediaAssets is available, check if we have a matching asset with inline dataUrl
  if (mediaAssets && mediaAssets.length > 0) {
    const match = mediaAssets.find(
      (a) =>
        a &&
        (a.url === cleanUrl ||
          a.dataUrl === cleanUrl ||
          a.storagePath === cleanUrl ||
          (a.storagePath && cleanUrl.includes(a.storagePath)) ||
          (a.fileName && cleanUrl.includes(a.fileName)) ||
          (a.name && cleanUrl.toLowerCase().includes(a.name.toLowerCase().replace(/\.[^/.]+$/, ''))))
    );
    if (match?.dataUrl) {
      return match.dataUrl;
    }
  }

  return cleanUrl;
}

/**
 * Handles image rendering errors. If the remote R2 URL cannot be loaded (e.g. DNS pending),
 * attempts to fall back to the asset's stored dataUrl if present before falling back to generic placeholder.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string,
  mediaAssets?: MediaAsset[],
  fallbackUrl: string = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
) {
  const target = e.currentTarget;

  // Step 1: Check if there is an asset with dataUrl backup in mediaAssets
  if (!target.dataset.triedDataUrl && originalUrl && mediaAssets && mediaAssets.length > 0) {
    const cleanOrig = originalUrl.trim();
    const match = mediaAssets.find(
      (a) =>
        a.url === cleanOrig ||
        a.storagePath === cleanOrig ||
        cleanOrig.endsWith(a.storagePath) ||
        (a.fileName && cleanOrig.includes(a.fileName))
    );

    if (match?.dataUrl && target.src !== match.dataUrl) {
      target.dataset.triedDataUrl = 'true';
      target.src = match.dataUrl;
      return;
    }
  }

  // Step 2: Final fallback to default high quality placeholder
  if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
    target.dataset.triedFallback = 'true';
    target.src = fallbackUrl;
  }
}


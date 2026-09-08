import React from 'react';
import { MediaAsset } from '../types/cms';

/**
 * Resolves an image URL directly to its original remote address (R2 Bucket URL)
 * as requested, disabling automatic base64 local fallbacks.
 */
export function resolveDisplayImage(
  url?: string | null,
  mediaAssets?: MediaAsset[],
  fallbackUrl: string = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
): string {
  if (!url || !url.trim()) return fallbackUrl;
  const cleanUrl = url.trim();
  return cleanUrl;
}

/**
 * Handles image rendering errors. Since offline fallbacks are disabled,
 * it points to a clean high-quality placeholder if the remote R2 URL fails.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string,
  mediaAssets?: MediaAsset[],
  fallbackUrl: string = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
) {
  const target = e.currentTarget;
  if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
    target.dataset.triedFallback = 'true';
    target.src = fallbackUrl;
  }
}


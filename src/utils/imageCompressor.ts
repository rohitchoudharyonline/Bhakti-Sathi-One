import { MediaAsset, CloudStorageSettings } from '../types/cms';

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (e.g. 0.8)
  outputFormat?: 'webp' | 'jpeg' | 'png' | 'gif' | 'original';
  r2PublicDomain?: string;
  folder?: string;
}

export interface CompressionResult {
  asset: MediaAsset;
  dataUrl: string;
  blob: Blob;
  originalSizeKb: number;
  compressedSizeKb: number;
  percentSavings: number;
}

/**
 * Compresses an image file (PNG, JPG, JPEG, WEBP, GIF) in browser using Canvas
 * and generates Cloudflare R2 / D1 cloud storage metadata.
 */
export async function compressAndProcessImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    outputFormat = 'webp',
    r2PublicDomain = 'https://pub-r2.mybhaktisathi.com',
    folder = 'uploads',
  } = options;

  const originalSizeKb = Math.round(file.size / 1024);
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';

  // For SVGs or animated GIFs if outputFormat is original or gif, preserve directly
  if (fileExt === 'svg' || ((fileExt === 'gif') && (outputFormat === 'original' || outputFormat === 'gif'))) {
    const dataUrl = await fileToDataUrl(file);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const cleanName = sanitizeFileName(file.name);
    const storagePath = `${folder}/${year}/${month}/${cleanName}`;
    const url = `${r2PublicDomain}/${storagePath}`;

    const asset: MediaAsset = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileName: cleanName,
      fileType: fileExt as any,
      url: `${r2PublicDomain.replace(/\/$/, '')}/${storagePath}`,
      dataUrl,
      storagePath,
      storageProvider: 'cloudflare_r2',
      originalSizeKb,
      compressedSizeKb: originalSizeKb,
      compressionRatioPercent: 0,
      altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      uploadedAt: new Date().toISOString(),
      folder,
    };

    return {
      asset,
      dataUrl,
      blob: file,
      originalSizeKb,
      compressedSizeKb: originalSizeKb,
      percentSavings: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio within bounding box
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw image on canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let mimeType = 'image/webp';
        let targetExt = 'webp';

        if (outputFormat === 'jpeg' || (outputFormat === 'original' && (fileExt === 'jpg' || fileExt === 'jpeg'))) {
          mimeType = 'image/jpeg';
          targetExt = 'jpg';
        } else if (outputFormat === 'png' || (outputFormat === 'original' && fileExt === 'png')) {
          mimeType = 'image/png';
          targetExt = 'png';
        } else if (outputFormat === 'gif') {
          mimeType = 'image/png'; // Canvas does not encode animated GIFs; outputs PNG with gif extension/compatibility
          targetExt = 'gif';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to generate compressed blob'));
              return;
            }

            const compressedDataUrl = canvas.toDataURL(mimeType, quality);
            const compressedSizeKb = Math.max(1, Math.round(blob.size / 1024));
            const percentSavings =
              originalSizeKb > 0
                ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
                : 0;

            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const baseCleanName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, ''));
            const finalFileName = `${baseCleanName}.${targetExt}`;
            const storagePath = `${folder}/${year}/${month}/${finalFileName}`;

            const asset: MediaAsset = {
              id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              fileName: finalFileName,
              fileType: targetExt as any,
              url: `${r2PublicDomain.replace(/\/$/, '')}/${storagePath}`,
              dataUrl: compressedDataUrl,
              storagePath,
              storageProvider: 'cloudflare_r2',
              originalSizeKb,
              compressedSizeKb,
              compressionRatioPercent: percentSavings,
              dimensions: { width, height },
              altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              uploadedAt: new Date().toISOString(),
              folder,
            };

            resolve({
              asset,
              dataUrl: compressedDataUrl,
              blob,
              originalSizeKb,
              compressedSizeKb,
              percentSavings,
            });
          },
          mimeType,
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Automatically compresses payment receipts / screenshots to max 600px
 * and prepares Cloudflare R2 cloud storage path seamlessly in background.
 */
export async function compressPaymentProof(file: File): Promise<{
  dataUrl: string;
  fileName: string;
  r2Path: string;
  compressedKb: number;
  originalKb: number;
}> {
  const result = await compressAndProcessImage(file, {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.82,
    outputFormat: 'webp',
    folder: 'payments/proofs',
  });

  return {
    dataUrl: result.dataUrl,
    fileName: result.asset.fileName,
    r2Path: result.asset.storagePath,
    compressedKb: result.compressedSizeKb,
    originalKb: result.originalSizeKb,
  };
}

/**
 * Uploads a base64 encoded file to Cloudflare R2 bucket using the secure server-side API proxy.
 */
export async function uploadToR2(
  fileBase64: string,
  fileName: string,
  contentType: string,
  storagePath: string,
  settings: CloudStorageSettings
): Promise<boolean> {
  if (!settings?.r2AccountId || !settings?.r2AccessKeyId || !settings?.r2SecretAccessKey || !settings?.r2BucketName) {
    console.warn('Skipping physical upload: R2 storage credentials are not fully configured in settings.');
    return false;
  }

  // If secret key is still masked with asterisks, it cannot authenticate with S3
  if (settings.r2SecretAccessKey.includes('*')) {
    console.warn('R2 Secret Access Key is masked with asterisks. Please provide the actual Cloudflare R2 Secret Access Key in storage settings to upload to the remote bucket.');
    return false;
  }

  try {
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        fileBase64,
        fileName,
        contentType,
        storagePath,
        r2AccountId: settings.r2AccountId.trim(),
        r2AccessKeyId: settings.r2AccessKeyId.trim(),
        r2SecretAccessKey: settings.r2SecretAccessKey.trim(),
        r2BucketName: settings.r2BucketName.trim(),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn(`R2 upload responded with ${response.status}:`, errData.error || 'Upload error');
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.warn('Notice: R2 remote upload could not complete, image preserved in local catalog:', error);
    return false;
  }
}

/**
 * Deletes a file from Cloudflare R2 bucket using the secure server-side API proxy.
 */
export async function deleteFromR2(
  storagePath: string,
  settings: CloudStorageSettings
): Promise<boolean> {
  if (!settings?.r2AccountId || !settings?.r2AccessKeyId || !settings?.r2SecretAccessKey || !settings?.r2BucketName) {
    console.warn('Skipping physical deletion: R2 storage credentials are not configured in settings.');
    return false;
  }

  if (settings.r2SecretAccessKey.includes('*')) {
    return false;
  }

  try {
    const response = await fetch('/api/media/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        storagePath,
        r2AccountId: settings.r2AccountId.trim(),
        r2AccessKeyId: settings.r2AccessKeyId.trim(),
        r2SecretAccessKey: settings.r2SecretAccessKey.trim(),
        r2BucketName: settings.r2BucketName.trim(),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn(`R2 deletion responded with ${response.status}:`, errData.error || 'Deletion error');
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.warn('Failed to delete image from Cloudflare R2:', error);
    return false;
  }
}


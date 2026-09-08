import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  Sparkles,
  Sliders,
  FolderOpen,
  Link,
  Trash2,
  Copy,
  RefreshCw,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { MediaAsset } from '../../types/cms';
import { compressAndProcessImage, uploadToR2 } from '../../utils/imageCompressor';
import { MediaR2StorageManager } from './MediaR2StorageManager';

export interface CompressionStats {
  originalKb: number;
  compressedKb: number;
  savingsPercent: number;
  format: string;
  dimensions?: { width: number; height: number };
  storagePath: string;
}

export interface UniversalImageUploaderProps {
  currentUrl?: string;
  onImageSelected: (
    url: string,
    asset?: MediaAsset,
    stats?: CompressionStats
  ) => void;
  folder?: string;
  label?: string;
  description?: string;
  defaultWidth?: number; // 700, 800, 1000, 1200, 1600, or 0 (original)
  defaultFormat?: 'webp' | 'png' | 'jpeg' | 'gif';
  variant?: 'full' | 'compact' | 'inline-button';
  buttonLabel?: string;
  aspectRatio?: string;
  showR2LibraryPicker?: boolean;
}

const WIDTH_OPTIONS = [
  { value: 700, label: '700px', desc: 'Compact / Mobile' },
  { value: 800, label: '800px', desc: 'Standard Card' },
  { value: 1000, label: '1000px', desc: 'Recommended HD' },
  { value: 1200, label: '1200px', desc: 'Hero / Banner' },
  { value: 1600, label: '1600px', desc: 'Ultra Crisp' },
  { value: 0, label: 'Original', desc: 'No Resize' },
];

const FORMAT_OPTIONS: Array<{
  value: 'webp' | 'png' | 'jpeg' | 'gif';
  label: string;
  tag: string;
}> = [
  { value: 'webp', label: 'WebP', tag: 'Fastest & Smallest (Recommended)' },
  { value: 'png', label: 'PNG', tag: 'Lossless & Transparent' },
  { value: 'jpeg', label: 'JPG', tag: 'Universal Photo standard' },
  { value: 'gif', label: 'GIF', tag: 'Animated & Graphics' },
];

export const UniversalImageUploader: React.FC<UniversalImageUploaderProps> = ({
  currentUrl,
  onImageSelected,
  folder = 'uploads',
  label,
  description,
  defaultWidth = 1000,
  defaultFormat = 'webp',
  variant = 'full',
  buttonLabel = 'Upload & Compress to R2',
  aspectRatio = 'aspect-[16/9]',
  showR2LibraryPicker = true,
}) => {
  const { addMediaAsset, cloudStorageSettings, mediaAssets } = useTours();

  const resolveDisplayUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const match = mediaAssets?.find(
      (a) =>
        a &&
        (a.url === url ||
          a.dataUrl === url ||
          (a.storagePath && url.includes(a.storagePath)) ||
          (a.name && url.toLowerCase().includes(a.name.toLowerCase().replace(/\.[^/.]+$/, ''))))
    );
    return match?.dataUrl || url;
  };

  const [targetWidth, setTargetWidth] = useState<number>(defaultWidth);
  const [targetFormat, setTargetFormat] = useState<'webp' | 'png' | 'jpeg' | 'gif'>(defaultFormat);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showR2Modal, setShowR2Modal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastStats, setLastStats] = useState<CompressionStats | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    setIsCompressing(true);

    try {
      const maxWidth = targetWidth > 0 ? targetWidth : 4000;
      const maxHeight = targetWidth > 0 ? targetWidth : 4000;

      const result = await compressAndProcessImage(file, {
        quality: cloudStorageSettings?.compressionQuality || 0.8,
        maxWidth,
        maxHeight,
        outputFormat: targetFormat,
        r2PublicDomain:
          cloudStorageSettings?.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
        folder,
      });

      // Upload directly to real Cloudflare R2 bucket via server-side proxy
      await uploadToR2(
        result.dataUrl,
        result.asset.fileName,
        result.blob.type,
        result.asset.storagePath,
        cloudStorageSettings
      );

      // Save to media assets in state/local storage
      addMediaAsset(result.asset);

      const stats: CompressionStats = {
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb,
        savingsPercent: result.percentSavings,
        format: result.asset.fileType.toUpperCase(),
        dimensions: result.asset.dimensions,
        storagePath: result.asset.storagePath,
      };

      setLastStats(stats);
      const finalSelectedUrl = result.asset.url;
      onImageSelected(finalSelectedUrl, result.asset, stats);
    } catch (err) {
      console.error('Failed to compress and upload image:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onImageSelected(manualUrl.trim());
    setManualUrl('');
    setShowUrlInput(false);
  };

  const handleCopyUrl = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact Variant (e.g. for Review Author Photo or Day Itinerary Image)
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#FF4B00]" />
              {label}
            </label>
            {lastStats && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {lastStats.originalKb} KB → {lastStats.compressedKb} KB ({lastStats.savingsPercent}% saved)
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Thumbnail preview if URL exists */}
          {currentUrl ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
              <img src={resolveDisplayUrl(currentUrl)} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center shrink-0 text-stone-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 flex flex-wrap gap-1.5 items-center">
            {/* Quick Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="px-3 py-1.5 rounded-lg bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isCompressing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>{isCompressing ? 'Compressing…' : buttonLabel}</span>
            </button>

            {/* Pick from R2 Library */}
            {showR2LibraryPicker && (
              <button
                type="button"
                onClick={() => setShowR2Modal(true)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Select from R2 Media Catalog"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>R2 Library</span>
              </button>
            )}

            {/* Toggle manual URL input */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs transition cursor-pointer"
              title="Paste image URL"
            >
              <Link className="w-3.5 h-3.5" />
            </button>

            {/* Clear Image */}
            {currentUrl && (
              <button
                type="button"
                onClick={() => onImageSelected('')}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Compression Options bar for compact mode */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-500">
          <div className="flex items-center gap-1 font-medium">
            <span>Width:</span>
            <select
              value={targetWidth}
              onChange={(e) => setTargetWidth(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-stone-800"
            >
              {WIDTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 font-medium">
            <span>Format:</span>
            <select
              value={targetFormat}
              onChange={(e) =>
                setTargetFormat(e.target.value as 'webp' | 'png' | 'jpeg' | 'gif')
              }
              className="bg-white border border-stone-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-stone-800"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Manual URL Input dropdown */}
        {showUrlInput && (
          <form onSubmit={handleManualUrlSubmit} className="flex gap-2 pt-1">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-[#FF4B00]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold"
            >
              Set URL
            </button>
          </form>
        )}

        {/* R2 Media Modal */}
        {showR2Modal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white w-full max-w-5xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex-1 overflow-y-auto">
                <MediaR2StorageManager
                  isModal={true}
                  onCloseModal={() => setShowR2Modal(false)}
                  onSelectMedia={(url, asset) => {
                    onImageSelected(url, asset);
                    setShowR2Modal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Featured Variant (Default for Tour Covers, Blog Covers, Galleries)
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header with Title & Description */}
      {(label || description) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            {label && (
              <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF4B00]" />
                {label}
              </h4>
            )}
            {description && (
              <p className="text-xs text-stone-500 mt-0.5">{description}</p>
            )}
          </div>

          {/* R2 Cloud Ready Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-800 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Cloudflare R2 Bucket</span>
          </div>
        </div>
      )}

      {/* Target Options Bar: Width and Format Selector */}
      <div className="bg-stone-50/90 rounded-xl p-3 border border-stone-200/70 space-y-3">
        {/* Width Options */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#FF4B00]" />
              <span>Target Width:</span>
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              {targetWidth > 0 ? `Resize to max ${targetWidth}px wide` : 'Keep original resolution'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {WIDTH_OPTIONS.map((opt) => {
              const isSelected = targetWidth === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetWidth(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#FF4B00] text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Options */}
        <div className="pt-2 border-t border-stone-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Auto-Compress Format:</span>
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              {FORMAT_OPTIONS.find((f) => f.value === targetFormat)?.tag}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FORMAT_OPTIONS.map((opt) => {
              const isSelected = targetFormat === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetFormat(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer uppercase ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition p-6 text-center flex flex-col items-center justify-center ${
          dragOver
            ? 'border-[#FF4B00] bg-[#FF4B00]/5'
            : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isCompressing ? (
          <div className="py-4 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF4B00] mx-auto" />
            <p className="text-xs font-black text-stone-900">
              Auto-Compressing to {targetFormat.toUpperCase()} ({targetWidth > 0 ? `${targetWidth}px` : 'Original'})…
            </p>
            <p className="text-[11px] text-stone-500">
              Optimizing dimensions & generating Cloudflare R2 path…
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center mx-auto text-[#FF4B00]">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-black text-stone-900">
                Drag and drop image here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#FF4B00] underline font-black hover:text-[#E04200] cursor-pointer"
                >
                  browse from device
                </button>
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Supports PNG, JPG, GIF, WebP & SVG. Auto-resizes & compresses to Cloudflare R2.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#FF4B00] hover:bg-[#E04200] text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{buttonLabel}</span>
              </button>

              {showR2LibraryPicker && (
                <button
                  type="button"
                  onClick={() => setShowR2Modal(true)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-amber-500" />
                  <span>Choose from R2 Library</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Link className="w-4 h-4 text-stone-500" />
                <span>Paste URL</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual URL Form */}
      {showUrlInput && (
        <form onSubmit={handleManualUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste direct image URL (https://images.unsplash.com/...)"
            className="flex-1 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF4B00]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-black hover:bg-black transition cursor-pointer"
          >
            Apply URL
          </button>
        </form>
      )}

      {/* Live Compression Result Banner */}
      {lastStats && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-emerald-900">
                  Compressed {lastStats.originalKb} KB → {lastStats.compressedKb} KB
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                  {lastStats.savingsPercent}% Saved
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                Target: {lastStats.format} · Path:{' '}
                <span className="font-mono">{lastStats.storagePath}</span>
              </p>
            </div>
          </div>

          {lastStats.dimensions && (
            <div className="text-[11px] font-bold text-emerald-800 bg-white/70 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              {lastStats.dimensions.width} × {lastStats.dimensions.height}px
            </div>
          )}
        </div>
      )}

      {/* Current Image Preview & Metadata */}
      {currentUrl && (
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              Active Photo Preview:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
              <button
                type="button"
                onClick={() => onImageSelected('')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div
            className={`relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 ${aspectRatio} max-h-64`}
          >
            <img
              src={resolveDisplayUrl(currentUrl)}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const resolved = resolveDisplayUrl(currentUrl);
                if (resolved && e.currentTarget.src !== resolved) {
                  e.currentTarget.src = resolved;
                }
              }}
            />
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-xs">{currentUrl}</span>
            </div>
          </div>
        </div>
      )}

      {/* R2 Cloud Media Picker Modal */}
      {showR2Modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex-1 overflow-y-auto">
              <MediaR2StorageManager
                isModal={true}
                onCloseModal={() => setShowR2Modal(false)}
                onSelectMedia={(url, asset) => {
                  onImageSelected(url, asset);
                  setShowR2Modal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useTours } from '../../context/TourContext';
import { MediaAsset } from '../../types/cms';
import { compressAndProcessImage } from '../../utils/imageCompressor';
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  Copy,
  Trash2,
  Settings,
  Sparkles,
  Search,
  Filter,
  FileText,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Server,
  Cloud,
  Database,
  Layers,
  Info,
} from 'lucide-react';

interface MediaR2StorageManagerProps {
  onSelectMedia?: (url: string, asset: MediaAsset) => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const MediaR2StorageManager: React.FC<MediaR2StorageManagerProps> = ({
  onSelectMedia,
  isModal = false,
  onCloseModal,
}) => {
  const {
    mediaAssets,
    addMediaAsset,
    deleteMediaAsset,
    cloudStorageSettings,
    updateCloudStorageSettings,
  } = useTours();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<MediaAsset | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customWidth, setCustomWidth] = useState<number>(1000);
  const [customFormat, setCustomFormat] = useState<'webp' | 'png' | 'jpeg' | 'gif'>('webp');
  const [compressionLogs, setCompressionLogs] = useState<
    Array<{ name: string; originalKb: number; compressedKb: number; percent: number }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const logs: Array<{ name: string; originalKb: number; compressedKb: number; percent: number }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Compressing and uploading ${i + 1}/${files.length}: ${file.name}...`);

      try {
        const maxWidth = customWidth > 0 ? customWidth : (cloudStorageSettings.maxImageWidth || 1920);
        const result = await compressAndProcessImage(file, {
          quality: cloudStorageSettings.compressionQuality || 0.78,
          maxWidth,
          outputFormat: customFormat || cloudStorageSettings.outputFormat || 'webp',
          r2PublicDomain: cloudStorageSettings.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
          folder: selectedFolder === 'all' ? 'uploads' : selectedFolder,
        });

        addMediaAsset(result.asset);
        logs.push({
          name: file.name,
          originalKb: result.originalSizeKb,
          compressedKb: result.compressedSizeKb,
          percent: result.percentSavings,
        });
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }

    setCompressionLogs(logs);
    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = mediaAssets.filter((asset) => {
    if (selectedFolder !== 'all' && asset.folder !== selectedFolder) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.fileName.toLowerCase().includes(q) ||
        asset.altText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSavedKb = mediaAssets.reduce(
    (sum, a) => sum + Math.max(0, a.originalSizeKb - a.compressedSizeKb),
    0
  );

  return (
    <div className={`space-y-6 ${isModal ? 'p-6 bg-white rounded-2xl max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black text-white p-6 rounded-2xl border border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Cloudflare R2 & Supabase Asset CDN
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Cloud Media & Auto-Compressor Studio
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Auto-compresses PNG, JPG, GIF & WebP before pushing to Cloudflare R2 bucket. Saves bandwidth & boosts Google Core Web Vitals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>R2 / Supabase API Keys</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-black text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Compressing...' : 'Upload & Compress'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Real-time Compression Metrics Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Total Hosted Media</p>
            <p className="text-2xl font-bold text-black mt-0.5">{mediaAssets.length} Assets</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-black">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Bandwidth Saved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">
              {(totalSavedKb / 1024).toFixed(1)} MB ({(totalSavedKb > 0 ? (totalSavedKb / (totalSavedKb + mediaAssets.reduce((s, a) => s + a.compressedSizeKb, 0))) * 100 : 0).toFixed(0)}%)
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">R2 Bucket Target</p>
            <p className="text-xs font-semibold text-black mt-1 truncate max-w-[180px]">
              {cloudStorageSettings.r2BucketName}
            </p>
            <span className="inline-block mt-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              CDN Active (WebP 78%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-black">
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Upload Settings Bar */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-stone-900 mb-1">Target Dimension (Max Width):</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[700, 800, 1000, 1200, 1600, 0].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setCustomWidth(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  customWidth === w
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {w === 0 ? 'Original' : `${w}px`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-stone-900 mb-1">Auto-Compress Format:</div>
          <div className="flex items-center gap-1.5">
            {(['webp', 'png', 'jpeg', 'gif'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setCustomFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                  customFormat === fmt
                    ? 'bg-[#FC3200] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-stone-300 hover:border-black rounded-2xl p-8 text-center cursor-pointer transition bg-stone-50/50 hover:bg-stone-50 group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mx-auto mb-3 text-stone-700 group-hover:scale-110 transition">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-black mb-1">
          Drop PNG, JPG, GIF or WebP images here to Auto-Compress & Upload
        </h4>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Files are automatically converted to optimized WebP / JPEG, stripped of heavy EXIF metadata, and saved with Cloudflare R2 storage paths.
        </p>
      </div>

      {/* Upload progress & logs */}
      {uploadProgress && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs font-medium animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {compressionLogs.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Recent Compression Results</span>
            <button
              onClick={() => setCompressionLogs([])}
              className="text-[10px] text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-800">
            {compressionLogs.map((log, idx) => (
              <div key={idx} className="bg-white/80 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                <span className="truncate max-w-[150px] font-medium">{log.name}</span>
                <span className="font-bold text-emerald-700">
                  {log.originalKb} KB → {log.compressedKb} KB ({log.percent}% saved)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Folder Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by name or alt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'tours', 'destinations', 'blog', 'uploads'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                selectedFolder === f
                  ? 'bg-black text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-black transition flex flex-col justify-between"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
              <img
                src={asset.url}
                alt={asset.altText}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/75 text-white backdrop-blur-xs">
                {asset.fileType}
              </span>
              {asset.compressionRatioPercent > 0 && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shadow-xs">
                  -{asset.compressionRatioPercent}%
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="p-2.5 space-y-1">
              <p className="text-[11px] font-bold text-black truncate" title={asset.name}>
                {asset.name}
              </p>
              <div className="flex items-center justify-between text-[10px] text-stone-500">
                <span>{asset.compressedSizeKb} KB</span>
                <span className="capitalize">{asset.folder || 'general'}</span>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="p-1.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1">
              {onSelectMedia ? (
                <button
                  onClick={() => onSelectMedia(asset.url, asset)}
                  className="flex-1 py-1 px-2 bg-black hover:bg-stone-800 text-white rounded-md text-[10px] font-bold transition text-center cursor-pointer"
                >
                  Insert
                </button>
              ) : (
                <button
                  onClick={() => handleCopyUrl(asset)}
                  className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 bg-white border border-stone-200 hover:border-stone-400 rounded-md text-[10px] font-semibold text-stone-800 transition cursor-pointer"
                  title="Copy R2 CDN URL"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-500" />
                      <span>URL</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setSelectedAssetForPreview(asset)}
                className="p-1 hover:bg-stone-200 rounded text-stone-600 transition cursor-pointer"
                title="Inspect Details & Schema"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteMediaAsset(asset.id)}
                className="p-1 hover:bg-rose-50 rounded text-stone-400 hover:text-rose-600 transition cursor-pointer"
                title="Delete Media"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="py-12 text-center text-stone-400 text-xs">
          No media files found matching the search criteria.
        </div>
      )}

      {/* Asset Preview / Inspector Modal */}
      {selectedAssetForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-black">Asset Inspector & CDN Path</h3>
              <button
                onClick={() => setSelectedAssetForPreview(null)}
                className="text-stone-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
              <img
                src={selectedAssetForPreview.url}
                alt={selectedAssetForPreview.altText}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-500 font-medium">File Name:</span>
                <p className="font-mono text-black font-semibold">{selectedAssetForPreview.fileName}</p>
              </div>

              <div>
                <span className="text-stone-500 font-medium">R2 Storage Path:</span>
                <p className="font-mono text-stone-800 bg-stone-50 p-1.5 rounded border border-stone-200 break-all">
                  {selectedAssetForPreview.storagePath}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 text-[10px] block uppercase">Original Size</span>
                  <span className="font-bold text-black">{selectedAssetForPreview.originalSizeKb} KB</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 text-[10px] block uppercase">Compressed Size</span>
                  <span className="font-bold text-emerald-800">
                    {selectedAssetForPreview.compressedSizeKb} KB (-{selectedAssetForPreview.compressionRatioPercent}%)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-stone-500 font-medium">Alt Text (SEO Image Search):</span>
                <p className="text-stone-800 font-medium mt-0.5">{selectedAssetForPreview.altText}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopyUrl(selectedAssetForPreview)}
                className="flex-1 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Direct CDN Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare R2 & Supabase Credentials Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-black">
                  Cloudflare R2 & Supabase Storage Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-stone-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Configure your Cloudflare R2 Bucket and Supabase Database settings for persistent production hosting.
            </p>

            <div className="space-y-4 text-xs">
              {/* R2 Section */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <span className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-stone-700" />
                  Cloudflare R2 Object Storage
                </span>

                <div>
                  <label className="block text-stone-500 font-medium mb-1">R2 Public CDN Domain</label>
                  <input
                    type="text"
                    value={cloudStorageSettings.r2PublicDomain}
                    onChange={(e) =>
                      updateCloudStorageSettings({
                        ...cloudStorageSettings,
                        r2PublicDomain: e.target.value,
                      })
                    }
                    placeholder="https://pub-r2.mybhaktisathi.com"
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-500 font-medium mb-1">R2 Bucket Name</label>
                    <input
                      type="text"
                      value={cloudStorageSettings.r2BucketName}
                      onChange={(e) =>
                        updateCloudStorageSettings({
                          ...cloudStorageSettings,
                          r2BucketName: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 font-medium mb-1">Account ID</label>
                    <input
                      type="text"
                      value={cloudStorageSettings.r2AccountId}
                      onChange={(e) =>
                        updateCloudStorageSettings({
                          ...cloudStorageSettings,
                          r2AccountId: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Supabase Section */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <span className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Supabase Database & Text Storage
                </span>

                <div>
                  <label className="block text-stone-500 font-medium mb-1">Supabase Project URL</label>
                  <input
                    type="text"
                    value={cloudStorageSettings.supabaseUrl}
                    onChange={(e) =>
                      updateCloudStorageSettings({
                        ...cloudStorageSettings,
                        supabaseUrl: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Auto Compression Settings */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <span className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  Auto-Compression Pipeline
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-500 font-medium mb-1">Output Format</label>
                    <select
                      value={cloudStorageSettings.outputFormat}
                      onChange={(e) =>
                        updateCloudStorageSettings({
                          ...cloudStorageSettings,
                          outputFormat: e.target.value as any,
                        })
                      }
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="webp">WebP (Recommended: Highest Compression)</option>
                      <option value="jpeg">JPEG (Universal)</option>
                      <option value="png">PNG (Preserve Alpha)</option>
                      <option value="original">Original Format</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-500 font-medium mb-1">Max Dimension Width</label>
                    <select
                      value={cloudStorageSettings.maxImageWidth}
                      onChange={(e) =>
                        updateCloudStorageSettings({
                          ...cloudStorageSettings,
                          maxImageWidth: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="1920">1920px (Full HD)</option>
                      <option value="1440">1440px (2K Optimized)</option>
                      <option value="1200">1200px (Blog Content)</option>
                      <option value="800">800px (Mobile Light)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

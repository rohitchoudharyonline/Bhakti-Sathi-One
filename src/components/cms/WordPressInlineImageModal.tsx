import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FolderOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  ImageIcon,
  Sparkles,
  Loader2,
  Sliders,
  Type,
  Maximize2,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { MediaAsset } from '../../types/cms';
import { compressAndProcessImage, uploadToR2 } from '../../utils/imageCompressor';

interface WordPressInlineImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (markdownSnippet: string) => void;
  folder?: string;
}

export const WordPressInlineImageModal: React.FC<WordPressInlineImageModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
  folder = 'blog-inline',
}) => {
  const { mediaAssets, addMediaAsset, cloudStorageSettings } = useTours();

  // Active Source Sub-tab: 'upload' | 'library'
  const [activeSourceTab, setActiveSourceTab] = useState<'upload' | 'library'>('upload');

  // Selected Image Details
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // WordPress Layout & Formatting State
  const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [altText, setAltText] = useState<string>('');
  const [caption, setCaption] = useState<string>('');

  // Upload state
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process uploaded file
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    setUploadNotice(null);

    try {
      const result = await compressAndProcessImage(file, {
        quality: cloudStorageSettings?.compressionQuality || 0.8,
        maxWidth: 1400,
        outputFormat: 'webp',
        r2PublicDomain: cloudStorageSettings?.r2PublicDomain || 'https://pub-r2.mybhaktisathi.com',
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

      addMediaAsset(result.asset);

      const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setSelectedImageUrl(result.asset.url);
      setSelectedAsset(result.asset);
      setAltText(cleanAlt);
      setCaption(cleanAlt);

      setUploadNotice(
        `✓ Compressed ${result.originalSizeKb} KB → ${result.compressedSizeKb} KB (${result.percentSavings}% WebP savings) & R2 URL generated`
      );
    } catch (err) {
      console.error('Failed to compress inline image:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectFromLibrary = (asset: MediaAsset) => {
    setSelectedImageUrl(asset.url);
    setSelectedAsset(asset);
    setAltText(asset.altText || asset.name);
    setCaption(asset.caption || asset.altText || asset.name);
  };

  const handleInsert = () => {
    if (!selectedImageUrl) return;

    // Standard markdown image syntax with formatted meta:
    // ![Alt Text|alignment|Caption](URL) *Caption: Caption*
    const metaTag = `${altText || 'Article Image'}|${alignment}|${caption || ''}`;
    const captionLine = caption ? `\n*Caption: ${caption}*` : '';
    const markdownSnippet = `\n\n![${metaTag}](${selectedImageUrl})${captionLine}\n\n`;

    onInsertImage(markdownSnippet);
    onClose();
  };

  const filteredAssets = mediaAssets.filter((a) =>
    a.name.toLowerCase().includes(libraryFilter.toLowerCase()) ||
    a.altText.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FC3200] rounded-lg text-white">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight">WordPress-Style Inline Photo Tool</h3>
              <p className="text-[11px] text-stone-300">Upload to R2 or select media, format alignment & insert</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Tabs */}
        <div className="bg-stone-100 border-b border-stone-200 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSourceTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSourceTab === 'upload'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New Photo</span>
            </button>

            <button
              onClick={() => setActiveSourceTab('library')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSourceTab === 'library'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>R2 Media Catalog ({mediaAssets.length})</span>
            </button>
          </div>

          {selectedImageUrl && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Photo Ready</span>
            </span>
          )}
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: UPLOAD */}
          {activeSourceTab === 'upload' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-black rounded-2xl p-6 sm:p-8 bg-stone-50 hover:bg-stone-100/80 transition cursor-pointer text-center space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFileUpload(f);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200 flex items-center justify-center mx-auto text-[#FC3200]">
                  {isCompressing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-black text-stone-900">
                    {isCompressing ? 'Compressing and generating R2 CDN path...' : 'Click to Upload or Drag Photo Here'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Supports PNG, JPG, WEBP. Automatically optimized to high-speed WebP on R2 Cloudflare.
                  </p>
                </div>
              </div>

              {uploadNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                  <span>{uploadNotice}</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-emerald-200 text-emerald-950 rounded-md">
                    R2 Ready
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: R2 MEDIA CATALOG */}
          {activeSourceTab === 'library' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search media assets by name or alt text..."
                value={libraryFilter}
                onChange={(e) => setLibraryFilter(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedImageUrl === asset.url;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectFromLibrary(asset)}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 cursor-pointer transition group bg-stone-100 ${
                        isSelected
                          ? 'border-black ring-2 ring-black/20 shadow-md'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <img
                        src={asset.dataUrl || asset.url}
                        alt={asset.altText}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-black text-white p-1 rounded-full shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] text-white truncate font-medium">
                        {asset.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAssets.length === 0 && (
                <p className="text-center py-6 text-xs text-stone-400">No media assets found in R2 catalog.</p>
              )}
            </div>
          )}

          {/* SECTION: FORMATTING & WORDPRESS ALIGNMENT */}
          {selectedImageUrl && (
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#FC3200]" />
                <span>WordPress Layout & Alignment Settings</span>
              </h4>

              {/* Alignment Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                  Inline Image Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlignment('center')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      alignment === 'center'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                    <span>Centered (Full)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlignment('left')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      alignment === 'left'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span>Wrap Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlignment('right')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      alignment === 'right'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                    <span>Wrap Right</span>
                  </button>
                </div>
              </div>

              {/* Alt & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Alt Text (SEO & Screen Readers)
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="e.g. Snowy peak in Sonmarg Kashmir"
                    className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Image Caption (Shown under photo)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. View of Thajiwas Glacier in Sonmarg"
                    className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* R2 Link Display */}
              <div className="p-2.5 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs text-stone-500 font-mono">
                <span className="truncate mr-2 font-bold text-stone-800">{selectedImageUrl}</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md shrink-0 uppercase">
                  R2 Storage Link
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleInsert}
            disabled={!selectedImageUrl}
            className="px-5 py-2 bg-[#FC3200] hover:bg-[#e02c00] text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Insert Image Into Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};

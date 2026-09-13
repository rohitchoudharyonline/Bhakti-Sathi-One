import React, { useState, useEffect } from 'react';
import { useTours } from '../../context/TourContext';
import { diagnoseDisplayImage, ImageDiagnostic } from '../../utils/imageResolver';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface ImageDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  title?: string;
}

export const ImageDiagnosticModal: React.FC<ImageDiagnosticModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Image Diagnostic Inspector',
}) => {
  const { mediaAssets } = useTours();
  const [copied, setCopied] = useState(false);
  const [diagnostic, setDiagnostic] = useState<ImageDiagnostic | null>(null);
  const [httpStatus, setHttpStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const diag = diagnoseDisplayImage(imageUrl, mediaAssets);
      setDiagnostic(diag);
      setHttpStatus(null);
    }
  }, [isOpen, imageUrl, mediaAssets]);

  if (!isOpen || !diagnostic) return null;

  const handleTestHttp = async () => {
    if (!diagnostic.resolvedUrl || diagnostic.resolvedUrl.startsWith('data:')) {
      setHttpStatus('Inline Data URL (Self-contained, valid)');
      return;
    }
    setIsTesting(true);
    setHttpStatus('Pinging endpoint…');
    try {
      const res = await fetch(diagnostic.resolvedUrl, { method: 'HEAD' });
      setHttpStatus(`${res.status} ${res.statusText} (${res.headers.get('content-type') || 'unknown type'})`);
    } catch (err) {
      setHttpStatus(`Network Error: ${err instanceof Error ? err.message : 'Failed to reach URL'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyReport = () => {
    const report = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        inputUrl: diagnostic.originalInput,
        resolvedUrl: diagnostic.resolvedUrl,
        assetSource: diagnostic.assetSource,
        matchedAsset: diagnostic.matchedAsset,
        storageKey: diagnostic.storageKey,
        reason: diagnostic.reason,
        status: diagnostic.status,
        testHttpStatus: httpStatus,
        recentDiagnosticHistory: window.__IMAGE_DIAGNOSTICS_LOG__?.slice(0, 10) || [],
      },
      null,
      2
    );
    void navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{title}</h2>
              <p className="text-[11px] text-stone-400">Real-time image resolution & pipeline telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview and Resolution Overview */}
        <div className="flex gap-4 items-start bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700 flex items-center justify-center relative">
            {diagnostic.resolvedUrl ? (
              <img
                src={diagnostic.resolvedUrl}
                alt="Diagnostics preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-stone-500" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  diagnostic.assetSource === 'fallback'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {diagnostic.assetSource}
              </span>
              {diagnostic.matchedAsset ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Catalog Matched
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Direct Path
                </span>
              )}
            </div>
            <p className="text-xs text-stone-300 font-medium leading-relaxed">{diagnostic.reason}</p>
            {diagnostic.storageKey && (
              <p className="text-[11px] text-stone-400 font-mono truncate">Key: {diagnostic.storageKey}</p>
            )}
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-stone-800/40 rounded-xl border border-stone-800 space-y-1.5 font-mono">
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-400 shrink-0 font-sans">Input URL:</span>
              <span className="text-stone-200 truncate text-right text-[11px]">
                {diagnostic.originalInput || 'None / Undefined'}
              </span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-400 shrink-0 font-sans">Resolved Endpoint:</span>
              <span className="text-orange-300 truncate text-right text-[11px]">
                {diagnostic.resolvedUrl}
              </span>
            </div>
            {httpStatus && (
              <div className="flex justify-between items-start gap-2 pt-1 border-t border-stone-700/50">
                <span className="text-stone-400 shrink-0 font-sans">Network Status:</span>
                <span className="text-emerald-300 text-right text-[11px] font-bold">{httpStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestHttp}
            disabled={isTesting}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test HTTP Status</span>
          </button>

          <div className="flex items-center gap-2">
            {diagnostic.resolvedUrl && !diagnostic.resolvedUrl.startsWith('data:') && (
              <a
                href={diagnostic.resolvedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open URL</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON Report' : 'Copy Diagnostic Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

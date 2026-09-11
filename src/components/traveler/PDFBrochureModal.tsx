import React, { useState } from 'react';
import { TourPackage } from '../../types/tour';
import { useTours } from '../../context/TourContext';
import { generateTourPDF } from '../../utils/pdfGenerator';
import {
  X,
  Download,
  Printer,
  FileText,
  Sparkles,
  CheckCircle2,
  Building,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface PDFBrochureModalProps {
  pkg: TourPackage;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFBrochureModal: React.FC<PDFBrochureModalProps> = ({
  pkg,
  isOpen,
  onClose,
}) => {
  const { agencySettings } = useTours();
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('3_star');

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      await generateTourPDF(pkg, agencySettings, (msg) => setStatusMsg(msg));
      setTimeout(() => {
        setIsGenerating(false);
        setStatusMsg('');
      }, 1000);
    } catch (err) {
      console.error('PDF generation error', err);
      setIsGenerating(false);
      setStatusMsg('Failed to generate PDF. Please try browser print.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 relative">
        {/* Modal Header Bar */}
        <div className="bg-white text-slate-900 p-4 sm:p-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  Official Luxury PDF Brochure
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                  {agencySettings.agencyName || 'Bhakti Sathi'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {pkg.title} ({pkg.durationDays}D / {pkg.durationNights}N)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer hidden sm:flex"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMsg || 'Creating PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Brochure</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brochure Live Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-6">
            {/* Top Brand Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 border-b-2 border-brand gap-4">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-brand block mb-1">
                  EXCLUSIVE TOUR BROCHURE
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {agencySettings.agencyName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {agencySettings.tagline}
                </p>
              </div>

              <div className="text-xs text-slate-600 sm:text-right space-y-0.5">
                <div className="font-semibold text-slate-800">
                  Helpline: <strong>{agencySettings.phone}</strong>
                </div>
                <div>WhatsApp: {agencySettings.whatsapp}</div>
                <div>Email: {agencySettings.email}</div>
              </div>
            </div>

            {/* Banner Cover & Title */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {pkg.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand text-white">
                        {pkg.badge}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {pkg.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {pkg.tourType}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {pkg.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pkg.tagline}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">DURATION</span>
                      <strong className="text-slate-900">{pkg.durationDays}D / {pkg.durationNights}N</strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">DESTINATION</span>
                      <strong className="text-slate-900 truncate block">{pkg.destination}</strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">GROUP SIZE</span>
                      <strong className="text-slate-900 truncate block">{pkg.groupSizeLimit}</strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">BEST SEASON</span>
                      <strong className="text-slate-900 truncate block">{pkg.bestTimeToVisit}</strong>
                    </div>
                  </div>
                </div>

                {/* Price on Request Callout Box */}
                <div className="bg-white text-slate-900 rounded-xl p-4 sm:p-5 text-center min-w-[190px] border-2 border-brand shadow-xs">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    OFFICIAL QUOTE
                  </span>
                  <div className="text-lg sm:text-xl font-black text-brand my-1">
                    Price on Request
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Customized to your travel dates, group size & hotel category
                  </p>
                </div>
              </div>
            </div>

            {/* Tour Overview */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-2">
              <span className="font-extrabold text-brand uppercase text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Tour Overview & Experience Highlights
              </span>
              <p className="text-slate-700 leading-relaxed">
                {pkg.overview}
              </p>
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-800 font-semibold">
                <span>Start Location: <strong>{pkg.startLocation}</strong></span>
                <span>End Location: <strong>{pkg.endLocation}</strong></span>
              </div>
            </div>

            {/* Day-Wise Itinerary */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand" />
                  Day-Wise Detailed Itinerary ({pkg.durationDays} Days)
                </h3>
              </div>

              <div className="space-y-3">
                {pkg.itinerary.map((day) => (
                  <div
                    key={day.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-brand text-white font-extrabold text-[10px] uppercase">
                          Day {day.dayNumber}
                        </span>
                        <strong className="text-slate-900 text-xs sm:text-sm font-bold">
                          {day.title}
                        </strong>
                      </div>
                      <span className="text-slate-500 font-medium text-[11px]">
                        📍 {day.location}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-xs">
                      {day.description}
                    </p>

                    {day.activities && day.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {day.activities.map((act, i) => (
                          <span
                            key={i}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium"
                          >
                            ✦ {act}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      {day.stayHotel ? (
                        <span>
                          <strong>Hotel:</strong> {day.stayHotel}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      {day.meals && day.meals.length > 0 && (
                        <span>
                          <strong>Meals:</strong> {day.meals.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-emerald-200 rounded-2xl">
                <h4 className="text-xs font-black text-emerald-900 uppercase mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What is Included
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-white border border-rose-200 rounded-2xl">
                <h4 className="text-xs font-black text-rose-900 uppercase mb-2.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  What is Excluded
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">✗</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hotel Stays */}
            {pkg.hotels.length > 0 && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-brand" />
                  Verified Star Accommodations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.hotels.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {h.name} <span className="text-brand">{'★'.repeat(h.starRating)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {h.location} • {h.roomType}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-md">
                        {h.nights}N
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                <strong className="text-slate-900 font-bold">{agencySettings.agencyName}</strong> • {agencySettings.address}
              </div>
              <div className="text-brand font-bold">
                Helpline: {agencySettings.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="bg-white p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official verified document generated by {agencySettings.agencyName}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMsg || 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

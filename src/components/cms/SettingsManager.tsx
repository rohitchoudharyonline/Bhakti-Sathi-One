import React, { useState } from 'react';
import { useTours } from '../../context/TourContext';
import { AgencySettings } from '../../types/tour';
import {
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { agencySettings, updateAgencySettings, packages, resetToDefaults } = useTours();

  const [form, setForm] = useState<AgencySettings>(agencySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencySettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(packages, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `choudhary-vacations-packages-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem('hh_tour_packages_v1', JSON.stringify(parsed));
          window.location.reload();
        } else {
          setImportStatus('Invalid package JSON format');
        }
      } catch {
        setImportStatus('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand" />
              Travel Agency Branding & Contact Profile
            </h3>
            <p className="text-xs text-slate-500">
              This information is reflected on the frontend navigation, PDF brochures, WhatsApp redirect links, and tour inquiry confirmations
            </p>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Agency Name *
              </label>
              <input
                type="text"
                required
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Helpline / Phone *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                WhatsApp Business Number (with country code) *
              </label>
              <input
                type="text"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Agency Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Default Currency Symbol
              </label>
              <input
                type="text"
                required
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Sacred Dashboard Mantra / Invocational Blessing
              </label>
              <input
                type="text"
                value={form.sacredMantra || ''}
                onChange={(e) => setForm({ ...form, sacredMantra: e.target.value })}
                placeholder="e.g. साम्ब सदाशिव"
                className="w-full text-xs font-bold text-amber-700 bg-amber-50/50 border border-amber-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Office Address / Location
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Agency Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Sample Data Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-600" />
          Catalog Backup & Data Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Export Packages Backup</h4>
            <p className="text-[11px] text-slate-500">
              Download complete tour packages JSON file including day-wise itineraries and hotel stays.
            </p>
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Import Packages JSON</h4>
            <p className="text-[11px] text-slate-500">
              Upload a previously exported tour catalog JSON file to restore packages.
            </p>
            <label className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
            {importStatus && <p className="text-[10px] text-rose-600 font-bold">{importStatus}</p>}
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
            <h4 className="text-xs font-bold text-rose-900">Reset Demo Catalog</h4>
            <p className="text-[11px] text-rose-700">
              Restore the 6 rich sample packages (Kashmir, Bali, Swiss, Dubai, Kerala, Vietnam).
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset catalog to 6 default sample packages?')) {
                  resetToDefaults();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

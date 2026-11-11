import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download, RefreshCw, Search, Users, UserPlus, Phone, Mail, MapPin,
  CalendarDays, MessageCircle, Trash2, CheckCircle2, Clock3, XCircle,
  ShieldCheck, Loader2, AlertCircle, Filter,
} from 'lucide-react';

type WebsiteLead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  destination: string;
  requirements: string;
  source: string;
  status: 'New' | 'Contacted' | 'Follow-up' | 'Converted' | 'Lost' | string;
  marketing_consent: number;
  created_at: string;
  updated_at: string;
};

const STATUSES = ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'] as const;

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '');
  return '"' + text.replace(/"/g, '""') + '"';
};

export const WebsiteLeadsManager: React.FC = () => {
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeads = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/cms/leads?limit=10000', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not load website enquiries.');
      setLeads(Array.isArray(data.leads) ? data.leads : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load website enquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadLeads(); }, [loadLeads]);

  const destinations = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.destination).filter(Boolean))).sort(),
    [leads]
  );
  const cities = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.city).filter(Boolean))).sort(),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== 'All' && lead.status !== statusFilter) return false;
      if (destinationFilter !== 'All' && lead.destination !== destinationFilter) return false;
      if (cityFilter !== 'All' && lead.city !== cityFilter) return false;
      if (!q) return true;
      return [lead.name, lead.phone, lead.email, lead.city, lead.destination, lead.requirements, lead.source]
        .some((value) => String(value || '').toLowerCase().includes(q));
    });
  }, [leads, search, statusFilter, destinationFilter, cityFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    today: leads.filter((lead) => new Date(lead.created_at).toDateString() === new Date().toDateString()).length,
    new: leads.filter((lead) => lead.status === 'New').length,
    converted: leads.filter((lead) => lead.status === 'Converted').length,
  }), [leads]);

  const updateStatus = async (lead: WebsiteLead, status: string) => {
    setUpdatingId(lead.id);
    setError('');
    try {
      const response = await fetch(`/api/cms/leads/${encodeURIComponent(lead.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not update lead status.');
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status, updated_at: new Date().toISOString() } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update lead status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteLead = async (lead: WebsiteLead) => {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`)) return;
    setUpdatingId(lead.id);
    setError('');
    try {
      const response = await fetch(`/api/cms/leads/${encodeURIComponent(lead.id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not delete enquiry.');
      setLeads((current) => current.filter((item) => item.id !== lead.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete enquiry.');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCsv = () => {
    const headers = ['Name', 'Phone / WhatsApp', 'Email', 'City', 'Destination', 'Requirements', 'Source', 'Status', 'Marketing Consent', 'Enquiry Date'];
    const rows = filteredLeads.map((lead) => [
      lead.name, lead.phone, lead.email, lead.city, lead.destination, lead.requirements,
      lead.source, lead.status, lead.marketing_consent ? 'Yes' : 'No', lead.created_at,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `holidays-hunt-website-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="space-y-5" id="website-leads-manager">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">Website Enquiries</h2>
          <p className="text-sm text-stone-500 mt-1">Customer callback requests saved directly from the website.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadLeads(true)} disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-bold disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={exportCsv} disabled={!filteredLeads.length}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-bold disabled:opacity-40">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {error && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Enquiries', value: stats.total, icon: Users, tone: 'text-stone-900' },
          { label: 'Received Today', value: stats.today, icon: CalendarDays, tone: 'text-blue-700' },
          { label: 'New Enquiries', value: stats.new, icon: UserPlus, tone: 'text-orange-600' },
          { label: 'Converted', value: stats.converted, icon: CheckCircle2, tone: 'text-emerald-700' },
        ].map((item) => {
          const Icon = item.icon;
          return <div key={item.label} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{item.label}</span><Icon className="w-4 h-4 text-stone-400" /></div>
            <div className={`text-2xl font-black mt-2 ${item.tone}`}>{item.value}</div>
          </div>;
        })}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email, city or destination..."
            className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm outline-none focus:border-orange-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="text-xs font-semibold text-stone-500">Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 block w-full rounded-xl border border-stone-200 bg-white p-2.5 text-sm text-stone-800">
              <option>All</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-stone-500">Destination
            <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)} className="mt-1 block w-full rounded-xl border border-stone-200 bg-white p-2.5 text-sm text-stone-800">
              <option>All</option>{destinations.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-stone-500">City
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="mt-1 block w-full rounded-xl border border-stone-200 bg-white p-2.5 text-sm text-stone-800">
              <option>All</option>{cities.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500"><span>{filteredLeads.length} of {leads.length} enquiries</span><span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Private CMS records</span></div>
      </div>

      {loading ? <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading enquiries...</div>
      : filteredLeads.length === 0 ? <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center"><MessageCircle className="w-9 h-9 text-stone-300 mx-auto mb-3" /><h3 className="font-bold text-stone-800">No website enquiries found</h3><p className="text-sm text-stone-500 mt-1">{leads.length ? 'Try changing your search or filters.' : 'New callback requests will appear here after customers submit the homepage form.'}</p></div>
      : <div className="space-y-3">
        {filteredLeads.map((lead) => (
          <article key={lead.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-stone-900">{lead.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-1 bg-stone-100 text-stone-600">{lead.status}</span>
                  {lead.marketing_consent === 1 && <span className="text-[10px] font-bold rounded-full px-2 py-1 bg-emerald-50 text-emerald-700">Marketing opted in</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 mt-3 text-sm text-stone-600">
                  <a href={`https://wa.me/${lead.phone.replace(/\\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-emerald-700"><MessageCircle className="w-4 h-4" />{lead.phone}</a>
                  {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 hover:text-stone-900"><Mail className="w-4 h-4" />{lead.email}</a>}
                  {lead.city && <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{lead.city}</span>}
                  {lead.destination && <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{lead.destination}</span>}
                  <span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4" />{formatDate(lead.created_at)}</span>
                </div>
                {lead.requirements && <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-700 whitespace-pre-wrap">{lead.requirements}</p>}
                <p className="text-[11px] text-stone-400 mt-2">Source: {lead.source || 'Website'} · ID: {lead.id}</p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0">
                <select aria-label={`Status for ${lead.name}`} value={lead.status} disabled={updatingId === lead.id}
                  onChange={(e) => void updateStatus(lead, e.target.value)}
                  className="min-w-32 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-bold text-stone-700 disabled:opacity-50">
                  {STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => void deleteLead(lead)} disabled={updatingId === lead.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">
                  {updatingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>}
      <p className="text-[11px] text-stone-400">Enquiries are stored in the site's Cloudflare D1 database. CSV export includes only the records currently matching your filters.</p>
    </div>
  );
};

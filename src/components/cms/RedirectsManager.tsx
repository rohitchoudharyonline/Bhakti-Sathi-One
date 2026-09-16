import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Globe,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { RedirectRule } from '../../types/cms';

export const RedirectsManager: React.FC = () => {
  const [rules, setRules] = useState<RedirectRule[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // New rule form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [notes, setNotes] = useState('');
  const [statusCode, setStatusCode] = useState<301 | 302>(301);
  const [saving, setSaving] = useState(false);

  // Live URL Tester
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{
    matches: boolean;
    statusCode: number;
    targetUrl: string;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/redirects');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
        setTotalHits(data.totalHits || 0);
      }
    } catch (err) {
      console.error('Failed to load redirects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPath: fromPath.trim(),
          toPath: toPath.trim(),
          notes: notes.trim(),
          statusCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRules((prev) => [data.rule, ...prev]);
        setShowAddModal(false);
        setFromPath('');
        setToPath('');
        setNotes('');
        setNotice(`301 Redirect rule created for "${fromPath.trim()}"`);
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create redirect rule:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string, pathLabel: string) => {
    try {
      const res = await fetch(`/api/redirects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== id));
        setNotice(`Redirect rule for "${pathLabel}" removed.`);
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete redirect rule:', err);
    }
  };

  const handleTestRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;
    try {
      setTesting(true);
      const res = await fetch('/api/redirects/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err) {
      console.error('Failed to test redirect:', err);
    } finally {
      setTesting(false);
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.fromPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.toPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* SEO Migration Health Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Domain Migration Guard Active
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF4B00]/20 text-[#FF4B00] border border-[#FF4B00]/30 text-xs font-black">
                100% PageRank Transfer
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              301 Permanent Redirects & Legacy URL Protection
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              When shifting your site to <strong className="text-white">holidayshunt.com</strong>, legacy incoming URLs, bookmarked links, and search queries from <strong className="text-stone-200">mybhaktisathi.com</strong> receive an immediate HTTP 301 Permanent Redirect. This guarantees Google bot and visitors pass full ranking equity with zero 404 errors or search penalties.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-800">
            <div className="text-left sm:text-right">
              <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">Traffic Protected</div>
              <div className="text-2xl sm:text-3xl font-black text-[#FF4B00]">{totalHits} Hits</div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF4B00] text-white text-xs font-extrabold rounded-xl hover:bg-[#e04200] transition shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Add 301 Redirect Rule
            </button>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-800/80 text-xs">
          <div className="flex items-center gap-2.5 bg-stone-800/50 p-2.5 rounded-xl">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Domain-Level 301</div>
              <div className="text-stone-400 font-mono text-[11px]">mybhaktisathi.com → holidayshunt.com</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-stone-800/50 p-2.5 rounded-xl">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Extension Normalizer</div>
              <div className="text-stone-400 text-[11px]">Auto-strips .html &amp; .php into clean routes</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-stone-800/50 p-2.5 rounded-xl">
            <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Search Sitemap Declared</div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 underline font-mono text-[11px] hover:text-white"
              >
                /sitemap.xml &amp; /robots.txt
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive URL Redirect Tester */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <h4 className="text-sm font-black text-stone-900 flex items-center gap-2 mb-1">
          <RefreshCw className="w-4 h-4 text-[#FF4B00]" />
          Instant 301 Redirect Tester
        </h4>
        <p className="text-stone-500 text-xs mb-3">
          Paste any old URL path or full link (e.g. <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">/vaishno-devi-tour.html</code> or <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">/packages/kashmir</code>) to test how the server redirects Googlebot.
        </p>

        <form onSubmit={handleTestRedirect} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="e.g. /vaishno-devi-helicopter.html or /himachal-devi-darshan"
            className="flex-1 px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00] font-mono text-xs"
          />
          <button
            type="submit"
            disabled={testing || !testUrl.trim()}
            className="px-5 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {testing ? 'Testing...' : 'Test 301 Redirect'}
          </button>
        </form>

        {testResult && (
          <div
            className={`mt-3 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
              testResult.matches
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            {testResult.matches ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>Status: HTTP {testResult.statusCode} (Permanent Redirect)</span>
                {testResult.matches && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black">
                    Rank Protected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="line-through text-stone-500">{testUrl}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                <strong className="text-emerald-700 font-bold">{testResult.targetUrl}</strong>
              </div>
              <p className="text-[11px] text-stone-600">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table & Controls */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-[#FF4B00]" />
              Active 301 Redirect Rules ({filteredRules.length})
            </h4>
            <p className="text-stone-500 text-xs mt-0.5">
              Rules are evaluated on incoming requests before static assets.
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter rules or paths..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00]"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Old / Legacy URL (Source)</th>
                <th className="p-3.5">Target Canonical Path</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">SEO Traffic Saved</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400 font-medium">
                    No redirect rules found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 pl-5 font-mono text-stone-900 font-semibold max-w-xs truncate">
                      {rule.fromPath}
                    </td>
                    <td className="p-3.5 font-mono text-[#FF4B00] font-bold max-w-xs truncate">
                      {rule.toPath}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        301 Permanent
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">
                      {rule.hits || 0} visits
                    </td>
                    <td className="p-3.5 text-stone-500 max-w-xs truncate">
                      {rule.notes || '—'}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id, rule.fromPath)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-3 p-4 md:hidden divide-y divide-stone-100">
          {filteredRules.map((rule) => (
            <div key={`m-${rule.id}`} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  HTTP 301 Permanent
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {rule.hits || 0} visits
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-stone-600 line-through truncate">{rule.fromPath}</div>
                <div className="flex items-center gap-1.5 text-[#FF4B00] font-bold truncate">
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  <span>{rule.toPath}</span>
                </div>
              </div>
              {rule.notes && (
                <div className="text-[11px] text-stone-500">{rule.notes}</div>
              )}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id, rule.fromPath)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-lg font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add 301 Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Add 301 Permanent Redirect Rule</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Protects Google search ranking by permanently redirecting an old URL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Old Legacy Path / URL (Source) *
                </label>
                <input
                  type="text"
                  required
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                  placeholder="/old-kashmir-tour.html or /packages/vaishno-devi"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00] font-mono text-xs"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Exact path or legacy file name from your previous website.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  New Target Path on Holidays Hunt *
                </label>
                <input
                  type="text"
                  required
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  placeholder="/tours/kashmir-paradise-luxury-houseboat or /tours"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00] font-mono text-xs"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  The new live canonical destination where PageRank should be passed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Redirect Status Code
                </label>
                <select
                  value={statusCode}
                  onChange={(e) => setStatusCode(Number(e.target.value) as 301 | 302)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00] font-medium"
                >
                  <option value={301}>301 - Permanent Redirect (Recommended: Passes 100% SEO Equity)</option>
                  <option value={302}>302 - Temporary Redirect (Does not transfer PageRank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes / Keyword Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Preserves high-ranking Google query for Vaishno Devi packages"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FF4B00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !fromPath.trim() || !toPath.trim()}
                  className="px-5 py-2 bg-[#FF4B00] text-white text-xs font-bold rounded-xl hover:bg-[#e04200] transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {saving ? 'Creating Rule...' : 'Save 301 Redirect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

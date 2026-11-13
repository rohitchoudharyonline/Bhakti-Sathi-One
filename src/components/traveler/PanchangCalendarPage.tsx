import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  MapPin,
  MoonStar,
  RefreshCw,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import {
  CITY_OPTIONS,
  PanchangDay,
  PanchangView,
  formatLongDate,
  formatShortDate,
  getFiveYearRange,
  getMonthDays,
  getWeekDays,
  monthLabel,
  parseDateKey,
  toDateKey,
  fetchPanchang,
} from '../../data/panchangData';
import { generatePanchangPdf } from '../../utils/panchangPdfExport';

const VIEW_OPTIONS: { id: PanchangView; label: string; icon: React.ElementType; sub: string }[] = [
  { id: 'daily', label: 'Daily', icon: Sun, sub: 'Today at a glance' },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays, sub: '7-day rhythm' },
  { id: 'monthly', label: 'Monthly', icon: MoonStar, sub: 'Calendar view' },
  { id: 'yearly', label: 'Yearly', icon: Sparkles, sub: '12-month overview' },
  { id: 'extra', label: 'Extra', icon: Clock3, sub: 'Muhurat & timings' },
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FieldCard: React.FC<{ label: string; value?: string; icon: React.ElementType; accent?: string }> = ({ label, value, icon: Icon, accent = 'text-brand-orange' }) => (
  <div className="rounded-2xl border border-[#EEE4DD] bg-white p-4 shadow-[0_8px_28px_rgba(60,35,20,0.045)]">
    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-stone-400">
      <Icon className={`w-3.5 h-3.5 ${accent}`} /> {label}
    </div>
    <div className="mt-2 text-base sm:text-lg font-black text-stone-900 leading-tight">{value || '—'}</div>
  </div>
);

const MiniDayCard: React.FC<{ date: string; active: boolean; today: boolean; title?: string; subtitle?: string; onClick: () => void }> = ({ date, active, today, title, subtitle, onClick }) => {
  const parsed = parseDateKey(date);
  return (
    <button type="button" onClick={onClick} className={`text-left rounded-2xl border p-3 transition-all cursor-pointer ${active ? 'border-brand-orange bg-[#FDF2F2] shadow-[0_8px_22px_rgba(155, 0, 0,0.12)]' : 'border-[#EEE6E1] bg-white hover:border-brand-orange/35 hover:-translate-y-0.5'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-[0.15em] font-black text-stone-400">{parsed.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        {today && <span className="rounded-full bg-brand-orange text-white px-1.5 py-0.5 text-[7px] font-black">TODAY</span>}
      </div>
      <div className="mt-1 text-xl font-black text-stone-900">{parsed.getDate()}</div>
      <div className="text-[10px] font-bold text-stone-400">{parsed.toLocaleDateString('en-IN', { month: 'short' })}</div>
      {title && <div className="mt-2 text-[10px] font-black text-stone-700 truncate">{title}</div>}
      {subtitle && <div className="mt-0.5 text-[9px] font-semibold text-stone-400 truncate">{subtitle}</div>}
    </button>
  );
};

export const PanchangCalendarPage: React.FC = () => {
  const years = useMemo(() => getFiveYearRange(), []);
  const todayKey = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [cityId, setCityId] = useState('delhi');
  const [view, setView] = useState<PanchangView>('daily');
  const [panchang, setPanchang] = useState<PanchangDay | null>(null);
  const [weekData, setWeekData] = useState<Record<string, PanchangDay>>({});
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(false);
  const [error, setError] = useState('');

  const city = CITY_OPTIONS.find((item) => item.id === cityId) || CITY_OPTIONS[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPanchang(selectedDate, city)
      .then((data) => { if (!cancelled) setPanchang(data); })
      .catch(() => { if (!cancelled) setError('Panchang data could not be loaded. Please retry.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDate, cityId]);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  useEffect(() => {
    if (view !== 'weekly') return;
    let cancelled = false;
    setWeekLoading(true);
    Promise.all(weekDays.map((day) => fetchPanchang(day.date, city).then((data) => [day.date, data] as const).catch(() => null)))
      .then((items) => {
        if (cancelled) return;
        const next: Record<string, PanchangDay> = {};
        items.forEach((item) => { if (item) next[item[0]] = item[1]; });
        setWeekData(next);
      })
      .finally(() => { if (!cancelled) setWeekLoading(false); });
    return () => { cancelled = true; };
  }, [view, selectedDate, cityId]);

  const monthDays = useMemo(() => getMonthDays(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
  const monthOffset = monthDays[0]?.weekday || 0;
  const selectedYearMonths = useMemo(() => Array.from({ length: 12 }, (_, month) => ({ month, days: getMonthDays(selectedYear, month).length })), [selectedYear]);

  const selectDate = (date: string) => {
    const parsed = parseDateKey(date);
    setSelectedDate(date);
    setSelectedYear(parsed.getFullYear());
    setSelectedMonth(parsed.getMonth());
  };

  const moveMonth = (delta: number) => {
    const next = new Date(selectedYear, selectedMonth + delta, 1);
    setSelectedYear(next.getFullYear());
    setSelectedMonth(next.getMonth());
    selectDate(toDateKey(new Date(next.getFullYear(), next.getMonth(), Math.min(parseDateKey(selectedDate).getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))));
  };

  const moveYear = (delta: number) => {
    const index = years.indexOf(selectedYear);
    const nextIndex = Math.min(years.length - 1, Math.max(0, index + delta));
    const nextYear = years[nextIndex] ?? selectedYear;
    setSelectedYear(nextYear);
    const day = Math.min(parseDateKey(selectedDate).getDate(), new Date(nextYear, selectedMonth + 1, 0).getDate());
    selectDate(toDateKey(new Date(nextYear, selectedMonth, day)));
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = () => {
    if (!panchang) return;
    void generatePanchangPdf({ panchang, cityLabel: city.label, agencyName: 'Holidays Hunt' });
  };

  const selectedDateLabel = formatLongDate(selectedDate);

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-[#181818] pb-20">
      <header className="sticky top-0 z-40 border-b border-[#EEE7E2] bg-white/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto min-h-[68px] px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <button type="button" onClick={handleBack} className="w-10 h-10 shrink-0 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-brand-orange hover:border-brand-orange/30 transition flex items-center justify-center cursor-pointer" aria-label="Back to home"><ArrowLeft className="w-5 h-5" /></button>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-[0.22em] font-black text-brand-orange">Holidays Hunt • Sacred Calendar</div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">Panchang Calendar</h1>
          </div>
          <button type="button" onClick={handleDownload} disabled={!panchang || loading} className="inline-flex items-center gap-2 rounded-xl bg-brand-orange text-white px-3 sm:px-4 py-2.5 text-[10px] font-black shadow-[0_8px_20px_rgba(155, 0, 0,0.18)] hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer" title="Download one-page Panchang PDF"><Download className="w-4 h-4" /><span className="hidden sm:inline">Download PDF</span></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        <section className="relative overflow-hidden rounded-[28px] bg-white border border-[#EEE5DF] shadow-[0_18px_55px_rgba(60,35,20,0.06)] p-4 sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-orange via-[#FFB000] to-brand-orange" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF2F2] border border-[#F2C6C6] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-brand-orange"><Sparkles className="w-3.5 h-3.5" /> 5-year calendar</div>
              <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight">Plan your sacred days with clarity.</h2>
              <p className="mt-2 max-w-2xl text-sm text-stone-500 leading-relaxed">A clean Vedic calendar with pre-filled dates for {years[0]}–{years[years.length - 1]}, location-aware Panchang details, auspicious timings and a beautiful printable daily report.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <label className="relative flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-700"><MapPin className="w-4 h-4 text-brand-orange" /><select value={cityId} onChange={(event) => setCityId(event.target.value)} className="bg-transparent outline-none cursor-pointer"><option value="delhi">New Delhi</option><option value="varanasi">Varanasi</option><option value="jammu">Jammu</option><option value="haridwar">Haridwar</option><option value="mathura">Mathura</option><option value="ayodhya">Ayodhya</option></select></label>
              <button type="button" onClick={() => selectDate(todayKey)} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-black text-stone-600 hover:border-brand-orange/30 hover:text-brand-orange transition cursor-pointer">Today</button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#EEE5DF] bg-white p-1.5 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex min-w-max gap-1">
            {VIEW_OPTIONS.map(({ id, label, icon: Icon, sub }) => (
              <button key={id} type="button" onClick={() => setView(id)} className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left transition cursor-pointer ${view === id ? 'bg-brand-orange text-white shadow-[0_8px_20px_rgba(155, 0, 0,0.16)]' : 'text-stone-500 hover:bg-[#FDF3F3]'}`}>
                <Icon className="w-4 h-4" />
                <span><span className="block text-xs font-black">{label}</span><span className={`block text-[8px] mt-0.5 ${view === id ? 'text-red-100' : 'text-stone-400'}`}>{sub}</span></span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#EEE5DF] bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-brand-orange" /><span className="text-xs font-black text-stone-800">{selectedDateLabel}</span><span className="hidden sm:inline text-[10px] text-stone-400">• {city.label}</span></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => view === 'yearly' ? moveYear(-1) : moveMonth(-1)} className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:text-brand-orange hover:border-brand-orange/30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <select value={selectedYear} onChange={(event) => { const year = Number(event.target.value); const date = parseDateKey(selectedDate); selectDate(toDateKey(new Date(year, selectedMonth, Math.min(date.getDate(), new Date(year, selectedMonth + 1, 0).getDate())))); }} className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-black outline-none cursor-pointer">{years.map((year) => <option key={year}>{year}</option>)}</select>
            <button type="button" onClick={() => view === 'yearly' ? moveYear(1) : moveMonth(1)} className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:text-brand-orange hover:border-brand-orange/30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </section>

        {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 flex items-center justify-between gap-3"><span>{error}</span><button type="button" onClick={() => selectDate(selectedDate)} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-3 py-1.5 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Retry</button></div>}

        {view === 'daily' && (
          <section className="mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FieldCard label="Tithi" value={loading ? 'Loading…' : panchang?.tithi.name} icon={MoonStar} />
              <FieldCard label="Nakshatra" value={loading ? 'Loading…' : panchang?.nakshatra.name} icon={Sparkles} accent="text-amber-600" />
              <FieldCard label="Yoga" value={loading ? 'Loading…' : panchang?.yoga.name} icon={Sun} accent="text-[#9b0000]" />
              <FieldCard label="Karana" value={loading ? 'Loading…' : panchang?.karana.name} icon={CalendarDays} accent="text-amber-700" />
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FieldCard label="Sunrise" value={panchang?.sun.sunrise} icon={Sunrise} accent="text-[#9b0000]" />
              <FieldCard label="Sunset" value={panchang?.sun.sunset} icon={Sunset} accent="text-rose-500" />
              <FieldCard label="Vara" value={panchang?.vara.name} icon={CalendarDays} accent="text-stone-600" />
            </div>
          </section>
        )}

        {view === 'weekly' && (
          <section className="mt-5">
            <div className="mb-3 flex items-end justify-between"><div><div className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-orange">Seven day rhythm</div><h2 className="text-xl font-black mt-1">This week</h2></div>{weekLoading && <span className="text-[10px] font-bold text-stone-400">Loading Panchang…</span>}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {weekDays.map((day) => <MiniDayCard key={day.date} date={day.date} active={day.date === selectedDate} today={day.isToday} title={weekData[day.date]?.tithi.name} subtitle={weekData[day.date]?.nakshatra.name} onClick={() => selectDate(day.date)} />)}
            </div>
            {panchang && <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"><FieldCard label="Selected Tithi" value={panchang.tithi.name} icon={MoonStar} /><FieldCard label="Nakshatra" value={panchang.nakshatra.name} icon={Sparkles} accent="text-amber-600" /><FieldCard label="Sunrise" value={panchang.sun.sunrise} icon={Sunrise} accent="text-[#9b0000]" /><FieldCard label="Sunset" value={panchang.sun.sunset} icon={Sunset} accent="text-rose-500" /></div>}
          </section>
        )}

        {view === 'monthly' && (
          <section className="mt-5 rounded-[24px] border border-[#EEE5DF] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-5"><div><div className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-orange">Monthly calendar</div><h2 className="text-xl font-black mt-1">{monthLabel(selectedYear, selectedMonth)}</h2></div><select value={selectedMonth} onChange={(event) => { const month = Number(event.target.value); setSelectedMonth(month); const day = Math.min(parseDateKey(selectedDate).getDate(), getMonthDays(selectedYear, month).length); selectDate(toDateKey(new Date(selectedYear, month, Math.max(1, day)))); }} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-black outline-none cursor-pointer">{Array.from({ length: 12 }, (_, month) => <option key={month} value={month}>{new Date(selectedYear, month, 1).toLocaleDateString('en-IN', { month: 'long' })}</option>)}</select></div>
            <div className="grid grid-cols-7 gap-1.5 mb-2">{weekdays.map((day) => <div key={day} className="text-center text-[8px] uppercase tracking-wider font-black text-stone-400 py-2">{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: monthOffset }, (_, index) => <div key={`blank-${index}`} className="min-h-[58px] sm:min-h-[72px]" />)}
              {monthDays.map((day) => <button key={day.date} type="button" onClick={() => selectDate(day.date)} className={`min-h-[58px] sm:min-h-[72px] rounded-xl border p-2 text-left transition cursor-pointer ${selectedDate === day.date ? 'border-brand-orange bg-[#FDF2F2] shadow-[0_5px_14px_rgba(155, 0, 0,0.12)]' : day.isToday ? 'border-[#F5C2C2] bg-[#FDF6F6]' : 'border-[#F0E9E4] bg-[#FFFEFD] hover:border-brand-orange/30'}`}><div className="flex items-center justify-between"><span className={`text-sm font-black ${day.isToday ? 'text-brand-orange' : 'text-stone-800'}`}>{day.day}</span>{day.isToday && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />}</div><div className="hidden sm:block mt-3 text-[8px] font-bold text-stone-400">{day.date}</div></button>)}
            </div>
          </section>
        )}

        {view === 'yearly' && (
          <section className="mt-5">
            <div className="rounded-[24px] border border-[#EEE5DF] bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5"><div><div className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-orange">Year overview</div><h2 className="text-2xl font-black mt-1">{selectedYear} Panchang calendar</h2></div><div className="text-[10px] font-bold text-stone-400">{selectedYearMonths.reduce((sum, item) => sum + item.days, 0)} pre-filled calendar days</div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {selectedYearMonths.map(({ month, days }) => <button key={month} type="button" onClick={() => { setSelectedMonth(month); selectDate(toDateKey(new Date(selectedYear, month, 1))); setView('monthly'); }} className="group rounded-2xl border border-[#EEE6E1] bg-[#FFFEFD] p-4 text-left hover:border-brand-orange/35 hover:-translate-y-0.5 transition cursor-pointer"><div className="flex items-center justify-between"><span className="text-sm font-black text-stone-900">{new Date(selectedYear, month, 1).toLocaleDateString('en-IN', { month: 'long' })}</span><ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-brand-orange" /></div><div className="mt-3 flex items-center gap-2"><span className="rounded-full bg-[#FDF2F2] px-2 py-1 text-[8px] font-black text-brand-orange">{days} days</span><span className="text-[9px] font-bold text-stone-400">Open calendar</span></div></button>)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">{years.map((year) => <button key={year} type="button" onClick={() => { setSelectedYear(year); setView('yearly'); }} className={`rounded-2xl border p-4 text-left transition cursor-pointer ${selectedYear === year ? 'border-brand-orange bg-[#FDF2F2]' : 'border-[#EEE6E1] bg-white hover:border-brand-orange/30'}`}><div className="text-2xl font-black">{year}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-stone-400">Full year calendar</div></button>)}</div>
          </section>
        )}

        {view === 'extra' && (
          <section className="mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <FieldCard label="Rahu Kalam" value={panchang?.muhurta.rahuKalam} icon={Clock3} accent="text-red-500" />
              <FieldCard label="Yamagandam" value={panchang?.muhurta.yamagandam} icon={Clock3} accent="text-violet-600" />
              <FieldCard label="Abhijit Muhurtam" value={panchang?.muhurta.abhijit} icon={Sparkles} accent="text-emerald-600" />
              <FieldCard label="Sunrise" value={panchang?.sun.sunrise} icon={Sunrise} accent="text-[#9b0000]" />
              <FieldCard label="Noon" value={panchang?.sun.noon} icon={Sun} accent="text-amber-600" />
              <FieldCard label="Sunset" value={panchang?.sun.sunset} icon={Sunset} accent="text-rose-500" />
            </div>
            <div className="mt-4 rounded-[24px] border border-[#EEE5DF] bg-white p-5 shadow-sm"><div className="text-[9px] uppercase tracking-[0.18em] font-black text-brand-orange">Panchang essentials</div><h2 className="mt-1 text-xl font-black">Five limbs of the day</h2><div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5"><div className="rounded-xl bg-[#FDF5F5] p-3"><div className="text-[8px] font-black text-stone-400">TITHI</div><div className="mt-1 text-xs font-black">{panchang?.tithi.name || '—'}</div></div><div className="rounded-xl bg-[#FDF5F5] p-3"><div className="text-[8px] font-black text-stone-400">NAKSHATRA</div><div className="mt-1 text-xs font-black">{panchang?.nakshatra.name || '—'}</div></div><div className="rounded-xl bg-[#FDF5F5] p-3"><div className="text-[8px] font-black text-stone-400">YOGA</div><div className="mt-1 text-xs font-black">{panchang?.yoga.name || '—'}</div></div><div className="rounded-xl bg-[#FDF5F5] p-3"><div className="text-[8px] font-black text-stone-400">KARANA</div><div className="mt-1 text-xs font-black">{panchang?.karana.name || '—'}</div></div><div className="rounded-xl bg-[#FDF5F5] p-3"><div className="text-[8px] font-black text-stone-400">VARA</div><div className="mt-1 text-xs font-black">{panchang?.vara.name || '—'}</div></div></div></div>
          </section>
        )}

        {panchang && <section className="mt-6 rounded-2xl border border-[#F0DED2] bg-[#FDF5F5] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div className="text-[9px] font-bold text-stone-500">Data calculated for <span className="font-black text-stone-700">{city.label}</span> using Lahiri/Chitrapaksha where provided.</div><div className="text-[8px] font-black uppercase tracking-wider text-stone-400">{panchang.source || 'Panchang source'}</div></section>}
      </main>
    </div>
  );
};

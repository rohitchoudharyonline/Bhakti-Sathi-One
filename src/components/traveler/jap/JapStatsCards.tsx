import React from 'react';
import { JapSessionRecord, JapTimeframe } from '../../../types/japCounter';
import { Flame, CalendarDays, Layers3, Sparkles, Activity } from 'lucide-react';

interface JapStatsCardsProps {
  timeframe: JapTimeframe;
  setTimeframe: (tf: JapTimeframe) => void;
  totalChants: number;
  totalMalas: number;
  streakDays: number;
  todayChants: number;
  todayMalas: number;
  lifetimeChants: number;
  lifetimeMalas: number;
  records: JapSessionRecord[];
  activeMantra: string;
  onDownloadPdf: () => void;
}

export const JapStatsCards: React.FC<JapStatsCardsProps> = ({
  timeframe,
  setTimeframe,
  totalChants,
  totalMalas,
  streakDays,
  todayChants,
  todayMalas,
  lifetimeChants,
  lifetimeMalas,
  records,
}) => {
  const timeframeLabels: Record<JapTimeframe, string> = {
    daily: 'Today', weekly: 'This Week', monthly: 'This Month', yearly: 'This Year', lifetime: 'All-Time',
  };

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return { dateStr, dayName: d.toLocaleDateString('en-IN', { weekday: 'narrow' }), dayNumber: d.getDate(), isToday: i === 6 };
  });
  const dayTotals = recentDays.map((day) => ({ ...day, total: records.filter((r) => r.dateStr === day.dateStr).reduce((a, r) => a + r.beadCount, 0) }));
  const maxDayTotal = Math.max(...dayTotals.map((d) => d.total), 108);

  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl bg-white border border-stone-200 p-1.5 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {(['daily', 'weekly', 'monthly', 'yearly', 'lifetime'] as JapTimeframe[]).map((tf) => (
            <button key={tf} type="button" onClick={() => setTimeframe(tf)} className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition cursor-pointer ${timeframe === tf ? 'bg-brand-orange text-white shadow-[0_5px_14px_rgba(155, 0, 0,0.16)]' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
              {timeframeLabels[tf]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] text-white p-4 sm:p-5 shadow-[0_12px_30px_rgba(26,26,26,0.12)]">
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-brand-orange/15" />
          <div className="relative flex items-start justify-between gap-2"><div className="text-[9px] uppercase tracking-[0.16em] text-stone-400 font-black">{timeframeLabels[timeframe]} japa</div><Sparkles className="w-4 h-4 text-red-300 shrink-0" /></div>
          <div className="relative mt-4 text-2xl sm:text-3xl font-black font-mono tracking-tight">{totalChants.toLocaleString('en-IN')}</div>
          <div className="relative mt-1 text-[10px] text-red-200 font-medium">chants counted</div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 shadow-sm hover:border-brand-orange/25 transition">
          <div className="flex items-start justify-between gap-2"><div className="text-[9px] uppercase tracking-[0.16em] text-stone-400 font-black">Malas complete</div><div className="w-8 h-8 rounded-xl bg-brand-orange-light text-brand-orange grid place-items-center"><Layers3 className="w-4 h-4" /></div></div>
          <div className="mt-4 text-2xl sm:text-3xl font-black font-mono tracking-tight text-stone-900">{totalMalas}</div>
          <div className="mt-1 text-[10px] text-stone-500 font-medium">{totalMalas === 1 ? '1 mala' : `${totalMalas} malas`} · 108 beads each</div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 shadow-sm hover:border-brand-orange/25 transition">
          <div className="flex items-start justify-between gap-2"><div className="text-[9px] uppercase tracking-[0.16em] text-stone-400 font-black">Devotional streak</div><div className="w-8 h-8 rounded-xl bg-[#FDF2F2] text-brand-orange grid place-items-center"><Flame className="w-4 h-4" /></div></div>
          <div className="mt-4 text-2xl sm:text-3xl font-black font-mono tracking-tight text-brand-orange">{streakDays}</div>
          <div className="mt-1 text-[10px] text-stone-500 font-medium">{streakDays === 1 ? 'day of practice' : 'consecutive days'}</div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 shadow-sm hover:border-brand-orange/25 transition">
          <div className="flex items-start justify-between gap-2"><div className="text-[9px] uppercase tracking-[0.16em] text-stone-400 font-black">Lifetime</div><div className="w-8 h-8 rounded-xl bg-stone-50 text-stone-700 grid place-items-center"><Activity className="w-4 h-4" /></div></div>
          <div className="mt-4 text-xl sm:text-2xl font-black font-mono tracking-tight text-stone-900">{lifetimeChants.toLocaleString('en-IN')}</div>
          <div className="mt-1 text-[10px] text-brand-orange font-bold">{lifetimeMalas} {lifetimeMalas === 1 ? 'Mala' : 'Malas'} all-time</div>
        </div>
      </div>

      <div className="rounded-2xl sm:rounded-3xl bg-white border border-stone-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-xl bg-brand-orange-light text-brand-orange grid place-items-center"><CalendarDays className="w-4 h-4" /></div><div><h3 className="text-xs font-black text-stone-900">Your 7-day rhythm</h3><p className="text-[10px] text-stone-400 font-medium">Completed japa by day</p></div></div>
          <div className="rounded-full bg-stone-50 border border-stone-200 px-3 py-1.5 text-[10px] font-bold text-stone-500">Today <span className="text-brand-orange font-black font-mono ml-1">{todayChants.toLocaleString('en-IN')}</span> japs · {todayMalas} malas</div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-32">
          {dayTotals.map((day) => {
            const height = day.total > 0 ? Math.max(14, Math.round((day.total / maxDayTotal) * 100)) : 7;
            return (
              <div key={day.dateStr} className="h-full flex flex-col items-center justify-end gap-1.5">
                <span className="text-[9px] font-bold text-stone-400 font-mono">{day.total > 0 ? day.total.toLocaleString('en-IN') : '—'}</span>
                <div className="w-full max-w-[34px] h-20 rounded-xl bg-stone-100 overflow-hidden flex items-end">
                  <div className={`w-full rounded-xl transition-all duration-500 ${day.isToday ? 'bg-brand-orange shadow-[0_0_14px_rgba(155, 0, 0,0.24)]' : day.total > 0 ? 'bg-[#FFB000]' : 'bg-stone-200'}`} style={{ height: `${height}%` }} />
                </div>
                <div className={`text-[9px] font-black ${day.isToday ? 'text-brand-orange' : 'text-stone-400'}`}>{day.dayName}</div>
                <div className="text-[8px] text-stone-300 font-mono">{day.dayNumber}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

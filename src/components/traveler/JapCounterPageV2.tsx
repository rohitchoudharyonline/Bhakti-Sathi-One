import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Heart, Sparkles } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { Round108Mala } from './jap/Round108Mala';
import { JapStatsCards } from './jap/JapStatsCards';
import { MantraSelectorModal } from './jap/MantraSelectorModal';
import { DEFAULT_MANTRAS, JapSessionRecord, JapTimeframe } from '../../types/japCounter';
import { playBeadChime, playMalaCompleteChime, triggerHaptic } from '../../utils/japAudio';
import { generateJapSadhanaPdf } from '../../utils/japPdfExport';

const STORAGE_KEY = 'hh_jap_counter_data_v2';

export const JapCounterPageV2: React.FC = () => {
  const { navigateToHome, agencySettings, travelerUser } = useTours();
  const [currentBead, setCurrentBead] = useState(0);
  const [currentMalaRound, setCurrentMalaRound] = useState(0);
  const [activeMantra, setActiveMantra] = useState(() => agencySettings?.sacredMantra || 'साम्ब सदाशिव');
  const [targetMalaGoal, setTargetMalaGoal] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [records, setRecords] = useState<JapSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.records) ? parsed.records : [];
    } catch {
      return [];
    }
  });
  const [timeframe, setTimeframe] = useState<JapTimeframe>('daily');
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeMantra, records, soundEnabled, vibrationEnabled, targetMalaGoal }));
    } catch {
      // Local persistence is best-effort.
    }
  }, [activeMantra, records, soundEnabled, vibrationEnabled, targetMalaGoal]);

  const addCompletedMala = useCallback(() => {
    if (soundEnabled) playMalaCompleteChime();
    if (vibrationEnabled) triggerHaptic('malaComplete');

    setCurrentMalaRound((value) => value + 1);
    const now = new Date();
    setRecords((previous) => [{
      id: `jap-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: now.toISOString().split('T')[0],
      mantra: activeMantra,
      beadCount: 108,
      malasCompleted: 1,
      durationSeconds: Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000)),
    }, ...previous]);
  }, [activeMantra, sessionStartTime, soundEnabled, vibrationEnabled]);

  const handleIncrement = useCallback(() => {
    if (soundEnabled) playBeadChime();
    if (vibrationEnabled) triggerHaptic('bead');
    setCurrentBead((previous) => {
      const next = previous + 1;
      if (next === 108) {
        addCompletedMala();
        return 0;
      }
      return next;
    });
  }, [addCompletedMala, soundEnabled, vibrationEnabled]);

  const handleDecrement = useCallback(() => {
    setCurrentBead((previous) => Math.max(0, previous - 1));
  }, []);

  const handleResetMala = useCallback(() => {
    if (currentBead === 0) return;
    if (window.confirm('Reset current mala progress to 0 beads?')) setCurrentBead(0);
  }, [currentBead]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    if (timeframe === 'daily') {
      const today = now.toISOString().split('T')[0];
      return records.filter((record) => record.dateStr === today);
    }
    const days = timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : timeframe === 'yearly' ? 365 : Infinity;
    if (!Number.isFinite(days)) return records;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    return records.filter((record) => new Date(record.timestamp) >= cutoff);
  }, [records, timeframe]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((record) => record.dateStr === todayStr);
  const todayChants = todayRecords.reduce((sum, record) => sum + record.beadCount, 0) + currentBead;
  const todayMalas = todayRecords.reduce((sum, record) => sum + record.malasCompleted, 0);
  const totalChants = filteredRecords.reduce((sum, record) => sum + record.beadCount, 0) + (timeframe === 'daily' ? currentBead : 0);
  const totalMalas = filteredRecords.reduce((sum, record) => sum + record.malasCompleted, 0);
  const lifetimeChants = records.reduce((sum, record) => sum + record.beadCount, 0) + currentBead;
  const lifetimeMalas = records.reduce((sum, record) => sum + record.malasCompleted, 0);

  const streakDays = useMemo(() => {
    const uniqueDates = new Set(records.map((record) => record.dateStr));
    const activeToday = todayRecords.length > 0 || currentBead > 0;
    let count = 0;
    const cursor = new Date();
    if (!activeToday) cursor.setDate(cursor.getDate() - 1);
    while (uniqueDates.has(cursor.toISOString().split('T')[0])) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return activeToday ? Math.max(1, count) : count;
  }, [currentBead, records, todayRecords.length]);

  const handleDownloadPdf = () => {
    void generateJapSadhanaPdf({
      pilgrimName: travelerUser?.displayName || travelerUser?.name || 'Devoted Pilgrim',
      timeframe,
      totalChants,
      totalMalas,
      streakDays,
      activeMantra,
      records: filteredRecords,
      agencyName: agencySettings?.agencyName || 'Bhakti Sathi',
    });
  };

  const quickMantras = DEFAULT_MANTRAS.slice(0, 9);

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-[#181818] font-sans selection:bg-brand-orange selection:text-white pb-24 lg:pb-10">
      <header className="sticky top-0 z-40 border-b border-[#EEE7E2] bg-white/95 backdrop-blur-xl">
        <div className="h-[2px] w-full bg-[#FF4B00]" />
        <div className="max-w-6xl mx-auto h-[64px] px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
          <button type="button" onClick={navigateToHome} className="absolute left-4 sm:left-6 inline-flex items-center justify-center w-10 h-10 rounded-xl text-stone-500 hover:text-brand-orange hover:bg-brand-orange-light transition cursor-pointer" aria-label="Back to home"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Jap Counter</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <section className="mb-4 sm:mb-6 rounded-[24px] border border-[#F0E1D9] bg-white shadow-[0_10px_35px_rgba(60,35,20,0.05)] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div><div className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-orange">Choose your mantra</div><div className="text-sm font-black text-stone-900 mt-0.5">Sacred names for your japa</div></div>
            <button type="button" onClick={() => setIsMantraModalOpen(true)} className="shrink-0 rounded-xl bg-[#FFF4EE] border border-[#F5D6C8] px-3 py-2 text-[10px] font-black text-brand-orange hover:bg-[#FFE9E0] transition cursor-pointer">More</button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {quickMantras.map((mantra) => {
              const selected = activeMantra === mantra.name;
              return <button key={mantra.id} type="button" onClick={() => setActiveMantra(mantra.name)} className={`shrink-0 min-w-[118px] rounded-2xl border px-3 py-2.5 text-left transition cursor-pointer ${selected ? 'bg-brand-orange text-white border-brand-orange shadow-[0_7px_18px_rgba(255,75,0,0.18)]' : 'bg-[#FFFDFC] border-stone-200 text-stone-700 hover:border-brand-orange/35'}`}><div className={`text-xs font-serif font-black truncate ${selected ? 'text-white' : 'text-stone-900'}`}>{mantra.name}</div><div className={`text-[9px] font-bold mt-0.5 ${selected ? 'text-orange-100' : 'text-stone-400'}`}>{mantra.deity}</div></button>;
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-brand-orange font-serif font-bold text-sm"><Sparkles className="w-3.5 h-3.5" /> ॥ {activeMantra} ॥ <Heart className="w-3.5 h-3.5 fill-current" /></div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] sm:rounded-[36px] bg-white border border-[#EEE6E1] shadow-[0_20px_65px_rgba(60,35,20,0.07)] p-3 sm:p-6 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-orange via-[#FFB000] to-brand-orange" />
          <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
            <div><div className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-orange">108-bead mala</div><h2 className="text-lg sm:text-xl font-black mt-0.5">Tap and chant</h2></div>
            <div className="text-[10px] font-bold text-stone-400">One bead at a time</div>
          </div>
          <Round108Mala currentBead={currentBead} currentMalaRound={currentMalaRound} activeMantra={activeMantra} targetMalaGoal={targetMalaGoal} soundEnabled={soundEnabled} vibrationEnabled={vibrationEnabled} onIncrement={handleIncrement} onDecrement={handleDecrement} onResetMala={handleResetMala} onToggleSound={() => setSoundEnabled((value) => !value)} onToggleVibration={() => setVibrationEnabled((value) => !value)} onChangeTargetGoal={setTargetMalaGoal} />
        </section>

        <section className="mt-6 sm:mt-8 rounded-[24px] bg-[#FFF8F3] border border-[#F4DED2] px-5 sm:px-8 py-4 sm:py-5 text-center shadow-sm"><div className="text-brand-orange text-2xl font-serif leading-none">“</div><p className="text-sm sm:text-base font-serif font-semibold text-stone-700 leading-relaxed max-w-2xl mx-auto">A calm mind, a devoted heart, and a sacred name on your lips can change everything.</p><div className="mt-1 text-[10px] font-bold text-stone-400">— Bhakti Sathi</div></section>

        <section className="mt-7 sm:mt-9">
          <div className="flex items-end justify-between mb-4"><div><div className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-orange">Your practice</div><h2 className="text-xl sm:text-2xl font-black mt-0.5">Sadhana insights</h2></div><button type="button" onClick={handleDownloadPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-stone-200 px-3 py-2 text-[10px] font-black text-stone-600 hover:border-brand-orange/30 hover:text-brand-orange transition cursor-pointer"><Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export PDF</span></button></div>
          <JapStatsCards timeframe={timeframe} setTimeframe={setTimeframe} totalChants={totalChants} totalMalas={totalMalas} streakDays={streakDays} todayChants={todayChants} todayMalas={todayMalas} lifetimeChants={lifetimeChants} lifetimeMalas={lifetimeMalas} records={records} activeMantra={activeMantra} onDownloadPdf={handleDownloadPdf} />
        </section>
      </main>

      <MantraSelectorModal isOpen={isMantraModalOpen} activeMantra={activeMantra} onSelectMantra={setActiveMantra} onClose={() => setIsMantraModalOpen(false)} />
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTours } from '../../context/TourContext';
import { Round108Mala } from './jap/Round108Mala';
import { JapStatsCards } from './jap/JapStatsCards';
import { MantraSelectorModal } from './jap/MantraSelectorModal';
import { JapSessionRecord, JapTimeframe } from '../../types/japCounter';
import { playBeadChime, playMalaCompleteChime, triggerHaptic } from '../../utils/japAudio';
import { generateJapSadhanaPdf } from '../../utils/japPdfExport';
import { ArrowLeft, ChevronDown, Download, Heart, Sparkles, Target, BarChart3, Bookmark, Headphones, MessageCircle, CheckCircle2, UserRound, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'hh_jap_counter_data_v1';
const DEVOTEE_NAME_KEY = 'hh_jap_devotee_name_v1';

export const JapCounterPage: React.FC = () => {
  const { navigateToHome, agencySettings, travelerUser } = useTours();
  const [currentBead, setCurrentBead] = useState(0);
  const [currentMalaRound, setCurrentMalaRound] = useState(0);
  const [activeMantra, setActiveMantra] = useState(() => agencySettings?.sacredMantra || 'साम्ब सदाशिव');
  const [targetMalaGoal, setTargetMalaGoal] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [devoteeName, setDevoteeName] = useState(() => {
    try {
      const saved = localStorage.getItem(DEVOTEE_NAME_KEY);
      if (saved?.trim()) return saved.trim();
    } catch {}
    return travelerUser?.name || '';
  });
  const [profileNameInput, setProfileNameInput] = useState(devoteeName);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [records, setRecords] = useState<JapSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.records) ? parsed.records : [];
      }
    } catch {}
    return [];
  });
  const [timeframe, setTimeframe] = useState<JapTimeframe>('daily');
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeMantra, records, soundEnabled, vibrationEnabled, targetMalaGoal }));
    } catch {}
  }, [records, activeMantra, soundEnabled, vibrationEnabled, targetMalaGoal]);

  useEffect(() => {
    if (!devoteeName && travelerUser?.name) {
      setDevoteeName(travelerUser.name || '');
    }
  }, [travelerUser, devoteeName]);

  const openProfileEditor = () => {
    setProfileNameInput(devoteeName);
    setIsProfileModalOpen(true);
  };

  const saveDevoteeName = () => {
    const name = profileNameInput.trim();
    if (!name) return;
    setDevoteeName(name);
    try { localStorage.setItem(DEVOTEE_NAME_KEY, name); } catch {}
    setIsProfileModalOpen(false);
  };

  const addCompletedMala = useCallback(() => {
    if (soundEnabled) playMalaCompleteChime();
    if (vibrationEnabled) triggerHaptic('malaComplete');
    setCurrentMalaRound((m) => m + 1);
    setShowCelebration(true);

    const now = new Date();
    const newRecord: JapSessionRecord = {
      id: `jap-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: now.toISOString().split('T')[0],
      mantra: activeMantra,
      beadCount: 108,
      malasCompleted: 1,
      durationSeconds: Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000)),
    };
    setRecords((prev) => [newRecord, ...prev]);
  }, [soundEnabled, vibrationEnabled, activeMantra, sessionStartTime]);

  const handleIncrement = useCallback(() => {
    if (soundEnabled) playBeadChime();
    if (vibrationEnabled) triggerHaptic('bead');
    setCurrentBead((prev) => {
      const next = prev + 1;
      if (next >= 108) {
        addCompletedMala();
        return 0;
      }
      return next;
    });
  }, [soundEnabled, vibrationEnabled, addCompletedMala]);

  const handleDecrement = useCallback(() => {
    setCurrentBead((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleResetMala = useCallback(() => {
    if (window.confirm('Reset current mala progress to 0 beads?')) setCurrentBead(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isMantraModalOpen && !isProfileModalOpen) {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement, isMantraModalOpen, isProfileModalOpen]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    if (timeframe === 'daily') {
      const today = now.toISOString().split('T')[0];
      return records.filter((r) => r.dateStr === today);
    }
    const days = timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : timeframe === 'yearly' ? 365 : Infinity;
    if (!Number.isFinite(days)) return records;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    return records.filter((r) => new Date(r.timestamp) >= cutoff);
  }, [records, timeframe]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((r) => r.dateStr === todayStr);
  const todayChants = todayRecords.reduce((a, r) => a + r.beadCount, 0) + currentBead;
  const todayMalas = todayRecords.reduce((a, r) => a + r.malasCompleted, 0);
  const totalChantsInTimeframe = filteredRecords.reduce((a, r) => a + r.beadCount, 0) + (timeframe === 'daily' ? currentBead : 0);
  const totalMalasInTimeframe = filteredRecords.reduce((a, r) => a + r.malasCompleted, 0);
  const lifetimeChants = records.reduce((a, r) => a + r.beadCount, 0) + currentBead;
  const lifetimeMalas = records.reduce((a, r) => a + r.malasCompleted, 0);

  const streakDays = useMemo(() => {
    const uniqueDates = new Set(records.map((r) => r.dateStr));
    const activeToday = todayRecords.length > 0 || currentBead > 0;
    let count = 0;
    const cursor = new Date();
    if (!activeToday) cursor.setDate(cursor.getDate() - 1);
    while (uniqueDates.has(cursor.toISOString().split('T')[0])) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return activeToday ? Math.max(1, count) : count;
  }, [records, todayRecords.length, currentBead]);

  const handleDownloadPdf = () => {
    generateJapSadhanaPdf({
      pilgrimName: devoteeName.trim() || 'Devoted Pilgrim',
      timeframe,
      totalChants: totalChantsInTimeframe,
      totalMalas: totalMalasInTimeframe,
      streakDays,
      activeMantra,
      records: filteredRecords,
      agencyName: agencySettings?.agencyName || 'Holidays Hunt',
    });
  };

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-[#1A1A1A] font-sans selection:bg-brand-orange selection:text-white pb-24 lg:pb-10">
      <header className="sticky top-0 z-40 border-b border-[#EEE8E4] bg-white/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-[68px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <button type="button" onClick={navigateToHome} className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-extrabold text-stone-500 hover:text-brand-orange hover:bg-brand-orange-light transition cursor-pointer" aria-label="Back to home"><ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /><span className="hidden sm:inline">Back</span></button>
          <div className="flex items-center gap-2.5 min-w-0"><div className="relative w-10 h-10 rounded-[13px] bg-brand-orange text-white grid place-items-center shadow-[0_9px_24px_rgba(155, 0, 0,0.22)]"><Sparkles className="w-[18px] h-[18px]" /><span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#FFB000] border-2 border-white" /></div><div className="min-w-0 text-center sm:text-left"><div className="text-[9px] uppercase tracking-[0.22em] font-black text-brand-orange">Holidays Hunt • Sadhana</div><h1 className="text-[15px] sm:text-lg font-black tracking-tight truncate">Japa Counter</h1></div></div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={openProfileEditor} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#EDE4DF] px-3 py-2.5 text-stone-600 hover:text-brand-orange hover:border-brand-orange/25 transition cursor-pointer" aria-label="Edit devotee name"><UserRound className="w-4 h-4" /><span className="hidden sm:inline max-w-[110px] truncate text-[11px] font-black">{devoteeName || 'Your name'}</span></button>
            <button type="button" onClick={() => setIsMantraModalOpen(true)} className="max-w-[145px] sm:max-w-[220px] inline-flex items-center gap-1.5 rounded-full bg-[#FFF5F0] border border-[#F7D8CA] px-3 sm:px-4 py-2.5 text-brand-orange hover:bg-[#FADADA] transition cursor-pointer"><span className="truncate font-serif font-black text-[11px] sm:text-xs">॥ {activeMantra} ॥</span><ChevronDown className="w-3.5 h-3.5 shrink-0" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8">
        <section className="text-center mb-5 sm:mb-7"><div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#F0E5DF] px-3.5 py-1.5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange" /><span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-black text-stone-500">108-bead sacred mala</span></div><h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-[#191919]">Pause. Chant. Connect.</h2><p className="mt-1.5 text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">A calm digital space for daily japa — one bead, one mantra, one mindful moment at a time.</p><div className="mt-3 inline-flex items-center gap-2 text-brand-orange font-serif font-bold text-sm">॥ {activeMantra} ॥ <Heart className="w-3.5 h-3.5 fill-current" /></div></section>

        <section className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] bg-white border border-[#EEE6E1] shadow-[0_18px_55px_rgba(60,35,20,0.07)] p-4 sm:p-7 lg:p-9"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-orange via-[#FFB000] to-brand-orange" /><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3"><div><div className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-orange">Your sacred counting space</div><h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">Begin your japa</h3></div><div className="inline-flex self-start sm:self-auto items-center gap-2 rounded-full bg-[#F8FAF9] border border-[#E6ECE8] px-3 py-1.5 text-[10px] font-bold text-stone-500"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Saved on this device</div></div><Round108Mala currentBead={currentBead} currentMalaRound={currentMalaRound} activeMantra={activeMantra} targetMalaGoal={targetMalaGoal} soundEnabled={soundEnabled} vibrationEnabled={vibrationEnabled} onIncrement={handleIncrement} onDecrement={handleDecrement} onResetMala={handleResetMala} onToggleSound={() => setSoundEnabled((v) => !v)} onToggleVibration={() => setVibrationEnabled((v) => !v)} onChangeTargetGoal={setTargetMalaGoal} /></section>

        <section className="mt-6 sm:mt-8 rounded-[26px] bg-[#FDF5F5] border border-[#F5DED3] px-5 sm:px-8 py-4 sm:py-5 text-center shadow-sm"><div className="text-brand-orange text-2xl font-serif leading-none">“</div><p className="text-sm sm:text-base font-serif font-semibold text-stone-700 leading-relaxed max-w-2xl mx-auto">A calm mind, a devoted heart, and a sacred name on your lips can change everything.</p><div className="mt-1 text-[10px] font-bold text-stone-400">— Holidays Hunt</div></section>

        <section className="mt-7 sm:mt-9"><div className="flex items-end justify-between mb-4"><div><div className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-orange">Your practice</div><h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">Sadhana insights</h3></div><button type="button" onClick={handleDownloadPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-stone-200 px-3 py-2 text-[10px] font-black text-stone-600 hover:border-brand-orange/30 hover:text-brand-orange transition cursor-pointer"><Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export PDF</span></button></div><JapStatsCards timeframe={timeframe} setTimeframe={setTimeframe} totalChants={totalChantsInTimeframe} totalMalas={totalMalasInTimeframe} streakDays={streakDays} todayChants={todayChants} todayMalas={todayMalas} lifetimeChants={lifetimeChants} lifetimeMalas={lifetimeMalas} records={records} activeMantra={activeMantra} onDownloadPdf={handleDownloadPdf} /></section>

        <section className="mt-7 sm:mt-9"><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[
          { icon: Target, title: 'Set Daily Goal', sub: `${targetMalaGoal} ${targetMalaGoal === 1 ? 'Mala' : 'Malas'}`, tone: 'bg-[#FFF5EF] text-brand-orange border-[#F7DDD1]' },
          { icon: BarChart3, title: 'View Insights', sub: 'Track your sadhana', tone: 'bg-[#FFF5F8] text-[#D84B5B] border-[#F5DCE3]' },
          { icon: Bookmark, title: 'Saved Mantras', sub: 'Choose mantra', tone: 'bg-[#FFFCF0] text-[#B78600] border-[#F2E8BE]' },
          { icon: Headphones, title: 'Japa Sound', sub: soundEnabled ? 'Chime enabled' : 'Muted', tone: 'bg-[#F2FBF8] text-[#138A6B] border-[#D6EEE6]' },
        ].map(({ icon: Icon, title, sub, tone }) => (
          <button key={title} type="button" onClick={title === 'Set Daily Goal' ? () => setTargetMalaGoal(targetMalaGoal >= 21 ? 1 : targetMalaGoal === 11 ? 21 : targetMalaGoal === 5 ? 11 : targetMalaGoal === 3 ? 5 : 3) : title === 'Saved Mantras' ? () => setIsMantraModalOpen(true) : title === 'Japa Sound' ? () => setSoundEnabled((v) => !v) : undefined} className={`rounded-2xl border p-4 sm:p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${tone}`}><div className="w-9 h-9 rounded-xl bg-white/80 grid place-items-center shadow-sm mb-3"><Icon className="w-4 h-4" /></div><div className="text-xs sm:text-sm font-black text-stone-800">{title}</div><div className="text-[10px] text-stone-500 font-medium mt-0.5">{sub}</div></button>
        ))}</div></section>

        <section className="mt-3 rounded-2xl bg-white border border-stone-200 px-4 sm:px-5 py-4 flex items-center justify-between gap-3 shadow-sm"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#FDF2F2] text-brand-orange grid place-items-center"><Sparkles className="w-4 h-4" /></div><div><h3 className="text-sm font-black">Continue Your Sadhana</h3><p className="text-[10px] text-stone-400 mt-0.5">Discipline today, peace forever.</p></div></div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-9 h-9 rounded-full bg-[#FDF2F2] text-brand-orange grid place-items-center hover:bg-brand-orange hover:text-white transition cursor-pointer" aria-label="Return to japa counter"><ChevronDown className="w-4 h-4 rotate-180" /></button></section>
      </main>

      <AnimatePresence>{showCelebration && <motion.div className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm flex items-center justify-center p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCelebration(false)}><motion.div className="w-full max-w-sm rounded-[30px] bg-white border border-[#F2C6C6] shadow-2xl p-7 text-center" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()}><div className="mx-auto w-16 h-16 rounded-full bg-[#FCE8E8] text-brand-orange grid place-items-center"><Sparkles className="w-7 h-7" /></div><div className="mt-4 text-[10px] uppercase tracking-[0.2em] font-black text-brand-orange">Mala complete</div><h3 className="mt-1 text-2xl font-black">108 beads completed</h3><p className="mt-2 text-sm text-stone-500 font-serif">॥ {activeMantra} ॥</p><button type="button" onClick={() => setShowCelebration(false)} className="mt-6 w-full rounded-2xl bg-brand-orange text-white py-3.5 text-sm font-black shadow-[0_10px_25px_rgba(155, 0, 0,0.2)] hover:bg-brand-orange-hover transition cursor-pointer">Continue chanting</button></motion.div></motion.div>}</AnimatePresence>

      <AnimatePresence>{isProfileModalOpen && <motion.div className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileModalOpen(false)}><motion.div className="w-full max-w-md rounded-[28px] bg-white border border-[#EEE3DD] shadow-2xl overflow-hidden" initial={{ scale: 0.96, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 8 }} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between px-5 py-4 border-b border-stone-100"><div><div className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-orange">Devotee details</div><h3 className="text-lg font-black mt-0.5">Your name</h3></div><button type="button" onClick={() => setIsProfileModalOpen(false)} className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 grid place-items-center hover:bg-stone-200 transition cursor-pointer" aria-label="Close"><X className="w-4 h-4" /></button></div><div className="p-5"><label htmlFor="japa-devotee-name" className="block text-xs font-black text-stone-700 mb-2">Devotee name</label><input id="japa-devotee-name" value={profileNameInput} onChange={(e) => setProfileNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveDevoteeName(); }} autoFocus maxLength={80} placeholder="Enter your name" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm font-semibold text-stone-900 outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10" /><p className="mt-2 text-[10px] leading-relaxed text-stone-400">This name is saved on this device and will appear as the devotee name on your Japa PDF.</p><button type="button" onClick={saveDevoteeName} disabled={!profileNameInput.trim()} className="mt-5 w-full rounded-2xl bg-brand-orange text-white py-3.5 text-sm font-black shadow-[0_10px_25px_rgba(155, 0, 0,0.18)] hover:bg-brand-orange-hover disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save devotee name</button></div></motion.div></motion.div>}</AnimatePresence>

      <MantraSelectorModal isOpen={isMantraModalOpen} activeMantra={activeMantra} onSelectMantra={setActiveMantra} onClose={() => setIsMantraModalOpen(false)} />
      <div className="fixed right-4 bottom-20 lg:bottom-5 z-30"><button type="button" onClick={() => setIsMantraModalOpen(true)} className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#FFB000] shadow-[0_12px_28px_rgba(0,0,0,0.18)] grid place-items-center hover:scale-105 transition cursor-pointer" aria-label="Choose mantra"><MessageCircle className="w-5 h-5" /></button></div>
    </div>
  );
};

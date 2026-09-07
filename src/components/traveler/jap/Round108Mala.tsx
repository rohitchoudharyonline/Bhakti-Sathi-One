import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, Smartphone, Sparkles, Flag, History, Undo2, Target } from 'lucide-react';

interface Round108MalaProps {
  currentBead: number;
  currentMalaRound: number;
  activeMantra: string;
  targetMalaGoal: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onResetMala: () => void;
  onToggleSound: () => void;
  onToggleVibration: () => void;
  onChangeTargetGoal: (goal: number) => void;
}

export const Round108Mala: React.FC<Round108MalaProps> = ({
  currentBead,
  currentMalaRound,
  activeMantra,
  targetMalaGoal,
  soundEnabled,
  vibrationEnabled,
  onIncrement,
  onDecrement,
  onResetMala,
  onToggleSound,
  onToggleVibration,
  onChangeTargetGoal,
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const totalBeads = 108;
  const center = 50;
  const radius = 39.5;

  const beads = useMemo(() => Array.from({ length: totalBeads }, (_, index) => {
    const angle = -90 + (360 * index) / totalBeads;
    const radians = (angle * Math.PI) / 180;
    return { index, left: center + radius * Math.cos(radians), top: center + radius * Math.sin(radians) };
  }), []);

  const progress = Math.min(100, Math.round((currentBead / totalBeads) * 100));
  const goalProgress = Math.min(100, Math.round((currentMalaRound / Math.max(1, targetMalaGoal)) * 100));

  const handleMalaTap = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipples((prev) => [...prev.slice(-4), { id: Date.now(), x: event.clientX - rect.left, y: event.clientY - rect.top }]);
    onIncrement();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mb-4 rounded-2xl border border-[#F5DDD2] bg-[#FFF9F5] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#F2D5C7] text-brand-orange grid place-items-center shadow-sm"><Target className="w-5 h-5" /></div>
          <div><div className="text-xs font-black text-stone-900">Daily Japa Goal</div><div className="text-[10px] text-stone-500 mt-0.5">{currentMalaRound} of {targetMalaGoal} malas completed</div></div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[1, 3, 5, 11, 21].map((goal) => <button key={goal} type="button" onClick={() => onChangeTargetGoal(goal)} className={`min-w-[48px] px-3 py-2 rounded-xl text-[10px] font-black transition cursor-pointer ${targetMalaGoal === goal ? 'bg-brand-orange text-white shadow-[0_5px_15px_rgba(255,75,0,0.2)]' : 'bg-white border border-stone-200 text-stone-500 hover:border-brand-orange/40 hover:text-brand-orange'}`}>{goal}M</button>)}
        </div>
      </div>

      <div
        className="relative w-full max-w-[470px] aspect-square select-none cursor-pointer"
        onClick={handleMalaTap}
        role="button"
        tabIndex={0}
        aria-label="Tap anywhere on the mala to count one japa"
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onIncrement(); } }}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="absolute inset-[2%] rounded-full bg-[radial-gradient(circle,rgba(255,75,0,0.06),rgba(255,176,0,0.035)_45%,transparent_70%)]" />
        <div className="absolute inset-[8%] rounded-full border border-[#F3E4DC]" />
        <div className="absolute inset-[14%] rounded-full border border-dashed border-[#F1E4DD]" />
        <div className="absolute inset-[20%] rounded-full bg-white/95 border border-[#F5DDD2] shadow-[0_20px_55px_rgba(255,75,0,0.1)]" />

        {beads.map((bead) => {
          const beadNumber = bead.index + 1;
          const completed = beadNumber <= currentBead;
          const active = beadNumber === currentBead && currentBead > 0;
          return (
            <div key={bead.index} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${bead.left}%`, top: `${bead.top}%` }}>
              {active && <motion.div className="absolute inset-[-6px] rounded-full border-2 border-brand-orange" animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.8, 0.15, 0.8] }} transition={{ duration: 1.3, repeat: Infinity }} />}
              <div className={`rounded-full border shadow-[inset_1px_1px_2px_rgba(255,255,255,0.55),0_2px_4px_rgba(60,30,10,0.18)] transition-all duration-150 ${completed ? 'bg-[radial-gradient(circle_at_30%_25%,#B96A32,#7A3517_62%,#52200F)] border-[#6D2C12]' : 'bg-[radial-gradient(circle_at_30%_25%,#E4DDD8,#B8AEA8_65%,#91857F)] border-[#9E958F]'}`} style={{ width: active ? 15 : 12, height: active ? 15 : 12 }} />
            </div>
          );
        })}

        <div className="absolute left-1/2 top-[10.5%] -translate-x-1/2 w-7 h-7 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFC533,#E99A00_65%,#B66D00)] border-2 border-white shadow-[0_0_0_5px_rgba(255,176,0,0.13),0_4px_12px_rgba(180,100,0,0.25)] z-10" />

        <div className="absolute inset-[22%] rounded-full flex flex-col items-center justify-center text-center z-20 pointer-events-none">
          <div className="text-2xl text-brand-orange font-serif leading-none">ॐ</div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.24em] font-black text-stone-400">Japa Count</div>
          <div className="mt-1 text-6xl sm:text-7xl font-black font-mono tracking-[-0.07em] leading-none text-[#181818]">{currentBead}</div>
          <div className="mt-1 text-xs sm:text-sm font-bold text-stone-400">/ 108 beads</div>
          <div className="mt-3 w-36 h-2 rounded-full bg-stone-100 overflow-hidden border border-stone-200"><motion.div className="h-full rounded-full bg-gradient-to-r from-brand-orange to-[#FFB000]" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} /></div>
          <div className="mt-2 text-[10px] font-bold text-stone-400">{progress}% complete</div>
          <div className="mt-2 text-[9px] font-serif font-bold text-brand-orange max-w-[180px] truncate">॥ {activeMantra} ॥</div>
        </div>

        <AnimatePresence>{ripples.map((ripple) => <motion.span key={ripple.id} initial={{ scale: 0, opacity: 0.45 }} animate={{ scale: 3.5, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} className="absolute w-14 h-14 rounded-full bg-brand-orange/20 pointer-events-none z-30" style={{ left: ripple.x - 28, top: ripple.y - 28 }} />)}</AnimatePresence>
      </div>

      <div className="mt-2 text-center"><div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7F1] border border-[#F5D9CC] px-4 py-2 text-[11px] font-black text-brand-orange shadow-sm"><Sparkles className="w-3.5 h-3.5" /> Tap any bead — or anywhere on the mala</div></div>

      <button type="button" onClick={onIncrement} className="mt-4 w-full max-w-xl min-h-[66px] rounded-[22px] bg-gradient-to-r from-brand-orange to-[#FF5A14] text-white shadow-[0_14px_30px_rgba(255,75,0,0.2)] flex flex-col items-center justify-center active:scale-[0.985] transition cursor-pointer"><span className="flex items-center gap-2 text-base sm:text-lg font-black"><Sparkles className="w-4 h-4" /> Tap the bead</span><span className="text-[10px] sm:text-xs text-orange-100 font-semibold mt-0.5">One tap, one mantra, one step closer</span></button>

      <div className="w-full max-w-3xl grid grid-cols-4 gap-2 sm:gap-3 mt-3">
        <button type="button" onClick={onDecrement} disabled={currentBead === 0} className="min-h-[66px] rounded-2xl bg-white border border-stone-200 text-stone-600 disabled:opacity-35 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 shadow-sm transition cursor-pointer active:scale-95"><Undo2 className="w-4 h-4" /><span className="text-[9px] font-black">Undo</span></button>
        <button type="button" onClick={onToggleSound} className={`min-h-[66px] rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-sm transition cursor-pointer active:scale-95 ${soundEnabled ? 'bg-[#FFF4EE] text-brand-orange border-[#F5D6C8]' : 'bg-white text-stone-400 border-stone-200'}`}>{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}<span className="text-[9px] font-black">{soundEnabled ? 'Sound on' : 'Sound off'}</span></button>
        <button type="button" onClick={onToggleVibration} className={`min-h-[66px] rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-sm transition cursor-pointer active:scale-95 ${vibrationEnabled ? 'bg-[#FFF4EE] text-brand-orange border-[#F5D6C8]' : 'bg-white text-stone-400 border-stone-200'}`}><Smartphone className="w-4 h-4" /><span className="text-[9px] font-black">{vibrationEnabled ? 'Vibrate on' : 'Vibrate off'}</span></button>
        <button type="button" onClick={onResetMala} className="min-h-[66px] rounded-2xl bg-white border border-stone-200 text-stone-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 flex flex-col items-center justify-center gap-1 shadow-sm transition cursor-pointer active:scale-95"><RotateCcw className="w-4 h-4" /><span className="text-[9px] font-black">Reset</span></button>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-3 gap-2 sm:gap-3 mt-3">
        <div className="rounded-2xl bg-white border border-stone-200 px-3 py-4 text-center shadow-sm"><Flag className="w-4 h-4 mx-auto text-brand-orange mb-1.5" /><div className="text-[9px] uppercase tracking-wider text-stone-400 font-black">Current mala</div><div className="text-sm font-black text-stone-900 mt-1">{currentBead} / 108</div><div className="text-[9px] text-stone-400 mt-0.5">beads counted</div></div>
        <div className="rounded-2xl bg-white border border-stone-200 px-3 py-4 text-center shadow-sm"><History className="w-4 h-4 mx-auto text-brand-orange mb-1.5" /><div className="text-[9px] uppercase tracking-wider text-stone-400 font-black">Malas completed</div><div className="text-sm font-black text-stone-900 mt-1">{currentMalaRound}</div><div className="text-[9px] text-stone-400 mt-0.5">today in this session</div></div>
        <div className="rounded-2xl bg-white border border-stone-200 px-3 py-4 text-center shadow-sm"><Target className="w-4 h-4 mx-auto text-brand-orange mb-1.5" /><div className="text-[9px] uppercase tracking-wider text-stone-400 font-black">Goal progress</div><div className="text-sm font-black text-stone-900 mt-1">{goalProgress}%</div><div className="text-[9px] text-stone-400 mt-0.5">{currentMalaRound} / {targetMalaGoal} malas</div></div>
      </div>
    </div>
  );
};

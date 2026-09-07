/**
 * Web Audio API based acoustic bell and singing bowl chime synthesis for Japa Counter.
 * Zero external audio files required. Completely standalone, reliable, and instantaneous.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a soothing, crystal-clear 432Hz bead touch chime.
 */
export function playBeadChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High purity chime tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // 528 Hz Solfeggio frequency
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {}
}

/**
 * Play an auspicious, deep temple gong / Tibetan singing bowl chime when completing 108 beads (1 full Mala).
 */
export function playMalaCompleteChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic frequencies for rich temple bell resonance (Fundamental + 3 Overtones)
    const frequencies = [216, 432, 648, 864, 1296];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const peakGain = 0.22 / (idx + 1);
      const decayDuration = 2.4 - idx * 0.3;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decayDuration + 0.1);
    });
  } catch {}
}

/**
 * Trigger subtle haptic vibration on mobile devices.
 */
export function triggerHaptic(type: 'bead' | 'malaComplete' = 'bead'): void {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      if (type === 'bead') {
        navigator.vibrate(15);
      } else {
        // Celebratory double pulse for full Mala
        navigator.vibrate([40, 60, 80]);
      }
    }
  } catch {}
}

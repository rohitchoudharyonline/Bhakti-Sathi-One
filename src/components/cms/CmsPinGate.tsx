import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Loader2, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface CmsPinGateProps {
  onPinVerified: (pin: string) => void;
}

const PIN_LENGTH = 6;

export const CmsPinGate: React.FC<CmsPinGateProps> = ({ onPinVerified }) => {
  const [digits, setDigits] = useState<string[]>(() => Array(PIN_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const val = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);
    setError('');

    if (val && index < PIN_LENGTH - 1) inputRefs.current[index + 1]?.focus();

    if (index === PIN_LENGTH - 1 && val) {
      const fullPin = newDigits.join('');
      if (fullPin.length === PIN_LENGTH) void verifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    if (pastedData.length === PIN_LENGTH) {
      setDigits(pastedData.split(''));
      void verifyPin(pastedData);
    }
  };

  const verifyPin = async (pinString: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ pin: pinString }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Invalid PIN. Please try again.');

      onPinVerified(pinString);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Access denied. Incorrect PIN.');
      setDigits(Array(PIN_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 sm:p-6 text-white selection:bg-[#FF4B00]">
      <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/95 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4B00]/10 border border-[#FF4B00]/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-[#FF4B00]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">CMS Access Gateway</h1>
          <p className="text-xs text-stone-400 font-medium mt-1">Holidays Hunt One • Secure Administrative Portal</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-200 flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-300 text-center mb-3 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#FF4B00]" />
              <span>Enter 6-Digit Admin PIN</span>
            </label>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  aria-label={`Admin PIN digit ${index + 1}`}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-stone-800/90 border border-stone-700 text-white focus:border-[#FF4B00] focus:ring-2 focus:ring-[#FF4B00]/30 focus:outline-hidden transition disabled:opacity-50 shadow-inner"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={loading || digits.some((d) => !d)}
            onClick={() => {
              const fullPin = digits.join('');
              if (fullPin.length === PIN_LENGTH) void verifyPin(fullPin);
            }}
            className="w-full rounded-2xl bg-[#FF4B00] hover:bg-[#E04200] text-white py-4 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF4B00]/25 transition-all cursor-pointer active:scale-98 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{loading ? 'Verifying PIN…' : 'Continue to CMS Login'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-500 font-medium">Authorized personnel only. All access attempts are securely audited.</p>
        </div>
      </div>
    </div>
  );
};

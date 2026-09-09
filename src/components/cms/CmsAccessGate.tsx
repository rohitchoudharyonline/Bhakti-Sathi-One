import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, LogIn, AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { CmsPinGate } from './CmsPinGate';

export const CmsAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveView } = useTours();
  const [checking, setChecking] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffEmail, setStaffEmail] = useState('rohitchoudharyonline@gmail.com');
  const [password, setPassword] = useState('');

  const checkSession = async () => {
    try {
      const pinRes = await fetch('/api/admin/pin/session', { credentials: 'include', cache: 'no-store' });
      const pinData = await pinRes.json().catch(() => ({}));
      if (pinRes.ok && pinData.verified === true) {
        setPinVerified(true);
      } else {
        setPinVerified(false);
        setChecking(false);
        return;
      }

      const response = await fetch('/api/auth/cms/session', { credentials: 'include', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      setAuthorized(response.ok && data.authorized === true);
    } catch {
      setPinVerified(false);
      setAuthorized(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { void checkSession(); }, []);

  const handleUnblock = async () => {
    if (!password) {
      setError('Please enter the administrator password to clear blocks.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/unblock-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) setError('IP blocks cleared. You can now log in.');
      else throw new Error(data.error || 'Failed to clear IP blocks. Incorrect password?');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear IP blocks.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (verifiedPin.length !== 6) throw new Error('PIN verification required first.');

      // Refresh the short-lived server-side PIN gate, then include the same
      // verified PIN in the credential request so login does not depend on
      // browser cookie timing/persistence.
      const pinResponse = await fetch('/api/admin/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ pin: verifiedPin }),
      });
      const pinData = await pinResponse.json().catch(() => ({}));
      if (!pinResponse.ok || !pinData.success) throw new Error(pinData.error || 'PIN verification failed. Please re-enter your PIN.');

      const response = await fetch('/api/auth/cms/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ email: staffEmail, password, pin: verifiedPin }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Authentication failed. Invalid credentials or IP locked.');

      setAuthorized(true);
      setVerifiedPin('');
      setPassword('');
      setActiveView('cms');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-950 text-white"><Loader2 className="w-6 h-6 animate-spin text-[#FF4B00]" aria-label="Checking CMS access" /></div>;
  }

  if (!pinVerified) return <CmsPinGate onPinVerified={(pin) => { setVerifiedPin(pin); setPinVerified(true); }} />;

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 sm:p-6 text-white selection:bg-[#FF4B00]">
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4B00]/10 border border-[#FF4B00]/30 flex items-center justify-center shadow-inner"><ShieldCheck className="w-6 h-6 text-[#FF4B00]" /></div>
            <div>
              <div className="flex items-center gap-2"><h1 className="text-lg sm:text-xl font-black text-white">Secure CMS Login</h1><span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">PIN Verified</span></div>
              <p className="text-xs text-stone-400 font-medium">Bhakti Sathi One • Restricted Access</p>
            </div>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold flex flex-col gap-2"><div className="flex gap-2.5 items-start text-red-200"><AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" /><span>{error}</span></div>{error.toLowerCase().includes('blocked') && <button type="button" onClick={handleUnblock} className="mt-1 self-start bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Clear IP Blocks</button>}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#FF4B00]" /><span>Authorized Administrator Email</span></label>
              <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="Administrator email" className="w-full rounded-2xl bg-stone-800/90 border border-stone-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-hidden focus:border-[#FF4B00] focus:ring-1 focus:ring-[#FF4B00] transition" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#FF4B00]" /><span>Administrator Password</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Administrator password" className="w-full rounded-2xl bg-stone-800/90 border border-stone-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-hidden focus:border-[#FF4B00] focus:ring-1 focus:ring-[#FF4B00] transition" required />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#FF4B00] hover:bg-[#E04200] text-white py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF4B00]/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}<span>{loading ? 'Authenticating…' : 'Access CMS Dashboard'}</span>{!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800/80 text-center">
            <button type="button" onClick={() => { void fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); setPinVerified(false); setVerifiedPin(''); setAuthorized(false); setPassword(''); setActiveView('traveler'); }} className="text-xs font-bold text-stone-400 hover:text-white transition py-1 cursor-pointer">← Return to Traveler Website & Lock Gate</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

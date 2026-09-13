import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { CmsPinGate } from './CmsPinGate';

export const CmsAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveView } = useTours();
  const [checking, setChecking] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('rohitchoudharyonline@gmail.com');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkSession = useCallback(async () => {
    setChecking(true);
    try {
      // The CMS session is the durable login. Check it first, so a normal
      // browser refresh does not force the user through the short PIN gate.
      const cms = await fetch('/api/auth/cms/session', { credentials: 'include', cache: 'no-store' });
      const cmsData = await cms.json().catch(() => ({}));
      if (cms.ok && cmsData.authorized === true) {
        setAuthorized(true);
        setPinVerified(true);
        return;
      }

      const pin = await fetch('/api/admin/pin/session', { credentials: 'include', cache: 'no-store' });
      const pinData = await pin.json().catch(() => ({}));
      setPinVerified(pin.ok && pinData.verified === true);
      setAuthorized(false);
    } catch {
      setAuthorized(false);
      setPinVerified(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { void checkSession(); }, [checkSession]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (verifiedPin.length !== 6) throw new Error('PIN verification required first.');
      const pinResponse = await fetch('/api/admin/pin/verify', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: verifiedPin }),
      });
      const pinData = await pinResponse.json().catch(() => ({}));
      if (!pinResponse.ok || !pinData.success) throw new Error(pinData.error || 'PIN verification failed.');

      const response = await fetch('/api/auth/cms/login', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, pin: verifiedPin }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Authentication failed.');
      setAuthorized(true);
      setPinVerified(true);
      setPassword('');
      setVerifiedPin('');
      setActiveView('cms');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-stone-950 text-white"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (authorized) return <>{children}</>;
  if (!pinVerified) return <CmsPinGate onPinVerified={(pin) => { setVerifiedPin(pin); setPinVerified(true); }} />;

  return <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 text-white">
    <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 space-y-4">
      <div className="flex items-center gap-3"><ShieldCheck className="text-orange-500" /><h1 className="text-xl font-bold">Secure CMS Login</h1></div>
      {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm flex gap-2"><AlertCircle className="shrink-0" />{error}</div>}
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-3" placeholder="Administrator email" required />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-3" placeholder="Administrator password" required />
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-orange-600 py-3 font-bold flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <LogIn />}{loading ? 'Authenticating…' : 'Access CMS Dashboard'}</button>
    </form>
  </div>;
};

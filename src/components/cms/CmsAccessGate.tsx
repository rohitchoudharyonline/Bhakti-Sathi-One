import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { CmsPinGate } from './CmsPinGate';

export type CmsAuthState = 'checking' | 'unauthenticated' | 'pin_verified' | 'authenticated';

const isAuthorizedSession = (data: any): boolean => Boolean(
  data?.authorized === true
  || data?.authenticated === true
  || data?.loggedIn === true
  || data?.success === true
  || data?.user
  || data?.session,
);

export const CmsAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveView } = useTours();
  const [authState, setAuthState] = useState<CmsAuthState>('checking');
  const [verifiedPin, setVerifiedPin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('rohitchoudharyonline@gmail.com');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransientError, setIsTransientError] = useState(false);

  const checkSession = useCallback(async () => {
    setAuthState('checking');
    setIsTransientError(false);
    setError('');

    // Step 1: Check if a durable CMS session is active
    try {
      const cmsRes = await fetch('/api/auth/cms/session', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (cmsRes.ok) {
        const cmsData = await cmsRes.json().catch(() => null);
        if (cmsData && isAuthorizedSession(cmsData)) {
          setAuthState('authenticated');
          return;
        }
      } else if (cmsRes.status >= 500) {
        // Transient server error (e.g. 502, 503)
        setIsTransientError(true);
        setError('Server is temporarily unreachable. Please retry.');
        setAuthState('unauthenticated');
        return;
      }
    } catch (err) {
      console.warn('[CmsAccessGate] CMS session check network failure:', err);
      setIsTransientError(true);
      setError('Network connection error. Please check your connection and retry.');
      setAuthState('unauthenticated');
      return;
    }

    // Step 2: If durable CMS session is unauthenticated, check if a PIN session exists
    try {
      const pinRes = await fetch('/api/admin/pin/session', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (pinRes.ok) {
        const pinData = await pinRes.json().catch(() => null);
        if (pinData && (pinData.verified === true || pinData.authorized === true || pinData.success === true)) {
          setAuthState('pin_verified');
          return;
        }
      }
    } catch (err) {
      console.warn('[CmsAccessGate] PIN session check error:', err);
    }

    // Neither session is active; prompt for PIN first
    setAuthState('unauthenticated');
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setIsTransientError(false);

    try {
      const response = await fetch('/api/auth/cms/login', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password, pin: verifiedPin }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Authentication failed. Please verify credentials.');
      }

      setAuthState('authenticated');
      setPassword('');
      setVerifiedPin('');
      setActiveView('cms');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Checking state: Show neutral high-contrast loader
  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-stone-400 font-medium tracking-wide">Verifying Administrator Session…</span>
      </div>
    );
  }

  // 2. Authenticated: Render dashboard directly
  if (authState === 'authenticated') {
    return <>{children}</>;
  }

  // 3. Unauthenticated: If transient error, show retry button before forcing PIN
  if (authState === 'unauthenticated' && isTransientError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-8 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Connection Interrupted</h2>
          <p className="text-xs text-stone-400">{error}</p>
          <button
            type="button"
            onClick={() => void checkSession()}
            className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 py-3 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 4. Unauthenticated: Prompt for PIN
  if (authState === 'unauthenticated') {
    return (
      <CmsPinGate
        onPinVerified={(pin) => {
          setVerifiedPin(pin);
          setAuthState('pin_verified');
        }}
      />
    );
  }

  // 5. PIN verified: Prompt for Password to finalize durable CMS session
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CMS Staff Login</h1>
            <p className="text-xs text-stone-400">Enter your credentials to access the console</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1">Staff Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-3 text-sm text-white focus:outline-hidden focus:border-orange-500 transition"
            placeholder="admin@holidayshunt.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-3 text-sm text-white focus:outline-hidden focus:border-orange-500 transition"
            placeholder="••••••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-600 hover:bg-orange-500 transition py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          <span>{loading ? 'Authenticating…' : 'Access CMS Dashboard'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthState('unauthenticated');
            setVerifiedPin('');
          }}
          className="w-full text-center text-xs text-stone-500 hover:text-stone-400 py-1 transition"
        >
          Back to PIN Gate
        </button>
      </form>
    </div>
  );
};

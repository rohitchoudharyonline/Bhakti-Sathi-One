import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import {
  ShieldCheck,
  Loader2,
  LogIn,
  AlertCircle,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { CmsPinGate } from './CmsPinGate';

export const CmsAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveView } = useTours();
  const [checking, setChecking] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffEmail, setStaffEmail] = useState('holidayshunt@gmail.com');

  const checkSession = async () => {
    try {
      // 1. Check PIN session
      const pinRes = await fetch('/api/admin/pin/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      const pinData = await pinRes.json().catch(() => ({}));
      if (pinRes.ok && pinData.verified === true) {
        setPinVerified(true);
      } else {
        setPinVerified(false);
        setChecking(false);
        return;
      }

      // 2. Check CMS staff session
      const savedToken = localStorage.getItem('bhakti_cms_token');
      const headers: Record<string, string> = {};
      if (savedToken) {
        headers['x-cms-token'] = savedToken;
      }

      const response = await fetch('/api/auth/cms/session', {
        credentials: 'include',
        cache: 'no-store',
        headers,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.authorized === true) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch {
      setPinVerified(false);
      setAuthorized(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void checkSession();
  }, []);

  const handleDirectLogin = async (emailToUse?: string) => {
    setLoading(true);
    setError('');
    const targetEmail = (emailToUse || staffEmail || 'holidayshunt@gmail.com').trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/cms/direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate staff access.');
      }

      if (data.token) {
        localStorage.setItem('bhakti_cms_token', data.token);
      }
      setAuthorized(true);
      setActiveView('cms');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Staff login failed.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async ({ access_token }) => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/auth/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken: access_token }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'CMS access was not approved.');
        if (data.token) {
          localStorage.setItem('bhakti_cms_token', data.token);
        }
        setAuthorized(true);
        setActiveView('cms');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CMS authentication failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      setError('Google sign-in was cancelled or failed.');
    },
  });

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-white">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF4B00]" aria-label="Checking CMS access" />
      </div>
    );
  }

  // Step 1: PIN Gate if PIN not verified
  if (!pinVerified) {
    return <CmsPinGate onPinVerified={() => setPinVerified(true)} />;
  }

  // Step 2: CMS Staff Login Gate if PIN verified but not logged in as staff
  if (!authorized) {
    const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 sm:p-6 text-white selection:bg-[#FF4B00]">
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4B00]/10 border border-[#FF4B00]/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#FF4B00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">Staff CMS</h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Verified Gate
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">Bhakti Bharat Operations & ERP</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-200 flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Direct Staff Sign-In Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleDirectLogin();
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF4B00]" />
                <span>Authorized Staff Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="admin@bhaktibharatyatra.com"
                  className="w-full rounded-2xl bg-stone-800/90 border border-stone-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-hidden focus:border-[#FF4B00] focus:ring-1 focus:ring-[#FF4B00] transition"
                  required
                />
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#FF4B00] hover:bg-[#E04200] text-white py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF4B00]/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{loading ? 'Authenticating Staff…' : 'Enter CMS Dashboard'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* 1-Tap Quick Login Shortcut */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => void handleDirectLogin('holidayshunt@gmail.com')}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-700/80 bg-stone-800/50 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Tap Sign In as <strong>holidayshunt@gmail.com</strong></span>
            </button>
          </div>

          {/* Google OAuth Option (if configured) */}
          {googleConfigured && (
            <div className="mt-4 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full rounded-2xl bg-white hover:bg-stone-100 text-stone-900 py-3 px-4 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Return to website */}
          <div className="mt-5 pt-3 border-t border-stone-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                // Also logout / clear PIN session if returning
                void fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                setPinVerified(false);
                setActiveView('traveler');
              }}
              className="text-xs font-bold text-stone-400 hover:text-white transition py-1 cursor-pointer"
            >
              ← Return to Traveler Website & Lock Gate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

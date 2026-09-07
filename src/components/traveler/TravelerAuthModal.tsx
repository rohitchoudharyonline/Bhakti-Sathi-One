import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTours } from '../../context/TourContext';
import { X, ShieldCheck, UserPlus, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { generateCsrfToken, verifyCsrfToken, authRateLimiter } from '../../utils/security';

export const TravelerAuthModal: React.FC = () => {
  const {
    isTravelerAuthModalOpen,
    setIsTravelerAuthModalOpen,
    loginWithGoogle,
    updateTravelerProfile,
    navigateToTravelerProfile,
  } = useTours();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    if (isTravelerAuthModalOpen) {
      try {
        setCsrfToken(generateCsrfToken());
        setErrorMessage('');
      } catch {
        setErrorMessage('Secure browser authentication is unavailable. Please update your browser.');
      }
      setIsLoading(false);
    }
  }, [isTravelerAuthModalOpen]);

  const handleClose = () => {
    setIsTravelerAuthModalOpen(false);
    setErrorMessage('');
    setIsLoading(false);
  };

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async ({ access_token }) => {
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken: access_token, csrfToken }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.user?.email) throw new Error(data.error || 'Google authentication could not be verified.');

        loginWithGoogle({ name: data.user.name, email: data.user.email, avatar: data.user.avatar });

        // The verified Google response contains identity only. Optional traveler fields
        // are explicitly marked as not provided instead of being invented by the UI.
        updateTravelerProfile({
          phone: 'Not provided',
          city: 'Not provided',
          state: 'Not provided',
          country: 'India',
          memberTier: 'Member',
          memberSince: new Date().toISOString().slice(0, 10),
          rewardCoins: 0,
          dietPreference: 'Not specified',
          roomPreference: 'Not specified',
          idType: 'Not specified',
          coTravelers: [],
        });

        handleClose();
        navigateToTravelerProfile();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setIsLoading(false);
      setErrorMessage('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  const handleGoogleAuth = () => {
    const rateCheck = authRateLimiter.checkAllowed();
    if (!rateCheck.allowed) {
      setErrorMessage(rateCheck.reason || 'Too many attempts. Please wait.');
      return;
    }
    if (!csrfToken || !verifyCsrfToken(csrfToken)) {
      setErrorMessage('Security token validation failed. Please reopen the sign-in window.');
      return;
    }
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setErrorMessage('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to the deployment environment.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    googleLogin();
  };

  if (!isTravelerAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 relative">
          <button type="button" onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer z-10" aria-label="Close"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">Google Verified Authentication</span></div>
          <h2 className="text-xl font-black tracking-tight text-white">{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
            {(['signin', 'signup'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => { setAuthMode(mode); setErrorMessage(''); }} className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${authMode === mode ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80' : 'text-stone-500 hover:text-stone-900'}`}>
                {mode === 'signin' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}<span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
              </button>
            ))}
          </div>
          {errorMessage && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600 shrink-0" /><span>{errorMessage}</span></div>}
          <button type="button" onClick={handleGoogleAuth} disabled={isLoading} className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-stone-400 text-stone-900 font-extrabold text-sm flex items-center justify-center gap-3 transition shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="w-5 h-5 text-stone-700 animate-spin" /> : <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" /></svg>}
            <span>{isLoading ? 'Verifying with Google...' : authMode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
          </button>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11.5px] font-bold text-stone-500"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /><span>Google OAuth verification • Secure server-side token check</span></div>
        </div>
      </div>
    </div>
  );
};

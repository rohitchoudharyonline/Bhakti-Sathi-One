import React, { useEffect, useState } from 'react';
import { useTours } from '../../context/TourContext';
import { supabase } from '../../lib/supabase';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthDiagnosticsModal } from '../auth/AuthDiagnosticsModal';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
  Terminal,
} from 'lucide-react';

export const TravelerAuthModal: React.FC = () => {
  const {
    isTravelerAuthModalOpen,
    setIsTravelerAuthModalOpen,
    navigateToTravelerProfile,
  } = useTours();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  useEffect(() => {
    if (isTravelerAuthModalOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setIsLoading(false);
    }
  }, [isTravelerAuthModalOpen]);

  const handleClose = () => {
    setIsTravelerAuthModalOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(false);
  };

  const handleSupabaseGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Supabase Google OAuth error:', err);
      setErrorMessage(err?.message || 'Google OAuth authentication failed. Please ensure Supabase Auth Google provider is configured.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTravelerAuthModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="absolute inset-0"
          onClick={handleClose}
        />

        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="relative bg-stone-900 text-white p-6 pb-5 text-center space-y-2">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FF4B00] mx-auto flex items-center justify-center shadow-lg shadow-[#FF4B00]/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight">Traveler Portal Sign In</h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Secure authentication for mybhaktisathi.com
              </p>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">
            
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>{successMessage}</div>
              </div>
            )}

            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                Sign in with your verified Google / Gmail account to access your tours, bookings, and spiritual practice logs on mybhaktisathi.com.
              </p>

              {/* Official Google Sign-In Button */}
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    try {
                      const decoded: any = jwtDecode(credentialResponse.credential || '');
                      const googleUser = {
                        id: decoded.sub || 'usr-' + Date.now(),
                        email: decoded.email || '',
                        fullName: decoded.name || 'Bhaktisathi User',
                        avatarUrl: decoded.picture || '',
                        phone: '+91 98765 43210',
                      };
                      if (!googleUser.email) {
                        throw new Error('Unable to retrieve email from Google credential.');
                      }
                      localStorage.setItem('hh_direct_traveler_profile', JSON.stringify(googleUser));
                      setSuccessMessage(`Successfully authenticated as ${googleUser.email}!`);
                      setTimeout(() => {
                        handleClose();
                        navigateToTravelerProfile();
                      }, 500);
                    } catch (e: any) {
                      console.error('Google token decode error:', e);
                      setErrorMessage(e?.message || 'Google Sign-In verification failed.');
                    }
                  }}
                  onError={() => {
                    setErrorMessage('Google Sign-In authentication failed. Please try again.');
                  }}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-stone-400 text-[11px] font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <button
                onClick={handleSupabaseGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting to Supabase...</span>
                  </>
                ) : (
                  <span>Continue with Supabase Auth (Google)</span>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Client ID: 969580668423-... • mybhaktisathi.com</span>
              </div>
              <button
                onClick={() => setIsDiagnosticsOpen(true)}
                className="text-xs font-bold text-[#FF4B00] hover:underline flex items-center gap-1.5 pt-1 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" /> Open Auth Diagnostics &amp; Raw Logs
              </button>
            </div>

          </div>

        </div>
      </div>

      <AuthDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </>
  );
};

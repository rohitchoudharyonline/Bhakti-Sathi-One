import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useTours } from '../../context/TourContext';
import { X, ShieldCheck, AlertCircle, Loader2, Check } from 'lucide-react';

export const TravelerAuthModal: React.FC = () => {
  const {
    isTravelerAuthModalOpen,
    setIsTravelerAuthModalOpen,
    loginWithGoogleIdToken,
    navigateToTravelerProfile,
  } = useTours();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential?.trim();
    if (!idToken) {
      setErrorMessage('Google did not return a valid sign-in credential. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await loginWithGoogleIdToken(idToken);
      try {
        localStorage.removeItem('hh_google_oauth_token');
      } catch {}

      setSuccessMessage('Google account verified. Your Holidays Hunt account is ready.');
      window.setTimeout(() => {
        handleClose();
        navigateToTravelerProfile();
      }, 350);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setErrorMessage(error?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTravelerAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="relative bg-stone-900 text-white p-6 pb-5 text-center space-y-2">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
            aria-label="Close sign in dialog"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#FF4B00] mx-auto flex items-center justify-center shadow-lg shadow-[#FF4B00]/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-lg font-black tracking-tight">Traveler Sign In / Sign Up</h2>
          <p className="text-xs text-stone-300 mt-0.5">Secure Google / Gmail authentication</p>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <div>{successMessage}</div>
            </div>
          )}

          <div className="text-center space-y-4 py-2">
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Use your Google account. New users are created automatically; existing users are signed into the same Holidays Hunt account.
            </p>

            <div className="flex justify-center w-full min-h-11">
              {isLoading ? (
                <div className="w-full py-3.5 rounded-2xl bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Google account securely…
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMessage('Google Sign-In was cancelled or could not be completed. Please try again.')}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="continue_with"
                  shape="pill"
                  useOneTap
                />
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google credential verified on the server</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useTours } from '../../context/TourContext';
import { X, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export const TravelerAuthModal: React.FC = () => {
  const {
    isTravelerAuthModalOpen,
    setIsTravelerAuthModalOpen,
    loginWithGoogleIdToken,
  } = useTours();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isTravelerAuthModalOpen) {
      setErrorMessage('');
      setIsLoading(false);
    }
  }, [isTravelerAuthModalOpen]);

  const handleClose = () => {
    setIsTravelerAuthModalOpen(false);
    setErrorMessage('');
    setIsLoading(false);
  };

  if (!isTravelerAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
              Secure Google Authorization
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Sign In with Google
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-stone-600">
              Welcome to Bhakti Sathi!
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              To verify your identity, view custom itineraries, and manage travel inquiries, please sign in securely using your standard Google/Gmail account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-[#FF4B00] animate-spin" />
              <p className="text-xs font-bold text-stone-600">Verifying session with Google...</p>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setIsLoading(true);
                    setErrorMessage('');
                    try {
                      await loginWithGoogleIdToken(credentialResponse.credential);
                      handleClose();
                    } catch (err: any) {
                      setErrorMessage(err?.message || 'Authentication with Google failed.');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                onError={() => {
                  setErrorMessage('Google Sign-In failed or was closed. Please try again.');
                }}
                useOneTap
                theme="filled_blue"
                size="large"
                shape="pill"
                text="signin_with"
              />
            </div>
          )}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11.5px] font-bold text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official Google Identity • Encrypted Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

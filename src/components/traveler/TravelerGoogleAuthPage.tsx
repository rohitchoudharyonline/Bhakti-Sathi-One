import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ArrowLeft, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTours } from '../../context/TourContext';
import { Navbar } from '../common/Navbar';
import { BrandLogo } from '../common/BrandLogo';

export const TravelerGoogleAuthPage: React.FC = () => {
  const { loginWithGoogleIdToken, navigateToHome } = useTours();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSuccess = async ({ credential }: { credential?: string }) => {
    const idToken = credential?.trim();
    if (!idToken) {
      setError('Google did not return a valid credential. Please try again.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await loginWithGoogleIdToken(idToken);
      try { localStorage.removeItem('hh_google_oauth_token'); } catch {}
      setSuccess('Google account verified. Your secure traveler account is ready.');
    } catch (err) {
      console.error('Traveler Google authentication failed:', err);
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pb-28">
      <div className="w-full max-w-md">
        <button onClick={navigateToHome} className="mb-6 flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" /> Back to Tours
        </button>

        <section className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
          <div className="bg-stone-950 text-white p-7 text-center">
            <div className="inline-flex items-center justify-center bg-white px-4 py-2 rounded-2xl mx-auto mb-4 shadow-lg">
              <BrandLogo size="xs" />
            </div>
            <h1 className="text-2xl font-black">Traveler Sign In / Sign Up</h1>
            <p className="mt-2 text-sm text-stone-300">Use your Google / Gmail account</p>
          </div>

          <div className="p-7 space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 flex gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 flex gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <p className="text-center text-sm text-stone-600 leading-relaxed">
              New travelers are registered automatically. Existing travelers are signed into the same Holidays Hunt account.
            </p>

            <div className="min-h-12 flex justify-center">
              {loading ? (
                <div className="w-full rounded-2xl bg-stone-100 py-4 flex items-center justify-center gap-2 font-bold text-stone-700">
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying securely…
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => setError('Google sign-in was cancelled or could not be completed. Please try again.')}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  useOneTap
                />
              )}
            </div>

            <div className="border-t border-stone-100 pt-5 text-center text-xs text-stone-500 font-semibold">
              Google credential is verified on the server. No Google token is stored in browser localStorage.
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
);
};

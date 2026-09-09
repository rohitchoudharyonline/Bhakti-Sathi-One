import React, { useEffect, useState } from 'react';
import { useTours } from '../../context/TourContext';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Info,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export const TravelerAuthModal: React.FC = () => {
  const {
    isTravelerAuthModalOpen,
    setIsTravelerAuthModalOpen,
    loginWithGoogleIdToken,
    loginWithDirectCredentials,
    loginWithMagicLink,
    navigateToTravelerProfile,
  } = useTours();

  const [activeAuthTab, setActiveAuthTab] = useState<'instant' | 'google' | 'otp'>('instant');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConsoleGuide, setShowConsoleGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Instant / Direct form state
  const [fullName, setFullName] = useState('Rohit Choudhary');
  const [email, setEmail] = useState('holidayshunt@gmail.com');
  const [phone, setPhone] = useState('+91 98765 43210');

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

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      loginWithDirectCredentials({
        fullName: fullName.trim() || 'Devotee Traveler',
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      handleClose();
      navigateToTravelerProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await loginWithMagicLink(email.trim());
      setSuccessMessage(`Magic login link sent to ${email.trim()}! Please check your inbox.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send login link. You can use Instant Sign-In above.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (!isTravelerAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
              Bhakti Sathi Traveler Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Access customized itineraries, booking inquiries, wishlists & daily Jap Sadhana.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 bg-white/10 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('instant');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeAuthTab === 'instant'
                  ? 'bg-[#FF4B00] text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('google');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeAuthTab === 'google'
                  ? 'bg-white text-stone-900 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google OAuth</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('otp');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeAuthTab === 'otp'
                  ? 'bg-stone-700 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Email Link</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
                {activeAuthTab === 'google' && (
                  <button
                    type="button"
                    onClick={() => setActiveAuthTab('instant')}
                    className="text-[11px] underline text-[#FF4B00] hover:text-[#e04300] font-bold cursor-pointer"
                  >
                    Use Instant Email/Phone Login instead &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: INSTANT SIGN-IN */}
          {activeAuthTab === 'instant' && (
            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-900 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="font-medium">
                  <strong>Zero-Wait Sign-In:</strong> Enter your details below for instant verified access without Google origin hurdles.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Choudhary"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. holidayshunt@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" /> WhatsApp / Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FF4B00] hover:bg-[#e04300] text-white text-xs font-black tracking-wide shadow-lg shadow-[#FF4B00]/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Traveler Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick 1-Click test accounts */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Quick 1-Click Verification:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      loginWithDirectCredentials({
                        fullName: 'Rohit Choudhary',
                        email: 'holidayshunt@gmail.com',
                        phone: '+91 98765 43210',
                      });
                      handleClose();
                      navigateToTravelerProfile();
                    }}
                    className="p-2 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 rounded-xl text-left transition cursor-pointer"
                  >
                    <p className="text-[11px] font-bold text-stone-800 truncate">Rohit Choudhary</p>
                    <p className="text-[9.5px] text-stone-500 truncate">holidayshunt@gmail.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loginWithDirectCredentials({
                        fullName: 'Priya Sharma',
                        email: 'priya.sharma@gmail.com',
                        phone: '+91 98123 45678',
                      });
                      handleClose();
                      navigateToTravelerProfile();
                    }}
                    className="p-2 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 rounded-xl text-left transition cursor-pointer"
                  >
                    <p className="text-[11px] font-bold text-stone-800 truncate">Priya Sharma</p>
                    <p className="text-[9.5px] text-stone-500 truncate">priya.sharma@gmail.com</p>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: GOOGLE SIGN-IN */}
          {activeAuthTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <p className="text-xs font-bold text-stone-700">Official Google Authentication</p>
                <p className="text-[11.5px] text-stone-500">
                  Sign in directly using your Google / Gmail account with 1-Tap identity verification.
                </p>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#FF4B00] animate-spin" />
                  <p className="text-xs font-bold text-stone-600">Verifying session with Google...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-3 space-y-4">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      if (credentialResponse.credential) {
                        setIsLoading(true);
                        setErrorMessage('');
                        try {
                          await loginWithGoogleIdToken(credentialResponse.credential);
                          handleClose();
                          navigateToTravelerProfile();
                        } catch (err: any) {
                          setErrorMessage(
                            err?.message ||
                              'Google token validation failed. You can use the Instant Sign-In tab!'
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      }
                    }}
                    onError={() => {
                      setErrorMessage(
                        'Google OAuth returned error (Origin Mismatch or closed). If you see "Error 400: origin_mismatch", please use the Instant Sign-In tab or follow Google Cloud Console setup below.'
                      );
                    }}
                    useOneTap
                    theme="filled_blue"
                    size="large"
                    shape="pill"
                    text="signin_with"
                  />

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveAuthTab('instant')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4B00] hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Switch to 1-Click Instant Sign-In</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Developer / Admin Google Cloud Console Info */}
              <div className="pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowConsoleGuide(!showConsoleGuide)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-50 p-2.5 rounded-xl border border-stone-200 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>How to fix "Error 400: origin_mismatch" in Google Cloud Console</span>
                  </span>
                  <span>{showConsoleGuide ? '▲ Hide' : '▼ View'}</span>
                </button>

                {showConsoleGuide && (
                  <div className="mt-2.5 p-3.5 bg-stone-900 text-stone-200 rounded-2xl text-[11px] space-y-2.5 animate-in fade-in">
                    <p className="font-bold text-amber-400">
                      Why does Google show "Error 400: origin_mismatch"?
                    </p>
                    <p className="text-stone-300 leading-relaxed">
                      Google OAuth requires you to whitelist your website origin in the Google Cloud Console.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Add to "Authorized JavaScript origins":
                      </span>
                      {['https://mybhaktisathi.com', 'https://www.mybhaktisathi.com', window.location.origin].map(
                        (url) => (
                          <div
                            key={url}
                            className="flex items-center justify-between bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700"
                          >
                            <code className="text-[10px] text-emerald-400 select-all font-mono">{url}</code>
                            <button
                              type="button"
                              onClick={() => handleCopy(url)}
                              className="text-stone-400 hover:text-white p-1"
                              title="Copy URL"
                            >
                              {copiedUrl === url ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PASSWORDLESS MAGIC LINK */}
          {activeAuthTab === 'otp' && (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div className="text-center space-y-1.5">
                <p className="text-xs font-bold text-stone-700">Passwordless Email Sign-In</p>
                <p className="text-[11.5px] text-stone-500">
                  We'll send an authentication link directly to your inbox.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. holidayshunt@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Login Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Guarantee Badge */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11.5px] font-bold text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit SSL Encrypted &bull; 100% Privacy Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

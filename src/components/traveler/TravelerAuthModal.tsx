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
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  RotateCcw,
} from 'lucide-react';

export const TravelerAuthModal: React.FC = () => {
  const {
    isTravelerAuthModalOpen,
    setIsTravelerAuthModalOpen,
    loginWithPassword,
    signupWithPassword,
    sendOtpCode,
    verifyOtpCode,
    resetPasswordWithOtp,
    navigateToTravelerProfile,
  } = useTours();

  const [activeAuthTab, setActiveAuthTab] = useState<'otp' | 'password' | 'register'>('otp');
  const [passwordSubView, setPasswordSubView] = useState<'login' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password Login & Signup Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // OTP Login Fields
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Forgot Password Fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp_reset'>('email');

  useEffect(() => {
    if (isTravelerAuthModalOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setIsLoading(false);
      setOtpSent(false);
      setOtpCode('');
      setPasswordSubView('login');
      setForgotStep('email');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    }
  }, [isTravelerAuthModalOpen]);

  const handleClose = () => {
    setIsTravelerAuthModalOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginWithPassword({ email: email.trim(), password });
      handleClose();
      navigateToTravelerProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await signupWithPassword({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      handleClose();
      navigateToTravelerProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await sendOtpCode(otpEmail.trim());
      setOtpSent(true);
      setSuccessMessage(res.message || `A 6-digit verification code was sent to ${otpEmail.trim()}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await verifyOtpCode(otpEmail.trim(), otpCode.trim());
      handleClose();
      navigateToTravelerProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Step 1 - Send OTP
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await sendOtpCode(forgotEmail.trim());
      setForgotStep('otp_reset');
      setSuccessMessage(res.message || `Password reset code sent to ${forgotEmail.trim()}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to dispatch reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP & Set New Password
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit reset code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await resetPasswordWithOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });
      handleClose();
      navigateToTravelerProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Password reset failed. Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
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
            {activeAuthTab === 'register'
              ? 'Create Traveler Account'
              : passwordSubView === 'forgot'
              ? 'Reset Your Password'
              : activeAuthTab === 'otp'
              ? 'OTP Email Verification'
              : 'Sign In to Your Account'}
          </h2>
          
          <p className="text-xs text-stone-300 mt-1">
            Access your sacred itineraries, booking inquiries, wishlists &amp; Jap Sadhana counter.
          </p>

          {/* Navigation Tabs (OTP Code / Password / Register) */}
          <div className="flex items-center gap-1.5 mt-4 bg-white/10 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('otp');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeAuthTab === 'otp'
                  ? 'bg-[#FF4B00] text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>OTP Code</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('password');
                setPasswordSubView('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeAuthTab === 'password'
                  ? 'bg-[#FF4B00] text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeAuthTab === 'register'
                  ? 'bg-stone-700 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: PASSWORD AUTH (SIGN IN & FORGOT PASSWORD) */}
          {activeAuthTab === 'password' && (
            <div>
              {passwordSubView === 'login' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rohit@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-stone-400" /> Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordSubView('forgot');
                            setForgotEmail(email || '');
                            setForgotStep('email');
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="text-xs font-bold text-[#FF4B00] hover:text-[#d43e00] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
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
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-2 text-xs text-stone-500">
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAuthTab('register');
                        setErrorMessage('');
                      }}
                      className="font-bold text-[#FF4B00] hover:underline"
                    >
                      Register Now
                    </button>
                  </div>
                </form>
              ) : (
                /* FORGOT PASSWORD WORKFLOW */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordSubView('login');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <span className="text-[11px] font-bold text-stone-400">
                      Step {forgotStep === 'email' ? '1 of 2' : '2 of 2'}
                    </span>
                  </div>

                  {forgotStep === 'email' ? (
                    <form onSubmit={handleForgotSendOtp} className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-[#FF4B00] mx-auto flex items-center justify-center">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-stone-800">Password Recovery</h3>
                        <p className="text-xs text-stone-500">
                          Enter your account email to receive a 6-digit password reset code.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400" /> Account Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rohit@gmail.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#FF4B00] hover:bg-[#e04300] text-white text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Reset Code...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            <span>Send 6-Digit Reset Code</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotResetPassword} className="space-y-4">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
                        <span>Resetting for: <strong>{forgotEmail}</strong></span>
                        <button
                          type="button"
                          onClick={() => setForgotStep('email')}
                          className="text-[#FF4B00] font-bold hover:underline"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-stone-400" /> 6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-stone-400" /> New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            placeholder="At least 6 characters"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-stone-400" /> Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Re-type new password"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#FF4B00] hover:bg-[#e04300] text-white text-xs font-black tracking-wide shadow-lg shadow-[#FF4B00]/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <span>Set New Password &amp; Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={handleForgotSendOtp}
                          disabled={isLoading}
                          className="text-xs text-stone-500 hover:text-stone-800 underline font-medium"
                        >
                          Resend Code to Email
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 6-DIGIT EMAIL OTP AUTH */}
          {activeAuthTab === 'otp' && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <p className="text-xs font-bold text-stone-700">Verified Email OTP Login</p>
                <p className="text-[11.5px] text-stone-500">
                  Receive a secure 6-digit verification code directly to your email inbox.
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rohit@gmail.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
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
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send 6-Digit Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
                    <span>Sent to: <strong>{otpEmail}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#FF4B00] font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-stone-400" /> 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6 digits"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#FF4B00] hover:bg-[#e04300] text-white text-xs font-black tracking-wide shadow-lg shadow-[#FF4B00]/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-xs text-stone-500 hover:text-stone-800 underline font-medium"
                    >
                      Resend Verification Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {activeAuthTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
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
                    placeholder="e.g. rohit@gmail.com"
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

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:border-[#FF4B00] focus:outline-hidden transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create &amp; Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-stone-500">
                <span>Already registered?</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAuthTab('password');
                    setPasswordSubView('login');
                    setErrorMessage('');
                  }}
                  className="font-bold text-[#FF4B00] hover:underline"
                >
                  Sign In with Password
                </button>
              </div>
            </form>
          )}

          {/* Security Guarantee Badge */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11.5px] font-bold text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit SSL Encrypted &bull; Cloudflare D1 Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

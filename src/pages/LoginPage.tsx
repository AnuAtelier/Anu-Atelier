import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AtSign,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

const RANDOM_CUSTOMER_EMAILS = [
  'priya.crafts@gmail.com',
  'artisan.shreya@gmail.com',
  'craftlover.pooja@gmail.com',
  'ananya.designs@gmail.com',
  'riya.handmade@gmail.com',
  'sharma.neha@gmail.com',
  'crafty.vibes@gmail.com',
  'customer.aarti@gmail.com',
  'divya.crochet@gmail.com',
  'meera.decor@gmail.com',
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithEmail, loginWithSocial, loginWithVerificationCode, isLoading, error } = useAuthStore();

  // Pick a random customer email placeholder for the login bracket
  const [randomEmailPlaceholder] = useState(() => {
    return RANDOM_CUSTOMER_EMAILS[Math.floor(Math.random() * RANDOM_CUSTOMER_EMAILS.length)];
  });

  // Check if user came from an admin route or has ?from=admin
  const isAdminRequired =
    location.search.includes('admin') ||
    (location.state as any)?.from?.pathname?.startsWith('/admin') ||
    (location.state as any)?.from?.pathname?.startsWith('/seller');

  const redirectPath = (location.state as any)?.from?.pathname || (isAdminRequired ? '/admin' : '/profile');

  // Auto-redirect logged in customer directly into their logined page without needing to login again
  useEffect(() => {
    if (user && !isAdminRequired) {
      const destination = redirectPath === '/login' ? '/profile' : redirectPath;
      navigate(destination, { replace: true });
    }
  }, [user, isAdminRequired, redirectPath, navigate]);

  // Customer login states: email vs social handle
  const [authMethod, setAuthMethod] = useState<'email' | 'social'>('email');
  const [emailAuthMode, setEmailAuthMode] = useState<'otp' | 'password'>('otp');

  // Inputs: remember stored email from browser storage if present
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('anu_customer_email') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification flow state
  const [isVerifyingStep, setIsVerifyingStep] = useState(false);
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [socialLoading, setSocialLoading] = useState<'google' | 'instagram' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Timer countdown for resending verification code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Generate and send verification code
  const handleSendCode = (targetIdentifier: string) => {
    setFormError(null);
    if (!targetIdentifier.trim()) {
      setFormError(authMethod === 'email' ? 'Please enter a valid email address.' : 'Please enter your social media handle.');
      return;
    }

    if (authMethod === 'email' && !targetIdentifier.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(generated);
    setVerificationCode('');
    setIsVerifyingStep(true);
    setCountdown(30);
  };

  // Resend code handler
  const handleResendCode = () => {
    const currentTarget = authMethod === 'email' ? email : socialHandle;
    handleSendCode(currentTarget);
  };

  // Submit verification code and log in
  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!verificationCode.trim()) {
      setFormError('Please enter the verification code.');
      return;
    }

    if (verificationCode.trim() !== sentCode) {
      setFormError('Invalid verification code. Please check the code provided above and try again.');
      return;
    }

    setVerifySuccess(true);

    const identifier = authMethod === 'email' ? email : socialHandle;
    const type = authMethod === 'email' ? 'email' : 'social_handle';

    setTimeout(async () => {
      const res = await loginWithVerificationCode(identifier, verificationCode, type);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setVerifySuccess(false);
        setFormError(res.error || 'Verification failed. Please try again.');
      }
    }, 700);
  };

  // Submit standard email + password form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await loginWithEmail(email, password);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(res.error || 'Failed to login');
    }
  };

  // One-click Social Media Sign In with verification
  const handleSocialLogin = async (provider: 'google' | 'instagram') => {
    setFormError(null);
    setSocialLoading(provider);

    // Simulate quick verification handshake
    setTimeout(async () => {
      const res = await loginWithSocial(provider);
      setSocialLoading(null);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setFormError(res.error || `Failed to sign in with ${provider}.`);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--secondary)]/30 via-[var(--bg-color)] to-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Navigation */}
      <nav className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-pink-100 bg-white/70 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Storefront</span>
        </Link>
      </nav>

      {/* Main Login Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-gradient-to-br from-white/95 via-pink-50/35 to-purple-50/25 backdrop-blur-xl border border-pink-200/70 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center mb-3 group">
              <div className="relative flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-105">
                <div className="absolute inset-0 rounded-full bg-rose-500/25 blur-md animate-heart-aura pointer-events-none" />
                <img
                  src="/logo.png"
                  alt="Anu Atelier Logo"
                  className="relative z-10 h-16 w-16 object-contain drop-shadow-sm animate-heartbeat"
                />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-[var(--text-main)]">
                Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
              </span>
            </Link>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {isAdminRequired ? 'Admin Panel Login' : 'Welcome to Anu Atelier'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              {isAdminRequired
                ? 'Sign in as store administrator to manage crafts and orders'
                : 'Sign in with your email or social media handle to track orders & wishlist'}
            </p>
          </div>

          {/* Admin Prompt Highlight Banner */}
          {isAdminRequired && (
            <div className="mb-6 p-3.5 rounded-2xl bg-pink-100/70 border border-pink-200 text-[var(--primary-dark)] text-xs flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Store Admin Access Required</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  The admin panel is reserved for authorized store administrators. Please sign in with your administrator credentials.
                </p>
              </div>
            </div>
          )}

          {/* Customer Auth Method Switcher (Hidden in Admin Mode) */}
          {!isAdminRequired && !isVerifyingStep && (
            <div className="flex rounded-2xl bg-pink-100/60 p-1 mb-6 border border-pink-200/50">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setFormError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-white text-[var(--primary-dark)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email ID</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('social');
                  setFormError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'social'
                    ? 'bg-white text-[var(--primary-dark)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <AtSign className="h-3.5 w-3.5" />
                <span>Social Media Handle</span>
              </button>
            </div>
          )}

          {/* Error Alert */}
          {(formError || error) && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>{formError || error}</span>
            </div>
          )}

          {/* STEP 1: INITIAL INPUT FORM */}
          {!isVerifyingStep ? (
            <>
              {/* --- EMAIL AUTH METHOD --- */}
              {authMethod === 'email' && (
                <div>
                  {!isAdminRequired && (
                    <div className="flex items-center justify-end gap-3 mb-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEmailAuthMode(emailAuthMode === 'otp' ? 'password' : 'otp')}
                        className="text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                      >
                        {emailAuthMode === 'otp' ? 'Sign in with Password instead' : 'Sign in with Verification Code'}
                      </button>
                    </div>
                  )}

                  {emailAuthMode === 'password' || isAdminRequired ? (
                    /* Password Flow */
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder={randomEmailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                          />
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-11 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                          />
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Sign In</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP Email Flow */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder={randomEmailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                          />
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-pink-500" />
                          <span>We'll send a 6-digit verification code to confirm your email.</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendCode(email)}
                        className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Send Verification Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- SOCIAL MEDIA HANDLE AUTH METHOD --- */}
              {authMethod === 'social' && !isAdminRequired && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                      Social Media Handle (Instagram / Threads / X)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="@craftlover_india"
                        value={socialHandle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSocialHandle(val.startsWith('@') || val === '' ? val : `@${val}`);
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                      />
                      <AtSign className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-pink-500" />
                      <span>Login with your creator handle & verify your profile.</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendCode(socialHandle)}
                    className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* --- 1-CLICK SOCIAL MEDIA AUTH BUTTONS --- */}
              {!isAdminRequired && (
                <div className="mt-8 pt-6 border-t border-pink-100">
                  <div className="relative mb-5 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold bg-white/70 px-3 py-1 rounded-full border border-pink-100">
                      Or Continue With Social Media
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Google Login */}
                    <button
                      type="button"
                      disabled={!!socialLoading}
                      onClick={() => handleSocialLogin('google')}
                      className="py-2.5 px-3 rounded-2xl border border-pink-200 bg-white/90 hover:bg-white text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {socialLoading === 'google' ? (
                        <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      )}
                      <span>Google</span>
                    </button>

                    {/* Instagram Login */}
                    <button
                      type="button"
                      disabled={!!socialLoading}
                      onClick={() => handleSocialLogin('instagram')}
                      className="py-2.5 px-3 rounded-2xl border border-pink-200 bg-white/90 hover:bg-white text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {socialLoading === 'instagram' ? (
                        <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" />
                          <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="2" />
                          <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)" />
                          <defs>
                            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#fdf497" />
                              <stop offset="45%" stopColor="#fd5949" />
                              <stop offset="65%" stopColor="#d6249f" />
                              <stop offset="100%" stopColor="#285AEB" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      <span>Instagram</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* STEP 2: VERIFICATION CODE STEP */
            <form onSubmit={handleVerifyAndLogin} className="space-y-4">
              {/* Interactive Verification Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-xs text-[var(--primary-dark)] space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold">
                  <KeyRound className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                  <span>Verification Code Sent</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  Enter the 6-digit verification code below to verify your{' '}
                  <span className="font-semibold text-rose-700">
                    {authMethod === 'email' ? email : socialHandle}
                  </span>
                  .
                </p>
                {sentCode && (
                  <div className="pt-1 flex items-center justify-between bg-white/80 p-2 rounded-xl border border-pink-200/80">
                    <span className="text-[11px] text-[var(--text-muted)]">Verification Code:</span>
                    <span className="font-mono font-bold text-base tracking-widest text-rose-600 bg-pink-100/70 px-2.5 py-0.5 rounded-lg border border-pink-300">
                      {sentCode}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.3em] font-mono font-bold text-lg py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-[var(--text-muted)]"
                  />
                  <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
                </div>
              </div>

              {/* Submit & Verify Button */}
              <button
                type="submit"
                disabled={isLoading || verifySuccess}
                className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {verifySuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>✓ Verified! Redirecting...</span>
                  </>
                ) : isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>

              {/* Verification Navigation & Resend */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyingStep(false);
                    setVerificationCode('');
                    setFormError(null);
                  }}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  ← Change {authMethod === 'email' ? 'Email' : 'Handle'}
                </button>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleResendCode}
                  className={`flex items-center gap-1 font-semibold ${
                    countdown > 0
                      ? 'text-[var(--text-muted)] cursor-not-allowed'
                      : 'text-[var(--primary)] hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${countdown > 0 ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Signup Link */}
          <p className="text-center text-xs sm:text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--primary)] hover:underline font-semibold">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

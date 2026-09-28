import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, loginWithDemo, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Check if user came from an admin route or has ?from=admin
  const isAdminRequired =
    location.search.includes('admin') ||
    (location.state as any)?.from?.pathname?.startsWith('/admin') ||
    (location.state as any)?.from?.pathname?.startsWith('/seller');

  const redirectPath = (location.state as any)?.from?.pathname || (isAdminRequired ? '/admin' : '/');

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleDemoLogin = (role: 'admin' | 'customer') => {
    loginWithDemo(role);
    navigate(role === 'admin' ? '/admin' : '/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--secondary)]/30 via-[var(--bg-color)] to-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-200">
      {/* Clean Minimal Top Navigation for Auth */}
      <nav className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/50 backdrop-blur-xs">
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
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-lg-soft">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center mb-3 group">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 shadow-md mb-2 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo-icon.jpg"
                  alt="Anu Atelier Logo"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-[var(--text-main)]">
                Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
              </span>
            </Link>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {isAdminRequired ? 'Admin Panel Login' : 'Welcome Back'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              {isAdminRequired
                ? 'Sign in as store owner to manage crafts and orders'
                : 'Sign in to access your wishlist, saved addresses and orders'}
            </p>
          </div>

          {/* Admin Prompt Highlight Banner */}
          {isAdminRequired && (
            <div className="mb-6 p-3.5 rounded-2xl bg-pink-50 border border-pink-200 text-[var(--primary-dark)] text-xs flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Store Admin Access Required</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  The admin panel is reserved for store owner Anushka (<code>anushka32199@gmail.com</code>). You can use the 1-click button below.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {(formError || error) && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>{formError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="anushka32199@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
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
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md-soft hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Quick Fast 1-Click Login Section */}
          <div className="mt-8 pt-6 border-t border-[var(--border-color)] space-y-3">
            <p className="text-xs font-semibold text-center text-[var(--text-muted)] uppercase tracking-wider">
              Fast 1-Click Demo Login
            </p>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full py-3 px-4 rounded-2xl border-2 border-pink-400/40 bg-pink-50 text-[var(--primary-dark)] hover:bg-pink-100 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              <span>Login as Anushka (Admin: anushka32199@gmail.com)</span>
            </button>

            {!isAdminRequired && (
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="w-full py-2.5 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-main)] text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <UserCheck className="h-4 w-4 text-emerald-500" />
                <span>Login as Customer (Demo Shopper)</span>
              </button>
            )}
          </div>

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

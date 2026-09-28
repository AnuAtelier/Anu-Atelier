import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, loginWithDemo, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectPath = (location.state as any)?.from?.pathname || '/';

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
    navigate(role === 'admin' ? '/admin/add-craft' : redirectPath, { replace: true });
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 flex items-center justify-center bg-gradient-to-b from-[var(--secondary)]/20 via-[var(--bg-color)] to-[var(--bg-color)]">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-lg-soft">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-heading text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
            </span>
          </Link>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)]">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Log in to manage orders, wishlist, or artisan crafts
          </p>
        </div>

        {/* Error Alert */}
        {(formError || error) && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
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

        {/* Demo Fast Access Section */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] space-y-3">
          <p className="text-xs font-semibold text-center text-[var(--text-muted)] uppercase tracking-wider">
            Quick 1-Click Fast Login
          </p>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="w-full py-2.5 px-4 rounded-2xl border border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/40 text-[var(--primary-dark)] hover:bg-pink-100 dark:hover:bg-pink-900/60 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            <span>Login as Anushka (Admin: anushka32199@gmail.com)</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            className="w-full py-2.5 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-main)] text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all"
          >
            <UserCheck className="h-4 w-4 text-emerald-500" />
            <span>Login as Customer (Demo Shopper)</span>
          </button>
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
  );
};

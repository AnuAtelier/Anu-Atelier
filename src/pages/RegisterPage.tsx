import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signupWithEmail, isLoading, error } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const res = await signupWithEmail(email, password, fullName, phone);
    if (res.success) {
      navigate('/profile');
    } else {
      setFormError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--secondary)]/30 via-[var(--bg-color)] to-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-200">
      {/* Clean Minimal Top Navigation for Auth */}
      <nav className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-pink-100 bg-white/70 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Storefront</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-gradient-to-br from-white/95 via-pink-50/35 to-purple-50/25 backdrop-blur-xl border border-pink-200/70 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center mb-3 group">
              <img
                src="/logo.png"
                alt="Anu Atelier Logo"
                className="h-16 w-16 object-contain drop-shadow-sm mb-2 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-heading text-2xl font-bold tracking-tight text-[var(--text-main)]">
                Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
              </span>
            </Link>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Join the Anu Atelier family to track orders & save wishlist
            </p>
          </div>

          {(formError || error) && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-xs">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200/70 bg-white/85 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Password (6+ chars) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
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
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--primary)] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

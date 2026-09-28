import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  HeartHandshake,
  MessageCircle,
  MapPin,
  ArrowUp,
  Globe,
  ChevronDown,
  Check,
} from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../constants';

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR (₹)', flag: '🇮🇳' },
  { code: 'US', name: 'United States', currency: 'USD ($)', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP (£)', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED (د.إ)', flag: '🇦🇪' },
  { code: 'CA', name: 'Canada', currency: 'CAD ($)', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currency: 'AUD ($)', flag: '🇦🇺' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

export const Footer: React.FC = () => {
  // Country & Language preference state
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('anu_country') || 'IN';
  });
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('anu_lang') || 'en';
  });
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
  const [preferenceFeedback, setPreferenceFeedback] = useState<string | null>(null);

  // Floating Back to Top visibility
  const [showFloatingTop, setShowFloatingTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSavePreferences = (countryCode: string, langCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedLang(langCode);
    localStorage.setItem('anu_country', countryCode);
    localStorage.setItem('anu_lang', langCode);
    const countryObj = COUNTRIES.find((c) => c.code === countryCode);
    const langObj = LANGUAGES.find((l) => l.code === langCode);
    setPreferenceFeedback(`Saved: ${countryObj?.flag} ${countryObj?.name} (${countryObj?.currency}) • ${langObj?.native}`);
    setTimeout(() => {
      setPreferenceFeedback(null);
      setIsPreferenceModalOpen(false);
    }, 1200);
  };

  const currentCountry = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];
  const currentLang = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <footer className="mt-auto relative">
      {/* Floating Back to Top Button */}
      {showFloatingTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 animate-scale-in"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Trust Highlights Bar - Slim & Light */}
      <div className="border-t border-b border-[var(--border-color)] py-2.5 sm:py-3 px-4 sm:px-6 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Free Delivery</h4>
              <p className="text-[11px] text-gray-600">Above ₹{DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">{DEFAULT_SITE_SETTINGS.replacementDays}-Day Returns</h4>
              <p className="text-[11px] text-gray-600">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">100% Handmade</h4>
              <p className="text-[11px] text-gray-600">Direct Indian artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Secure Payments</h4>
              <p className="text-[11px] text-gray-600">UPI, Cards & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slim Back to Top Action Bar */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-1.5 bg-[#18181b] hover:bg-[#232328] text-white hover:text-pink-300 text-xs font-semibold flex items-center justify-center gap-1.5 border-b border-stone-800 transition-colors tracking-wide cursor-pointer"
      >
        <ArrowUp className="h-3.5 w-3.5 text-[var(--primary)]" />
        <span>Back to top</span>
      </button>

      {/* Main Footer Links & Information - Slim, Thin & Dark */}
      <div className="bg-[#141416] text-white">
        <div className="max-w-7xl mx-auto py-5 sm:py-6 px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Brand & Information Column */}
          <div className="space-y-2">
            <Link to="/" className="inline-block">
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
              </span>
            </Link>
            <p className="text-xs text-stone-300 leading-normal line-clamp-2">
              Authentic handmade Indian crafts, terracotta pottery, and artisan-stitched fashion directly to your doorstep.
            </p>

            <div className="space-y-1 pt-1 text-xs text-stone-300">
              <a
                href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}</span>
              </a>

              <div className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                <span>Uttar Pradesh, India</span>
              </div>
            </div>
          </div>

          {/* Collections Column */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-2 text-white tracking-wide">
              Collections
            </h4>
            <ul className="space-y-1 text-xs text-stone-300">
              <li>
                <Link to="/category/terracotta-clay" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Terracotta & Clay Items
                </Link>
              </li>
              <li>
                <Link to="/category/embroidered-clothes" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Embroidered Clothes & Kurtis
                </Link>
              </li>
              <li>
                <Link to="/category/other-handicrafts" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Handmade Craft Gifts & Jute
                </Link>
              </li>
              <li>
                <Link to="/search?q=diyas" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Artisan Diyas & Decor
                </Link>
              </li>
              <li>
                <Link to="/search?q=macrame" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Boho Macrame Hangings
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-2 text-white tracking-wide">
              Customer Care
            </h4>
            <ul className="space-y-1 text-xs text-stone-300">
              <li>
                <Link to="/cart" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  My Cart & Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  My Profile & Addresses
                </Link>
              </li>
              <li>
                <Link to="/login?from=admin" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Artisan / Admin Login
                </Link>
              </li>
              <li>
                <a
                  href={`tel:+91${DEFAULT_SITE_SETTINGS.whatsappNumber}`}
                  className="hover:text-white hover:translate-x-1 inline-block transition-all"
                >
                  Helpline: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}
                </a>
              </li>
            </ul>
          </div>

          {/* Region & Language Preferences Column */}
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm mb-1.5 text-white tracking-wide">
              Region & Language
            </h4>
            <p className="text-xs text-stone-300 mb-2 leading-snug">
              Choose your country, currency and preferred language for Anu Atelier.
            </p>

            {/* Language & Country Switcher Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsPreferenceModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white hover:border-pink-400 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-pink-400" />
                  <span>
                    {currentCountry.flag} {currentCountry.name} • {currentLang.native}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright - Slim & Thin */}
        <div className="border-t border-stone-800/80 py-2.5 text-center text-xs text-stone-400 px-4 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <p>&copy; {new Date().getFullYear()} Anu Atelier. All handmade crafts proudly crafted by Indian Artisans 🇮🇳</p>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <button
              onClick={() => setIsPreferenceModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Change Language & Region
            </button>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>

      {/* LANGUAGE & COUNTRY SELECTOR MODAL */}
      {isPreferenceModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsPreferenceModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#18181b] border border-stone-700 rounded-3xl p-6 text-white shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-pink-400" />
                <h3 className="font-heading text-lg font-bold text-white">
                  Language & Country Preferences
                </h3>
              </div>
              <button
                onClick={() => setIsPreferenceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {preferenceFeedback && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
                ✨ {preferenceFeedback}
              </div>
            )}

            {/* Select Country */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Select Your Country & Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSavePreferences(country.code, selectedLang)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      selectedCountry === country.code
                        ? 'border-[var(--primary)] bg-pink-950/40 text-white font-bold ring-1 ring-pink-500/40'
                        : 'border-stone-700 bg-stone-900/60 text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                    {selectedCountry === country.code && <Check className="h-3.5 w-3.5 text-pink-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Language */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Select Your Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSavePreferences(selectedCountry, lang.code)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      selectedLang === lang.code
                        ? 'border-[var(--primary)] bg-pink-950/40 text-white font-bold ring-1 ring-pink-500/40'
                        : 'border-stone-700 bg-stone-900/60 text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <span>{lang.native}</span>
                    {selectedLang === lang.code && <Check className="h-3.5 w-3.5 text-pink-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsPreferenceModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

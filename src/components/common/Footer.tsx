import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../constants';
import { WhatsAppIcon } from './WhatsAppFloat';

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
    <footer className="mt-auto relative z-20 overflow-hidden">

      {/* Trust Highlights Bar - Slim & Light */}
      <div className="border-t border-b border-rose-200/80 py-2.5 px-4 sm:px-6 bg-gradient-to-r from-rose-100/60 via-white to-pink-100/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="group flex items-center gap-2 p-2 rounded-xl bg-white/95 backdrop-blur-sm border border-rose-200/70 shadow-xs hover:border-rose-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <Truck className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-gray-900 group-hover:text-rose-600 transition-colors leading-tight">Free Delivery</h4>
              <p className="text-[10.5px] text-gray-600 font-medium">Above ₹{DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}</p>
            </div>
          </div>

          <div className="group flex items-center gap-2 p-2 rounded-xl bg-white/95 backdrop-blur-sm border border-sky-200/70 shadow-xs hover:border-sky-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <RotateCcw className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-gray-900 group-hover:text-sky-600 transition-colors leading-tight">{DEFAULT_SITE_SETTINGS.replacementDays}-Day Returns</h4>
              <p className="text-[10.5px] text-gray-600 font-medium">Hassle-free replacement</p>
            </div>
          </div>

          <div className="group flex items-center gap-2 p-2 rounded-xl bg-white/95 backdrop-blur-sm border border-amber-200/70 shadow-xs hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <HeartHandshake className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-gray-900 group-hover:text-amber-600 transition-colors leading-tight">100% Handmade</h4>
              <p className="text-[10.5px] text-gray-600 font-medium">Direct Indian artisans</p>
            </div>
          </div>

          <div className="group flex items-center gap-2 p-2 rounded-xl bg-white/95 backdrop-blur-sm border border-emerald-200/70 shadow-xs hover:border-emerald-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight">Secure Payments</h4>
              <p className="text-[10.5px] text-gray-600 font-medium">UPI, Cards & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shimmering Animated Silk Gradient Ribbon - Slim 2px */}
      <div className="h-[2px] w-full bg-gradient-to-r from-rose-500 via-amber-400 via-pink-500 to-rose-500 bg-[length:200%_auto] animate-text-gradient shadow-[0_0_8px_rgba(244,63,94,0.3)]"></div>

      {/* Slim Back to Top Action Bar - Ultra Compact */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-1.5 bg-gradient-to-r from-rose-100/90 via-pink-100/95 to-rose-100/90 hover:from-rose-200 hover:to-pink-200 text-rose-900 text-xs font-bold flex items-center justify-center gap-1.5 border-b border-rose-200 transition-all tracking-wide cursor-pointer group shadow-2xs"
        aria-label="Scroll back to top"
      >
        <ArrowUp className="h-3 w-3 text-rose-600 group-hover:-translate-y-0.5 transition-transform duration-200" />
        <span className="text-[11px] font-bold tracking-wide">Back to top</span>
      </button>

      {/* Main Footer Links & Information - Slim, Thin & Compact */}
      <div className="bg-gradient-to-b from-[#fff1f4] via-[#fce7ed] to-[#fadbe4] text-gray-900 relative overflow-hidden">
        {/* Ambient Floating Soft Light Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/3 -right-16 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-pink-200/30 rounded-full blur-2xl animate-pulse-glow"></div>
        </div>

        <div className="max-w-7xl mx-auto py-4 sm:py-5 px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {/* Brand & Information Column */}
          <div className="space-y-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                {/* Soft ambient heart halo that breathes in sync with the pulse */}
                <div className="absolute inset-0 rounded-full bg-rose-500/25 blur-sm animate-heart-aura pointer-events-none" />
                <img
                  src="/logo.png"
                  alt="Anu Atelier Logo"
                  className="relative z-10 h-10 w-10 object-contain drop-shadow-sm flex-shrink-0 animate-heartbeat"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-tight">
                  Anu<span className="bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 bg-[length:200%_auto] animate-text-gradient bg-clip-text text-transparent italic font-semibold">Atelier</span>
                </span>
                <span className="text-[9.5px] tracking-widest uppercase font-bold text-rose-600/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  Artisan Studio &bull; Handmade India
                  <Sparkles className="h-2 w-2 text-amber-500 animate-sparkle-spin inline-block ml-0.5" />
                </span>
              </div>
            </Link>
            <p className="text-[11.5px] text-gray-700 leading-snug line-clamp-2 font-normal">
              Authentic handmade Indian crafts, terracotta pottery, and artisan-stitched fashion directly to your doorstep.
            </p>

            <div className="space-y-1 pt-0.5 text-xs text-gray-700">
              <a
                href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-[11.5px] text-[#15803d] hover:text-emerald-800 transition-colors group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <WhatsAppIcon className="h-3.5 w-3.5 text-[#16a34a] group-hover:scale-110 transition-transform" />
                <span>WhatsApp: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}</span>
              </a>

              <div className="flex items-center gap-1.5 text-[11.5px] text-gray-700 font-medium">
                <MapPin className="h-3 w-3 text-rose-600 flex-shrink-0" />
                <span>Uttar Pradesh, India</span>
              </div>
            </div>
          </div>

          {/* Collections Column - Slim & Compact */}
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm mb-1.5 text-gray-900 tracking-wide flex items-center gap-1">
              <span>Collections</span>
              <span className="w-6 h-0.5 bg-gradient-to-r from-rose-400 to-transparent rounded-full"></span>
            </h4>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>
                <Link to="/customer-favorites" className="group flex items-center gap-1.5 hover:text-amber-700 font-semibold transition-all text-[11.5px] text-amber-900">
                  <span className="w-1 h-1 rounded-full bg-amber-400 group-hover:w-2 group-hover:bg-amber-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Customer Favorites ⭐</span>
                </Link>
              </li>
              <li>
                <Link to="/category/terracotta-clay" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Terracotta & Clay Items</span>
                </Link>
              </li>
              <li>
                <Link to="/category/embroidered-clothes" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Embroidered Clothes & Kurtis</span>
                </Link>
              </li>
              <li>
                <Link to="/category/other-handicrafts" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Handmade Craft Gifts & Jute</span>
                </Link>
              </li>
              <li>
                <Link to="/search?q=diyas" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Artisan Diyas & Decor</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column - Slim & Compact */}
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm mb-1.5 text-gray-900 tracking-wide flex items-center gap-1">
              <span>Customer Care</span>
              <span className="w-6 h-0.5 bg-gradient-to-r from-rose-400 to-transparent rounded-full"></span>
            </h4>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>
                <Link to="/cart" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">My Cart & Orders</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">My Profile & Addresses</span>
                </Link>
              </li>
              <li>
                <Link to="/login?from=admin" className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]">
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Artisan / Admin Login</span>
                </Link>
              </li>
              <li>
                <a
                  href={`tel:+91${DEFAULT_SITE_SETTINGS.whatsappNumber}`}
                  className="group flex items-center gap-1.5 hover:text-rose-600 font-medium transition-all text-[11.5px]"
                >
                  <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:w-2 group-hover:bg-rose-600 transition-all duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-150">Helpline: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Region & Language Preferences Column - Slim */}
          <div className="space-y-1.5">
            <h4 className="font-heading font-bold text-xs sm:text-sm mb-1 text-gray-900 tracking-wide">
              Region & Language
            </h4>
            <p className="text-[11.5px] text-gray-700 mb-1.5 leading-snug">
              Choose your country, currency and preferred language for Anu Atelier.
            </p>

            {/* Language & Country Switcher Button */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setIsPreferenceModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-rose-50/80 border border-rose-200 text-gray-900 hover:border-rose-400 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-rose-600 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-[11px]">
                    {currentCountry.flag} {currentCountry.name} • {currentLang.native}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright - Slim & Thin */}
        <div className="border-t border-rose-200/90 bg-[#fadbe4]/60 py-2 text-center text-xs text-gray-700 px-4 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-1.5 relative z-10">
          <p className="font-medium text-[11px] flex items-center gap-1 justify-center sm:justify-start">
            &copy; {new Date().getFullYear()} Anu Atelier. All handmade crafts proudly crafted by Indian Artisans 🇮🇳
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-700 font-medium">
            <button
              onClick={() => setIsPreferenceModalOpen(true)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Change Language & Region
            </button>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-rose-600 transition-colors cursor-pointer font-bold group inline-flex items-center gap-0.5"
            >
              <span>Back to Top</span>
              <span className="group-hover:-translate-y-0.5 transition-transform duration-150">↑</span>
            </button>
          </div>
        </div>
      </div>

      {/* LANGUAGE & COUNTRY SELECTOR MODAL */}
      {isPreferenceModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsPreferenceModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 text-gray-900 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-rose-600" />
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  Language & Country Preferences
                </h3>
              </div>
              <button
                onClick={() => setIsPreferenceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-gray-600 hover:text-gray-900 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {preferenceFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                ✨ {preferenceFeedback}
              </div>
            )}

            {/* Select Country */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                Select Your Country & Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSavePreferences(country.code, selectedLang)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      selectedCountry === country.code
                        ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-500/50 shadow-xs'
                        : 'border-rose-200/80 bg-rose-50/40 text-gray-800 hover:bg-rose-100/60 hover:text-gray-950 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                    {selectedCountry === country.code && <Check className="h-3.5 w-3.5 text-rose-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Language */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                Select Your Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSavePreferences(selectedCountry, lang.code)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      selectedLang === lang.code
                        ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-500/50 shadow-xs'
                        : 'border-rose-200/80 bg-rose-50/40 text-gray-800 hover:bg-rose-100/60 hover:text-gray-950 font-medium'
                    }`}
                  >
                    <span>{lang.native}</span>
                    {selectedLang === lang.code && <Check className="h-3.5 w-3.5 text-rose-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsPreferenceModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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

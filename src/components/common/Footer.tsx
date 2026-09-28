import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, HeartHandshake, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../constants';

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setIsSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer className="mt-auto">
      {/* Trust Highlights Bar - Kept Light Background with clear icons & text */}
      <div className="border-t border-b border-[var(--border-color)] py-8 px-4 sm:px-8 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900">Free Delivery</h4>
              <p className="text-xs sm:text-sm text-gray-600">On orders above ₹{DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900">{DEFAULT_SITE_SETTINGS.replacementDays}-Day Returns</h4>
              <p className="text-xs sm:text-sm text-gray-600">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900">100% Handmade</h4>
              <p className="text-xs sm:text-sm text-gray-600">Direct from authentic Indian artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900">Secure Payments</h4>
              <p className="text-xs sm:text-sm text-gray-600">UPI, Cards & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information - Luxury Dark */}
      <div className="bg-[#141416] text-white">
        <div className="max-w-7xl mx-auto py-12 sm:py-14 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Information Column */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
            </span>
          </Link>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Bringing you authentic handmade Indian crafts, terracotta pottery, and artisan-stitched fashion directly to your doorstep.
          </p>

          <div className="space-y-2.5 pt-1 text-sm text-stone-300">
            <a
              href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}</span>
            </a>
            <div className="flex items-center gap-2 text-stone-300">
              <Mail className="h-4 w-4 text-pink-400" />
              <span>{DEFAULT_SITE_SETTINGS.supportEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <MapPin className="h-4 w-4 text-pink-400" />
              <span>Crafted in Uttar Pradesh, India</span>
            </div>
          </div>
        </div>

        {/* Collections Column */}
        <div>
          <h4 className="font-heading font-bold text-lg sm:text-xl mb-4 text-white tracking-wide">
            Collections
          </h4>
          <ul className="space-y-3 text-sm sm:text-base text-stone-300">
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
          <h4 className="font-heading font-bold text-lg sm:text-xl mb-4 text-white tracking-wide">
            Customer Care
          </h4>
          <ul className="space-y-3 text-sm sm:text-base text-stone-300">
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
            <li>
              <span className="text-xs sm:text-sm text-stone-400 block pt-1">
                Mon - Sat (9:00 AM - 8:00 PM IST)
              </span>
            </li>
          </ul>
        </div>

        {/* Artisan Drops / Newsletter Column */}
        <div>
          <h4 className="font-heading font-bold text-lg sm:text-xl mb-4 text-white tracking-wide">
            Artisan Drops
          </h4>
          <p className="text-sm sm:text-base text-stone-300 mb-4 leading-relaxed">
            Subscribe to receive notifications when our craftswomen release limited edition handmade batches.
          </p>

          {isSubscribed ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-semibold">
              ✨ Thank you! You will be notified on new artisan drops.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2.5 text-sm rounded-full border border-stone-700 bg-stone-900/90 text-white placeholder-stone-400 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-full transition-all shadow-md flex-shrink-0"
                >
                  Join
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Zero spam. Only authentic handcrafted artisan updates.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-stone-800 py-6 text-center text-xs sm:text-sm text-stone-400 px-4">
        <p>&copy; {new Date().getFullYear()} Anu Atelier. All handmade crafts proudly crafted by Indian Artisans 🇮🇳</p>
      </div>
      </div>
    </footer>
  );
};

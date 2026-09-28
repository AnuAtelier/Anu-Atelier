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
      {/* Trust Highlights Bar - Slim & Light */}
      <div className="border-t-2 border-b border-[var(--border-color)] py-4 sm:py-5 px-4 sm:px-8 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">Free Delivery</h4>
              <p className="text-xs text-gray-600">On orders above ₹{DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">{DEFAULT_SITE_SETTINGS.replacementDays}-Day Returns</h4>
              <p className="text-xs text-gray-600">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">100% Handmade</h4>
              <p className="text-xs text-gray-600">Direct from Indian artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">Secure Payments</h4>
              <p className="text-xs text-gray-600">UPI, Cards & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information - Slim & Dark */}
      <div className="bg-[#141416] text-white">
        <div className="max-w-7xl mx-auto py-8 sm:py-9 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand & Information Column */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Authentic handmade Indian crafts, terracotta pottery, and artisan-stitched fashion directly to your doorstep.
            </p>

            <div className="space-y-1.5 pt-1 text-xs sm:text-sm text-stone-300">
              <a
                href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-1.5 text-stone-300">
                <Mail className="h-3.5 w-3.5 text-pink-400" />
                <span>{DEFAULT_SITE_SETTINGS.supportEmail}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="h-3.5 w-3.5 text-pink-400" />
                <span>Uttar Pradesh, India</span>
              </div>
            </div>
          </div>

          {/* Collections Column */}
          <div>
            <h4 className="font-heading font-bold text-base sm:text-lg mb-3 text-white tracking-wide">
              Collections
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
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
            <h4 className="font-heading font-bold text-base sm:text-lg mb-3 text-white tracking-wide">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
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
                <span className="text-[11px] sm:text-xs text-stone-400 block pt-0.5">
                  Mon - Sat (9:00 AM - 8:00 PM IST)
                </span>
              </li>
            </ul>
          </div>

          {/* Artisan Drops / Newsletter Column */}
          <div>
            <h4 className="font-heading font-bold text-base sm:text-lg mb-3 text-white tracking-wide">
              Artisan Drops
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mb-3 leading-relaxed">
              Get notified when our artisans release limited handmade craft batches.
            </p>

            {isSubscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
                ✨ Subscribed! You will be notified on drops.
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
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-full border border-stone-700 bg-stone-900/90 text-white placeholder-stone-400 focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-full transition-all shadow-md flex-shrink-0"
                  >
                    Join
                  </button>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-400">
                  Zero spam. Only authentic artisan updates.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright - Slim */}
        <div className="border-t border-stone-800/80 py-3.5 sm:py-4 text-center text-xs text-stone-400 px-4">
          <p>&copy; {new Date().getFullYear()} Anu Atelier. All handmade crafts proudly crafted by Indian Artisans 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
};

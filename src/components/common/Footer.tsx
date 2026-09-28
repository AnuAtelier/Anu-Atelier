import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, HeartHandshake, MessageCircle } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] transition-colors">
      {/* Trust Highlights Bar */}
      <div className="border-b border-[var(--border-color)] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-main)]">Free Delivery</h4>
              <p className="text-xs text-[var(--text-muted)]">On orders above ₹{DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-main)]">{DEFAULT_SITE_SETTINGS.replacementDays}-Day Returns</h4>
              <p className="text-xs text-[var(--text-muted)]">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-main)]">100% Handmade</h4>
              <p className="text-xs text-[var(--text-muted)]">Direct from authentic artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-main)]">Secure Payments</h4>
              <p className="text-xs text-[var(--text-muted)]">UPI, Cards & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <span className="font-heading text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
            </span>
          </Link>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Bringing you authentic handmade Indian crafts, terracotta pottery, and artisan-stitched fashion directly to your doorstep.
          </p>
          <a
            href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp: +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}
          </a>
        </div>

        {/* Shop Col */}
        <div>
          <h4 className="font-heading font-semibold text-base mb-4 text-[var(--text-main)]">Collections</h4>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            <li>
              <Link to="/category/terracotta-clay" className="hover:text-[var(--primary)] transition-colors">
                Terracotta & Clay Items
              </Link>
            </li>
            <li>
              <Link to="/category/embroidered-clothes" className="hover:text-[var(--primary)] transition-colors">
                Embroidered Clothes
              </Link>
            </li>
            <li>
              <Link to="/category/other-handicrafts" className="hover:text-[var(--primary)] transition-colors">
                Handmade Craft Gifts
              </Link>
            </li>
            <li>
              <Link to="/search?q=diyas" className="hover:text-[var(--primary)] transition-colors">
                Artisan Diyas & Decor
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-heading font-semibold text-base mb-4 text-[var(--text-main)]">Customer Care</h4>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            <li>
              <Link to="/cart" className="hover:text-[var(--primary)] transition-colors">
                My Cart & Orders
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-[var(--primary)] transition-colors">
                My Profile & Addresses
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-[var(--primary)] transition-colors">
                Artisan / Admin Login
              </Link>
            </li>
            <li>
              <span className="text-xs text-[var(--text-muted)]">
                Email: {DEFAULT_SITE_SETTINGS.supportEmail}
              </span>
            </li>
          </ul>
        </div>

        {/* Newsletter / Drops */}
        <div>
          <h4 className="font-heading font-semibold text-base mb-4 text-[var(--text-main)]">Artisan Drops</h4>
          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
            Subscribe to receive notifications when our artisans release limited handmade batches.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-3 py-2 text-xs rounded-full border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              onClick={() => alert('Thank you for subscribing to Anu Atelier!')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-full transition-colors flex-shrink-0"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[var(--border-color)] py-6 text-center text-xs text-[var(--text-muted)] px-4">
        <p>&copy; {new Date().getFullYear()} Anu Atelier. All handmade crafts proudly crafted in India 🇮🇳</p>
      </div>
    </footer>
  );
};

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Package, MessageCircle, ArrowRight } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../constants';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-8 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Order Placed Successfully 🎉
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
          Thank You for Supporting Authentic Artisans!
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
          Your order has been confirmed. Our craftswomen will carefully package your handmade items with sustainable materials.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Order Number</span>
          <span className="font-mono text-sm font-bold text-[var(--primary)]">{id || 'ANU-982145'}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <Truck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-[var(--text-main)]">Estimated Delivery in 3-5 Business Days</p>
            <p>You will receive SMS & WhatsApp tracking updates at +91 {DEFAULT_SITE_SETTINGS.whatsappNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <Package className="h-5 w-5 text-pink-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-[var(--text-main)]">100% Eco-Friendly Packaging</p>
            <p>Packed with recycled corrugated boxes and biodegradable fillers</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <a
          href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry%20regarding%20my%20order%20${id || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-xs sm:text-sm font-semibold text-[var(--text-main)] flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          <span>WhatsApp Updates</span>
        </a>
      </div>
    </div>
  );
};

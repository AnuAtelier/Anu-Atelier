import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Package, ArrowRight } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { WhatsAppIcon } from '../components/common/WhatsAppFloat';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-8 text-center space-y-6">
      <div className="relative mx-auto w-24 h-24 mb-2 flex items-center justify-center">
        <img src="/logo.png" alt="Anu Atelier" className="w-24 h-24 object-contain drop-shadow-md" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
          <CheckCircle className="h-5 w-5" />
        </div>
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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/95 via-emerald-50/35 to-teal-50/20 backdrop-blur-md border border-emerald-200/70 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
          <span className="text-xs text-[var(--text-muted)]">Order Number</span>
          <span className="font-mono text-sm font-bold text-[var(--primary)]">{id || 'ANU-982145'}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <Truck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
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
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <a
          href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=Hi%20Anu%20Atelier,%20I%20have%20an%20inquiry%20regarding%20my%20order%20${id || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-xs sm:text-sm font-bold text-emerald-900 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
          <span>WhatsApp Updates</span>
        </a>
      </div>
    </div>
  );
};

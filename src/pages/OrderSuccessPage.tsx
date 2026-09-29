import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Package, ArrowRight, Copy, Check, Clock, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { WhatsAppIcon } from '../components/common/WhatsAppFloat';
import { orderService } from '../services/orderService';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copiedTrack, setCopiedTrack] = useState(false);

  // Retrieve placed order from local history or fallback
  const order = id ? orderService.getOrder(id) : undefined;
  const trackingNumber = order?.trackingNumber || `EXP-${(id || '982145').slice(-6)}`;
  const courierPartner = order?.trackingCarrier || 'Express Air Courier (BlueDart / Delhivery)';

  const handleCopyTrack = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTrack(true);
    setTimeout(() => setCopiedTrack(false), 2000);
  };

  const whatsappMessage = `Hi Aditya, I have completed payment for Order ${id || ''} (Tracking: ${trackingNumber}). Please share the dispatch updates.`;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8 space-y-8">
      {/* Top Banner Celebration */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-500/25 blur-md animate-heart-aura pointer-events-none" />
          <img src="/logo.png" alt="Anu Atelier" className="relative z-10 w-20 h-20 object-contain drop-shadow-md animate-heartbeat" />
          <div className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white animate-scale-in">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300/60 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>Payment Verified & Order Confirmed</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
          Thank You for Supporting Authentic Artisans!
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          Your payment has been received and verified. Our craftswomen are preparing your authentic handcrafted parcel for safe express delivery.
        </p>
      </div>

      {/* 4-Stage Live Order Tracking Timeline */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/85 backdrop-blur-md border border-pink-200/60 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
              Live Order Status
            </span>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-gray-900">
              Order #{id || 'AA-26-892145'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span>Ready for Dispatch</span>
            </span>
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative pt-2">
          {/* Step 1: Placed & Paid */}
          <div className="flex sm:flex-col items-center sm:text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Order Confirmed</p>
              <p className="text-[10px] text-emerald-700 font-semibold">Payment Verified</p>
            </div>
          </div>

          {/* Step 2: Artisan Packing */}
          <div className="flex sm:flex-col items-center sm:text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 animate-pulse-soft">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Artisan Packing</p>
              <p className="text-[10px] text-amber-700 font-semibold">In Progress (Eco-Padded)</p>
            </div>
          </div>

          {/* Step 3: Courier Dispatch */}
          <div className="flex sm:flex-col items-center sm:text-center gap-3 opacity-75">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Express Courier</p>
              <p className="text-[10px] text-gray-500">Pickup Today</p>
            </div>
          </div>

          {/* Step 4: Doorstep Delivery */}
          <div className="flex sm:flex-col items-center sm:text-center gap-3 opacity-75">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Delivered</p>
              <p className="text-[10px] text-gray-500">In 3-5 Business Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Details & Dispatch Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
        {/* Box 1: Courier Tracking Info */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white/95 via-emerald-50/40 to-teal-50/20 backdrop-blur-md border border-emerald-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Truck className="h-4 w-4" />
              <span>Tracking Number (AWB)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
            <span className="font-mono text-sm sm:text-base font-bold text-emerald-900 tracking-wider">
              {trackingNumber}
            </span>
            <button
              onClick={handleCopyTrack}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedTrack ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700 pt-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Courier Partner:</span>
              <span className="font-semibold text-gray-900">{courierPartner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Delivery:</span>
              <span className="font-semibold text-emerald-700">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Transit Insurance:</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>100% Breakage-Free Covered</span>
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Payment & Delivery Address Summary */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white/95 via-rose-50/40 to-pink-50/20 backdrop-blur-md border border-pink-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Payment & Shipping</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
              Verified
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-bold text-gray-900">
                {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Instant UPI (GPay / PhonePe / Paytm)'}
              </span>
            </div>

            {order?.upiUtr && (
              <div className="flex justify-between">
                <span className="text-gray-500">UPI Ref / UTR:</span>
                <span className="font-mono font-bold text-emerald-700">{order.upiUtr}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Payee:</span>
              <span className="font-semibold text-gray-900">ADITYA SINGH (9555562542@airtel)</span>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <span className="text-gray-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-pink-600" />
                <span>Delivering To:</span>
              </span>
              <p className="font-semibold text-gray-900 leading-snug">
                {order?.shippingAddress.name || 'Customer'} (+91 {order?.shippingAddress.phone || DEFAULT_SITE_SETTINGS.whatsappNumber})
              </p>
              <p className="text-gray-600 leading-normal">
                {order?.shippingAddress.houseFlat}, {order?.shippingAddress.areaLandmark}, {order?.shippingAddress.city}, {order?.shippingAddress.state} - {order?.shippingAddress.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <a
          href={`https://wa.me/91${DEFAULT_SITE_SETTINGS.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-xs sm:text-sm font-bold text-emerald-900 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
          <span>Get Live Tracking on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};


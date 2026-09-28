import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, CheckCircle2, CreditCard, Banknote, Smartphone, Tag, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getSubtotal, getDeliveryFee, clearCart } = useCartStore();

  const [fullName, setFullName] = useState(user?.fullName || 'Anushka Singh');
  const [phone, setPhone] = useState(user?.phone || DEFAULT_SITE_SETTINGS.whatsappNumber);
  const [houseFlat, setHouseFlat] = useState('Flat 402, Royal Residency');
  const [areaLandmark, setAreaLandmark] = useState('Near Gomti Riverfront');
  const [city, setCity] = useState('Lucknow');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('226010');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [isPlacing, setIsPlacing] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();

  // Calculate discount
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (code === 'ANU10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: 'ANU10', discount });
      setCouponInput('');
    } else if (code === 'FIRST50') {
      const discount = Math.min(subtotal, 50);
      setAppliedCoupon({ code: 'FIRST50', discount });
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try ANU10 or FIRST50.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-[var(--text-main)]">
          Your cart is empty
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Please add handcrafted items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-dark)] transition-all"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacing(true);

    const orderId = `ANU-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      createdAt: Date.now(),
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        price: i.price,
        image: i.image,
        qty: i.qty,
      })),
      subtotal,
      discount: discountAmount,
      deliveryFee,
      total,
      shippingAddress: {
        id: 'addr_default',
        name: fullName,
        phone,
        pincode,
        houseFlat,
        areaLandmark,
        city,
        state,
        type: 'Home',
        isDefault: true,
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      status: 'Placed',
    };

    // 1. Save in local storage
    try {
      const existing = JSON.parse(localStorage.getItem('anu_orders') || '[]');
      localStorage.setItem('anu_orders', JSON.stringify([newOrder, ...existing]));
    } catch (err) {}

    // 2. Sync to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: orderData } = await supabase.from('orders').insert({
          order_number: orderId,
          user_id: user?.id || null,
          customer_name: fullName,
          customer_email: user?.email || `${phone}@customer.anuatelier.com`,
          customer_phone: phone,
          shipping_address: newOrder.shippingAddress,
          subtotal,
          shipping_fee: deliveryFee,
          discount: discountAmount,
          total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          order_status: 'pending',
        }).select().single();

        if (orderData?.id) {
          await supabase.from('order_items').insert(
            items.map((item) => ({
              order_id: orderData.id,
              product_id: item.productId,
              product_name: item.name,
              price: item.price,
              quantity: item.qty,
              image_url: item.image,
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase order creation warning:', err);
      }
    }

    // 3. Trigger celebration confetti
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (err) {}

    setTimeout(() => {
      clearCart();
      setIsPlacing(false);
      navigate(`/order-success/${orderId}`);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-main)]">
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Complete your order with secure delivery across India. Free delivery above ₹100!
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Address */}
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
            <h2 className="font-heading text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-sans">
                1
              </span>
              <span>Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Recipient Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Mobile Number (10 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  City, State <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Flat, House no., Building <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={houseFlat}
                  onChange={(e) => setHouseFlat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Area, Landmark, Street <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={areaLandmark}
                  onChange={(e) => setAreaLandmark(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
            <h2 className="font-heading text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-sans">
                2
              </span>
              <span>Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* COD */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[var(--primary)] bg-[var(--secondary)]/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="h-6 w-6 text-[var(--primary)]" />
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">Cash on Delivery</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Pay cash upon parcel arrival</p>
                </div>
              </label>

              {/* UPI */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[var(--primary)] bg-[var(--secondary)]/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className="h-6 w-6 text-emerald-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">UPI Instant Pay</p>
                  <p className="text-[11px] text-[var(--text-muted)]">GPay, PhonePe, Paytm</p>
                </div>
              </label>

              {/* Card */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[var(--primary)] bg-[var(--secondary)]/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="h-6 w-6 text-indigo-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">Credit / Debit Card</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Visa, Mastercard, RuPay</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary, Coupon & Place Order */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
            <h3 className="font-heading text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-3">
              Order Summary ({items.reduce((s, i) => s + i.qty, 0)})
            </h3>

            {/* Compact Item list */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-[var(--text-main)] truncate max-w-[180px]">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-semibold text-[var(--text-main)]">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-[var(--border-color)]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Coupon '{appliedCoupon.code}' applied (-₹{appliedCoupon.discount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. ANU10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] uppercase tracking-wider focus:outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-1.5 rounded-xl bg-[var(--secondary)] text-[var(--primary-dark)] hover:bg-[var(--primary)] hover:text-white text-xs font-semibold transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500">{couponError}</p>
                  )}
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Use <strong className="text-[var(--primary)]">ANU10</strong> for 10% off or <strong className="text-[var(--primary)]">FIRST50</strong> for ₹50 off!
                  </p>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--text-main)]">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping (Free &gt; ₹100)</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[var(--text-main)] pt-2 border-t border-[var(--border-color)]">
                <span>Grand Total</span>
                <span className="text-[var(--primary)]">₹{total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacing}
              className="w-full py-3.5 px-6 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <span>{isPlacing ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>100% Encrypted & Safe Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

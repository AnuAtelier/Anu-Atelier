import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, CheckCircle2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '../store/useCartStore';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const [fullName, setFullName] = useState('Anushka Singh');
  const [phone, setPhone] = useState(DEFAULT_SITE_SETTINGS.whatsappNumber);
  const [houseFlat, setHouseFlat] = useState('Flat 402, Royal Residency');
  const [areaLandmark, setAreaLandmark] = useState('Near Hanuman Temple, Gomti Nagar');
  const [city, setCity] = useState('Lucknow');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('226010');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-[var(--text-main)]">
          Your cart is empty
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
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
      discount: 0,
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

    // Save order in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('anu_orders') || '[]');
      localStorage.setItem('anu_orders', JSON.stringify([newOrder, ...existing]));
    } catch (e) {}

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setTimeout(() => {
      clearCart();
      setIsPlacing(false);
      navigate(`/order-success/${orderId}`);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-main)]">
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Complete your order with secure delivery across India.
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
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-gray-300'
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
                  <p className="text-[11px] text-[var(--text-muted)]">Pay cash upon parcel delivery</p>
                </div>
              </label>

              {/* UPI */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[var(--primary)] bg-[var(--secondary)]/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-gray-300'
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
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-gray-300'
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

        {/* Right Column: Order Summary & Place Order */}
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

            <div className="space-y-2 text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--text-main)]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
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

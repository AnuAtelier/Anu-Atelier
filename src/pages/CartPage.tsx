import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { DEFAULT_SITE_SETTINGS } from '../constants';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQty, removeFromCart, getSubtotal, getDeliveryFee, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const freeThreshold = DEFAULT_SITE_SETTINGS.freeDeliveryThreshold;
  const neededForFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-24 h-24 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center mx-auto">
          <ShoppingBag className="h-12 w-12 opacity-60" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[var(--text-main)]">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
          Looks like you haven't added any handcrafted treasures yet. Discover authentic terracotta and artisan clothing crafted with love.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md transition-all"
        >
          <span>Explore Handmade Crafts</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-main)]">
          Shopping Bag ({items.reduce((s, i) => s + i.qty, 0)})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Delivery Goal Bar */}
          <div className="rounded-2xl bg-[var(--secondary)]/40 p-4 border border-[var(--border-color)]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2 text-[var(--text-main)]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                {neededForFree > 0
                  ? `Add ₹${neededForFree} more for FREE Delivery`
                  : '🎉 FREE Delivery Unlocked!'}
              </span>
              <span className="text-[var(--primary-dark)] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-white dark:bg-black/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm"
              >
                {/* 4:5 Thumbnail */}
                <Link
                  to={`/product/${item.productId}`}
                  className="w-24 h-30 sm:w-28 sm:h-35 rounded-2xl overflow-hidden bg-[var(--bg-input)] flex-shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-heading text-base font-semibold text-[var(--text-main)] hover:text-[var(--primary)] transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[var(--text-muted)] hover:text-red-500 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.categoryName && (
                      <p className="text-xs text-[var(--primary)] font-semibold mt-1">
                        {item.categoryName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[var(--text-main)]">
                        ₹{item.price * item.qty}
                      </span>
                      {item.qty > 1 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          (₹{item.price} each)
                        </span>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border border-[var(--border-color)] rounded-full bg-[var(--bg-input)] px-2 py-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[var(--text-main)] min-w-[24px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sticky Price Details */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
            <h3 className="font-heading text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-color)] pb-3">
              Price Details
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="flex justify-between">
                <span>Price ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span className="font-semibold text-[var(--text-main)]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--text-main)] pt-3 border-t border-[var(--border-color)]">
                <span>Total Payable</span>
                <span className="text-[var(--primary)]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] pt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Safe & Secure Payments Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

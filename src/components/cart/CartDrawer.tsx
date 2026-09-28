import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { DEFAULT_SITE_SETTINGS } from '../../constants';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQty,
    removeFromCart,
    getSubtotal,
    getDeliveryFee,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const freeThreshold = DEFAULT_SITE_SETTINGS.freeDeliveryThreshold;
  const neededForFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <aside className="relative w-full max-w-md h-full bg-white/95 backdrop-blur-xl border-l border-pink-200/60 flex flex-col shadow-2xl z-10 transition-transform duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 via-white to-purple-50/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="font-heading text-lg font-bold text-[var(--text-main)]">
              Your Bag ({items.reduce((s, i) => s + i.qty, 0)})
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-pink-100/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Delivery Goal Bar */}
        <div className="bg-gradient-to-r from-pink-100/60 via-purple-100/40 to-rose-100/60 p-3.5 border-b border-pink-200/40">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-[var(--text-main)]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              {neededForFree > 0
                ? `Add ₹${neededForFree} more for FREE Delivery`
                : '🎉 FREE Delivery Unlocked!'}
            </span>
            <span className="text-[var(--primary-dark)] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/80 h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-pink-100/60 flex items-center justify-center text-[var(--primary)] border border-pink-200/60 shadow-sm">
                <ShoppingBag className="h-10 w-10 opacity-70" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-[var(--text-main)]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                Explore our authentic terracotta crafts and hand-stitched clothing to find your favorite piece.
              </p>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/');
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-700 transition-colors shadow-sm"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-2xl bg-white/75 backdrop-blur-sm border border-pink-200/70 shadow-xs hover:border-pink-300 transition-all"
              >
                {/* 4:5 image ratio */}
                <Link
                  to={`/product/${item.productId}`}
                  onClick={closeDrawer}
                  className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-200 border border-pink-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <Link
                        to={`/product/${item.productId}`}
                        onClick={closeDrawer}
                        className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--primary)] line-clamp-2 transition-colors leading-tight"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                        className="text-[var(--text-muted)] hover:text-red-500 p-1 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.categoryName && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                        {item.categoryName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-pink-100/70">
                    <span className="text-sm font-bold text-[var(--primary)]">
                      ₹{item.price * item.qty}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-pink-200 rounded-full bg-pink-50/50 px-1.5 py-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-[var(--text-main)] min-w-[20px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        aria-label="Increase quantity"
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-pink-200/60 bg-gradient-to-b from-white/95 via-pink-50/30 to-purple-50/30 backdrop-blur-md space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-pink-200/50 space-y-1.5 text-xs text-[var(--text-muted)] shadow-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--text-main)]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--text-main)] pt-2 border-t border-pink-100">
                <span>Total Amount</span>
                <span className="text-[var(--primary)]">₹{total}</span>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/checkout');
                }}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/cart');
                }}
                className="w-full py-2 text-center text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                View Full Cart Details
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

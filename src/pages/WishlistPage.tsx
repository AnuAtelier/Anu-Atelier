import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/common/ProductCard';

export const WishlistPage: React.FC = () => {
  const { items: wishlistIds } = useWishlistStore();
  const { products } = useProductStore();

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-12 px-3.5 sm:px-8 space-y-6 sm:space-y-8 w-full max-w-full min-w-0 overflow-hidden">
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-rose-500/10 backdrop-blur-md border border-pink-200/60 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            My Wishlist ({wishlistedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Handcrafted pieces you love and saved for later.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-pink-100/70 border border-pink-200/70 flex items-center justify-center text-[var(--primary)] shadow-xs">
          <Heart className="h-6 w-6 fill-current text-[var(--primary)]" />
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-16 px-6 text-center space-y-4 rounded-3xl bg-gradient-to-br from-white/90 via-pink-50/30 to-purple-50/20 backdrop-blur-md border border-pink-200/60 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-pink-100/70 border border-pink-200/60 text-[var(--primary)] flex items-center justify-center mx-auto shadow-xs">
            <Heart className="h-10 w-10 opacity-70" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-main)]">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Click the heart icon on any craft to save it here while you decide.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Browse Collections</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

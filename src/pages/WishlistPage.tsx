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
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-main)]">
            My Wishlist ({wishlistedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Handcrafted pieces you love and saved for later.
          </p>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center mx-auto">
            <Heart className="h-10 w-10 opacity-60" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-main)]">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Click the heart icon on any craft to save it here while you decide.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-dark)]"
          >
            <span>Browse Collections</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isLiked = isInWishlist(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked a button or link, don't trigger card navigation
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden transition-all duration-300 hover:shadow-md-soft hover:-translate-y-1 cursor-pointer"
    >
      {/* 4:5 Image Container */}
      <div className="relative w-full aspect-[4/5] bg-[var(--bg-input)] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
            isLiked
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 text-[var(--text-main)] hover:bg-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[var(--primary)] text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Desktop Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex gap-2 justify-center">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 px-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-102"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add to Cart</span>
          </button>
          <Link
            to={`/product/${product.slug || product.id}`}
            className="p-2 rounded-full bg-white/90 text-[var(--text-main)] hover:bg-white text-xs flex items-center justify-center shadow-md transition-transform hover:scale-105"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Subcategory & Rating row */}
          <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
            <span className="text-[var(--primary)] font-semibold uppercase tracking-wider truncate">
              {product.subcategoryName || product.categoryName}
            </span>

            {product.rating && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                <Star className="h-2.5 w-2.5 fill-current" />
                {product.rating}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading text-sm sm:text-base font-semibold text-[var(--text-main)] line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-base sm:text-lg font-bold text-[var(--text-main)]">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[var(--text-muted)] line-through">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="text-[10px] text-emerald-600 font-semibold ml-auto">
              Free Delivery
            </span>
          </div>

          {/* Touch / Mobile Action Button (Always visible on mobile) */}
          <div className="grid grid-cols-2 gap-2 mt-2 md:hidden">
            <button
              onClick={handleAddToCart}
              className="py-1.5 px-2 rounded-full bg-[var(--primary)] text-white text-xs font-semibold flex items-center justify-center gap-1"
            >
              <ShoppingBag className="h-3 w-3" />
              <span>Add</span>
            </button>
            <Link
              to={`/product/${product.slug || product.id}`}
              className="py-1.5 px-2 rounded-full border border-[var(--primary)] text-[var(--primary)] text-xs font-semibold flex items-center justify-center text-center"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

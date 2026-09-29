import React, { useState } from 'react';
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
  const [isHeartPopping, setIsHeartPopping] = useState(false);

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
    setIsHeartPopping(true);
    toggleWishlist(product.id);
    setTimeout(() => setIsHeartPopping(false), 450);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card-interactive shimmer-container group relative flex flex-col rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/80 hover:border-stone-300 hover:bg-white shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* 4:5 Image Container */}
      <div className="relative w-full aspect-[4/5] bg-stone-50/50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Wishlist Button with Spring Heart Pop Animation */}
        <button
          onClick={handleWishlistClick}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm active:scale-90 ${
            isLiked
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 text-[var(--text-main)] hover:bg-white hover:text-rose-500'
          } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
        >
          <Heart className={`h-4 w-4 transition-transform ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm animate-badge-pulse">
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
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:flex gap-2 justify-center">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 px-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-102 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add to Cart</span>
          </button>
          <Link
            to={`/product/${product.slug || product.id}`}
            className="p-2 rounded-full bg-white/90 text-[var(--text-main)] hover:bg-white active:scale-95 text-xs flex items-center justify-center shadow-md transition-transform hover:scale-105"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-gradient-to-b from-white/40 via-pink-50/20 to-rose-50/30">
        <div>
          {/* Subcategory & Rating row */}
          <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
            <span className="text-pink-600 font-bold uppercase tracking-wider truncate text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 border border-pink-200/50">
              {product.subcategoryName || product.categoryName}
            </span>

            {product.rating && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-bold text-[10px] border border-amber-200/50">
                <Star className="h-2.5 w-2.5 fill-current" />
                {product.rating}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors mt-1">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price Bracket Box */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-purple-500/10 border border-pink-200/50 mb-1">
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[11px] text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] sm:text-[10px] text-emerald-700 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-200/60 whitespace-nowrap ml-auto">
                Free Delivery
              </span>
            </div>
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

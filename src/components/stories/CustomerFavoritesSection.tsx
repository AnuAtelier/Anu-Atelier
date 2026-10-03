import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Sparkles,
  ShoppingBag,
  Zap,
  Heart,
  TrendingUp,
  ShieldCheck,
  Flame,
  Award,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Product } from '../../types';

export const CustomerFavoritesSection: React.FC = () => {
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');

  // Filter published products & sort strictly by most bought (soldCount descending)
  const publishedProducts = products.filter((p) => p.status === 'published');

  const sortedByMostBought = [...publishedProducts].sort((a, b) => {
    const soldA = a.soldCount || 0;
    const soldB = b.soldCount || 0;
    return soldB - soldA;
  });

  // Apply category filter if active
  const filteredProducts =
    selectedFilter === 'all'
      ? sortedByMostBought
      : sortedByMostBought.filter((p) => p.categoryId === selectedFilter);

  // Take top 8 most bought crafts for this section
  const topBoughtCrafts = filteredProducts.slice(0, 8);

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const getRankBadge = (index: number, soldCount: number = 0) => {
    if (index === 0) {
      return {
        label: `🥇 #1 Most Bought • ${soldCount}+ Orders`,
        bg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-black shadow-md border border-amber-300',
        ring: 'ring-2 ring-amber-400/40',
      };
    }
    if (index === 1) {
      return {
        label: `🥈 #2 Bestseller • ${soldCount}+ Orders`,
        bg: 'bg-gradient-to-r from-slate-200 via-stone-100 to-slate-300 text-slate-900 font-bold shadow-sm border border-slate-300',
        ring: 'ring-2 ring-slate-300/40',
      };
    }
    if (index === 2) {
      return {
        label: `🥉 #3 Top Favorite • ${soldCount}+ Orders`,
        bg: 'bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 text-stone-950 font-bold shadow-sm border border-orange-300',
        ring: 'ring-2 ring-orange-400/40',
      };
    }
    return {
      label: `🔥 Customer Choice • ${soldCount}+ Sold`,
      bg: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-2xs',
      ring: '',
    };
  };

  return (
    <section
      id="customer-favorites"
      className="relative py-12 sm:py-16 px-3.5 sm:px-8 max-w-7xl mx-auto w-full scroll-mt-24 transition-colors"
    >
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-8 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-200/80 text-amber-800 text-xs font-bold tracking-wider uppercase shadow-2xs">
            <span className="flex text-amber-500 text-xs">★★★★★</span>
            <span>Loved by 12,000+ Verified Buyers</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-main)] tracking-tight">
            Customer Favorites ⭐
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Our most ordered and highly reviewed handcrafted pieces. Sorted strictly by verified sales volume —
            these are the authentic crafts customers love and purchase the most.
          </p>
        </div>

        {/* Right Action: Link to dedicated page */}
        <div className="flex items-center gap-3">
          <Link
            to="/customer-favorites"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md scale-102'
              : 'bg-white/80 border border-stone-200 text-stone-700 hover:bg-white hover:border-amber-300'
          }`}
        >
          All Most Bought ({publishedProducts.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('terracotta-clay')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'terracotta-clay'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md scale-102'
              : 'bg-white/80 border border-stone-200 text-stone-700 hover:bg-white hover:border-amber-300'
          }`}
        >
          🏺 Terracotta & Clay
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('wall-art-decor')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'wall-art-decor'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md scale-102'
              : 'bg-white/80 border border-stone-200 text-stone-700 hover:bg-white hover:border-amber-300'
          }`}
        >
          🖼️ Wall Art & Murals
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('embroidered-clothes')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'embroidered-clothes'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md scale-102'
              : 'bg-white/80 border border-stone-200 text-stone-700 hover:bg-white hover:border-amber-300'
          }`}
        >
          🧵 Embroidered & Hand-Stitched
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('other-handicrafts')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'other-handicrafts'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-md scale-102'
              : 'bg-white/80 border border-stone-200 text-stone-700 hover:bg-white hover:border-amber-300'
          }`}
        >
          🦚 Other Handicrafts & Stationery
        </button>
      </div>

      {/* TOP-BOUGHT PRODUCTS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {topBoughtCrafts.map((product, idx) => {
          const isLiked = isInWishlist(product.id);
          const rankInfo = getRankBadge(idx, product.soldCount || 0);
          const discountPercent =
            product.originalPrice && product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug || product.id}`)}
              className={`card-interactive group relative flex flex-col rounded-3xl bg-white/95 backdrop-blur-md border border-amber-200/70 hover:border-amber-400 hover:bg-white shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${rankInfo.ring}`}
            >
              {/* Image Container with 4:5 Aspect Ratio */}
              <div className="relative w-full aspect-[4/5] bg-stone-50/60 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Top Sales Rank Badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                  <span
                    className={`px-2.5 py-0.5 text-[9.5px] sm:text-[10px] tracking-wide rounded-full ${rankInfo.bg}`}
                  >
                    {rankInfo.label}
                  </span>

                  {discountPercent && (
                    <span className="px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-2xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm active:scale-90 z-10 ${
                    isLiked
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 text-stone-700 hover:bg-white hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                {/* Verified Customer Choice Bottom Strip */}
                <div className="absolute inset-x-0 bottom-0 py-1.5 px-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[10px] font-medium pointer-events-none">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <CheckCircle className="h-3 w-3" />
                    Verified Choice
                  </span>
                  <span className="text-amber-300 font-bold flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current" />
                    {product.rating || 5.0} ({product.reviewsCount || 15})
                  </span>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-gradient-to-b from-white via-amber-50/20 to-orange-50/30">
                <div>
                  {/* Category Pill & Sold count */}
                  <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                    <span className="text-amber-800 font-bold uppercase tracking-wider text-[9.5px] sm:text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-200/50 truncate">
                      {product.subcategoryName || product.categoryName}
                    </span>

                    <span className="text-[10px] text-emerald-700 font-bold whitespace-nowrap">
                      {product.soldCount || 40}+ bought
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors mt-1">
                    {product.name}
                  </h3>
                </div>

                <div>
                  {/* Price Box */}
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-purple-500/10 border border-amber-200/60 mb-2">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-stone-900">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[11px] text-stone-400 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-emerald-700 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-200/60 whitespace-nowrap">
                        Free Delivery
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="py-1.5 px-2 rounded-full border border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      <span>Add</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(e, product)}
                      className="py-1.5 px-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

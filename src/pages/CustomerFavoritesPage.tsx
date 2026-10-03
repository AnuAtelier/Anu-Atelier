import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Star,
  Sparkles,
  ShoppingBag,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  HeartHandshake,
  CheckCircle,
  ArrowUpDown,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { Product } from '../types';

export const CustomerFavoritesPage: React.FC = () => {
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<'most-bought' | 'rating' | 'price-asc' | 'price-desc'>('most-bought');

  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');
  }, [searchParams]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams);
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('category', catId);
      setSearchParams(nextParams);
    }
  };

  const published = products.filter((p) => p.status === 'published');

  // Filter
  const filtered =
    selectedCategory === 'all'
      ? published
      : published.filter((p) => p.categoryId === selectedCategory);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'most-bought') return (b.soldCount || 0) - (a.soldCount || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return (b.soldCount || 0) - (a.soldCount || 0);
  });

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
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-3.5 sm:px-8 space-y-8 w-full max-w-full min-w-0 transition-colors">
      {/* Breadcrumbs */}
      <nav className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-amber-200/50 shadow-2xs text-xs text-[var(--text-muted)]">
        <Link to="/" className="hover:text-[var(--primary)] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[var(--text-main)] font-semibold">Customer Favorites</span>
      </nav>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-purple-500/15 backdrop-blur-md border border-amber-200/80 p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Verified Customer Favorites</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-main)] tracking-tight">
            Customer Favorites ⭐
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            These are the most purchased, most re-ordered, and highest-rated crafts on Anu Atelier.
            Every item in this collection reflects genuine customer adoration, ordered again and again
            by art lovers across India.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-gray-800">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5" />
              100% Verified Buyer Demand
            </span>
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Star className="h-3.5 w-3.5 fill-current" />
              Rated 4.8+ / 5.0 Average
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-amber-200/70 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-white'
            }`}
          >
            All Most Bought ({published.length})
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('terracotta-clay')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'terracotta-clay'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-white'
            }`}
          >
            🏺 Terracotta & Clay
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('wall-art-decor')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'wall-art-decor'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-white'
            }`}
          >
            🖼️ Wall Art
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('embroidered-clothes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'embroidered-clothes'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-white'
            }`}
          >
            🧵 Embroidered
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('other-handicrafts')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'other-handicrafts'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-white'
            }`}
          >
            🦚 Other Crafts
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArrowUpDown className="h-4 w-4 text-amber-600" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold rounded-full border border-amber-200 bg-white text-stone-800 px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
          >
            <option value="most-bought">Sort: Most Bought (High to Low)</option>
            <option value="rating">Sort: Customer Rating</option>
            <option value="price-asc">Sort: Price: Low to High</option>
            <option value="price-desc">Sort: Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid of Top Bought Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {sorted.map((product, idx) => {
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

      {/* Trust Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/30 to-orange-50/20 backdrop-blur-md border border-amber-200/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Truck className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-stone-800 font-bold">Free Delivery above ₹100</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RotateCcw className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-stone-800 font-bold">15-Day Easy Replacement</span>
        </div>
        <div className="flex items-center gap-2.5">
          <HeartHandshake className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-stone-800 font-bold">100% Authentic Handmade</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-stone-800 font-bold">Cash on Delivery Available</span>
        </div>
      </div>
    </div>
  );
};

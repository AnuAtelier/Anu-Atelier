import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  HeartHandshake,
  Star,
  ChevronRight,
  Share2,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { ProductCard } from '../components/common/ProductCard';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductBySlugOrId, products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const product = getProductBySlugOrId(slug || '');

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading text-3xl font-bold text-[var(--text-main)]">
          Craft Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          The requested craft might have been archived or is no longer available.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)]"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this authentic handmade craft "${product.name}" on Anu Atelier!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard! 🌸');
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus(`Available! Standard delivery to ${pincode} in 3-5 business days. Cash on Delivery available.`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-8 space-y-12 transition-colors">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-[var(--primary)] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        <Link to={`/category/${product.categoryId}`} className="hover:text-[var(--primary)] transition-colors">
          {product.categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-[var(--text-main)] font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Section: Two Columns (Sticky Gallery + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (4:5 Aspect Ratio) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--bg-input)] border border-[var(--border-color)] shadow-md-soft group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {product.badge && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[var(--primary)] text-white shadow-sm">
                  {product.badge}
                </span>
              )}
              {discountPercent && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Wishlist & Share buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
                  isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/90 text-[var(--text-main)] hover:bg-white'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share craft"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-[var(--text-main)] backdrop-blur-md shadow-md hover:bg-white transition-all"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Product Information & Purchase Flow */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              {product.categoryName} • {product.subcategoryName}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-main)] mt-1 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Handcrafted in India by authentic artisans for Anu Atelier
            </p>
          </div>

          {/* Ratings & Sold Count */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            {product.rating && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 font-bold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{product.rating}</span>
                <span className="text-[var(--text-muted)] font-normal">
                  ({product.reviewsCount || 10} verified reviews)
                </span>
              </div>
            )}
            {product.soldCount && (
              <span className="text-emerald-600 font-medium">
                • {product.soldCount}+ bought this month
              </span>
            )}
          </div>

          {/* Pricing Row */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[var(--text-main)]">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-[var(--text-muted)] line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              {discountPercent && (
                <span className="text-sm font-bold text-emerald-600">
                  Save ₹{product.originalPrice! - product.price} ({discountPercent}% off)
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Inclusive of all taxes. Free shipping on orders above ₹{DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}.
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
              Quantity:
            </span>
            <div className="flex items-center border border-[var(--border-color)] rounded-full bg-[var(--bg-card)] px-3 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-[var(--text-main)]">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                +
              </button>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-semibold">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-rose-600 font-semibold">Out of Stock</span>
              )}
            </span>
          </div>

          {/* Action Buttons: ADD TO CART & BUY NOW (As user explicitly requested!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 px-6 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-6 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Zap className="h-4 w-4" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* PIN Code Delivery Checker */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              <span>Check Delivery & COD Availability</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                className="flex-1 px-3 py-2 text-xs rounded-full border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-full bg-[var(--secondary)] text-[var(--primary-dark)] hover:bg-[var(--primary)] hover:text-white transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className="text-xs text-[var(--text-muted)] flex items-start gap-1 pt-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{pincodeStatus}</span>
              </p>
            )}
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs text-[var(--text-main)] font-medium">Free Delivery above ₹100</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs text-[var(--text-main)] font-medium">15-Day Easy Replacement</span>
            </div>
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs text-[var(--text-main)] font-medium">100% Authentic Handmade</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs text-[var(--text-main)] font-medium">Cash on Delivery Available</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-2">
            <h3 className="font-heading text-lg font-bold text-[var(--text-main)]">
              Craft Story & Description
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-heading text-lg font-bold text-[var(--text-main)]">
                Specifications
              </h3>
              <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden text-xs">
                {Object.entries(product.specs).map(([key, val], idx) => (
                  <div
                    key={key}
                    className={`grid grid-cols-2 p-3 ${
                      idx % 2 === 0 ? 'bg-[var(--bg-input)]' : 'bg-[var(--bg-card)]'
                    }`}
                  >
                    <span className="font-semibold text-[var(--text-muted)]">{key}</span>
                    <span className="text-[var(--text-main)]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[var(--border-color)] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-[var(--text-main)]">
              You May Also Like
            </h3>
            <Link
              to={`/category/${product.categoryId}`}
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              View More &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

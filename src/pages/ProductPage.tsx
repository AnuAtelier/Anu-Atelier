import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  Share2,
  CheckCircle,
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
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

  // Gallery, Slide & Lightbox Zoom state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const product = getProductBySlugOrId(slug || '');

  // Derived gallery of multi-angle images
  const galleryImages: string[] = product
    ? product.images && product.images.length > 0
      ? product.images
      : [
          product.image,
          ...(product.categoryId === 'terracotta-clay'
            ? [
                '/img/promo/promo-terracotta.jpg',
                'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
                '/img/hero-artisan.jpg',
              ]
            : product.categoryId === 'embroidered-clothes'
            ? [
                '/img/promo/promo-clothing.jpg',
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
              ]
            : [
                '/img/promo/promo-handicrafts.jpg',
                'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80',
                '/img/hero-artisan.jpg',
              ]),
        ]
    : [];

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    setZoomLevel(1);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 3));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.max(Number((prev - 0.5).toFixed(1)), 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) handleNextImage();
    else if (diff < -50) handlePrevImage();
    setTouchStartX(null);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

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

      {/* Main Product Section: Two Columns (Compact Gallery + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Compact Screen-Fit Gallery with Slide Left/Right */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col items-center space-y-3">
          {/* Main Image Box: Small & Screen-Fitting */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-[380px] h-[280px] sm:h-[340px] rounded-3xl overflow-hidden bg-stone-50 border border-stone-200/90 shadow-xs flex items-center justify-center p-3 select-none cursor-pointer group hover:border-[var(--primary)] transition-all"
            onClick={() => {
              setIsLightboxOpen(true);
              setZoomLevel(1);
            }}
            title="Click to open full size image in new window"
          >
            <img
              src={galleryImages[activeImageIndex]}
              alt={`${product.name} - View ${activeImageIndex + 1}`}
              className="max-h-[250px] sm:max-h-[305px] max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none">
              {product.badge && (
                <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-[var(--primary)] text-white shadow-xs">
                  {product.badge}
                </span>
              )}
              {discountPercent && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-600 text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Slide Navigation Buttons (Left & Right) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-110 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-110 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Open Full Size Window Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
                setZoomLevel(1);
              }}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-800 text-xs font-semibold shadow-md border border-stone-200/90 flex items-center gap-1.5 transition-all z-10 hover:scale-105 hover:text-pink-600"
            >
              <Maximize2 className="h-3.5 w-3.5 text-pink-600" />
              <span>Full Size</span>
            </button>

            {/* Slide Count Badge */}
            {galleryImages.length > 1 && (
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-stone-900/70 text-white text-[11px] font-semibold backdrop-blur-xs z-10">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            )}

            {/* Wishlist & Share buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                aria-label="Wishlist"
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-xs transition-all shadow-xs ${
                  isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/95 text-[var(--text-main)] hover:bg-white border border-stone-200'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                aria-label="Share craft"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/95 text-[var(--text-main)] backdrop-blur-xs shadow-xs hover:bg-white border border-stone-200 transition-all"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Thumbnails Row (Compact & Neat) */}
          {galleryImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-full scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all p-1 bg-white shadow-2xs ${
                    activeImageIndex === idx
                      ? 'border-[var(--primary)] ring-2 ring-pink-500/20 scale-105'
                      : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Purchase Flow */}
        <div className="lg:col-span-7 space-y-6">
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

      {/* FULLSCREEN LIGHTBOX WINDOW: White Background, Full-size image, Zoom in/out, Slide left/right */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col justify-between select-none animate-fade-in"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomLevel(1);
          }}
        >
          {/* Top Control Bar */}
          <div
            className="flex items-center justify-between p-4 sm:p-5 bg-white/95 border-b border-stone-200 shadow-xs z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="font-heading font-bold text-base sm:text-lg text-stone-900 truncate max-w-xs sm:max-w-md">
                {product.name}
              </p>
              <p className="text-xs text-stone-500 font-medium">
                Image {activeImageIndex + 1} of {galleryImages.length} • Click image or use + / - to zoom
              </p>
            </div>

            {/* Zoom & Close Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <span className="text-xs sm:text-sm font-bold font-mono px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-200 text-[var(--primary)] min-w-[54px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-stone-200 flex items-center justify-center transition-all ml-1 sm:ml-2 cursor-pointer"
                title="Close Window (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center Main Image: Full Size, Fit to Screen & Zoomable */}
          <div
            className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-stone-50/50"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Slide Left Button */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-stone-50 text-stone-800 shadow-xl border border-stone-200 flex items-center justify-center transition-all hover:scale-110 z-20 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}

            {/* The Full Size Image Container */}
            <div
              className="max-w-[92vw] max-h-[76vh] flex items-center justify-center overflow-auto scrollbar-none transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
              }}
              onClick={() => {
                setZoomLevel((z) => (z === 1 ? 2 : 1));
              }}
              title="Click to zoom in / out"
            >
              <img
                src={galleryImages[activeImageIndex]}
                alt={`${product.name} - Full Size View ${activeImageIndex + 1}`}
                className="max-h-[74vh] max-w-[88vw] object-contain rounded-2xl shadow-xl transition-all select-none border border-stone-200/60 bg-white"
              />
            </div>

            {/* Slide Right Button */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-stone-50 text-stone-800 shadow-xl border border-stone-200 flex items-center justify-center transition-all hover:scale-110 z-20 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox Window */}
          <div
            className="p-3 sm:p-4 bg-white/95 border-t border-stone-200 flex flex-col items-center gap-1.5 z-20 shadow-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomLevel(1);
                    }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all p-0.5 bg-stone-50 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[var(--primary)] ring-2 ring-pink-500/30 scale-105 shadow-sm'
                        : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-stone-500 font-medium">
              Use Left / Right arrow keys or swipe to slide • Click image to zoom • Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

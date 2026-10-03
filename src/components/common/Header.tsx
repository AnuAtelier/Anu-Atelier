import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Plus, User, X, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SubcategoryQuickLink {
  name: string;
  path: string;
  icon: string;
}

interface CategoryConfig {
  id: string;
  label: string;
  fullTitle: string;
  path: string;
  emoji: string;
  badge: string;
  badgeColor: string;
  iconAnimClass: string;
  activeGradient: string;
  activeGlowClass: string;
  borderColor: string;
  hoverBorderColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  iconBgColor: string;
  cardBg: string;
  subcategories: SubcategoryQuickLink[];
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'home',
    label: 'Home',
    fullTitle: 'Anu Atelier Studio',
    path: '/',
    emoji: '🏠',
    badge: 'Studio',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-300',
    iconAnimClass: 'icon-home-sparkle',
    activeGradient: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white',
    activeGlowClass: 'glow-home',
    borderColor: 'border-rose-200/90',
    hoverBorderColor: 'hover:border-rose-400',
    hoverBgColor: 'hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50',
    hoverTextColor: 'hover:text-rose-700',
    iconBgColor: 'bg-rose-100/90 text-rose-600',
    cardBg: 'bg-white/95 hover:bg-rose-50/70',
    subcategories: [
      { name: 'Featured Crafts', path: '/', icon: '✨' },
      { name: 'Artisan Story', path: '/#artisan-story', icon: '🌸' },
      { name: 'Customer Favorites', path: '/customer-favorites', icon: '⭐' },
      { name: 'Festive Clay Diyas', path: '/category/terracotta-clay?subcat=diyas', icon: '🪔' },
    ],
  },
  {
    id: 'terracotta-clay',
    label: 'Terracotta',
    fullTitle: 'Terracotta & Clay Craft',
    path: '/category/terracotta-clay',
    emoji: '🏺',
    badge: '100% Clay',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    iconAnimClass: 'icon-pot-wobble',
    activeGradient: 'bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white',
    activeGlowClass: 'glow-terracotta',
    borderColor: 'border-orange-200/90',
    hoverBorderColor: 'hover:border-orange-400',
    hoverBgColor: 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50',
    hoverTextColor: 'hover:text-orange-800',
    iconBgColor: 'bg-orange-100/90 text-orange-700',
    cardBg: 'bg-white/95 hover:bg-orange-50/70',
    subcategories: [
      { name: 'Festive Clay Diyas', path: '/category/terracotta-clay?subcat=diyas', icon: '🪔' },
      { name: 'Pots & Planters', path: '/category/terracotta-clay?subcat=pots', icon: '🪴' },
      { name: 'Devotional Idols & Figurines', path: '/category/terracotta-clay?subcat=devotional-idols', icon: '🙏' },
      { name: 'Hand-Carved Tableware', path: '/category/terracotta-clay?subcat=tableware', icon: '🥣' },
      { name: 'Wind Chimes & Vases', path: '/category/terracotta-clay?subcat=wind-chimes', icon: '🎐' },
    ],
  },
  {
    id: 'embroidered-clothes',
    label: 'Clothing',
    fullTitle: 'Embroidered Folk Wear',
    path: '/category/embroidered-clothes',
    emoji: '🧵',
    badge: 'Handmade',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
    iconAnimClass: 'icon-needle-tilt',
    activeGradient: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 text-white',
    activeGlowClass: 'glow-clothing',
    borderColor: 'border-fuchsia-200/90',
    hoverBorderColor: 'hover:border-fuchsia-400',
    hoverBgColor: 'hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50',
    hoverTextColor: 'hover:text-fuchsia-800',
    iconBgColor: 'bg-fuchsia-100/90 text-fuchsia-700',
    cardBg: 'bg-white/95 hover:bg-fuchsia-50/70',
    subcategories: [
      { name: 'Chikankari & Folk Kurtis', path: '/category/embroidered-clothes?subcat=kurtis', icon: '👗' },
      { name: 'Artisan Embroidered Sarees', path: '/category/embroidered-clothes?subcat=sarees', icon: '🥻' },
      { name: 'Hand-Dyed Dupattas & Stoles', path: '/category/embroidered-clothes?subcat=dupattas', icon: '🧣' },
      { name: 'Needlework Ethnic Jackets', path: '/category/embroidered-clothes?subcat=jackets', icon: '🧥' },
      { name: 'Folk Linens & Quilts', path: '/category/embroidered-clothes?subcat=quilts', icon: '🪡' },
    ],
  },
  {
    id: 'wall-art-decor',
    label: 'Wall Art',
    fullTitle: 'Murals & Canvas Decor',
    path: '/category/wall-art-decor',
    emoji: '🖼️',
    badge: 'In-Home Art',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    iconAnimClass: 'icon-art-float',
    activeGradient: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white',
    activeGlowClass: 'glow-wallart',
    borderColor: 'border-teal-200/90',
    hoverBorderColor: 'hover:border-teal-400',
    hoverBgColor: 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50',
    hoverTextColor: 'hover:text-teal-800',
    iconBgColor: 'bg-teal-100/90 text-teal-700',
    cardBg: 'bg-white/95 hover:bg-teal-50/70',
    subcategories: [
      { name: 'Penguin & Children Murals', path: '/product/penguin-lamp-post-custom-wall-mural', icon: '🐧' },
      { name: 'Custom Accent Murals', path: '/category/wall-art-decor?subcat=wall-murals', icon: '🎨' },
      { name: 'Whimsical Switchboard Art', path: '/category/wall-art-decor?subcat=switchboard-art', icon: '⚡' },
      { name: 'Paper Silhouette Hangings', path: '/category/wall-art-decor?subcat=paper-silhouettes', icon: '✂️' },
      { name: 'Leaf Wreaths & Botanicals', path: '/category/wall-art-decor?subcat=leaf-wreaths', icon: '🌿' },
    ],
  },
  {
    id: 'other-handicrafts',
    label: 'Handicrafts',
    fullTitle: 'Folk Gifts & Decor',
    path: '/category/other-handicrafts',
    emoji: '🎁',
    badge: 'Artisan',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    iconAnimClass: 'icon-gift-bounce',
    activeGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white',
    activeGlowClass: 'glow-handicrafts',
    borderColor: 'border-amber-200/90',
    hoverBorderColor: 'hover:border-amber-400',
    hoverBgColor: 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50',
    hoverTextColor: 'hover:text-amber-800',
    iconBgColor: 'bg-amber-100/90 text-amber-700',
    cardBg: 'bg-white/95 hover:bg-amber-50/70',
    subcategories: [
      { name: 'Eco-Friendly Jute Bags', path: '/category/other-handicrafts?subcat=jute-bags', icon: '👜' },
      { name: 'Boho Macrame Hangings', path: '/category/other-handicrafts?subcat=macrame-hangings', icon: '🧶' },
      { name: 'Handcrafted Wooden Toys', path: '/category/other-handicrafts?subcat=wooden-toys', icon: '🪵' },
      { name: 'Woven Bamboo Baskets', path: '/category/other-handicrafts?subcat=bamboo-baskets', icon: '🧺' },
      { name: 'Brass Idols & Ritual Diyas', path: '/category/other-handicrafts?subcat=brass-idols', icon: '🪔' },
    ],
  },
  {
    id: 'customer-favorites',
    label: 'Favorites',
    fullTitle: 'Customer Favorites & Top Sold',
    path: '/customer-favorites',
    emoji: '⭐',
    badge: 'Top Sold',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    iconAnimClass: 'icon-sparkle-spin',
    activeGradient: 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white',
    activeGlowClass: 'glow-terracotta',
    borderColor: 'border-amber-200/90',
    hoverBorderColor: 'hover:border-amber-400',
    hoverBgColor: 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50',
    hoverTextColor: 'hover:text-amber-800',
    iconBgColor: 'bg-amber-100/90 text-amber-700',
    cardBg: 'bg-white/95 hover:bg-amber-50/70',
    subcategories: [
      { name: 'All Top Bestsellers', path: '/customer-favorites', icon: '🏆' },
      { name: 'Most Bought Terracotta', path: '/customer-favorites?category=terracotta-clay', icon: '🏺' },
      { name: 'Most Bought Wall Art', path: '/customer-favorites?category=wall-art-decor', icon: '🖼️' },
      { name: 'Most Bought Clothing', path: '/customer-favorites?category=embroidered-clothes', icon: '🧵' },
      { name: 'Most Bought Handicrafts', path: '/customer-favorites?category=other-handicrafts', icon: '🦚' },
    ],
  },
];

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, toggleDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { products } = useProductStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'anushka32199@gmail.com';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Track window scroll to make header sleek on head and collapse announcement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = getTotalItems();
  const wishlistCount = wishlistItems.length;

  // Keyboard shortcut: '/' or Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchContainerRef.current && searchContainerRef.current.contains(target);
      const insideMobile = mobileSearchContainerRef.current && mobileSearchContainerRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim().length >= 2
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subcategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isCategoryActive = (catPath: string) => {
    if (catPath === '/') {
      return location.pathname === '/';
    }
    if (catPath.includes('?')) {
      const [pathPart, queryPart] = catPath.split('?');
      return location.pathname === pathPart && location.search.includes(queryPart);
    }
    return location.pathname.startsWith(catPath);
  };

  return (
    <header className={`sticky top-0 z-50 w-full max-w-full transition-all duration-300 ${
      isScrolled ? 'shadow-md shadow-pink-900/5' : 'shadow-xs'
    }`}>

      {/* Main Navbar */}
      <nav
        style={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'var(--header-bg)',
          borderColor: isScrolled ? 'rgba(244, 114, 182, 0.35)' : 'var(--header-border)',
        }}
        className="backdrop-blur-xl border-b transition-all duration-300 w-full relative"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 min-w-0">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              {/* Soft ambient heart halo that breathes in sync with the pulse */}
              <div className="absolute inset-0 rounded-full bg-rose-500/25 blur-md animate-heart-aura pointer-events-none" />
              <img
                src="/logo.png"
                alt="Anu Atelier Logo"
                className="relative z-10 h-11 w-11 sm:h-13 sm:w-13 object-contain animate-heartbeat"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] group-hover:opacity-95 leading-none transition-opacity">
                  Anu<span className="text-pink-600 italic font-semibold">Atelier</span>
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-pink-600/80 mt-1 hidden sm:block">
                Artisan Studio
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="relative hidden md:block flex-1 mx-2 sm:mx-6 max-w-xl lg:max-w-2xl xl:max-w-3xl">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search handmade crafts... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-full border border-pink-200/80 bg-white/80 group-hover:bg-white focus:bg-white text-[var(--text-main)] text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-stone-400 shadow-xs"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-pink-600/70 pointer-events-none group-focus-within:text-pink-600 transition-colors" />
              {!searchQuery && (
                <kbd className="absolute right-3.5 top-2.5 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-stone-500 bg-stone-100/90 border border-stone-200/80 rounded-md pointer-events-none shadow-2xs">
                  /
                </kbd>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Search Dropdown Panel */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg-soft overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="p-2 border-b border-[var(--border-color)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Matching Crafts
                    </div>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug || product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-[var(--bg-input)] transition-colors border-b border-[var(--border-color)] last:border-b-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-main)] truncate">{product.name}</p>
                          <p className="text-xs text-[var(--primary)] font-semibold">₹{product.price}</p>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-2.5 text-center text-xs font-semibold text-[var(--primary)] hover:bg-[var(--bg-input)] transition-colors"
                    >
                      View all results for "{searchQuery}" &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                    No handcrafted items found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Add Craft Button (Admin Shortcut) */}
            {isAdmin && (
              <Link
                to="/admin/add-craft"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Craft</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 hover:scale-105 active:scale-95 border border-rose-200/60 flex items-center justify-center text-rose-700 transition-all duration-200 shadow-xs"
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Live Count Badge */}
            <button
              onClick={toggleDrawer}
              aria-label="Shopping Cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pink-500/15 hover:bg-pink-500/25 hover:scale-105 active:scale-95 border border-pink-300/70 flex items-center justify-center text-pink-700 transition-all duration-200 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Profile / Login */}
            {user ? (
              <Link
                to="/profile"
                aria-label="My Account"
                className="inline-flex items-center gap-2 pl-1 pr-2.5 sm:pr-3 py-1 rounded-full border border-pink-200/90 bg-white/90 hover:bg-pink-50/80 hover:scale-[1.02] active:scale-95 text-stone-900 transition-all duration-200 shadow-xs group flex-shrink-0"
                title={`${user.fullName || 'User'} (${isAdmin ? 'Owner' : 'Customer'})`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full ${
                    isAdmin
                      ? 'bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500'
                      : 'bg-gradient-to-br from-pink-500 to-rose-600'
                  } text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">
                    {isAdmin ? 'Owner' : 'Customer'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 truncate max-w-[85px] sm:max-w-[100px]">
                    {user.fullName ? user.fullName.trim().split(' ')[0] : (isAdmin ? 'Anushka' : 'Account')}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Login to Anu Atelier"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-pink-300/80 bg-white hover:bg-pink-50 hover:scale-[1.02] active:scale-95 text-stone-800 hover:text-[var(--primary)] text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs group flex-shrink-0"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-pink-100 flex items-center justify-center text-[var(--primary)] group-hover:scale-105 transition-transform flex-shrink-0">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9.5px] sm:text-[10px] text-stone-500 font-medium leading-none">Sign In</span>
                  <span className="font-bold text-[11px] sm:text-xs text-[var(--primary)] leading-none mt-0.5">Login</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar (Full in form, with live dropdown & clear button) */}
      <div
        ref={mobileSearchContainerRef}
        className="md:hidden border-b border-[var(--border-color)] bg-white/95 backdrop-blur-md w-full px-4 sm:px-6 py-2 min-w-0 relative z-30"
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="Search handmade crafts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-8 py-2 rounded-full border border-pink-200/80 bg-white/90 text-[var(--text-main)] text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 shadow-xs transition-all placeholder:text-gray-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-pink-600/70 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Mobile Search Dropdown Panel */}
        {isSearchOpen && searchQuery.trim().length >= 2 && (
          <div className="absolute left-4 right-4 top-full mt-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg-soft overflow-hidden z-50">
            {searchResults.length > 0 ? (
              <div>
                <div className="p-2 border-b border-[var(--border-color)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Matching Crafts
                </div>
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug || product.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[var(--bg-input)] transition-colors border-b border-[var(--border-color)] last:border-b-0"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[var(--text-main)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--primary)] font-semibold">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2.5 text-center text-xs font-semibold text-[var(--primary)] hover:bg-[var(--bg-input)] transition-colors"
                >
                  View all results for "{searchQuery}" &rarr;
                </button>
              </div>
            ) : (
              <div className="p-5 text-center text-xs sm:text-sm text-[var(--text-muted)]">
                No handcrafted items found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          VIBRANT ARTISAN CATEGORY STRIP (NO SCROLLBAR - 100% IN FRONT)
          ======================================================== */}
      <div className="w-full header-strip-aurora-bg backdrop-blur-xl border-b border-pink-200/60 relative z-30 transition-all duration-300 shadow-2xs">
        {/* Top Iridescent Hairline Glow */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-pink-300/70 to-transparent" />

        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* Mobile Layout: 6-Column Grid directly in front (Zero Scrollbar) */}
          <div className="grid grid-cols-6 gap-1 py-1.5 sm:hidden">
            {CATEGORY_CONFIGS.map((cat) => {
              const isActive = isCategoryActive(cat.path);

              return (
                <Link
                  key={cat.id}
                  to={cat.path}
                  className={`group relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-200 active:scale-95 text-center overflow-hidden ${
                    isActive
                      ? `${cat.activeGradient} ${cat.activeGlowClass} shadow-md`
                      : `${cat.cardBg} ${cat.borderColor} border shadow-2xs hover:scale-105`
                  }`}
                >
                  <span className="category-sheen-sweep" />

                  {/* Animated Icon Avatar */}
                  <div className="relative mb-0.5">
                    <span
                      className={`relative flex items-center justify-center w-5.5 h-5.5 rounded-full text-xs transition-transform duration-200 ${
                        isActive ? 'bg-white/20 text-white' : `${cat.iconBgColor}`
                      } icon-ambient-breathe ${cat.iconAnimClass}`}
                    >
                      {cat.emoji}
                    </span>
                    {isActive && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                    )}
                  </div>

                  {/* Category Label */}
                  <span
                    className={`text-[8.5px] min-[380px]:text-[9.5px] font-bold tracking-tight leading-tight truncate w-full px-0.5 ${
                      isActive ? 'text-white' : 'text-stone-800'
                    }`}
                  >
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Tablet & Desktop Layout: Centered Flex Ribbon (Zero Scrollbar) */}
          <div className="hidden sm:flex sm:items-center sm:justify-center gap-1.5 md:gap-2.5 lg:gap-4 py-2">
            {CATEGORY_CONFIGS.map((cat) => {
              const isActive = isCategoryActive(cat.path);

              return (
                <div key={cat.id} className="relative group flex-shrink-0">
                  <Link
                    to={cat.path}
                    className={`relative inline-flex items-center gap-2 px-3.5 lg:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold tracking-wide transition-all duration-200 overflow-hidden active:scale-95 ${
                      isActive
                        ? `${cat.activeGradient} ${cat.activeGlowClass} shadow-md scale-[1.02]`
                        : `${cat.cardBg} text-stone-700 ${cat.borderColor} border ${cat.hoverBorderColor} ${cat.hoverBgColor} ${cat.hoverTextColor} shadow-2xs hover:scale-[1.04] hover:-translate-y-0.5`
                    }`}
                  >
                    {/* Delicate Sheen Sweep on Hover */}
                    <span className="category-sheen-sweep" />

                    {/* Animated Icon Avatar with Ambient Float & Micro-Movement */}
                    <span
                      className={`relative flex items-center justify-center w-5.5 h-5.5 rounded-full text-sm transition-transform duration-200 ${
                        isActive ? 'bg-white/20 text-white' : `${cat.iconBgColor} group-hover:scale-115`
                      } icon-ambient-breathe ${cat.iconAnimClass}`}
                    >
                      {cat.emoji}
                    </span>

                    {/* Category Label */}
                    <span className="whitespace-nowrap font-medium">{cat.label}</span>

                    {/* Micro-Badge Tag */}
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-tight uppercase transition-colors ${
                        isActive
                          ? 'bg-white/25 text-white border border-white/30'
                          : `${cat.badgeColor} border`
                      }`}
                    >
                      {cat.badge}
                    </span>

                    {/* Active Ping Pip Indicator */}
                    {isActive && (
                      <span className="relative flex h-1.5 w-1.5 flex-shrink-0 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white shadow-xs" />
                      </span>
                    )}
                  </Link>

                  {/* Desktop Interactive Hover Flyout (Instant Subcategory Access) */}
                  <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 min-w-[270px]">
                    <div className="bg-white/95 backdrop-blur-xl border border-pink-200/90 rounded-2xl p-3.5 shadow-xl-soft ring-1 ring-black/5">
                      <div className="flex items-center justify-between pb-2 border-b border-pink-100 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{cat.emoji}</span>
                          <span className="font-heading font-bold text-xs text-stone-900">{cat.fullTitle}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cat.badgeColor}`}>
                          {cat.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-pink-50/70 transition-colors group/sub"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-xs">{sub.icon}</span>
                              <span>{sub.name}</span>
                            </span>
                            <ChevronRight className="h-3 w-3 text-stone-400 group-hover/sub:text-pink-600 group-hover/sub:translate-x-0.5 transition-all" />
                          </Link>
                        ))}
                      </div>

                      <Link
                        to={cat.path}
                        className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/60 hover:from-rose-100 hover:to-pink-100 text-rose-700 text-[11px] font-bold border border-rose-200/70 transition-all shadow-2xs"
                      >
                        <span>Explore All {cat.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Luminous Rainbow Aurora Hairline with Sweeping Beam */}
        <div className="relative w-full h-[2.5px] overflow-hidden bg-rose-100/50">
          <div className="category-rainbow-hairline w-full h-full" />
          <div className="header-aurora-beam" />
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Plus, User, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORY_LINKS = [
  { label: 'Home', path: '/', emoji: '🏠' },
  { label: 'Terracotta', path: '/category/terracotta-clay', emoji: '🏺' },
  { label: 'Clothing', path: '/category/embroidered-clothes', emoji: '🧵' },
  { label: 'Wall Art', path: '/category/wall-art-decor', emoji: '🖼️' },
  { label: 'Handicrafts', path: '/category/other-handicrafts', emoji: '🎁' },
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

  return (
    <header className={`sticky top-0 z-50 w-full max-w-full transition-all duration-300 ${
      isScrolled ? 'shadow-md' : 'shadow-xs'
    }`}>

      {/* Main Navbar */}
      <nav
        style={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.96)' : 'var(--header-bg)',
          borderColor: isScrolled ? 'rgba(244, 114, 182, 0.35)' : 'var(--header-border)',
        }}
        className="backdrop-blur-md border-b transition-all duration-300 w-full"
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
              <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] group-hover:opacity-95 leading-none transition-opacity">
                Anu<span className="text-pink-600 italic font-semibold">Atelier</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-pink-600/80 mt-1 hidden sm:block">
                Artisan Studio
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="relative hidden md:block flex-1 mx-2 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
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
                className="w-full pl-10 pr-10 py-2.5 rounded-full border border-pink-200/70 bg-white/70 backdrop-blur-md text-[var(--text-main)] text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-gray-500 shadow-xs"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-pink-600/70 pointer-events-none" />
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

          {/* Category Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0">
            {CATEGORY_LINKS.map((cat) => {
              const isActive = location.pathname === cat.path;
              return (
                <Link
                  key={cat.path}
                  to={cat.path}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'text-[var(--text-main)] hover:text-[var(--primary)] hover:bg-pink-50/80'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
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
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-200/60 flex items-center justify-center text-rose-700 transition-all shadow-xs"
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Live Count Badge */}
            <button
              onClick={toggleDrawer}
              aria-label="Shopping Cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-300/70 flex items-center justify-center text-pink-700 transition-all shadow-xs cursor-pointer"
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
                className="inline-flex items-center gap-2 pl-1 pr-2.5 sm:pr-3 py-1 rounded-full border border-pink-200/90 bg-white/90 hover:bg-pink-50/80 text-stone-900 transition-all shadow-xs group flex-shrink-0"
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
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-pink-300/80 bg-white hover:bg-pink-50 text-stone-800 hover:text-[var(--primary)] text-xs sm:text-sm font-semibold transition-all shadow-xs group flex-shrink-0"
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

      {/* Sticky Quick-Access Category Navigation (Mobile & Tablet) */}
      <div className="lg:hidden border-b border-[var(--border-color)]/70 bg-white/95 backdrop-blur-md px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shadow-2xs">
        {CATEGORY_LINKS.map((cat) => {
          const isActive = location.pathname === cat.path;
          return (
            <Link
              key={cat.path}
              to={cat.path}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-stone-100/90 text-stone-700 hover:bg-stone-200/80'
              }`}
            >
              <span className="text-[11px]">{cat.emoji}</span>
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};


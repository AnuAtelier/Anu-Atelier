import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Plus, User, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DEFAULT_SITE_SETTINGS } from '../../constants';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { getTotalItems, toggleDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { products } = useProductStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'anushka32199@gmail.com';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
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
    <header className="sticky top-0 z-40 w-full transition-colors duration-200">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-xs sm:text-sm font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span>{DEFAULT_SITE_SETTINGS.announcementText}</span>
      </div>

      {/* Main Navbar */}
      <nav
        style={{
          backgroundColor: 'var(--header-bg)',
          borderColor: 'var(--header-border)',
        }}
        className="backdrop-blur-md border-b px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors"
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 shadow-xs group-hover:scale-105 transition-transform duration-300">
            <img
              src="/logo-icon.jpg"
              alt="Anu Atelier Logo"
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)] group-hover:opacity-95 leading-tight transition-opacity">
              Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
            </span>
            <span className="text-[9px] tracking-widest uppercase font-medium text-[var(--text-muted)] hidden sm:block">
              Artisan Studio
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <div ref={searchContainerRef} className="relative hidden md:block flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
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
              className="w-full pl-10 pr-10 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-[var(--text-muted)]"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
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
        <div className="hidden lg:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/category/terracotta-clay"
            className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            Terracotta
          </Link>
          <Link
            to="/category/embroidered-clothes"
            className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            Clothing
          </Link>
          <Link
            to="/category/other-handicrafts"
            className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            Handicrafts
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Live Count Badge */}
          <button
            onClick={toggleDrawer}
            aria-label="Shopping Cart"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          <Link
            to={user ? "/profile" : "/login"}
            aria-label="My Account"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
          >
            {user ? (
              <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary-dark)] font-bold text-xs flex items-center justify-center border border-[var(--primary)]/30">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Search Input */}
      <div className="md:hidden px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-color)]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search handmade magic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
        </form>
      </div>
    </header>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { getTotalItems, toggleDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = getTotalItems();
  const wishlistCount = wishlistItems.length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-card)] border-t border-[var(--border-color)] sm:hidden safe-bottom transition-colors">
      <div className="grid grid-cols-5 h-14">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 ${
            isActive('/') ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Categories */}
        <Link
          to="/category/terracotta-clay"
          className={`flex flex-col items-center justify-center gap-0.5 ${
            location.pathname.startsWith('/category')
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className={`relative flex flex-col items-center justify-center gap-0.5 ${
            isActive('/wishlist') ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <Heart className="h-4 w-4" />
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-5 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>

        {/* Cart Drawer Toggle */}
        <button
          onClick={toggleDrawer}
          className="relative flex flex-col items-center justify-center gap-0.5 text-[var(--text-muted)] hover:text-[var(--primary)]"
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-5 bg-[var(--primary)] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        {/* Account */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-0.5 ${
            isActive('/profile') ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <User className="h-4 w-4" />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </nav>
  );
};

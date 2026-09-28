import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  ClipboardList,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = location.pathname;
  const search = location.search;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      exact: true,
      active: pathname === '/admin' && (!search || search.includes('tab=crafts') === false && search.includes('tab=orders') === false && search.includes('tab=settings') === false),
    },
    {
      label: 'Add New Craft',
      icon: PackagePlus,
      path: '/admin/add-craft',
      exact: false,
      active: pathname === '/admin/add-craft' || pathname === '/admin/products/new' || pathname === '/seller',
    },
    {
      label: 'Crafts Catalog',
      icon: ShoppingBag,
      path: '/admin?tab=crafts',
      exact: false,
      active: pathname === '/admin' && search.includes('tab=crafts'),
    },
    {
      label: 'Customer Orders',
      icon: ClipboardList,
      path: '/admin?tab=orders',
      exact: false,
      active: pathname === '/admin' && search.includes('tab=orders'),
    },
    {
      label: 'Store Settings',
      icon: Settings,
      path: '/admin?tab=settings',
      exact: false,
      active: pathname === '/admin' && search.includes('tab=settings'),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-card)] border-r border-[var(--border-color)]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
        <div>
          <Link to="/admin" className="flex items-center gap-1 group">
            <span className="font-heading text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-[var(--primary-dark)] text-[10px] font-bold tracking-wide uppercase border border-pink-300">
              <ShieldCheck className="h-3 w-3 text-[var(--primary)]" />
              <span>Admin Suite</span>
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                item.active
                  ? 'bg-[var(--primary)] text-white shadow-sm shadow-pink-500/20'
                  : 'text-[var(--text-main)] hover:bg-[var(--bg-input)] hover:text-[var(--primary)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${item.active ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                <span>{item.label}</span>
              </div>
              {item.active && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">
            Storefront
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--bg-input)] hover:text-[var(--primary)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Store className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
              <span>View Live Store</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </Link>
        </div>
      </div>

      {/* Bottom User & System Controls */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-input)]/40 space-y-3">
        {/* User Info Card */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white font-heading font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-main)] truncate">
              {user?.fullName || 'Anushka Singh'}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              {user?.email || 'anushka32199@gmail.com'}
            </p>
          </div>
        </div>

        {/* Action Button: Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
          title="Sign Out of Admin"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] flex">
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:block w-64 lg:w-72 fixed inset-y-0 left-0 z-30 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay + Slide-over) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0">
        {/* Mobile Header Bar (Only visible < md) */}
        <header className="md:hidden sticky top-0 z-20 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-input)]"
              aria-label="Open Admin Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-heading font-bold text-lg text-[var(--text-main)]">
              Anu<span className="text-[var(--primary)] italic font-semibold">Atelier</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/add-craft"
              className="p-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold shadow-xs"
              title="Add Craft"
            >
              <PackagePlus className="h-4 w-4" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary-dark)] font-bold text-xs flex items-center justify-center border border-[var(--primary)]/30">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
};

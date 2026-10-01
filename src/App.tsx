import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';
import { Toast } from './components/common/Toast';
import { AdminRoute } from './components/common/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AnimatedArtisanBackground } from './components/common/AnimatedArtisanBackground';
import { useAuthStore } from './store/useAuthStore';
import { initHeartbeatSync, syncHeartbeatAnimations } from './utils/syncHeartbeats';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { SearchPage } from './pages/SearchPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AddCraftPage } from './pages/AddCraftPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Auto scroll to top on route change without jerk or jump
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Disable smooth scrolling temporarily to prevent page-jump/jerk roll
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0 });
    // Re-enable default smooth scrolling on next frame for in-page anchors
    const frameId = requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = '';
    });
    // Guarantee all hearts on the incoming page immediately lock into unison
    syncHeartbeatAnimations();
    return () => cancelAnimationFrame(frameId);
  }, [pathname]);
  return null;
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;
  const { user, isLoading } = useAuthStore();

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/seller');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // 1. Clean Standalone Auth Layout: NO Navbar, NO Footer, NO MobileNav, NO WhatsAppFloat
  if (isAuthRoute) {
    return (
      <div key={pathname} className="animate-page-enter w-full min-h-screen">
        <Routes location={location}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    );
  }

  // 2. Admin Route Protection: If not admin, ask for login immediately (redirect to /login?from=admin)
  if (isAdminRoute && !isLoading && (!user || user.role !== 'admin')) {
    return (
      <Navigate
        to="/login?from=admin"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Dedicated Admin Layout: Sidebar navigation, NO Customer Navbar/Footer
  if (isAdminRoute) {
    return (
      <AdminLayout>
        <div key={pathname} className="animate-page-enter w-full min-w-0">
          <Routes location={location}>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/seller"
              element={
                <AdminRoute>
                  <AddCraftPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-craft"
              element={
                <AdminRoute>
                  <AddCraftPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <AddCraftPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AdminLayout>
    );
  }

  // 4. Customer Storefront Layout: WITH Header, Footer, MobileNav, CartDrawer, WhatsAppFloat
  return (
    <div className="relative flex flex-col min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-200 w-full max-w-full overflow-x-clip min-w-0">
      <AnimatedArtisanBackground />
      <Header />
      <main className="flex-1 pb-16 sm:pb-0 relative z-10 w-full max-w-full min-w-0 overflow-x-clip">
        <div key={pathname} className="animate-page-enter w-full max-w-full min-w-0">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
};


export const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
    const cleanupHeartSync = initHeartbeatSync();
    return () => {
      cleanupHeartSync();
    };
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
      <Toast />
    </BrowserRouter>
  );
};

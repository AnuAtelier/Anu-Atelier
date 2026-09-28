import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';
import { Toast } from './components/common/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { SearchPage } from './pages/SearchPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddCraftPage } from './pages/AddCraftPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Auto scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-200">
        <Header />
        <main className="flex-1 pb-16 sm:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/seller" element={<AddCraftPage />} />
            <Route path="/admin/products/new" element={<AddCraftPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <WhatsAppFloat />
        <Toast />
      </div>
    </BrowserRouter>
  );
};

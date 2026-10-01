import { create } from 'zustand';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { catalogService } from '../services/catalogService';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  loadProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductBySlugOrId: (identifier: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: catalogService.getLocalFallbackProducts(),
  isLoading: false,

  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const fetched = await catalogService.fetchProducts();
      set({ products: fetched, isLoading: false });
    } catch (err) {
      console.error('Failed to load products:', err);
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    // 1. Optimistic update & instant browser localStorage persistence
    set((state) => {
      const updated = [product, ...state.products];
      if (typeof window !== 'undefined') {
        const custom = catalogService.getLocalCustomProducts();
        const merged = [product, ...custom.filter((p) => p.id !== product.id)];
        localStorage.setItem('anu_published_products', JSON.stringify(merged));
      }
      return { products: updated };
    });
    // 2. Publish to backend
    await catalogService.publishCraft(product);
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const updated = state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      );
      if (typeof window !== 'undefined') {
        const custom = updated.filter(
          (p) => p.id.startsWith('custom_') || !INITIAL_PRODUCTS.some((ip) => ip.id === p.id)
        );
        localStorage.setItem('anu_published_products', JSON.stringify(custom));
      }
      return { products: updated };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        const custom = updated.filter(
          (p) => p.id.startsWith('custom_') || !INITIAL_PRODUCTS.some((ip) => ip.id === p.id)
        );
        localStorage.setItem('anu_published_products', JSON.stringify(custom));
      }
      return { products: updated };
    });
  },

  getProductBySlugOrId: (identifier: string) => {
    const state = get();
    return state.products.find(
      (p) => p.slug === identifier || String(p.id) === String(identifier)
    );
  },
}));

// Load live products on app launch
if (typeof window !== 'undefined') {
  useProductStore.getState().loadProducts().catch(() => {});
}

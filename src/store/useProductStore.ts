import { create } from 'zustand';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductBySlugOrId: (identifier: string) => Product | undefined;
}

const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const saved = localStorage.getItem('anu_published_products');
    if (!saved) return INITIAL_PRODUCTS;
    const custom: Product[] = JSON.parse(saved);
    // Combine custom with initial products avoiding duplicates
    const customIds = new Set(custom.map((p) => p.id));
    const merged = [...custom, ...INITIAL_PRODUCTS.filter((p) => !customIds.has(p.id))];
    return merged;
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: getStoredProducts(),

  addProduct: (product) => {
    set((state) => {
      const updated = [product, ...state.products];
      if (typeof window !== 'undefined') {
        const custom = updated.filter((p) => p.id.startsWith('custom_') || !INITIAL_PRODUCTS.some((ip) => ip.id === p.id));
        localStorage.setItem('anu_published_products', JSON.stringify(custom));
      }
      return { products: updated };
    });
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const updated = state.products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
      if (typeof window !== 'undefined') {
        const custom = updated.filter((p) => p.id.startsWith('custom_') || !INITIAL_PRODUCTS.some((ip) => ip.id === p.id));
        localStorage.setItem('anu_published_products', JSON.stringify(custom));
      }
      return { products: updated };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        const custom = updated.filter((p) => p.id.startsWith('custom_') || !INITIAL_PRODUCTS.some((ip) => ip.id === p.id));
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

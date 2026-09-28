import { create } from 'zustand';
import { CartItem, Product } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../constants';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  toastMessage: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (product: Product, qty?: number, variant?: { color?: string; size?: string }) => void;
  updateQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  clearToast: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('anu_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('anu_cart', JSON.stringify(items));
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getStoredCart(),
  isDrawerOpen: false,
  toastMessage: null,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  addToCart: (product, qty = 1, variant) => {
    set((state) => {
      const variantKey = variant ? `_${variant.color || ''}_${variant.size || ''}` : '';
      const cartItemId = `${product.id}${variantKey}`;

      const existingIndex = state.items.findIndex((item) => item.id === cartItemId);
      let updatedItems: CartItem[];

      if (existingIndex > -1) {
        updatedItems = [...state.items];
        const currentQty = updatedItems[existingIndex].qty;
        const maxStock = product.stock || 99;
        updatedItems[existingIndex].qty = Math.min(currentQty + qty, maxStock);
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          qty: Math.min(qty, product.stock || 99),
          stock: product.stock || 99,
          categoryName: product.categoryName,
          selectedVariant: variant,
        };
        updatedItems = [newItem, ...state.items];
      }

      saveCart(updatedItems);
      return {
        items: updatedItems,
        toastMessage: `Added "${product.name}" to cart! 🌸`,
      };
    });
  },

  updateQty: (id, delta) => {
    set((state) => {
      const updatedItems = state.items
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            return { ...item, qty: Math.min(newQty, item.stock) };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      saveCart(updatedItems);
      return { items: updatedItems };
    });
  },

  removeFromCart: (id) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      saveCart(updatedItems);
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  clearToast: () => set({ toastMessage: null }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0);
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= DEFAULT_SITE_SETTINGS.freeDeliveryThreshold
      ? 0
      : DEFAULT_SITE_SETTINGS.standardDeliveryFee;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getDeliveryFee();
  },
}));

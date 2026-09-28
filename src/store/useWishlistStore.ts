import { create } from 'zustand';

interface WishlistState {
  items: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const getStoredWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('anu_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: getStoredWishlist(),

  toggleWishlist: (productId) => {
    set((state) => {
      const exists = state.items.includes(productId);
      const updated = exists
        ? state.items.filter((id) => id !== productId)
        : [...state.items, productId];

      if (typeof window !== 'undefined') {
        localStorage.setItem('anu_wishlist', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  isInWishlist: (productId) => {
    return get().items.includes(productId);
  },
}));

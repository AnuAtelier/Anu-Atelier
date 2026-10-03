import { create } from 'zustand';
import { ReelStory } from '../types';
import { INITIAL_REELS } from '../constants/reels';

interface ReelState {
  reels: ReelStory[];
  activeReelId: string | null;
  isViewerOpen: boolean;
  isAddModalOpen: boolean;
  likedReelIds: string[];
  isMuted: boolean;
  
  // Actions
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  openReel: (id: string) => void;
  closeReel: () => void;
  nextReel: () => void;
  prevReel: () => void;
  toggleLike: (id: string) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  addReel: (newReel: Omit<ReelStory, 'id' | 'createdAt' | 'likesCount' | 'viewsCount'>) => void;
  deleteReel: (id: string) => void;
  getActiveReel: () => ReelStory | undefined;
}

const STORAGE_KEY = 'anu_atelier_custom_reels';
const LIKES_KEY = 'anu_atelier_liked_reels';

function loadStoredReels(): ReelStory[] {
  if (typeof window === 'undefined') return INITIAL_REELS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_REELS;
    const custom: ReelStory[] = JSON.parse(raw);
    if (!Array.isArray(custom)) return INITIAL_REELS;
    
    // Merge custom reels ahead of INITIAL_REELS, avoiding duplicate IDs
    const customIds = new Set(custom.map((r) => r.id));
    return [...custom, ...INITIAL_REELS.filter((r) => !customIds.has(r.id))];
  } catch {
    return INITIAL_REELS;
  }
}

function loadStoredLikes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useReelStore = create<ReelState>((set, get) => ({
  reels: loadStoredReels(),
  activeReelId: null,
  isViewerOpen: false,
  isAddModalOpen: false,
  likedReelIds: loadStoredLikes(),
  isMuted: false, // Start in unmute mode so reels play music first!

  setIsMuted: (muted: boolean) => {
    set({ isMuted: muted });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  getActiveReel: () => {
    const { reels, activeReelId } = get();
    return reels.find((r) => r.id === activeReelId);
  },

  openReel: (id: string) => {
    set({ activeReelId: id, isViewerOpen: true });
  },

  closeReel: () => {
    set({ isViewerOpen: false, activeReelId: null });
  },

  nextReel: () => {
    const { reels, activeReelId } = get();
    if (!activeReelId || reels.length === 0) return;
    const currentIndex = reels.findIndex((r) => r.id === activeReelId);
    const nextIndex = (currentIndex + 1) % reels.length;
    set({ activeReelId: reels[nextIndex].id });
  },

  prevReel: () => {
    const { reels, activeReelId } = get();
    if (!activeReelId || reels.length === 0) return;
    const currentIndex = reels.findIndex((r) => r.id === activeReelId);
    const prevIndex = (currentIndex - 1 + reels.length) % reels.length;
    set({ activeReelId: reels[prevIndex].id });
  },

  toggleLike: (id: string) => {
    set((state) => {
      const isLiked = state.likedReelIds.includes(id);
      const newLikedIds = isLiked
        ? state.likedReelIds.filter((item) => item !== id)
        : [...state.likedReelIds, id];

      const updatedReels = state.reels.map((reel) => {
        if (reel.id === id) {
          return {
            ...reel,
            likesCount: isLiked ? Math.max(0, reel.likesCount - 1) : reel.likesCount + 1,
          };
        }
        return reel;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(LIKES_KEY, JSON.stringify(newLikedIds));
      }

      return {
        likedReelIds: newLikedIds,
        reels: updatedReels,
      };
    });
  },

  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),

  addReel: (data) => {
    const newStory: ReelStory = {
      ...data,
      id: `custom_reel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      likesCount: 1,
      viewsCount: '1.2k',
    };

    set((state) => {
      const updated = [newStory, ...state.reels];
      if (typeof window !== 'undefined') {
        const storedRaw = localStorage.getItem(STORAGE_KEY);
        const storedCustom: ReelStory[] = storedRaw ? JSON.parse(storedRaw) : [];
        const mergedCustom = [newStory, ...storedCustom.filter((r) => r.id !== newStory.id)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedCustom));
      }
      return {
        reels: updated,
        isAddModalOpen: false,
      };
    });
  },

  deleteReel: (id: string) => {
    set((state) => {
      const updated = state.reels.filter((r) => r.id !== id);
      if (typeof window !== 'undefined') {
        const storedRaw = localStorage.getItem(STORAGE_KEY);
        if (storedRaw) {
          const storedCustom: ReelStory[] = JSON.parse(storedRaw);
          const filtered = storedCustom.filter((r) => r.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      }
      return {
        reels: updated,
        activeReelId: state.activeReelId === id ? null : state.activeReelId,
        isViewerOpen: state.activeReelId === id ? false : state.isViewerOpen,
      };
    });
  },
}));

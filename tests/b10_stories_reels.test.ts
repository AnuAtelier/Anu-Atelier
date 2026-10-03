import { describe, it, expect, beforeEach } from 'vitest';
import { useReelStore } from '../src/store/useReelStore';
import { INITIAL_REELS } from '../src/constants/reels';

describe('Artisan Stories & Customer Favorites Reels Store', () => {
  beforeEach(() => {
    // Reset store state
    useReelStore.setState({
      reels: [...INITIAL_REELS],
      activeReelId: null,
      isViewerOpen: false,
      isAddModalOpen: false,
      likedReelIds: [],
    });
  });

  it('loads predefined artisan stories and customer favorite reels', () => {
    const { reels } = useReelStore.getState();
    expect(reels.length).toBeGreaterThanOrEqual(8);

    const artisanReels = reels.filter((r) => r.type === 'artisan');
    const customerReels = reels.filter((r) => r.type === 'customer');

    expect(artisanReels.length).toBeGreaterThanOrEqual(4);
    expect(customerReels.length).toBeGreaterThanOrEqual(4);
  });

  it('allows owner to add a new custom reel/story dynamically', () => {
    const store = useReelStore.getState();
    const initialCount = store.reels.length;

    store.addReel({
      type: 'artisan',
      title: 'Making Authentic Terracotta Tea Cups on Traditional Potter Wheel',
      authorName: 'Ramesh Kumhar',
      authorRole: 'Heritage Potter',
      authorAvatar: '/img/hero-terracotta-studio.jpg',
      location: 'Gorakhpur, Uttar Pradesh',
      mediaType: 'image',
      mediaUrl: '/img/hero-terracotta-studio.jpg',
      caption: 'Every single kulhad is hand-spun and sun-baked before entering the traditional wood-fired kiln.',
      badge: '🌸 Pottery Wheel Story',
    });

    const updated = useReelStore.getState().reels;
    expect(updated.length).toBe(initialCount + 1);
    expect(updated[0].title).toContain('Terracotta Tea Cups');
    expect(updated[0].id).toContain('custom_reel_');
  });

  it('allows users to like reels and increments like counter', () => {
    const store = useReelStore.getState();
    const firstReel = store.reels[0];
    const initialLikes = firstReel.likesCount;

    store.toggleLike(firstReel.id);
    expect(useReelStore.getState().likedReelIds).toContain(firstReel.id);
    expect(useReelStore.getState().reels[0].likesCount).toBe(initialLikes + 1);

    // Toggle again should unlike
    store.toggleLike(firstReel.id);
    expect(useReelStore.getState().likedReelIds).not.toContain(firstReel.id);
    expect(useReelStore.getState().reels[0].likesCount).toBe(initialLikes);
  });

  it('controls reel viewer modal opening, next, prev, and closing', () => {
    const store = useReelStore.getState();
    const firstReel = store.reels[0];
    const secondReel = store.reels[1];

    store.openReel(firstReel.id);
    expect(useReelStore.getState().isViewerOpen).toBe(true);
    expect(useReelStore.getState().activeReelId).toBe(firstReel.id);
    expect(useReelStore.getState().getActiveReel()?.id).toBe(firstReel.id);

    store.nextReel();
    expect(useReelStore.getState().activeReelId).toBe(secondReel.id);

    store.prevReel();
    expect(useReelStore.getState().activeReelId).toBe(firstReel.id);

    store.closeReel();
    expect(useReelStore.getState().isViewerOpen).toBe(false);
    expect(useReelStore.getState().activeReelId).toBeNull();
  });

  it('guarantees Customer Favorites are pure products with soldCount ranking and zero reels', async () => {
    const { INITIAL_PRODUCTS } = await import('../src/constants');
    const published = INITIAL_PRODUCTS.filter((p) => p.status === 'published');
    const sortedBySold = [...published].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

    expect(sortedBySold.length).toBeGreaterThan(0);
    expect(sortedBySold[0].soldCount).toBeGreaterThanOrEqual(sortedBySold[1].soldCount || 0);

    // Verify Customer Favorites page file has NO reel components or reel imports
    const fs = await import('node:fs');
    const path = await import('node:path');
    const favPageContent = fs.readFileSync(path.resolve(__dirname, '../src/pages/CustomerFavoritesPage.tsx'), 'utf-8');
    expect(favPageContent).not.toContain('useReelStore');
    expect(favPageContent).not.toContain('ReelStoryViewerModal');
    expect(favPageContent).not.toContain('ArtisanStorySection');
    expect(favPageContent).toContain('soldCount');
  });

  it('verifies HomePage excludes CustomerFavoritesSection but preserves ArtisanStorySection', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const homeContent = fs.readFileSync(path.resolve(__dirname, '../src/pages/HomePage.tsx'), 'utf-8');

    expect(homeContent).not.toContain('<CustomerFavoritesSection');
    expect(homeContent).not.toContain('import { CustomerFavoritesSection }');
    expect(homeContent).toContain('<ArtisanStorySection />');
    expect(homeContent).toContain('<ReelStoryViewerModal />');
    expect(homeContent).toContain('<AddReelModal />');
  });

  it('verifies Header has a dedicated slot for Customer Favorites', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const headerContent = fs.readFileSync(path.resolve(__dirname, '../src/components/common/Header.tsx'), 'utf-8');

    expect(headerContent).toContain("id: 'customer-favorites'");
    expect(headerContent).toContain("path: '/customer-favorites'");
    expect(headerContent).toContain("grid-cols-6");
  });

  it('loads unique craft-related reels inspired by social media trends with accessible media', async () => {
    const { INITIAL_REELS } = await import('../src/constants/reels');
    const potteryReel = INITIAL_REELS.find((r) => r.id === 'reel_artisan_pottery_wheel');
    const krishnaReel = INITIAL_REELS.find((r) => r.id === 'reel_artisan_baby_krishna');
    const chikanReel = INITIAL_REELS.find((r) => r.id === 'reel_artisan_chikankari');
    const muralReel = INITIAL_REELS.find((r) => r.id === 'reel_artisan_nursery_mural');

    expect(potteryReel).toBeDefined();
    expect(krishnaReel).toBeDefined();
    expect(chikanReel).toBeDefined();
    expect(muralReel).toBeDefined();

    const fs = await import('node:fs');
    const path = await import('node:path');
    const publicDir = path.resolve(__dirname, '../public');

    for (const reel of [potteryReel, krishnaReel, chikanReel, muralReel]) {
      if (reel?.mediaUrl.startsWith('/')) {
        const filePath = path.join(publicDir, reel.mediaUrl.slice(1));
        expect(fs.existsSync(filePath), `File should exist: ${filePath}`).toBe(true);
      }
    }
  });

  it('verifies left and right navigation buttons in ArtisanStorySection and ReelStoryViewerModal', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const storySectionContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/stories/ArtisanStorySection.tsx'),
      'utf-8'
    );
    expect(storySectionContent).toContain('ChevronLeft');
    expect(storySectionContent).toContain('ChevronRight');
    expect(storySectionContent).toContain('scrollBubbles');
    expect(storySectionContent).toContain('scrollReels');

    const modalContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/stories/ReelStoryViewerModal.tsx'),
      'utf-8'
    );
    expect(modalContent).toContain('ChevronLeft');
    expect(modalContent).toContain('ChevronRight');
    expect(modalContent).toContain('prevReel');
    expect(modalContent).toContain('nextReel');
    expect(modalContent).toContain('Story {currentIndex + 1} of {reels.length}');
  });

  it('verifies background music tracks and audio playback integration for video reels', async () => {
    const { INITIAL_REELS } = await import('../src/constants/reels');
    const fs = await import('node:fs');
    const path = await import('node:path');
    const publicDir = path.resolve(__dirname, '../public');

    for (const reel of INITIAL_REELS) {
      expect(reel.musicTrack).toBeDefined();
      expect(reel.musicTrack?.title).toBeTruthy();
      expect(reel.musicTrack?.audioUrl).toBeTruthy();

      if (reel.musicTrack?.audioUrl.startsWith('/')) {
        const audioPath = path.join(publicDir, reel.musicTrack.audioUrl.slice(1));
        expect(fs.existsSync(audioPath), `Audio file must exist: ${audioPath}`).toBe(true);
      }
    }

    const modalContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/stories/ReelStoryViewerModal.tsx'),
      'utf-8'
    );
    expect(modalContent).toContain('audioRef');
    expect(modalContent).toContain('toggleSound');
    expect(modalContent).toContain('musicTrack');
  });

  it('guarantees all video reels use completely distinct videos with zero repetition', async () => {
    const { INITIAL_REELS } = await import('../src/constants/reels');
    const videoReels = INITIAL_REELS.filter((r) => r.mediaType === 'video');
    
    // Check that there is no duplicated video URL
    const mediaUrls = videoReels.map((r) => r.mediaUrl);
    const uniqueUrls = new Set(mediaUrls);
    expect(uniqueUrls.size).toBe(mediaUrls.length);

    // Verify all video files physically exist in public/
    const fs = await import('node:fs');
    const path = await import('node:path');
    const publicDir = path.resolve(__dirname, '../public');

    for (const url of mediaUrls) {
      if (url.startsWith('/')) {
        const fullPath = path.join(publicDir, url.slice(1));
        expect(fs.existsSync(fullPath), `Video must exist at: ${fullPath}`).toBe(true);
      }
    }
  });

  it('maintains global sound state: starts unmuted, persists mute/unmute mode across reels', () => {
    const store = useReelStore.getState();
    // Must start in unmuted mode so reels play music first
    expect(store.isMuted).toBe(false);

    // Toggle mute
    store.toggleMute();
    expect(useReelStore.getState().isMuted).toBe(true);

    // Navigate to next reel - should remain in muted mode
    store.openReel(INITIAL_REELS[0].id);
    store.nextReel();
    expect(useReelStore.getState().isMuted).toBe(true);

    // Unmute
    store.toggleMute();
    expect(useReelStore.getState().isMuted).toBe(false);

    // Navigate again - should remain in unmuted mode
    store.nextReel();
    expect(useReelStore.getState().isMuted).toBe(false);
  });
});



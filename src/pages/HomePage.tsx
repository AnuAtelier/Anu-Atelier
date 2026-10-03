import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustMarquee } from '../components/home/TrustMarquee';
import { QuickCategories } from '../components/home/QuickCategories';
import { ArtisanStorySection } from '../components/stories/ArtisanStorySection';
import { PromoCardsRow } from '../components/home/PromoCardsRow';
import { LatestCrafts } from '../components/home/LatestCrafts';
import { ArtisanTrustPromise } from '../components/home/ArtisanTrustPromise';
import { ReelStoryViewerModal } from '../components/stories/ReelStoryViewerModal';
import { AddReelModal } from '../components/stories/AddReelModal';

export const HomePage: React.FC = () => {
  const { hash } = useLocation();

  // Smooth scroll to anchor (#artisan-story)
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [hash]);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full min-w-0 overflow-x-hidden">
      {/* 1. Hero & Value Marquee */}
      <HeroBanner />
      <TrustMarquee />

      {/* 2. Categories Browse */}
      <QuickCategories />

      {/* 3. Artisan Stories & Video Reels (Kept UP near top as requested) */}
      <ArtisanStorySection />

      {/* 4. Curated Promo Offers */}
      <PromoCardsRow />

      {/* 5. All Items Catalog (Where all items appear) */}
      <LatestCrafts />

      {/* 6. The Anu Atelier Promise: Why Discerning Shoppers Choose Us (Placed at the bottom in the last) */}
      <ArtisanTrustPromise />

      {/* Interactive Reel & Story Fullscreen Viewer Modal */}
      <ReelStoryViewerModal />

      {/* Owner Add Story / Reel Modal */}
      <AddReelModal />
    </div>
  );
};

import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustMarquee } from '../components/home/TrustMarquee';
import { QuickCategories } from '../components/home/QuickCategories';
import { PromoCardsRow } from '../components/home/PromoCardsRow';
import { ArtisanTrustPromise } from '../components/home/ArtisanTrustPromise';
import { LatestCrafts } from '../components/home/LatestCrafts';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />
      <TrustMarquee />
      <QuickCategories />
      <PromoCardsRow />
      <ArtisanTrustPromise />
      <LatestCrafts />
    </div>
  );
};


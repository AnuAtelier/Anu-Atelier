import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { QuickCategories } from '../components/home/QuickCategories';
import { PromoCardsRow } from '../components/home/PromoCardsRow';
import { LatestCrafts } from '../components/home/LatestCrafts';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />
      <QuickCategories />
      <PromoCardsRow />
      <LatestCrafts />
    </div>
  );
};

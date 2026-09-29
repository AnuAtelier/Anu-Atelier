import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { CATEGORIES } from '../../constants';
import { ProductCard } from '../common/ProductCard';

export const LatestCrafts: React.FC = () => {
  const { products } = useProductStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');

  // Filter only published products
  const publishedProducts = products.filter((p) => p.status === 'published');

  // Filter by category if selected
  const filteredProducts =
    selectedFilter === 'all'
      ? publishedProducts
      : publishedProducts.filter((p) => p.categoryId === selectedFilter);

  // Newest first
  const sortedProducts = [...filteredProducts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <section id="latest-crafts" className="py-10 sm:py-16 px-3.5 sm:px-8 max-w-7xl mx-auto transition-colors w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1">
            <Sparkles className="h-3 w-3 animate-sparkle-spin" />
            <span>Fresh From Workshop</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
            Latest Crafts
          </h2>
          <p className="text-sm text-gray-700 mt-1 font-normal">
            Handcrafted with patience, natural dyes, and authentic Indian tradition.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full max-w-full overscroll-x-contain">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 backdrop-blur-xs cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md scale-105'
                : 'bg-pink-500/10 text-pink-950 border border-pink-200/60 hover:bg-pink-500/20 active:scale-95'
            }`}
          >
            All Crafts ({publishedProducts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = publishedProducts.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 backdrop-blur-xs cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md scale-105'
                    : 'bg-stone-500/10 text-stone-800 border border-stone-200/60 hover:bg-pink-500/10 hover:border-pink-300 active:scale-95'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Product Cards */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8">
          <p className="text-[var(--text-muted)] text-base font-medium">
            No crafts found in this category. Check back soon for new artisan drops!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

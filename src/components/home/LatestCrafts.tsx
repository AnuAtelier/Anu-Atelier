import React, { useState } from 'react';
import { useProductStore } from '../../store/useProductStore';
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
    <section id="latest-crafts" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            Fresh From Workshop
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-main)] mt-1">
            Latest Crafts
          </h2>
          <p className="text-sm text-gray-700 mt-1 font-normal">
            Handcrafted with patience, natural dyes, and authentic Indian tradition.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-gray-900 hover:bg-[var(--bg-input)]'
            }`}
          >
            All Crafts
          </button>
          <button
            onClick={() => setSelectedFilter('terracotta-clay')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'terracotta-clay'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-gray-900 hover:bg-[var(--bg-input)]'
            }`}
          >
            Terracotta & Clay
          </button>
          <button
            onClick={() => setSelectedFilter('embroidered-clothes')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'embroidered-clothes'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-gray-900 hover:bg-[var(--bg-input)]'
            }`}
          >
            Clothing
          </button>
          <button
            onClick={() => setSelectedFilter('other-handicrafts')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'other-handicrafts'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-gray-900 hover:bg-[var(--bg-input)]'
            }`}
          >
            Handicrafts
          </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

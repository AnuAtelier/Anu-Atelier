import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/common/ProductCard';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subcatParam = searchParams.get('subcat');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');

  const { products } = useProductStore();

  const category = CATEGORIES.find((c) => c.slug === slug || c.id === slug);

  // Filter products by category
  let categoryProducts = products.filter(
    (p) => p.categoryId === slug || p.categoryId === category?.id
  );

  // Further filter by subcategory if specified
  if (subcatParam) {
    categoryProducts = categoryProducts.filter((p) => p.subcategoryId === subcatParam);
  }

  // Sort products
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return b.createdAt - a.createdAt; // newest
  });

  const handleSubcategoryClick = (subId: string | null) => {
    if (!subId) {
      searchParams.delete('subcat');
    } else {
      searchParams.set('subcat', subId);
    }
    setSearchParams(searchParams);
  };

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-[var(--text-main)] mb-3">
          Category Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          The requested craft collection could not be found.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)]"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-pink-200/50 shadow-2xs text-xs text-[var(--text-muted)]">
        <Link to="/" className="hover:text-[var(--primary)] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-pink-400" />
        <Link to={`/category/${category.slug}`} className="hover:text-[var(--primary)] transition-colors">
          {category.name}
        </Link>
        {subcatParam && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-pink-400" />
            <span className="text-[var(--text-main)] font-semibold capitalize">
              {subcatParam.replace(/-/g, ' ')}
            </span>
          </>
        )}
      </nav>

      {/* Category Hero / Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-rose-500/10 backdrop-blur-md border border-pink-200/60 p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            Handcrafted Collection
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Subcategory Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleSubcategoryClick(null)}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            !subcatParam
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
              : 'border border-pink-200/70 bg-white/80 backdrop-blur-sm text-[var(--text-main)] hover:bg-white hover:border-pink-300'
          }`}
        >
          All {category.name.split(' ')[0]}
        </button>
        {category.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => handleSubcategoryClick(sub.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subcatParam === sub.id
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                : 'border border-pink-200/70 bg-white/80 backdrop-blur-sm text-[var(--text-main)] hover:bg-white hover:border-pink-300'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Control & Sorting Bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-pink-200/50 shadow-2xs">
        <div className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
          Showing <span className="font-bold text-[var(--text-main)]">{sortedProducts.length}</span> handcrafted items
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-[var(--primary)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs sm:text-sm font-semibold rounded-full border border-pink-200 bg-white/90 text-[var(--text-main)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)] cursor-pointer shadow-2xs"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-white/90 via-pink-50/30 to-purple-50/20 backdrop-blur-md border border-pink-200/60 rounded-3xl p-8 space-y-3 shadow-xs">
          <p className="text-base font-semibold text-[var(--text-main)]">
            No items currently found in this subcategory
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Our artisans craft in small batches. Please check other collections or view all crafts.
          </p>
          <button
            onClick={() => handleSubcategoryClick(null)}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold hover:from-pink-600 hover:to-rose-700 shadow-sm cursor-pointer"
          >
            View All {category.name}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

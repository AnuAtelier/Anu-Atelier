import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/common/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { products } = useProductStore();

  const searchResults = q.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(q.toLowerCase()) ||
          p.subcategoryName.toLowerCase().includes(q.toLowerCase()) ||
          p.description.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-main)]">
          Search Results
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {q ? `Showing results for "${q}" (${searchResults.length} items found)` : 'Enter a search term above'}
        </p>
      </div>

      {searchResults.length === 0 ? (
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center mx-auto">
            <Search className="h-10 w-10 opacity-60" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-main)]">
            No Crafts Found
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            We couldn't find any handmade crafts matching "{q}". Try searching for "terracotta", "kurti", "jute", or "diyas".
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-dark)]"
          >
            <span>Back to Store</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

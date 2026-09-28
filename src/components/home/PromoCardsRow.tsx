import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const PromoCardsRow: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="relative rounded-3xl p-8 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 dark:from-[#2a1722] dark:via-[#1e141a] dark:to-[#171115] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Festive Edit
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)] leading-snug">
              Terracotta & Clay Collection
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Traditional unglazed and painted earthen decor from ₹199
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/terracotta-clay"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-semibold shadow-sm transition-transform group-hover:translate-x-1"
            >
              <span>Explore Terracotta</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative rounded-3xl p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 dark:from-[#281c15] dark:via-[#1d1612] dark:to-[#171115] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Artisan Stitched
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)] leading-snug">
              Pure Khadi & Embroidered Wear
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Chikankari, Kantha, and Sashiko handcrafted garments
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/embroidered-clothes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-transform group-hover:translate-x-1"
            >
              <span>View Clothing</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative rounded-3xl p-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/40 dark:from-[#13241b] dark:via-[#111c16] dark:to-[#171115] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Eco-Friendly
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)] leading-snug">
              Jute Totes & Macrame Hangings
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Sustainable lifestyle crafts made with organic fibers
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/other-handicrafts"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-transform group-hover:translate-x-1"
            >
              <span>Discover Handicrafts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

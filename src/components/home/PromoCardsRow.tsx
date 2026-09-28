import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const PromoCardsRow: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Festive Edit - Terracotta */}
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-pink-50/80 via-rose-50/40 to-white border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-pink-100/40 shadow-inner">
              <img
                src="/img/promo/promo-terracotta.jpg"
                alt="Festive Terracotta & Clay Crafts"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[var(--primary)] text-[11px] font-bold uppercase tracking-wider shadow-sm border border-pink-100">
                Festive Edit
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)] leading-snug mb-2">
              Terracotta & Clay Collection
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2">
              Traditional unglazed and painted earthen decor from ₹199
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/terracotta-clay"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-semibold shadow-sm transition-all group-hover:translate-x-1"
            >
              <span>Explore Terracotta</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Artisan Stitched - Embroidered Clothes */}
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-amber-100/40 shadow-inner">
              <img
                src="/img/promo/promo-clothing.jpg"
                alt="Artisan Stitched Khadi & Embroidery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-amber-700 text-[11px] font-bold uppercase tracking-wider shadow-sm border border-amber-100">
                Artisan Stitched
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)] leading-snug mb-2">
              Pure Khadi & Embroidered Wear
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2">
              Chikankari, Kantha, and Sashiko handcrafted garments
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/embroidered-clothes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all group-hover:translate-x-1"
            >
              <span>View Clothing</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Eco-Friendly - Other Handicrafts */}
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-emerald-100/40 shadow-inner">
              <img
                src="/img/promo/promo-handicrafts.jpg"
                alt="Eco-Friendly Jute & Macrame Crafts"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-emerald-700 text-[11px] font-bold uppercase tracking-wider shadow-sm border border-emerald-100">
                Eco-Friendly
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-main)] leading-snug mb-2">
              Jute Totes & Macrame Hangings
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2">
              Sustainable lifestyle crafts made with organic fibers
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/other-handicrafts"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all group-hover:translate-x-1"
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

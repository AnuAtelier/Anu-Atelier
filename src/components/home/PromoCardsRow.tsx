import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const PromoCardsRow: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900">
          Explore Our Crafts
        </h2>
        <p className="text-sm sm:text-base text-gray-700 mt-1 font-normal">
          Shop by our curated artisan collections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Festive Edit - Terracotta */}
        <div className="relative rounded-3xl p-8 overflow-hidden border border-purple-100/90 shadow-xs hover:shadow-lg transition-all duration-500 group flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-[#e0e7ff]/80 via-[#ede9fe]/90 to-[#fae8ff]/70">
          {/* Background craft image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src="/img/promo/promo-terracotta.jpg"
              alt=""
              className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
          </div>

          {/* Words in front */}
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[var(--primary)] text-xs font-bold uppercase tracking-wider shadow-xs border border-pink-100">
              Festive Edit
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              Terracotta & Clay Items
            </h3>
            <p className="text-sm sm:text-base text-gray-800 font-medium line-clamp-2 max-w-xs">
              Traditional unglazed and painted earthen decor from ₹199
            </p>
          </div>

          {/* Option in front */}
          <div className="relative z-10 pt-6">
            <Link
              to="/category/terracotta-clay"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-[var(--primary)] hover:text-white text-sm font-bold shadow-sm transition-all duration-200 group-hover:shadow"
            >
              <span>Shop Terracotta</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Artisan Stitched - Embroidered Clothes */}
        <div className="relative rounded-3xl p-8 overflow-hidden border border-rose-100/90 shadow-xs hover:shadow-lg transition-all duration-500 group flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-[#ffe4e6]/90 via-[#ffd1dc]/90 to-[#fecdd3]/70">
          {/* Background craft image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src="/img/promo/promo-clothing.jpg"
              alt=""
              className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
          </div>

          {/* Words in front */}
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-rose-600 text-xs font-bold uppercase tracking-wider shadow-xs border border-rose-100">
              Artisan Stitched
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              Embroidered & Hand-Stitched
            </h3>
            <p className="text-sm sm:text-base text-gray-800 font-medium line-clamp-2 max-w-xs">
              Chikankari, Kantha, and Sashiko handcrafted garments
            </p>
          </div>

          {/* Option in front */}
          <div className="relative z-10 pt-6">
            <Link
              to="/category/embroidered-clothes"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-rose-600 hover:text-white text-sm font-bold shadow-sm transition-all duration-200 group-hover:shadow"
            >
              <span>Shop Clothing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 3: Eco-Friendly - Other Handicrafts */}
        <div className="relative rounded-3xl p-8 overflow-hidden border border-amber-100/90 shadow-xs hover:shadow-lg transition-all duration-500 group flex flex-col justify-between min-h-[280px] sm:min-h-[300px] bg-gradient-to-br from-[#fef3c7]/90 via-[#fed7aa]/80 to-[#ffe4e6]/70">
          {/* Background craft image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src="/img/promo/promo-handicrafts.jpg"
              alt=""
              className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
          </div>

          {/* Words in front */}
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-amber-700 text-xs font-bold uppercase tracking-wider shadow-xs border border-amber-100">
              Eco-Friendly
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              Other Handicrafts
            </h3>
            <p className="text-sm sm:text-base text-gray-800 font-medium line-clamp-2 max-w-xs">
              Jute bags, macrame hangings, and organic fiber crafts
            </p>
          </div>

          {/* Option in front */}
          <div className="relative z-10 pt-6">
            <Link
              to="/category/other-handicrafts"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-amber-600 hover:text-white text-sm font-bold shadow-sm transition-all duration-200 group-hover:shadow"
            >
              <span>Shop Handicrafts</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

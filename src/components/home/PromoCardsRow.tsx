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
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#e0e7ff] via-[#ede9fe] to-[#fae8ff] border border-purple-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-white/60 shadow-xs border border-white/60">
              <img
                src="/img/promo/promo-terracotta.jpg"
                alt="Festive Terracotta & Clay Crafts"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[var(--primary)] text-xs font-bold uppercase tracking-wider shadow-xs border border-pink-100">
                Festive Edit
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
              Terracotta & Clay Collection
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              Traditional unglazed and painted earthen decor from ₹199
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/terracotta-clay"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-[var(--primary)] hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all group-hover:translate-x-1"
            >
              <span>Explore Terracotta</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Artisan Stitched - Embroidered Clothes */}
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#ffe4e6] via-[#ffd1dc] to-[#fecdd3] border border-rose-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-white/60 shadow-xs border border-white/60">
              <img
                src="/img/promo/promo-clothing.jpg"
                alt="Artisan Stitched Khadi & Embroidery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-rose-600 text-xs font-bold uppercase tracking-wider shadow-xs border border-rose-100">
                Artisan Stitched
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
              Pure Khadi & Embroidered Wear
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              Chikankari, Kantha, and Sashiko handcrafted garments
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/embroidered-clothes"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-rose-600 hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all group-hover:translate-x-1"
            >
              <span>View Clothing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 3: Eco-Friendly - Other Handicrafts */}
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#ffe4e6] border border-amber-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-white/60 shadow-xs border border-white/60">
              <img
                src="/img/promo/promo-handicrafts.jpg"
                alt="Eco-Friendly Jute & Macrame Crafts"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-amber-700 text-xs font-bold uppercase tracking-wider shadow-xs border border-amber-100">
                Eco-Friendly
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
              Jute Totes & Macrame Hangings
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              Sustainable lifestyle crafts made with organic fibers
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/other-handicrafts"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-amber-600 hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all group-hover:translate-x-1"
            >
              <span>Discover Handicrafts</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

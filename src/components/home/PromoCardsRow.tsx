import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PromoCardsRow: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full max-w-full min-w-0 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1">
            <Sparkles className="h-3 w-3 animate-sparkle-spin" />
            <span>Curated Collections</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900">
            Explore Our Crafts
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mt-1 font-normal">
            Handcrafted with devotion by heritage artisans across India.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Festive Edit - Terracotta */}
        <div className="card-interactive shimmer-container relative rounded-3xl p-6 bg-gradient-to-br from-[#e0e7ff] via-[#ede9fe] to-[#fae8ff] border border-purple-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-white/60 shadow-xs border border-white/60">
              <img
                src="/img/promo/promo-terracotta.jpg"
                alt="Festive Terracotta & Clay Crafts"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[var(--primary)] text-xs font-bold uppercase tracking-wider shadow-xs border border-pink-100 animate-badge-pulse">
                Festive Edit
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2 group-hover:text-purple-900 transition-colors">
              Terracotta & Clay Collection
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              Traditional unglazed and painted earthen decor from ₹199
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/terracotta-clay"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-[var(--primary)] hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all group-hover:translate-x-1"
            >
              <span>Explore Terracotta</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Card 2: Artisan Stitched - Embroidered Clothes */}
        <div className="card-interactive shimmer-container relative rounded-3xl p-6 bg-gradient-to-br from-[#ffe4e6] via-[#ffd1dc] to-[#fecdd3] border border-rose-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-white/60 shadow-xs border border-white/60">
              <img
                src="/img/promo/promo-clothing.jpg"
                alt="Artisan Stitched Khadi & Embroidery"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-rose-600 text-xs font-bold uppercase tracking-wider shadow-xs border border-rose-100 animate-badge-pulse">
                Artisan Stitched
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2 group-hover:text-rose-900 transition-colors">
              Pure Khadi & Embroidered Wear
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              Chikankari, Kantha, and Sashiko handcrafted garments
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/embroidered-clothes"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-rose-600 hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all group-hover:translate-x-1"
            >
              <span>View Clothing</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Card 3: Eco-Friendly - Other Handicrafts */}
        <div className="card-interactive shimmer-container relative rounded-3xl p-6 bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#ffe4e6] border border-amber-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 bg-white/60 shadow-xs border border-white/60">
              <img
                src="/img/hero-wall-hanging-dreamcatcher.jpg"
                alt="Handcrafted Boho Celestial Floral Wall Hangings"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-amber-700 text-xs font-bold uppercase tracking-wider shadow-xs border border-amber-100 animate-badge-pulse">
                Handmade Wall Art
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2 group-hover:text-amber-900 transition-colors">
              Boho Wall Hangings & Decor
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              Celestial dreamcatcher hangings & artisanal lifestyle crafts made with organic fibers
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/category/other-handicrafts"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-900 hover:bg-amber-600 hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all group-hover:translate-x-1"
            >
              <span>Discover Handicrafts</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};


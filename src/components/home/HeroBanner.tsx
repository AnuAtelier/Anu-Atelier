import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Leaf, Heart, ShieldCheck, Truck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-10 md:py-20 transition-colors w-full max-w-full min-w-0">
      {/* Ambient Animated Glowing Mesh Orbs (Hardware-accelerated with translate3d) */}
      <div
        aria-hidden="true"
        className="absolute top-10 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-pink-300/30 blur-3xl pointer-events-none animate-pulse-glow"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 right-1/4 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-amber-200/35 blur-3xl pointer-events-none animate-pulse-glow"
        style={{ animationDelay: '-2s' }}
      />

      {/* Full-width Transparent Authentic Indian Crafts Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-multiply"
        style={{ backgroundImage: `url('/img/hero-crafts-bg.jpg')` }}
      />
      {/* Soft gradient wash so background image is transparent and text has 100% perfect contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-pink-50/90 via-rose-50/80 to-purple-50/70 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left Content */}
        <div className="space-y-6 text-center lg:text-left">
          {/* Animated Sparkles Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-300/60 backdrop-blur-xs text-pink-700 text-xs font-bold tracking-wide shadow-xs animate-badge-pulse">
            <Sparkles className="h-3.5 w-3.5 text-pink-600 animate-sparkle-spin" />
            <span>Authentic Indian Handmade Crafts</span>
          </div>

          {/* Heading with Animated Shimmer Gradient */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-main)] leading-[1.15]">
            Handmade Treasures, <br className="hidden sm:inline" />
            <span className="animate-text-gradient bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent italic">
              Crafted with Love
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Discover exquisite terracotta pottery, hand-stitched folk clothing, and timeless artisan handicrafts made by traditional Indian craftswomen.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <a
              href="#latest-crafts"
              className="btn-shimmer w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>

            <Link
              to="/category/terracotta-clay"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-orange-200/80 bg-orange-500/10 hover:bg-orange-500/20 hover:scale-102 text-orange-950 text-sm font-bold transition-all text-center shadow-xs backdrop-blur-xs cursor-pointer"
            >
              Terracotta Crafts
            </Link>
          </div>

          {/* Micro Trust Indicators under Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-pink-200/50 shadow-2xs">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Eco-Friendly</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-pink-200/50 shadow-2xs">
              <Truck className="h-3.5 w-3.5 text-rose-600" />
              <span>Free Delivery &gt; ₹499</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-pink-200/50 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Breakage Safe Pack</span>
            </div>
          </div>
        </div>

        {/* Right Hero Image Card with Floating Badges */}
        <div className="relative mx-auto max-w-md lg:max-w-none w-full flex items-center justify-center">
          {/* Main Artisan Image Card */}
          <div className="group relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg-soft border border-stone-200/80 bg-stone-100 card-interactive">
            <img
              src="/img/hero-artisan.jpg"
              alt="Smiling Indian craftswoman painting terracotta pottery in a sunny workshop"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent flex items-end p-5 sm:p-6">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider font-bold text-pink-200 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full inline-block mb-1.5 shadow-sm">
                  Featured Artisan Story
                </span>
                <p className="font-heading text-lg sm:text-xl font-bold drop-shadow-sm">
                  100% Genuine Khadi & Terracotta
                </p>
              </div>
            </div>
          </div>

          {/* Floating Badge 1: Top-Right Eco Seal */}
          <div
            className="animate-float-slow absolute -top-4 -right-2 sm:-right-4 z-20 hidden xs:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-300/70 shadow-md text-gray-900"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Leaf className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold leading-tight text-emerald-800">100% Eco-Friendly</span>
              <span className="block text-[9px] text-gray-500 font-medium">Pure River Clay</span>
            </div>
          </div>

          {/* Floating Badge 2: Bottom-Left Artisan Empowerment Seal */}
          <div
            className="animate-float-delayed absolute -bottom-5 -left-2 sm:-left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-300/70 shadow-md text-gray-900"
          >
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold leading-tight text-rose-900">500+ Rural Artisans</span>
              <span className="block text-[9px] text-gray-500 font-medium">Empowered with fair pay</span>
            </div>
          </div>

          {/* Floating Badge 3: Top-Left Customer Rating */}
          <div
            className="animate-float-gentle absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold shadow-sm border border-white/20"
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
            <span>4.9 / 5</span>
            <span className="text-[10px] text-pink-200 font-normal hidden sm:inline">(1,200+ Reviews)</span>
          </div>
        </div>
      </div>
    </section>
  );
};


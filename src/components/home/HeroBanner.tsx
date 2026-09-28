import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-8 transition-colors">
      {/* Full-width Transparent Authentic Indian Crafts Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-multiply"
        style={{ backgroundImage: `url('/img/hero-crafts-bg.jpg')` }}
      />
      {/* Soft gradient wash so background image is transparent like before, and text has 100% perfect contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-pink-50/90 via-rose-50/80 to-purple-50/70 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Content: NO card border, NO margin box, clean and open as user requested */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-300/60 backdrop-blur-xs text-pink-700 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-pink-600" />
            <span>Authentic Indian Handmade Crafts</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-main)] leading-[1.15]">
            Handmade Treasures, <br className="hidden sm:inline" />
            <span className="text-[var(--primary)] italic">Crafted with Love</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Discover exquisite terracotta pottery, hand-stitched folk clothing, and timeless artisan handicrafts made by traditional Indian craftswomen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <a
              href="#latest-crafts"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              to="/category/terracotta-clay"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-orange-200/80 bg-orange-500/10 hover:bg-orange-500/20 text-orange-950 text-sm font-bold transition-all text-center shadow-xs backdrop-blur-xs cursor-pointer"
            >
              Terracotta Crafts
            </Link>
          </div>
        </div>

        {/* Right Hero Image Card (Properly Fit, No Logo Overlay) */}
        <div className="relative mx-auto max-w-md lg:max-w-none w-full flex items-center justify-center">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg-soft border border-pink-200/70 bg-stone-100">
            <img
              src="/img/hero-artisan.jpg"
              alt="Smiling Indian craftswoman painting terracotta pottery in a sunny workshop"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent flex items-end p-5 sm:p-6">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider font-bold text-pink-200 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full inline-block mb-1.5 shadow-sm">
                  Featured Artisan Story
                </span>
                <p className="font-heading text-lg sm:text-xl font-bold drop-shadow-sm">100% Genuine Khadi & Terracotta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

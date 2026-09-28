import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-8 bg-gradient-to-b from-[var(--secondary)]/30 via-[var(--bg-color)] to-[var(--bg-color)] transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Text */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--secondary)] text-[var(--primary-dark)] text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Authentic Indian Handmade Crafts</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-main)] leading-[1.15]">
            Handmade Treasures, <br className="hidden sm:inline" />
            <span className="text-[var(--primary)] italic">Crafted with Love</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Discover exquisite terracotta pottery, hand-stitched folk clothing, and timeless artisan handicrafts made by traditional Indian craftswomen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <a
              href="#latest-crafts"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md-soft hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              to="/category/terracotta-clay"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-main)] text-sm font-semibold transition-all text-center shadow-sm"
            >
              Terracotta Crafts
            </Link>
          </div>
        </div>

        {/* Right Hero Image Card */}
        <div className="relative mx-auto max-w-md lg:max-w-none w-full">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-lg-soft border border-[var(--border-color)]">
            <img
              src="/img/hero-artisan.jpg"
              alt="Smiling Indian craftswoman painting terracotta pottery in a sunny workshop"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider font-bold text-pink-200 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full inline-block mb-1.5 shadow-sm">
                  Featured Artisan Story
                </span>
                <p className="font-heading text-lg sm:text-xl font-bold drop-shadow-sm">100% Genuine Khadi & Terracotta</p>
              </div>
            </div>

            {/* Studio Seal Badge */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-pink-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 shadow-xs flex-shrink-0">
                <img src="/logo-icon.jpg" alt="Anu Atelier Seal" className="w-full h-full rounded-full object-cover bg-white" />
              </div>
              <div className="pr-1 text-left hidden xs:block sm:block">
                <p className="text-[11px] font-bold text-gray-900 leading-none">Anu Atelier</p>
                <p className="text-[9px] text-[var(--primary)] font-semibold mt-0.5">Original Studio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

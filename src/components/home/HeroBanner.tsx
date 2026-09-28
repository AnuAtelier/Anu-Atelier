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
              src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80"
              alt="Artisan hand-stitching textile in India"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider font-semibold text-pink-300">
                  Featured Artisan Story
                </span>
                <p className="font-heading text-lg font-bold">100% Genuine Khadi & Terracotta</p>
              </div>
            </div>
          </div>

          {/* Floating Pill Badge */}
          <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-6 bg-[var(--bg-card)] border border-[var(--border-color)] py-2.5 px-4 rounded-2xl shadow-lg flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ₹0
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-main)]">Free Delivery</p>
              <p className="text-[11px] text-[var(--text-muted)]">On all orders above ₹100</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

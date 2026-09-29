import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Shirt, ShoppingBag, Palette, Trees, Flower2, Heart } from 'lucide-react';

const QUICK_ITEMS = [
  {
    name: 'Wall Art',
    icon: Sparkles,
    link: '/category/wall-art-decor',
    bg: 'bg-gradient-to-br from-amber-600/15 to-stone-700/25 border-amber-300/60 text-amber-900',
    hover: 'group-hover:from-amber-600 group-hover:to-stone-700 group-hover:text-white group-hover:shadow-amber-600/30',
    trending: 'New',
  },
  {
    name: 'Handkerchiefs',
    icon: Heart,
    link: '/category/embroidered-clothes?subcat=handkerchiefs',
    bg: 'bg-gradient-to-br from-rose-500/15 to-pink-500/25 border-rose-300/60 text-rose-700',
    hover: 'group-hover:from-rose-500 group-hover:to-pink-500 group-hover:text-white group-hover:shadow-rose-500/30',
    trending: 'Custom',
  },
  {
    name: 'Clay Diyas',
    icon: Flame,
    link: '/category/terracotta-clay?subcat=diyas',
    bg: 'bg-gradient-to-br from-amber-500/15 to-orange-500/25 border-amber-300/60 text-amber-700',
    hover: 'group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white group-hover:shadow-amber-500/30',
    trending: 'Popular',
  },
  {
    name: 'Terracotta Pots',
    icon: Flower2,
    link: '/category/terracotta-clay?subcat=pots',
    bg: 'bg-gradient-to-br from-rose-500/15 to-red-500/25 border-rose-300/60 text-rose-700',
    hover: 'group-hover:from-rose-500 group-hover:to-red-500 group-hover:text-white group-hover:shadow-rose-500/30',
  },
  {
    name: 'Kurtis & Tops',
    icon: Shirt,
    link: '/category/embroidered-clothes?subcat=kurtis',
    bg: 'bg-gradient-to-br from-pink-500/15 to-fuchsia-500/25 border-pink-300/60 text-pink-700',
    hover: 'group-hover:from-pink-500 group-hover:to-fuchsia-500 group-hover:text-white group-hover:shadow-pink-500/30',
    trending: 'Trending',
  },
  {
    name: 'Jute Bags',
    icon: ShoppingBag,
    link: '/category/other-handicrafts?subcat=jute-bags',
    bg: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/25 border-emerald-300/60 text-emerald-700',
    hover: 'group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-emerald-500/30',
  },
  {
    name: 'Macrame Art',
    icon: Sparkles,
    link: '/category/other-handicrafts?subcat=macrame-hangings',
    bg: 'bg-gradient-to-br from-purple-500/15 to-indigo-500/25 border-purple-300/60 text-purple-700',
    hover: 'group-hover:from-purple-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-purple-500/30',
  },
  {
    name: 'Wooden Toys',
    icon: Trees,
    link: '/category/other-handicrafts?subcat=wooden-toys',
    bg: 'bg-gradient-to-br from-sky-500/15 to-blue-500/25 border-sky-300/60 text-sky-700',
    hover: 'group-hover:from-sky-500 group-hover:to-blue-500 group-hover:text-white group-hover:shadow-sky-500/30',
  },
  {
    name: 'Dupattas',
    icon: Palette,
    link: '/category/embroidered-clothes?subcat=dupattas',
    bg: 'bg-gradient-to-br from-violet-500/15 to-pink-500/25 border-violet-300/60 text-violet-700',
    hover: 'group-hover:from-violet-500 group-hover:to-pink-500 group-hover:text-white group-hover:shadow-violet-500/30',
  },
];

export const QuickCategories: React.FC = () => {
  return (
    <section className="relative z-20 my-4 sm:my-6 py-6 sm:py-8 border-y border-pink-200/60 bg-white/80 backdrop-blur-md shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Horizontal scroll container with generous top & bottom headroom */}
        <div className="flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto pt-4 pb-3 sm:pt-5 sm:pb-4 scrollbar-none">
          {QUICK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.link}
                className="relative flex flex-col items-center gap-2.5 min-w-[80px] sm:min-w-[96px] group flex-shrink-0 cursor-pointer pt-3 pb-1"
              >
                {/* Trending mini badge with ample top clearance */}
                {item.trending && (
                  <span className="absolute top-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[9px] font-bold tracking-wider uppercase shadow-xs z-20 animate-pulse-glow">
                    {item.trending}
                  </span>
                )}

                {/* Animated Icon Bubble with crisp contrast & elevation */}
                <div
                  className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.bg} ${item.hover} border backdrop-blur-sm flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-110 group-hover:-translate-y-1.5 group-hover:shadow-lg`}
                >
                  <Icon className="h-6 w-6 stroke-[2.2] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </div>

                {/* Label */}
                <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors text-center line-clamp-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};



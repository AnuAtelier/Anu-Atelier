import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Shirt, ShoppingBag, Palette, Trees, Flower2 } from 'lucide-react';

const QUICK_ITEMS = [
  {
    name: 'Clay Diyas',
    icon: Flame,
    link: '/category/terracotta-clay?subcat=diyas',
    bg: 'bg-gradient-to-br from-amber-500/15 to-orange-500/25 border-amber-300/60 text-amber-700',
    hover: 'group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white',
  },
  {
    name: 'Terracotta Pots',
    icon: Flower2,
    link: '/category/terracotta-clay?subcat=pots',
    bg: 'bg-gradient-to-br from-rose-500/15 to-red-500/25 border-rose-300/60 text-rose-700',
    hover: 'group-hover:from-rose-500 group-hover:to-red-500 group-hover:text-white',
  },
  {
    name: 'Kurtis & Tops',
    icon: Shirt,
    link: '/category/embroidered-clothes?subcat=kurtis',
    bg: 'bg-gradient-to-br from-pink-500/15 to-fuchsia-500/25 border-pink-300/60 text-pink-700',
    hover: 'group-hover:from-pink-500 group-hover:to-fuchsia-500 group-hover:text-white',
  },
  {
    name: 'Jute Bags',
    icon: ShoppingBag,
    link: '/category/other-handicrafts?subcat=jute-bags',
    bg: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/25 border-emerald-300/60 text-emerald-700',
    hover: 'group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white',
  },
  {
    name: 'Macrame Art',
    icon: Sparkles,
    link: '/category/other-handicrafts?subcat=macrame-hangings',
    bg: 'bg-gradient-to-br from-purple-500/15 to-indigo-500/25 border-purple-300/60 text-purple-700',
    hover: 'group-hover:from-purple-500 group-hover:to-indigo-500 group-hover:text-white',
  },
  {
    name: 'Wooden Toys',
    icon: Trees,
    link: '/category/other-handicrafts?subcat=wooden-toys',
    bg: 'bg-gradient-to-br from-sky-500/15 to-blue-500/25 border-sky-300/60 text-sky-700',
    hover: 'group-hover:from-sky-500 group-hover:to-blue-500 group-hover:text-white',
  },
  {
    name: 'Dupattas',
    icon: Palette,
    link: '/category/embroidered-clothes?subcat=dupattas',
    bg: 'bg-gradient-to-br from-violet-500/15 to-pink-500/25 border-violet-300/60 text-violet-700',
    hover: 'group-hover:from-violet-500 group-hover:to-pink-500 group-hover:text-white',
  },
];

export const QuickCategories: React.FC = () => {
  return (
    <section className="py-8 px-4 sm:px-8 border-y border-pink-200/40 bg-white/60 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.link}
                className="flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[90px] group flex-shrink-0"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.bg} ${item.hover} border backdrop-blur-sm flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-110 group-hover:shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
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

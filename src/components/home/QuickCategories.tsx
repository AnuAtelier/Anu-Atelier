import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Shirt, ShoppingBag, Palette, Trees, Flower2 } from 'lucide-react';

const QUICK_ITEMS = [
  {
    name: 'Clay Diyas',
    icon: Flame,
    link: '/category/terracotta-clay?subcat=diyas',
  },
  {
    name: 'Terracotta Pots',
    icon: Flower2,
    link: '/category/terracotta-clay?subcat=pots',
  },
  {
    name: 'Kurtis & Tops',
    icon: Shirt,
    link: '/category/embroidered-clothes?subcat=kurtis',
  },
  {
    name: 'Jute Bags',
    icon: ShoppingBag,
    link: '/category/other-handicrafts?subcat=jute-bags',
  },
  {
    name: 'Macrame Art',
    icon: Sparkles,
    link: '/category/other-handicrafts?subcat=macrame-hangings',
  },
  {
    name: 'Wooden Toys',
    icon: Trees,
    link: '/category/other-handicrafts?subcat=wooden-toys',
  },
  {
    name: 'Dupattas',
    icon: Palette,
    link: '/category/embroidered-clothes?subcat=dupattas',
  },
];

export const QuickCategories: React.FC = () => {
  return (
    <section className="py-8 px-4 sm:px-8 border-y border-[var(--border-color)] bg-[var(--bg-card)] transition-colors">
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--secondary)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-105 group-hover:shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors text-center line-clamp-1">
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

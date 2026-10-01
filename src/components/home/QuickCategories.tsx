import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  Flame,
  Flower2,
  Sun,
  Shirt,
  ShoppingBag,
  Feather,
  Trees,
  Palette,
  Mail,
  Gem,
  Package,
  Wind,
  Layers,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface QuickCategoryItem {
  name: string;
  icon: React.ElementType;
  link: string;
  trending?: string;
  badgeColor?: string;
  bg: string;
  hover: string;
  labelHover: string;
  iconAnim: string;
}

const QUICK_ITEMS: QuickCategoryItem[] = [
  {
    name: 'Wall Art',
    icon: Sparkles,
    link: '/category/wall-art-decor',
    trending: 'New',
    badgeColor: 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-violet-500/30',
    bg: 'bg-gradient-to-br from-amber-100 via-orange-100/90 to-amber-200/90 border-amber-300/80 text-amber-800',
    hover: 'group-hover:from-amber-500 group-hover:via-orange-500 group-hover:to-amber-600 group-hover:text-white group-hover:border-amber-400 group-hover:shadow-xl group-hover:shadow-amber-500/35',
    labelHover: 'group-hover:text-amber-700',
    iconAnim: 'icon-art-float',
  },
  {
    name: 'Handkerchiefs',
    icon: Heart,
    link: '/category/embroidered-clothes?subcat=handkerchiefs',
    trending: 'Custom',
    badgeColor: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    bg: 'bg-gradient-to-br from-rose-100 via-pink-100/90 to-rose-200/90 border-rose-300/80 text-rose-700',
    hover: 'group-hover:from-rose-500 group-hover:via-pink-500 group-hover:to-rose-600 group-hover:text-white group-hover:border-rose-400 group-hover:shadow-xl group-hover:shadow-rose-500/35',
    labelHover: 'group-hover:text-rose-700',
    iconAnim: 'icon-heart-pulse',
  },
  {
    name: 'Clay Diyas',
    icon: Flame,
    link: '/category/terracotta-clay?subcat=diyas',
    trending: 'Popular',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-500/30',
    bg: 'bg-gradient-to-br from-amber-100 via-orange-100/90 to-yellow-200/90 border-orange-300/80 text-orange-700',
    hover: 'group-hover:from-amber-500 group-hover:via-orange-500 group-hover:to-yellow-500 group-hover:text-white group-hover:border-orange-400 group-hover:shadow-xl group-hover:shadow-orange-500/35',
    labelHover: 'group-hover:text-orange-700',
    iconAnim: 'icon-flame-flicker',
  },
  {
    name: 'Terracotta Pots',
    icon: Flower2,
    link: '/category/terracotta-clay?subcat=pots',
    trending: 'Clay Eco',
    badgeColor: 'bg-gradient-to-r from-orange-600 to-stone-700 text-white shadow-orange-600/30',
    bg: 'bg-gradient-to-br from-orange-100 via-red-100/80 to-amber-200/90 border-orange-300/80 text-orange-800',
    hover: 'group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-amber-700 group-hover:text-white group-hover:border-orange-500 group-hover:shadow-xl group-hover:shadow-orange-600/35',
    labelHover: 'group-hover:text-orange-800',
    iconAnim: 'icon-pot-wobble',
  },
  {
    name: 'Devotional Idols',
    icon: Sun,
    link: '/category/terracotta-clay?subcat=devotional-idols',
    trending: 'Divine',
    badgeColor: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-stone-950 font-black shadow-amber-400/35',
    bg: 'bg-gradient-to-br from-yellow-100 via-amber-100/90 to-yellow-200/90 border-yellow-300/80 text-amber-800',
    hover: 'group-hover:from-yellow-400 group-hover:via-amber-500 group-hover:to-yellow-500 group-hover:text-stone-950 group-hover:border-yellow-400 group-hover:shadow-xl group-hover:shadow-yellow-500/35',
    labelHover: 'group-hover:text-amber-800',
    iconAnim: 'icon-sun-spin',
  },
  {
    name: 'Kurtis & Tops',
    icon: Shirt,
    link: '/category/embroidered-clothes?subcat=kurtis',
    trending: 'Trending',
    badgeColor: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-fuchsia-500/30',
    bg: 'bg-gradient-to-br from-pink-100 via-fuchsia-100/90 to-pink-200/90 border-pink-300/80 text-pink-700',
    hover: 'group-hover:from-pink-500 group-hover:via-fuchsia-600 group-hover:to-pink-600 group-hover:text-white group-hover:border-pink-400 group-hover:shadow-xl group-hover:shadow-pink-500/35',
    labelHover: 'group-hover:text-pink-700',
    iconAnim: 'icon-needle-tilt',
  },
  {
    name: 'Jute Bags',
    icon: ShoppingBag,
    link: '/category/other-handicrafts?subcat=jute-bags',
    trending: 'Eco',
    badgeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30',
    bg: 'bg-gradient-to-br from-emerald-100 via-teal-100/90 to-emerald-200/90 border-emerald-300/80 text-emerald-700',
    hover: 'group-hover:from-emerald-500 group-hover:via-teal-600 group-hover:to-green-600 group-hover:text-white group-hover:border-emerald-400 group-hover:shadow-xl group-hover:shadow-emerald-500/35',
    labelHover: 'group-hover:text-emerald-700',
    iconAnim: 'icon-gift-bounce',
  },
  {
    name: 'Macrame Art',
    icon: Feather,
    link: '/category/other-handicrafts?subcat=macrame-hangings',
    trending: 'Boho',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30',
    bg: 'bg-gradient-to-br from-purple-100 via-indigo-100/90 to-purple-200/90 border-purple-300/80 text-purple-700',
    hover: 'group-hover:from-purple-500 group-hover:via-indigo-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-purple-400 group-hover:shadow-xl group-hover:shadow-purple-500/35',
    labelHover: 'group-hover:text-purple-700',
    iconAnim: 'icon-art-float',
  },
  {
    name: 'Wooden Toys',
    icon: Trees,
    link: '/category/other-handicrafts?subcat=wooden-toys',
    trending: 'Heritage',
    badgeColor: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    bg: 'bg-gradient-to-br from-sky-100 via-blue-100/90 to-cyan-200/90 border-sky-300/80 text-sky-700',
    hover: 'group-hover:from-sky-500 group-hover:via-blue-600 group-hover:to-cyan-600 group-hover:text-white group-hover:border-sky-400 group-hover:shadow-xl group-hover:shadow-sky-500/35',
    labelHover: 'group-hover:text-sky-700',
    iconAnim: 'icon-pot-wobble',
  },
  {
    name: 'Dupattas',
    icon: Palette,
    link: '/category/embroidered-clothes?subcat=dupattas',
    trending: 'Festive',
    badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-rose-500/30',
    bg: 'bg-gradient-to-br from-violet-100 via-pink-100/90 to-rose-200/90 border-violet-300/80 text-violet-700',
    hover: 'group-hover:from-violet-500 group-hover:via-pink-600 group-hover:to-rose-600 group-hover:text-white group-hover:border-violet-400 group-hover:shadow-xl group-hover:shadow-violet-500/35',
    labelHover: 'group-hover:text-violet-700',
    iconAnim: 'icon-needle-tilt',
  },
  {
    name: 'Greeting Cards',
    icon: Mail,
    link: '/category/other-handicrafts?subcat=devotional-cards',
    trending: 'Handmade',
    badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-rose-600/30',
    bg: 'bg-gradient-to-br from-rose-100 via-amber-100/90 to-red-200/90 border-rose-300/80 text-rose-800',
    hover: 'group-hover:from-rose-600 group-hover:via-pink-600 group-hover:to-amber-600 group-hover:text-white group-hover:border-rose-400 group-hover:shadow-xl group-hover:shadow-rose-600/35',
    labelHover: 'group-hover:text-rose-800',
    iconAnim: 'icon-gift-bounce',
  },
  {
    name: 'Clay Jewelry',
    icon: Gem,
    link: '/category/terracotta-clay?subcat=jewelry',
    trending: 'Hot 🔥',
    badgeColor: 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 text-white shadow-red-500/30',
    bg: 'bg-gradient-to-br from-cyan-100 via-teal-100/90 to-blue-200/90 border-cyan-300/80 text-cyan-800',
    hover: 'group-hover:from-cyan-500 group-hover:via-teal-600 group-hover:to-blue-600 group-hover:text-white group-hover:border-cyan-400 group-hover:shadow-xl group-hover:shadow-cyan-500/35',
    labelHover: 'group-hover:text-cyan-800',
    iconAnim: 'icon-gem-pulse',
  },
  {
    name: 'Bamboo Baskets',
    icon: Package,
    link: '/category/other-handicrafts?subcat=bamboo-baskets',
    trending: 'Natural',
    badgeColor: 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white shadow-lime-600/30',
    bg: 'bg-gradient-to-br from-lime-100 via-emerald-100/90 to-lime-200/90 border-lime-300/80 text-lime-800',
    hover: 'group-hover:from-lime-600 group-hover:via-emerald-600 group-hover:to-green-600 group-hover:text-white group-hover:border-lime-400 group-hover:shadow-xl group-hover:shadow-lime-600/35',
    labelHover: 'group-hover:text-lime-800',
    iconAnim: 'icon-gift-bounce',
  },
  {
    name: 'Wind Chimes',
    icon: Wind,
    link: '/category/terracotta-clay?subcat=wind-chimes',
    trending: 'Melodic',
    badgeColor: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-teal-500/30',
    bg: 'bg-gradient-to-br from-teal-100 via-cyan-100/90 to-sky-200/90 border-teal-300/80 text-teal-800',
    hover: 'group-hover:from-teal-500 group-hover:via-cyan-600 group-hover:to-sky-600 group-hover:text-white group-hover:border-teal-400 group-hover:shadow-xl group-hover:shadow-teal-500/35',
    labelHover: 'group-hover:text-teal-800',
    iconAnim: 'icon-bell-chime',
  },
  {
    name: 'Folk Sarees',
    icon: Layers,
    link: '/category/embroidered-clothes?subcat=sarees',
    trending: 'Silk',
    badgeColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30',
    bg: 'bg-gradient-to-br from-indigo-100 via-purple-100/90 to-pink-200/90 border-indigo-300/80 text-indigo-800',
    hover: 'group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-rose-600 group-hover:text-white group-hover:border-indigo-400 group-hover:shadow-xl group-hover:shadow-indigo-500/35',
    labelHover: 'group-hover:text-indigo-800',
    iconAnim: 'icon-needle-tilt',
  },
  {
    name: 'Brass Idols',
    icon: Bell,
    link: '/category/other-handicrafts?subcat=brass-idols',
    trending: 'Temple',
    badgeColor: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-amber-600/30',
    bg: 'bg-gradient-to-br from-amber-100 via-yellow-100/90 to-stone-200/90 border-amber-300/80 text-amber-900',
    hover: 'group-hover:from-amber-600 group-hover:via-yellow-500 group-hover:to-orange-600 group-hover:text-white group-hover:border-amber-400 group-hover:shadow-xl group-hover:shadow-amber-600/35',
    labelHover: 'group-hover:text-amber-900',
    iconAnim: 'icon-bell-chime',
  },
];

export const QuickCategories: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = Math.max(300, scrollRef.current.clientWidth * 0.6);
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative z-20 my-3 sm:my-5 py-5 sm:py-7 border-y border-rose-200/60 bg-gradient-to-b from-white/95 via-rose-50/25 to-amber-50/20 backdrop-blur-md shadow-xs transition-colors w-full max-w-full min-w-0 overflow-hidden">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 relative group/strip">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/95 border border-pink-200/90 text-gray-700 hover:text-pink-600 hover:scale-110 shadow-md backdrop-blur-sm items-center justify-center transition-all cursor-pointer opacity-85 hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/95 border border-pink-200/90 text-gray-700 hover:text-pink-600 hover:scale-110 shadow-md backdrop-blur-sm items-center justify-center transition-all cursor-pointer opacity-85 hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable Track - Fills Screen Width */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto pt-4 pb-2.5 sm:pt-5 sm:pb-3 scrollbar-none w-full max-w-full overscroll-x-contain scroll-smooth justify-start 2xl:justify-between"
        >
          {QUICK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.link}
                className="relative flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[88px] lg:min-w-[94px] group flex-shrink-0 cursor-pointer pt-3 pb-1"
              >
                {/* Trending Mini Badge with Gradient Glow */}
                {item.trending && (
                  <span
                    className={`absolute top-0 px-2 py-0.5 rounded-full ${item.badgeColor} text-[8.5px] sm:text-[9px] font-bold tracking-wider uppercase shadow-xs z-20 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 select-none`}
                  >
                    {item.trending}
                  </span>
                )}

                {/* Animated Colorful Icon Bubble */}
                <div
                  className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.bg} ${item.hover} border backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xs group-hover:scale-110 group-hover:-translate-y-1.5 overflow-hidden`}
                >
                  {/* Subtle Shimmer Sweeper on Hover */}
                  <div className="category-sheen-sweep" />

                  {/* Icon with Custom Micro-Animation */}
                  <Icon
                    className={`relative z-10 h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 ${item.iconAnim}`}
                  />
                </div>

                {/* Label with Smooth Color Transition */}
                <span
                  className={`text-[11.5px] sm:text-xs font-semibold text-gray-800 ${item.labelHover} transition-colors duration-200 text-center line-clamp-1 group-hover:font-bold tracking-tight select-none`}
                >
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

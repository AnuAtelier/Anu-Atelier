import React from 'react';
import { Sparkles, ShieldCheck, Heart, Truck, Award, Leaf, Gift, Star } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Sparkles,
    label: '100% Authentic Indian Craftsmanship',
    badge: 'Heritage',
  },
  {
    icon: Truck,
    label: 'Free Express Shipping Above ₹499',
    badge: 'Pan-India',
  },
  {
    icon: Heart,
    label: 'Empowering 500+ Rural Women Artisans',
    badge: 'Direct Impact',
  },
  {
    icon: Leaf,
    label: '100% Eco-Friendly Clay & Organic Khadi',
    badge: 'Earth Kind',
  },
  {
    icon: Award,
    label: 'Guaranteed Pure Hand-Moulded Terracotta',
    badge: 'No Machines',
  },
  {
    icon: ShieldCheck,
    label: 'Damage-Free Safe Transit Guarantee',
    badge: '100% Secure',
  },
  {
    icon: Star,
    label: '4.9/5 Rating from 12,000+ Happy Customers',
    badge: 'Top Rated',
  },
  {
    icon: Gift,
    label: 'Complimentary Festive Gift Wrapping Available',
    badge: 'Special',
  },
];

export const TrustMarquee: React.FC = () => {
  return (
    <div
      aria-label="Trust highlights ticker"
      className="relative w-full overflow-hidden py-3 bg-gradient-to-r from-rose-100/70 via-pink-50/90 to-amber-50/70 border-y border-pink-200/50 backdrop-blur-md select-none group"
    >
      {/* Soft gradient edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />

      {/* 60fps GPU Marquee track - 2 identical sets for seamless continuous loop */}
      <div className="marquee-track flex items-center gap-8 sm:gap-12">
        {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/75 border border-pink-200/50 shadow-xs text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap transition-transform duration-200 hover:scale-105"
            >
              <span className="p-1 rounded-full bg-rose-500/10 text-[var(--primary)] flex items-center justify-center">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span>{item.label}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                {item.badge}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

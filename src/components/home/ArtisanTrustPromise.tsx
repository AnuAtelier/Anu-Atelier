import React from 'react';
import { Award, Leaf, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

const PROMISES = [
  {
    icon: Award,
    title: 'Heritage Craftsmanship',
    description: 'Each piece is hand-moulded and embroidered by skilled rural artisans using centuries-old techniques.',
    badge: '100% Authentic',
    gradient: 'from-amber-500/10 via-orange-500/10 to-amber-500/5',
    border: 'border-amber-300/60',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    delay: '0ms',
  },
  {
    icon: Leaf,
    title: '100% Earth-Kind & Natural',
    description: 'Zero harmful plastics. We use pure river clay, natural plant dyes, and organic khadi cotton.',
    badge: 'Eco-Friendly',
    gradient: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/5',
    border: 'border-emerald-300/60',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    delay: '100ms',
  },
  {
    icon: ShieldCheck,
    title: 'Breakage-Free Transit',
    description: 'Heavy honeycomb cushioned eco-packaging. If anything arrives chipped, get instant free replacement.',
    badge: 'Peace of Mind',
    gradient: 'from-sky-500/10 via-blue-500/10 to-sky-500/5',
    border: 'border-sky-300/60',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-100',
    delay: '200ms',
  },
  {
    icon: HeartHandshake,
    title: 'Fair Living Wages',
    description: 'Your purchase directly empowers 500+ rural craftswomen and keeps ancient Indian artisan heritage alive.',
    badge: 'Direct Impact',
    gradient: 'from-rose-500/10 via-pink-500/10 to-rose-500/5',
    border: 'border-rose-300/60',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
    delay: '300ms',
  },
];

export const ArtisanTrustPromise: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-300/50 text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-2.5">
          <Sparkles className="h-3 w-3 animate-sparkle-spin" />
          <span>The Anu Atelier Promise</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
          Why Discerning Shoppers Choose Us
        </h2>
        <p className="text-sm sm:text-base text-gray-700 mt-2 font-normal">
          We bring you authentic Indian handmade treasures without middlemen, plastic waste, or transit worries.
        </p>
      </div>

      {/* Grid of 4 Trust Cards with GPU-accelerated hover lift & subtle shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PROMISES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`card-interactive shimmer-container relative rounded-3xl p-6 bg-gradient-to-br ${item.gradient} ${item.border} border bg-white/70 backdrop-blur-md shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/90 border border-gray-200/80 text-gray-700 shadow-xs">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-200/40 flex items-center gap-1.5 text-xs font-semibold text-gray-700 group-hover:text-[var(--primary)] transition-colors">
                <span>Verified Quality</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

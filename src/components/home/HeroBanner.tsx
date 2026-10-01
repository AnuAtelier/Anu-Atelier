import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Leaf, Truck, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  image: string;
  tag: string;
  title: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    image: '/img/hero-crafts-flatlay.jpg',
    tag: 'Artisan Heritage Flatlay',
    title: 'Terracotta Pottery, Linen & Brass Diyas',
    alt: 'Handcrafted terracotta bowls, embroidered linen textiles, brass spoons, and painted diyas',
  },
  {
    image: '/img/hero-blue-pottery-shop.jpg',
    tag: 'Jaipur Blue Pottery',
    title: 'Intricate Cobalt Ceramic Plates & Bowls',
    alt: 'Shelves of authentic handcrafted blue pottery plates and ceramic wares',
  },
  {
    image: '/img/hero-terracotta-studio.jpg',
    tag: 'Festive Illuminations',
    title: 'Hand-carved Earthen Diyas & Pottery',
    alt: 'Artisanal pottery studio illuminated with handcrafted terracotta diyas and vases',
  },
  {
    image: '/img/hero-folk-boutique.jpg',
    tag: 'Heritage Craft Boutique',
    title: 'Folk Handicrafts, Brass Lamps & Tapestries',
    alt: 'Traditional Indian handicraft boutique with handwoven tapestries and brass decor',
  },
  {
    image: '/img/hero-colorful-ceramic.jpg',
    tag: 'Hand-painted Ceramics',
    title: 'Vibrant Floral Glazes & Embossed Artistry',
    alt: 'Vibrant hand-painted Indian embossed floral ceramic vase with rich colors',
  },
  {
    image: '/img/hero-kathputli-puppets.jpg',
    tag: 'Rajasthani Folk Art',
    title: 'Colorful Kathputli Puppets & Jewelry',
    alt: 'Traditional handmade Rajasthani puppets and ethnic craft jewelry',
  },
  {
    image: '/img/hero-terracotta-collection.jpg',
    tag: 'Earthen Terracotta',
    title: 'Traditional Rustic Earthenware & Diyas',
    alt: 'Collection of authentic earthen terracotta pots, kulhads, and festival diyas',
  },
  {
    image: '/img/hero-artisan-painting.jpg',
    tag: 'Artisan Studio',
    title: 'Hand-painted Terracotta Floral Art',
    alt: 'Indian craftswoman hand-painting delicate floral patterns on a terracotta vase',
  },
  {
    image: '/img/hero-terracotta-ganesha-crafts.jpg',
    tag: 'Handcrafted Terracotta Art',
    title: 'Clay Ganesha, Carved Diyas & Painted Vessels',
    alt: 'Handcrafted terracotta Ganesha idol, engraved clay pots, festive oil lamps, and miniature elephants on an artisan workshop table',
  },
  {
    image: '/img/hero-mandala-wall-art.jpg',
    tag: 'Handcrafted Wooden Wall Art',
    title: 'Intricate Layered Mandala & Botanical Decor',
    alt: 'Vibrant handcrafted multi-layered wooden mandala wall decor in a beautifully styled artisan home interior',
  },
  {
    image: '/img/hero-embroidered-handkerchief.jpg',
    tag: 'Hand-Embroidered Linens',
    title: 'Delicate Ribbon Rose & Lace Handkerchief',
    alt: 'Hand-embroidered white linen handkerchief with intricate ribbon roses, pearl beads, and scallop lace borders',
  },
  {
    image: '/img/hero-embroidered-ethnic-clothing.jpg',
    tag: 'Artisan Ethnic Apparel',
    title: 'Hand-Embroidered Kurta & Floral Scallop Dupatta',
    alt: 'Traditional Indian hand-embroidered white kurta and dupatta suit with intricate multi-color floral needlework and scalloped lace',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Preload all slides so transitions never hitch or wait for image decode
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  const goToSlide = useCallback((nextIndex: number) => {
    setCurrentSlide((curr) => {
      if (curr === nextIndex) return curr;
      setPrevSlideIndex(curr);
      return nextIndex;
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((curr) => {
      setPrevSlideIndex(curr);
      return (curr + 1) % HERO_SLIDES.length;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((curr) => {
      setPrevSlideIndex(curr);
      return (curr - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    });
  }, []);

  // 3-second auto-transition
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section className="relative overflow-hidden py-10 md:py-20 transition-colors w-full max-w-full min-w-0">
      {/* Keyframe for ultra-smooth bottom caption entry */}
      <style>{`
        @keyframes heroTextSmoothIn {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

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

      {/* Full-width Authentic Indian Crafts Ambience Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-15 mix-blend-multiply"
        style={{ backgroundImage: `url('/img/hero-terracotta-studio.jpg')` }}
      />
      {/* Soft gradient wash so background image is subtle and text has 100% perfect contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-50/95 via-rose-50/90 to-purple-50/80 backdrop-blur-xs pointer-events-none" />

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

        {/* Right Hero Image Card with Animated Slideshow */}
        <div className="relative mx-auto max-w-md lg:max-w-none w-full flex items-center justify-center">
          {/* Main Artisan Image Card with Ken-Burns and Crossfade */}
          <div
            className="group relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg-soft border border-stone-200/80 bg-stone-100 card-interactive select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >

            {/* Sliding Realistic Images with Silky Seamless Crossfade */}
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlide;
              const isPrev = idx === prevSlideIndex && !isActive;

              return (
                <div
                  key={slide.image}
                  className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity] ${isActive
                    ? 'opacity-100 z-20 pointer-events-auto'
                    : isPrev
                      ? 'opacity-100 z-10 pointer-events-none'
                      : 'opacity-0 z-0 pointer-events-none'
                    }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    loading="eager"
                    decoding="async"
                    className={`w-full h-full object-cover object-center transform-gpu transition-transform duration-3000 ease-out will-change-transform ${isActive ? 'scale-100' : 'scale-105'
                      }`}
                  />
                </div>
              );
            })}

            {/* Previous & Next Controls on Card Hover */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                prevSlide();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md border border-white/20 active:scale-95"
              aria-label="Previous craft photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                nextSlide();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md border border-white/20 active:scale-95"
              aria-label="Next craft photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Compact, Unobtrusive Bottom Vignette */}
            <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 via-black/35 to-transparent pt-8 pb-3.5 px-4 sm:px-5 flex items-end justify-between gap-3 pointer-events-none">
              <div
                key={currentSlide}
                className="min-w-0 pr-2"
                style={{
                  animation: 'heroTextSmoothIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-200/90 drop-shadow-xs block leading-tight">
                  {HERO_SLIDES[currentSlide].tag}
                </span>
                <p className="font-heading text-xs sm:text-sm font-semibold text-white drop-shadow-xs truncate">
                  {HERO_SLIDES[currentSlide].title}
                </p>
              </div>

              {/* Minimal Dot Indicators + Slide Numbers */}
              <div className="flex items-center gap-1.5 pb-0.5 pointer-events-auto shrink-0">
                <span className="text-[10px] font-semibold text-white/80 mr-1 select-none font-mono">
                  {String(currentSlide + 1).padStart(2, '0')}/{String(HERO_SLIDES.length).padStart(2, '0')}
                </span>
                <div className="hidden xs:flex items-center gap-1">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        goToSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-500 ease-out cursor-pointer ${idx === currentSlide
                        ? 'w-4 bg-white shadow-xs'
                        : 'w-1.5 bg-white/40 hover:bg-white/75'
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badge: Top-Right Eco Seal */}
          <div
            className="animate-float-slow absolute -top-4 -right-2 sm:-right-4 z-20 hidden xs:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-300/70 shadow-md text-gray-900"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Leaf className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold leading-tight text-emerald-800">100% Eco-Friendly</span>
              <span className="block text-[9px] text-gray-500 font-medium">Pure Clay & Natural Threads</span>
            </div>
          </div>

          {/* Floating Badge: Top-Left Live Studio Indicator */}
          <div
            className="animate-float-gentle absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold shadow-md border border-white/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-medium tracking-wide text-rose-50">
              Handmade in India
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};


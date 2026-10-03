import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Play,
  Heart,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';
import { useReelStore } from '../../store/useReelStore';

export const ArtisanStorySection: React.FC = () => {
  const { reels, openReel, toggleLike, likedReelIds, openAddModal } = useReelStore();
  const [filterType, setFilterType] = useState<'all' | 'artisan' | 'customer'>('all');

  const artisanReels = reels.filter((r) => r.type === 'artisan');
  const customerReels = reels.filter((r) => r.type === 'customer');
  const displayReels = filterType === 'all' ? reels : reels.filter((r) => r.type === filterType);

  const bubblesRef = useRef<HTMLDivElement>(null);
  const reelsTrackRef = useRef<HTMLDivElement>(null);

  const scrollBubbles = (direction: 'left' | 'right') => {
    if (bubblesRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      bubblesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollReels = (direction: 'left' | 'right') => {
    if (reelsTrackRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      reelsTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="artisan-story"
      className="relative py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full scroll-mt-24 transition-colors"
    >
      {/* Decorative Ambient Background Auroras */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP INSTAGRAM-STYLE STORY BUBBLES ROW WITH LEFT/RIGHT NAVIGATION */}
      <div className="relative mb-8 p-3 sm:p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-pink-200/70 shadow-xs group/bubbles">
        {/* Left Arrow Button for Story Bubbles */}
        <button
          type="button"
          onClick={() => scrollBubbles('left')}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-stone-800 hover:text-pink-600 border border-pink-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
          aria-label="Previous Stories"
          title="Previous Stories (Left Button)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Story Bubbles Scroll Track */}
        <div
          ref={bubblesRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto px-7 sm:px-8 pb-1 scrollbar-none scroll-smooth"
        >
          {/* Owner "Add Story / Reel" Circle Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
            title="Owner: Add New Artisan Reel / Story"
          >
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-pink-400 hover:border-pink-600 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
              <PlusCircle className="h-7 w-7 text-pink-600 transition-transform group-hover:rotate-90" />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                +
              </span>
            </div>
            <span className="text-[11px] font-bold text-pink-700 max-w-[70px] truncate text-center">
              Add Reel
            </span>
          </button>

          {/* All Story Bubbles */}
          {reels.map((reel) => {
            return (
              <button
                key={reel.id}
                type="button"
                onClick={() => openReel(reel.id)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
              >
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 story-ring-active story-bubble-pulse transition-transform group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-stone-100">
                    <img
                      src={reel.authorAvatar}
                      alt={reel.authorName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  {/* Video Reel Tag */}
                  <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-black uppercase tracking-tighter border border-white shadow-2xs flex items-center gap-0.5">
                    <Film className="h-2 w-2" />
                    Reel
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-gray-800 max-w-[72px] truncate text-center group-hover:text-pink-600 transition-colors">
                  {reel.authorName.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button for Story Bubbles */}
        <button
          type="button"
          onClick={() => scrollBubbles('right')}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-stone-800 hover:text-pink-600 border border-pink-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
          aria-label="Next Stories"
          title="Next Stories (Right Button)"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* SECTION HEADER WITH CATEGORY TABS & LEFT/RIGHT CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-purple-500/15 border border-pink-200/80 text-[var(--primary)] text-xs font-bold tracking-wider uppercase shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-pink-600 animate-pulse" />
            <span>100% Video Demonstrations • Generational Indian Craft</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-main)] tracking-tight">
            Artisan Stories & Video Reels 🌸
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Watch real, soothing HD craft videos straight from artisan workshops across India. See wet clay turning on the potter’s wheel, delicate Chikankari needlework, and custom hand-painted murals.
          </p>

          {/* Reel Category Filter Pills */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🎥 All Video Reels ({reels.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('artisan')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === 'artisan'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🏺 Artisan Crafting ({artisanReels.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('customer')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === 'customer'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🏡 Customer Stories ({customerReels.length})
            </button>
          </div>
        </div>

        {/* Action Buttons: Left/Right Reel Navigation + Owner Add Story */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Left / Right Carousel Jump Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/90 border border-pink-200 shadow-xs">
            <button
              type="button"
              onClick={() => scrollReels('left')}
              className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-stone-800 hover:text-pink-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="Previous story reel"
              title="Previous Story (Left Button)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-bold text-pink-700 px-1 select-none">
              Reels
            </span>
            <button
              type="button"
              onClick={() => scrollReels('right')}
              className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-stone-800 hover:text-pink-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="Next story reel"
              title="Next Story (Right Button)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Owner Add Story Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="whitespace-nowrap">Add Reel</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL OF REEL CARDS WITH LEFT/RIGHT SCROLL CONTROLS */}
      <div className="relative group/reels">
        {/* Floating Left Button on Track */}
        <button
          type="button"
          onClick={() => scrollReels('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 text-stone-900 hover:text-rose-600 border border-pink-200/80 shadow-xl items-center justify-center transition-all hover:scale-115 active:scale-90 cursor-pointer opacity-0 group-hover/reels:opacity-100"
          aria-label="Previous Story"
          title="Previous Story (Left Button)"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Reels Track */}
        <div
          ref={reelsTrackRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth scrollbar-none snap-x snap-mandatory"
        >
          {displayReels.map((reel) => {
            const isLiked = likedReelIds.includes(reel.id);

            return (
              <div
                key={reel.id}
                onClick={() => openReel(reel.id)}
                className="relative w-[230px] xs:w-[250px] sm:w-[280px] lg:w-[300px] aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer group reel-card-shadow border border-white/25 sm:border-pink-200/60 bg-stone-900 select-none flex flex-col justify-between p-3.5 sm:p-4 transition-all duration-300 flex-shrink-0 snap-start hover:-translate-y-1.5 shadow-lg"
              >
                {/* Background Media: Autoplay Looping Craft Video */}
                <div className="absolute inset-0 z-0 bg-stone-950 overflow-hidden">
                  <video
                    src={reel.mediaUrl}
                    poster={reel.authorAvatar}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  {/* Subtle, soft luminous vignette: Video is prominently visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
                </div>

                {/* TOP ROW: Video Badge + Soundwave/Play Indicator */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/25 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-live-dot" />
                    {reel.badge || 'Video Reel'}
                  </span>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/25 flex items-center justify-center text-white group-hover:bg-rose-500 transition-colors shadow-md">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* CENTER: Floating Play Pulse Effect on Hover */}
                <div className="relative z-10 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white backdrop-blur-md flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-105 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* BOTTOM: Minimal, Clean Creator / Customer ID Badge */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Creator / Customer Information */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-8 h-8 rounded-full p-0.5 story-ring-active flex-shrink-0 shadow-md">
                        <img
                          src={reel.authorAvatar}
                          alt={reel.authorName}
                          className="w-full h-full rounded-full object-cover border border-white"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="font-heading font-bold text-xs sm:text-sm text-white truncate drop-shadow-md"
                            style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}
                          >
                            {reel.authorName}
                          </p>
                          {reel.type === 'artisan' ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/90 text-[8px] font-bold uppercase tracking-wider text-white shadow-2xs flex-shrink-0">
                              Artisan
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-[8px] font-bold uppercase tracking-wider text-white shadow-2xs flex-shrink-0">
                              Verified
                            </span>
                          )}
                        </div>
                        {/* Customer / Artisan ID */}
                        <p
                          className="text-[10px] text-pink-200/95 font-medium tracking-wide truncate drop-shadow-xs"
                          style={{ color: '#fbcfe8' }}
                        >
                          {reel.type === 'customer'
                            ? `Customer ID: #CUST-${reel.id.slice(-4).toUpperCase()}`
                            : `Artisan ID: #ART-${reel.id.slice(-4).toUpperCase()}`}
                          {reel.location ? ` • ${reel.location.split(',')[0]}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Compact Like Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(reel.id);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0 shadow-xs"
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          isLiked ? 'text-rose-500 fill-current animate-heartbeat' : 'text-white'
                        }`}
                      />
                      <span>{reel.likesCount >= 1000 ? `${(reel.likesCount / 1000).toFixed(1)}k` : reel.likesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Right Button on Track */}
        <button
          type="button"
          onClick={() => scrollReels('right')}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 text-stone-900 hover:text-rose-600 border border-pink-200/80 shadow-xl items-center justify-center transition-all hover:scale-115 active:scale-90 cursor-pointer opacity-0 group-hover/reels:opacity-100"
          aria-label="Next Story"
          title="Next Story (Right Button)"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

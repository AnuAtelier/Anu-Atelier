import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MapPin,
  Sparkles,
  Star,
  CheckCircle,
  Music,
} from 'lucide-react';
import { useReelStore } from '../../store/useReelStore';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';

export const ReelStoryViewerModal: React.FC = () => {
  const {
    isViewerOpen,
    closeReel,
    nextReel,
    prevReel,
    getActiveReel,
    toggleLike,
    likedReelIds,
    reels,
    openReel,
    isMuted,
    toggleMute,
    setIsMuted,
  } = useReelStore();
  const { addToCart } = useCartStore();
  const { getProductBySlugOrId } = useProductStore();
  const navigate = useNavigate();

  const activeReel = getActiveReel();
  const isLiked = activeReel ? likedReelIds.includes(activeReel.id) : false;

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const durationMs = 12000; // 12 seconds per reel story to enjoy music & visuals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentIndex = activeReel ? reels.findIndex((r) => r.id === activeReel.id) : 0;

  // Reset progress and handle video & music play on active reel change
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true; // Permanently muted visual background (Zero voice/vocal)
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current && activeReel?.musicTrack?.audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.65;
      audioRef.current.muted = isMuted;
      if (!isMuted && isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [activeReel?.id, isMuted]);

  // Sync play/pause with video and audio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Video is strictly muted visual only
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
    if (audioRef.current) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  // Sync mute state for instrumental audio soundtrack
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Always muted so zero vocal/voice from video
    }
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted && isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, isPlaying]);

  // Auto-progress bar timer
  useEffect(() => {
    if (!isViewerOpen || !isPlaying || !activeReel) return;

    const stepMs = 50;
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (stepMs / durationMs) * 100;
        if (next >= 100) {
          setTimeout(() => nextReel(), 0);
          return 0;
        }
        return next;
      });
    }, stepMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isViewerOpen, isPlaying, activeReel, nextReel, durationMs]);

  // Lock body scroll while open
  useEffect(() => {
    if (isViewerOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [isViewerOpen]);

  // Keyboard navigation (Left, Right, Escape, Spacebar, Mute)
  useEffect(() => {
    if (!isViewerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextReel();
      if (e.key === 'ArrowLeft') prevReel();
      if (e.key === 'Escape') closeReel();
      if (e.key === 'm' || e.key === 'M') toggleMute();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, nextReel, prevReel, closeReel]);

  const toggleSound = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 0.65;
      audioRef.current.play().catch(() => {});
    }
    if (videoRef.current) {
      videoRef.current.muted = true; // Video background is permanently muted - zero vocal/voice
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeReel) return;
    toggleLike(activeReel.id);
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeReel) return;
    const shareUrl = `${window.location.origin}/#artisan-story`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeReel.title,
          text: `Watch ${activeReel.title} on Anu Atelier!`,
          url: shareUrl,
        });
      } catch {
        // Ignored if user dismissed native share
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleShopNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeReel?.craftTag) return;
    const { productId, productSlug } = activeReel.craftTag;
    const fullProduct = getProductBySlugOrId(productId || productSlug || '');

    if (fullProduct) {
      addToCart(fullProduct);
    }
    closeReel();
    if (productSlug) {
      navigate(`/product/${productSlug}`);
    } else {
      navigate('/catalog');
    }
  };

  if (!isViewerOpen || !activeReel || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center select-none animate-fade-in"
      onClick={closeReel}
    >
      {/* Background Indian Music Audio Element */}
      {activeReel.musicTrack?.audioUrl && (
        <audio
          ref={audioRef}
          src={activeReel.musicTrack.audioUrl}
          loop
          preload="auto"
          autoPlay={!isMuted}
          muted={isMuted}
        />
      )}

      {/* Container: Instagram 9:16 Aspect Ratio on desktop, full screen on mobile */}
      <div
        className="relative w-full sm:max-w-[420px] h-full sm:h-[88vh] sm:max-h-[820px] bg-stone-900 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border sm:border-stone-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Visual: Video Reel */}
        <div className="absolute inset-0 z-0 bg-stone-950 overflow-hidden">
          {activeReel.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={activeReel.mediaUrl}
              poster={activeReel.authorAvatar}
              autoPlay
              loop
              muted={true}
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeReel.mediaUrl}
              alt={activeReel.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          )}

          {/* Vignette Gradients: Soft & Subtle so Video Remains the Center of Attention */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Tap Hotspots: Left to Prev, Right to Next, Center to Play/Pause */}
        <div className="absolute inset-0 z-10 grid grid-cols-5 pointer-events-auto">
          <div
            className="col-span-1 h-full cursor-pointer"
            onClick={prevReel}
            title="Previous Story (Left Button)"
          />
          <div
            className="col-span-3 h-full cursor-pointer"
            onClick={() => setIsPlaying((p) => !p)}
            title="Tap to Play / Pause"
          />
          <div
            className="col-span-1 h-full cursor-pointer"
            onClick={nextReel}
            title="Next Story (Right Button)"
          />
        </div>

        {/* IN-FRAME LEFT & RIGHT STORY JUMP BUTTONS (Vertically centered at top-1/2, separated from Like button) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevReel();
          }}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-rose-600 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer group"
          aria-label="Previous Story"
          title="Previous Story (Left Button)"
        >
          <ChevronLeft className="h-4.5 w-4.5 -ml-0.5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextReel();
          }}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-rose-600 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer group"
          aria-label="Next Story"
          title="Next Story (Right Button)"
        >
          <ChevronRight className="h-4.5 w-4.5 -mr-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* TOP BAR: Segmented Story Progress Bars + Author Header + Actions */}
        <div className="relative z-20 p-3.5 sm:p-4 space-y-2 pointer-events-auto">
          {/* Segmented Story Progress Bars */}
          <div className="flex items-center gap-1 w-full">
            {reels.map((r, i) => {
              const isPast = currentIndex > i;
              const isCurrent = currentIndex === i;
              return (
                <div
                  key={r.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openReel(r.id);
                  }}
                  className="h-1 flex-1 bg-white/25 hover:bg-white/45 rounded-full overflow-hidden cursor-pointer transition-colors"
                  title={`Jump to Story ${i + 1}: ${r.title}`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 rounded-full transition-all duration-75"
                    style={{
                      width: isPast ? '100%' : isCurrent ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between text-white pt-1">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="relative w-9 h-9 rounded-full p-0.5 story-ring-active flex-shrink-0 shadow-md">
                <img
                  src={activeReel.authorAvatar}
                  alt={activeReel.authorName}
                  className="w-full h-full rounded-full object-cover border border-white"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4
                    className="font-heading font-bold text-sm text-white truncate max-w-[130px] sm:max-w-[170px] drop-shadow-sm"
                    style={{ color: '#ffffff' }}
                  >
                    {activeReel.authorName}
                  </h4>
                  {activeReel.type === 'artisan' ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/90 text-[8px] font-bold uppercase tracking-wider text-white shrink-0">
                      Artisan
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-[8px] font-bold text-white shrink-0">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Clean, Non-wrapping Meta Row */}
                <div className="flex items-center gap-1.5 text-[10px] text-stone-200 whitespace-nowrap overflow-hidden pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-black/45 text-pink-300 font-bold text-[9px] border border-white/10 shrink-0">
                    {activeReel.type === 'customer' ? 'Customer' : 'Artisan'} ID #{currentIndex + 1}
                  </span>
                  <span className="text-pink-200/90 font-semibold shrink-0">
                    • Story {currentIndex + 1} of {reels.length}
                  </span>
                  {activeReel.location && (
                    <span className="text-stone-300/80 truncate text-[9px] hidden sm:inline">
                      • {activeReel.location.split(',')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Controls with Integrated Sound State */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                className={`h-8 rounded-full text-white flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
                  isMuted
                    ? 'px-2 bg-pink-600/80 hover:bg-pink-600 border-pink-400 gap-1 shadow-md'
                    : 'w-8 bg-black/40 hover:bg-black/60 border-white/20'
                }`}
                title={isMuted ? 'Click to Play Music' : 'Mute Music'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-[9px] font-bold text-white whitespace-nowrap hidden sm:inline">Music</span>
                  </>
                ) : (
                  <Volume2 className="h-4 w-4 text-pink-300" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={closeReel}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FLOATING HEART BURST ANIMATION ON DOUBLE-TAP / LIKE */}
        {showHeartBurst && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <Heart className="h-24 w-24 text-rose-500 fill-current animate-heart-burst drop-shadow-2xl" />
          </div>
        )}

        {/* FLOATING ACTION BUTTONS: Like & Share pinned to bottom-right rail (safely above the bottom caption overlay) */}
        <div className="absolute right-2.5 sm:right-3.5 bottom-36 sm:bottom-40 z-25 flex flex-col items-center gap-2.5 pointer-events-auto">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            className="flex flex-col items-center gap-0.5 group cursor-pointer"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 active:scale-90 shadow-lg ${
                isLiked
                  ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/40 scale-105'
                  : 'bg-black/50 hover:bg-black/70 text-white border-white/25'
              }`}
            >
              <Heart className={`h-4.5 w-4.5 ${isLiked ? 'fill-current animate-heartbeat' : ''}`} />
            </div>
            <span
              className="text-white text-[11px] font-bold tracking-tight drop-shadow-md select-none"
              style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
            >
              {activeReel.likesCount.toLocaleString()}
            </span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex flex-col items-center gap-0.5 group cursor-pointer"
            title="Share Reel"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/25 active:scale-90 transition-all shadow-lg">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <span
              className="text-white text-[10px] font-medium tracking-tight drop-shadow-md select-none"
              style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
            >
              {copiedShare ? 'Copied!' : 'Share'}
            </span>
          </button>
        </div>

        {/* BOTTOM SECTION: Anchored completely to the bottom so the video is prominently visible */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-3.5 pb-3 sm:pb-3.5 pr-16 sm:pr-20 space-y-1.5 pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {/* Customer Review Quote or Caption */}
          {activeReel.customerReview && (
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold max-w-[75%]">
              {[...Array(activeReel.customerReview.rating)].map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-current" />
              ))}
              <span className="text-white/80 text-[10px] font-normal ml-1 truncate">
                Verified Customer Feedback
              </span>
            </div>
          )}

          {/* REEL TITLE & CAPTION (Constrained to max-w-[75%] with pr-16 so it NEVER touches the Like rail) */}
          <div className="space-y-0.5 max-w-[75%]">
            <h3
              className="font-heading font-bold text-sm sm:text-base text-white leading-snug drop-shadow-md line-clamp-2"
              style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.95)' }}
            >
              {activeReel.title}
            </h3>
            <p
              className="text-[11px] sm:text-xs text-stone-200 line-clamp-1 leading-snug drop-shadow-sm"
              style={{ color: '#e7e5e4', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}
            >
              {activeReel.caption}
            </p>
          </div>

          {/* SLEEK & COMPACT MUSIC CHIP */}
          <div className="max-w-[75%]">
            {activeReel.musicTrack && (
              <div
                onClick={toggleSound}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white text-[10px] cursor-pointer transition-all hover:border-pink-400/60 max-w-full group/music"
                title={isMuted ? 'Click to play song' : 'Click to mute song'}
              >
                {/* Rotating Vinyl Record */}
                <div
                  className={`relative w-3.5 h-3.5 rounded-full bg-stone-900 border border-white/30 flex items-center justify-center flex-shrink-0 ${
                    !isMuted && isPlaying ? 'animate-spin-slow' : ''
                  }`}
                >
                  <div className="w-1 h-1 rounded-full bg-pink-500" />
                  <Music className="absolute -top-0.5 -right-0.5 h-2 w-2 text-pink-300" />
                </div>

                <span
                  className="font-medium text-white/90 truncate text-[10px] max-w-[130px] sm:max-w-[170px]"
                  style={{ color: '#ffffff' }}
                >
                  {activeReel.musicTrack.title}
                </span>

                {/* Sound status indicator */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                  {!isMuted && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-2">
                      <span className="w-0.5 h-2 bg-pink-400 rounded-full eq-bar-1" />
                      <span className="w-0.5 h-1.5 bg-rose-400 rounded-full eq-bar-2" />
                      <span className="w-0.5 h-2 bg-amber-300 rounded-full eq-bar-3" />
                    </div>
                  ) : (
                    <span
                      className="text-[9px] text-amber-300/90 font-medium flex items-center gap-0.5"
                      style={{ color: '#fcd34d' }}
                    >
                      <VolumeX className="h-2.5 w-2.5" />
                      <span>Unmute</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SLIM CRAFT TAG CARD */}
          {activeReel.craftTag && (
            <div
              onClick={handleShopNow}
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-black/75 backdrop-blur-lg border border-white/20 transition-all flex items-center justify-between gap-2 shadow-md cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={activeReel.craftTag.productImage}
                  alt={activeReel.craftTag.productName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-white/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p
                    className="font-sans font-bold text-xs text-white truncate group-hover:text-pink-200 transition-colors drop-shadow-xs"
                    style={{ color: '#ffffff' }}
                  >
                    {activeReel.craftTag.productName}
                  </p>
                  <span
                    className="text-[11px] font-bold drop-shadow-xs"
                    style={{ color: '#34d399' }}
                  >
                    ₹{activeReel.craftTag.productPrice}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShopNow}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs flex-shrink-0 transition-transform group-hover:scale-105 cursor-pointer"
                style={{ color: '#ffffff' }}
              >
                <ShoppingBag className="h-3 w-3 text-white" />
                <span className="font-semibold text-white" style={{ color: '#ffffff' }}>Shop</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Outer Floating Prev / Next Navigation Arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevReel();
        }}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 hover:bg-rose-600 text-white backdrop-blur-md border border-white/30 items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl cursor-pointer group"
        aria-label="Previous story"
        title="Previous Story (Left Button / Arrow)"
      >
        <ChevronLeft className="h-8 w-8 -ml-0.5 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextReel();
        }}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 hover:bg-rose-600 text-white backdrop-blur-md border border-white/30 items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl cursor-pointer group"
        aria-label="Next story"
        title="Next Story (Right Button / Arrow)"
      >
        <ChevronRight className="h-8 w-8 -mr-0.5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>,
    document.body
  );
};

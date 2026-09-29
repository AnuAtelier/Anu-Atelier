import React, { useEffect, useState } from 'react';

// Drifting golden stardust particles with randomized trajectories
const STARDUST_PARTICLES = [
  { id: 1, left: '8%', size: 'w-2 h-2', duration: '18s', delay: '0s', sway: '18px' },
  { id: 2, left: '18%', size: 'w-1.5 h-1.5', duration: '22s', delay: '-4s', sway: '-24px' },
  { id: 3, left: '28%', size: 'w-2.5 h-2.5', duration: '20s', delay: '-8s', sway: '20px' },
  { id: 4, left: '42%', size: 'w-1 h-1', duration: '25s', delay: '-2s', sway: '-16px' },
  { id: 5, left: '55%', size: 'w-2 h-2', duration: '19s', delay: '-11s', sway: '22px' },
  { id: 6, left: '68%', size: 'w-3 h-3', duration: '24s', delay: '-6s', sway: '-28px' },
  { id: 7, left: '79%', size: 'w-1.5 h-1.5', duration: '21s', delay: '-13s', sway: '16px' },
  { id: 8, left: '88%', size: 'w-2 h-2', duration: '23s', delay: '-3s', sway: '-20px' },
  { id: 9, left: '94%', size: 'w-2.5 h-2.5', duration: '26s', delay: '-9s', sway: '25px' },
];

export const AnimatedArtisanBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only track cursor on mouse/pointer devices with fine precision to preserve mobile battery
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsDesktop(mediaQuery.matches);

    if (!mediaQuery.matches) return;

    let rafId: number;
    let targetX = 50;
    let targetY = 30;
    let currentX = 50;
    let currentY = 30;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized percentage position
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
    };

    // Smooth lerp loop for fluid, non-jittery spotlight movement
    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setMousePos({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-20 w-full h-full max-w-[100vw] overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Interactive Cursor Ambient Spotlight (Desktop only, 0 CPU on mobile) */}
      {isDesktop && (
        <div
          className="absolute w-[45vw] h-[45vw] min-w-[380px] min-h-[380px] rounded-full blur-3xl transition-opacity duration-700 pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(244, 114, 182, 0.25) 45%, transparent 70%)',
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: 'translate3d(-50%, -50%, 0)',
            willChange: 'transform',
          }}
        />
      )}

      {/* 2. Fluid Morphing Aurora Mesh Orbs (Hardware-accelerated CSS 3D transforms) */}
      {/* Orb 1: Rose Quartz (Top Left) */}
      <div
        className="aurora-orb-1 absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-pink-300/40 via-rose-200/35 to-transparent blur-[85px] sm:blur-[110px]"
        style={{ willChange: 'transform' }}
      />

      {/* Orb 2: Warm Terracotta Sunset (Top Right) */}
      <div
        className="aurora-orb-2 absolute top-[5%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-orange-200/45 via-amber-100/40 to-transparent blur-[90px] sm:blur-[120px]"
        style={{ willChange: 'transform' }}
      />

      {/* Orb 3: Lavender & Lotus Bloom (Center Left) */}
      <div
        className="aurora-orb-3 absolute top-[40%] -left-[12%] w-[48vw] h-[48vw] rounded-full bg-gradient-to-tr from-purple-200/35 via-fuchsia-100/30 to-transparent blur-[80px] sm:blur-[100px]"
        style={{ willChange: 'transform' }}
      />

      {/* Orb 4: Khadi Saffron Glow (Bottom Right) */}
      <div
        className="aurora-orb-4 absolute -bottom-[15%] right-[5%] w-[52vw] h-[52vw] rounded-full bg-gradient-to-tl from-amber-200/40 via-rose-100/35 to-transparent blur-[95px] sm:blur-[130px]"
        style={{ willChange: 'transform' }}
      />

      {/* 3. Subtle Floating Indian Artisan Craft Motifs */}
      {/* Diya Flame Silhouette (Floating in Hero / Top Section) */}
      <div
        className="artisan-motif-drift absolute top-[14%] right-[8%] sm:right-[15%] opacity-20 text-amber-600/70"
        style={{ animationDuration: '28s' }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2c0 3.5-3 5.5-3 8a3 3 0 0 0 6 0c0-2.5-3-4.5-3-8z" fill="rgba(245, 158, 11, 0.25)" />
          <path d="M5 16c0 3.314 3.134 6 7 6s7-2.686 7-6H5z" fill="rgba(217, 119, 6, 0.15)" />
        </svg>
      </div>

      {/* Handcrafted Sacred Mandala / Rangoli Ring (Floating mid-screen) */}
      <div
        className="artisan-motif-spin absolute top-[48%] left-[4%] sm:left-[6%] opacity-20 text-rose-500/70"
        style={{ animationDuration: '45s' }}
      >
        <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
        </svg>
      </div>

      {/* Artisan Lotus Bloom (Floating bottom right) */}
      <div
        className="artisan-motif-drift absolute bottom-[22%] right-[7%] opacity-20 text-pink-600/70"
        style={{ animationDuration: '34s', animationDelay: '-12s' }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 4c-1.5 3-4 6-4 10a4 4 0 0 0 8 0c0-4-2.5-7-4-10z" fill="rgba(244, 114, 182, 0.2)" />
          <path d="M8 12c-3 1-5 3.5-5 6 3 0 5-1.5 6-3.5" />
          <path d="M16 12c3 1 5 3.5 5 6-3 0-5-1.5-6-3.5" />
        </svg>
      </div>

      {/* 4. Drifting Golden Stardust Flecks (Pure CSS translate3d particles) */}
      {STARDUST_PARTICLES.map((p) => (
        <div
          key={p.id}
          className="stardust-particle absolute bottom-0 rounded-full bg-gradient-to-t from-amber-400 to-rose-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
          style={{
            left: p.left,
            width: p.size.includes('w-3') ? '12px' : p.size.includes('w-2.5') ? '10px' : p.size.includes('w-2') ? '7px' : '5px',
            height: p.size.includes('w-3') ? '12px' : p.size.includes('w-2.5') ? '10px' : p.size.includes('w-2') ? '7px' : '5px',
            animation: `stardustAscend ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* 5. Delicate Sparkle Twinkles in fixed atmospheric points */}
      <div
        className="absolute top-[28%] left-[22%] text-amber-500/60 animate-sparkle-spin pointer-events-none"
        style={{ animationDuration: '10s' }}
      >
        ✦
      </div>
      <div
        className="absolute top-[65%] right-[20%] text-rose-500/50 animate-sparkle-spin pointer-events-none"
        style={{ animationDuration: '14s', animationDelay: '-5s' }}
      >
        ✦
      </div>
      <div
        className="absolute top-[82%] left-[12%] text-orange-400/50 animate-sparkle-spin pointer-events-none"
        style={{ animationDuration: '12s', animationDelay: '-8s' }}
      >
        ✦
      </div>
    </div>
  );
};

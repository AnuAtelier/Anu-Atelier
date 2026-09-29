/**
 * Global Heartbeat Animation Synchronizer
 * Ensures that every heart logo (and its aura) on the entire page
 * beats at the EXACT SAME TIME in 100% synchronicity.
 */

const TARGET_ANIMATION_NAMES = new Set(['logoHeartbeat', 'heartAuraPulse']);

/**
 * Synchronizes all heart logo animations currently in the document.
 * Aligns their animation timeline origins so their current cycle phase is identical.
 */
export function syncHeartbeatAnimations(): void {
  if (typeof document === 'undefined' || typeof document.getAnimations !== 'function') {
    return;
  }

  try {
    const allAnimations = document.getAnimations();
    const heartAnimations = allAnimations.filter((anim) => {
      const name = (anim as { animationName?: string }).animationName;
      return name && TARGET_ANIMATION_NAMES.has(name);
    });

    if (heartAnimations.length === 0) return;

    for (const anim of heartAnimations) {
      if (anim.startTime !== 0) {
        try {
          anim.startTime = 0;
        } catch {
          // Fallback if browser restricts startTime mutation
          try {
            if (document.timeline && typeof document.timeline.currentTime === 'number') {
              const period = 2800; // 2.8s keyframe duration
              const syncedPhase = document.timeline.currentTime % period;
              anim.currentTime = syncedPhase;
            }
          } catch {
            // Silently ignore
          }
        }
      }
    }
  } catch {
    // Graceful fallback if getAnimations throws in exotic contexts
  }
}

let isInitialized = false;

/**
 * Initializes continuous listeners to ensure any newly mounted or lazy-loaded
 * heart logo immediately locks into phase with all other hearts on the page.
 */
export function initHeartbeatSync(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  if (isInitialized) {
    // Run an immediate sync pass
    syncHeartbeatAnimations();
    return () => {};
  }

  isInitialized = true;

  // 1. Initial pass
  syncHeartbeatAnimations();

  // 2. Listen for any new CSS animation starting in the DOM
  const handleAnimationStart = (e: AnimationEvent) => {
    if (TARGET_ANIMATION_NAMES.has(e.animationName)) {
      syncHeartbeatAnimations();
    }
  };

  // 3. Listen for tab visibility changes (e.g. background tab restored)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      syncHeartbeatAnimations();
    }
  };

  document.addEventListener('animationstart', handleAnimationStart);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', syncHeartbeatAnimations);

  // 4. Periodic heartbeat phase-lock check (every 2.8s cycle)
  const intervalId = window.setInterval(syncHeartbeatAnimations, 2800);

  // 5. Cleanup
  return () => {
    document.removeEventListener('animationstart', handleAnimationStart);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', syncHeartbeatAnimations);
    window.clearInterval(intervalId);
    isInitialized = false;
  };
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncHeartbeatAnimations, initHeartbeatSync } from '../src/utils/syncHeartbeats';

describe('Heartbeat Animation Synchronizer', () => {
  let originalDocument: unknown;
  let originalWindow: unknown;

  beforeEach(() => {
    originalDocument = (globalThis as unknown as { document: unknown }).document;
    originalWindow = (globalThis as unknown as { window: unknown }).window;

    const mockDoc = {
      getAnimations: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      visibilityState: 'visible',
      timeline: { currentTime: 0 },
    };

    const mockWin = {
      setInterval: vi.fn().mockReturnValue(123),
      clearInterval: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    (globalThis as unknown as { document: unknown }).document = mockDoc;
    (globalThis as unknown as { window: unknown }).window = mockWin;
  });

  afterEach(() => {
    (globalThis as unknown as { document: unknown }).document = originalDocument;
    (globalThis as unknown as { window: unknown }).window = originalWindow;
    vi.restoreAllMocks();
  });

  it('synchronizes multiple heart logo and aura animations to the same start time', () => {
    const mockAnimations = [
      {
        animationName: 'logoHeartbeat',
        startTime: 1200,
        currentTime: 500,
      },
      {
        animationName: 'heartAuraPulse',
        startTime: 3400,
        currentTime: 100,
      },
      {
        animationName: 'unrelatedFadeIn',
        startTime: 800,
        currentTime: 200,
      },
      {
        animationName: 'logoHeartbeat',
        startTime: 0,
        currentTime: 1700,
      },
    ];

    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = vi.fn().mockReturnValue(mockAnimations);

    syncHeartbeatAnimations();

    // Verify only the heart animations were synchronized to startTime = 0
    expect(mockAnimations[0].startTime).toBe(0);
    expect(mockAnimations[1].startTime).toBe(0);
    expect(mockAnimations[3].startTime).toBe(0);

    // Unrelated animation should NOT be touched
    expect(mockAnimations[2].startTime).toBe(800);
  });

  it('gracefully falls back to currentTime matching if startTime assignment throws', () => {
    const errorAnim = {
      animationName: 'logoHeartbeat',
      get startTime() {
        return 999;
      },
      set startTime(_v: number) {
        throw new Error('Read-only or restricted property');
      },
      currentTime: 100,
    };

    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = vi.fn().mockReturnValue([errorAnim]);
    (document as unknown as { timeline: { currentTime: number } }).timeline = { currentTime: 3000 };

    syncHeartbeatAnimations();

    // 3000 % 2800 = 200
    expect(errorAnim.currentTime).toBe(200);
  });

  it('initializes listeners and runs periodic synchronizer', () => {
    const mockAnimations = [
      { animationName: 'logoHeartbeat', startTime: 500 },
    ];
    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = vi.fn().mockReturnValue(mockAnimations);

    const cleanup = initHeartbeatSync();

    expect(document.addEventListener).toHaveBeenCalledWith('animationstart', expect.any(Function));
    expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(mockAnimations[0].startTime).toBe(0);

    cleanup();
    expect(document.removeEventListener).toHaveBeenCalledWith('animationstart', expect.any(Function));
  });
});

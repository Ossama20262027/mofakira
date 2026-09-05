import { useEffect } from 'react';
import { soundAlerts } from '../utils/audioAlerts';

/**
 * Hook to attach lightweight click and hover sound effects to interactive elements
 * (buttons, links, action cards) without burdening performance.
 */
export function useInteractiveSounds(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handlePointerEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input[type="submit"], .interactive-card');
      if (interactive) {
        soundAlerts.playHoverTick();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input[type="submit"]');
      if (interactive) {
        soundAlerts.unlockAudio();
        soundAlerts.playButtonTap();
      }
    };

    // Attach listeners on window in capture mode for maximum responsiveness
    window.addEventListener('mouseover', handlePointerEnter, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('mouseover', handlePointerEnter);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [enabled]);
}

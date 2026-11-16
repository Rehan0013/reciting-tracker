'use client';

import { useEffect, useState, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Generates an organic polygon clip-path sequence simulating
 * a droplet of liquid ink hitting and bleeding through paper or cloth fibers.
 */
function generateInkKeyframes(cx: number, cy: number, endRadius: number, pointsCount = 48) {
  // Steady, organic keyframe progression calibrated for a 1.6s fluid ink soaking:
  // Starts with gentle droplet contact, then capillary seepage outward through paper fibers
  const steps = [
    { progress: 0.0, rScale: 0.0 },
    { progress: 0.14, rScale: 0.08 },
    { progress: 0.28, rScale: 0.20 },
    { progress: 0.44, rScale: 0.38 },
    { progress: 0.60, rScale: 0.62 },
    { progress: 0.76, rScale: 0.95 },
    { progress: 0.90, rScale: 1.40 },
    { progress: 1.0, rScale: 2.10 }, // Fully saturates past every viewport corner
  ];

  return steps.map(({ progress, rScale }) => {
    const r = endRadius * rScale;
    const shift = progress * 0.55; // Dynamic harmonic rotation simulating capillary seepage through fibers
    const points: string[] = [];

    for (let i = 0; i < pointsCount; i++) {
      const theta = (2 * Math.PI * i) / pointsCount;
      // Multi-harmonic organic distortion simulating ink bleeding through paper fibers
      const f =
        1.0 +
        0.22 * Math.sin(3 * theta + 0.5 + shift) +
        0.16 * Math.cos(5 * theta + 1.2 - shift) +
        0.11 * Math.sin(7 * theta + 2.1 + shift * 1.5) +
        0.06 * Math.cos(11 * theta + 0.8) +
        0.04 * Math.sin(13 * theta + 1.5);

      const rad = r * f;
      const px = Math.round((cx + rad * Math.cos(theta)) * 10) / 10;
      const py = Math.round((cy + rad * Math.sin(theta)) * 10) / 10;
      points.push(`${px}px ${py}px`);
    }

    return {
      offset: progress,
      clipPath: `polygon(${points.join(', ')})`,
    };
  });
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioningRef.current) return;

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const isToDark = nextTheme === 'dark';

    const applyTheme = () => {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      setTheme(nextTheme);
    };

    // Fallback for browsers without View Transitions API or users who prefer reduced motion
    const hasViewTransitions =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasViewTransitions) {
      applyTheme();
      return;
    }

    isTransitioningRef.current = true;

    // Center coordinates for the ink droplet origin (strictly under the toggle button center)
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Distance to the farthest viewport corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const maxRadius = endRadius * 2.5;

    // Duration calibrated for deliberate, fluid ink spread/gather (1600ms)
    const DURATION = 1600;

    // Set transition mode on document for targeted CSS pseudo-element layers
    document.documentElement.dataset.themeTransition = isToDark ? 'spread' : 'gather';

    // Set origin coordinates and initial radius for the multi-shade gradient mask
    document.documentElement.style.setProperty('--ink-x', `${x}px`);
    document.documentElement.style.setProperty('--ink-y', `${y}px`);
    document.documentElement.style.setProperty(
      '--ink-radius',
      isToDark ? '0px' : `${maxRadius.toFixed(1)}px`
    );

    const transition = document.startViewTransition(() => {
      applyTheme();
    });

    transition.ready
      .then(() => {
        // Animate the multi-shade mask radius in sync
        const startTime = performance.now();
        let frameId: number;

        const updateMask = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / DURATION);

          // Smooth sinusoidal ease (ease-in-out) matching fluid viscous ink soaking/receding
          const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);

          // In 'spread': radius grows 0 -> maxRadius (dark ink blooms outward)
          // In 'gather': radius contracts maxRadius -> 0 (dark ink gathers into button)
          const currentR = isToDark
            ? ease * maxRadius
            : (1 - ease) * maxRadius;

          document.documentElement.style.setProperty(
            '--ink-radius',
            `${Math.max(0, currentR).toFixed(1)}px`
          );

          if (progress < 1) {
            frameId = requestAnimationFrame(updateMask);
          }
        };
        frameId = requestAnimationFrame(updateMask);

        // Animate the 48-point organic capillary polygon:
        // Spreading to dark mode: animates ::view-transition-new(root) outwards (0 -> max)
        // Gathering to light mode: animates ::view-transition-old(root) inwards (max -> 0)
        const spreadKeyframes = generateInkKeyframes(x, y, endRadius);
        const gatherKeyframes = spreadKeyframes.map((kf, idx) => ({
          offset: spreadKeyframes[idx].offset,
          clipPath: spreadKeyframes[spreadKeyframes.length - 1 - idx].clipPath,
        }));

        const clipKeyframes = isToDark ? spreadKeyframes : gatherKeyframes;
        const targetPseudo = isToDark
          ? '::view-transition-new(root)'
          : '::view-transition-old(root)';

        const anim = document.documentElement.animate(
          clipKeyframes,
          {
            duration: DURATION,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: targetPseudo,
          }
        );

        const cleanup = () => {
          cancelAnimationFrame(frameId);
          document.documentElement.style.removeProperty('--ink-radius');
          document.documentElement.style.removeProperty('--ink-x');
          document.documentElement.style.removeProperty('--ink-y');
          delete document.documentElement.dataset.themeTransition;
          isTransitioningRef.current = false;
        };

        // When the custom ink animation completes its duration:
        // Immediately skip and tear down the view transition pseudo-elements
        // so no delayed User-Agent animations (like secondary light screen fades) ever play!
        anim.finished
          .then(() => {
            try {
              transition.skipTransition();
            } catch (_) {}
            cleanup();
          })
          .catch(() => {
            try {
              transition.skipTransition();
            } catch (_) {}
            cleanup();
          });

        transition.finished
          .then(cleanup)
          .catch(cleanup);
      })
      .catch(() => {
        document.documentElement.style.removeProperty('--ink-radius');
        document.documentElement.style.removeProperty('--ink-x');
        document.documentElement.style.removeProperty('--ink-y');
        delete document.documentElement.dataset.themeTransition;
        isTransitioningRef.current = false;
      });
  };

  if (!mounted) {
    return (
      <div className="w-[44px] h-[44px] border border-border flex items-center justify-center rounded-[2px]" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative overflow-hidden w-[44px] h-[44px] border border-border bg-card text-foreground hover:bg-secondary focus:outline-none flex items-center justify-center rounded-[2px] cursor-pointer transition-colors duration-150 active:scale-95"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="relative z-10 transition-transform duration-300 transform">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-foreground transition-transform duration-300 hover:-rotate-12" />
        ) : (
          <Sun className="w-5 h-5 text-foreground transition-transform duration-300 hover:rotate-45" />
        )}
      </span>
    </button>
  );
}

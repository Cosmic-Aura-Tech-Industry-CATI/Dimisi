/**
 * Device capability detection used to scale every GPU-heavy layer
 * (particle counts, DPR, effect quality) so the experience stays at 60fps
 * from small phones up to extra-large desktops.
 */

export type PerfTier = "low" | "medium" | "high";

export interface PerfProfile {
  tier: PerfTier;
  /** Max device pixel ratio the WebGL renderer is allowed to use. */
  dpr: [number, number];
  /** Multiplier applied to particle / instance counts. */
  quality: number;
  /** Whether heavy motion should be skipped entirely. */
  reducedMotion: boolean;
  antialias: boolean;
}

const DEFAULT: PerfProfile = {
  tier: "medium",
  dpr: [1, 1.4],
  quality: 0.7,
  reducedMotion: false,
  antialias: true,
};

let cached: PerfProfile | null = null;

export function getPerfProfile(): PerfProfile {
  if (typeof window === "undefined") return DEFAULT;
  if (cached) return cached;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const saveData = Boolean(
    (navigator as { connection?: { saveData?: boolean } }).connection?.saveData,
  );
  const coarse = window.matchMedia("(hover: none)").matches;

  let score = 0;
  score += width >= 1280 ? 2 : width >= 768 ? 1 : 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
  if (coarse) score -= 1;
  if (saveData) score -= 2;

  const tier: PerfTier = reducedMotion || score <= 1 ? "low" : score >= 5 ? "high" : "medium";

  cached =
    tier === "high"
      ? { tier, dpr: [1, Math.min(2, window.devicePixelRatio || 1)], quality: 1, reducedMotion, antialias: true }
      : tier === "medium"
        ? { tier, dpr: [1, 1.35], quality: 0.6, reducedMotion, antialias: true }
        : { tier, dpr: [1, 1], quality: 0.3, reducedMotion, antialias: false };

  return cached;
}

/** Scale a count by the device quality, never below a small floor. */
export function scaleCount(base: number, min = 8): number {
  return Math.max(min, Math.round(base * getPerfProfile().quality));
}

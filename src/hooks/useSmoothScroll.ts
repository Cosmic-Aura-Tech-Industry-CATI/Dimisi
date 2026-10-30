import { useEffect } from "react";
import Lenis from "lenis";
import { getPerfProfile } from "@/lib/perf";

/** Momentum-based scroll used as the "timeline scrubber" for the whole site. */
export function useSmoothScroll(disabled = false): void {
  useEffect(() => {
    if (typeof window === "undefined" || disabled) return;
    if (window.location.pathname.startsWith("/dimisi-admin")) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Mobile / touch devices (iPhone, iPad, Android) perform best with 100% native OS 120Hz momentum scrolling.
    // Bypassing JS scroll interception on touch devices eliminates rubber-band lag and frees the main thread.
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;
    if (isTouchOnly) return;

    const perf = getPerfProfile();
    const lenis = new Lenis({
      // Snappy, silky-smooth response with zero sluggish inertia
      duration: perf.tier === "low" ? 0.65 : perf.tier === "medium" ? 0.78 : 0.85,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.0,
      // Native scrolling on touch devices — smoother and far cheaper on mobile GPUs.
      syncTouch: false,
      prevent: (node) => {
        return (
          node instanceof HTMLElement &&
          (node.hasAttribute("data-lenis-prevent") ||
            node.closest("[data-lenis-prevent]") !== null ||
            node.closest("[role='dialog']") !== null)
        );
      },
    });

    let frame = 0;
    let running = true;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = running ? requestAnimationFrame(raf) : 0;
    };
    frame = requestAnimationFrame(raf);

    const onVis = () => {
      running = !document.hidden;
      if (running && !frame) frame = requestAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [disabled]);
}
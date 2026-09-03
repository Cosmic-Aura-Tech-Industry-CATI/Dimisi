import { useEffect } from "react";
import Lenis from "lenis";
import { getPerfProfile } from "@/lib/perf";

/** Momentum-based scroll used as the "timeline scrubber" for the whole site. */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const perf = getPerfProfile();
    const lenis = new Lenis({
      // Slightly snappier on weaker devices so scroll never feels laggy.
      duration: perf.tier === "low" ? 0.9 : perf.tier === "medium" ? 1.15 : 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
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
  }, []);
}
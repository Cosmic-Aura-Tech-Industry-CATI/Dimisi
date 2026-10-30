import { useEffect, useRef, type ReactNode } from "react";
import { getPerfProfile } from "@/lib/perf";
import styles from "./ScrollScene.module.css";

export type SceneVariant =
  | "depth"
  | "center"
  | "left"
  | "right"
  | "lift"
  | "bottom"
  | "top"
  | "tiltIn"
  | "slide"
  | "swingLeft"
  | "swingRight";

type Dir = "center" | "left" | "right" | "bottom" | "top";

const ORDER: Dir[] = ["center", "left", "right", "bottom", "top"];
let globalSceneIndex = 0;

interface ScrollSceneProps {
  children: ReactNode;
  variant?: SceneVariant;
  /** 0 = no movement, 1 = full movement. */
  strength?: number;
  className?: string;
}

/**
 * ScrollScene: 3D Background Emergence & 4-Directional Opposite Exit System.
 * - Content emerges directly from deep 3D background (Z-space depth + scale zoom-in).
 * - Locks firmly at (0,0,0) and 100% opacity in the reading zone for crystal-clear readability.
 * - Glides out into its exact opposite direction past the camera as the user scrolls past.
 */
export function ScrollScene({
  children,
  variant,
  strength = 1,
  className,
}: ScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dirRef = useRef<Dir | null>(null);

  if (dirRef.current === null) {
    if (variant === "left" || variant === "slide" || variant === "swingLeft") {
      dirRef.current = "left";
    } else if (variant === "right" || variant === "swingRight") {
      dirRef.current = "right";
    } else if (variant === "lift" || variant === "bottom") {
      dirRef.current = "bottom";
    } else if (variant === "top" || variant === "tiltIn") {
      dirRef.current = "top";
    } else if (variant === "depth" || variant === "center") {
      dirRef.current = "center";
    } else {
      dirRef.current = ORDER[globalSceneIndex++ % ORDER.length] as Dir;
    }
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mq = (q: string) => window.matchMedia(q).matches;
    const isMobile = mq("(max-width: 640px)");
    const isTablet = mq("(max-width: 1024px)");
    const perf = getPerfProfile();
    const isLowTier = perf.tier === "low";

    // Dynamic strength tuning per device
    const deviceScale = isMobile ? 0.52 : isTablet ? 0.78 : 1.0;
    const k = strength * deviceScale * (isLowTier ? 0.7 : 1.0);
    const dir = dirRef.current as Dir;

    let raf = 0;
    let visible = false;
    let current = 0;
    let target = 0;
    let isSleeping = true;

    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
    const ease = (t: number) => t * t * (3 - 2 * t);

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Stable reading zone: when content is centered in view,
      // target is locked to 0 so the section is 100% solid, sharp, and clickable.
      const enterThreshold = vh * 0.88;
      const exitThreshold = vh * 0.12;
      const span = vh * (isMobile ? 0.36 : 0.44);

      if (rect.top > enterThreshold) {
        // Entering from background / bottom
        const distance = rect.top - enterThreshold;
        target = ease(clamp01(distance / span));
      } else if (rect.bottom < exitThreshold) {
        // Exiting forward / opposite
        const distance = exitThreshold - rect.bottom;
        target = -ease(clamp01(distance / span));
      } else {
        // Active reading zone: locked completely at 0
        target = 0;
      }
    };

    const paint = () => {
      const a = Math.abs(current) * k;

      if (a <= 0.002) {
        el.style.transform = "translate3d(0,0,0)";
        el.style.opacity = "1";
        el.style.willChange = "auto";
        el.style.pointerEvents = "auto";
        return;
      }

      const entering = current > 0;
      // Lightweight 2D GPU compositor offset (gentle 24px vertical drift, no expensive 3D warping)
      const y = (entering ? 24 : -18) * a;
      const op = Math.max(0.12, 1 - Math.min(1, a * 0.85));

      el.style.willChange = "transform, opacity";
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = op.toFixed(3);
      el.style.pointerEvents = op < 0.25 ? "none" : "auto";
    };

    const tick = () => {
      measure();
      current += (target - current) * (isMobile ? 0.24 : 0.18);
      const delta = Math.abs(target - current);

      if (delta < 0.0005) {
        current = target;
        paint();
        // Self-sleeping: stop RAF when animation has reached resting target
        isSleeping = true;
        raf = 0;
        return;
      }

      paint();
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (!visible || document.hidden) return;
      measure();
      if (Math.abs(target - current) > 0.0005) {
        if (isSleeping || !raf) {
          isSleeping = false;
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        }
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const now = !!entry?.isIntersecting;
        if (now === visible) return;
        visible = now;
        if (visible) {
          wake();
        } else {
          isSleeping = true;
          if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);

    // Awaken only on actual scroll/resize events (RAF-batched to prevent layout thrashing)
    let scrollScheduled = false;
    const onScroll = () => {
      if (visible && isSleeping && !scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(() => {
          scrollScheduled = false;
          wake();
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    measure();
    current = target;
    paint();

    return () => {
      io.disconnect();
      visible = false;
      isSleeping = true;
      scrollScheduled = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [variant, strength]);

  return (
    <div ref={ref} className={[styles.scene, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
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

      if (a <= 0.001) {
        el.style.transform = "translate3d(0,0,0)";
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.willChange = "auto";
        el.style.pointerEvents = "auto";
        return;
      }

      const entering = current > 0;
      const vw = Math.min(window.innerWidth || 1, 1400);
      const vh = Math.min(window.innerHeight || 1, 900);

      let x = 0;
      let y = 0;
      let z = 0;
      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;
      let sc = 1;

      // 3D Background Emergence depth physics (Z-axis origin & zoom scale)
      if (entering) {
        // Content emerges small & deep from inside the 3D background void
        z = -420 * a;
        sc = 1 - 0.22 * a;
      } else {
        // Content exits forward past the camera in the opposite direction
        z = 240 * a;
        sc = 1 + 0.16 * a;
      }

      if (dir === "left") {
        // Enters from deep background Left -> Exits to Right (Opposite Direction!)
        x = (entering ? -1 : 1) * vw * 0.22 * a;
        y = entering ? 18 * a : -18 * a;
        rotY = (entering ? -1 : 1) * 5 * a;
        rotZ = (entering ? -1 : 1) * 1.5 * a;
      } else if (dir === "right") {
        // Enters from deep background Right -> Exits to Left (Opposite Direction!)
        x = (entering ? 1 : -1) * vw * 0.22 * a;
        y = entering ? 18 * a : -18 * a;
        rotY = (entering ? 1 : -1) * 5 * a;
        rotZ = (entering ? 1 : -1) * 1.5 * a;
      } else if (dir === "top") {
        // Enters from deep background Top -> Exits to Bottom (Opposite Direction!)
        y = (entering ? -1 : 1) * vh * 0.20 * a;
        rotX = (entering ? -1 : 1) * 5 * a;
      } else if (dir === "bottom") {
        // Enters from deep background Bottom -> Exits to Top (Opposite Direction!)
        y = (entering ? 1 : -1) * vh * 0.20 * a;
        rotX = (entering ? 1 : -1) * 5 * a;
      } else {
        // Center / Depth: Enters straight from deep cosmic core -> Exits forward past camera
        z = entering ? -520 * a : 340 * a;
        y = entering ? 16 * a : -16 * a;
        sc = entering ? 1 - 0.28 * a : 1 + 0.22 * a;
      }

      // Smooth opacity curve from depth into full solid visibility
      const op = Math.max(0.08, 1 - Math.min(1, a * 0.90));
      // Subtle depth-of-field blur on entry/exit (capped on mobile)
      const blurPx = isMobile ? Math.min(3, 3 * a) : Math.min(5, 5 * a);

      el.style.transformOrigin = "50% 50%";
      el.style.willChange = "transform, opacity, filter";
      el.style.transform = `perspective(1200px) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      el.style.opacity = op.toFixed(3);
      el.style.filter = blurPx > 0.3 ? `blur(${blurPx.toFixed(1)}px)` : "none";
      el.style.pointerEvents = op < 0.2 ? "none" : "auto";
    };

    const tick = () => {
      measure();
      current += (target - current) * (isMobile ? 0.22 : 0.16);
      if (Math.abs(target - current) < 0.0004) current = target;
      paint();
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const now = !!entry?.isIntersecting;
        if (now === visible) return;
        visible = now;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      { rootMargin: "35% 0px" },
    );
    io.observe(el);

    measure();
    current = target;
    paint();

    return () => {
      io.disconnect();
      visible = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [variant, strength]);

  return (
    <div ref={ref} className={[styles.scene, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
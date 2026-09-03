import { useEffect, useMemo, useRef, useState } from "react";
import markAsset from "@/assets/dimisi-mark-silver.png.asset.json";
import lockupAsset from "@/assets/dimisi-lockup-silver.png.asset.json";
import { scaleCount } from "@/lib/perf";
import styles from "./AmbientBrandField.module.css";

type Kind = "dust" | "star" | "hex" | "ring" | "shard" | "mark" | "lockup" | "text";

interface Obj {
  kind: Kind;
  /** normalised position 0..1 of the viewport, allowed to drift outside for wrap */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** curve params */
  amp: number;
  freq: number;
  phase: number;
  depth: number; // 0 far .. 1 near
  size: number; // px base
  rot: number;
  rotSpeed: number;
  opPhase: number;
  opSpeed: number;
  parallax: number;
  /** individual travel speed through depth */
  speedScale: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Weighted mix: ~80% plain particles, 10% orange, 5% mark, 3% lockup, 2% text. */
function pickKind(i: number, total: number): Kind {
  const r = i / total;
  if (r < 0.5) return "dust";
  if (r < 0.7) return "star";
  if (r < 0.8) return "shard";
  if (r < 0.86) return "hex";
  if (r < 0.9) return "ring";
  if (r < 0.95) return "mark";
  if (r < 0.98) return "lockup";
  return "text";
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
}

/**
 * Ambient brand identity particle system — DIMISI logos and the company name
 * drift through the same space as dust, stars and orange geometry. Purely
 * environmental: everything stays low-opacity, blurred by depth and wraps
 * infinitely around the viewport edges.
 */
export function AmbientBrandField({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLElement[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const objects = useMemo<Obj[]>(() => {
    const total = typeof window === "undefined" ? 86 : scaleCount(86, 22);
    const kinds = shuffle(Array.from({ length: total }, (_, i) => pickKind(i, total)));
    return kinds.map((kind) => {
      const depth = rand(0.05, 1);
      const brandy = kind === "mark" || kind === "lockup" || kind === "text";
      const size =
        kind === "dust"
          ? rand(2, 5)
          : kind === "star"
            ? rand(1.5, 3.5)
            : kind === "ring"
              ? rand(14, 46)
              : kind === "hex" || kind === "shard"
                ? rand(10, 34)
                : kind === "mark"
                  ? rand(26, 74)
                  : kind === "lockup"
                    ? rand(120, 260)
                    : rand(9, 16);
      return {
        kind,
        x: Math.random(),
        y: Math.random(),
        vx: rand(-0.012, 0.012) * (0.3 + depth),
        vy: rand(-0.01, 0.01) * (0.3 + depth),
        amp: rand(0.004, 0.03),
        freq: rand(0.05, 0.28),
        phase: rand(0, Math.PI * 2),
        depth,
        size,
        rot: rand(0, 360),
        rotSpeed: kind === "text" ? 0 : kind === "lockup" ? rand(-0.08, 0.08) : rand(-1, 1),
        opPhase: rand(0, Math.PI * 2),
        opSpeed: rand(0.04, 0.12),
        speedScale: rand(0.2, 1.1) * (brandy ? 0.7 : 1),
        parallax: (brandy ? 90 : 55) * (0.15 + depth),
      };
    });
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    let lastScroll = scrollRef.current ?? 0;
    let running = true;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const s = scrollRef.current ?? 0;
      const ds = s - lastScroll;
      lastScroll = s;
      // constant drift forward + extra thrust from scrolling → endless approach loop
      const advance = dt * 0.045 + ds * 1.6;
      const w = layer.clientWidth || 1;
      const h = layer.clientHeight || 1;

      for (let i = 0; i < objects.length; i += 1) {
        const o = objects[i] as Obj;
        const el = nodesRef.current[i];
        if (!el) continue;

        o.x += o.vx * dt;
        o.y += o.vy * dt;

        // travel through depth: far (0) → past the camera (1), then respawn far away
        o.depth += advance * (0.45 + o.speedScale);
        if (o.depth > 1) {
          o.depth -= 1;
          o.x = Math.random();
          o.y = Math.random();
          o.rot = Math.random() * 360;
        } else if (o.depth < 0) {
          o.depth += 1;
          o.x = Math.random();
          o.y = Math.random();
        }

        // wrap: exiting one edge respawns on the opposite side at a new spot
        if (o.x < -0.25) {
          o.x = 1.2;
          o.y = Math.random();
        } else if (o.x > 1.25) {
          o.x = -0.2;
          o.y = Math.random();
        }
        if (o.y < -0.25) {
          o.y = 1.2;
          o.x = Math.random();
        } else if (o.y > 1.25) {
          o.y = -0.2;
          o.x = Math.random();
        }

        const cx = Math.sin(t * o.freq + o.phase) * o.amp;
        const cy = Math.cos(t * o.freq * 0.83 + o.phase) * o.amp;
        // spread outward from the centre as objects approach, like flying through space
        const spread = 0.35 + o.depth * 0.85;
        const px = (0.5 + (o.x + cx - 0.5) * spread) * w;
        const py = (0.5 + (o.y + cy - 0.5) * spread) * h - s * o.parallax;
        const scale = 0.2 + o.depth * 1.0;
        const rot = o.rot + t * o.rotSpeed * 60;
        const blur = (1 - o.depth) * 5;
        // brighter breathing: baseline stays visible, peak nearly solid
        const wave = (Math.sin(t * o.opSpeed * Math.PI * 2 + o.opPhase) + 1) / 2;
        const peak = o.kind === "dust" || o.kind === "star" ? 0.95 : 0.42;
        // fade in from the void and fade out again as it passes the camera
        const life = Math.sin(Math.PI * Math.min(1, Math.max(0, o.depth)));
        const opacity = (0.35 + wave * 0.65) * peak * (0.35 + o.depth * 0.65) * life;

        el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";
      }

      raf = running ? requestAnimationFrame(loop) : 0;
    };

    raf = requestAnimationFrame(loop);
    const onVis = () => {
      running = !document.hidden;
      if (running && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [objects, scrollRef, mounted]);

  return (
    <div ref={layerRef} className={styles.field} aria-hidden="true">
      {(mounted ? objects : []).map((o, i) => {
        const ref = (el: HTMLElement | null) => {
          if (el) nodesRef.current[i] = el;
        };
        const common = { ref: ref as never, className: "" };

        if (o.kind === "mark" || o.kind === "lockup") {
          return (
            <div
              key={i}
              {...common}
              className={styles.item}
              style={{ width: `${o.size}px` }}
            >
              <img
                src={o.kind === "mark" ? markAsset.url : lockupAsset.url}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          );
        }

        if (o.kind === "text") {
          return (
            <div
              key={i}
              {...common}
              className={`${styles.item} ${styles.text}`}
              style={{ fontSize: `${o.size}px` }}
            >
              DIMISI TECHNOLOGIES PVT. LTD.
            </div>
          );
        }

        return (
          <div
            key={i}
            {...common}
            className={`${styles.item} ${styles[o.kind]}`}
            style={{
              width: `${o.size}px`,
              height: `${o.size}px`,
            }}
          />
        );
      })}
    </div>
  );
}

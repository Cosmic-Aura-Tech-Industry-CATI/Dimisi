import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SERVICE_WORLDS } from "@/data/serviceWorlds";
import styles from "./ServicePortals.module.css";

/**
 * Cinematic portal hall. Each service floats as a glowing portal; clicking one
 * flies the "camera" into it before the route changes.
 */
export function ServicePortals() {
  const navigate = useNavigate();
  const [flying, setFlying] = useState<string | null>(null);
  const timer = useRef<number>(0);

  const enter = (slug: string) => {
    if (flying) return;
    setFlying(slug);
    timer.current = window.setTimeout(() => {
      void navigate({ to: `/services/${slug}` as never });
      window.setTimeout(() => setFlying(null), 400);
    }, 900);
  };

  return (
    <div className={styles.hall}>
      <span className={styles.floor} aria-hidden="true" />
      <div className={styles.grid}>
        {SERVICE_WORLDS.map((w, i) => (
          <button
            key={w.slug}
            type="button"
            className={[styles.portal, flying === w.slug ? styles.flying : "", flying && flying !== w.slug ? styles.dim : ""]
              .filter(Boolean)
              .join(" ")}
            style={{ "--i": i, "--drift": `${5 + (i % 4) * 1.6}s` } as React.CSSProperties}
            onClick={() => enter(w.slug)}
            aria-label={`Explore ${w.title}`}
          >
            <span className={styles.ringA} aria-hidden="true" />
            <span className={styles.ringB} aria-hidden="true" />
            <span className={styles.core} aria-hidden="true" />
            <span className={styles.glyph} aria-hidden="true">
              {w.glyph}
            </span>
            <span className={styles.meta}>
              <span className={styles.index}>{w.index}</span>
              <span className={styles.name}>{w.title}</span>
              <span className={styles.tagline}>{w.tagline}</span>
              <span className={styles.explore}>Explore →</span>
            </span>
          </button>
        ))}
      </div>
      <div className={[styles.warp, flying ? styles.warpOn : ""].join(" ")} aria-hidden="true" />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollProgress.module.css";

const CHAPTERS = ["Awaken", "Vision", "Systems", "Arsenal", "Signal"];

/** Film-timeline scrubber: shows which "scene" of the experience you are in. */
export function ScrollProgress() {
  const [active, setActive] = useState(0);
  const fillRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const updateProgress = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${p})`;
      }
      const nextActive = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      rafId = 0;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className={styles.rail} aria-hidden="true">
      <span className={styles.track}>
        <span ref={fillRef} className={styles.fill} style={{ transform: "scaleY(0)" }} />
      </span>
      <ul className={styles.chapters}>
        {CHAPTERS.map((c, i) => (
          <li key={c} className={i === active ? styles.on : undefined}>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
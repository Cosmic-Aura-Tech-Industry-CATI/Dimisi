import { useEffect, useState } from "react";
import styles from "./ScrollProgress.module.css";

const CHAPTERS = ["Awaken", "Vision", "Systems", "Arsenal", "Signal"];

/** Film-timeline scrubber: shows which "scene" of the experience you are in. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const active = Math.min(CHAPTERS.length - 1, Math.floor(progress * CHAPTERS.length));

  return (
    <div className={styles.rail} aria-hidden="true">
      <span className={styles.track}>
        <span className={styles.fill} style={{ transform: `scaleY(${progress})` }} />
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
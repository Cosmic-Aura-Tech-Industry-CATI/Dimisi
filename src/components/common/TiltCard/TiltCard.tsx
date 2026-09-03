import { useRef, type ReactNode } from "react";
import styles from "./TiltCard.module.css";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

/** Glass card with 3D pointer tilt and a light sheen that follows the cursor. */
export function TiltCard({ children, className, intensity = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * intensity}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * intensity}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      className={[styles.card, className].filter(Boolean).join(" ")}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className={styles.sheen} aria-hidden="true" />
      <div className={styles.body}>{children}</div>
    </div>
  );
}
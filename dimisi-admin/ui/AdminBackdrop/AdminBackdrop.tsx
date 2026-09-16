import styles from "./AdminBackdrop.module.css";

/**
 * High-performance cinematic backdrop for the DIMISI Admin Panel.
 * GPU-composited gradient auras and ambient grid with zero WebGL overhead,
 * ensuring 60+ FPS scrolling and responsive interaction.
 */
export function AdminBackdrop() {
  return (
    <div className={styles.backdropContainer} aria-hidden="true">
      <div className={styles.aura} />
      <div className={styles.grid} />
      <div className={styles.sweep} />
      <div className={styles.veil} />
    </div>
  );
}

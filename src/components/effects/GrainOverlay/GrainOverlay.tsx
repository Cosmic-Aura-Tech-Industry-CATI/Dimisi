import styles from "./GrainOverlay.module.css";

/** Film grain + vignette + scanline atmosphere layer sitting above the whole app. */
export function GrainOverlay() {
  return (
    <>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
    </>
  );
}
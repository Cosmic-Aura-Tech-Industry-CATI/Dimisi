import { useEffect } from "react";
import { CinematicStage } from "@/components/three/CinematicStage/CinematicStage";
import { GrainOverlay } from "@/components/effects/GrainOverlay/GrainOverlay";
import styles from "./AdminBackdrop.module.css";

/**
 * Cinematic DIMISI backdrop for the admin panel.
 * Own gradient/aura layers (always painted, even without WebGL) plus the same
 * WebGL stage and film grain as the public site — scoped to the admin module.
 */
export function AdminBackdrop() {
  useEffect(() => {
    // The public site may have paused the WebGL layer (video playback etc.).
    window.dispatchEvent(new Event("dm:resume3d"));
  }, []);

  return (
    <>
      <CinematicStage />
      <div className={styles.aura} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.sweep} aria-hidden="true" />
      <div className={styles.veil} aria-hidden="true" />
      <GrainOverlay />
    </>
  );
}

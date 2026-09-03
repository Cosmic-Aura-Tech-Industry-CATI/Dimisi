import type { Office } from "@/data/offices";
import styles from "../styles/team.module.css";

const LIGHTS = ["24%", "68%", "42%", "80%", "14%", "56%", "34%", "72%"];

/** Minimal portrait card: photo, name and position only. */
export function OfficeScene({ office, index }: { office: Office; index: number }) {
  const lightX = LIGHTS[index % LIGHTS.length]!;
  return (
    <div className={styles.scene} style={{ ["--lightX" as string]: lightX }}>
      <span className={styles.lightShaft} aria-hidden="true" />

      <figure className={styles.portraitCard}>
        <div className={styles.portraitFrame}>
          {office.photo ? (
            <img
              className={styles.portraitImg}
              src={office.photo}
              alt={`${office.name}, ${office.role} at DIMISI Technologies`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className={styles.portraitInitials} aria-hidden="true">
              {office.initials}
            </span>
          )}
        </div>
        <figcaption className={styles.portraitMeta}>
          <span className={styles.portraitName}>{office.name}</span>
          <span className={styles.portraitRole}>{office.role}</span>
        </figcaption>
      </figure>

      <span className={styles.vignette} aria-hidden="true" />
    </div>
  );
}

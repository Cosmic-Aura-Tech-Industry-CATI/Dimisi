import type { Office } from "@/data/offices";
import styles from "../styles/team.module.css";

/** Smart-glass door that unlocks and slides open as the visitor approaches. */
export function OfficeDoor({ office }: { office: Office }) {
  return (
    <div className={styles.door} aria-hidden="true">
      <span className={`${styles.panel} ${styles.panelLeft}`} />
      <span className={`${styles.panel} ${styles.panelRight}`} />
      <div className={styles.plate}>
        <p className={styles.plateNo}>Office {office.no}</p>
        <p className={styles.plateName}>{office.name}</p>
        <p className={styles.plateRole}>{office.role}</p>
        <p className={styles.plateDept}>{office.department}</p>
        <span className={styles.access}>
          <span className={styles.led} />
          Access Granted
        </span>
      </div>
    </div>
  );
}
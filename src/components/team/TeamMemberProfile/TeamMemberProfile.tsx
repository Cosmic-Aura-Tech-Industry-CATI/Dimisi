import type { Office } from "@/data/offices";
import styles from "../styles/team.module.css";

export function TeamMemberProfile({ office }: { office: Office }) {
  return (
    <article className={styles.profile}>
      <div className={styles.line} style={{ transitionDelay: "0ms" }}>
        <p className={styles.pNo}>Office {office.no}</p>
        <h3 className={styles.pName}>{office.name}</h3>
        <p className={styles.pRole}>{office.role}</p>
        <p className={styles.pSub}>{office.subtitle}</p>
      </div>
      <div className={styles.line}>
        <p className={styles.pText}>{office.description}</p>
      </div>
      <div className={styles.line}>
        <p className={styles.label}>Responsibilities</p>
        <ul className={styles.chips}>
          {office.responsibilities.map((r) => (
            <li key={r} className={styles.chip}>
              {r}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.line}>
        <p className={styles.focus}>Current focus — {office.focus}</p>
      </div>
    </article>
  );
}
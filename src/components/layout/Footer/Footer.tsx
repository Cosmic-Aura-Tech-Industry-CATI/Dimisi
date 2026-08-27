import { Link } from "@tanstack/react-router";
import { COMPANY, LEGAL_LINKS, NAV_LINKS, SOCIALS } from "@/constants/site";
import { WORDMARK_URL } from "@/assets/logos";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.lead}>
          <img
            src={WORDMARK_URL}
            alt={COMPANY.name}
            className={styles.wordmark}
            loading="lazy"
            decoding="async"
          />
          <p className={styles.mission}>{COMPANY.mission}</p>
          <a className={styles.mail} href={`mailto:${COMPANY.email}`}>
            {COMPANY.email}
          </a>
        </div>

        <nav className={styles.col} aria-label="Footer">
          <h3 className={styles.colTitle}>Navigate</h3>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={styles.colLink}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Company">
          <h3 className={styles.colTitle}>Company</h3>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={styles.colLink}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Connect</h3>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className={styles.colLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Studio</h3>
          <p className={styles.meta}>{COMPANY.address}</p>
          <p className={styles.meta}>{COMPANY.phone}</p>
        </div>
      </div>

      <p className={styles.mega} aria-hidden="true">
        DIMISI
      </p>

      <div className={styles.bottom}>
        <span>
          © {new Date().getFullYear()} {COMPANY.name}. {COMPANY.tagline}.
        </span>
        <span className={styles.status}>
          <i className={styles.pulse} /> All systems operational
        </span>
      </div>
    </footer>
  );
}
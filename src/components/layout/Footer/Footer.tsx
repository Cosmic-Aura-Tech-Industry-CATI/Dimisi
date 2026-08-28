import { Link } from "@tanstack/react-router";
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa6";
import { COMPANY, LEGAL_LINKS, NAV_LINKS, SOCIALS } from "@/constants/site";
import { SILVER_LOGO_URL } from "@/assets/logos";
import styles from "./Footer.module.css";

const SOCIAL_ICON_MAP = {
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  youtube: FaYoutube,
} as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Subtle atmospheric ambient glow */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Brand & Mission Column */}
        <div className={styles.lead}>
          <Link to="/" className={styles.logoLink} aria-label="DIMISI Technologies Home">
            <img
              src={SILVER_LOGO_URL}
              alt="DIMISI Technologies logo"
              className={styles.brandLogo}
              loading="lazy"
              decoding="async"
              width={200}
              height={160}
            />
          </Link>

          <p className={styles.mission}>{COMPANY.mission}</p>

          <a
            className={styles.mail}
            href={`mailto:${COMPANY.email}`}
            aria-label={`Send email to ${COMPANY.email}`}
          >
            {COMPANY.email}
          </a>
        </div>

        {/* Navigation Column */}
        <nav className={styles.col} aria-label="Navigate">
          <h3 className={styles.colTitle}>Navigate</h3>
          <ul className={styles.linkList}>
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={styles.colLink}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company Column */}
        <nav className={styles.col} aria-label="Company">
          <h3 className={styles.colTitle}>Company</h3>
          <ul className={styles.linkList}>
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={styles.colLink}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Connect Column (Social Icons) */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Connect</h3>
          <div className={styles.socialGrid}>
            {SOCIALS.map((s) => {
              const IconComponent = SOCIAL_ICON_MAP[s.id as keyof typeof SOCIAL_ICON_MAP] || FaXTwitter;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  className={styles.socialBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.ariaLabel || `DIMISI on ${s.label}`}
                >
                  <IconComponent className={styles.socialIcon} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Company Address & Phone Column */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Address</h3>
          <a
            href={COMPANY.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.addressLink}
            aria-label="View DIMISI Technologies location on Google Maps"
          >
            {COMPANY.addressLines.map((line) => (
              <span key={line} className={styles.addressLine}>
                {line}
              </span>
            ))}
          </a>

          <div className={styles.phoneBox}>
            <span className={styles.phoneLabel}>Phone</span>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className={styles.phoneLink}
              aria-label="Call DIMISI Technologies"
            >
              {COMPANY.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Large Watermark */}
      <p className={styles.mega} aria-hidden="true">
        DIMISI Technologies
      </p>

      {/* Footer Bottom Bar */}
      <div className={styles.bottom}>
        <span className={styles.copyright}>
          © 2026 {COMPANY.name}. {COMPANY.tagline}.
        </span>
        <span className={styles.status}>
          <i className={styles.pulse} aria-hidden="true" /> All systems operational
        </span>
      </div>
    </footer>
  );
}
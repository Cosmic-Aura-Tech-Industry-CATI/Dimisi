import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Award, ShieldCheck } from "lucide-react";
import {
  COMPANY,
  LEGAL_LINKS,
  NAV_LINKS,
  OFFICIAL_EMAILS,
  SOCIALS,
  STARTUP_RECOGNITIONS,
} from "@/constants/site";
import { SILVER_LOGO_URL } from "@/assets/logos";
import styles from "./Footer.module.css";

function IconXTwitter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 576 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
    </svg>
  );
}

const SOCIAL_ICON_MAP = {
  x: IconXTwitter,
  linkedin: IconLinkedin,
  instagram: IconInstagram,
  youtube: IconYoutube,
} as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Atmospheric ambient glow */}
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

          {/* Corporate Location Tagline */}
          <p className={styles.corpLocation}>Technologies Private Limited — Kanpur</p>

          {/* CIN, MCA, DPIIT Corporate Identification Group */}
          <div className={styles.corpLeadStack}>
            <div className={styles.corpLeadItem}>
              <span className={styles.corpLeadKey}>CIN:</span>
              <span className={styles.corpLeadVal}>{COMPANY.cin}</span>
            </div>
            <span className={styles.corpLeadDot} aria-hidden="true">
              ·
            </span>
            <div className={styles.corpLeadItem}>
              <span className={styles.corpLeadBadge}>{COMPANY.mcaRegistered}</span>
            </div>
            <span className={styles.corpLeadDot} aria-hidden="true">
              ·
            </span>
            <div className={styles.corpLeadItem}>
              <span className={styles.corpLeadKey}>DPIIT:</span>
              <span className={styles.corpLeadVal}>{COMPANY.dpiitNumber}</span>
            </div>
          </div>

          <p className={styles.mission}>{COMPANY.mission}</p>
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

        {/* Official Directory / Specialized Desks */}
        <div className={styles.col} aria-label="Official Desks">
          <h3 className={styles.colTitle}>Official Desks</h3>
          <div className={styles.emailList}>
            {OFFICIAL_EMAILS.map((item) => (
              <div key={item.email} className={styles.emailItem}>
                <div className={styles.emailRole}>
                  <span className={styles.emailRoleDot} aria-hidden="true" />
                  <span>{item.role}</span>
                </div>
                <a
                  href={`mailto:${item.email}`}
                  className={styles.emailLink}
                  aria-label={`Send email to ${item.role} at ${item.email}`}
                >
                  {item.email}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Headquarters & Connect Column */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Headquarters</h3>
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

          <div className={styles.connectBox}>
            <span className={styles.phoneLabel}>Connect</span>
            <div className={styles.socialGrid}>
              {SOCIALS.map((s) => {
                const IconComponent =
                  SOCIAL_ICON_MAP[s.id as keyof typeof SOCIAL_ICON_MAP] || IconXTwitter;
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
        </div>
      </div>

      {/* Startup Recognitions & Accreditations Showcase */}
      <section className={styles.recognitionsSection} aria-label="Startup Recognitions">
        <div className={styles.recognitionsHeader}>
          <div className={styles.recognitionsTag}>
            <Award size={13} className={styles.recTagIcon} aria-hidden="true" />
            <span>STARTUP RECOGNITION & ACCREDITATIONS</span>
          </div>
          <span className={styles.recDivider} aria-hidden="true" />
        </div>

        <div className={styles.recognitionsGrid}>
          {STARTUP_RECOGNITIONS.map((rec) => (
            <div key={rec.id} className={styles.recCard}>
              <div className={styles.recLogoWrap}>
                <img
                  src={rec.logo}
                  alt={rec.alt}
                  className={styles.recLogoImg}
                  loading="lazy"
                  decoding="async"
                  width={180}
                  height={60}
                />
              </div>
              <div className={styles.recContent}>
                <div className={styles.recTopRow}>
                  <h4 className={styles.recTitle}>{rec.title}</h4>
                  <span className={styles.recBadge}>{rec.badge}</span>
                </div>
                <p className={styles.recDesc}>{rec.description}</p>
                <div className={styles.recActionRow}>
                  <a
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.recActionLink}
                    aria-label={`${rec.actionText} for ${rec.title}`}
                  >
                    <span>{rec.actionText}</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                  {"certNumber" in rec && rec.certNumber ? (
                    <span className={styles.certPill}>
                      <ShieldCheck size={12} className={styles.certCheck} aria-hidden="true" />
                      <span>Cert: {rec.certNumber}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Large Watermark */}
      <p className={styles.mega} aria-hidden="true">
        DIMISI Technologies
      </p>

      {/* Footer Bottom Bar with Copyright */}
      <div className={styles.bottom}>
        <span className={styles.copyright}>
          © <time dateTime="2026-10-31">2026</time> {COMPANY.name}. All rights reserved.
        </span>

        <span className={styles.status}>
          <i className={styles.pulse} aria-hidden="true" /> All systems operational
        </span>
      </div>
    </footer>
  );
}

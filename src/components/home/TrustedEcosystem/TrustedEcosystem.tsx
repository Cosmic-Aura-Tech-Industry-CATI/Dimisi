import styles from "./TrustedEcosystem.module.css";

export function TrustedEcosystem() {
  return (
    <div className={styles.trustedWrapper}>
      <span className={styles.trustedLabel}>
        TRUSTED BY INNOVATIVE BUSINESSES WORLDWIDE
      </span>
      <div className={styles.logoRow}>
        {/* AWS */}
        <div className={styles.logoItem} title="Amazon Web Services">
          <svg viewBox="0 0 100 32" className={styles.partnerSvg} fill="currentColor">
            <path d="M22 6.5h4.2l3.4 13.8 3.5-13.8h4.2l-5.6 18.5h-4.3L24 11.2l-3.4 13.8h-4.3L10.7 6.5H15l3.5 13.8L22 6.5z" />
            <path d="M48.5 20.2c-2.4 0-4.3-1.1-5-2.8l3.4-1.8c.4 1 1.2 1.6 2.3 1.6 1.1 0 1.9-.5 1.9-1.3 0-.9-.7-1.2-2.3-1.6-2.8-.7-4.8-1.7-4.8-4.4 0-2.4 1.9-4.2 4.9-4.2 2.3 0 4 1 4.8 2.6l-3.3 1.7c-.4-.8-1-1.3-1.9-1.3-.9 0-1.6.4-1.6 1.1 0 .7.6 1.1 2 1.4 3 .8 5.1 1.8 5.1 4.5 0 2.7-2.1 4.5-5.5 4.5z" />
            <path d="M37 25c12 5.5 26 5.5 38 0-1.2-1.5-3.5-3-5-4.2 4.2.8 9.5.8 13.5-.8-1.5 3.5-4 7-7.5 9.5-1.5-1-3.2-2-4.5-3.2-11.5 5-24 5-34.5-1.3z" />
          </svg>
          <span className={styles.logoText}>aws</span>
        </div>

        {/* Microsoft */}
        <div className={styles.logoItem} title="Microsoft">
          <svg viewBox="0 0 24 24" className={styles.partnerSvgIcon} fill="currentColor">
            <rect x="1" y="1" width="10" height="10" rx="1" />
            <rect x="13" y="1" width="10" height="10" rx="1" />
            <rect x="1" y="13" width="10" height="10" rx="1" />
            <rect x="13" y="13" width="10" height="10" rx="1" />
          </svg>
          <span className={styles.logoText}>Microsoft</span>
        </div>

        {/* Google Cloud */}
        <div className={styles.logoItem} title="Google Cloud">
          <svg viewBox="0 0 24 24" className={styles.partnerSvgIcon} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 1 8.9z" />
          </svg>
          <span className={styles.logoText}>Google Cloud</span>
        </div>

        {/* DigitalOcean */}
        <div className={styles.logoItem} title="DigitalOcean">
          <svg viewBox="0 0 24 24" className={styles.partnerSvgIcon} fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5v-3.7H6.5v-2.8h2.34V12.7c0-2.31 1.37-3.58 3.48-3.58 1.01 0 2.07.18 2.07.18v2.28h-1.16c-1.15 0-1.5.71-1.5 1.44v1.98h2.56l-.41 2.8h-2.15v3.7c3.97-1.33 6.84-5.08 6.84-9.5 0-5.52-4.48-10-10-10z" />
          </svg>
          <span className={styles.logoText}>DigitalOcean</span>
        </div>

        {/* Docker */}
        <div className={styles.logoItem} title="Docker">
          <svg viewBox="0 0 24 24" className={styles.partnerSvgIcon} fill="currentColor">
            <path d="M4 11h2v2H4zm3 0h2v2H7zm3 0h2v2h-2zm3 0h2v2h-2zm-6-3h2v2H7zm3 0h2v2h-2zm3 0h2v2h-2zm0-3h2v2h-2zm9.5 7.5c-.3-1.6-1.5-2.5-2.8-2.5-.3 0-.6.1-.9.2C18.2 11.8 16.7 11 15 11H3c-.6 0-1 .4-1 1 0 4.4 3.6 8 8 8 5.1 0 9.4-3.8 9.9-8.8.4-.2.9-.4 1.3-.7.5.3 1.1.5 1.8.5.3 0 .7-.1 1-.2-.6-.9-1.2-1.7-1.5-2.3z" />
          </svg>
          <span className={styles.logoText}>Docker</span>
        </div>

        {/* Linux */}
        <div className={styles.logoItem} title="Linux">
          <svg viewBox="0 0 24 24" className={styles.partnerSvgIcon} fill="currentColor">
            <path d="M12 2C9.5 2 8 4 8 6.5v3.2c-.8.5-1.5 1.3-1.8 2.3-.6 1.8-.2 3.8.8 5.2-.2.5-.4 1-.4 1.6 0 1.5 1.8 2.7 4 2.7.7 0 1.4-.1 2-.4.6.3 1.3.4 2 .4 2.2 0 4-1.2 4-2.7 0-.6-.2-1.1-.4-1.6 1-1.4 1.4-3.4.8-5.2-.3-1-1-1.8-1.8-2.3V6.5C16 4 14.5 2 12 2zm-1.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-1.5 3c1 0 1.8.4 1.8 1s-.8 1-1.8 1-1.8-.4-1.8-1 .8-1 1.8-1z" />
          </svg>
          <span className={styles.logoText}>Linux</span>
        </div>
      </div>
    </div>
  );
}

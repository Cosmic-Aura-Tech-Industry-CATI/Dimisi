import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { NAV_LINKS } from "@/constants/site";
import { LOCKUP_URL } from "@/assets/logos";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > 120 && y > last);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={[styles.wrap, scrolled ? styles.solid : "", hidden && !open ? styles.hidden : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <nav className={styles.bar} aria-label="Primary">
        <Link to="/" className={styles.brand} onClick={() => setOpen(false)}>
          <img
            src={LOCKUP_URL}
            alt="DIMISI Technologies Pvt Ltd"
            className={styles.mark}
            fetchPriority="high"
            decoding="async"
          />
        </Link>

        <ul className={styles.links}>
          {NAV_LINKS.filter((l) => l.to !== "/contact").map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={styles.link}
                activeProps={{ className: [styles.link, styles.active].join(" ") }}
                activeOptions={{ exact: link.to === "/" }}
              >
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/contact"
          className={[styles.link, styles.contactWrap].join(" ")}
          activeProps={{ className: [styles.link, styles.contactWrap, styles.active].join(" ") }}
        >
          Contact Us
        </Link>

        <Link
          to={user ? "/account" : "/auth"}
          className={styles.userBtn}
          aria-label={user ? "Your account" : "Sign in or sign up"}
          title={user ? "Your account" : "Sign in / Sign up"}
          onClick={() => setOpen(false)}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M4.6 20c.9-3.7 3.9-5.8 7.4-5.8s6.5 2.1 7.4 5.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {user ? <span className={styles.userDot} aria-hidden="true" /> : null}
        </Link>

        <button
          type="button"
          className={styles.burger}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className={open ? styles.barTop : ""} />
          <span className={open ? styles.barMid : ""} />
          <span className={open ? styles.barBot : ""} />
        </button>
      </nav>

      {open ? (
        <div className={styles.sheet}>
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.sheetLink}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sheetIndex}>0{i + 1}</span>
              {link.label}
            </Link>
          ))}
          <Link
            to={user ? "/account" : "/auth"}
            className={styles.sheetLink}
            style={{ animationDelay: `${NAV_LINKS.length * 60}ms` }}
            onClick={() => setOpen(false)}
          >
            <span className={styles.sheetIndex}>0{NAV_LINKS.length + 1}</span>
            {user ? "My Account" : "Sign In / Sign Up"}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
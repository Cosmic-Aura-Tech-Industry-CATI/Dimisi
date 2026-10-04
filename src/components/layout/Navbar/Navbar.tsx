import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { NAV_LINKS } from "@/constants/site";
import { LOCKUP_URL } from "@/assets/logos";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let isScrolled = last > 40;
    let isHidden = false;
    let rafId = 0;

    const checkScroll = () => {
      const y = window.scrollY;
      const nextScrolled = y > 40;
      if (nextScrolled !== isScrolled) {
        isScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }
      if (Math.abs(y - last) > 6) {
        const nextHidden = y > 120 && y > last;
        if (nextHidden !== isHidden) {
          isHidden = nextHidden;
          setHidden(nextHidden);
        }
        last = y;
      }
      rafId = 0;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(checkScroll);
      }
    };
    checkScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
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
        </div>
      ) : null}
    </header>
  );
}
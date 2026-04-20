"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Moon, Sun, MessageSquare, X, Menu } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);

    const checkSize = () => {
      setIsDesktop(window.innerWidth > 1050);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedGroup(null);
  }, [pathname]);

  if (!mounted) return null;

  const toggleGroup = (groupName: string) => {
    setExpandedGroup((current) => (current === groupName ? null : groupName));
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <header className="site-header">
      <div className="navbar-container">
        <div className="navbar-shell glass">
          {/* Brand */}
          <Link href="/" className="brand hcl-brand" aria-label="DIMISI home">
            <span className="brand-wordmark">DIMISI</span>
            <span className="brand-tagline">Technology for Forward Momentum</span>
          </Link>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav className="topnav" aria-label="Main navigation">
              <NavGroup
                label="Our Offerings"
                href="/services"
                active={pathname.startsWith("/services")}
                isOpen={expandedGroup === "offerings"}
                onToggle={() => toggleGroup("offerings")}
              >
                <Link href="/services/web-development">Web Development</Link>
                <Link href="/services/mobile-app-development">Mobile App Development</Link>
                <Link href="/services/ai-automation">AI & Automation</Link>
                <Link href="/services/ui-ux-design">UI/UX Design</Link>
                <Link href="/services/software-development">Software Development</Link>
                <Link href="/services/cloud-services">Cloud Services</Link>
                <Link href="/services/it-consulting">IT Consulting</Link>
                <Link href="/services/it-support-maintenance">IT Support & Maintenance</Link>
                <Link href="/services/digital-marketing">Digital Marketing & ITES</Link>
                <Link href="/services/startup-mentorship">Startup Mentorship</Link>
              </NavGroup>

              <NavGroup
                label="Products"
                href="/products"
                active={pathname.startsWith("/products")}
                isOpen={expandedGroup === "products"}
                onToggle={() => toggleGroup("products")}
              >
                <Link href="/products/kalesh">Kalesh</Link>
                <Link href="/products/karyon">KaryON</Link>
                <Link href="/products/stylon">Stylon</Link>
                <Link href="/products/axiscon">Axis Conference Web</Link>
              </NavGroup>

              <NavGroup
                label="Insights"
                href="/insights"
                active={pathname.startsWith("/insights") || pathname === "/newsletter" || pathname === "/events" || pathname === "/sitemap"}
                isOpen={expandedGroup === "insights"}
                onToggle={() => toggleGroup("insights")}
              >
                <Link href="/insights">Insights Home</Link>
                <Link href="/newsletter">Newsletter</Link>
                <Link href="/events">Events</Link>
              </NavGroup>

              <NavGroup
                label="Who We Are"
                href="/about"
                active={pathname.startsWith("/about") || pathname === "/team-leadership" || pathname === "/security" || pathname === "/support" || pathname === "/privacy"}
                isOpen={expandedGroup === "about"}
                onToggle={() => toggleGroup("about")}
              >
                <Link href="/about">About Us</Link>
                <Link href="/team-leadership">Team & Leadership</Link>
                <Link href="/security">Security</Link>
                <Link href="/support">Support</Link>
                <Link href="/privacy">Privacy</Link>
              </NavGroup>

              <Link href="/careers" className={`nav-link ${pathname === "/careers" ? "active" : ""}`}>
                Careers
              </Link>
            </nav>
          )}

          {/* Desktop/Mobile Toggles */}
          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>

            {isDesktop ? (
              <Link href="/contact" className="contact-btn">
                Contact Us
              </Link>
            ) : (
              <button
                type="button"
                className="menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>

          {/* Unique Progress Bar */}
          <motion.div className="scroll-progress-bar" style={{ scaleX }} />
        </div>

        {/* Mobile Flyout Menu */}
        <AnimatePresence>
          {mobileMenuOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mobile-nav glass"
            >
              <div className="mobile-nav-content">
                <MobileNavGroup
                  label="Our Offerings"
                  isOpen={expandedGroup === "offerings"}
                  onToggle={() => toggleGroup("offerings")}
                >
                  <Link href="/services/web-development">Web Development</Link>
                  <Link href="/services/mobile-app-development">Mobile App Development</Link>
                  <Link href="/services/ai-automation">AI & Automation</Link>
                  <Link href="/services/ui-ux-design">UI/UX Design</Link>
                  <Link href="/services/software-development">Software Development</Link>
                  <Link href="/services/cloud-services">Cloud Services</Link>
                  <Link href="/services/it-consulting">IT Consulting</Link>
                  <Link href="/services/it-support-maintenance">IT Support & Maintenance</Link>
                  <Link href="/services/digital-marketing">Digital Marketing</Link>
                  <Link href="/services/startup-mentorship">Startup Mentorship</Link>
                </MobileNavGroup>

                <MobileNavGroup
                  label="Products"
                  isOpen={expandedGroup === "products"}
                  onToggle={() => toggleGroup("products")}
                >
                  <Link href="/products/kalesh">Kalesh</Link>
                  <Link href="/products/karyon">KaryON</Link>
                  <Link href="/products/stylon">Stylon</Link>
                  <Link href="/products/axiscon">Axis Conference Web</Link>
                </MobileNavGroup>

                <MobileNavGroup
                  label="Insights"
                  isOpen={expandedGroup === "insights"}
                  onToggle={() => toggleGroup("insights")}
                >
                  <Link href="/insights">Insights Home</Link>
                  <Link href="/newsletter">Newsletter</Link>
                  <Link href="/events">Events</Link>
                  <Link href="/sitemap">Sitemap</Link>
                </MobileNavGroup>

                <MobileNavGroup
                  label="Who We Are"
                  isOpen={expandedGroup === "about"}
                  onToggle={() => toggleGroup("about")}
                >
                  <Link href="/about">About Us</Link>
                  <Link href="/team-leadership">Team & Leadership</Link>
                  <Link href="/security">Security</Link>
                  <Link href="/support">Support</Link>
                  <Link href="/privacy">Privacy</Link>
                </MobileNavGroup>

                <Link href="/careers" className="mobile-link">Careers</Link>
                <Link href="/contact" className="mobile-contact-btn">
                  Contact Us <MessageSquare size={18} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function NavGroup({ label, href, active, isOpen, onToggle, children }: any) {
  return (
    <div className="nav-group">
      <Link href={href} className={`nav-link ${active ? "active" : ""}`}>
        {label} <ChevronDown size={14} className="chevron" />
      </Link>
      <div className="dropdown glass">
        <div className="dropdown-grid">
          {children}
        </div>
      </div>
    </div>
  );
}

function MobileNavGroup({ label, isOpen, onToggle, children }: any) {
  return (
    <div className={`mobile-group ${isOpen ? "open" : ""}`}>
      <button className="mobile-group-btn" onClick={onToggle}>
        {label} <ChevronDown size={18} className="chevron" />
      </button>
      <div className="mobile-group-content">
        {children}
      </div>
    </div>
  );
}

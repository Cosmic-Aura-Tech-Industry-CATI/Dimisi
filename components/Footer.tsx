"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ChevronDown
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaYoutube
} from "react-icons/fa6";
import "./Footer.css";

const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [openMainSection, setOpenMainSection] = useState<string | null>(null);
  const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>({});

  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const toggleMainSection = (id: string) => {
    if (!isMobile) return;
    setOpenMainSection(openMainSection === id ? null : id);
  };

  const toggleSubSection = (id: string) => {
    setOpenSubSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToTop = () => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


  const Accordion = ({
    id,
    title,
    children,
    isNested = false,
    isAlwaysToggle = false
  }: {
    id: string,
    title: string,
    children: ReactNode,
    isNested?: boolean,
    isAlwaysToggle?: boolean
  }) => {
    const isOpen = isAlwaysToggle
      ? !!openSubSections[id]
      : (!isMobile || openMainSection === id);

    const showChevron = isAlwaysToggle || isMobile;

    return (
      <div className={`${isNested ? 'footer-v2-sub-col' : 'footer-v2-col'} ${isOpen ? 'is-open' : ''}`}>
        <button
          className="footer-v2-header"
          onClick={() => isAlwaysToggle ? toggleSubSection(id) : toggleMainSection(id)}
          disabled={!showChevron}
          aria-expanded={isOpen}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
        >
          <h3 className={isNested ? "nested-title" : "footer-v2-title"}>{title}</h3>
          {showChevron && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={isNested ? 14 : 18} className="mobile-chevron" />
            </motion.div>
          )}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="footer-v2-content-wrapper"
            >
              <div className="footer-v2-content">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <footer className="footer-v2">
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.9 }}
            className="scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>


      <div className="footer-v2-container">
        <div className="footer-v2-grid">

          {/* Section 1: Our Offerings */}
          <Accordion id="offerings" title="Our Offerings">
            <div className="category-group">
              <span className="category-label">Services</span>
              <ul className="nested-list">
                <li><Link href="/services/web-development">Web Development</Link></li>
                <li><Link href="/services/mobile-app-development">Mobile App Development</Link></li>
                <li><Link href="/services/ai-automation">AI & Automation</Link></li>
                <li><Link href="/services/ui-ux-design">UI/UX Design</Link></li>
                <li><Link href="/services/software-development">Software Development</Link></li>
                <li><Link href="/services/cloud-services">Cloud Services</Link></li>
                <li><Link href="/services/it-consulting">IT Consulting</Link></li>
                <li><Link href="/services/it-support-maintenance">IT Support & Maintenance</Link></li>
                <li><Link href="/services/digital-marketing">Digital Marketing & ITES</Link></li>
                <li><Link href="/services/startup-mentorship">Startup Mentorship</Link></li>
              </ul>
            </div>
          </Accordion>

          {/* Section 2: Products */}
          <Accordion id="products" title="Products">
            <div className="category-group">
              <span className="category-label">Platforms</span>
              <ul className="nested-list">
                <li><Link href="/products/kalesh">Kalesh</Link></li>
                <li><Link href="/products/karyon">KaryON</Link></li>
                <li><Link href="/products/stylon">Stylon</Link></li>
                <li><Link href="/products/axiscon">Axis Conference Web</Link></li>
              </ul>
            </div>
            <Link href="/contact" className="main-link">Contact Sales</Link>
            <Link href="/about" className="main-link">Partner Program</Link>
          </Accordion>

          {/* Section 3: Ecosystem */}
          <Accordion id="ecosystem" title="Ecosystem">
            <div className="ecosystem-section">
              <span className="section-label">Who We Are</span>
              <div className="link-stack">
                <Link href="/about">About Us</Link>
                <Link href="/team-leadership">Team & Leadership</Link>
                <Link href="/security">Security & Trust</Link>
                <Link href="/privacy">Privacy Center</Link>
                <Link href="/support">Support Hub</Link>
              </div>
            </div>
            <div className="ecosystem-section mt-8">
              <span className="section-label">Resources</span>
              <div className="link-stack">
                <Link href="/insights">Trends and Insights</Link>
                <Link href="/newsletter">Newsletter</Link>
                <Link href="/events">Events and Webinars</Link>
              </div>
            </div>
          </Accordion>

          {/* Section 4: Careers */}
          <Accordion id="careers" title="Careers">
            <div className="link-stack mb-6">
              <Link href="/careers">Careers Overview</Link>
              <Link href="/careers">Meet our people</Link>
              <Link href="/careers">Job Opportunities</Link>
            </div>
          </Accordion>

        </div>

        <div className="footer-v2-divider" />

        <div className="footer-v2-bottom">
          <div className="bottom-left">
            <div className="social-links">
              <a href="#" className="social-icon instagram" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-icon x" aria-label="X"><FaXTwitter /></a>
              <a href="#" className="social-icon facebook" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className="social-icon youtube" aria-label="YouTube"><FaYoutube /></a>
            </div>

          </div>
          <p className="copyright-text">© 2026 DIMISI Technologies Pvt. Ltd.</p>
          <div className="legal-links">
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/cookies">Cookies Policy</Link>
            <Link href="/sitemap">Sitemap</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



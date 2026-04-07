"use client";

import Link from "next/link";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        
        {/* Services */}
        <section className="footer-col">
          <h3>Our Offerings</h3>
          <p className="footer-subheading">Services</p>

          <Link href="/services">Services Overview</Link>
          <Link href="/services/web-development">Web Development</Link>
          <Link href="/services/mobile-app-development">Mobile App Development</Link>
          <Link href="/services/ai-automation">AI & Automation</Link>
          <Link href="/services/ui-ux-design">UI/UX Design</Link>
          <Link href="/services/software-development">Software Development</Link>
          <Link href="/services/cloud-services">Cloud Services</Link>
          <Link href="/services/it-consulting">IT Consulting</Link>
          <Link href="/services/it-support-maintenance">IT Support & Maintenance</Link>
          <Link href="/services/digital-marketing">Digital Marketing & IT Enabled Services</Link>
          <Link href="/services/startup-mentorship">Startup Mentorship</Link>
        </section>

        {/* Industries */}
        <section className="footer-col">
          <h3>Industries</h3>
          <Link href="/industries/kalesh">Kalesh</Link>
          <Link href="/industries/karyon">KaryON</Link>
          <Link href="/industries/stylon">Stylon</Link>
          <Link href="/industries/axiscon">Axis Conference Web</Link>
        </section>

        {/* Ecosystem */}
        <section className="footer-col">
          <h3>Ecosystem</h3>
          <p className="footer-subheading">Who We Are</p>
          <Link href="/about">About Us</Link>
          <Link href="/team-leadership">Team & Leadership</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/security">Security and Trust</Link>
        </section>

        {/* Resources */}
        <section className="footer-col">
          <h3>Resources</h3>
          <Link href="/insights">Trends and Insights</Link>
          <Link href="/newsroom">Newsroom</Link>
          <Link href="/events">Events and Webinars</Link>
          <Link href="/support">Support</Link>
          <Link href="/sitemap">Sitemap</Link>
        </section>

        {/* Contact */}
        <section className="footer-col">
          <h3>Contact</h3>
          <Link href="/contact">Contact Form</Link>
          <a href="mailto:dimisi@gmail.com">dimisi@gmail.com</a>
          <a href="tel:+918545099251">+91 85450 99251</a>
          <Link href="/careers">Career Enquiries</Link>
        </section>

      </div>

      <div className="footer-divider" role="presentation" />

      {/* Middle Section */}
      <div className="footer-mid">
        <div className="logo-strip" aria-label="Partner logos">
          <div className="logo-placeholder">Partner Logo</div>
          <div className="logo-placeholder">Partner Logo</div>
          <div className="logo-placeholder">Partner Logo</div>
        </div>

        <div className="footer-socials" aria-label="Social links">
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="X">x</a>
          <a href="#" aria-label="YouTube">yt</a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>Copyright (c) 2026 DIMISI TECHNOLOGY PRIVATE LIMITED</p>

        <div className="footer-links">
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/sitemap">Sitemap</Link>
          <Link href="/about">About</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from "react";
import { SplitText } from "@/components/common/SplitText/SplitText";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { RotatingWord } from "@/components/common/RotatingWord/RotatingWord";
import { TechIcon } from "@/components/common/TechIcon/TechIcon";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";
import { StoryVideo } from "@/components/media/StoryVideo/StoryVideo";

// Dynamic Live Showcase Sections (connected to Admin Panel & Backend APIs):
import { ServicesForward } from "@/components/home/ServicesForward/ServicesForward";
import { ProjectsShowcase } from "@/components/home/ProjectsShowcase/ProjectsShowcase";
import { SelectedCaseStudies } from "@/components/home/SelectedCaseStudies/SelectedCaseStudies";
import { WhyChooseUs } from "@/components/home/WhyChooseUs/WhyChooseUs";
import { CompanyHighlights } from "@/components/home/CompanyHighlights/CompanyHighlights";
import { HomeEventsGallery } from "@/components/home/HomeEventsGallery/HomeEventsGallery";
import { LiveReviewsMotion } from "@/components/home/LiveReviewsMotion/LiveReviewsMotion";

import { COMPANY } from "@/constants/site";
import { TECHNOLOGIES } from "@/data/home";
import styles from "./Home.module.css";

const HERO_ROTATING_WORDS = [
  "Intelligent",
  "Scalable",
  "Brilliant",
  "Autonomous",
  "Resilient",
  "Next-Gen",
];

// ============================================================================
// PUBLIC HOME PAGE ROUTE COMPONENT
// STRUCTURE & NARRATIVE ORDER:
// 1. Hero Section: SplitText + Rotating Word + Brand Film Modal + Mission statement.
// 2. Tech Marquee: Infinite 360° scroll showing supported core technologies.
// 3. Dynamic Services: Live capabilities & categories synchronized from Admin Panel.
// 4. Products & Work: Unified showcase featuring In-house Platform (Kalesh) and
//    live client production case studies managed in Admin Work.
// 5. Engineering Culture: Why Choose Us (7 pillars) & Company Highlights.
// 6. Events & Moments: Dynamic events hub and visual gallery from Admin Events.
// 7. Live Verified Reviews: Real-time dual-row customer & staff feed from Admin Reviews.
// 8. Bottom Conversion CTA: Direct contact trigger.
// ============================================================================
export function Home() {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* 0. BRAND FILM MODAL OVERLAY */}
      {storyOpen ? <StoryVideo onClose={() => setStoryOpen(false)} /> : null}

      {/* 1. HERO SECTION */}
      <section className={[styles.section, styles.hero].join(" ")}>
        <Reveal variant="fade">
          <p className={styles.badge}>Owl wisdom · DIMISI Technologies Pvt Ltd</p>
        </Reveal>
        <h1
          className={styles.heroTitle}
          aria-label="Engineering the Future of Intelligent Software"
        >
          <SplitText as="span" text="Engineering the Future of" />
          <span className={styles.heroAccent}>
            <RotatingWord words={HERO_ROTATING_WORDS} />
            <span> Software</span>
          </span>
        </h1>
        <Reveal variant="up" delay={220}>
          <p className={styles.heroSub}>{COMPANY.mission}</p>
        </Reveal>
        <Reveal variant="up" delay={320}>
          <div className={styles.heroActions}>
            <MagneticButton to="/contact">Talk to us</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => setStoryOpen(true)}>
              Watch our film
            </MagneticButton>
            <MagneticButton to="/products" variant="ghost">
              Meet Kalesh
            </MagneticButton>
          </div>
        </Reveal>
        <div className={styles.scrollCue}>
          <span className={styles.cueLine} aria-hidden="true" />
          Scroll to move the camera
        </div>
      </section>

      {/* 2. TECH MARQUEE STRIP */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {[...TECHNOLOGIES, ...TECHNOLOGIES].map((t, i) => (
            <div className={styles.techItem} key={`${t}-${i}`}>
              <TechIcon name={t} className={styles.techIcon} />
              <span className={styles.techName}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DYNAMIC SERVICES & DISCIPLINES (LIVE FROM ADMIN SERVICES API) */}
      <ScrollScene variant="lift">
        <ServicesForward />
      </ScrollScene>

      {/* 4. OUR PRODUCTS & OUR WORK (IN-HOUSE PRODUCTS + LIVE CLIENT CASE STUDIES) */}
      {/* 4A: Proprietary Flagship Product (Kalesh Sphere) */}
      <ScrollScene variant="center">
        <ProjectsShowcase />
      </ScrollScene>

      {/* 4B: Live Production Client Case Studies (Dynamic from Admin Work / Casestudies) */}
      <ScrollScene variant="lift">
        <SelectedCaseStudies />
      </ScrollScene>

      {/* 5. WHY CHOOSE US — 7 ENGINEERING COMMITMENTS */}
      <ScrollScene variant="top">
        <WhyChooseUs />
      </ScrollScene>

      {/* 6. COMPANY SCALE & HIGHLIGHTS AT A GLANCE */}
      <ScrollScene variant="right">
        <CompanyHighlights />
      </ScrollScene>

      {/* 7. EVENTS & MOMENTS GALLERY (LIVE FROM ADMIN EVENTS API) */}
      <ScrollScene variant="lift">
        <HomeEventsGallery />
      </ScrollScene>

      {/* 8. LIVE VERIFIED REVIEWS FEED (LIVE FROM ADMIN REVIEWS API) */}
      <ScrollScene variant="right">
        <LiveReviewsMotion />
      </ScrollScene>

      {/* 9. BOTTOM CONVERSION CTA */}
      <ScrollScene variant="center">
        <section className={styles.section}>
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Let's build something that thinks</h2>
            <p className={styles.ctaText}>
              Tell us the problem. We'll come back with an architecture, a timeline and a number —
              usually within forty-eight hours.
            </p>
            <MagneticButton to="/contact">Talk to DIMISI Technologies</MagneticButton>
          </div>
        </section>
      </ScrollScene>
    </div>
  );
}

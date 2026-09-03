import { useState } from "react";
import { SplitText } from "@/components/common/SplitText/SplitText";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { RotatingWord } from "@/components/common/RotatingWord/RotatingWord";
import { TechIcon } from "@/components/common/TechIcon/TechIcon";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";
import { StoryVideo } from "@/components/media/StoryVideo/StoryVideo";
import { ProjectsShowcase } from "@/components/home/ProjectsShowcase/ProjectsShowcase";
import { ServicesForward } from "@/components/home/ServicesForward/ServicesForward";
import { CompanyHighlights } from "@/components/home/CompanyHighlights/CompanyHighlights";
import { WhyChooseUs } from "@/components/home/WhyChooseUs/WhyChooseUs";
import { SelectedCaseStudies } from "@/components/home/SelectedCaseStudies/SelectedCaseStudies";
import { HomeEventsGallery } from "@/components/home/HomeEventsGallery/HomeEventsGallery";
import { LiveReviewsMotion } from "@/components/home/LiveReviewsMotion/LiveReviewsMotion";
import { useCountUp } from "@/hooks/useCountUp";
import { COMPANY } from "@/constants/site";

const HERO_ROTATING_WORDS = [
  "Intelligent",
  "Scalable",
  "Brilliant",
  "Autonomous",
  "Resilient",
  "Next-Gen",
];
import {
  CASE_STUDIES,
  FAQS,
  FEATURES,
  PARTNERS,
  PROCESS,
  STATS,
  TECHNOLOGIES,
} from "@/data/home";
import { SERVICES } from "@/data/services";
import styles from "./Home.module.css";

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: shown } = useCountUp(value);
  return (
    <div className={styles.stat}>
      <span className={styles.statValue} ref={ref}>
        {shown}
        {suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={[styles.faqItem, open ? styles.open : ""].join(" ")}>
      <button
        type="button"
        className={styles.faqBtn}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {q}
        <span className={styles.plus} aria-hidden="true">
          +
        </span>
      </button>
      <div className={styles.answer}>
        <p className={styles.answerText}>{a}</p>
      </div>
    </div>
  );
}

export function Home() {
  const [storyOpen, setStoryOpen] = useState(false);
  return (
    <div className={styles.page}>
      {storyOpen ? <StoryVideo onClose={() => setStoryOpen(false)} /> : null}
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

      <ScrollScene variant="center">
        <ProjectsShowcase />
      </ScrollScene>

      <ScrollScene variant="lift">
        <ServicesForward />
      </ScrollScene>

      <ScrollScene variant="top">
        <WhyChooseUs />
      </ScrollScene>

      <ScrollScene variant="right">
        <CompanyHighlights />
      </ScrollScene>

      <ScrollScene variant="lift">
        <SelectedCaseStudies />
      </ScrollScene>

      <ScrollScene variant="lift">
        <HomeEventsGallery />
      </ScrollScene>

      <ScrollScene variant="right">
        <LiveReviewsMotion />
      </ScrollScene>

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

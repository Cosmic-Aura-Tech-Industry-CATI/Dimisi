import { useState, lazy, Suspense } from "react";
import {
  Code2,
  Smartphone,
  Cloud,
  Megaphone,
  Compass,
  Play,
  ArrowRight,
} from "lucide-react";
import { SplitText } from "@/components/common/SplitText/SplitText";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { RotatingWord } from "@/components/common/RotatingWord/RotatingWord";
import { TechIcon } from "@/components/common/TechIcon/TechIcon";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";

// Critical First-Paint Viewport Components (Eager):
import { HeroCyberGlobe } from "@/components/home/HeroCyberGlobe/HeroCyberGlobe";
import { TrustedEcosystem } from "@/components/home/TrustedEcosystem/TrustedEcosystem";
import { HomeStartupRecognitions } from "@/components/home/HomeStartupRecognitions/HomeStartupRecognitions";
import { useHomeHeroConfig } from "@/hooks/useHomeHeroConfig";
import { DEFAULT_HOME_HERO_CONFIG } from "@/types/homeHero.types";

import { TECHNOLOGIES } from "@/data/home";
import styles from "./Home.module.css";

// Deferred Below-The-Fold Showcase Sections (Code-Split for Fast Mobile & Low-Data Speeds):
const KaleshProductShowcase = lazy(() =>
  import("@/components/home/KaleshProductShowcase/KaleshProductShowcase").then((m) => ({ default: m.KaleshProductShowcase }))
);
const ServicesForward = lazy(() =>
  import("@/components/home/ServicesForward/ServicesForward").then((m) => ({ default: m.ServicesForward }))
);
const SelectedCaseStudies = lazy(() =>
  import("@/components/home/SelectedCaseStudies/SelectedCaseStudies").then((m) => ({ default: m.SelectedCaseStudies }))
);
const WhyChooseUs = lazy(() =>
  import("@/components/home/WhyChooseUs/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs }))
);
const CompanyHighlights = lazy(() =>
  import("@/components/home/CompanyHighlights/CompanyHighlights").then((m) => ({ default: m.CompanyHighlights }))
);
const HomeEventsGallery = lazy(() =>
  import("@/components/home/HomeEventsGallery/HomeEventsGallery").then((m) => ({ default: m.HomeEventsGallery }))
);
const LiveReviewsMotion = lazy(() =>
  import("@/components/home/LiveReviewsMotion/LiveReviewsMotion").then((m) => ({ default: m.LiveReviewsMotion }))
);
const StoryVideo = lazy(() =>
  import("@/components/media/StoryVideo/StoryVideo").then((m) => ({ default: m.StoryVideo }))
);

const SERVICE_ICONS = [Code2, Smartphone, Cloud, Megaphone, Compass];

export function Home() {
  const [storyOpen, setStoryOpen] = useState(false);
  const { config: heroConfig } = useHomeHeroConfig();

  return (
    <div className={styles.page}>
      {/* 0. BRAND FILM MODAL OVERLAY */}
      {storyOpen ? <Suspense fallback={null}><StoryVideo onClose={() => setStoryOpen(false)} /></Suspense> : null}

      {/* 1. UPGRADED HERO SECTION */}
      <section id="hero" className={[styles.section, styles.hero].join(" ")}>
        {/* HERO MAIN SPLIT GRID */}
        <div className={styles.heroGrid}>
          {/* LEFT: BADGE, HEADLINE, DESCRIPTION, ACTION BUTTONS */}
          <div className={styles.heroContent}>
            <Reveal variant="fade">
              <p className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {heroConfig.badgeText && !heroConfig.badgeText.includes("Owl wisdom")
                  ? heroConfig.badgeText
                  : DEFAULT_HOME_HERO_CONFIG.badgeText}
              </p>
            </Reveal>

            <h1
              className={styles.heroTitle}
              aria-label="Engineering the Future of Resilient Software"
            >
              <SplitText as="span" text={heroConfig.headlinePrefix} />
              <span className={styles.heroAccent}>
                <RotatingWord words={heroConfig.rotatingWords} />
                <span>{heroConfig.headlineSuffix}</span>
              </span>
            </h1>

            <Reveal variant="up" delay={200}>
              <p className={styles.heroSub}>
                {heroConfig.missionStatement && !heroConfig.missionStatement.includes("product and services technology company")
                  ? heroConfig.missionStatement
                  : DEFAULT_HOME_HERO_CONFIG.missionStatement}
              </p>
            </Reveal>

            <Reveal variant="up" delay={300}>
              <div className={styles.heroActions}>
                <MagneticButton to={heroConfig.primaryBtnLink || "/contact"} className={styles.heroBtnTalk}>
                  <span className={styles.heroBtnContent}>
                    <span>{heroConfig.primaryBtnText}</span>
                    <ArrowRight size={15} className={styles.heroBtnIcon} aria-hidden="true" />
                  </span>
                </MagneticButton>
                <MagneticButton
                  variant="ghost"
                  onClick={() => setStoryOpen(true)}
                  className={styles.heroBtnFilm}
                >
                  <span className={styles.heroBtnContent}>
                    <Play
                      size={13}
                      fill="currentColor"
                      className={styles.heroBtnIcon}
                      aria-hidden="true"
                    />
                    <span>{heroConfig.secondaryBtnText}</span>
                  </span>
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: 3D CYBER SPHERE WITH FLOATING ORBIT CARDS */}
          <div className={styles.heroVisual}>
            <HeroCyberGlobe orbitCards={heroConfig.orbitCards} />
          </div>
        </div>

        {/* 2. 5-CARD CORE SERVICES QUICK STRIP */}
        <Reveal variant="up" delay={350} className={styles.fullWidthReveal}>
          <div className={styles.servicesQuickStrip}>
            {(heroConfig.services || DEFAULT_HOME_HERO_CONFIG.services).map((srv, idx) => {
              const Icon = SERVICE_ICONS[idx % SERVICE_ICONS.length] || Code2;
              return (
                <a
                  key={idx}
                  href={srv.link}
                  className={styles.serviceQuickCard}
                >
                  <div className={styles.serviceIconBox}>
                    <Icon size={19} />
                  </div>
                  <h3 className={styles.serviceQuickTitle}>{srv.title}</h3>
                  <p className={styles.serviceQuickDesc}>{srv.desc}</p>
                </a>
              );
            })}
          </div>
        </Reveal>

        {/* 3. PROOF METRICS BAR */}
        <Reveal variant="up" delay={420} className={styles.fullWidthReveal}>
          <div className={styles.proofBar}>
            {(heroConfig.metrics || DEFAULT_HOME_HERO_CONFIG.metrics).map((metric, idx) => (
              <div key={idx} className={styles.proofItem}>
                <span className={styles.proofNumber}>{metric.value}</span>
                <span className={styles.proofLabel}>{metric.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 4. OFFICIAL STARTUP ACCREDITATIONS & GLOBAL ECOSYSTEM (NVIDIA INCEPTION & STARTUP INDIA) */}
        <Reveal variant="up" delay={460} className={styles.fullWidthReveal}>
          <HomeStartupRecognitions />
        </Reveal>

        {/* 5. TRUSTED ECOSYSTEM PARTNER STRIP */}
        <Reveal variant="up" delay={500} className={styles.fullWidthReveal}>
          <TrustedEcosystem />
        </Reveal>

        {/* SCROLL INDICATOR CUE */}
        <div className={styles.scrollCue}>
          <span
            className={[styles.cueLine, styles.cueLineReverse].join(" ")}
            aria-hidden="true"
          />
          <span>Scroll to explore</span>
          <span className={styles.cueLine} aria-hidden="true" />
        </div>
      </section>

      {/* TECH MARQUEE STRIP */}
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

      {/* KALESH FLAGSHIP PRODUCT SHOWCASE */}
      <div id="product-kalesh">
        <ScrollScene variant="lift">
          <Suspense fallback={<div style={{ minHeight: "400px" }} />}>
            <KaleshProductShowcase />
          </Suspense>
        </ScrollScene>
      </div>

      {/* DYNAMIC SERVICES & DISCIPLINES */}
      <div id="services">
        <ScrollScene variant="lift">
          <Suspense fallback={<div style={{ minHeight: "260px" }} />}><ServicesForward /></Suspense>
        </ScrollScene>
      </div>

      {/* PRODUCTS & WORK */}
      <div id="products">
        <Suspense fallback={<div style={{ minHeight: "260px" }} />}><SelectedCaseStudies /></Suspense>
      </div>

      {/* WHY CHOOSE US & HIGHLIGHTS */}
      <div id="arsenal">
        <ScrollScene variant="top">
          <Suspense fallback={<div style={{ minHeight: "260px" }} />}><WhyChooseUs /></Suspense>
        </ScrollScene>

        <ScrollScene variant="right">
          <Suspense fallback={<div style={{ minHeight: "260px" }} />}><CompanyHighlights /></Suspense>
        </ScrollScene>
      </div>

      {/* EVENTS & MOMENTS GALLERY */}
      <ScrollScene variant="lift">
        <Suspense fallback={<div style={{ minHeight: "260px" }} />}><HomeEventsGallery /></Suspense>
      </ScrollScene>

      {/* LIVE VERIFIED REVIEWS FEED */}
      <div id="reviews">
        <ScrollScene variant="right">
          <Suspense fallback={<div style={{ minHeight: "260px" }} />}><LiveReviewsMotion /></Suspense>
        </ScrollScene>
      </div>

      {/* BOTTOM CONVERSION CTA */}
      <ScrollScene variant="center">
        <section className={styles.section}>
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Let's build something that thinks</h2>
            <p className={styles.ctaText}>
              Tell us the problem. We'll come back with an architecture, a timeline
              and a number — usually within forty-eight hours.
            </p>
            <MagneticButton to="/contact">Talk to DIMISI Technologies</MagneticButton>
          </div>
        </section>
      </ScrollScene>
    </div>
  );
}

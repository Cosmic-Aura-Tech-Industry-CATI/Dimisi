import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRight,
} from "lucide-react";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicWorkData } from "@/lib/work.functions";
import type { ProjectItem } from "@/lib/work.shared";
import styles from "./SelectedCaseStudies.module.css";

interface CaseStudyCardData {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  type: "work" | "product";
  overview: string;
  coverImage: string;
  websiteUrl?: string;
  isFeatured: boolean;
  metrics: { label: string; value: string }[];
  highlight: string;
  techStack: string[];
}

// Fallback high-fidelity case studies exactly matching design specifications
const SEEDED_SHOWCASE_PROJECTS: CaseStudyCardData[] = [
  {
    id: "seed-yaduvanshi",
    slug: "yaduvanshi-tours-travels",
    title: "Yaduvanshi Tours & Travels",
    tagline: "Our Packages, Car Rentals & Wedding Travel in One Place",
    category: "Software Development",
    type: "work",
    overview:
      "The website provides Yaduvanshi Tours & Travels with a central digital platform to showcase its services, present travel options, and connect prospective customers through inquiry channels.",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    websiteUrl: "https://yaduvanshitravels.com",
    isFeatured: true,
    metrics: [
      { label: "PERFORMANCE GAIN", value: "+120%" },
      { label: "LOAD LATENCY", value: "< 350ms" },
    ],
    highlight: "1000+ Customer reach figure displayed on the website.",
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    id: "seed-rudra",
    slug: "rudra-tours-travels",
    title: "Rudra Tours & Travels",
    tagline: "Travel Experiences Designed Around Your Journey",
    category: "Software Development",
    type: "work",
    overview:
      "The website provides Rudra Tours & Travels with a dedicated digital platform to showcase its offerings and connect with potential customers. It creates an accessible starting point for travelers.",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    websiteUrl: "https://rudratourtravels.com",
    isFeatured: true,
    metrics: [
      { label: "PERFORMANCE GAIN", value: "+130%" },
      { label: "LOAD LATENCY", value: "< 320ms" },
    ],
    highlight: "Full booking workflow integration with instant quote dispatch.",
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    id: "seed-kalesh",
    slug: "kalesh",
    title: "Kalesh",
    tagline: "The Unfiltered Social Sphere",
    category: "Social Platform",
    type: "product",
    overview:
      "Kalesh is being developed to offer a fresh approach to online social interaction. The upcoming platform empowers people to share honest feedback, participate in live polls, and express opinions freely.",
    coverImage: "/images/kalesh-logo.jpg",
    websiteUrl: "https://thekalesh.com",
    isFeatured: true,
    metrics: [
      { label: "UPTIME TARGET", value: "99.9%" },
      { label: "ENCRYPTION", value: "256-bit" },
    ],
    highlight: "Zero-knowledge anonymous hashing for fearless discourse.",
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    id: "seed-karyon",
    slug: "karyon",
    title: "Karyon",
    tagline: "On-Demand Home Services Ecosystem",
    category: "Web Application",
    type: "product",
    overview:
      "A home-services ecosystem for booking verified service professionals across electrical, plumbing, cleaning, painting, and maintenance with live progress tracking and dispatch.",
    coverImage:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    websiteUrl: "https://karyon.in",
    isFeatured: false,
    metrics: [
      { label: "DISPATCH TIME", value: "< 15m" },
      { label: "SATISFACTION", value: "99.4%" },
    ],
    highlight: "Instant verified pro matching with transparent upfront pricing.",
    techStack: ["Next.js", "TypeScript", "Redis", "Cloud"],
  },
];

export function SelectedCaseStudies() {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Live dynamic query synced with Express Backend APIs
  const { data: payload } = useQuery({
    queryKey: ["publicWork"],
    queryFn: () => getPublicWorkData(),
    staleTime: 1000 * 60 * 5,
  });

  // Extract raw projects or use seeds
  const rawProjects: CaseStudyCardData[] = useMemo(() => {
    const liveList = (payload?.projects || []).filter((p: ProjectItem) => p.is_active);

    if (liveList.length > 0) {
      return liveList.map((p: ProjectItem) => {
        const metrics =
          p.metrics && p.metrics.length >= 2
            ? p.metrics.slice(0, 2)
            : [
                { label: "PERFORMANCE GAIN", value: "+120%" },
                { label: "LOAD LATENCY", value: "< 350ms" },
              ];

        const highlight =
          p.outcome ||
          p.challenge ||
          p.solution ||
          "Engineered for high performance, modular architecture, and zero downtime.";

        return {
          id: p.id,
          slug: p.slug,
          title: p.client_name || p.title,
          tagline: p.tagline || p.outcome || "Production-grade digital architecture built to scale.",
          category: p.category || (p.type === "product" ? "Product Platform" : "Software Development"),
          type: p.type || "work",
          overview:
            p.overview ||
            p.solution ||
            "Production-grade engineering built for seamless user journeys, high performance, and enterprise scale.",
          coverImage:
            p.cover_image && !p.cover_image.includes("placeholder")
              ? p.cover_image
              : p.slug.includes("kalesh")
              ? "/images/kalesh-logo.jpg"
              : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          websiteUrl: p.website_url,
          isFeatured: p.is_featured,
          metrics,
          highlight,
          techStack:
            p.tech_stack && p.tech_stack.length > 0
              ? p.tech_stack.slice(0, 4)
              : ["React", "TypeScript", "Node.js", "PostgreSQL"],
        };
      });
    }

    return SEEDED_SHOWCASE_PROJECTS;
  }, [payload?.projects]);

  // Ensure cylinder has 8 slots for a smooth 45deg 3D ring
  const ringProjects = useMemo(() => {
    if (rawProjects.length >= 8) return rawProjects.slice(0, 8);
    if (rawProjects.length === 0) return [];
    const duplicated: CaseStudyCardData[] = [];
    while (duplicated.length < 8) {
      duplicated.push(...rawProjects);
    }
    return duplicated.slice(0, 8);
  }, [rawProjects]);

  const totalCards = ringProjects.length;
  const angleStep = 360 / Math.max(totalCards, 8);

  // Smooth lerp angle state
  const [displayAngle, setDisplayAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cylinderRadius, setCylinderRadius] = useState(580);
  const [isMobile, setIsMobile] = useState(false);

  // Animation & Physics Refs
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const scrollAngleRef = useRef(0);
  const manualOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  // Resize listener for responsive 3D radius (grand on TV/Laptop, proportional on Mobile)
  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 768);

      if (w < 480) {
        setCylinderRadius(300);
      } else if (w < 768) {
        setCylinderRadius(330);
      } else if (w < 1024) {
        setCylinderRadius(390);
      } else if (w < 1440) {
        // Standard laptops
        setCylinderRadius(h < 750 ? 430 : 480);
      } else {
        // Large displays, 40-inch TV/Monitor, 1440p, 4K
        setCylinderRadius(520);
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius, { passive: true });
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Update active index based on rotation angle
  useEffect(() => {
    const norm = ((-displayAngle % 360) + 360) % 360;
    const closest = Math.round(norm / angleStep) % totalCards;
    setActiveIndex(closest % rawProjects.length);
  }, [displayAngle, angleStep, totalCards, rawProjects.length]);

  // 1. PINNED SCROLL: Maps scroll progress through 320vh into controlled, smooth rotation
  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (!pinWrapperRef.current) return;
      const rect = pinWrapperRef.current.getBoundingClientRect();
      const maxScroll = pinWrapperRef.current.offsetHeight - window.innerHeight;

      if (maxScroll > 0) {
        lastScrollTimeRef.current = performance.now();
        const currentScroll = -rect.top;
        const progress = Math.min(Math.max(currentScroll / maxScroll, 0), 1);
        // Complete full 360 degree rotation smoothly over the pinned scroll runway
        scrollAngleRef.current = -progress * 360;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(() => {
          handleScroll();
          rafId = 0;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 2. ULTRA-SMOOTH EXPONENTIAL DAMPING & IDLE AUTO-ROTATION LOOP (WITH VIEWPORT SLEEP GUARD)
  useEffect(() => {
    let animId = 0;
    let lastTime = performance.now();
    let isVisible = false;

    const loop = (now: number) => {
      if (!isVisible || document.hidden) {
        animId = 0;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Auto-rotation only engages when user is truly idle:
      // Not dragging, not hovering, and hasn't scrolled in the last 900ms
      const isIdle =
        !isDraggingRef.current &&
        !isHoveredRef.current &&
        now - lastScrollTimeRef.current > 900;

      if (isIdle) {
        // Very gentle, elegant auto-drift (1.8 deg/sec)
        manualOffsetRef.current -= 1.8 * dt;
      }

      if (!isDraggingRef.current) {
        // Target angle is cleanly composed of scroll angle + user offset
        const targetAngle = scrollAngleRef.current + manualOffsetRef.current;
        // Frame-rate independent exponential lerp for buttery smooth glide
        const lerpFactor = 1 - Math.exp(-8.5 * dt);
        currentAngleRef.current += (targetAngle - currentAngleRef.current) * lerpFactor;
      } else {
        currentAngleRef.current = targetAngleRef.current;
      }

      setDisplayAngle(currentAngleRef.current);
      animId = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (!animId) {
        lastTime = performance.now();
        animId = window.requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      if (animId) {
        window.cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && pinWrapperRef.current) {
      io = new IntersectionObserver(
        ([entry]) => {
          isVisible = Boolean(entry?.isIntersecting);
          if (isVisible && !document.hidden) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { rootMargin: "200px" }
      );
      io.observe(pinWrapperRef.current);
    } else {
      isVisible = true;
      startLoop();
    }

    const onVis = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isVisible) {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopLoop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Pointer drag to spin cylinder
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startAngleRef.current = currentAngleRef.current;
    if (stageRef.current) {
      stageRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const sensitivity = 0.32;
    const newAngle = startAngleRef.current + deltaX * sensitivity;
    manualOffsetRef.current = newAngle - scrollAngleRef.current;
    targetAngleRef.current = newAngle;
    currentAngleRef.current = newAngle;
    setDisplayAngle(newAngle);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    if (stageRef.current) {
      try {
        stageRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  // Wheel interaction over cylinder
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      const delta = e.deltaX * 0.2;
      manualOffsetRef.current -= delta;
    }
  };

  // Step rotation controls
  const rotateToCard = useCallback(
    (cardIndex: number) => {
      const target = -cardIndex * angleStep;
      manualOffsetRef.current = target - scrollAngleRef.current;
    },
    [angleStep]
  );

  const handlePrev = () => {
    manualOffsetRef.current += angleStep;
  };

  const handleNext = () => {
    manualOffsetRef.current -= angleStep;
  };

  return (
    <div
      ref={pinWrapperRef}
      className={styles.pinWrapper}
      id="case-studies"
      aria-label="Selected Case Studies & Our Work"
    >
      <div className={styles.stickyContent}>
        <div className={styles.ambientGlowTop} aria-hidden="true" />

        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badgeWrap}>
            <span className={styles.pulseDot} aria-hidden="true" />
            <span className={styles.badgeText}>03 · Our Work &amp; Case Studies</span>
          </div>

          <h2 className={styles.title}>
            Engineering Impact Across{" "}
            <span className={styles.gradientTitle}>Production Platforms</span>
          </h2>

          <p className={styles.subtitle}>
            Real products shipped, scaled, and monitored by DIMISI Technologies — designed for
            frictionless user journeys, high performance, and enterprise reliability.
          </p>
        </div>

        {/* 3D CYLINDRICAL ROTATING CAROUSEL */}
        <div
          ref={stageRef}
          className={styles.carouselStage}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
          }}
        >
          {/* Cylinder Track positioned at z = -cylinderRadius so front card is at z = 0 */}
          <div
            className={styles.cylinderTrack}
            style={{
              transform: `translateZ(-${cylinderRadius}px) rotateY(${displayAngle}deg)`,
            }}
          >
            {ringProjects.map((project, i) => {
              const cardBaseAngle = i * angleStep;
              // Angle relative to camera front
              const relativeAngle =
                ((((cardBaseAngle + displayAngle + 180) % 360) + 360) % 360) - 180;
              const absAngle = Math.abs(relativeAngle);

              // Hide back-facing cards (> 100 deg)
              const isVisible = absAngle <= 98;
              const isCenter = absAngle < 22;

              // On mobile, fade out and scale down side cards so the active card is 100% visible and uncluttered
              const opacity = isVisible
                ? isCenter
                  ? 1
                  : isMobile
                  ? Math.max(0.18, 0.42 - (absAngle / 90) * 0.3)
                  : Math.max(0.48, 0.95 - (absAngle / 90) * 0.52)
                : 0;

              const scale = isCenter ? 1 : isMobile ? 0.86 : 0.94;
              const blur = !isCenter && isMobile ? "blur(1.5px)" : "none";
              const zIndex = isCenter ? 12 : Math.max(1, 6 - Math.round(absAngle / 25));

              return (
                <article
                  key={`${project.id}-${i}`}
                  className={`${styles.cylinderCard} ${
                    isCenter ? styles.cylinderCardActive : ""
                  }`}
                  style={{
                    transform: `rotateY(${cardBaseAngle}deg) translateZ(${cylinderRadius}px) scale(${scale})`,
                    opacity,
                    filter: blur,
                    zIndex,
                    visibility: isVisible ? "visible" : "hidden",
                    pointerEvents: isCenter ? "auto" : isVisible ? "auto" : "none",
                    cursor: isCenter ? "default" : "pointer",
                  }}
                  onClick={() => !isCenter && rotateToCard(i)}
                >
                  <div className={styles.cardGlowOverlay} aria-hidden="true" />

                  {/* Card Cover Hero Area */}
                  <div className={styles.cardHeroArea}>
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className={styles.coverImage}
                      loading="lazy"
                    />
                    <div className={styles.imageGradientFade} aria-hidden="true" />

                    {/* Top Badges */}
                    <div className={styles.cardTopBadges}>
                      {project.isFeatured && (
                        <span className={styles.featuredBadge}>★ FEATURED</span>
                      )}
                      <span className={styles.typeBadge}>
                        {project.type === "product" ? "PRODUCT" : "OUR WORK"}
                      </span>
                      <span className={styles.categoryPill}>{project.category}</span>

                      {project.websiteUrl && (
                        <a
                          href={project.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.liveBadge}
                          title={`Open ${project.title} live website`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Live</span>
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>

                    <span className={styles.itemCounter}>
                      #{String((i % rawProjects.length) + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.cardTitle}>
                        <Link
                          to="/work/$slug"
                          params={{ slug: project.slug }}
                          className={styles.titleLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{project.title}</span>
                          <ExternalLink size={12} />
                        </Link>
                      </h3>
                    </div>

                    <p className={styles.cardTagline}>{project.tagline}</p>
                    {project.overview && project.overview !== project.highlight && (
                      <p className={styles.cardOverview}>{project.overview}</p>
                    )}

                    {/* Metrics Grid */}
                    <div className={styles.metricsGrid}>
                      {project.metrics.map((m, mIdx) => (
                        <div key={mIdx} className={styles.metricCol}>
                          <span className={styles.metricValue}>{m.value}</span>
                          <span className={styles.metricLabel}>{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Callout Highlight */}
                    <div className={styles.calloutBar}>
                      <Zap size={11} className={styles.calloutIcon} />
                      <span>{project.highlight}</span>
                    </div>

                    {/* Tech Stack */}
                    <div className={styles.techTagsRow}>
                      {project.techStack.map((tech, tIdx) => (
                        <span key={tIdx} className={styles.techTag}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Card Actions Footer */}
                    <div className={styles.cardBottomActions}>
                      <Link
                        to="/work/$slug"
                        params={{ slug: project.slug }}
                        className={styles.readStudyLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Read Case Study</span>
                        <ArrowRight size={11} />
                      </Link>

                      {project.websiteUrl ? (
                        <a
                          href={project.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.visitWebLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Visit Website</span>
                          <ArrowRight size={11} />
                        </a>
                      ) : (
                        <Link
                          to="/work/$slug"
                          params={{ slug: project.slug }}
                          className={styles.visitWebLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Explore Project</span>
                          <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ---------------- Bottom Area (Controls & Actions) ---------------- */}
        <div className={styles.bottomArea}>
          <div className={styles.hintPill}>
            <span className={styles.hintArrow}>↔</span>
            <span>Drag horizontally or scroll to spin cylinder</span>
          </div>

          <div className={styles.navArrowsRow}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handlePrev}
              aria-label="Previous Project"
              title="Previous Project"
            >
              <ChevronLeft size={16} />
            </button>

            <div className={styles.dotsRow}>
              {rawProjects.map((_, dIdx) => (
                <button
                  key={dIdx}
                  type="button"
                  className={`${styles.dotIndicator} ${
                    dIdx === activeIndex ? styles.dotIndicatorActive : ""
                  }`}
                  onClick={() => rotateToCard(dIdx)}
                  aria-label={`Jump to project #${dIdx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handleNext}
              aria-label="Next Project"
              title="Next Project"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.actionRow}>
            <MagneticButton to="/work">Explore All Work &amp; Case Studies</MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Discuss Your Project
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SelectedCaseStudies;

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Layers,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { getPublicServicesData } from "@/lib/services.functions";
import type { CompanyService } from "@/lib/services.shared";
import styles from "./ServicesForward.module.css";

interface ProcessedService extends CompanyService {
  displayNumber: string;
  badgeLabel: string;
  fourFeatures: string[];
}

export function ServicesForward() {
  // Live dynamic services query from backend API
  const { data: payload, isLoading, isError, refetch } = useQuery({
    queryKey: ["publicServices"],
    queryFn: () => getPublicServicesData(),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Responsive window resize with debounced cleaner function
  useEffect(() => {
    if (typeof window === "undefined") return;
    setWindowWidth(window.innerWidth);

    let resizeTimer: number | undefined;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 120);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Viewport intersection observer to pause auto-play when offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? true);
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filter and prioritize top services: Featured first, then orderIndex
  const servicesList: ProcessedService[] = useMemo(() => {
    const raw = payload?.services?.filter((s) => s.is_active !== false) || [];
    if (raw.length === 0) return [];

    const featured = raw.filter((s) => s.is_featured);
    const nonFeatured = raw.filter((s) => !s.is_featured);

    // Place featured services first, then remaining sorted by order_index
    const sorted = [...featured, ...nonFeatured];

    // Show up to 8 top services in the cylindrical stage
    const top = sorted.slice(0, 8);

    return top.map((srv, idx) => {
      const catName =
        typeof srv.category === "string"
          ? srv.category
          : (srv.category as any)?.name || "Technology";

      // 4 Clean bullet points from live features or highlights
      const liveFeatures =
        Array.isArray(srv.features) && srv.features.length > 0
          ? srv.features.filter(Boolean).slice(0, 4)
          : [
              srv.what_is_it ? srv.what_is_it.slice(0, 32) : "Custom Solution Architecture",
              srv.who_is_for ? srv.who_is_for.slice(0, 32) : "High-Performance Workflows",
              srv.problem_solved ? srv.problem_solved.slice(0, 32) : "Enterprise Security & SLA",
              srv.why_it_matters ? srv.why_it_matters.slice(0, 32) : "Continuous Scalability",
            ];

      return {
        ...srv,
        displayNumber: String(idx + 1).padStart(2, "0"),
        badgeLabel: srv.is_featured ? "FEATURED" : catName.toUpperCase(),
        fourFeatures: liveFeatures,
      };
    });
  }, [payload?.services]);

  const total = servicesList.length;

  // Auto-play interval with cleaner function (pauses when offscreen or user hovered)
  useEffect(() => {
    if (!isInView || isPaused || total <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5500);

    return () => {
      clearInterval(timer);
    };
  }, [isInView, isPaused, total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    setIsPaused(false);

    if (Math.abs(diff) > 40) {
      if (diff > 0) handlePrev();
      else handleNext();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  // Calculate 3D cylindrical transform for each card
  const getCardStyle = (index: number) => {
    if (total === 0) return {};

    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1100;

    const spacing = isMobile ? 210 : isTablet ? 260 : 310;
    const zDepth = isMobile ? 75 : isTablet ? 110 : 140;
    const rotateAngle = isMobile ? 18 : 24;

    const translateX = offset * spacing;
    const translateZ = -absOffset * zDepth;
    const rotateY = offset * -rotateAngle;
    const scale = offset === 0 ? (isMobile ? 1.02 : 1.06) : Math.max(0.72, 1 - absOffset * 0.14);
    const opacity = offset === 0 ? 1 : Math.max(0.22, 1 - absOffset * 0.28);
    const zIndex = 20 - absOffset;
    const brightness = offset === 0 ? 1 : Math.max(0.48, 1 - absOffset * 0.22);
    const isVisible = absOffset <= (isMobile ? 1.5 : 3.5);

    return {
      transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: isVisible ? opacity : 0,
      zIndex,
      filter: `brightness(${brightness})`,
      pointerEvents: isVisible ? ("auto" as const) : ("none" as const),
      visibility: isVisible ? ("visible" as const) : ("hidden" as const),
    };
  };

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="services-forward"
      aria-label="Services That Move You Forward"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.badgeText}>03 —— OUR SERVICES</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              Services That <span className={styles.gradientTitle}>Move You Forward</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              From autonomous AI agents and cloud infrastructure to consumer mobile platforms and venture scaling — engineered for sustained performance.
            </p>
          </Reveal>
        </div>

        {/* Loading State */}
        {isLoading && total === 0 ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={36} />
            <p className={styles.loadingText}>Connecting live service architectures...</p>
          </div>
        ) : isError && total === 0 ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Unable to load live services right now.</p>
            <button type="button" onClick={() => refetch()} className={styles.retryBtn}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : (
          /* 3D Cylindrical Carousel Arena */
          <div
            className={styles.arenaContainer}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Concentric Glowing Amber Floor Platform */}
            <div className={styles.stageFloor} aria-hidden="true">
              <div className={styles.floorRingOuter} />
              <div className={styles.floorRingInner} />
              <div className={styles.floorCoreGlow} />
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              className={[styles.navBtn, styles.navBtnPrev].join(" ")}
              onClick={handlePrev}
              aria-label="Previous Service"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              className={[styles.navBtn, styles.navBtnNext].join(" ")}
              onClick={handleNext}
              aria-label="Next Service"
            >
              <ChevronRight size={24} />
            </button>

            {/* 3D Card Orbit Stage */}
            <div className={styles.stageTrack}>
              {servicesList.map((service, idx) => {
                const isCenter = idx === activeIndex;
                const cardStyle = getCardStyle(idx);

                return (
                  <div
                    key={service.id || service.slug || idx}
                    className={[
                      styles.cardWrapper,
                      isCenter ? styles.cardCenter : "",
                    ].join(" ")}
                    style={cardStyle}
                    onClick={() => {
                      if (!isCenter) setActiveIndex(idx);
                    }}
                  >
                    <div className={styles.cardContent}>
                      {/* Top Meta Bar */}
                      <div className={styles.cardTopBar}>
                        <span className={styles.cardNumber}>{service.displayNumber}</span>
                        {service.is_featured ? (
                          <span className={styles.badgeFeatured}>
                            <Star size={11} fill="currentColor" /> FEATURED
                          </span>
                        ) : (
                          <span className={styles.badgeCategory}>
                            {service.badgeLabel}
                          </span>
                        )}
                      </div>

                      {/* Hero Image Graphic */}
                      <div className={styles.cardHeroBox}>
                        {service.hero_image ? (
                          <img
                            src={service.hero_image}
                            alt={service.title}
                            className={styles.cardHeroImg}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.cardHeroPlaceholder}>
                            <Layers size={36} className={styles.heroPlaceholderIcon} />
                          </div>
                        )}
                        <div className={styles.heroVignette} aria-hidden="true" />
                      </div>

                      {/* Card Title & Description */}
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{service.title}</h3>
                        <p className={styles.cardDesc}>
                          {service.tagline || service.summary}
                        </p>
                      </div>

                      {/* 4 Feature Bullet Points */}
                      <ul className={styles.featureList}>
                        {service.fourFeatures.map((feat, fIdx) => (
                          <li key={fIdx} className={styles.featureItem}>
                            <span className={styles.featureBullet}>
                              <span className={styles.bulletInner} />
                            </span>
                            <span className={styles.featureText}>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Card Footer Actions */}
                      <div className={styles.cardFooter}>
                        <Link
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className={styles.viewDetailsBtn}
                          tabIndex={isCenter ? 0 : -1}
                        >
                          <span>View Details</span>
                          <ArrowRight size={14} className={styles.viewDetailsArrow} />
                        </Link>
                        <Link
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className={styles.circleArrowBtn}
                          aria-label={`View details for ${service.title}`}
                          tabIndex={isCenter ? 0 : -1}
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Numeric Pagination Indicators */}
            {total > 0 && (
              <div className={styles.paginationTrack}>
                <div className={styles.paginationTrackInner}>
                  {servicesList.map((srv, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={srv.id || idx}
                        type="button"
                        className={[
                          styles.pagePill,
                          isActive ? styles.pagePillActive : "",
                        ].join(" ")}
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}: ${srv.title}`}
                      >
                        {isActive && (
                          <span className={styles.activePillIndicator} aria-hidden="true" />
                        )}
                        <span className={styles.pageNumberText}>{srv.displayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

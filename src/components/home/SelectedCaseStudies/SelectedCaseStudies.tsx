import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  MessageSquareShare,
  Wrench,
  ArrowUpRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicWorkData } from "@/lib/work.functions";
import type { ProjectItem } from "@/lib/work.shared";
import { CASE_STUDIES } from "@/data/home";
import styles from "./SelectedCaseStudies.module.css";

const ICONS = [Compass, MessageSquareShare, Wrench, Layers];

interface DisplayCaseStudy {
  client: string;
  category: string;
  result: string;
  detail: string;
  tags: string[];
  slug?: string;
  isFeatured?: boolean;
}

// ============================================================================
// DYNAMIC SELECTED CASE STUDIES (OUR WORK SHOWCASE)
// WHY THIS COMPONENT IS USED:
// Showcases real-world client production solutions and case studies managed directly
// inside the DIMISI Admin Panel (`/dimisi-admin?tab=work`).
// Prioritizes projects marked as 'is_featured' on the backend.
// Gracefully falls back to seeded case studies if MongoDB returns an empty array.
// ============================================================================
export function SelectedCaseStudies() {
  // Live dynamic query synced with Admin Work & MongoDB
  const { data: payload } = useQuery({
    queryKey: ["publicWork"],
    queryFn: () => getPublicWorkData(),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const displayStudies: DisplayCaseStudy[] = useMemo(() => {
    const liveProjects = (payload?.projects || []).filter((p) => p.is_active);

    if (liveProjects.length > 0) {
      // Prioritize featured projects from Admin Panel
      const sorted = [...liveProjects].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (a.order_index ?? 99) - (b.order_index ?? 99);
      });

      return sorted.slice(0, 3).map((p: ProjectItem) => ({
        client: p.client_name || p.title,
        category: p.category || (p.type === "product" ? "Product Platform" : "Client Engineering"),
        result: p.outcome || p.tagline || "Engineered for high performance and reliability.",
        detail: p.overview || p.solution || p.challenge || "Production-grade digital architecture built to scale.",
        tags: p.tech_stack && p.tech_stack.length > 0 ? p.tech_stack.slice(0, 4) : ["Architecture", "TypeScript", "Cloud", "SLA"],
        slug: p.slug,
        isFeatured: p.is_featured,
      }));
    }

    // Graceful fallback to seeded items if database has not seeded projects yet
    return CASE_STUDIES.map((c) => ({
      client: c.client,
      category: c.category,
      result: c.result,
      detail: c.detail,
      tags: c.tags,
      slug: undefined,
      isFeatured: true,
    }));
  }, [payload?.projects]);

  return (
    <section className={styles.section} id="case-studies" aria-label="Selected Case Studies & Our Work">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>04 · Our Work & Case Studies</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              Engineering Impact Across <span className={styles.gradientTitle}>Production Platforms</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              Real products shipped, scaled, and monitored by DIMISI Technologies — designed for frictionless user journeys, high performance, and enterprise reliability.
            </p>
          </Reveal>
        </div>

        {/* 3 Case Study Cards Grid */}
        <div className={styles.grid}>
          {displayStudies.map((study, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={study.client} delay={i * 90} className={styles.gridItem}>
                <TiltCard className={styles.card}>
                  <div className={styles.cardGlow} aria-hidden="true" />

                  {/* Card Top: Category badge & Icon */}
                  <div className={styles.cardTop}>
                    <div className={styles.iconBox}>
                      <Icon className={styles.icon} />
                    </div>
                    <span className={styles.categoryBadge}>{study.category}</span>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.clientTitle}>
                      {study.slug ? (
                        <Link to="/work/$slug" params={{ slug: study.slug }} className={styles.titleLink}>
                          {study.client}
                          <ArrowUpRight className={styles.arrow} aria-hidden="true" />
                        </Link>
                      ) : (
                        <>
                          {study.client}
                          <ArrowUpRight className={styles.arrow} aria-hidden="true" />
                        </>
                      )}
                    </h3>
                    <p className={styles.resultLine}>{study.result}</p>
                    <p className={styles.detailText}>{study.detail}</p>
                  </div>

                  {/* Feature Tags */}
                  <div className={styles.tagsRow}>
                    {study.tags?.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.outcomeTag}>
                      <Sparkles className={styles.sparkle} aria-hidden="true" />
                      {study.isFeatured ? "Featured Case Study" : "Production Platform"}
                    </span>
                    <span className={styles.caseNum}>0{i + 1}</span>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Footer Actions */}
        <Reveal variant="up" delay={180}>
          <div className={styles.actionRow}>
            <MagneticButton to="/work">Explore All Work & Case Studies</MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Discuss Your Project
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

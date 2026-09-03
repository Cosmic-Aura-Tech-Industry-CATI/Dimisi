import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Layers,
  ExternalLink,
  FolderGit2,
  Rocket,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicWorkData } from "@/lib/work.functions";
import type { ProjectItem, ProjectType } from "@/lib/work.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./WorkPage.module.css";

export function WorkPage() {
  const [filterType, setFilterType] = useState<"all" | ProjectType>("all");

  // Fetch live dynamic case studies from store
  const { data: payload, isLoading } = useQuery({
    queryKey: ["publicWork"],
    queryFn: () => getPublicWorkData(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25,
  });

  const projects = payload?.projects || [];
  const stats = payload?.stats || {
    totalProjects: 4,
    totalWork: 2,
    totalProducts: 2,
    satisfactionScore: "99.4%",
    deliveryRate: "100%",
  };

  const workCount = useMemo(() => projects.filter((p) => p.type === "work").length, [projects]);
  const productCount = useMemo(() => projects.filter((p) => p.type === "product").length, [projects]);

  const filteredProjects = useMemo(() => {
    if (filterType === "all") return projects;
    return projects.filter((p) => p.type === filterType);
  }, [projects, filterType]);

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Our Work Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <Reveal variant="fade">
            <div className={styles.heroBadge}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>Our Work</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={60}>
            <h1 className={styles.heroTitle}>
              Outcomes We're <span className={styles.gradientText}>Proud Of</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={120}>
            <p className={styles.heroSubtitle}>
              A closer look at how we approach problems — and the measurable results we deliver across
              high-growth client solutions and our proprietary software products.
            </p>
          </Reveal>

          {/* Quick Metrics Bar */}
          <Reveal variant="up" delay={160}>
            <div className={styles.metricsBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalProjects}</span>
                <span className={styles.metricLabel}>Featured Projects</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalWork}</span>
                <span className={styles.metricLabel}>Client Solutions</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalProducts}</span>
                <span className={styles.metricLabel}>In-House Products</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.deliveryRate}</span>
                <span className={styles.metricLabel}>Production Delivery</span>
              </div>
            </div>
          </Reveal>

          {/* Hero Actions */}
          <Reveal variant="up" delay={200}>
            <div className={styles.heroActions}>
              <MagneticButton to="/contact">
                <span>Build a Similar Solution</span>
                <ArrowUpRight size={18} />
              </MagneticButton>

              <a href="#case-studies" className={styles.secondaryAnchor}>
                <span>Explore Selected Projects</span>
                <ChevronRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. SELECTED PROJECTS / CASE STUDIES SECTION */}
      <section className={styles.projectsSection} id="case-studies" aria-label="Selected Projects">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Sparkles className={styles.amberSparkle} />
                <span>Case Studies</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Selected <span className={styles.gradientText}>Projects</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                Real challenges, thoughtful solutions, and outcomes that matter.
              </p>
            </Reveal>

            {/* Filter Tabs */}
            <Reveal variant="up" delay={140}>
              <div className={styles.filterBar} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterType === "all"}
                  className={[
                    styles.filterTab,
                    filterType === "all" ? styles.filterTabActive : "",
                  ].join(" ")}
                  onClick={() => setFilterType("all")}
                >
                  <span>All</span>
                  <span className={styles.tabBadge}>{projects.length}</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={filterType === "work"}
                  className={[
                    styles.filterTab,
                    filterType === "work" ? styles.filterTabActive : "",
                  ].join(" ")}
                  onClick={() => setFilterType("work")}
                >
                  <FolderGit2 size={15} />
                  <span>Our Work</span>
                  <span className={styles.tabBadge}>{workCount}</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={filterType === "product"}
                  className={[
                    styles.filterTab,
                    filterType === "product" ? styles.filterTabActive : "",
                  ].join(" ")}
                  onClick={() => setFilterType("product")}
                >
                  <Rocket size={15} />
                  <span>Our Product</span>
                  <span className={styles.tabBadge}>{productCount}</span>
                </button>
              </div>
            </Reveal>
          </div>

          {/* Interactive Project Cards Grid */}
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project, index) => (
              <Reveal key={project.id} delay={index * 60} className={styles.gridItem}>
                <TiltCard className={styles.projectCard}>
                  {/* Card Visual Header with Cover Image */}
                  <div className={styles.cardVisual}>
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className={styles.cardCoverImg}
                      loading="lazy"
                    />
                    <div className={styles.cardImgOverlay} />

                    {/* Type Badge (Our Work vs Our Product) */}
                    <div className={styles.typeBadgeWrapper}>
                      <span
                        className={[
                          styles.typeBadge,
                          project.type === "product" ? styles.productBadge : styles.workBadge,
                        ].join(" ")}
                      >
                        {project.type === "product" ? "Our Product" : "Our Work"}
                      </span>
                      <span className={styles.categoryBadge}>{project.category}</span>
                    </div>

                    {project.website_url && (
                      <a
                        href={project.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.extLinkFloating}
                        title={`Visit ${project.title} live website`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe size={13} />
                        <span>Live Site</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectTagline}>{project.tagline}</p>
                    <p className={styles.projectOverview}>{project.overview}</p>

                    {/* Quick Metrics / Outcomes Highlights */}
                    {project.metrics && project.metrics.length > 0 && (
                      <div className={styles.metricsRow}>
                        {project.metrics.slice(0, 3).map((m) => (
                          <div key={m.label} className={styles.metricChip}>
                            <span className={styles.chipVal}>{m.value}</span>
                            <span className={styles.chipLbl}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className={styles.cardFooter}>
                    <Link
                      to="/work/$slug"
                      params={{ slug: project.slug }}
                      className={styles.detailLink}
                    >
                      <span>Read Case Study</span>
                      <ArrowUpRight className={styles.arrowIcon} />
                    </Link>

                    {project.website_url && (
                      <a
                        href={project.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.visitSiteLink}
                      >
                        <span>Visit Website</span>
                        <ArrowRight size={13} />
                      </a>
                    )}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CLOSING CALL TO ACTION SECTION */}
      <section className={styles.ctaSection} aria-label="Closing Call To Action">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" />
              <div className={styles.ctaIconBadge}>
                <MessageSquare className={styles.ctaIcon} />
              </div>

              <h2 className={styles.ctaTitle}>Ready to Build Something Remarkable?</h2>

              <p className={styles.ctaSub}>
                Whether you need a full-scale web ecosystem, a high-converting mobile app, or an autonomous
                AI integration — let's engineer your vision into measurable business outcomes.
              </p>

              <div className={styles.ctaButtonRow}>
                <MagneticButton to="/contact">
                  <span>Build a Similar Solution</span>
                  <ArrowUpRight size={18} />
                </MagneticButton>

                <MagneticButton to="/contact" variant="ghost">
                  <span>Schedule Technical Consultation</span>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

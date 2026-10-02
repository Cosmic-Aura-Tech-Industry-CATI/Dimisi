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
  MessageSquare,
  Globe,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Star,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicWorkData } from "@/lib/work.functions";
import { DEFAULT_CASESTUDY_FALLBACK_IMAGE } from "@/services/casestudy.service";
import type { ProjectItem, ProjectType } from "@/lib/work.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./WorkPage.module.css";

export function WorkPage() {
  const [filterType, setFilterType] = useState<"all" | "featured" | ProjectType>("all");

  // Fetch live dynamic case studies from backend API & store
  const {
    data: payload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["publicWork"],
    queryFn: () => getPublicWorkData(),
  });

  const projects = payload?.projects || [];
  const stats = payload?.stats || {
    totalProjects: 0,
    totalWork: 0,
    totalProducts: 0,
    satisfactionScore: "99.4%",
    deliveryRate: "100%",
  };

  const workCount = useMemo(() => projects.filter((p) => p.type === "work").length, [projects]);
  const productCount = useMemo(() => projects.filter((p) => p.type === "product").length, [projects]);
  const featuredProjects = useMemo(() => projects.filter((p) => p.is_featured), [projects]);
  const featuredCount = featuredProjects.length;

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (filterType === "featured") {
      return list.filter((p) => p.is_featured);
    }
    if (filterType !== "all") {
      list = list.filter((p) => p.type === filterType);
    }
    // Priority sorting: starred / featured projects float to the top
    return [...list].sort((a, b) => {
      if (a.is_featured === b.is_featured) return 0;
      return a.is_featured ? -1 : 1;
    });
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

              {featuredProjects.length > 0 && (
                <a href="#featured-spotlight" className={styles.featuredHeroAnchor}>
                  <Star size={15} className={styles.amberStarIcon} />
                  <span>Featured Work ({featuredProjects.length})</span>
                </a>
              )}

              <a href="#case-studies" className={styles.secondaryAnchor}>
                <span>Explore Selected Projects</span>
                <ChevronRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. DEDICATED FEATURED SPOTLIGHT SECTION */}
      {!isLoading && featuredProjects.length > 0 && filterType === "all" && (
        <section
          className={styles.featuredSection}
          id="featured-spotlight"
          aria-label="Featured Spotlight Projects"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.featuredSectionEyebrow}>
                  <Star className={styles.amberStarIcon} size={14} />
                  <span>Spotlight Portfolio</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={60}>
                <h2 className={styles.sectionTitle}>
                  Featured <span className={styles.gradientText}>Innovations</span>
                </h2>
              </Reveal>
              <Reveal variant="up" delay={100}>
                <p className={styles.sectionSub}>
                  Handpicked case studies and production systems recognized for architectural excellence
                  and outsized business impact.
                </p>
              </Reveal>
            </div>

            <div className={styles.featuredGrid}>
              {featuredProjects.map((project, index) => (
                <Reveal key={`featured-${project.id}`} delay={index * 80} className={styles.featuredGridItem}>
                  <TiltCard className={styles.featuredCard}>
                    <div className={styles.featuredCardVisual}>
                      <img
                        src={project.cover_image || DEFAULT_CASESTUDY_FALLBACK_IMAGE}
                        alt={project.title}
                        className={styles.cardCoverImg}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== DEFAULT_CASESTUDY_FALLBACK_IMAGE) {
                            target.src = DEFAULT_CASESTUDY_FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div className={styles.cardImgOverlay} />

                      {/* Featured Spotlight Badge + Type Badge */}
                      <div className={styles.typeBadgeWrapper}>
                        <span className={styles.cardFeaturedBadge}>
                          <Star size={11} />
                          <span>Featured Spotlight</span>
                        </span>
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

                    <div className={styles.featuredCardBody}>
                      <div className={styles.featuredCardHeaderRow}>
                        <h3 className={styles.featuredProjectTitle}>{project.title}</h3>
                      </div>
                      {project.tagline && (
                        <p className={styles.projectTagline}>{project.tagline}</p>
                      )}
                      {project.overview && (
                        <p className={styles.projectOverview}>{project.overview}</p>
                      )}

                      {/* Tech stack tags */}
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className={styles.techStackRow}>
                          {project.tech_stack.slice(0, 4).map((tech, idx) => (
                            <span key={`feat-tech-${tech}-${idx}`} className={styles.techChip}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick Metrics / Outcomes Highlights */}
                      {project.metrics && project.metrics.length > 0 && (
                        <div className={styles.metricsRow}>
                          {project.metrics.slice(0, 3).map((m, idx) => (
                            <div key={`feat-m-${m.label}-${idx}`} className={styles.metricChip}>
                              <span className={styles.chipVal}>{m.value}</span>
                              <span className={styles.chipLbl}>{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <Link
                        to="/work/$slug"
                        params={{ slug: project.slug }}
                        className={styles.detailLink}
                      >
                        <span>Explore Case Study</span>
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
      )}

      {/* 3. SELECTED PROJECTS / CASE STUDIES SECTION */}
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

                {featuredCount > 0 && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={filterType === "featured"}
                    className={[
                      styles.filterTab,
                      filterType === "featured" ? styles.filterTabActive : "",
                    ].join(" ")}
                    onClick={() => setFilterType("featured")}
                  >
                    <Star size={14} className={styles.amberStarIcon} />
                    <span>Featured</span>
                    <span className={styles.tabBadge}>{featuredCount}</span>
                  </button>
                )}

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

          {/* SKELETON LOADING STATE */}
          {isLoading && projects.length === 0 && (
            <div className={styles.projectsGrid}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={styles.gridItem}>
                  <div className={styles.skeletonCard}>
                    <div className={styles.skeletonImageHolder} />
                    <div className={styles.skeletonContent}>
                      <div className={[styles.skeletonLine, styles.skeletonTitle].join(" ")} />
                      <div className={[styles.skeletonLine, styles.skeletonTagline].join(" ")} />
                      <div className={styles.skeletonLine} />
                      <div className={[styles.skeletonLine, styles.skeletonPill].join(" ")} />
                    </div>
                    <div className={styles.skeletonFooter}>
                      <div className={styles.skeletonLine} style={{ width: "35%" }} />
                      <div className={styles.skeletonLine} style={{ width: "25%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {isError && projects.length === 0 && (
            <div className={styles.stateBox}>
              <div className={[styles.stateIconBox, styles.stateIconError].join(" ")}>
                <AlertTriangle size={28} />
              </div>
              <h3 className={styles.stateTitle}>Unable to load our work right now.</h3>
              <p className={styles.stateText}>
                We are having trouble retrieving the live case studies portfolio. Please check your connection or try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className={styles.retryBtn}
              >
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !isError && filteredProjects.length === 0 && (
            <div className={styles.stateBox}>
              <div className={styles.stateIconBox}>
                <FolderGit2 size={28} />
              </div>
              <h3 className={styles.stateTitle}>
                {filterType === "featured"
                  ? "No featured case studies found"
                  : filterType !== "all"
                  ? "No case studies found in this section"
                  : "No projects available at the moment."}
              </h3>
              <p className={styles.stateText}>
                {filterType === "featured"
                  ? "There are currently no projects marked as featured. Check back shortly or view all projects."
                  : filterType !== "all"
                  ? "There are currently no active case studies under this filter. View all projects or check back shortly."
                  : "Our project showcase is being refreshed. Check back shortly or discuss tailored digital solutions with our team."}
              </p>
              {filterType !== "all" ? (
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={styles.resetFilterBtn}
                >
                  View All Projects
                </button>
              ) : (
                <MagneticButton to="/contact">
                  <span>Discuss Your Project</span>
                  <ArrowUpRight size={18} />
                </MagneticButton>
              )}
            </div>
          )}

          {/* Interactive Live Project Cards Grid */}
          {!isLoading && filteredProjects.length > 0 && (
            <div className={styles.projectsGrid}>
              {filteredProjects.map((project, index) => (
                <Reveal key={project.id} delay={index * 60} className={styles.gridItem}>
                  <TiltCard
                    className={[
                      styles.projectCard,
                      project.is_featured ? styles.featuredProjectCard : "",
                    ].join(" ")}
                  >
                    {/* Card Visual Header with Cover Image */}
                    <div className={styles.cardVisual}>
                      <img
                        src={project.cover_image || DEFAULT_CASESTUDY_FALLBACK_IMAGE}
                        alt={project.title}
                        className={styles.cardCoverImg}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== DEFAULT_CASESTUDY_FALLBACK_IMAGE) {
                            target.src = DEFAULT_CASESTUDY_FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div className={styles.cardImgOverlay} />

                      {/* Type Badge & Featured Badge */}
                      <div className={styles.typeBadgeWrapper}>
                        {project.is_featured && (
                          <span className={styles.cardFeaturedBadge}>
                            <Star size={11} />
                            <span>Featured</span>
                          </span>
                        )}
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
                      {project.tagline && (
                        <p className={styles.projectTagline}>{project.tagline}</p>
                      )}
                      {project.overview && (
                        <p className={styles.projectOverview}>{project.overview}</p>
                      )}

                      {/* Quick Metrics / Outcomes Highlights */}
                      {project.metrics && project.metrics.length > 0 && (
                        <div className={styles.metricsRow}>
                          {project.metrics.slice(0, 3).map((m, idx) => (
                            <div key={`${m.label}-${idx}`} className={styles.metricChip}>
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
          )}
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

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Globe,
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Code2,
  Calendar,
  UserCheck,
  X,
  Maximize2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicWorkData } from "@/lib/work.functions";
import type { ProjectItem, ProjectGalleryImage } from "@/lib/work.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./WorkDetailPage.module.css";

interface WorkDetailPageProps {
  project: ProjectItem;
}

export function WorkDetailPage({ project }: WorkDetailPageProps) {
  // Lightbox modal state for gallery images
  const [activeLightboxImg, setActiveLightboxImg] = useState<ProjectGalleryImage | null>(null);

  // Fetch all projects for related project suggestions
  const { data: payload } = useQuery({
    queryKey: ["publicWork"],
    queryFn: () => getPublicWorkData(),
    staleTime: 1000 * 30,
  });

  const allProjects = payload?.projects || [];
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id)
    .slice(0, 2);

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO & BREADCRUMB SECTION */}
      <section className={styles.heroSection} aria-label="Project Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.container}>
          {/* Breadcrumb Navigation */}
          <Reveal variant="fade">
            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Link to="/" className={styles.crumbLink}>Home</Link>
              <ChevronRight size={14} className={styles.crumbSep} />
              <Link to="/work" className={styles.crumbLink}>Our Work</Link>
              <ChevronRight size={14} className={styles.crumbSep} />
              <span className={styles.crumbCurrent}>{project.title}</span>
            </nav>
          </Reveal>

          {/* Badges & Meta */}
          <Reveal variant="up" delay={50}>
            <div className={styles.metaBadgeRow}>
              <span
                className={[
                  styles.typeBadge,
                  project.type === "product" ? styles.productBadge : styles.workBadge,
                ].join(" ")}
              >
                {project.type === "product" ? "Our Product" : "Our Work"}
              </span>
              <span className={styles.categoryBadge}>{project.category}</span>
              {project.timeline && (
                <span className={styles.timelineBadge}>
                  <Calendar size={12} />
                  <span>{project.timeline}</span>
                </span>
              )}
            </div>
          </Reveal>

          {/* Title & Tagline */}
          <Reveal variant="up" delay={100}>
            <h1 className={styles.heroTitle}>{project.title}</h1>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.heroTagline}>{project.tagline}</p>
          </Reveal>

          {/* Action CTAs */}
          <Reveal variant="up" delay={180}>
            <div className={styles.heroActionRow}>
              <MagneticButton to={`/contact?project=${project.slug}`}>
                <span>Build a Similar Solution</span>
                <ArrowUpRight size={18} />
              </MagneticButton>

              {project.website_url && (
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.liveSiteBtn}
                >
                  <Globe size={16} />
                  <span>Visit Live Website</span>
                  <ExternalLink size={14} />
                </a>
              )}

              <Link to="/work" className={styles.backBtn}>
                <ArrowLeft size={16} />
                <span>All Projects</span>
              </Link>
            </div>
          </Reveal>

          {/* Hero Showcase Image */}
          <Reveal variant="up" delay={220}>
            <div className={styles.heroImageHolder}>
              <img
                src={project.cover_image}
                alt={project.title}
                className={styles.heroCoverImg}
                fetchPriority="high"
              />
              <div className={styles.heroImgGlow} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. MEASURABLE METRICS STRIP (If Present) */}
      {project.metrics && project.metrics.length > 0 && (
        <section className={styles.metricsSection} aria-label="Key Outcomes & Metrics">
          <div className={styles.container}>
            <div className={styles.metricsGrid}>
              {project.metrics.map((m, idx) => (
                <Reveal key={m.label} delay={idx * 50} className={styles.metricCard}>
                  <span className={styles.metricVal}>{m.value}</span>
                  <span className={styles.metricLbl}>{m.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. THE 4 STRUCTURED CASE STUDY PILLARS */}
      <section className={styles.pillarsSection} aria-label="Case Study Narrative">
        <div className={styles.container}>
          <div className={styles.pillarsGrid}>
            {/* PILLAR 1: OVERVIEW */}
            <Reveal variant="up" delay={50}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconBox}>
                    <Sparkles className={styles.pillarIcon} />
                  </div>
                  <div>
                    <span className={styles.pillarNumber}>01</span>
                    <h2 className={styles.pillarTitle}>Overview</h2>
                  </div>
                </div>
                <p className={styles.pillarContent}>{project.overview}</p>
              </div>
            </Reveal>

            {/* PILLAR 2: THE CHALLENGE */}
            <Reveal variant="up" delay={100}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconBox}>
                    <Target className={styles.pillarIcon} />
                  </div>
                  <div>
                    <span className={styles.pillarNumber}>02</span>
                    <h2 className={styles.pillarTitle}>The Challenge</h2>
                  </div>
                </div>
                <p className={styles.pillarContent}>{project.challenge}</p>
              </div>
            </Reveal>

            {/* PILLAR 3: OUR SOLUTION */}
            <Reveal variant="up" delay={150}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconBox}>
                    <Zap className={styles.pillarIcon} />
                  </div>
                  <div>
                    <span className={styles.pillarNumber}>03</span>
                    <h2 className={styles.pillarTitle}>Our Solution</h2>
                  </div>
                </div>
                <p className={styles.pillarContent}>{project.solution}</p>
              </div>
            </Reveal>

            {/* PILLAR 4: THE OUTCOME */}
            <Reveal variant="up" delay={200}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconBox}>
                    <TrendingUp className={styles.pillarIcon} />
                  </div>
                  <div>
                    <span className={styles.pillarNumber}>04</span>
                    <h2 className={styles.pillarTitle}>The Outcome</h2>
                  </div>
                </div>
                <p className={styles.pillarContent}>{project.outcome}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. SUPPORTING VISUALS & GALLERY SECTION */}
      {project.gallery_images && project.gallery_images.length > 0 && (
        <section className={styles.gallerySection} aria-label="Visual Gallery & Interface Plates">
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.sectionEyebrow}>
                  <Layers className={styles.amberSparkle} />
                  <span>Visual Architecture</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={50}>
                <h2 className={styles.sectionTitle}>
                  Interface & <span className={styles.gradientText}>System Plates</span>
                </h2>
              </Reveal>
              <Reveal variant="up" delay={80}>
                <p className={styles.sectionSub}>
                  Click any visual plate to inspect interface flows and architecture diagrams.
                </p>
              </Reveal>
            </div>

            <div className={styles.galleryGrid}>
              {project.gallery_images.map((img, idx) => (
                <Reveal key={idx} delay={idx * 60}>
                  <div
                    className={styles.galleryItem}
                    onClick={() => setActiveLightboxImg(img)}
                    role="button"
                    tabIndex={0}
                    title="Click to view full screen"
                  >
                    <img src={img.url} alt={img.caption || `Plate ${idx + 1}`} className={styles.galleryImg} />
                    <div className={styles.galleryOverlay}>
                      <span className={styles.zoomPrompt}>
                        <Maximize2 size={16} />
                        <span>Enlarge Plate</span>
                      </span>
                    </div>
                    {img.caption && <p className={styles.galleryCaption}>{img.caption}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TECH STACK & ENGINEERING ARCHITECTURE */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <section className={styles.techSection} aria-label="Technology Stack">
          <div className={styles.container}>
            <div className={styles.techBox}>
              <div className={styles.techHeader}>
                <Code2 className={styles.techIcon} />
                <h3 className={styles.techTitle}>Engineered With Production Modern Stack</h3>
              </div>
              <div className={styles.techChips}>
                {project.tech_stack.map((t) => (
                  <span key={t} className={styles.techChip}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. RELATED PROJECT SUGGESTIONS */}
      {relatedProjects.length > 0 && (
        <section className={styles.relatedSection} aria-label="Explore More Case Studies">
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.sectionEyebrow}>
                  <Sparkles className={styles.amberSparkle} />
                  <span>Explore More</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={50}>
                <h2 className={styles.sectionTitle}>
                  Related <span className={styles.gradientText}>Case Studies</span>
                </h2>
              </Reveal>
            </div>

            <div className={styles.relatedGrid}>
              {relatedProjects.map((rel, idx) => (
                <Reveal key={rel.id} delay={idx * 60}>
                  <TiltCard className={styles.relatedCard}>
                    <div className={styles.relatedImgHolder}>
                      <img src={rel.cover_image} alt={rel.title} className={styles.relatedCoverImg} />
                      <span className={styles.relCatBadge}>{rel.category}</span>
                    </div>
                    <div className={styles.relatedBody}>
                      <h4 className={styles.relatedTitle}>{rel.title}</h4>
                      <p className={styles.relatedOverview}>{rel.overview}</p>
                      <Link to="/work/$slug" params={{ slug: rel.slug }} className={styles.relatedLink}>
                        <span>Read Case Study</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. CLOSING CALL TO ACTION SECTION */}
      <section className={styles.ctaSection} aria-label="Closing Call To Action">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" />
              <div className={styles.ctaIconBadge}>
                <MessageSquare className={styles.ctaIcon} />
              </div>

              <h2 className={styles.ctaTitle}>Inspired by {project.title}?</h2>

              <p className={styles.ctaSub}>
                Let's discuss how we can tailor a similar architecture, intuitive interface, and measurable
                growth engine for your specific business.
              </p>

              <div className={styles.ctaButtonRow}>
                <MagneticButton to={`/contact?project=${project.slug}`}>
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

      {/* LIGHTBOX MODAL */}
      {activeLightboxImg && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setActiveLightboxImg(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setActiveLightboxImg(null)}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
            <img
              src={activeLightboxImg.url}
              alt={activeLightboxImg.caption || "Screenshot Preview"}
              className={styles.lightboxImg}
            />
            {activeLightboxImg.caption && (
              <p className={styles.lightboxCaptionText}>{activeLightboxImg.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

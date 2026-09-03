import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import type { CompanyService, ServiceGalleryImage } from "@/lib/services.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./ServiceDetailPage.module.css";

interface ServiceDetailPageProps {
  service: CompanyService;
}

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  // Interactive State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeLightboxImg, setActiveLightboxImg] = useState<ServiceGalleryImage | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO / BANNER SECTION */}
      <section className={styles.heroSection} aria-label={`${service.title} Hero`}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          {/* Breadcrumb */}
          <Reveal variant="fade">
            <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
              <Link to="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <ChevronRight size={13} className={styles.bcSep} />
              <Link to="/services" className={styles.breadcrumbLink}>
                Services
              </Link>
              <ChevronRight size={13} className={styles.bcSep} />
              <span className={styles.breadcrumbCurrent}>{service.title}</span>
            </nav>
          </Reveal>

          {/* Category Badge */}
          <Reveal variant="fade" delay={40}>
            <div className={styles.categoryBadge}>
              <span className={styles.badgePulse} />
              <span>{service.category}</span>
            </div>
          </Reveal>

          {/* Title */}
          <Reveal variant="up" delay={80}>
            <h1 className={styles.heroTitle}>{service.title}</h1>
          </Reveal>

          {/* Tagline / Summary */}
          <Reveal variant="up" delay={120}>
            <p className={styles.heroSubtitle}>{service.summary}</p>
          </Reveal>

          {/* CTAs */}
          <Reveal variant="up" delay={160}>
            <div className={styles.heroActions}>
              <MagneticButton to={`/contact?service=${service.slug}`}>
                <span>Discuss Your Requirements</span>
                <ArrowUpRight size={18} />
              </MagneticButton>

              <Link to="/services" className={styles.secondaryAnchor}>
                <span>View All Services</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* Main Hero Banner Image */}
          <Reveal variant="up" delay={200} className={styles.heroBannerHolder}>
            <div className={styles.bannerFrame}>
              <img
                src={service.hero_image}
                alt={service.title}
                className={styles.bannerImg}
              />
              <div className={styles.bannerOverlay} />
              <div className={styles.bannerFloatingTag}>
                <Sparkles className={styles.sparkleIcon} />
                <span>Enterprise Production Ready</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. 4-POINT ARCHITECTURAL SERVICE OVERVIEW */}
      <section className={styles.overviewSection} aria-label="Service Architecture Overview">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Layers className={styles.amberSparkle} />
                <span>Architectural Overview</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                What We Deliver & <span className={styles.gradientText}>Why It Matters</span>
              </h2>
            </Reveal>
          </div>

          <div className={styles.overviewGrid}>
            <Reveal delay={60} className={styles.gridCol}>
              <div className={styles.overviewCard}>
                <div className={styles.ovIconBox}>
                  <Code2 size={20} />
                </div>
                <h3 className={styles.ovTitle}>What Is It?</h3>
                <p className={styles.ovText}>{service.what_is_it}</p>
              </div>
            </Reveal>

            <Reveal delay={120} className={styles.gridCol}>
              <div className={styles.overviewCard}>
                <div className={styles.ovIconBox}>
                  <Target size={20} />
                </div>
                <h3 className={styles.ovTitle}>Who Is It For?</h3>
                <p className={styles.ovText}>{service.who_is_for}</p>
              </div>
            </Reveal>

            <Reveal delay={180} className={styles.gridCol}>
              <div className={styles.overviewCard}>
                <div className={styles.ovIconBox}>
                  <Zap size={20} />
                </div>
                <h3 className={styles.ovTitle}>Problem It Solves</h3>
                <p className={styles.ovText}>{service.problem_solved}</p>
              </div>
            </Reveal>

            <Reveal delay={240} className={styles.gridCol}>
              <div className={styles.overviewCard}>
                <div className={styles.ovIconBox}>
                  <ShieldCheck size={20} />
                </div>
                <h3 className={styles.ovTitle}>Why It Matters</h3>
                <p className={styles.ovText}>{service.why_it_matters}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. RELATED IMAGES & VISUAL GALLERY */}
      {service.related_images && service.related_images.length > 0 && (
        <section className={styles.gallerySection} aria-label="Visual Gallery & Architecture">
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.sectionEyebrow}>
                  <ImageIcon className={styles.amberSparkle} />
                  <span>Visual Showcase & Architecture</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={60}>
                <h2 className={styles.sectionTitle}>
                  Engineering Plates & <span className={styles.gradientText}>Workflow Visuals</span>
                </h2>
              </Reveal>
            </div>

            <div className={styles.galleryGrid}>
              {service.related_images.map((img, idx) => (
                <Reveal key={idx} delay={idx * 80} className={styles.galleryCol}>
                  <button
                    type="button"
                    className={styles.galleryCard}
                    onClick={() => setActiveLightboxImg(img)}
                    aria-label={`Open visual ${img.alt || "plate"}`}
                  >
                    <img src={img.url} alt={img.alt || service.title} className={styles.galleryImg} />
                    <div className={styles.galleryOverlay} />
                    {img.caption && (
                      <div className={styles.galleryCaptionBox}>
                        <p className={styles.galleryCaption}>{img.caption}</p>
                      </div>
                    )}
                    <span className={styles.zoomTrigger}>
                      <ExternalLink size={16} />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. KEY FEATURES & DELIVERABLES */}
      <section className={styles.featuresSection} aria-label="Key Deliverables">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Sparkles className={styles.amberSparkle} />
                <span>Scope of Capabilities</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Key Features & <span className={styles.gradientText}>Deliverables</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                Every engagement is backed by tangible engineering deliverables and strict quality guarantees.
              </p>
            </Reveal>
          </div>

          <div className={styles.featuresGrid}>
            {service.features.map((feat, idx) => (
              <Reveal key={feat} delay={idx * 40} className={styles.featCol}>
                <TiltCard className={styles.featureCard}>
                  <CheckCircle2 className={styles.featCheck} />
                  <span className={styles.featText}>{feat}</span>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* Tech Stack Chips */}
          {service.tech_stack && service.tech_stack.length > 0 && (
            <Reveal variant="up" delay={140}>
              <div className={styles.techStackBox}>
                <span className={styles.techLabel}>Standard Technology Stack:</span>
                <div className={styles.techPills}>
                  {service.tech_stack.map((tech) => (
                    <span key={tech} className={styles.techPill}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* 5. 6-STEP PROCESS SECTION */}
      <section className={styles.processSection} aria-label="Delivery Process">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Clock className={styles.amberSparkle} />
                <span>Methodology & Workflow</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                How We Execute <span className={styles.gradientText}>Step-by-Step</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                A battle-tested 6-phase engineering lifecycle designed to eliminate uncertainty and ship on schedule.
              </p>
            </Reveal>
          </div>

          <div className={styles.processGrid}>
            {service.process_steps.map((proc, idx) => (
              <Reveal key={proc.step} delay={idx * 60} className={styles.processCol}>
                <div className={styles.processCard}>
                  <div className={styles.procHeader}>
                    <span className={styles.procNum}>{proc.step}</span>
                    <span className={styles.procLine} aria-hidden="true" />
                  </div>
                  <h3 className={styles.procTitle}>{proc.title}</h3>
                  <p className={styles.procDesc}>{proc.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BUSINESS BENEFITS SECTION */}
      <section className={styles.benefitsSection} aria-label="Business Benefits">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Zap className={styles.amberSparkle} />
                <span>Measurable Value</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Tangible Business <span className={styles.gradientText}>Outcomes</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                We prioritize concrete ROI over technical vanity metrics. Here is the leverage our clients gain.
              </p>
            </Reveal>
          </div>

          <div className={styles.benefitsGrid}>
            {service.benefits.map((ben, idx) => (
              <Reveal key={ben.title} delay={idx * 50} className={styles.benefitCol}>
                <div className={styles.benefitCard}>
                  {ben.metric && <span className={styles.benefitMetric}>{ben.metric}</span>}
                  <h3 className={styles.benefitTitle}>{ben.title}</h3>
                  <p className={styles.benefitDesc}>{ben.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SERVICE-SPECIFIC FAQ ACCORDION */}
      {service.faqs && service.faqs.length > 0 && (
        <section className={styles.faqSection} aria-label="Frequently Asked Questions">
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.sectionEyebrow}>
                  <HelpCircle className={styles.amberSparkle} />
                  <span>Frequently Asked Questions</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={60}>
                <h2 className={styles.sectionTitle}>
                  Common Questions About <span className={styles.gradientText}>{service.title}</span>
                </h2>
              </Reveal>
            </div>

            <div className={styles.faqList}>
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <Reveal key={idx} delay={idx * 40} className={styles.faqItemHolder}>
                    <div className={[styles.faqItem, isOpen ? styles.faqItemOpen : ""].join(" ")}>
                      <button
                        type="button"
                        className={styles.faqQuestionBtn}
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                      >
                        <span className={styles.faqQText}>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className={styles.faqToggleIcon} />
                        ) : (
                          <ChevronDown className={styles.faqToggleIcon} />
                        )}
                      </button>
                      {isOpen && (
                        <div className={styles.faqAnswerBox}>
                          <p className={styles.faqAnswer}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. CLOSING CTA SECTION */}
      <section className={styles.ctaSection} aria-label="Closing Call To Action">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" />
              <div className={styles.ctaIconBadge}>
                <Sparkles className={styles.ctaIcon} />
              </div>

              <h2 className={styles.ctaTitle}>Ready to Get Started with {service.title}?</h2>

              <p className={styles.ctaSub}>
                Let's discuss your project scope, technical requirements, and deployment timeline.
              </p>

              <div className={styles.ctaButtonRow}>
                <MagneticButton to={`/contact?service=${service.slug}`}>
                  <span>Discuss Your Requirements</span>
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

      {/* LIGHTBOX VIEWER */}
      {activeLightboxImg && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className={styles.lightboxViewer} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setActiveLightboxImg(null)}
              aria-label="Close image viewer"
            >
              <X size={20} />
            </button>
            <img src={activeLightboxImg.url} alt={activeLightboxImg.alt || "Visual"} className={styles.lightboxImg} />
            {activeLightboxImg.caption && (
              <p className={styles.lightboxCaption}>{activeLightboxImg.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  Globe,
  Heart,
  BookOpen,
  Sun,
  Laptop,
  Shield,
  X,
  Code2,
  Briefcase,
  UserCheck,
  Send,
  Zap,
  Coffee,
  Flame,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicCareersData } from "@/lib/careers.functions";
import type { JobOpening, CultureBenefit } from "@/lib/careers.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./CareerPage.module.css";

const BENEFIT_ICONS: Record<string, typeof Globe> = {
  globe: Globe,
  heart: Heart,
  book: BookOpen,
  sun: Sun,
  laptop: Laptop,
  shield: Shield,
};

export function CareerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedJobModal, setSelectedJobModal] = useState<JobOpening | null>(null);

  // Live dynamic query synced with DIMISI Admin Panel
  const { data: payload, isLoading } = useQuery({
    queryKey: ["publicCareers"],
    queryFn: () => getPublicCareersData(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25,
  });

  const hero = payload?.hero || {
    eyebrow: "Careers",
    heading: "Build the Future With Us",
    subline: "Join a curious, innovation-focused team where your work ships and your ideas matter.",
    cta_text: "Apply Now",
    cta_link: "https://www.thekalesh.com/careers",
    illustration_caption: "Bhootdev Careers",
  };

  const closingCta = payload?.closing_cta || {
    heading: "Ready to Join Us?",
    subline: "Send us your details and tell us what you'd love to work on.",
    cta_text: "Apply Now",
    cta_link: "https://www.thekalesh.com/careers",
  };

  const jobs = payload?.jobs || [];
  const hiringSteps = payload?.hiring_steps || [];
  const benefits = payload?.benefits || [];
  const stats = payload?.stats || {
    totalOpenings: 2,
    departmentsCount: 2,
    hiringTimeline: "2-3 Weeks",
    responseRate: "100%",
  };

  // Filter options
  const filterOptions = useMemo(() => {
    const set = new Set<string>();
    set.add("all");
    jobs.forEach((j) => {
      set.add(j.type);
      set.add(j.department);
    });
    return Array.from(set);
  }, [jobs]);

  // Filtered jobs based on search query and selected filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFilter =
        selectedFilter === "all" ||
        job.type.toLowerCase() === selectedFilter.toLowerCase() ||
        job.department.toLowerCase() === selectedFilter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [jobs, searchQuery, selectedFilter]);

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO SECTION WITH BHOOTDEV CAREERS ILLUSTRATION */}
      <section className={styles.heroSection} aria-label="Careers Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <div className={styles.heroContentLeft}>
            <Reveal variant="fade">
              <div className={styles.heroBadge}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span className={styles.badgeText}>{hero.eyebrow}</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={50}>
              <h1 className={styles.heroTitle}>
                Build the <span className={styles.gradientText}>Future</span> With Us
              </h1>
            </Reveal>

            <Reveal variant="up" delay={100}>
              <p className={styles.heroSubtitle}>{hero.subline}</p>
            </Reveal>

            {/* Quick Metrics Bar */}
            <Reveal variant="up" delay={140}>
              <div className={styles.metricsBar}>
                <div className={styles.metricItem}>
                  <span className={styles.metricNum}>{stats.totalOpenings}</span>
                  <span className={styles.metricLabel}>Open Roles</span>
                </div>
                <div className={styles.metricDivider} aria-hidden="true" />
                <div className={styles.metricItem}>
                  <span className={styles.metricNum}>5-Step</span>
                  <span className={styles.metricLabel}>Fast Track</span>
                </div>
                <div className={styles.metricDivider} aria-hidden="true" />
                <div className={styles.metricItem}>
                  <span className={styles.metricNum}>100%</span>
                  <span className={styles.metricLabel}>Remote-First</span>
                </div>
                <div className={styles.metricDivider} aria-hidden="true" />
                <div className={styles.metricItem}>
                  <span className={styles.metricNum}>&lt; 48hr</span>
                  <span className={styles.metricLabel}>Feedback</span>
                </div>
              </div>
            </Reveal>

            {/* Hero CTAs */}
            <Reveal variant="up" delay={180}>
              <div className={styles.heroActions}>
                <a
                  href={hero.cta_link}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryApplyBtn}
                >
                  <span>{hero.cta_text}</span>
                  <ArrowUpRight size={18} />
                </a>

                <a href="#open-positions" className={styles.secondaryAnchor}>
                  <span>Explore Open Roles ({jobs.length})</span>
                  <ChevronRight size={16} />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Bhootdev Careers Hero Illustration Showcase */}
          <div className={styles.heroIllustrationRight}>
            <Reveal variant="fade" delay={120}>
              <div className={styles.illustrationCard}>
                <div className={styles.cyberGlowCircle} aria-hidden="true" />
                <div className={styles.illustrationHeader}>
                  <div className={styles.cyberDots}>
                    <span className={styles.dotRed} />
                    <span className={styles.dotYellow} />
                    <span className={styles.dotGreen} />
                  </div>
                  <span className={styles.terminalTag}>DIMISI // HIRING PROTOCOL</span>
                </div>

                {/* Animated Cyber Hologram Grid */}
                <div className={styles.hologramViewport}>
                  <div className={styles.avatarNode}>
                    <div className={styles.avatarHalo} />
                    <div className={styles.avatarInner}>
                      <Flame className={styles.bhootIcon} />
                    </div>
                  </div>

                  <div className={styles.floatingTag1}>
                    <Code2 size={13} className={styles.tagIcon} />
                    <span>TypeScript · React 19</span>
                  </div>

                  <div className={styles.floatingTag2}>
                    <Sparkles size={13} className={styles.tagIcon} />
                    <span>Autonomous AI Agents</span>
                  </div>

                  <div className={styles.floatingTag3}>
                    <Zap size={13} className={styles.tagIcon} />
                    <span>High-Frequency Systems</span>
                  </div>
                </div>

                <div className={styles.illustrationCaptionBox}>
                  <span className={styles.captionBadge}>{hero.illustration_caption}</span>
                  <span className={styles.captionSub}>Craft · Velocity · Ownership</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. OPEN POSITIONS SECTION */}
      <section className={styles.positionsSection} id="open-positions" aria-label="Open Positions">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Briefcase className={styles.amberSparkle} />
                <span>Open Positions</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={50}>
              <h2 className={styles.sectionTitle}>
                Roles We're <span className={styles.gradientText}>Hiring For</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={80}>
              <p className={styles.sectionSub}>
                Don't see a perfect fit? Reach out anyway — we love meeting great people.
              </p>
            </Reveal>

            {/* Search & Filter Toolbar */}
            <Reveal variant="up" delay={120}>
              <div className={styles.filterToolbar}>
                <div className={styles.searchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, department, or keyword..."
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className={styles.clearSearchBtn}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className={styles.filterPillsRow}>
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={[
                        styles.filterPill,
                        selectedFilter.toLowerCase() === opt.toLowerCase()
                          ? styles.filterPillActive
                          : "",
                      ].join(" ")}
                      onClick={() => setSelectedFilter(opt)}
                    >
                      {opt === "all" ? "All Roles" : opt}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Job Openings Grid */}
          <div className={styles.jobsGrid}>
            {filteredJobs.length === 0 ? (
              <div className={styles.noResultsBox}>
                <p className={styles.noResultsText}>
                  No open positions match your search criteria. Try a different query or reach out directly!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                  className={styles.resetFilterBtn}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <Reveal key={job.id} delay={index * 50} className={styles.gridItem}>
                  <TiltCard className={styles.jobCard}>
                    <div className={styles.jobCardHeader}>
                      <div className={styles.jobBadgesRow}>
                        <span className={styles.departmentBadge}>{job.department}</span>
                        <span className={styles.typeBadge}>{job.type}</span>
                      </div>

                      <div className={styles.locationBadge}>
                        <MapPin size={13} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <p className={styles.jobSummary}>{job.summary}</p>

                    {/* Key Highlights / Responsibilities Tags */}
                    {job.responsibilities && job.responsibilities.length > 0 && (
                      <ul className={styles.highlightsList}>
                        {job.responsibilities.slice(0, 3).map((r, i) => (
                          <li key={i} className={styles.highlightItem}>
                            <CheckCircle2 size={13} className={styles.checkIcon} />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Card Footer Actions */}
                    <div className={styles.cardFooter}>
                      <button
                        type="button"
                        className={styles.viewDetailsBtn}
                        onClick={() => setSelectedJobModal(job)}
                      >
                        <span>View Role Details</span>
                      </button>

                      <a
                        href={job.apply_url || "https://www.thekalesh.com/careers"}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.cardApplyBtn}
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </TiltCard>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. HOW HIRING WORKS SECTION (RECRUITMENT PROCESS) */}
      <section className={styles.processSection} id="recruitment-process" aria-label="Recruitment Process">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <UserCheck className={styles.amberSparkle} />
                <span>Recruitment Process</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={50}>
              <h2 className={styles.sectionTitle}>
                How Hiring <span className={styles.gradientText}>Works</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={80}>
              <p className={styles.sectionSub}>
                A simple, respectful process designed to get to know each other.
              </p>
            </Reveal>
          </div>

          {/* Stepper Timeline */}
          <div className={styles.timelineStepper}>
            {hiringSteps.map((step, idx) => (
              <Reveal key={step.step} delay={idx * 60} className={styles.stepCol}>
                <div className={styles.stepCard}>
                  <div className={styles.stepTopRow}>
                    <span className={styles.stepNumberBadge}>{step.step}</span>
                    {step.duration && (
                      <span className={styles.stepDurationBadge}>
                        <Clock size={11} />
                        <span>{step.duration}</span>
                      </span>
                    )}
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDetail}>{step.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CULTURE & BENEFITS SECTION */}
      <section className={styles.benefitsSection} id="culture-benefits" aria-label="Culture and Benefits">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Sparkles className={styles.amberSparkle} />
                <span>Culture &amp; Benefits</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={50}>
              <h2 className={styles.sectionTitle}>
                A Place to Do Your <span className={styles.gradientText}>Best Work</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={80}>
              <p className={styles.sectionSub}>
                We invest in our people with a culture and benefits built for the long run.
              </p>
            </Reveal>
          </div>

          {/* Benefits 6-Card Grid */}
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, idx) => {
              const IconComponent = BENEFIT_ICONS[benefit.icon_tag || "globe"] || Globe;
              return (
                <Reveal key={benefit.id} delay={idx * 50} className={styles.benefitCol}>
                  <div className={styles.benefitCard}>
                    <div className={styles.benefitIconBox}>
                      <IconComponent className={styles.benefitIcon} />
                    </div>
                    <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                    <p className={styles.benefitDesc}>{benefit.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CLOSING CALL TO ACTION */}
      <section className={styles.ctaSection} aria-label="Closing Call To Action">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" />
              <div className={styles.ctaIconBadge}>
                <Send className={styles.ctaIcon} />
              </div>

              <h2 className={styles.ctaTitle}>{closingCta.heading}</h2>

              <p className={styles.ctaSub}>{closingCta.subline}</p>

              <div className={styles.ctaButtonRow}>
                <a
                  href={closingCta.cta_link}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.ctaPrimaryBtn}
                >
                  <span>{closingCta.cta_text}</span>
                  <ArrowUpRight size={18} />
                </a>

                <MagneticButton to="/contact" variant="ghost">
                  <span>General Talent Inquiry</span>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* JOB DETAILS POPUP MODAL */}
      {selectedJobModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedJobModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.jobBadgesRow}>
                  <span className={styles.departmentBadge}>{selectedJobModal.department}</span>
                  <span className={styles.typeBadge}>{selectedJobModal.type}</span>
                  <span className={styles.locationBadge}>
                    <MapPin size={12} />
                    <span>{selectedJobModal.location}</span>
                  </span>
                </div>
                <h3 className={styles.modalJobTitle}>{selectedJobModal.title}</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedJobModal(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.modalHeading}>Role Overview</h4>
                <p className={styles.modalText}>{selectedJobModal.summary}</p>
              </div>

              {selectedJobModal.responsibilities && selectedJobModal.responsibilities.length > 0 && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalHeading}>Key Responsibilities</h4>
                  <ul className={styles.modalList}>
                    {selectedJobModal.responsibilities.map((r, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} className={styles.modalCheck} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJobModal.requirements && selectedJobModal.requirements.length > 0 && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalHeading}>Qualifications &amp; Mindset</h4>
                  <ul className={styles.modalList}>
                    {selectedJobModal.requirements.map((req, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} className={styles.modalCheck} />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJobModal.benefits && selectedJobModal.benefits.length > 0 && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalHeading}>What We Offer</h4>
                  <ul className={styles.modalList}>
                    {selectedJobModal.benefits.map((b, i) => (
                      <li key={i}>
                        <Sparkles size={14} className={styles.modalSparkle} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setSelectedJobModal(null)}
              >
                Close
              </button>
              <a
                href={selectedJobModal.apply_url || "https://www.thekalesh.com/careers"}
                target="_blank"
                rel="noreferrer"
                className={styles.modalApplyBtn}
              >
                <span>Apply for this Role</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
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
  Flame,
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicCareersData, submitJobApplicationFn } from "@/lib/careers.functions";
import {
  type JobOpening,
  type CultureBenefit,
  validateJobApplicationInput,
} from "@/lib/careers.shared";
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

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function CareerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedJobModal, setSelectedJobModal] = useState<JobOpening | null>(null);

  // Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOpening | null>(null);

  // Form Field State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Resume State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDataUrl, setResumeDataUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeSize, setResumeSize] = useState(0);
  const [resumeType, setResumeType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation & Submission State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live dynamic query synced with DIMISI Admin Panel
  const { data: payload } = useQuery({
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
    cta_link: "#open-positions",
    illustration_caption: "Bhootdev Careers",
  };

  const closingCta = payload?.closing_cta || {
    heading: "Ready to Join Us?",
    subline: "Send us your details and tell us what you'd love to work on.",
    cta_text: "Apply Now",
    cta_link: "#open-positions",
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

  // Open Apply Modal Handler
  const handleOpenApplyModal = (job?: JobOpening | null) => {
    const targetJob = job || jobs[0] || null;
    setSelectedJobForApply(targetJob);
    setFormErrors({});
    setSubmitError(null);
    setIsSuccess(false);
    setApplyModalOpen(true);
  };

  // Handle Resume Selection / Drop
  const handleProcessFile = (file: File) => {
    const allowedExts = [".pdf", ".doc", ".docx"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isAllowed =
      allowedExts.includes(fileExt) ||
      file.type.includes("pdf") ||
      file.type.includes("word") ||
      file.type.includes("document");

    if (!isAllowed) {
      setFormErrors((prev) => ({
        ...prev,
        resume: "Invalid file format. Please upload a PDF, DOC, or DOCX resume.",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        resume: "File size exceeds 10 MB limit. Please upload a smaller file.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setResumeDataUrl(result);
      setResumeName(file.name);
      setResumeSize(file.size);
      setResumeType(file.type || "application/pdf");
      setResumeFile(file);
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.resume;
        return next;
      });
    };
    reader.onerror = () => {
      setFormErrors((prev) => ({
        ...prev,
        resume: "Failed to read file. Please select the file again.",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeDataUrl("");
    setResumeName("");
    setResumeSize(0);
    setResumeType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseApplyModal = () => {
    setApplyModalOpen(false);
    setIsSuccess(false);
    setSubmitError(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const inputData = {
      job_id: selectedJobForApply?.id || "general-inquiry",
      job_title: selectedJobForApply?.title || "General Application",
      job_department: selectedJobForApply?.department || "General",
      full_name: fullName,
      email,
      phone,
      location,
      portfolio_url: portfolioUrl,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      cover_letter: coverLetter,
      additional_info: additionalInfo,
      resume_name: resumeName,
      resume_size: resumeSize,
      resume_type: resumeType,
      resume_data_url: resumeDataUrl,
    };

    const validation = validateJobApplicationInput(inputData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitJobApplicationFn({ data: inputData });
      if (res.success) {
        setIsSuccess(true);
        // Reset form data for next time
        setFullName("");
        setEmail("");
        setPhone("");
        setLocation("");
        setPortfolioUrl("");
        setLinkedinUrl("");
        setGithubUrl("");
        setCoverLetter("");
        setAdditionalInfo("");
        handleRemoveResume();
      } else {
        setSubmitError(res.error || "Unable to submit your application right now. Please try again.");
      }
    } catch {
      setSubmitError("Unable to submit your application right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <button
                  type="button"
                  onClick={() => handleOpenApplyModal(jobs[0] || null)}
                  className={styles.primaryApplyBtn}
                >
                  <span>{hero.cta_text}</span>
                  <ArrowUpRight size={18} />
                </button>

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

                      <button
                        type="button"
                        className={styles.cardApplyBtn}
                        onClick={() => handleOpenApplyModal(job)}
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight size={15} />
                      </button>
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
                <button
                  type="button"
                  onClick={() => handleOpenApplyModal(jobs[0] || null)}
                  className={styles.ctaPrimaryBtn}
                >
                  <span>{closingCta.cta_text}</span>
                  <ArrowUpRight size={18} />
                </button>

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
              <button
                type="button"
                className={styles.modalApplyBtn}
                onClick={() => {
                  const job = selectedJobModal;
                  setSelectedJobModal(null);
                  handleOpenApplyModal(job);
                }}
              >
                <span>Apply for this Role</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIMISI NATIVE JOB APPLICATION MODAL */}
      {applyModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCloseApplyModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.applyModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.applyModalHeader}>
              <div className={styles.applyModalHeaderLeft}>
                <div className={styles.applyHeaderBadgeRow}>
                  <span className={styles.applyHeaderBadge}>DIMISI CAREERS // RECRUITMENT</span>
                  {selectedJobForApply && (
                    <span className={styles.applyDeptBadge}>
                      {selectedJobForApply.department}
                    </span>
                  )}
                </div>
                <h3 className={styles.applyModalMainTitle}>
                  {isSuccess
                    ? "Application Received"
                    : `Applying for: ${selectedJobForApply ? selectedJobForApply.title : "General Position"}`}
                </h3>
                {!isSuccess && selectedJobForApply && (
                  <p className={styles.applyModalSub}>
                    <MapPin size={13} className={styles.applySubIcon} />
                    <span>{selectedJobForApply.location}</span>
                    <span className={styles.applySubDot}>•</span>
                    <Clock size={13} className={styles.applySubIcon} />
                    <span>{selectedJobForApply.type}</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCloseApplyModal}
                aria-label="Close application modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Success State or Application Form */}
            {isSuccess ? (
              <div className={styles.successScreenWrapper}>
                <div className={styles.successIconOuter}>
                  <div className={styles.successIconPulse} />
                  <div className={styles.successIconInner}>
                    <CheckCircle2 size={42} className={styles.successCheck} />
                  </div>
                </div>

                <div className={styles.successBadgeTag}>APPLICATION SUBMITTED</div>

                <h3 className={styles.successTitle}>Thank You for Applying to DIMISI</h3>

                <p className={styles.successDescription}>
                  Your application has been successfully submitted and delivered to our talent acquisition team.
                </p>

                <div className={styles.successPositionCard}>
                  <div className={styles.successPositionLabel}>Position Applied For</div>
                  <div className={styles.successPositionTitle}>
                    {selectedJobForApply ? selectedJobForApply.title : "General Talent Pool"}
                  </div>
                  <div className={styles.successPositionMeta}>
                    {selectedJobForApply?.department} • {selectedJobForApply?.location || "Kanpur / Remote"}
                  </div>
                </div>

                <p className={styles.successNextSteps}>
                  We review every submission carefully. If your profile matches our requirements, we will reach out within <strong>24–48 hours</strong> to schedule an intro chat.
                </p>

                <button
                  type="button"
                  className={styles.successCloseBtn}
                  onClick={handleCloseApplyModal}
                >
                  <span>Close &amp; Back to Careers</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className={styles.applyForm}>
                <div className={styles.applyFormScrollArea}>
                  {submitError && (
                    <div className={styles.submitErrorAlert}>
                      <AlertCircle size={18} className={styles.errorIcon} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Position Selector if multiple jobs available */}
                  {jobs.length > 1 && (
                    <div className={styles.formSectionBox}>
                      <div className={styles.formSectionHeader}>
                        <Briefcase size={16} className={styles.sectionHeaderIcon} />
                        <h4>TARGET POSITION</h4>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Selected Role *</label>
                        <select
                          value={selectedJobForApply?.id || ""}
                          onChange={(e) => {
                            const found = jobs.find((j) => j.id === e.target.value);
                            if (found) setSelectedJobForApply(found);
                          }}
                          className={styles.formSelect}
                        >
                          {jobs.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.title} ({j.department} • {j.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Personal Information */}
                  <div className={styles.formSectionBox}>
                    <div className={styles.formSectionHeader}>
                      <User size={16} className={styles.sectionHeaderIcon} />
                      <h4>PERSONAL INFORMATION</h4>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Full Name <span className={styles.reqAsterisk}>*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formErrors.full_name) {
                              setFormErrors((prev) => ({ ...prev, full_name: "" }));
                            }
                          }}
                          placeholder="e.g. Aarav Sharma"
                          className={[
                            styles.formInput,
                            formErrors.full_name ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.full_name && (
                          <span className={styles.fieldError}>{formErrors.full_name}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Email Address <span className={styles.reqAsterisk}>*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) {
                              setFormErrors((prev) => ({ ...prev, email: "" }));
                            }
                          }}
                          placeholder="e.g. candidate@example.com"
                          className={[
                            styles.formInput,
                            formErrors.email ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.email && (
                          <span className={styles.fieldError}>{formErrors.email}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Phone Number <span className={styles.reqAsterisk}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (formErrors.phone) {
                              setFormErrors((prev) => ({ ...prev, phone: "" }));
                            }
                          }}
                          placeholder="e.g. +91 98765 43210"
                          className={[
                            styles.formInput,
                            formErrors.phone ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.phone && (
                          <span className={styles.fieldError}>{formErrors.phone}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Current Location <span className={styles.reqAsterisk}>*</span>
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            if (formErrors.location) {
                              setFormErrors((prev) => ({ ...prev, location: "" }));
                            }
                          }}
                          placeholder="e.g. Kanpur, Uttar Pradesh / Remote"
                          className={[
                            styles.formInput,
                            formErrors.location ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.location && (
                          <span className={styles.fieldError}>{formErrors.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Professional Information */}
                  <div className={styles.formSectionBox}>
                    <div className={styles.formSectionHeader}>
                      <LinkIcon size={16} className={styles.sectionHeaderIcon} />
                      <h4>PROFESSIONAL PROFILES &amp; PORTFOLIO</h4>
                    </div>

                    <div className={styles.formGrid3}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Portfolio / Live Website</label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={(e) => {
                            setPortfolioUrl(e.target.value);
                            if (formErrors.portfolio_url) {
                              setFormErrors((prev) => ({ ...prev, portfolio_url: "" }));
                            }
                          }}
                          placeholder="https://yourportfolio.com"
                          className={[
                            styles.formInput,
                            formErrors.portfolio_url ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.portfolio_url && (
                          <span className={styles.fieldError}>{formErrors.portfolio_url}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>LinkedIn Profile</label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => {
                            setLinkedinUrl(e.target.value);
                            if (formErrors.linkedin_url) {
                              setFormErrors((prev) => ({ ...prev, linkedin_url: "" }));
                            }
                          }}
                          placeholder="https://linkedin.com/in/username"
                          className={[
                            styles.formInput,
                            formErrors.linkedin_url ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.linkedin_url && (
                          <span className={styles.fieldError}>{formErrors.linkedin_url}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>GitHub / Behance / Dribbble</label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => {
                            setGithubUrl(e.target.value);
                            if (formErrors.github_url) {
                              setFormErrors((prev) => ({ ...prev, github_url: "" }));
                            }
                          }}
                          placeholder="https://github.com/username"
                          className={[
                            styles.formInput,
                            formErrors.github_url ? styles.inputError : "",
                          ].join(" ")}
                        />
                        {formErrors.github_url && (
                          <span className={styles.fieldError}>{formErrors.github_url}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Application Details & Cover Letter */}
                  <div className={styles.formSectionBox}>
                    <div className={styles.formSectionHeader}>
                      <FileText size={16} className={styles.sectionHeaderIcon} />
                      <h4>APPLICATION DETAILS</h4>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Why are you excited to join DIMISI? (Cover Note)
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Tell us about your craft, past standout projects, what drives your curiosity, and what you would love to build here..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Additional Information / Notes</label>
                      <textarea
                        rows={2}
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Earliest available start date, weekly availability, stipend expectations, or anything else you'd like us to know..."
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>

                  {/* Section 4: Resume Upload */}
                  <div className={styles.formSectionBox}>
                    <div className={styles.formSectionHeader}>
                      <UploadCloud size={16} className={styles.sectionHeaderIcon} />
                      <h4>RESUME / CURRICULUM VITAE</h4>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />

                    {!resumeDataUrl ? (
                      <div
                        className={[
                          styles.dropZone,
                          isDragging ? styles.dropZoneActive : "",
                          formErrors.resume ? styles.dropZoneError : "",
                        ].join(" ")}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className={styles.dropZoneIconCircle}>
                          <UploadCloud size={24} className={styles.dropZoneIcon} />
                        </div>
                        <div className={styles.dropZoneContent}>
                          <p className={styles.dropZoneTitle}>
                            Drag &amp; drop your resume here, or <span className={styles.dropZoneLink}>Browse</span>
                          </p>
                          <p className={styles.dropZoneMeta}>
                            Supported formats: <strong>PDF, DOC, DOCX</strong> • Max file size: <strong>10 MB</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.uploadedFileCard}>
                        <div className={styles.uploadedFileLeft}>
                          <div className={styles.uploadedFileIconBox}>
                            <FileText size={22} className={styles.uploadedFileIcon} />
                          </div>
                          <div className={styles.uploadedFileInfo}>
                            <div className={styles.uploadedFileName}>{resumeName}</div>
                            <div className={styles.uploadedFileMeta}>
                              <span className={styles.uploadedFormatBadge}>
                                {resumeName.split(".").pop()?.toUpperCase() || "PDF"}
                              </span>
                              <span>•</span>
                              <span>{formatFileSize(resumeSize)}</span>
                              <span>•</span>
                              <span className={styles.uploadReadyBadge}>Ready for submission</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.uploadedFileActions}>
                          <button
                            type="button"
                            className={styles.replaceFileBtn}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <RefreshCw size={14} />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            className={styles.removeFileBtn}
                            onClick={handleRemoveResume}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {formErrors.resume && (
                      <span className={styles.fieldError}>{formErrors.resume}</span>
                    )}
                  </div>
                </div>

                {/* Form Footer */}
                <div className={styles.applyModalFooter}>
                  <button
                    type="button"
                    className={styles.applyCancelBtn}
                    onClick={handleCloseApplyModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={styles.applySubmitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className={styles.spinnerIcon} />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <Send size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

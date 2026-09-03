import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicServicesData } from "@/lib/services.functions";
import type { CompanyService, IndustrySector } from "@/lib/services.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./ServicesPage.module.css";

const WHY_DIMISI_POINTS = [
  {
    icon: Target,
    title: "Product Thinking",
    text: "We build like product owners — obsessed with business outcomes, user retention, and high ROI.",
  },
  {
    icon: Zap,
    title: "Startup-Friendly Velocity",
    text: "Lean, fast-paced two-week sprint cycles delivering working software from day zero.",
  },
  {
    icon: ShieldCheck,
    title: "Scalable Architecture",
    text: "Systems engineered with zero tech debt to scale smoothly from user #1 to user #1,000,000.",
  },
  {
    icon: Clock,
    title: "Long-Term SLA Support",
    text: "We stay in your corner post-launch with 24/7 monitoring, security patches, and continuous tuning.",
  },
];

export function ServicesPage() {
  // Live dynamic query synced with DIMISI Admin Panel
  const { data: payload, isLoading } = useQuery({
    queryKey: ["publicServices"],
    queryFn: () => getPublicServicesData(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25,
  });

  const services = payload?.services || [];
  const industries = payload?.industries || [];
  const stats = payload?.stats || {
    totalServices: 11,
    totalIndustries: 8,
    uptimeSla: "99.99%",
    satisfactionScore: "4.9/5",
  };

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Our Services Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <Reveal variant="fade">
            <div className={styles.heroBadge}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>Our Services</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={60}>
            <h1 className={styles.heroTitle}>
              Solutions Built for <span className={styles.gradientText}>Business Growth</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={120}>
            <p className={styles.heroSubtitle}>
              We deliver tailored digital solutions, intelligent workflows, and scalable architectures
              engineered for diverse industries and real-world business needs.
            </p>
          </Reveal>

          {/* Quick Metrics Bar */}
          <Reveal variant="up" delay={160}>
            <div className={styles.metricsBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalServices}+</span>
                <span className={styles.metricLabel}>Core Disciplines</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalIndustries}+</span>
                <span className={styles.metricLabel}>Strategic Sectors</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.uptimeSla}</span>
                <span className={styles.metricLabel}>Platform SLA</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>100%</span>
                <span className={styles.metricLabel}>Outcome-Driven</span>
              </div>
            </div>
          </Reveal>

          {/* Hero CTAs */}
          <Reveal variant="up" delay={200}>
            <div className={styles.heroActions}>
              <MagneticButton to="/contact">
                <span>Discuss Your Business Requirements</span>
                <ArrowUpRight size={18} />
              </MagneticButton>

              <a href="#services-roster" className={styles.secondaryAnchor}>
                <span>Explore All Services</span>
                <ChevronRight size={16} />
              </a>

              <a href="#industries" className={styles.secondaryAnchor}>
                <span>View Industries We Serve</span>
                <ChevronRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. DYNAMIC SERVICES GRID SECTION */}
      <section className={styles.servicesSection} id="services-roster" aria-label="Core Services">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Layers className={styles.amberSparkle} />
                <span>Core Engineering Capabilities</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Tailored Services <span className={styles.gradientText}>Engineered For Impact</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                From rapid MVP execution to enterprise multi-cloud orchestration, explore our full spectrum
                of software, design, and intelligent automation services.
              </p>
            </Reveal>
          </div>

          {/* Services Grid with Visual Imagery */}
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <Reveal key={service.id} delay={index * 40} className={styles.gridItem}>
                <TiltCard className={styles.serviceCard}>
                  {/* Card Visual Header with Image */}
                  <div className={styles.cardImageHolder}>
                    <img
                      src={service.hero_image}
                      alt={service.title}
                      className={styles.cardImg}
                    />
                    <div className={styles.cardImgOverlay} />
                    <span className={styles.cardCatBadge}>{service.category}</span>
                    <span className={styles.cardIndexTag}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className={styles.cardContent}>
                    <h3 className={styles.serviceName}>{service.title}</h3>
                    <p className={styles.serviceTagline}>{service.tagline}</p>
                    <p className={styles.serviceDesc}>{service.summary}</p>

                    {/* Feature Pills */}
                    {service.features && service.features.length > 0 && (
                      <ul className={styles.featuresList}>
                        {service.features.slice(0, 4).map((feat) => (
                          <li key={feat} className={styles.featureItem}>
                            <CheckCircle2 className={styles.checkIcon} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className={styles.cardFooter}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className={styles.serviceLink}
                    >
                      <span>View Full Service Details</span>
                      <ArrowUpRight className={styles.linkArrow} />
                    </Link>

                    <Link
                      to="/contact"
                      search={{ service: service.slug }}
                      className={styles.inquireLink}
                    >
                      Inquire →
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US REASSURANCE STRIP */}
      <section className={styles.whySection} aria-label="Why Partner with DIMISI">
        <div className={styles.container}>
          <div className={styles.whyGrid}>
            {WHY_DIMISI_POINTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={idx * 60} className={styles.whyCol}>
                  <div className={styles.whyCard}>
                    <div className={styles.whyIconBox}>
                      <Icon className={styles.whyIcon} />
                    </div>
                    <h4 className={styles.whyTitle}>{item.title}</h4>
                    <p className={styles.whyText}>{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INDUSTRIES WE SERVE SECTION */}
      <section className={styles.industriesSection} id="industries" aria-label="Industries We Serve">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Sparkles className={styles.amberSparkle} />
                <span>Sector Specialization</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Industries We <span className={styles.gradientText}>Serve</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                How we solve domain-specific business challenges with custom architectures, compliance-ready
                workflows, and user-centric software.
              </p>
            </Reveal>
          </div>

          {/* 8 Industries Interactive Cards Grid */}
          <div className={styles.industriesGrid}>
            {industries.map((ind, index) => (
              <Reveal key={ind.id} delay={index * 50} className={styles.industryItem}>
                <div className={styles.industryCard}>
                  {/* Industry Image Banner */}
                  <div className={styles.indImageHolder}>
                    <img src={ind.image_url} alt={ind.name} className={styles.indImg} />
                    <div className={styles.indImgOverlay} />
                    <span className={styles.indBadge}>{ind.badge}</span>
                  </div>

                  <div className={styles.indBody}>
                    <h3 className={styles.indTitle}>{ind.name}</h3>
                    <p className={styles.indTagline}>{ind.tagline}</p>
                    <p className={styles.indDesc}>{ind.description}</p>

                    {/* Domain Solutions Pills */}
                    {ind.solutions && ind.solutions.length > 0 && (
                      <div className={styles.solutionsBox}>
                        <span className={styles.solutionsHeader}>Engineered Solutions:</span>
                        <div className={styles.solutionsList}>
                          {ind.solutions.map((sol) => (
                            <span key={sol} className={styles.solPill}>
                              {sol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.indFooter}>
                    <Link
                      to="/contact"
                      search={{ industry: ind.slug }}
                      className={styles.indLink}
                    >
                      <span>Consult on {ind.name} Requirements</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CLOSING CALL TO ACTION SECTION */}
      <section className={styles.ctaSection} aria-label="Closing Call To Action">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" />
              <div className={styles.ctaIconBadge}>
                <MessageSquare className={styles.ctaIcon} />
              </div>

              <h2 className={styles.ctaTitle}>Don't See Your Industry?</h2>

              <p className={styles.ctaSub}>
                We work across domains. Tell us about your business and let's explore what's possible.
              </p>

              <div className={styles.ctaButtonRow}>
                <MagneticButton to="/contact">
                  <span>Discuss Your Requirements</span>
                  <ArrowUpRight size={18} />
                </MagneticButton>

                <MagneticButton to="/contact" variant="ghost">
                  <span>Book an Architecture Consultation</span>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

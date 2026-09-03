import { Link } from "@tanstack/react-router";
import {
  Globe,
  Smartphone,
  Cpu,
  Palette,
  Code2,
  Cloud,
  Compass,
  Wrench,
  TrendingUp,
  Server,
  Rocket,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import styles from "./ServicesForward.module.css";

export interface ForwardServiceItem {
  number: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
}

export const FORWARD_SERVICES: ForwardServiceItem[] = [
  {
    number: "01",
    title: "Web Development",
    tagline: "Scalable, high-performance websites and web applications tailored to a business.",
    icon: Globe,
    route: "/services/web-development",
    badge: "Full-Stack",
  },
  {
    number: "02",
    title: "Mobile App Development",
    tagline: "Native and cross-platform mobile experiences for iOS and Android.",
    icon: Smartphone,
    route: "/services/mobile-app",
    badge: "iOS & Android",
  },
  {
    number: "03",
    title: "AI & Automation",
    tagline: "Intelligent workflows, machine learning, and automation that reduce manual work.",
    icon: Cpu,
    route: "/services/ai",
    badge: "GenAI & LLMs",
  },
  {
    number: "04",
    title: "UI/UX Design",
    tagline: "User-centered interface design, systems, and prototypes that delight users.",
    icon: Palette,
    route: "/services/ui-ux",
    badge: "Design Systems",
  },
  {
    number: "05",
    title: "Software Development",
    tagline: "Custom software, MVPs, and enterprise applications built for scale.",
    icon: Code2,
    route: "/services/enterprise",
    badge: "Custom MVPs",
  },
  {
    number: "06",
    title: "Cloud Services",
    tagline: "Cloud architecture, migration, DevOps, and managed infrastructure on leading platforms.",
    icon: Cloud,
    route: "/services/cloud",
    badge: "DevOps & Cloud",
  },
  {
    number: "07",
    title: "IT Consulting",
    tagline: "Strategic technology advisory to align your roadmap with business outcomes.",
    icon: Compass,
    route: "/contact",
    badge: "Advisory",
  },
  {
    number: "08",
    title: "IT Support & Maintenance",
    tagline: "Reliable monitoring, support, and continuous improvement.",
    icon: Wrench,
    route: "/contact",
    badge: "24/7 SLA",
  },
  {
    number: "09",
    title: "Digital Marketing",
    tagline: "Growth-focused campaigns, SEO, content, and analytics to drive qualified leads.",
    icon: TrendingUp,
    route: "/contact",
    badge: "Growth & SEO",
  },
  {
    number: "10",
    title: "IT-Enabled Services (ITES)",
    tagline: "Back-office technical support and process outsourcing powered by modern tooling.",
    icon: Server,
    route: "/contact",
    badge: "Operations",
  },
  {
    number: "11",
    title: "Startup Mentorship",
    tagline: "Hands-on guidance for founders, from idea to product-fit and scaling.",
    icon: Rocket,
    route: "/contact",
    badge: "Founder Fit",
  },
];

export function ServicesForward() {
  return (
    <section className={styles.section} id="services-forward" aria-label="Services That Move You Forward">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.badgeDot} aria-hidden="true" />
              <span className={styles.badgeText}>03 · Capabilities & Disciplines</span>
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

        {/* 11 Services Grid */}
        <div className={styles.grid}>
          {FORWARD_SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <Reveal key={svc.number} delay={i * 45} className={styles.gridItem}>
                <Link to={svc.route} className={styles.cardLink}>
                  <TiltCard className={styles.card}>
                    <div className={styles.cardGlow} aria-hidden="true" />
                    
                    <div className={styles.cardTop}>
                      <div className={styles.iconBox}>
                        <Icon className={styles.icon} />
                      </div>
                      <div className={styles.metaRow}>
                        {svc.badge && <span className={styles.tagBadge}>{svc.badge}</span>}
                        <span className={styles.serviceNum}>{svc.number}</span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>
                        {svc.title}
                        <ArrowUpRight className={styles.arrowIcon} aria-hidden="true" />
                      </h3>
                      <p className={styles.cardTagline}>{svc.tagline}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.footerPrompt}>
                        <Sparkles className={styles.sparkleIcon} aria-hidden="true" />
                        Explore capability
                      </span>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Action Row */}
        <Reveal variant="up" delay={200}>
          <div className={styles.actionRow}>
            <MagneticButton to="/services">View Detailed Service Architectures</MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Schedule Technical Consultation
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

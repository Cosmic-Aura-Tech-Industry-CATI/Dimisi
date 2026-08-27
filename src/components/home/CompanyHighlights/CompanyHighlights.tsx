import {
  Layers,
  Rocket,
  Cpu,
  Building2,
  Flame,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import styles from "./CompanyHighlights.module.css";

export interface CompanyHighlightItem {
  id: string;
  metric: string;
  label: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGlow: string;
}

export const COMPANY_HIGHLIGHTS_DATA: CompanyHighlightItem[] = [
  {
    id: "services",
    metric: "10+",
    label: "Services",
    subtext: "Full-spectrum digital engineering & software architecture",
    icon: Layers,
    accentGlow: "rgba(255, 122, 0, 0.35)",
  },
  {
    id: "products",
    metric: "4+",
    label: "Products",
    subtext: "Proprietary platforms & apps built in-house including Kalesh",
    icon: Rocket,
    accentGlow: "rgba(255, 179, 0, 0.35)",
  },
  {
    id: "domains",
    metric: "Multi",
    label: "Tech Domains",
    subtext: "AI/ML, Cloud, WebGPU, Native Mobile & Distributed Systems",
    icon: Cpu,
    accentGlow: "rgba(255, 90, 0, 0.35)",
  },
  {
    id: "support",
    metric: "Dual",
    label: "Startup & Enterprise",
    subtext: "Flexible acceleration from seed founders to global enterprises",
    icon: Building2,
    accentGlow: "rgba(255, 200, 50, 0.35)",
  },
  {
    id: "innovation",
    metric: "Active",
    label: "Ongoing Innovation",
    subtext: "Continuous R&D, autonomous systems, and new initiatives",
    icon: Flame,
    accentGlow: "rgba(255, 60, 0, 0.35)",
  },
];

export function CompanyHighlights() {
  return (
    <section className={styles.section} id="company-highlights" aria-label="Company Highlights">
      <div className={styles.container}>
        {/* Strip Header */}
        <div className={styles.stripHeader}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>06 · Company Highlights</span>
            </div>
          </Reveal>
          <Reveal variant="up" delay={60}>
            <h3 className={styles.stripTitle}>
              DIMISI Technologies <span className={styles.gradientText}>At A Glance</span>
            </h3>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className={styles.stripSubtitle}>
              A quick overview of our engineering scale, product ecosystem, and continuous innovation initiatives.
            </p>
          </Reveal>
        </div>

        {/* 5 Highlights Grid / Strip */}
        <div className={styles.strip}>
          {COMPANY_HIGHLIGHTS_DATA.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={i * 70} className={styles.stripItem}>
                <div className={styles.card}>
                  <div
                    className={styles.cardGlow}
                    style={{ background: `radial-gradient(circle, ${item.accentGlow} 0%, transparent 70%)` }}
                    aria-hidden="true"
                  />

                  <div className={styles.topRow}>
                    <div className={styles.iconBox}>
                      <Icon className={styles.icon} />
                    </div>
                    <span className={styles.metricBadge}>{item.metric}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <h4 className={styles.cardLabel}>{item.label}</h4>
                    <p className={styles.cardSubtext}>{item.subtext}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.indicator}>
                      <CheckCircle className={styles.checkIcon} aria-hidden="true" />
                      Active Capability
                    </span>
                    <Sparkles className={styles.sparkle} aria-hidden="true" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

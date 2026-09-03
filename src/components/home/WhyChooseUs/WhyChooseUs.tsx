import {
  Target,
  Zap,
  Layers,
  Bot,
  ShieldCheck,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import styles from "./WhyChooseUs.module.css";

export interface WhyChooseUsItem {
  number: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
}

export const WHY_CHOOSE_US_POINTS: WhyChooseUsItem[] = [
  {
    number: "01",
    title: "Product Thinking",
    tagline: "We build like product owners — obsessed with outcomes, not just output.",
    icon: Target,
    highlight: "Outcome-Driven",
  },
  {
    number: "02",
    title: "Startup-Friendly Approach",
    tagline: "Lean, fast, and flexible engagement design for founders and early teams.",
    icon: Zap,
    highlight: "Agile Velocity",
  },
  {
    number: "03",
    title: "Scalable Architecture",
    tagline: "Systems engineered to grow from your first user to your millionth.",
    icon: Layers,
    highlight: "Hyper-Scale",
  },
  {
    number: "04",
    title: "AI Integration Expertise",
    tagline: "Practical AI woven into products to create real, measurable leverage.",
    icon: Bot,
    highlight: "Applied GenAI",
  },
  {
    number: "05",
    title: "End-to-End Development",
    tagline: "Strategy, design, engineering, and launch — all under one roof.",
    icon: ShieldCheck,
    highlight: "Full Lifecycle",
  },
  {
    number: "06",
    title: "Long-Term Support",
    tagline: "We stay after launch with monitoring, iteration, and continuous care.",
    icon: Clock,
    highlight: "Continuous SLA",
  },
  {
    number: "07",
    title: "Innovation-Focused Culture",
    tagline: "A team that treats every project as a chance to push what's possible.",
    icon: Flame,
    highlight: "Next-Gen Tech",
  },
];

export function WhyChooseUs() {
  return (
    <section className={styles.section} id="why-choose-us" aria-label="Why Choose Us">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.badgeDot} aria-hidden="true" />
              <span className={styles.badgeText}>05 · Why Choose Us</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              Engineering With <span className={styles.gradientTitle}>Uncompromising Standards</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              Seven foundational commitments that define our engineering precision, startup velocity, and enduring client partnerships.
            </p>
          </Reveal>
        </div>

        {/* 7 Points Grid */}
        <div className={styles.grid}>
          {WHY_CHOOSE_US_POINTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.number} delay={i * 60} className={styles.gridItem}>
                <TiltCard className={styles.card}>
                  <div className={styles.cardGlow} aria-hidden="true" />

                  <div className={styles.cardHeader}>
                    <div className={styles.iconBox}>
                      <Icon className={styles.icon} />
                    </div>
                    <div className={styles.headerMeta}>
                      <span className={styles.highlightBadge}>{item.highlight}</span>
                      <span className={styles.pointNumber}>{item.number}</span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardTagline}>{item.tagline}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.verifiedTag}>
                      <CheckCircle2 className={styles.checkIcon} aria-hidden="true" />
                      DIMISI Standard
                    </span>
                    <Sparkles className={styles.sparkle} aria-hidden="true" />
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

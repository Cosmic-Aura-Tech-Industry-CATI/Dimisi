import {
  Compass,
  MessageSquareShare,
  Wrench,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { CASE_STUDIES } from "@/data/home";
import styles from "./SelectedCaseStudies.module.css";

const ICONS = [Compass, MessageSquareShare, Wrench];

export function SelectedCaseStudies() {
  return (
    <section className={styles.section} id="case-studies" aria-label="Selected Case Studies">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>07 · Selected Case Studies</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              Engineering Impact Across <span className={styles.gradientTitle}>Production Platforms</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              Real products shipped, scaled, and monitored by DIMISI Technologies — designed for frictionless user journeys, high performance, and reliability.
            </p>
          </Reveal>
        </div>

        {/* 3 Case Study Cards Grid */}
        <div className={styles.grid}>
          {CASE_STUDIES.map((study, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={study.client} delay={i * 90} className={styles.gridItem}>
                <TiltCard className={styles.card}>
                  <div className={styles.cardGlow} aria-hidden="true" />

                  {/* Card Top: Category badge & Icon */}
                  <div className={styles.cardTop}>
                    <div className={styles.iconBox}>
                      <Icon className={styles.icon} />
                    </div>
                    <span className={styles.categoryBadge}>{study.category}</span>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.clientTitle}>
                      {study.client}
                      <ArrowUpRight className={styles.arrow} aria-hidden="true" />
                    </h3>
                    <p className={styles.resultLine}>{study.result}</p>
                    <p className={styles.detailText}>{study.detail}</p>
                  </div>

                  {/* Feature Tags */}
                  <div className={styles.tagsRow}>
                    {study.tags?.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.outcomeTag}>
                      <Sparkles className={styles.sparkle} aria-hidden="true" />
                      Shipped & Monitored
                    </span>
                    <span className={styles.caseNum}>0{i + 1}</span>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Footer Actions */}
        <Reveal variant="up" delay={180}>
          <div className={styles.actionRow}>
            <MagneticButton to="/products">Explore All In-House Products</MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Discuss Your Project
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

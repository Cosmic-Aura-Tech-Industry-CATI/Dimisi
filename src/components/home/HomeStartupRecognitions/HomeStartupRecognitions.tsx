import { ArrowUpRight, Award, CheckCircle2, Cpu, ShieldCheck } from "lucide-react";
import { STARTUP_RECOGNITIONS, COMPANY } from "@/constants/site";
import styles from "./HomeStartupRecognitions.module.css";

export function HomeStartupRecognitions() {
  return (
    <section className={styles.container} aria-label="Official Startup Accreditations">
      <div className={styles.header}>
        <div className={styles.tagWrap}>
          <Award size={14} className={styles.tagIcon} aria-hidden="true" />
          <span className={styles.tagText}>OFFICIAL STARTUP ACCREDITATIONS & GLOBAL NETWORK</span>
        </div>
        <h3 className={styles.title}>
          Backed by <span className={styles.gradientText}>Global AI Ecosystem</span> & Recognized Nationally
        </h3>
        <p className={styles.subtitle}>
          DIMISI Technologies Private Limited is officially recognized by the Government of India and accelerates through NVIDIA's global startup ecosystem.
        </p>
      </div>

      <div className={styles.grid}>
        {/* 1. NVIDIA INCEPTION PROGRAM CARD */}
        <div className={[styles.card, styles.cardNvidia].join(" ")}>
          <div className={styles.cardGlow} aria-hidden="true" />
          
          <div className={styles.cardTop}>
            <div className={styles.badgePill}>
              <Cpu size={12} className={styles.pillIcon} aria-hidden="true" />
              <span>AI & Startup Ecosystem</span>
            </div>
            <span className={styles.statusLive}>
              <span className={styles.statusDot} aria-hidden="true" />
              Active Member
            </span>
          </div>

          <div className={styles.brandRow}>
            <div className={styles.logoBox}>
              <img
                src="/images/nvidia-inception-clean.png"
                alt="NVIDIA Inception Program Member"
                className={styles.brandLogo}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={styles.brandMeta}>
              <h4 className={styles.cardTitle}>NVIDIA Inception Program</h4>
              <span className={styles.orgLabel}>Global AI Startup Network</span>
            </div>
          </div>

          <p className={styles.cardDesc}>
            DIMISI Technologies Private Limited is a proud member of the NVIDIA Inception Program, a global initiative supporting innovative startups with access to cutting-edge technology resources, GPU developer tools, technical training, and global business growth opportunities.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <CheckCircle2 size={13} className={styles.featureCheck} aria-hidden="true" />
              <span>GPU Compute & AI Tools Access</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={13} className={styles.featureCheck} aria-hidden="true" />
              <span>NVIDIA Deep Learning Institute Training</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={13} className={styles.featureCheck} aria-hidden="true" />
              <span>Global Enterprise Co-Marketing</span>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <a
              href="https://www.nvidia.com/en-us/deep-learning-ai/startups/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
              aria-label="Explore NVIDIA Inception Program official page"
            >
              <span>Explore NVIDIA Inception</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <span className={styles.metaBadge}>Global Member</span>
          </div>
        </div>

        {/* 2. STARTUP INDIA / DPIIT CARD */}
        <div className={[styles.card, styles.cardStartupIndia].join(" ")}>
          <div className={styles.cardGlow} aria-hidden="true" />

          <div className={styles.cardTop}>
            <div className={styles.badgePillGov}>
              <ShieldCheck size={12} className={styles.pillIcon} aria-hidden="true" />
              <span>Govt. of India · DPIIT</span>
            </div>
            <span className={styles.certPill}>
              <span>Cert: {COMPANY.dpiitNumber}</span>
            </span>
          </div>

          <div className={styles.brandRow}>
            <div className={styles.logoBoxGov}>
              <img
                src="/images/startup-india-clean.png"
                alt="Startup India DPIIT Recognition"
                className={styles.brandLogoGov}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={styles.brandMeta}>
              <h4 className={styles.cardTitle}>Startup India Recognized</h4>
              <span className={styles.orgLabel}>Ministry of Commerce & Industry</span>
            </div>
          </div>

          <p className={styles.cardDesc}>
            Officially recognized as an innovative startup under the Startup India initiative by the Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India. Valid through April 2036.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <CheckCircle2 size={13} className={styles.featureCheckGov} aria-hidden="true" />
              <span>DPIIT Certificate No: {COMPANY.dpiitNumber}</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={13} className={styles.featureCheckGov} aria-hidden="true" />
              <span>MCA CIN: {COMPANY.cin}</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={13} className={styles.featureCheckGov} aria-hidden="true" />
              <span>Ten-Year Recognition (Valid Upto 2036)</span>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.metaBadgeGov}>DPIIT Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
}

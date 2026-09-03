import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { RotatingWord } from "@/components/common/RotatingWord/RotatingWord";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import {
  ShieldCheck,
  EyeOff,
  MessageSquareLock,
  Sparkles,
  Radio,
  Lock,
  Flame,
  Zap,
} from "lucide-react";
import styles from "./ProjectsShowcase.module.css";

const KALESH_ADJECTIVES = [
  "Anonymous",
  "Privacy-First",
  "Decentralized",
  "Authentic",
  "Unfiltered",
  "Expressive",
];

export function ProjectsShowcase() {
  return (
    <section className={styles.section} id="projects">
      <SectionHeading
        eyebrow="02 · Explore Our Projects"
        title="Engineering Next-Generation Platforms"
        description="Flagship products and proprietary social ecosystems built for privacy, scale, and high-impact connectivity."
      />

      <Reveal variant="up">
        <div className={styles.showcaseStage}>
          <div className={styles.stageGlowAmbient} aria-hidden="true" />

          {/* Left Column: Product Info & Dynamic Motion Tagline */}
          <div className={styles.contentCol}>
            <div className={styles.categoryBadge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              Social Platform — Community &amp; Social Engagement
            </div>

            <div className={styles.productHeading}>
              <h2 className={styles.productName}>Kalesh</h2>
              <div className={styles.productTagline}>
                <span>The</span>
                <span className={styles.taglineAccent}>
                  <RotatingWord words={KALESH_ADJECTIVES} intervalMs={2700} />
                </span>
                <span>Social Sphere</span>
              </div>
            </div>

            <p className={styles.description}>
              Kalesh, a flagship product of Dimisi Technologies Private Limited,
              is an anonymous social media platform that empowers people to
              share opinions, engage in meaningful conversations, and foster
              authentic connections without compromising their privacy.
            </p>

            {/* Feature Highlights Pills */}
            <div className={styles.featurePills}>
              <div className={styles.featurePill}>
                <EyeOff size={14} className={styles.pillIcon} />
                <span>Zero-Knowledge Identity</span>
              </div>
              <div className={styles.featurePill}>
                <Lock size={14} className={styles.pillIcon} />
                <span>100% Privacy Preserving</span>
              </div>
              <div className={styles.featurePill}>
                <MessageSquareLock size={14} className={styles.pillIcon} />
                <span>Unfiltered Discourse</span>
              </div>
              <div className={styles.featurePill}>
                <Sparkles size={14} className={styles.pillIcon} />
                <span>Authentic Bonding</span>
              </div>
              <div className={styles.featurePill}>
                <Radio size={14} className={styles.pillIcon} />
                <span>Real-Time Pulse</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className={styles.actionsRow}>
              <MagneticButton to="/products">Explore Kalesh</MagneticButton>
              <MagneticButton to="/contact" variant="ghost">
                Join Beta Waitlist
              </MagneticButton>
            </div>
          </div>

          {/* Right Column: Interactive Obsidian UI Mockup */}
          <div className={styles.visualCol}>
            <div className={styles.deviceFrame}>
              <div className={styles.deviceHeader}>
                <div className={styles.liveTag}>
                  <span className={styles.liveDotGreen} />
                  Live Network
                </div>
                <span className={styles.appBrand}>KALESH ⚡</span>
              </div>

              {/* Mockup Feed Cards */}
              <div className={styles.feedCard}>
                <div className={styles.feedCardTop}>
                  <div className={styles.authorTag}>
                    <div className={styles.anonAvatar}>#</div>
                    <span>@anon_matrix_91</span>
                  </div>
                  <span className={styles.timeTag}>Just now</span>
                </div>
                <p className={styles.postBody}>
                  “Real conversations happen when identity is decoupled from honest opinion. Freedom to speak without fear.”
                </p>
                <div className={styles.reactionRow}>
                  <span className={[styles.reactionBtn, styles.reactionActive].join(" ")}>
                    <Flame size={12} /> 1.8k
                  </span>
                  <span className={styles.reactionBtn}>
                    <Zap size={12} /> 640
                  </span>
                  <span className={styles.reactionBtn}>
                    <ShieldCheck size={12} /> Verified Anon
                  </span>
                </div>
              </div>

              <div className={styles.feedCard}>
                <div className={styles.feedCardTop}>
                  <div className={styles.authorTag}>
                    <div className={styles.anonAvatar}>Ψ</div>
                    <span>@ghost_node_07</span>
                  </div>
                  <span className={styles.timeTag}>2m ago</span>
                </div>
                <p className={styles.postBody}>
                  Zero algorithmic manipulation. Pure community-driven engagement with zero tracker footprint.
                </p>
                <div className={styles.reactionRow}>
                  <span className={styles.reactionBtn}>
                    <Flame size={12} /> 942
                  </span>
                  <span className={styles.reactionBtn}>
                    <ShieldCheck size={12} /> E2E Encrypted
                  </span>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className={styles.deviceMetrics}>
                <div>
                  <span className={styles.metricValue}>100%</span>
                  <span className={styles.metricLabel}>Private</span>
                </div>
                <div>
                  <span className={styles.metricValue}>0</span>
                  <span className={styles.metricLabel}>Trackers</span>
                </div>
                <div>
                  <span className={styles.metricValue}>E2E</span>
                  <span className={styles.metricLabel}>Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

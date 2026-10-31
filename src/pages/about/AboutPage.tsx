import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Rocket,
  Layers,
  Lightbulb,
  Lock,
  Activity,
  Briefcase,
  Trophy,
  Code2,
  Users,
  Settings,
  Building2,
  Hash,
  Award,
  MapPin,
  Mail,
  Star,
  CheckCircle2,
  Cpu,
  FileText,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { COMPANY } from "@/constants/site";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  return (
    <div className={styles.page}>
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section className={styles.heroSection} id="about-hero" aria-label="About DIMISI Technologies">
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            {/* Left Content */}
            <div className={styles.heroContent}>
              <Reveal variant="fade">
                <div className={styles.eyebrowBadge}>
                  <span className={styles.badgeDot} aria-hidden="true" />
                  <span className={styles.badgeText}>ABOUT US</span>
                </div>
              </Reveal>

              <Reveal variant="up" delay={80}>
                <h1 className={styles.sectionTitle}>
                  Architecting Scalable Software. Accelerating{" "}
                  <span className={styles.accentGradient}>Digital Growth.</span>
                </h1>
              </Reveal>

              <Reveal variant="up" delay={150}>
                <p className={styles.sectionLead}>
                  We help businesses build rock-solid software architectures, scale with data-driven digital marketing, and navigate growth through strategic corporate advisory—while creating next-generation consumer social platforms.
                </p>
              </Reveal>

              <Reveal variant="up" delay={220}>
                <div className={styles.heroActions}>
                  <MagneticButton to="/contact" className={styles.primaryBtn}>
                    <span>Schedule a Consultation</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </MagneticButton>
                  <MagneticButton to="/services" variant="ghost" className={styles.ghostBtn}>
                    <span>Explore Services</span>
                  </MagneticButton>
                </div>
              </Reveal>

              {/* 3 Value Props Bar */}
              <Reveal variant="up" delay={300}>
                <div className={styles.heroValueProps}>
                  <div className={styles.propItem}>
                    <span className={styles.propIconBox} aria-hidden="true">
                      <ShieldCheck size={18} />
                    </span>
                    <span>Reliable Technology</span>
                  </div>
                  <div className={styles.propItem}>
                    <span className={styles.propIconBox} aria-hidden="true">
                      <TrendingUp size={18} />
                    </span>
                    <span>Business Growth</span>
                  </div>
                  <div className={styles.propItem}>
                    <span className={styles.propIconBox} aria-hidden="true">
                      <Rocket size={18} />
                    </span>
                    <span>Future-Ready Solutions</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Visual Box (Building) with Seamless Ambient Blending */}
            <Reveal variant="zoom" delay={180}>
              <div className={styles.heroVisualContainer}>
                <div className={styles.heroBackdropAura} aria-hidden="true" />
                <div className={styles.heroVisualBox}>
                  <img
                    src="/images/about/dimisi-building.jpg"
                    alt="DIMISI Technologies Headquarters"
                    className={styles.heroBuildingImg}
                    loading="eager"
                  />
                  <div className={styles.heroImgOverlay} aria-hidden="true" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. WHO WE ARE SECTION
          ========================================================================= */}
      <section className={styles.whoWeAreSection} id="who-we-are" aria-label="Who We Are">
        <div className={styles.container}>
          {/* Section Header: Centered & Spacious */}
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>WHO WE ARE</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h2 className={styles.sectionTitleCenter}>
                Empowering Modern Businesses with{" "}
                <span className={styles.accentGradient}>Resilient Technology & Strategy</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={140}>
              <p className={styles.sectionLeadCenter}>
                At Dimisi Technologies Private Limited, we turn ambitious ideas into reliable,
                scalable digital products. We are a modern technology and consulting company built
                for today&apos;s fast-moving digital economy.
              </p>
            </Reveal>
          </div>

          {/* Balanced 2-Column Showcase */}
          <div className={styles.whoShowcaseGrid}>
            {/* Left Column: Office Headquarters Visual Showcase */}
            <Reveal variant="up" delay={180}>
              <div className={styles.officeCardContainer}>
                <div className={styles.officeBackdropGlow} aria-hidden="true" />
                <div className={styles.officeCardFrame}>
                  {/* Top Location Pill */}
                  <div className={styles.officeTopTag}>
                    <span className={styles.livePulseDot} aria-hidden="true" />
                    <span>DIMISI HQ • KANPUR, INDIA</span>
                  </div>

                  {/* Office Image Container */}
                  <div className={styles.officeImgWrapper}>
                    <img
                      src="/images/about/dimisi-office.jpg"
                      alt="DIMISI Technologies Office Workspace"
                      className={styles.officeImg}
                      loading="lazy"
                    />
                    <div className={styles.officeImgVignette} aria-hidden="true" />
                  </div>

                  {/* Docked Glass Mission Banner */}
                  <div className={styles.officeDockedBanner}>
                    <div className={styles.bannerIconCircle}>
                      <Users size={20} />
                    </div>
                    <div className={styles.bannerContent}>
                      <h4 className={styles.bannerHeading}>Driven by Innovation. Built for Impact.</h4>
                      <p className={styles.bannerSub}>
                        Turning ambitious ideas into scalable, real-world solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right Column: Strategic Pillars */}
            <div className={styles.pillarsContainer}>
              <Reveal variant="up" delay={220}>
                <div className={styles.pillarFeatureCard}>
                  <div className={styles.pillarCardHeader}>
                    <div className={styles.pillarIconBox}>
                      <Layers size={22} />
                    </div>
                    <div className={styles.pillarTitleGroup}>
                      <div className={styles.pillarSubBadge}>B2B & Enterprise</div>
                      <h3 className={styles.pillarHeading}>Enterprise Solutions</h3>
                    </div>
                  </div>
                  <p className={styles.pillarDescription}>
                    We help businesses scale by developing robust custom software, designing cloud
                    systems that handle high traffic, executing high-converting digital marketing
                    campaigns, and offering clear corporate advisory.
                  </p>
                  <div className={styles.pillarTagList}>
                    <span className={styles.pillarTag}>Custom Software</span>
                    <span className={styles.pillarTag}>Cloud Systems</span>
                    <span className={styles.pillarTag}>Growth Marketing</span>
                    <span className={styles.pillarTag}>Corporate Advisory</span>
                  </div>
                </div>
              </Reveal>

              <Reveal variant="up" delay={280}>
                <div className={styles.pillarFeatureCard}>
                  <div className={styles.pillarCardHeader}>
                    <div className={styles.pillarIconBoxGold}>
                      <Lightbulb size={22} />
                    </div>
                    <div className={styles.pillarTitleGroup}>
                      <div className={styles.pillarSubBadgeGold}>Proprietary R&D</div>
                      <h3 className={styles.pillarHeading}>In-House Innovations</h3>
                    </div>
                  </div>
                  <p className={styles.pillarDescription}>
                    We build our own consumer-facing applications to solve real-world challenges,
                    with a focus on open expression, transparency, and data intelligence.
                  </p>
                  <div className={styles.pillarTagList}>
                    <span className={styles.pillarTag}>Consumer Platforms</span>
                    <span className={styles.pillarTag}>Kalesh App</span>
                    <span className={styles.pillarTag}>Data Intelligence</span>
                    <span className={styles.pillarTag}>Privacy First</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OUR PROPRIETARY PRODUCT: KALESH
          ========================================================================= */}
      <section className={styles.kaleshSection} id="kalesh-product" aria-label="Our Proprietary Product">
        <div className={styles.container}>
          {/* Section Header: Centered & Spacious */}
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>OUR PROPRIETARY PRODUCT</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h2 className={styles.sectionTitleCenter}>
                Kalesh — <span className={styles.accentGradient}>Anonymous Social Polling Platform</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={140}>
              <p className={styles.sectionLeadCenter}>
                People often hesitate to share their honest feedback or personal thoughts because
                of judgment or privacy concerns. To solve this, Dimisi Technologies is actively
                engineering a next-generation <strong>Anonymous Social Polling App</strong> where
                users can express themselves without any <strong>fear</strong>.
              </p>
            </Reveal>
          </div>

          {/* Symmetrical 3-Zone Showcase Stage */}
          <div className={styles.kaleshShowcaseStage}>
            {/* Left Flank: 2 Feature Cards */}
            <div className={styles.kaleshFlankCol}>
              <Reveal variant="left" delay={180}>
                <div className={styles.kaleshModernCard}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.kaleshIconCircle}>
                      <Lock size={20} />
                    </div>
                    <span className={styles.kaleshCardPill}>Privacy First</span>
                  </div>
                  <h3 className={styles.kaleshCardHeading}>100% Anonymous & Fearless Voice</h3>
                  <p className={styles.kaleshCardText}>
                    Your identity remains completely private, allowing you to share real viewpoints
                    without judgment or pressure.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="left" delay={240}>
                <div className={styles.kaleshModernCard}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.kaleshIconCircle}>
                      <Activity size={20} />
                    </div>
                    <span className={styles.kaleshCardPill}>Instant Feedback</span>
                  </div>
                  <h3 className={styles.kaleshCardHeading}>Real-Time Live Polling</h3>
                  <p className={styles.kaleshCardText}>
                    Create or participate in instant live polls on trending topics, social issues,
                    or current affairs.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Center Stage: Phone Mockup */}
            <div className={styles.kaleshCenterStage}>
              <Reveal variant="zoom" delay={200}>
                <div className={styles.kaleshPhoneWrapper}>
                  <div className={styles.phoneBackdropAura} aria-hidden="true" />

                  {/* Top Floating App Pill */}
                  <div className={styles.appCenterTag}>
                    <span className={styles.livePulseDot} aria-hidden="true" />
                    <span>FLAGSHIP CONSUMER APP</span>
                  </div>

                  <img
                    src="/images/about/kalesh-mockup.png"
                    alt="Kalesh App Phone Mockup"
                    className={styles.kaleshPhoneImg}
                    loading="lazy"
                  />
                </div>
              </Reveal>
            </div>

            {/* Right Flank: 2 Feature Cards */}
            <div className={styles.kaleshFlankCol}>
              <Reveal variant="right" delay={180}>
                <div className={styles.kaleshModernCard}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.kaleshIconCircleGold}>
                      <Briefcase size={20} />
                    </div>
                    <span className={styles.kaleshCardPillGold}>Market Intel</span>
                  </div>
                  <h3 className={styles.kaleshCardHeading}>Brand & Product Insights</h3>
                  <p className={styles.kaleshCardText}>
                    Businesses can run targeted live polls to gather unfiltered consumer feedback
                    and validate market demand.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="right" delay={240}>
                <div className={styles.kaleshModernCard}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.kaleshIconCircleGold}>
                      <Trophy size={20} />
                    </div>
                    <span className={styles.kaleshCardPillGold}>Gamification</span>
                  </div>
                  <h3 className={styles.kaleshCardHeading}>Interactive Contests & Rewards</h3>
                  <p className={styles.kaleshCardText}>
                    Users join prediction challenges, climb regional leaderboards, and win exciting
                    community recognition and prizes.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. OUR CORE PILLARS: WHAT WE DO
          ========================================================================= */}
      <section className={styles.pillarsSection} id="what-we-do" aria-label="Our Core Pillars">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>OUR CORE PILLARS</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h2 className={styles.sectionTitleCenter}>
                What We <span className={styles.accentGradient}>Do</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={140}>
              <p className={styles.sectionLeadCenter}>
                From modern full-cycle engineering to high-performance marketing and advisory,
                we build end-to-end digital solutions that drive real business velocity.
              </p>
            </Reveal>
          </div>

          <div className={styles.pillarsGrid}>
            <Reveal variant="up" delay={100} className={styles.pillarRevealWrapper}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarCardTop}>
                  <div className={styles.pillarIconBox}>
                    <Code2 size={22} />
                  </div>
                  <span className={styles.pillarNumberBadge}>01</span>
                </div>
                <h3 className={styles.pillarTitle}>Scalable Software Architectures</h3>
                <p className={styles.pillarDesc}>
                  We write clean, modular, and secure code. Our cloud-native architectures ensure
                  your applications perform reliably whether serving 100 users or millions of concurrent visitors.
                </p>
                <div className={styles.pillarFooterTag}>Architecture & Cloud</div>
              </div>
            </Reveal>

            <Reveal variant="up" delay={180} className={styles.pillarRevealWrapper}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarCardTop}>
                  <div className={styles.pillarIconBox}>
                    <Layers size={22} />
                  </div>
                  <span className={styles.pillarNumberBadge}>02</span>
                </div>
                <h3 className={styles.pillarTitle}>Full-Cycle Digital Services</h3>
                <p className={styles.pillarDesc}>
                  From interactive web apps and responsive mobile apps to high-throughput backend APIs,
                  we manage end-to-end development, deployment, and ongoing maintenance.
                </p>
                <div className={styles.pillarFooterTag}>Web & Mobile Apps</div>
              </div>
            </Reveal>

            <Reveal variant="up" delay={260} className={styles.pillarRevealWrapper}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarCardTop}>
                  <div className={styles.pillarIconBox}>
                    <TrendingUp size={22} />
                  </div>
                  <span className={styles.pillarNumberBadge}>03</span>
                </div>
                <h3 className={styles.pillarTitle}>Performance Digital Marketing</h3>
                <p className={styles.pillarDesc}>
                  Our growth team leverages data-driven technical SEO, ROI-targeted performance campaigns,
                  and high-conversion funnels to transform organic and paid traffic into recurring revenue.
                </p>
                <div className={styles.pillarFooterTag}>Growth & Conversion</div>
              </div>
            </Reveal>

            <Reveal variant="up" delay={340} className={styles.pillarRevealWrapper}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarCardTop}>
                  <div className={styles.pillarIconBox}>
                    <Users size={22} />
                  </div>
                  <span className={styles.pillarNumberBadge}>04</span>
                </div>
                <h3 className={styles.pillarTitle}>Corporate Advisory Services</h3>
                <p className={styles.pillarDesc}>
                  We help founders and corporate leadership make confident decisions with pragmatic
                  technology roadmaps, security compliance, and organizational process optimization.
                </p>
                <div className={styles.pillarFooterTag}>Strategy & Roadmaps</div>
              </div>
            </Reveal>
          </div>

          {/* 4 Trust Badges Strip */}
          <Reveal variant="up" delay={400}>
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <Rocket size={18} className={styles.trustIcon} />
                <span>Project-Focused Delivery</span>
              </div>
              <div className={styles.trustItem}>
                <Users size={18} className={styles.trustIcon} />
                <span>Client-Centric Approach</span>
              </div>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} className={styles.trustIcon} />
                <span>Secure & Scalable Solutions</span>
              </div>
              <div className={styles.trustItem}>
                <Star size={18} className={styles.trustIcon} />
                <span>Long-Term Growth Partner</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          5. WHY CHOOSE DIMISI TECHNOLOGIES
          ========================================================================= */}
      <section className={styles.whyChooseSection} id="why-choose-us" aria-label="Why Choose Us">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>WHY CHOOSE DIMISI TECHNOLOGIES</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h2 className={styles.sectionTitleCenter}>
                Your Growth. <span className={styles.accentGradient}>Our Commitment.</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={140}>
              <p className={styles.sectionLeadCenter}>
                We combine cutting-edge technology, disciplined strategy, and real-world execution
                to deliver measurable, long-term compounding value for every client and partner.
              </p>
            </Reveal>
          </div>

          <div className={styles.whyGrid}>
            <Reveal variant="up" delay={100} className={styles.whyRevealWrapper}>
              <div className={styles.whyCard}>
                <div className={styles.whyCardTop}>
                  <div className={styles.whyIconSquare}>
                    <Settings size={22} />
                  </div>
                  <span className={styles.whyPillBadge}>High-Load Architecture</span>
                </div>
                <h3 className={styles.whyCardTitle}>Built for Real Scale</h3>
                <p className={styles.whyCardDesc}>
                  We do not rely on fragile shortcuts. We architect resilient, high-throughput cloud
                  backends engineered to handle massive enterprise traffic and scale smoothly with your growth.
                </p>
                <div className={styles.whyFooterChip}>Zero Compromise Engineering</div>
              </div>
            </Reveal>

            <Reveal variant="up" delay={180} className={styles.whyRevealWrapper}>
              <div className={styles.whyCard}>
                <div className={styles.whyCardTop}>
                  <div className={styles.whyIconSquare}>
                    <TrendingUp size={22} />
                  </div>
                  <span className={styles.whyPillBadge}>Full Lifecycle</span>
                </div>
                <h3 className={styles.whyCardTitle}>End-to-End Growth Partner</h3>
                <p className={styles.whyCardDesc}>
                  Eliminate the friction of juggling multiple agencies. We orchestrate product design,
                  custom engineering, growth marketing, and ongoing operations under one roof.
                </p>
                <div className={styles.whyFooterChip}>Unified Team & Delivery</div>
              </div>
            </Reveal>

            <Reveal variant="up" delay={260} className={styles.whyRevealWrapper}>
              <div className={styles.whyCard}>
                <div className={styles.whyCardTop}>
                  <div className={styles.whyIconSquareGold}>
                    <Lightbulb size={22} />
                  </div>
                  <span className={styles.whyPillBadgeGold}>Battle-Tested R&D</span>
                </div>
                <h3 className={styles.whyCardTitle}>User-Centric Innovation</h3>
                <p className={styles.whyCardDesc}>
                  Building proprietary consumer platforms (such as Kalesh) keeps our engineering agile,
                  battle-tested in live production, and deeply attuned to actual end-user behavior.
                </p>
                <div className={styles.whyFooterChip}>Real-World Insights</div>
              </div>
            </Reveal>

            <Reveal variant="up" delay={340} className={styles.whyRevealWrapper}>
              <div className={styles.whyCard}>
                <div className={styles.whyCardTop}>
                  <div className={styles.whyIconSquareGold}>
                    <ShieldCheck size={22} />
                  </div>
                  <span className={styles.whyPillBadgeGold}>Corporate Governance</span>
                </div>
                <h3 className={styles.whyCardTitle}>Accountability & Trust</h3>
                <p className={styles.whyCardDesc}>
                  As an officially registered corporate entity in India, we deliver every milestone with
                  contractual transparency, stringent data security, and uncompromising statutory compliance.
                </p>
                <div className={styles.whyFooterChip}>Statutory Compliance & SLA</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. STARTUP RECOGNITIONS & GLOBAL ACCREDITATIONS
          ========================================================================= */}
      <section className={styles.recognitionsSection} id="startup-recognitions" aria-label="Startup Recognitions">
        <div className={styles.container}>
          {/* Section Header */}
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>OFFICIAL ACCREDITATIONS</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h2 className={styles.sectionTitleCenter}>
                Empowered by <span className={styles.accentGradient}>Global AI Innovation</span> & Recognized Nationally
              </h2>
            </Reveal>

            <Reveal variant="up" delay={140}>
              <p className={styles.sectionLeadCenter}>
                DIMISI Technologies Private Limited is a proud member of the NVIDIA Inception Program and is officially recognized as an innovative startup under Startup India by the Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India.
              </p>
            </Reveal>
          </div>

          {/* 2-Card Symmetrical Grid */}
          <div className={styles.recGrid}>
            {/* Card 1: NVIDIA Inception */}
            <Reveal variant="up" delay={180}>
              <div className={[styles.recCard, styles.recCardNvidia].join(" ")}>
                <div className={styles.recCardGlow} aria-hidden="true" />

                <div className={styles.recCardTop}>
                  <div className={styles.recPill}>
                    <Cpu size={12} aria-hidden="true" />
                    <span>AI & Startup Ecosystem</span>
                  </div>
                  <span className={styles.recStatusLive}>
                    <span className={styles.recStatusDot} aria-hidden="true" />
                    Active Member
                  </span>
                </div>

                <div className={styles.recBrandRow}>
                  <div className={styles.recLogoBox}>
                    <img
                      src="/images/nvidia-inception-clean.png"
                      alt="NVIDIA Inception Program Member"
                      className={styles.recBrandLogo}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.recBrandMeta}>
                    <h3 className={styles.recCardTitle}>NVIDIA Inception Program</h3>
                    <span className={styles.recOrgLabel}>Global AI Startup Network</span>
                  </div>
                </div>

                <p className={styles.recCardDesc}>
                  DIMISI Technologies Private Limited is a proud member of the NVIDIA Inception Program, a global initiative supporting innovative startups with access to cutting-edge technology resources, GPU developer tools, technical training, and business growth opportunities.
                </p>

                <div className={styles.recFeatureList}>
                  <div className={styles.recFeatureItem}>
                    <CheckCircle2 size={14} className={styles.recCheckIcon} aria-hidden="true" />
                    <span>Access to Cutting-Edge GPU Acceleration & AI Tools</span>
                  </div>
                  <div className={styles.recFeatureItem}>
                    <CheckCircle2 size={14} className={styles.recCheckIcon} aria-hidden="true" />
                    <span>NVIDIA Deep Learning Institute (DLI) Training & Credits</span>
                  </div>
                  <div className={styles.recFeatureItem}>
                    <CheckCircle2 size={14} className={styles.recCheckIcon} aria-hidden="true" />
                    <span>Global Co-Marketing & AI Enterprise Venture Network</span>
                  </div>
                </div>

                <div className={styles.recCardFooter}>
                  <a
                    href="https://www.nvidia.com/en-us/deep-learning-ai/startups/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.recActionBtn}
                    aria-label="Explore NVIDIA Inception Program official page"
                  >
                    <span>Explore NVIDIA Inception</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span className={styles.recMetaBadge}>Global AI Member</span>
                </div>
              </div>
            </Reveal>

            {/* Card 2: Startup India / DPIIT */}
            <Reveal variant="up" delay={240}>
              <div className={[styles.recCard, styles.recCardStartupIndia].join(" ")}>
                <div className={styles.recCardGlow} aria-hidden="true" />

                <div className={styles.recCardTop}>
                  <div className={styles.recPillGov}>
                    <ShieldCheck size={12} aria-hidden="true" />
                    <span>Govt. of India · DPIIT</span>
                  </div>
                  <span className={styles.recCertPill}>
                    <span>Cert: {COMPANY.dpiitNumber}</span>
                  </span>
                </div>

                <div className={styles.recBrandRow}>
                  <div className={styles.recLogoBoxGov}>
                    <img
                      src="/images/startup-india-clean.png"
                      alt="Startup India DPIIT Recognition"
                      className={styles.recBrandLogoGov}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.recBrandMeta}>
                    <h3 className={styles.recCardTitle}>Startup India Recognized</h3>
                    <span className={styles.recOrgLabel}>Ministry of Commerce & Industry</span>
                  </div>
                </div>

                <p className={styles.recCardDesc}>
                  Officially recognized as an innovative startup under the Startup India initiative by the Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India. Valid through April 2036.
                </p>

                <div className={styles.recFeatureList}>
                  <div className={styles.recFeatureItem}>
                    <CheckCircle2 size={14} className={styles.recCheckIconGov} aria-hidden="true" />
                    <span>DPIIT Recognition Certificate No: {COMPANY.dpiitNumber}</span>
                  </div>
                  <div className={styles.recFeatureItem}>
                    <CheckCircle2 size={14} className={styles.recCheckIconGov} aria-hidden="true" />
                    <span>MCA Corporate ID (CIN): {COMPANY.cin}</span>
                  </div>
                  <div className={styles.recFeatureItem}>
                    <CheckCircle2 size={14} className={styles.recCheckIconGov} aria-hidden="true" />
                    <span>10-Year Statutory Period (Valid Upto {COMPANY.dpiitValidUpto})</span>
                  </div>
                </div>

                <div className={styles.recCardFooter}>
                  <a
                    href="/documents/dimisi-dpiit-certificate.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.recActionBtnGov}
                    aria-label="View official Startup India DPIIT certificate PDF"
                  >
                    <FileText size={14} aria-hidden="true" />
                    <span>View Recognition Certificate</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span className={styles.recMetaBadgeGov}>DPIIT Verified</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CORPORATE INFORMATION SECTION
          ========================================================================= */}
      <section className={styles.corporateSection} id="corporate-info" aria-label="Corporate Information">
        <div className={styles.container}>
          <div className={styles.corporateGrid}>
            {/* Left Column Text */}
            <div className={styles.corporateLeft}>
              <Reveal variant="fade">
                <div className={styles.eyebrowBadge}>
                  <span className={styles.badgeDot} aria-hidden="true" />
                  <span className={styles.badgeText}>CORPORATE INFORMATION</span>
                </div>
              </Reveal>

            <Reveal variant="up" delay={80}>
                <h2 className={styles.sectionTitle}>
                  DIMISI TECHNOLOGIES <br />
                  <span className={styles.accentGradient}>PRIVATE LIMITED</span>
                </h2>
              </Reveal>

              <Reveal variant="up" delay={140}>
                <p className={styles.sectionLead}>
                  A registered and compliant technology company in India, delivering enterprise
                  grade software systems and innovative digital products.
                </p>
              </Reveal>
            </div>

            {/* Right Column Table Card */}
            <Reveal variant="up" delay={200}>
              <div className={styles.corporateDetailsTable}>
                <div className={styles.corpRow}>
                  <div className={styles.corpLabel}>
                    <Building2 size={16} className={styles.corpIcon} />
                    <span>Legal Entity Name</span>
                  </div>
                  <div className={styles.corpValue}>
                    {COMPANY.name}
                  </div>
                </div>

                <div className={styles.corpRow}>
                  <div className={styles.corpLabel}>
                    <Hash size={16} className={styles.corpIcon} />
                    <span>Corporate ID (CIN)</span>
                  </div>
                  <div className={[styles.corpValue, styles.corpValueMono].join(" ")}>
                    {COMPANY.cin}
                  </div>
                </div>

                <div className={styles.corpRow}>
                  <div className={styles.corpLabel}>
                    <Award size={16} className={styles.corpIcon} />
                    <span>DPIIT Recognition</span>
                  </div>
                  <div className={styles.corpValue}>
                    Certificate: <strong>{COMPANY.dpiitNumber}</strong> (Startup India · Valid Upto {COMPANY.dpiitValidUpto})
                  </div>
                </div>

                <div className={styles.corpRow}>
                  <div className={styles.corpLabel}>
                    <ShieldCheck size={16} className={styles.corpIcon} />
                    <span>Registration Authority</span>
                  </div>
                  <div className={styles.corpValue}>
                    Incorporated under the Companies Act, 2013 ({COMPANY.mcaRegistered})
                  </div>
                </div>

                <div className={styles.corpRow}>
                  <div className={styles.corpLabel}>
                    <MapPin size={16} className={styles.corpIcon} />
                    <span>Registered Office</span>
                  </div>
                  <div className={styles.corpValue}>
                    {COMPANY.address}
                  </div>
                </div>

                <div className={styles.corpRow}>
                  <div className={styles.corpLabel}>
                    <Mail size={16} className={styles.corpIcon} />
                    <span>Official Email</span>
                  </div>
                  <div className={styles.corpValue}>
                    <a href={`mailto:${COMPANY.supportEmail}`} className={styles.corpLink}>
                      {COMPANY.supportEmail}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. READY TO BUILD / CALL TO ACTION SECTION
          ========================================================================= */}
      <section className={styles.ctaSection} id="ready-to-build" aria-label="Ready to Build">
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>LET'S BUILD TOGETHER</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h2 className={styles.sectionTitle}>
                Ready to Build, Scale, or{" "}
                <span className={styles.accentGradient}>Partner With Us?</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={140}>
              <p className={styles.sectionLead}>
                Whether you need enterprise software development, digital marketing that delivers,
                or want to collaborate on our upcoming social platform, we would love to connect.
              </p>
            </Reveal>

            <Reveal variant="up" delay={200}>
              <div className={styles.ctaActions}>
                <MagneticButton to="/contact" className={styles.primaryBtn}>
                  <span>Schedule a Consultation</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </MagneticButton>
                <MagneticButton to="/services" variant="ghost" className={styles.ghostBtn}>
                  <span>Explore Services</span>
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Global Network Ambient Visual at Bottom */}
        <div className={styles.ctaGlobalVisual} aria-hidden="true" />
      </section>
    </div>
  );
}

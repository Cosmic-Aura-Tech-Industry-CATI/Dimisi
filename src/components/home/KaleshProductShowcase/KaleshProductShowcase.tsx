import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  EyeOff,
  Radio,
  Image as ImageIcon,
  Trophy,
  Volume2,
  VolumeX,
  Users,
  ShieldCheck,
  Maximize2,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import styles from "./KaleshProductShowcase.module.css";

interface PollData {
  id: string;
  tabLabel: string;
  tabIcon: string;
  author: {
    avatar: string;
    name: string;
    handle: string;
    time: string;
    badge: string;
  };
  question: string;
  mediaLabel: string;
  options: {
    text: string;
    percentage: number;
  }[];
  reactions: {
    emoji: string;
    count: number;
  }[];
  totalVotes: number;
}

const POLLS: PollData[] = [
  {
    id: "ai-coding",
    tabLabel: "AI Coding (GIF)",
    tabIcon: "📊",
    author: {
      avatar: "#?",
      name: "Anonymous AI Architect",
      handle: "@neural_77",
      time: "Posted 12 mins ago in #DevDebate",
      badge: "REAL GIF ATTACHED",
    },
    question:
      '"Will AI Code Synthesis fully replace traditional mid-level full-stack developers before 2028?"',
    mediaLabel: "Real-time Code Generation Matrix Loop",
    options: [
      { text: "Yes, automated pipelines will take over code generation", percentage: 64 },
      { text: "No, architecture and domain edge cases require humans", percentage: 28 },
      { text: "Developers become AI prompt directors & auditors", percentage: 8 },
    ],
    reactions: [
      { emoji: "🔥", count: 142 },
      { emoji: "🤯", count: 89 },
      { emoji: "👏", count: 64 },
      { emoji: "💡", count: 37 },
    ],
    totalVotes: 1843,
  },
  {
    id: "cyberpunk-ux",
    tabLabel: "Cyberpunk UX",
    tabIcon: "🖼️",
    author: {
      avatar: "#?",
      name: "Anonymous Design Lead",
      handle: "@neon_flow",
      time: "Posted 24 mins ago in #DesignTrends",
      badge: "HIGH-FPS PROTOTYPE",
    },
    question:
      '"Should next-generation social apps discard traditional feeds for immersive spatial 3D interfaces?"',
    mediaLabel: "Interactive Spatial Wireframe Canvas",
    options: [
      { text: "Yes, spatial depth is the true future of consumer apps", percentage: 52 },
      { text: "No, minimal ultra-fast feeds always win retention", percentage: 41 },
      { text: "Hybrid holographic layers are the sweet spot", percentage: 7 },
    ],
    reactions: [
      { emoji: "🔥", count: 219 },
      { emoji: "🤯", count: 134 },
      { emoji: "👏", count: 98 },
      { emoji: "💡", count: 72 },
    ],
    totalVotes: 2419,
  },
  {
    id: "buttonless-phone",
    tabLabel: "Buttonless Phone",
    tabIcon: "📱",
    author: {
      avatar: "#?",
      name: "Anonymous Hardware Guru",
      handle: "@silicon_leak",
      time: "Posted 45 mins ago in #HardwareLab",
      badge: "3D CAD SCHEMATIC",
    },
    question:
      '"Will hardware-free buttonless smartphones dominate the flagship tech market by 2027?"',
    mediaLabel: "Solid-State Haptic Frame Simulation",
    options: [
      { text: "Yes, seamless haptic glass provides superior water sealing", percentage: 39 },
      { text: "No, tactile click response is indispensable for muscle memory", percentage: 48 },
      { text: "Only for ultra-luxury experimental halo flagships", percentage: 13 },
    ],
    reactions: [
      { emoji: "🔥", count: 95 },
      { emoji: "🤯", count: 62 },
      { emoji: "👏", count: 44 },
      { emoji: "💡", count: 29 },
    ],
    totalVotes: 1290,
  },
];

const FEATURES = [
  {
    icon: EyeOff,
    title: "100% Anonymous Voice",
    desc: "Express opinions, ask sensitive questions, and share thoughts without revealing your identity or facing social stigma.",
  },
  {
    icon: Radio,
    title: "Real-Time Live Polling",
    desc: "Launch instant live polls on trending topics, daily debates, and tech culture to capture unfiltered public sentiment.",
  },
  {
    icon: ImageIcon,
    title: "Rich Image & GIF Integration",
    desc: "Every poll supports high-framerate GIFs, screenshots, and prototype photos for visual comparisons and instant context.",
  },
  {
    icon: Trophy,
    title: "Contests & Rewards",
    desc: "Join prediction challenges, climb the weekly anonymous leaderboard, and unlock real reward pool tokens.",
  },
];

const FEED_ITEMS = [
  {
    text: "Anonymous user voted on option #1!",
    highlight: "",
    time: "Just now",
  },
  {
    text: 'Anonymous #3812 voted "',
    highlight: 'Autonomous AI"',
    time: "Just now",
  },
  {
    text: "Anonymous #0994 reacted 🔥 +1",
    highlight: "",
    time: "12s ago",
  },
  {
    text: 'Anonymous #7410 commented: "Clean design wins long term!"',
    highlight: "",
    time: "28s ago",
  },
];

export function KaleshProductShowcase() {
  const [activePollIndex, setActivePollIndex] = useState(0);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [reactionsState, setReactionsState] = useState<Record<string, number[]>>({
    "ai-coding": POLLS[0].reactions.map((r) => r.count),
    "cyberpunk-ux": POLLS[1].reactions.map((r) => r.count),
    "buttonless-phone": POLLS[2].reactions.map((r) => r.count),
  });

  const activePoll = POLLS[activePollIndex];
  const userVote = selectedOptions[activePoll.id];

  // Play synthesized subtle haptic sound using Web Audio API when sound is enabled
  const playSfx = (freq = 520, duration = 0.08) => {
    if (!sfxEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted or suspended by browser policy
    }
  };

  const handleVote = (optionIndex: number) => {
    playSfx(620, 0.1);
    setSelectedOptions((prev) => ({
      ...prev,
      [activePoll.id]: optionIndex,
    }));
  };

  const handleReactionClick = (rIdx: number) => {
    playSfx(780, 0.08);
    setReactionsState((prev) => {
      const cur = [...(prev[activePoll.id] || activePoll.reactions.map((r) => r.count))];
      cur[rIdx] = (cur[rIdx] || 0) + 1;
      return { ...prev, [activePoll.id]: cur };
    });
  };

  return (
    <section className={styles.section} id="kalesh-showcase" aria-label="Kalesh Platform Showcase">
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowRight} aria-hidden="true" />

      <div className={styles.container}>
        {/* HEADER SECTION */}
        <div className={styles.headerWrapper}>
          <div className={styles.eyebrowBadge}>
            <img
              src="/images/kalesh-logo.jpg"
              alt="Kalesh Logo"
              className={styles.eyebrowLogo}
              loading="lazy"
            />
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span className={styles.eyebrowText}>
              IN THE PIPELINE | OUR FLAGSHIP CONSUMER PLATFORM
            </span>
          </div>

          <h2 className={styles.mainHeading}>
            <span className={styles.headingWhite}>Speak Freely. Poll Instantly.</span>
            <span className={styles.headingGradient}>Discover Real Public Opinion.</span>
          </h2>

          <p className={styles.subText}>
            We are developing an innovative Anonymous Social Media &amp; Live Polling App designed to
            remove fear and judgment from online communication. It is a secure place where honest
            public voices meet real-time data insights.
          </p>
        </div>

        {/* MAIN SPLIT SHOWCASE */}
        <div className={styles.showcaseGrid}>
          {/* LEFT COLUMN: 4 FEATURE CARDS + LIVE FEED */}
          <div className={styles.leftCol}>
            {/* 2x2 FEATURE CARDS */}
            <div className={styles.featuresGrid}>
              {FEATURES.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div key={idx} className={styles.featureCard}>
                    <div className={styles.featureIconBox}>
                      <IconComponent size={20} />
                    </div>
                    <h3 className={styles.featureTitle}>{feat.title}</h3>
                    <p className={styles.featureDesc}>{feat.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* LIVE ANONYMOUS FEED STREAM */}
            <div className={styles.liveFeedCard}>
              <div className={styles.liveFeedHeader}>
                <div className={styles.liveFeedTitleGroup}>
                  <span className={styles.feedGreenDot} aria-hidden="true" />
                  <span className={styles.feedTitle}>Live Anonymous Feed Stream</span>
                </div>
                <span className={styles.encryptionBadge}>Encrypted 256-bit</span>
              </div>

              <div className={styles.feedList}>
                {FEED_ITEMS.map((item, i) => (
                  <div key={i} className={styles.feedItem}>
                    <span className={styles.feedItemText}>
                      {item.text}
                      {item.highlight ? (
                        <span className={styles.feedHighlight}>{item.highlight}</span>
                      ) : null}
                    </span>
                    <span className={styles.feedTime}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: KALESH SANDBOX INTERACTIVE MOCK */}
          <div className={styles.sandboxCard}>
            {/* WINDOW TOP BAR */}
            <div className={styles.windowBar}>
              <div className={styles.windowControls}>
                <div className={styles.windowDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <div className={styles.sandboxBrand}>
                  <img
                    src="/images/kalesh-logo.jpg"
                    alt="Kalesh Icon"
                    className={styles.sandboxLogo}
                  />
                  <span className={styles.sandboxTitle}>Kalesh Sandbox</span>
                </div>
              </div>

              <div className={styles.windowActions}>
                <button
                  type="button"
                  className={styles.sfxBtn}
                  onClick={() => setSfxEnabled(!sfxEnabled)}
                  title={sfxEnabled ? "Mute audio sound effects" : "Enable sound effects"}
                >
                  {sfxEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span>{sfxEnabled ? "SFX On" : "SFX Off"}</span>
                </button>

                <div className={styles.livePollBadge}>
                  <span className={styles.livePollDot} />
                  <span>Live Poll</span>
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTOR TABS */}
            <div className={styles.tabsRow}>
              <span className={styles.selectLabel}>Select Poll:</span>
              {POLLS.map((p, pIdx) => {
                const isActive = pIdx === activePollIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                    onClick={() => {
                      playSfx(480, 0.06);
                      setActivePollIndex(pIdx);
                    }}
                  >
                    <span>{p.tabIcon}</span>
                    <span>{p.tabLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* AUTHOR DETAILS */}
            <div className={styles.authorRow}>
              <div className={styles.authorLeft}>
                <div className={styles.authorAvatar}>{activePoll.author.avatar}</div>
                <div className={styles.authorMeta}>
                  <div className={styles.authorNameLine}>
                    <span className={styles.authorName}>{activePoll.author.name}</span>
                    <span className={styles.authorHandle}>{activePoll.author.handle}</span>
                  </div>
                  <span className={styles.authorTimestamp}>{activePoll.author.time}</span>
                </div>
              </div>
              <span className={styles.realBadge}>{activePoll.author.badge}</span>
            </div>

            {/* QUESTION TITLE */}
            <h4 className={styles.questionTitle}>{activePoll.question}</h4>

            {/* MEDIA VISUAL SHOWCASE */}
            <div className={styles.mediaCard}>
              <div className={styles.mediaBgGrid} aria-hidden="true" />
              <div className={styles.mediaCenterContent}>
                <img
                  src="/images/kalesh-logo.jpg"
                  alt="Kalesh App Official Icon"
                  className={styles.mediaLogoEmblem}
                />
                <span className={styles.mediaBrandTag}>
                  KALESH · THE UNFILTERED SOCIAL SPHERE
                </span>
              </div>
              <div className={styles.mediaFooterBar}>
                <span className={styles.mediaLoopText}>
                  <span>👁️</span>
                  <span>{activePoll.mediaLabel}</span>
                </span>
                <a
                  href="https://thekalesh.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mediaExternalLink}
                  title="Visit official website thekalesh.com"
                >
                  <span>thekalesh.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* INTERACTIVE POLL OPTIONS */}
            <div className={styles.pollOptionsList}>
              {activePoll.options.map((opt, oIdx) => {
                const isSelected = userVote === oIdx;
                // If user voted, adjust percentages dynamically
                let displayPercent = opt.percentage;
                if (userVote !== undefined) {
                  if (isSelected) {
                    displayPercent = Math.min(100, opt.percentage + 2);
                  } else {
                    displayPercent = Math.max(1, opt.percentage - 1);
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    className={`${styles.pollOptionBtn} ${
                      isSelected ? styles.pollOptionSelected : ""
                    }`}
                    onClick={() => handleVote(oIdx)}
                  >
                    <div
                      className={styles.pollProgressBar}
                      style={{ width: `${displayPercent}%` }}
                    />
                    <span className={styles.pollOptionText}>
                      {isSelected ? "✓ " : ""}
                      {opt.text}
                    </span>
                    <span className={styles.pollPercentage}>{displayPercent}%</span>
                  </button>
                );
              })}
            </div>

            {/* INSTANT REACTIONS */}
            <div className={styles.reactionsRow}>
              <span className={styles.reactionsLabel}>Instant Reactions:</span>
              {activePoll.reactions.map((r, rIdx) => {
                const liveCount =
                  reactionsState[activePoll.id]?.[rIdx] !== undefined
                    ? reactionsState[activePoll.id][rIdx]
                    : r.count;
                return (
                  <button
                    key={rIdx}
                    type="button"
                    className={styles.reactionBtn}
                    onClick={() => handleReactionClick(rIdx)}
                    title={`React with ${r.emoji}`}
                  >
                    <span>{r.emoji}</span>
                    <span>{liveCount}</span>
                  </button>
                );
              })}
            </div>

            {/* FOOTER STATS & SECURITY BANNER */}
            <div className={styles.sandboxFooter}>
              <div className={styles.votesCountGroup}>
                <Users size={15} className={styles.votesIcon} />
                <span>
                  {(activePoll.totalVotes + (userVote !== undefined ? 1 : 0)).toLocaleString()}{" "}
                  Anonymous Votes
                </span>
              </div>
              <span className={styles.unlockText}>Vote to unlock live breakdown</span>
            </div>

            <div className={styles.securityBanner}>
              <CheckCircle2 size={16} className={styles.shieldIcon} />
              <span className={styles.securityText}>
                Anonymous vote recorded securely! Identity hashed with zero tracking.
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION ACTION BUTTONS */}
        <div className={styles.ctaButtonGroup}>
          <a
            href="https://thekalesh.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryCtaBtn}
          >
            <img
              src="/images/kalesh-logo.jpg"
              alt=""
              className={styles.btnLogo}
              aria-hidden="true"
            />
            <span>Visit thekalesh.com</span>
            <ExternalLink size={16} />
          </a>

          <Link to="/work" className={styles.secondaryCtaBtn}>
            <span>Our Work &amp; Case Studies</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export default KaleshProductShowcase;

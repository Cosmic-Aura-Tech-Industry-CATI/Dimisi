// WhyChooseSection.tsx — Homepage section outlining client benefits, core philosophies,
// and startup-friendly scaling architectures.
//
// Visual language: dark, glowing, colorful per-concept illustrations on a fine
// dot-grid texture (no outer framing box around the section). Each of the 7 cards
// carries its own accent color and its own continuously-looping micro-animation.
//
// Hover feature: hovering a card lifts it slightly ("pops up a little") while
// every other card (and the heading) blurs/dims behind it. Moving the cursor out
// returns it to rest instantly.

import { useState } from "react";
import { motion } from "motion/react";

import { whyChoose } from "@/lib/site-data";
import { ParallaxSection } from "./section-kit";

const EASE = [0.4, 0, 0.2, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Per-concept accent palette                                                */
/* -------------------------------------------------------------------------- */

const ACCENTS = [
  { glow: "#a78bfa", mid: "#7c3aed", soft: "rgba(167,139,250,0.18)" }, // Product Thinking — violet
  { glow: "#fb923c", mid: "#ea580c", soft: "rgba(251,146,60,0.18)" }, // Startup-Friendly — amber
  { glow: "#34d399", mid: "#059669", soft: "rgba(52,211,153,0.18)" }, // Scalable Architecture — emerald
  { glow: "#38bdf8", mid: "#0284c7", soft: "rgba(56,189,248,0.18)" }, // AI Integration — sky
  { glow: "#fb7185", mid: "#e11d48", soft: "rgba(251,113,133,0.18)" }, // End-to-End — rose
  { glow: "#60a5fa", mid: "#2563eb", soft: "rgba(96,165,250,0.18)" }, // Long-Term Support — blue
  { glow: "#e879f9", mid: "#c026d3", soft: "rgba(232,121,249,0.18)" }, // Innovation Culture — fuchsia
];

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function DotGrid({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: "14px 14px",
        maskImage:
          "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
      }}
    />
  );
}

function Glow({ color, size = 140 }: { color: string; size?: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-2xl"
      style={{
        width: size,
        height: size,
        background: color,
        left: "50%",
        top: "50%",
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{ opacity: [0.25, 0.5, 0.25] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: EASE }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Bespoke illustrations — one per concept                                   */
/* -------------------------------------------------------------------------- */

function ProductThinkingArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  const nodes = [
    { x: 26, y: 22 },
    { x: 94, y: 26 },
    { x: 80, y: 90 },
  ];
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      {/* pedestal */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={26 + i * 3}
          y={92 + i * 7}
          width={68 - i * 6}
          height={7}
          rx={3.5}
          className="fill-foreground/10"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <motion.line
            x1={n.x}
            y1={n.y}
            x2={60}
            y2={58}
            stroke={accent.glow}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.35}
            animate={{ strokeDashoffset: [0, -16] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
          />
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={3.5}
            fill={accent.glow}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: EASE, delay: i * 0.2 }}
          />
        </g>
      ))}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: EASE }}
      >
        <ellipse cx={60} cy={58} rx={20} ry={17} fill={`url(#pt-${accent.mid})`} />
        <path
          d="M60 44a12 12 0 0 0-7 22c1.3 1 2 2.4 2 4v2h10v-2c0-1.6.7-3 2-4a12 12 0 0 0-7-22Z"
          fill="none"
          stroke={accent.glow}
          strokeWidth={2}
        />
        <line x1={55} y1={70} x2={65} y2={70} stroke={accent.glow} strokeWidth={2} opacity={0.7} />
      </motion.g>
      <defs>
        <radialGradient id={`pt-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.55} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function StartupArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1={50 - i * 8}
          y1={95}
          x2={50 - i * 8}
          y2={78}
          stroke={accent.glow}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
          animate={{ y1: [95, 118], y2: [78, 98], opacity: [0.55, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeIn", delay: i * 0.22 }}
        />
      ))}
      <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: EASE }}>
        <ellipse cx={60} cy={55} rx={22} ry={22} fill={`url(#su-${accent.mid})`} />
        <path
          d="M60 22c10 8 14 22 14 36 0 9-3 16-14 24-11-8-14-15-14-24 0-14 4-28 14-36Z"
          fill={accent.mid}
        />
        <circle cx={60} cy={50} r={5.5} fill="#0a0a0a" />
        <circle cx={60} cy={50} r={5.5} fill="none" stroke={accent.glow} strokeWidth={1.5} />
        <path d="M46 68c-8 2-11 11-11 19 7-2 12-7 15-12Z" fill={accent.mid} opacity={0.7} />
        <path d="M74 68c8 2 11 11 11 19-7-2-12-7-15-12Z" fill={accent.mid} opacity={0.7} />
        <motion.path
          d="M53 84c2 7 3.5 11 7 16 3.5-5 5-9 7-16-3.5 3.5-10.5 3.5-14 0Z"
          fill={accent.glow}
          animate={{ scaleY: [1, 1.4, 0.85, 1.2, 1], opacity: [0.85, 1, 0.7, 1, 0.85] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 84px" }}
        />
      </motion.g>
      <defs>
        <radialGradient id={`su-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.35} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function ScalableArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  const bars = [
    { x: 30, h: 20 },
    { x: 50, h: 38 },
    { x: 70, h: 28 },
    { x: 90, h: 50 },
  ];
  const base = 92;
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      <ellipse cx={60} cy={70} rx={46} ry={30} fill={`url(#sc-${accent.mid})`} />
      <line x1={18} y1={base} x2={102} y2={base} stroke={accent.glow} strokeWidth={1} opacity={0.3} />
      {bars.map((b, i) => (
        <motion.rect
          key={i}
          x={b.x - 7}
          width={14}
          rx={3}
          fill={accent.mid}
          animate={{ y: [base - 6, base - b.h], height: [6, b.h] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatType: "reverse", ease: EASE, delay: i * 0.15 }}
        />
      ))}
      {bars.map((b, i) => (
        <motion.rect
          key={`cap-${i}`}
          x={b.x - 7}
          width={14}
          height={3}
          rx={1.5}
          fill={accent.glow}
          animate={{ y: [base - 9, base - b.h - 3] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatType: "reverse", ease: EASE, delay: i * 0.15 }}
        />
      ))}
      <defs>
        <radialGradient id={`sc-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.25} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function AIIntegrationArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  const sats = [0, 60, 120, 180, 240, 300];
  const satColors = [accent.glow, "#f472b6", "#facc15", "#4ade80", "#60a5fa", "#f97316"];
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      <ellipse cx={60} cy={60} rx={44} ry={44} fill={`url(#ai-${accent.mid})`} />
      <motion.g
        style={{ transformOrigin: "60px 60px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        {sats.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 60 + Math.cos(rad) * 38;
          const y = 60 + Math.sin(rad) * 38;
          return (
            <g key={i}>
              <line x1={60} y1={60} x2={x} y2={y} stroke={accent.glow} strokeWidth={1} opacity={0.15} />
              <motion.circle
                cx={x}
                cy={y}
                r={5}
                fill={satColors[i % satColors.length]}
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: EASE, delay: i * 0.15 }}
              />
            </g>
          );
        })}
      </motion.g>
      <circle cx={60} cy={60} r={15} fill="#0a0a0a" stroke={accent.glow} strokeWidth={2} />
      <motion.circle
        cx={60}
        cy={60}
        r={7}
        fill={accent.glow}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: EASE }}
      />
      <defs>
        <radialGradient id={`ai-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.22} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function EndToEndArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  const points = [16, 45, 74, 103];
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      <ellipse cx={60} cy={60} rx={48} ry={26} fill={`url(#ee-${accent.mid})`} />
      <line x1={16} y1={60} x2={103} y2={60} stroke={accent.glow} strokeWidth={2} opacity={0.25} />
      {points.map((x, i) => (
        <circle key={i} cx={x} cy={60} r={5} fill={accent.mid} opacity={0.5} />
      ))}
      {points.map((x, i) => (
        <motion.circle
          key={`o-${i}`}
          cx={x}
          cy={60}
          r={5}
          fill={accent.glow}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: EASE, delay: i * 0.4 }}
        />
      ))}
      <motion.circle
        cy={60}
        r={4}
        fill="#fff"
        animate={{ cx: [16, 103], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      />
      <defs>
        <radialGradient id={`ee-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.2} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function LongTermArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      <ellipse cx={60} cy={60} rx={44} ry={44} fill={`url(#lt-${accent.mid})`} />
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={60}
          cy={60}
          r={10}
          fill="none"
          stroke={accent.glow}
          strokeWidth={1.5}
          animate={{ r: [10, 46], opacity: [0.55, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: i * 0.8 }}
        />
      ))}
      <circle cx={60} cy={60} r={16} fill="#0a0a0a" stroke={accent.glow} strokeWidth={2} />
      <path
        d="M60 51l6 3v6c0 5-2.5 8.5-6 10-3.5-1.5-6-5-6-10v-6Z"
        fill={accent.glow}
      />
      <motion.line
        x1={60}
        y1={60}
        x2={60}
        y2={34}
        stroke={accent.glow}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.6}
        style={{ transformOrigin: "60px 60px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <defs>
        <radialGradient id={`lt-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.22} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function InnovationArt({ accent }: { accent: (typeof ACCENTS)[number] }) {
  const particles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
      <ellipse cx={60} cy={60} rx={44} ry={44} fill={`url(#in-${accent.mid})`} />
      {particles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.circle
            key={i}
            cx={60}
            cy={60}
            r={2.5}
            fill={i % 2 === 0 ? accent.glow : "#fff"}
            animate={{
              cx: [60, 60 + Math.cos(rad) * 36],
              cy: [60, 60 + Math.sin(rad) * 36],
              opacity: [0.9, 0],
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: i * 0.06 }}
          />
        );
      })}
      <motion.path
        d="M60 30 L68 52 L90 60 L68 68 L60 90 L52 68 L30 60 L52 52 Z"
        fill={accent.mid}
        stroke={accent.glow}
        strokeWidth={1.5}
        animate={{ scale: [0.9, 1.08, 0.9], rotate: [0, 14, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: EASE }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <defs>
        <radialGradient id={`in-${accent.mid}`}>
          <stop offset="0%" stopColor={accent.glow} stopOpacity={0.25} />
          <stop offset="100%" stopColor={accent.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

const ARTS = [
  ProductThinkingArt,
  StartupArt,
  ScalableArt,
  AIIntegrationArt,
  EndToEndArt,
  LongTermArt,
  InnovationArt,
];

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

function WhyChooseCard({
  item,
  index,
  isActive,
  isDimmed,
  onEnter,
  onLeave,
  onTap,
}: {
  item: (typeof whyChoose)[number];
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onTap: () => void;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  const Art = ARTS[index % ARTS.length];

  return (
    <motion.div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onTap}
      animate={{
        opacity: isDimmed ? 0.35 : 1,
        scale: isActive ? 1.02 : 1,
        filter: isDimmed ? "blur(2px)" : "blur(0px)",
      }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border p-5"
      style={{
        borderColor: isActive ? accent.soft : "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <DotGrid color={accent.soft} />
      <div className="relative">
        <span
          className="font-display text-sm font-light tabular-nums"
          style={{ color: `${accent.glow}99` }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-2 font-display text-lg font-light text-foreground/90">
          {item.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/45">
          {item.description}
        </p>
      </div>

      <div className="relative mt-4 h-28 w-full">
        <Glow color={accent.glow} size={90} />
        <Art accent={accent} />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function WhyChooseSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const anyActive = activeIndex !== null;

  const isTouch = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  return (
    <ParallaxSection id="why" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            animate={{
              opacity: anyActive ? 0.35 : 1,
              filter: anyActive ? "blur(2px)" : "blur(0px)",
            }}
            transition={{ duration: 0.35, ease: EASE }}
            className="max-w-2xl text-left"
          >
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              Why Dimisi
            </span>

            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Why Teams Choose Dimisi
            </h2>

            <p className="mt-4 text-base leading-relaxed text-foreground/50 md:text-lg">
              We build like product owners — obsessed with outcomes, not just output.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {whyChoose.map((item, i) => (
              <WhyChooseCard
                key={item.title}
                item={item}
                index={i}
                isActive={activeIndex === i}
                isDimmed={anyActive && activeIndex !== i}
                onEnter={() => {
                  if (!isTouch()) setActiveIndex(i);
                }}
                onLeave={() => {
                  if (!isTouch()) setActiveIndex(null);
                }}
                onTap={() => {
                  if (isTouch()) setActiveIndex((prev) => (prev === i ? null : i));
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
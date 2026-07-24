// ProductsSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import kaleshLogo from "../../assets/kalesh.png";
import { OutlineButton, ParallaxSection } from "./section-kit";

/**
 * Theme tokens - keep these in sync with the :root variables defined in
 * your global stylesheet:
 *
 * --bg-primary: #050505;      --text-primary: #F8F8F6;
 * --bg-secondary: #0B0B0D;    --text-secondary: #ECECEC;
 * --surface: #111114;         --text-body: #B3B3BC;
 * --surface-hover: #17171B;   --text-muted: #8D8D95;
 * --border: rgba(255,255,255,.08);   --text-label: #666670;
 * --border-hover: rgba(255,255,255,.18);
 * --glass: rgba(255,255,255,.05);
 * --glow: rgba(255,255,255,.12);
 * --accent: #5EA8FF;
 */

const ANGSANA = "'Angsana New', 'Times New Roman', serif";

const KALESH = {
  name: "KALESH",
  eyebrow: "Social Platform",
  tagline: "Community & social engagement",
  description: "Kalesh, a flagship product of Dimisi Technologies Private Limited, is an anonymous social media platform that empowers people to share opinions, engage in meaningful conversations, and foster authentic connections without compromising their privacy.",
  href: "https://www.thekalesh.com/",
};

const RINGS = [
  { size: 460, duration: 34, opacity: 0.16, reverse: false },
  { size: 360, duration: 26, opacity: 0.2, reverse: true },
  { size: 260, duration: 20, opacity: 0.26, reverse: false },
];

const PARTICLES = [
  { top: "10%", left: "16%", size: 3, duration: 5, delay: 0, accent: true },
  { top: "20%", left: "80%", size: 2, duration: 6, delay: 0.6, accent: false },
  { top: "70%", left: "10%", size: 2, duration: 7, delay: 1.1, accent: false },
  { top: "80%", left: "72%", size: 3, duration: 5.5, delay: 0.3, accent: true },
  { top: "42%", left: "90%", size: 2, duration: 6.5, delay: 0.9, accent: false },
  { top: "52%", left: "4%", size: 2, duration: 6, delay: 1.4, accent: true },
];

// Reactions that float up through the glass panel, and toast-style
// notifications that slide in from the edges — the "pop out of screen and
// dissolve" language from the brief, built entirely from theme tokens so it
// reads as part of the black/white system instead of a pasted-in image.
const REACTIONS = [
  { emoji: "\u2764\ufe0f", x: "18%", delay: 0, duration: 3.4 },
  { emoji: "\ud83d\udd25", x: "68%", delay: 0.9, duration: 3.8 },
  { emoji: "\u2728", x: "40%", delay: 1.8, duration: 3.2 },
  { emoji: "\ud83d\udc4d", x: "80%", delay: 2.4, duration: 3.6 },
  { emoji: "\ud83d\udcac", x: "10%", delay: 3.1, duration: 3.5 },
];

const TOASTS = [
  { text: "New follower", side: "left" as const, top: "16%", delay: 0.2 },
  { text: "42 people reacted", side: "right" as const, top: "68%", delay: 2.6 },
  { text: "Trending in your circle", side: "left" as const, top: "78%", delay: 5.2 },
];

export function ProductsSection() {
  return (
    <ParallaxSection id="products" className="relative bg-[var(--bg-primary)] py-20 md:py-32">
      {(style) => (
        <motion.div style={style} className="relative mx-auto max-w-7xl px-4 md:px-6">
          {/* Ambient theme wash behind the whole section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,var(--glow),transparent_70%)] opacity-40"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            <h2
              className="text-4xl font-normal tracking-tight text-[var(--text-primary)] md:text-6xl"
              style={{ fontFamily: ANGSANA }}
            >
              Explore Our Products
            </h2>
            <p
              className="mt-4 max-w-xl text-base text-[var(--text-body)] md:text-lg"
              style={{ fontFamily: ANGSANA }}
            >
              Digital products crafted in-house - from social platforms to secure enterprise tooling.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 flex justify-start"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-4 py-1.5 text-[11px] uppercase tracking-widest text-[var(--text-secondary)] shadow-[0_0_20px_-6px_var(--glow)]"
              style={{ fontFamily: ANGSANA }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)]/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              </span>
              Now Available
            </span>
          </motion.div>

          <div className="relative mt-16 md:mt-20" style={{ perspective: 1600 }}>
            <KaleshShowcase />
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}

function KaleshShowcase() {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Same spring-smoothed tilt feel as ServiceCard / DimiMessageCard.
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  });

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.16), transparent 60%)`
  );

  const stackRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 90, damping: 18 });
  const stackRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 90, damping: 18 });
  const logoGlowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 22 });
  const logoGlowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 22 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto grid max-w-5xl items-stretch gap-14 md:grid-cols-[1.05fr_0.95fr] md:gap-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[460px] w-[460px] rounded-full bg-[var(--glow)] blur-[130px] md:h-[600px] md:w-[600px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.02 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1200 }}
        className="group relative order-2 flex flex-col justify-center overflow-hidden rounded-[2rem] border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--bg-secondary)] p-10 backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 hover:border-[var(--border-hover)] hover:shadow-[0_0_90px_-16px_var(--glow)] md:order-1 md:min-h-[560px] md:p-12"
      >
        {/* cursor-tracking glare, same treatment as ServiceCard / DimiMessageCard */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--glass)] via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
        <div className="pointer-events-none absolute -inset-px rounded-[2rem] border border-[var(--border)]/50" />

        <div className="relative text-left" style={{ transform: "translateZ(50px)" }}>
          <motion.div
            style={{ x: logoGlowX, y: logoGlowY }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-block"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 scale-150 rounded-full bg-[var(--glow)] blur-2xl" />
            <Image
              src={kaleshLogo}
              alt="Kalesh logo"
              width={64}
              height={64}
              className="h-14 w-14 object-contain drop-shadow-[0_0_28px_var(--glow)] md:h-16 md:w-16"
            />
          </motion.div>

          <p className="mt-7 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-label)]">
            {KALESH.eyebrow}
          </p>

          <h3
            className="mt-3 text-left text-4xl font-normal tracking-tight text-[var(--text-primary)] drop-shadow-[0_0_28px_var(--glow)] md:text-6xl"
            style={{ fontFamily: "'Angsana New', 'Times New Roman', serif" }}
          >
            {KALESH.name}
          </h3>
          <p className="mt-3 text-left text-base font-medium text-[var(--text-secondary)]">
            {KALESH.tagline}
          </p>
          <p className="mt-6 max-w-md text-left text-[15px] leading-relaxed text-[var(--text-body)]">
            {KALESH.description}
          </p>

          <div className="mt-10 inline-flex">
            <a
              href={KALESH.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative inline-block rounded-full"
            >
              <span className="pointer-events-none absolute -inset-2 rounded-full bg-[var(--accent)]/0 blur-md transition-colors duration-300 group-hover/btn:bg-[var(--accent)]/20" />
              <OutlineButton>Explore Kalesh</OutlineButton>
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative order-1 flex h-[360px] items-center justify-center md:order-2 md:h-[560px]"
      >
        <SocialPulseAnimation rotateX={stackRotateX} rotateY={stackRotateY} />
      </motion.div>
    </div>
  );
}

/**
 * Reaction emoji that spawns near the base of the panel and floats upward,
 * fading and dissolving out before it reaches the top — the "double-tap
 * like" burst you see across social apps, rebuilt as ambient loop.
 */
function FloatingReaction({
  emoji,
  x,
  delay,
  duration,
}: {
  emoji: string;
  x: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="absolute bottom-10 select-none text-4xl md:bottom-14 md:text-6xl"
      style={{ left: x, filter: "drop-shadow(0 0 10px var(--glow))" }}
      initial={{ opacity: 0, y: 0, scale: 0.4 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -70, -150, -220],
        scale: [0.4, 1, 0.9, 0.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatDelay: 1.6,
        delay,
        ease: "easeOut",
      }}
    >
      {emoji}
    </motion.span>
  );
}

/**
 * A notification toast that pops in from the left or right edge of the
 * panel, holds briefly, then dissolves back out - built entirely from glass
 * / border / accent tokens so it reads as native to the black-and-white
 * theme instead of a pasted-in image.
 */
function NotificationToast({
  text,
  side,
  top,
  delay,
}: {
  text: string;
  side: "left" | "right";
  top: string;
  delay: number;
}) {
  const restingX = 0;
  const fromX = side === "left" ? -70 : 70;
  const exitX = side === "left" ? -30 : 30;

  return (
    <motion.div
      className="absolute flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--glass)] px-3 py-1.5 text-[10px] text-[var(--text-secondary)] backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] md:text-xs"
      style={{ top, [side]: "6%" } as React.CSSProperties}
      initial={{ opacity: 0, x: fromX, filter: "blur(6px)" }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [fromX, restingX, restingX, exitX],
        filter: ["blur(6px)", "blur(0px)", "blur(0px)", "blur(6px)"],
      }}
      transition={{
        duration: 3.4,
        repeat: Infinity,
        repeatDelay: 2.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)]/60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </span>
      {text}
    </motion.div>
  );
}

/**
 * Replaces the old white phone-mockup panel. The panel itself is glass -
 * bg-[var(--glass)], a hairline border, heavy blur - so it dissolves into
 * the black backdrop instead of sitting on top of it. Everything inside is
 * built from the same monochrome + accent tokens as the rest of the site:
 * a pulsing outline heart at the centre, reactions rising and fading
 * through the glass, and notification toasts popping in from the edges
 * and dissolving back out. Ambient rings and particles are kept for
 * continuity with the section's existing atmosphere.
 */
function SocialPulseAnimation({
  rotateX,
  rotateY,
}: {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ perspective: 1400 }}
    >
      {/* Ambient rotating rings, kept for continuity with site theme */}
      {RINGS.map((ring, i) => (
        <motion.div
          key={i}
          animate={{ rotate: ring.reverse ? -360 : 360 }}
          transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full border border-[var(--border)]"
          style={{
            width: ring.size,
            height: ring.size,
            opacity: ring.opacity,
            background:
              "conic-gradient(from 0deg, transparent, var(--glow), transparent 55%, rgba(94,168,255,0.14), transparent 90%)",
          }}
        />
      ))}

      {/* No panel/box - everything floats directly over the ambient rings */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-[260px] w-[220px] md:h-[380px] md:w-[300px]"
      >
        {/* Reactions rising and dissolving in place of the old panel */}
        {REACTIONS.map((r, i) => (
          <FloatingReaction key={i} emoji={r.emoji} x={r.x} delay={r.delay} duration={r.duration} />
        ))}

        {/* Notification toasts popping in from the edges */}
        {TOASTS.map((t, i) => (
          <NotificationToast key={i} text={t.text} side={t.side} top={t.top} delay={t.delay} />
        ))}

        {/* Centre-piece: a pulsing outline heart, monochrome with an accent
            beat, so the "signature" of the panel stays quiet and singular */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            <motion.svg
              key={pulse}
              viewBox="0 0 48 48"
              className="h-16 w-16 md:h-24 md:w-24"
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: [0.9, 1.12, 1], opacity: [0.7, 1, 0.85] }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <path
                d="M24 40 C10 30 4 22 4 14.5 C4 8.5 9 4 15 4 C19 4 22.3 6.2 24 9.4 C25.7 6.2 29 4 33 4 C39 4 44 8.5 44 14.5 C44 22 38 30 24 40 Z"
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M24 40 C10 30 4 22 4 14.5 C4 8.5 9 4 15 4 C19 4 22.3 6.2 24 9.4 C25.7 6.2 29 4 33 4 C39 4 44 8.5 44 14.5 C44 22 38 30 24 40 Z"
                fill="var(--accent)"
                opacity="0.12"
              />
            </motion.svg>
          </AnimatePresence>
        </div>

        {/* Live engagement counter - top right, ticks up quietly */}
        <div className="absolute right-2 top-4 flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[var(--text-muted)] md:right-4 md:text-[10px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)]/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          Live
        </div>
      </motion.div>

      {PARTICLES.map((particle, index) => (
        <motion.div
          key={index}
          className="pointer-events-none absolute rounded-full"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.accent ? "var(--accent)" : "var(--text-secondary)",
            boxShadow: particle.accent
              ? "0 0 12px 2px rgba(94,168,255,0.6)"
              : "0 0 12px 2px var(--glow)",
          }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -10, 0] }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: "easeInOut", delay: particle.delay }}
        />
      ))}
    </div>
  );
}
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
import { OutlineButton, ParallaxSection, SectionHeading } from "./section-kit";

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

// Three layered phone mock-ups, back to front, matching the reference clip:
// a receding 3D stack that floats and drifts with the cursor.
const PHONE_LAYERS = [
  { z: -60, y: -46, scale: 0.82, rotate: -6, blur: 1.5, opacity: 0.45, duration: 7.5 },
  { z: -20, y: -22, scale: 0.91, rotate: -3, blur: 0.5, opacity: 0.72, duration: 6.5 },
  { z: 30, y: 0, scale: 1, rotate: 0, blur: 0, opacity: 1, duration: 5.5 },
];

// Sequence of "beats" from the reference video, looped: phones -> view
// counter -> earnings/coins -> prize wheel -> back to phones.
const SCENES = ["phones", "counter", "coins", "wheel"] as const;
type Scene = (typeof SCENES)[number];
const SCENE_DURATION = 3600;

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

          <SectionHeading
            label="Our Products"
            title="Explore Our Products"
            subtitle="Digital products crafted in-house - from social platforms to secure enterprise tooling."
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-4 py-1.5 text-[11px] uppercase tracking-widest text-[var(--text-secondary)] shadow-[0_0_20px_-6px_var(--glow)]">
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
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), { stiffness: 130, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), { stiffness: 130, damping: 20 });
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
        style={{ rotateX: rotateX, rotateY: rotateY, transformPerspective: 1200 }}
        className="group relative order-2 flex flex-col justify-center overflow-hidden rounded-[2rem] border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--bg-secondary)] p-10 backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 hover:border-[var(--border-hover)] hover:shadow-[0_0_90px_-16px_var(--glow)] md:order-1 md:min-h-[560px] md:p-12"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--glass)] via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
        <div className="pointer-events-none absolute -inset-px rounded-[2rem] border border-[var(--border)]/50" />

        <div className="relative" style={{ transform: "translateZ(50px)" }}>
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

          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-label)]">
            {KALESH.eyebrow}
          </p>

          <h3 className="mt-3 font-display text-4xl font-light tracking-tight text-[var(--text-primary)] drop-shadow-[0_0_28px_var(--glow)] md:text-6xl">
            {KALESH.name}
          </h3>
          <p className="mt-3 text-base font-medium text-[var(--text-secondary)]">
            {KALESH.tagline}
          </p>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--text-body)]">
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
        <ProductReel rotateX={stackRotateX} rotateY={stackRotateY} />
      </motion.div>
    </div>
  );
}

/**
 * Looping showcase reel: cycles through the same four beats as the
 * reference video (phone stack -> view counter -> coins -> prize wheel),
 * each with continuous internal motion, crossfading + sliding between
 * beats the same way the source clip cuts between shots.
 */
function ProductReel({
  rotateX,
  rotateY,
}: {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SCENES.length);
    }, SCENE_DURATION);
    return () => clearInterval(id);
  }, []);

  const scene: Scene = SCENES[index];

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ perspective: 1400 }}
    >
      {/* Ambient rings, present behind every beat */}
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

      <AnimatePresence mode="wait">
        {scene === "phones" && (
          <SceneWrap key="phones">
            <PhoneStack rotateX={rotateX} rotateY={rotateY} />
          </SceneWrap>
        )}
        {scene === "counter" && (
          <SceneWrap key="counter">
            <ViewCounterScene />
          </SceneWrap>
        )}
        {scene === "coins" && (
          <SceneWrap key="coins">
            <CoinsScene />
          </SceneWrap>
        )}
        {scene === "wheel" && (
          <SceneWrap key="wheel">
            <WheelScene />
          </SceneWrap>
        )}
      </AnimatePresence>

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

      {/* Progress dots so the loop reads as an intentional sequence */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {SCENES.map((s, i) => (
          <span
            key={s}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i === index ? 20 : 6,
              backgroundColor: i === index ? "var(--accent)" : "var(--border-hover)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SceneWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -28, scale: 0.96 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

function PhoneStack({
  rotateX,
  rotateY,
}: {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}) {
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative h-[280px] w-[170px] md:h-[400px] md:w-[240px]"
    >
      {PHONE_LAYERS.map((layer, index) => (
        <motion.div
          key={index}
          initial={{ y: layer.y + 40, opacity: 0 }}
          animate={{ y: [layer.y, layer.y - 12, layer.y], opacity: layer.opacity }}
          transition={{
            y: { duration: layer.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 },
            opacity: { duration: 0.6, delay: index * 0.12 },
          }}
          className="absolute inset-0"
          style={{
            transform: `translateZ(${layer.z}px) rotate(${layer.rotate}deg) scale(${layer.scale})`,
            filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
            zIndex: index,
          }}
        >
          <PhoneFrame />
        </motion.div>
      ))}
    </motion.div>
  );
}

function PhoneFrame() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[var(--bg-secondary)]/80 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)] backdrop-blur-md">
      <div className="flex items-center justify-between px-4 pt-3 text-[9px] text-[var(--text-muted)]">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-3 rounded-sm bg-[var(--text-muted)]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 px-4">
        <Image src={kaleshLogo} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-contain" />
        <span className="text-[11px] font-semibold text-[var(--text-primary)] drop-shadow-[0_0_10px_var(--glow)]">
          Kalesh
        </span>
      </div>

      <div className="mx-3 mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
        <div className="h-16 w-full rounded-lg bg-gradient-to-br from-[var(--accent)]/25 via-[var(--glass)] to-transparent md:h-24" />
        <div className="mt-2 h-1.5 w-3/4 rounded-full bg-[var(--border-hover)]" />
        <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-[var(--border)]" />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--text-primary)]">
            <span style={{ color: "var(--accent)" }}>&#9829;</span>
            12.4k
          </div>
          <div className="h-4 w-10 rounded-full bg-[var(--accent)]/20" />
        </div>
      </div>

      <div className="mt-3 space-y-1.5 px-4">
        <div className="h-1.5 w-full rounded-full bg-[var(--border)]" />
        <div className="h-1.5 w-4/5 rounded-full bg-[var(--border)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-[var(--border)] bg-[var(--bg-primary)]/60 py-2.5">
        <div className="h-2.5 w-2.5 rounded-sm bg-[var(--text-muted)]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" />
      </div>
    </div>
  );
}

/** Big glowing "X million+ Views" counter beat. */
function ViewCounterScene() {
  const [value, setValue] = useState(0);
  const target = 5;

  useEffect(() => {
    setValue(0);
    const id = setInterval(() => {
      setValue((current) => {
        if (current >= target) {
          clearInterval(id);
          return target;
        }
        return current + 1;
      });
    }, 140);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute h-56 w-56 rounded-full blur-[80px] md:h-72 md:w-72"
        style={{ backgroundColor: "rgba(94,168,255,0.18)" }}
      />
      <span className="font-display text-6xl font-bold text-[var(--text-primary)] drop-shadow-[0_0_36px_rgba(94,168,255,0.45)] md:text-7xl">
        {value}
        <span className="align-top text-3xl md:text-4xl">million+</span>
      </span>
      <span className="mt-2 text-lg font-medium uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Views
      </span>
    </div>
  );
}

/** Earnings ledger + rising coin stacks beat. */
function CoinsScene() {
  const coinColumns = [3, 5, 4, 6];

  return (
    <div className="flex items-end gap-6">
      <motion.div
        initial={{ rotate: -8, y: 20, opacity: 0 }}
        animate={{ rotate: -6, y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-40 w-28 rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-hover)] to-[var(--surface)] p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] md:h-52 md:w-36"
      >
        <div className="space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--accent)]/70" />
              <div className="h-1.5 flex-1 rounded-full bg-[var(--border-hover)]" />
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex items-end gap-2.5">
        {coinColumns.map((count, colIndex) => (
          <div key={colIndex} className="flex flex-col-reverse gap-0.5">
            {Array.from({ length: count }).map((_, coinIndex) => {
              const isTopCoin = coinIndex === count - 1;
              return (
                <motion.div
                  key={coinIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, y: [0, -3, 0] }}
                  transition={{
                    scale: { duration: 0.4, delay: colIndex * 0.12 + coinIndex * 0.05 },
                    opacity: { duration: 0.4, delay: colIndex * 0.12 + coinIndex * 0.05 },
                    y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: coinIndex * 0.15 },
                  }}
                  className="h-2.5 w-8 rounded-full border shadow-[0_2px_6px_rgba(0,0,0,0.4)] md:w-10"
                  style={{
                    borderColor: isTopCoin ? "rgba(94,168,255,0.6)" : "var(--border-hover)",
                    background: isTopCoin
                      ? "linear-gradient(to bottom, rgba(94,168,255,0.85), rgba(94,168,255,0.25))"
                      : "linear-gradient(to bottom, var(--text-secondary), var(--border))",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Spinning prize wheel under a glowing light, with a small crowd/bar row beneath. */
function WheelScene() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-4 h-10 w-10 rounded-full"
        style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 40px 14px rgba(94,168,255,0.55)" }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="relative h-32 w-32 rounded-full border-4 md:h-40 md:w-40"
        style={{
          borderColor: "var(--border-hover)",
          boxShadow: "0 0 50px -8px rgba(94,168,255,0.35)",
          background:
            "conic-gradient(rgba(94,168,255,0.35) 0deg 60deg, var(--glass) 60deg 120deg, rgba(94,168,255,0.35) 120deg 180deg, var(--glass) 180deg 240deg, rgba(94,168,255,0.35) 240deg 300deg, var(--glass) 300deg 360deg)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-widest text-[var(--text-primary)]">
          Kalesh
        </div>
        <div className="absolute inset-4 rounded-full border border-[var(--border)]" />
      </motion.div>

      <div className="mt-6 flex items-end gap-2 opacity-80">
        {[0.7, 1, 0.85, 1.05, 0.75].map((h, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="w-6 rounded-t-full"
            style={{ height: `${h * 44}px`, backgroundColor: "var(--border-hover)" }}
          />
        ))}
      </div>
    </div>
  );
}
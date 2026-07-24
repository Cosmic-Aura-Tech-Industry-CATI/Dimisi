// Hero.tsx — Centered editorial hero with corner light glows and animated
// vertical beam lines, matching the reference "premium 3D" look. Background
// gradient is left exactly as it was — nothing added or removed there.
"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "motion/react";
import { OutlineButton } from "./section-kit";

const EASE = [0.16, 1, 0.3, 1] as const;

// Two soft ambient glows anchored at the top corners of the viewport,
// blurred and low-opacity, pulsing very slowly. Purely decorative,
// sits behind all content (z-0) and never intercepts pointer events.
function CornerGlows() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -left-[10%] -top-[20%] h-[520px] w-[520px] rounded-full blur-[110px] sm:h-[640px] sm:w-[640px]"
        style={{ background: "rgba(255,255,255,0.10)" }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] -top-[20%] h-[520px] w-[520px] rounded-full blur-[110px] sm:h-[640px] sm:w-[640px]"
        style={{ background: "rgba(255,255,255,0.10)" }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </div>
  );
}

// Four thin vertical lines beneath the CTAs, each carrying a bright beam
// that travels down and fades, looped with a stagger so they never sync.
const LINE_OFFSETS = [-96, -32, 32, 96];

function AnimatedLines() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-full z-0 flex h-40 justify-center gap-0 sm:h-56">
      {LINE_OFFSETS.map((x, i) => (
        <div
          key={x}
          className="absolute top-0 h-full w-px"
          style={{
            left: `calc(50% + ${x}px)`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))",
          }}
        >
          <motion.span
            className="absolute left-1/2 top-0 h-16 w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))",
            }}
            animate={{ y: ["-20%", "220%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-x-clip px-4 pb-14 pt-28 sm:pt-32 md:pt-36 lg:px-10"
    >
      {/* Background left exactly as it was — not modified */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 38%, rgba(20,20,20,0.55) 0%, rgba(5,5,5,0.25) 55%, transparent 78%)",
        }}
      />
      <CornerGlows />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative flex flex-col items-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.4, ease: EASE }}
            className="font-display text-[clamp(2.2rem,7vw,5.5rem)] font-light leading-[0.96] tracking-[-0.045em] text-white"
          >
            Engineering the
            <br />
            Future of{" "}
            <span className="font-light italic text-[#B8B8B8]">
              Intelligent
            </span>
            <br />
            Software
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65, ease: EASE }}
            className="mt-4 max-w-[34ch] text-[0.82rem] leading-relaxed tracking-[-0.01em] text-[#9A9A9A] sm:mt-5 sm:max-w-[38ch] sm:text-[0.95rem]"
          >
            AI products, enterprise software and SaaS platforms — engineered
            with precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: EASE }}
            className="mt-6 flex w-full flex-col items-center gap-3 sm:mt-7 sm:w-auto sm:flex-row sm:gap-4"
          >
            <OutlineButton onClick={() => scrollTo("contact")}>
              Start Your Project
            </OutlineButton>
            <OutlineButton onClick={() => scrollTo("work")}>
              Explore Our Work
            </OutlineButton>
          </motion.div>

          <AnimatedLines />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="relative z-30 mt-10 sm:mt-6"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-white/70"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
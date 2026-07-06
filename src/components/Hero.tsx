import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import heroPortrait from "@/assets/hero-bg.png";
const EASE = [0.16, 1, 0.3, 1] as const;

/* Magnetic glass pill button — follows the cursor slightly, soft reflections. */
function MagneticButton({
  children,
  variant = "primary",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    my.set((e.clientY - (rect.top + rect.height / 2)) * 0.45);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  const isPrimary = variant === "primary";

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-4 text-sm font-medium tracking-tight transition-colors duration-500 ${
        isPrimary
          ? "text-[#080808]"
          : "text-[#EDEDED] backdrop-blur-xl"
      }`}
    >
      {isPrimary ? (
        <span
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-white to-[#D6D6D6] transition-all duration-500 group-hover:brightness-110"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 40px -10px rgba(255,255,255,0.35)",
          }}
        />
      ) : (
        <span
          className="absolute inset-0 -z-10 rounded-full border border-white/15 bg-white/[0.04] transition-all duration-500 group-hover:border-white/30 group-hover:bg-white/[0.08]"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 30px -12px rgba(0,0,0,0.8)",
          }}
        />
      )}
      {children}
      {isPrimary ? (
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
      ) : (
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </motion.button>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Portrait: a tall cutout whose head sits at the middle of the hero and whose
  // body flows down into the next section — gentle parallax so more of the body
  // is revealed as you scroll, never fully fading out.
  const portraitScaleRaw = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const portraitScale = useSpring(portraitScaleRaw, {
    stiffness: 90,
    damping: 28,
  });
  const portraitYRaw = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const portraitY = useSpring(portraitYRaw, {
    stiffness: 90,
    damping: 28,
  });
  const portraitOpacityRaw = useTransform(
    scrollYProgress,
    [0, 0.5, 0.8, 1],
    [1, 0.95, 0.7, 0.4],
  );
  const portraitOpacity = useSpring(portraitOpacityRaw, {
    stiffness: 90,
    damping: 28,
  });
  // Progressive blur as the portrait crosses into the next section — the core
  // of the scroll-triggered blend so the cutout dissolves instead of cutting.
  const portraitBlurRaw = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    [0, 0, 12],
  );
  const portraitBlur = useSpring(portraitBlurRaw, {
    stiffness: 90,
    damping: 28,
  });
  const portraitFilter = useMotionTemplate`blur(${portraitBlur}px)`;

  // Bottom blend overlay strengthens on scroll for a seamless hand-off.
  const blendOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0.35, 0.7, 1]);

  // Text: sits in the upper half above the head, lifts and fades on scroll.
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      ref={heroRef}
className="relative flex min-h-screen w-full flex-col items-center px-4 pt-28 pb-16 md:pt-32"
    >
      {/* Cinematic cutout — head begins at the middle of the hero, the body
          flows down into the next section and softly blends into the black. */}
      <motion.div
        style={{
          scale: portraitScale,
          y: portraitY,
          opacity: portraitOpacity,
          filter: portraitFilter,
          willChange: "transform, opacity, filter",
        }}
       className="pointer-events-none absolute inset-x-0 top-[30%] z-[-1] flex justify-center sm:top-[28%]"
      >
        <img
          src={heroPortrait}
          alt="Cybernetic portrait representing Dimisi's intelligent software and AI engineering"
          width={585}
          height={876}
          className="h-[170vh] w-auto max-w-none select-none object-contain object-top sm:h-[185vh]"
          draggable={false}
          style={{
            transformOrigin: "top center",
            filter: "grayscale(1) brightness(0.7) contrast(1.15)",
            WebkitMaskImage:
  "linear-gradient(to bottom, #000 0%, #000 45%, transparent 68%)",
maskImage:
  "linear-gradient(to bottom, #000 0%, #000 45%, transparent 68%)",
          }}
        />
      </motion.div>




      {/* Dark radial vignette behind the text (upper area) for crisp contrast */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 30%, rgba(5,5,5,0.82) 0%, rgba(5,5,5,0.4) 48%, transparent 74%)",
        }}
      />


      {/* Centered editorial typography */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] px-5 py-2 text-[0.62rem] uppercase tracking-[0.32em] text-[#CFCFCF] backdrop-blur-xl sm:text-[0.68rem]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          Software • Artificial Intelligence • Cloud
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
          className="mt-5 font-display text-[clamp(2.4rem,6.2vw,5.5rem)] font-light leading-[0.96] tracking-[-0.045em] text-white sm:mt-6"
        >
          Engineering the
          <br />
          Future of{" "}
          <span className="font-light italic text-[#B8B8B8]">Intelligent</span>
          <br />
          Software
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.78, ease: EASE }}
          className="mt-4 max-w-[38ch] text-[0.82rem] leading-relaxed tracking-[-0.01em] text-[#9A9A9A] sm:mt-5 sm:text-[0.95rem]"
        >
          AI products, enterprise software and SaaS platforms — engineered with
          precision.
        </motion.p>


        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.98, ease: EASE }}
          className="mt-6 flex w-full flex-col items-center gap-3 sm:mt-7 sm:w-auto sm:flex-row sm:gap-4"
        >
          <MagneticButton onClick={() => scrollTo("contact")}>
            Start Your Project
          </MagneticButton>
          <MagneticButton variant="ghost" onClick={() => scrollTo("work")}>
            Explore Our Work
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll-triggered blend into the next section — intensifies as you scroll */}
      <motion.div
        style={{ opacity: blendOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-56"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.55) 55%, #050505 100%)",
          }}
        />
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2"
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

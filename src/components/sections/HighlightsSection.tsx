// HighlightsSection.tsx — Homepage section displaying key company stats (e.g. services, products count) in interactive grid cards.
import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";

import { highlights } from "@/lib/site-data";
import { ParallaxSection } from "./section-kit";

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function HighlightCard({
  stat,
  index,
  onHoverChange,
}: {
  stat: (typeof highlights)[number];
  index: number;
  onHoverChange: (index: number | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  });

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), transparent 60%)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseEnter() {
    onHoverChange(index);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    onHoverChange(null);
  }

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ scale: { duration: 0.3 }, y: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 text-center transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.05] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.25)]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glareBackground }}
      />

      <div
        style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        className="relative"
      >
        <motion.div
          className="font-display text-2xl font-light text-foreground/90 transition-colors duration-300 group-hover:text-foreground md:text-3xl"
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {stat.value}
        </motion.div>
        <div className="mt-2 text-xs uppercase tracking-widest text-foreground/40 transition-colors duration-300 group-hover:text-foreground/60">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
}

export function HighlightsSection() {
  const [, setHoveredIndex] = useState<number | null>(null);

  return (
    <ParallaxSection id="highlights" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl text-left">
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg"
            >
              At a Glance
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Company Highlights
            </motion.h2>
          </div>

          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}

            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            style={{ perspective: 1000 }}

            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"

          >
            {highlights.map((stat, i) => (
              <HighlightCard
                key={stat.label}
                stat={stat}
                index={i}
                onHoverChange={setHoveredIndex}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
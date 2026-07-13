// WhyChooseSection.tsx — Homepage section outlining client benefits, core philosophies, and startup-friendly scaling architectures.
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { whyChoose } from "@/lib/site-data";
import { ParallaxSection, SectionHeading } from "./section-kit";

function WhyChooseCard({
  item,
  index,
}: {
  item: (typeof whyChoose)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [10, -10]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ scale: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.05] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.25)]"
    >
      {/* glare that tracks the cursor, adds to the 3D feel */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), transparent 60%)`
          ),
        }}
      />

      <div
        style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}
        className="relative"
      >
        <span className="font-display text-2xl font-light text-foreground/30 transition-colors duration-300 group-hover:text-foreground/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-4 font-display text-lg font-light text-foreground/90 transition-colors duration-300 group-hover:text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/50 transition-colors duration-300 group-hover:text-foreground/80">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

export function WhyChooseSection() {
  return (
    <ParallaxSection id="why" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            label="Why Dimisi"
            title="Why Teams Choose Dimisi"
            subtitle="We build like product owners — obsessed with outcomes, not just output."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            style={{ perspective: 1000 }}
          >
            {whyChoose.map((item, i) => (
              <WhyChooseCard key={item.title} item={item} index={i} />
            ))}
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
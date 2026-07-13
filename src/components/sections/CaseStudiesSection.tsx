// CaseStudiesSection.tsx — Homepage section showcasing grid cards of selected client case studies with outcome highlights.
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { caseStudies } from "@/lib/site-data";
import { OutlineButton, ParallaxSection, SectionHeading } from "./section-kit";

function CaseStudyCard({ study }: { study: (typeof caseStudies)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [8, -8]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
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
        transformPerspective: 900,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ scale: { duration: 0.3 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.05] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.25)]"
    >
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
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
        className="relative flex flex-1 flex-col"
      >
        <span className="text-xs uppercase tracking-widest text-foreground/40 transition-colors duration-300 group-hover:text-foreground/60">
          {study.category}
        </span>
        <h3 className="mt-4 font-display text-xl font-light text-foreground/90 transition-colors duration-300 group-hover:text-foreground">
          {study.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/50 transition-colors duration-300 group-hover:text-foreground/80">
          {study.overview}
        </p>
        <p className="mt-4 border-t border-foreground/10 pt-4 text-sm leading-relaxed text-foreground/60 transition-colors duration-300 group-hover:border-foreground/20 group-hover:text-foreground/90">
          {study.outcome}
        </p>
      </div>
    </motion.div>
  );
}

export function CaseStudiesSection() {
  return (
    <ParallaxSection id="work" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            label="Our Work"
            title="Selected Case Studies"
            subtitle="Real outcomes for startups and enterprises across industries."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3"
            style={{ perspective: 1000 }}
          >
            {caseStudies.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </motion.div>

          <div className="mt-14 flex justify-center">
            <OutlineButton>View All Case Studies</OutlineButton>
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
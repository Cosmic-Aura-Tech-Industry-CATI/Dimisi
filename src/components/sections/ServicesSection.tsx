// ServicesSection.tsx — Homepage section displaying services grid cards with Lucide icons and description snippets.
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { services } from "@/lib/site-data";
import { OutlineButton, ParallaxSection, SectionHeading } from "./section-kit";

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  const Icon = service.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-smoothed rotation for a natural, slightly delayed tilt
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [10, -10]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );

  // Subtle glare/light position that follows the cursor
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
        style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        className="relative"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03] transition-all duration-300 group-hover:scale-110 group-hover:border-foreground/30 group-hover:bg-foreground/[0.08]">
          <Icon className="h-5 w-5 text-foreground/80 transition-colors duration-300 group-hover:text-foreground" />
        </div>

        <h3 className="mt-5 font-display text-lg font-light text-foreground/90 transition-colors duration-300 group-hover:text-foreground">
          {service.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-foreground/50 transition-colors duration-300 group-hover:text-foreground/80">
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

export function ServicesSection() {
  return (
    <ParallaxSection id="services" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            label="What We Do"
            title="Services That Move You Forward"
            subtitle="End-to-end capabilities across strategy, design, engineering, and growth."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            style={{ perspective: 1000 }}
          >
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </motion.div>

          <div className="mt-14 flex justify-center">
            <OutlineButton>View All Services</OutlineButton>
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
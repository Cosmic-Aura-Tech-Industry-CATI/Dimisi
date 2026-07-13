// HighlightsSection.tsx — Homepage section displaying key company stats (e.g. services, products count) in interactive grid cards.
import { motion } from "motion/react";

import { highlights } from "@/lib/site-data";
import { ParallaxSection, SectionHeading, TiltCard } from "./section-kit";

export function HighlightsSection() {
  return (
    <ParallaxSection id="highlights" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            label="At a Glance"
            title="Company Highlights"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {highlights.map((stat) => (
              <TiltCard
                key={stat.label}
                className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 text-center transition-colors hover:border-foreground/30"
              >
                <div className="font-display text-2xl font-light text-foreground md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-widest text-foreground/40">
                  {stat.label}
                </div>
              </TiltCard>
            ))}
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}

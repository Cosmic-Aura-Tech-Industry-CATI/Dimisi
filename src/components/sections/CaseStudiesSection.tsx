// CaseStudiesSection.tsx — Homepage section showcasing grid cards of selected client case studies with outcome highlights.
import { motion } from "motion/react";

import { caseStudies } from "@/lib/site-data";
import {
  OutlineButton,
  ParallaxSection,
  SectionHeading,
  TiltCard,
} from "./section-kit";

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
          >
            {caseStudies.map((study) => (
              <TiltCard
                key={study.slug}
                className="flex flex-col rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 transition-colors hover:border-foreground/30"
              >
                <span className="text-xs uppercase tracking-widest text-foreground/40">
                  {study.category}
                </span>
                <h3 className="mt-4 font-display text-xl font-light text-foreground">
                  {study.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/50">
                  {study.overview}
                </p>
                <p className="mt-4 border-t border-foreground/10 pt-4 text-sm leading-relaxed text-foreground/60">
                  {study.outcome}
                </p>
              </TiltCard>
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

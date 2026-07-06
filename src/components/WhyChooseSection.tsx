import { motion } from "motion/react";

import { whyChoose } from "@/lib/site-data";
import { ParallaxSection, SectionHeading, TiltCard } from "./section-kit";

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
          >
            {whyChoose.map((item, i) => (
              <TiltCard
                key={item.title}
                className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/30"
              >
                <span className="font-display text-2xl font-light text-foreground/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-light text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/50">
                  {item.description}
                </p>
              </TiltCard>
            ))}
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}

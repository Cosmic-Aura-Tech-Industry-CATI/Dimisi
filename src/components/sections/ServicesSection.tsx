// ServicesSection.tsx — Homepage section displaying services grid cards with Lucide icons and description snippets.
import { motion } from "motion/react";

import { services } from "@/lib/site-data";
import {
  OutlineButton,
  ParallaxSection,
  SectionHeading,
  TiltCard,
} from "./section-kit";

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
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <TiltCard
                  key={service.slug}
                  className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03]">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-light text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/50">
                    {service.description}
                  </p>
                </TiltCard>
              );
            })}
          </motion.div>

          <div className="mt-14 flex justify-center">
            <OutlineButton>View All Services</OutlineButton>
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}

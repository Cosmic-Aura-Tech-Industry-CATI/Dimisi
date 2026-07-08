// TechStackSection.tsx — Homepage section listing frontend, backend, database, cloud, and AI libraries/frameworks in organized grids.
import { motion } from "motion/react";

import { techStack } from "@/lib/site-data";
import { ParallaxSection, SectionHeading, TiltCard } from "./section-kit";

export function TechStackSection() {
  return (
    <ParallaxSection id="technology" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            label="Technology Ecosystem"
            title="The Stack Behind Our Work"
            subtitle="A modern, battle-tested toolset spanning frontend, backend, data, cloud, and AI."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
          >
            {techStack.map((column) => {
              const Icon = column.icon;
              return (
                <TiltCard
                  key={column.title}
                  className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03]">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mt-5 font-display text-base font-medium text-foreground">
                    {column.title}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {column.items.map((item) => (
                      <li key={item} className="text-sm text-foreground/50">
                        {item}
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}

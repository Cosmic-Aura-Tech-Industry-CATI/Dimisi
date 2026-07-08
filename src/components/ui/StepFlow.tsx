"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

/**
 * Horizontal animated step-flow. The connecting line draws in on scroll,
 * and each step node staggers into view. Works for any number of steps.
 */
export function StepFlow({ steps }: { steps: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="relative mt-14">
      {/* Connecting line (desktop) */}
      <div className="pointer-events-none absolute inset-x-0 top-6 hidden lg:block">
        <div className="relative mx-[7%] h-px overflow-hidden bg-foreground/10">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-foreground/50 via-foreground/30 to-foreground/10"
            initial={{ width: "0%" }}
            animate={inView ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="relative flex flex-wrap justify-center gap-8 lg:flex-nowrap lg:justify-between lg:gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="flex w-[40%] flex-col items-center text-center sm:w-[28%] lg:w-auto lg:flex-1"
          >
            <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-foreground/20 bg-[#050505] text-sm font-medium text-foreground/70 transition-colors duration-300 hover:border-foreground/50 hover:text-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mt-3 text-sm font-medium leading-tight text-foreground">
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

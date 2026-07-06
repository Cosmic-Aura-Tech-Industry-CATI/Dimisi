import type { ReactNode } from "react";
import { motion } from "motion/react";

type PageHeroProps = {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
};

export function PageHero({ label, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-14 md:px-8 md:pt-36 md:pb-16">
      {/* Soft top glow */}
      <div className="glow-radial pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.04,
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {label ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-4 text-xs uppercase tracking-[0.2em] text-foreground/40"
          >
            {label}
          </motion.p>
        ) : null}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="font-light leading-[1.08] tracking-tight text-foreground [font-size:clamp(34px,6vw,60px)]"
        >
          {title}
        </motion.h1>
        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/50 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        ) : null}
        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

// ServicesSection.tsx — Homepage section displaying services as a vertical,
// numbered list. Each row expands to reveal its description when hovered or
// focused, with a connecting spine line and a glowing accent marker on the
// active number — mirrors the "index / expand" pattern from the reference.
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { services } from "@/lib/site-data";
import { OutlineButton, ParallaxSection } from "./section-kit";

const ACCENT = "#FFFFFF";

function ServiceRow({
  service,
  index,
  isActive,
  onActivate,
}: {
  service: (typeof services)[number];
  index: number;
  isActive: boolean;
  onActivate: (i: number | null) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onActivate(index);
      }}
      className="group relative flex items-start gap-6 outline-none"
    >
      {/* number + spine */}
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{
            borderColor: isActive ? ACCENT : "rgba(255,255,255,0.12)",
            color: isActive ? ACCENT : "rgba(255,255,255,0.4)",
            boxShadow: isActive
              ? `0 0 0 4px ${ACCENT}1a, 0 0 24px -4px ${ACCENT}66`
              : "0 0 0 0px transparent",
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background font-display text-sm"
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>

        {/* connecting line to the next row */}
        {index < services.length - 1 && (
          <div className="w-px flex-1 bg-foreground/10" />
        )}
      </div>

      {/* content */}
      <div className="min-w-0 flex-1 pb-10">
        <motion.div
          animate={{
            backgroundColor: isActive
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0)",
            borderColor: isActive
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0)",
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="-mt-1 rounded-2xl border px-5 py-4"
        >
          <div className="flex items-center gap-3">
            {/* accent tick, mirrors the small dash in the reference */}
            <motion.span
              animate={{
                width: isActive ? 24 : 0,
                opacity: isActive ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-px shrink-0"
              style={{ backgroundColor: ACCENT }}
            />

            <h3
              className={`font-display text-lg font-medium transition-colors duration-300 md:text-xl ${
                isActive ? "text-foreground" : "text-foreground/60"
              }`}
            >
              {service.title}
            </h3>
          </div>

          <AnimatePresence initial={false}>
            {isActive && (
              <motion.div
                key="description"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/50 md:text-base">
                  {service.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <ParallaxSection id="services" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl text-left">
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              What We Do
            </span>

            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Services That Move You Forward
            </h2>

            <p className="mt-4 text-base leading-relaxed text-foreground/50 md:text-lg">
              End-to-end capabilities across strategy, design, engineering, and
              growth.
            </p>
          </div>

          <div
            className="mt-14 max-w-4xl"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {services.map((service, i) => (
              <ServiceRow
                key={service.slug}
                service={service}
                index={i}
                isActive={activeIndex === i}
                onActivate={setActiveIndex}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-start">
            <OutlineButton>View All Services</OutlineButton>
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
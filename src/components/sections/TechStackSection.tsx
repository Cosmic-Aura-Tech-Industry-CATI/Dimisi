// TechStackSection.tsx — Homepage section listing every technology in the
// stack as an infinite marquee: two rows of pill badges scroll continuously
// in opposite directions, each item exiting one edge and looping back in
// from the other. Pauses on hover; individual badges still brighten on
// hover/focus. Matches the site's existing foreground-opacity theme.
import { motion } from "motion/react";

import { techStack } from "@/lib/site-data";
import { ParallaxSection } from "./section-kit";

// Flatten every column's items into one list so nothing in the stack is missed.
const allTech = techStack.flatMap((column) => column.items);

// Split into two interleaved rows so both rows get a mix of the stack
// rather than one row being "all frontend" etc.
const rowA = allTech.filter((_, i) => i % 2 === 0);
const rowB = allTech.filter((_, i) => i % 2 === 1);

function TechBadge({ name }: { name: string }) {
  return (
    <span className="ts-badge inline-flex shrink-0 select-none items-center rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-6 py-3.5 font-mono text-base text-foreground/40 outline-none transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.08] hover:text-foreground hover:shadow-[0_0_30px_-8px_rgba(255,255,255,0.35)]">
      {name}
    </span>
  );
}

function MarqueeRow({
  items,
  direction,
  speedSeconds,
}: {
  items: string[];
  direction: "left" | "right";
  speedSeconds: number;
}) {
  return (
    <div className="ts-row group relative overflow-hidden">
      {/* edge fade so items visually dissolve into the background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-28" />

      <div
        className={`ts-track flex w-max items-center gap-4 md:gap-5 ${
          direction === "left" ? "ts-track-left" : "ts-track-right"
        }`}
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {/* render the row twice back-to-back so the loop is seamless */}
        {[...items, ...items].map((name, i) => (
          <TechBadge key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}

export function TechStackSection() {
  return (
    <ParallaxSection id="technology" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          {/* keyframes for the marquee track; animation-play-state pauses on row hover */}
          <style>{`
            @keyframes ts-scroll-left {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes ts-scroll-right {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
            .ts-track-left {
              animation-name: ts-scroll-left;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }
            .ts-track-right {
              animation-name: ts-scroll-right;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }
            .ts-row:hover .ts-track {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .ts-track-left, .ts-track-right {
                animation: none;
              }
            }
          `}</style>

          <div className="max-w-2xl text-left">
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              Technology Ecosystem
            </span>

            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
             Our Tech Stack
            </h2>

            <p className="mt-4 text-base leading-relaxed text-foreground/50 md:text-lg">
              A modern, battle-tested toolset spanning frontend, backend, data,
              cloud, and AI.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 space-y-9"
          >
            <MarqueeRow items={rowA} direction="left" speedSeconds={rowA.length * 2.0} />
            <MarqueeRow items={rowB} direction="right" speedSeconds={rowB.length * 2.0} />
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
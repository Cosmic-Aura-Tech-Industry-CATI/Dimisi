import { Reveal } from "@/components/ui/Reveal";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { highlights } from "@/lib/site-data";

export function Highlights() {
  return (
    <CinematicSection className="bg-[#050505] px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/10 md:grid-cols-3 lg:grid-cols-5">
          {highlights.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <div className="group flex h-full flex-col items-center justify-center bg-[#050505] px-4 py-10 text-center transition-colors duration-300 hover:bg-foreground/[0.03]">
                <span className="font-light text-foreground transition-transform duration-300 group-hover:scale-105 [font-size:clamp(24px,3vw,34px)]">
                  {stat.value}
                </span>
                <span className="mt-2 text-xs uppercase tracking-wider text-foreground/40">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </CinematicSection>
  );
}

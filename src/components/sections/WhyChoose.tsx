import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { whyChoose } from "@/lib/site-data";

export function WhyChoose() {
  return (
    <CinematicSection className="bg-[#050505] px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Why Choose Dimisi"
          title="Built for Outcomes, Not Just Output"
          subtitle="We combine product thinking, engineering depth, and long-term partnership."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05} className="h-full">
              <TiltCard className="h-full" max={6}>
                <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]">
                  <span className="text-xs font-medium text-foreground/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/50">{item.description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </CinematicSection>
  );
}

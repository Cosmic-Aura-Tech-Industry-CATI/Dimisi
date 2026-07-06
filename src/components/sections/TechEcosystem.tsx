import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { techStack } from "@/lib/site-data";

export function TechEcosystem() {
  return (
    <CinematicSection className="bg-[#050505] px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Technology Ecosystem"
          title="A Modern, Battle-Tested Stack"
          subtitle="We choose the right tools for the job — proven technologies across every layer of the stack."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {techStack.map((col, i) => (
            <Reveal key={col.title} delay={i * 0.06} className="h-full">
              <TiltCard className="h-full" max={6}>
                <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]">
                  <col.icon className="mb-4 h-6 w-6 text-foreground/60" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">
                    {col.title}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {col.items.map((item) => (
                      <li key={item} className="text-sm text-foreground/50">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </CinematicSection>
  );
}

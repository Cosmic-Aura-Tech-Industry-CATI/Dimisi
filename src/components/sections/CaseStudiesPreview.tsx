import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillButton } from "@/components/ui/PillButton";
import { CaseStudyCard } from "@/components/ui/CaseStudyCard";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { caseStudies } from "@/lib/site-data";

export function CaseStudiesPreview() {
  return (
    <CinematicSection className="bg-[#050505] px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Case Studies"
          title="Selected Work"
          subtitle="A look at how we turn complex challenges into measurable outcomes."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study, i) => (
            <Reveal key={study.slug} delay={i * 0.06} className="h-full">
              <CaseStudyCard study={study} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14 flex justify-center">
          <PillButton to="/case-studies" variant="secondary">
            View All Case Studies
          </PillButton>
        </Reveal>
      </div>
    </CinematicSection>
  );
}

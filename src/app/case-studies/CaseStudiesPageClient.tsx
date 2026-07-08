"use client";

import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { CaseStudyCard } from "@/components/ui/CaseStudyCard";
import { caseStudies } from "@/lib/site-data";

export default function CaseStudiesPageClient() {
  return (
    <>
      <PageHero label="Our Work" title="Outcomes We're Proud Of" subtitle="A closer look at how we approach problems — and the measurable results we deliver.">
        <PillButton href="/contact" variant="primary">Build a Similar Solution</PillButton>
      </PageHero>
      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Case Studies" title="Selected Projects" subtitle="Real challenges, thoughtful solutions, and outcomes that matter." />
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study, i) => (
              <Reveal key={study.slug} delay={(i % 3) * 0.06}><CaseStudyCard study={study} /></Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABand title="Have a Similar Challenge?" subtitle="Let's talk about how we can build a solution tailored to your business.">
        <PillButton href="/contact" variant="primary">Build a Similar Solution</PillButton>
      </CTABand>
    </>
  );
}

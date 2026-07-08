"use client";

import { useState } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { TeamCard } from "@/components/team/TeamCard";
import { TeamModal } from "@/components/team/TeamModal";
import { founders, coreTeam, interns, type TeamMember } from "@/lib/team-data";

export default function OurTeamPageClient() {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <>
      <PageHero label="OUR PEOPLE" title="The Minds Behind Dimisi Technologies" subtitle="Behind every successful product is a team driven by curiosity, engineering excellence, and a shared vision to build technology that creates real-world impact." />

      <section className="px-4 pb-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal><SectionHeading label="Leadership" title="Founders" /></Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((member, i) => (<TeamCard key={member.name} member={member} index={i} onOpen={setSelected} />))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal><SectionHeading label="The Builders" title="Core Team" /></Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreTeam.map((member, i) => (<TeamCard key={member.name} member={member} index={i} onOpen={setSelected} />))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal><SectionHeading label="Rising Talent" title="Interns" /></Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interns.map((member, i) => (<TeamCard key={member.name} member={member} index={i} onOpen={setSelected} />))}
          </div>
        </div>
      </section>

      <CTABand title="Build the Future With Us" subtitle="Invite talented engineers, designers, and innovators to join Dimisi Technologies.">
        <PillButton href="/careers" variant="primary">View Careers</PillButton>
        <PillButton href="/contact" variant="secondary" withArrow={false}>Contact Us</PillButton>
      </CTABand>

      <TeamModal member={selected} onClose={() => setSelected(null)} />
    </>
  );
}

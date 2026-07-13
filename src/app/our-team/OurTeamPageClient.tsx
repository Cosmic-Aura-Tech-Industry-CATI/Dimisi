"use client";

import Image from "next/image";
import { useState } from "react";
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
      <section className="relative overflow-hidden px-4 pt-32 pb-16 md:px-8 md:pt-36 lg:px-12 lg:pt-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative h-[420px] overflow-hidden rounded-[2rem] border border-foreground/10 bg-[#0a0a0a] shadow-[inset_0_0_240px_rgba(255,255,255,0.06)] sm:h-[520px]">
            <Image
              src="/Bhootdev Our team.svg"
              alt="Bhootdev Our team"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover object-center"
            />
          </div>

          <div className="relative z-10 text-center lg:text-left">
            <div className="mx-auto max-w-3xl lg:mx-0">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-2xl ring-1 ring-white/10 sm:p-10">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-foreground/40">OUR PEOPLE</p>
                <h1 className="font-light leading-[1.08] tracking-tight text-foreground [font-size:clamp(34px,6vw,60px)]">
                  The Minds Behind Dimisi Technologies
                </h1>
                <p className="mt-6 text-base leading-relaxed text-foreground/50 sm:text-lg">
                  Behind every successful product is a team driven by curiosity, engineering excellence, and a shared vision to build technology that creates real-world impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

"use client";

import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { Highlights } from "@/components/sections/Highlights";
import {
  Compass,
  Eye,
  HeartHandshake,
  Lock,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Mission",
    body: "To help businesses and startups build scalable, intelligent, and future-ready digital products.",
  },
  {
    icon: Eye,
    title: "Vision",
    body: "To be a trusted technology partner known for product thinking, craft, and lasting impact.",
  },
  {
    icon: Compass,
    title: "Our Story",
    body: "Founded by builders who love shipping, Dimisi grew from freelance projects into a full-stack studio and product company.",
  },
];

const values = [
  {
    icon: Users,
    title: "Leadership",
    body: "A hands-on team of engineers, designers, and strategists who lead by building.",
  },
  {
    icon: HeartHandshake,
    title: "Team",
    body: "Multi-disciplinary talent spanning frontend, backend, AI, cloud, and design.",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    body: "Security-first engineering with best practices baked into every layer.",
  },
  {
    icon: LifeBuoy,
    title: "Support",
    body: "Long-term partnership with ongoing monitoring, iteration, and care.",
  },
  {
    icon: Lock,
    title: "Privacy",
    body: "We respect data and build with privacy and compliance in mind.",
  },
  {
    icon: Sparkles,
    title: "Work Culture",
    body: "A curious, innovation-focused culture that treats every project as a chance to grow.",
  },
];

export default function AboutPageClient() {
  return (
    <>
      <PageHero
        label="About Us"
        title="A Studio That Thinks Like a Product Company"
        subtitle="Dimisi Technologies blends engineering depth, design craft, and product thinking to build technology that lasts."
      >
        <PillButton href="/careers" variant="secondary">
          Join Our Team
        </PillButton>
      </PageHero>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Who We Are"
            title="Building the Future, One Product at a Time"
            subtitle="We're a team of makers who care deeply about outcomes — for our clients, our products, and the people who use them."
          />
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-foreground/10 p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02]">
                  <p.icon className="mb-4 h-6 w-6 text-foreground/60" />
                  <h3 className="text-lg font-medium text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/50">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Highlights />

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="What We Stand For"
            title="Values That Guide Our Work"
            subtitle="The principles that shape how we build, support, and grow."
          />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl border border-foreground/10 p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02]">
                  <v.icon className="mb-4 h-6 w-6 text-foreground/60" />
                  <h3 className="text-lg font-medium text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/50">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Want to Build With Us?"
        subtitle="We're always looking for talented people and interesting problems."
      >
        <PillButton href="/careers" variant="primary">
          View Open Roles
        </PillButton>
        <PillButton href="/contact" variant="secondary">
          Contact Us
        </PillButton>
      </CTABand>
    </>
  );
}

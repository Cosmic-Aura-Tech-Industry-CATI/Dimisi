"use client";

import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { FAQ } from "@/components/ui/FAQ";
import { CTABand } from "@/components/ui/CTABand";
import { TechEcosystem } from "@/components/sections/TechEcosystem";
import { StepFlow } from "@/components/ui/StepFlow";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { services } from "@/lib/site-data";

const approach = [
  "Requirement Analysis",
  "Planning & Strategy",
  "UI/UX Design",
  "Development",
  "Testing & QA",
  "Deployment",
  "Support",
];

const faqs = [
  {
    question: "How do you scope and price a project?",
    answer:
      "We start with a discovery session to understand your goals, then propose a phased plan with clear milestones and transparent pricing.",
  },
  {
    question: "Do you work with early-stage startups?",
    answer:
      "Absolutely. We offer startup-friendly, lean engagements designed to get you to an MVP and product-market fit quickly.",
  },
  {
    question: "Can you take over an existing codebase?",
    answer:
      "Yes. We regularly audit, refactor, and extend existing systems while keeping them stable and shippable.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We provide ongoing support, monitoring, and iteration so your product keeps improving long after go-live.",
  },
];

export default function ServicesPageClient() {
  return (
    <>
      <PageHero
        label="Our Services"
        title="Technology Services That Move Businesses Forward"
        subtitle="From idea to launch and beyond — we design, build, and scale digital solutions across every layer of your business."
      >
        <PillButton href="/contact" variant="primary">
          Start Your Project
        </PillButton>
        <PillButton href="/products" variant="secondary">
          See Our Products
        </PillButton>
      </PageHero>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Introduction"
            title="A Full-Stack Technology Partner"
            subtitle="We bring product thinking, engineering depth, and design craft to every engagement — so you get solutions that actually ship and scale."
          />

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={(i % 3) * 0.06}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-foreground/10 p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02] hover:-translate-y-1"
                >
                  <service.icon className="mb-4 h-6 w-6 text-foreground/60 transition-colors group-hover:text-foreground/80" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/50">{service.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Development Approach"
            title="A Clear Path From Idea to Launch"
            subtitle="A proven, transparent process that keeps you informed at every step."
          />
          <StepFlow steps={approach} />
        </div>
      </section>

      <TechEcosystem />
      <WhyChoose />

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            align="center"
            label="FAQ"
            title="Frequently Asked Questions"
            className="mb-14"
          />
          <FAQ items={faqs} />
        </div>
      </section>

      <CTABand
        title="Ready to Start Your Project?"
        subtitle="Tell us what you're building and we'll help you get there."
      >
        <PillButton href="/contact" variant="primary">
          Start Your Project
        </PillButton>
      </CTABand>
    </>
  );
}

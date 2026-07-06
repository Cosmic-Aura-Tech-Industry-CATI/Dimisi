import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { StepFlow } from "@/components/ui/StepFlow";
import { GraduationCap, HeartPulse, Home, Laptop, Plane, Plus, Trophy } from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Dimisi Technologies" },
      {
        name: "description",
        content:
          "Join Dimisi Technologies. Explore open roles in engineering, design, AI, marketing, and customer success.",
      },
      { property: "og:title", content: "Careers — Dimisi Technologies" },
      {
        property: "og:description",
        content: "Build the future with us — explore open positions at Dimisi Technologies.",
      },
    ],
  }),
  component: CareersPage,
});

const openings = [
  {
    title: "Senior Software Engineer",
    type: "Full-time · Remote",
    team: "Engineering",
    description:
      "Architect and ship scalable web and backend systems, mentor engineers, and drive technical decisions across client and product work.",
  },
  {
    title: "UI/UX Designer",
    type: "Full-time · Hybrid",
    team: "Design",
    description:
      "Own end-to-end product design — research, wireframes, prototypes, and design systems that make complex products feel effortless.",
  },
  {
    title: "AI Automation Specialist",
    type: "Full-time · Remote",
    team: "AI",
    description:
      "Build LLM-powered assistants and automation pipelines, integrating practical AI into products and internal workflows.",
  },
  {
    title: "Digital Marketing Manager",
    type: "Full-time · Remote",
    team: "Marketing",
    description:
      "Lead SEO, content, and performance campaigns, turning data into growth for Dimisi and our clients.",
  },
  {
    title: "Customer Success Lead",
    type: "Full-time · Hybrid",
    team: "Customer Success",
    description:
      "Be the trusted partner for our clients — onboarding, support, and long-term relationships that drive retention and impact.",
  },
];

const process = ["Application", "Intro Call", "Technical / Portfolio", "Team Interview", "Offer"];

const benefits = [
  { icon: Home, title: "Remote-First", body: "Work from anywhere with flexible hours." },
  { icon: HeartPulse, title: "Health & Wellness", body: "Support for your physical and mental health." },
  { icon: GraduationCap, title: "Learning Budget", body: "Grow with courses, books, and conferences." },
  { icon: Plane, title: "Paid Time Off", body: "Generous, recharge-when-you-need-it leave." },
  { icon: Laptop, title: "Great Gear", body: "The tools and setup you need to do your best work." },
  { icon: Trophy, title: "Real Ownership", body: "Meaningful work with visible impact." },
];

function CareersPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <PageHero
        label="Careers"
        title="Build the Future With Us"
        subtitle="Join a curious, innovation-focused team where your work ships and your ideas matter."
      >
        <PillButton to="/contact" variant="primary">
          Apply Now
        </PillButton>
      </PageHero>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Open Positions"
            title="Roles We're Hiring For"
            subtitle="Don't see a perfect fit? Reach out anyway — we love meeting great people."
          />
          <div className="mt-14 flex flex-col gap-4">
            {openings.map((role, i) => {
              const isOpen = open === role.title;
              return (
                <Reveal key={role.title} delay={(i % 5) * 0.04}>
                  <div
                    className={`rounded-2xl border transition-colors duration-300 ${
                      isOpen
                        ? "border-foreground/30 bg-foreground/[0.03]"
                        : "border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : role.title)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 p-6 text-left"
                    >
                      <div>
                        <h3 className="text-lg font-medium text-foreground">{role.title}</h3>
                        <p className="mt-1 text-sm text-foreground/50">
                          {role.team} · {role.type}
                        </p>
                      </div>
                      <Plus
                        className={`h-5 w-5 shrink-0 text-foreground/40 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <p className="max-w-2xl text-sm leading-relaxed text-foreground/60">
                              {role.description}
                            </p>
                            <div className="mt-6">
                              <PillButton to="/contact" variant="primary">
                                Apply Now
                              </PillButton>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Recruitment Process"
            title="How Hiring Works"
            subtitle="A simple, respectful process designed to get to know each other."
          />
          <StepFlow steps={process} />
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Culture & Benefits"
            title="A Place to Do Your Best Work"
            subtitle="We invest in our people with a culture and benefits built for the long run."
          />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl border border-foreground/10 p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02]">
                  <b.icon className="mb-4 h-6 w-6 text-foreground/60" />
                  <h3 className="text-lg font-medium text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/50">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to Join Us?"
        subtitle="Send us your details and tell us what you'd love to work on."
      >
        <PillButton to="/contact" variant="primary">
          Apply Now
        </PillButton>
      </CTABand>
    </>
  );
}

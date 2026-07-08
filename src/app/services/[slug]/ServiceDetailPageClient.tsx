"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { FAQ } from "@/components/ui/FAQ";
import { CTABand } from "@/components/ui/CTABand";
import { StepFlow } from "@/components/ui/StepFlow";
import type { Service } from "@/lib/site-data";
import { services } from "@/lib/site-data";
import type { ServiceDetail } from "@/lib/detail-data";
import { serviceDetails, developmentProcess } from "@/lib/detail-data";
import { ArrowLeft, Check, Users } from "lucide-react";

export default function ServiceDetailPageClient({ slug }: { slug: string }) {
  const service = services.find((s) => s.slug === slug) as Service;
  const detail = serviceDetails[slug] as ServiceDetail;

  const Icon = service.icon;

  return (
    <>
      <PageHero label="Service" title={service.title} subtitle={detail.tagline}>
        <PillButton href="/contact" variant="primary">
          Start Your Project
        </PillButton>
        <PillButton href="/services" variant="secondary" withArrow={false}>
          <ArrowLeft className="h-4 w-4" /> All Services
        </PillButton>
      </PageHero>

      {/* Overview */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-center rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-foreground/10 text-foreground/70">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-6 font-light leading-[1.1] tracking-tight text-foreground [font-size:clamp(24px,3vw,34px)]">
                Service Overview
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-foreground/60">{detail.overview}</p>
            <div className="mt-8 rounded-2xl border border-foreground/10 p-6">
              <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/40">
                <Users className="h-4 w-4" /> Who This Is For
              </p>
              <ul className="space-y-3">
                {detail.whoFor.map((who) => (
                  <li key={who} className="flex items-start gap-3 text-sm text-foreground/60">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" />
                    {who}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problems + Solutions */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-foreground/10 p-8">
              <h3 className="text-xl font-medium text-foreground">Business Problems Solved</h3>
              <ul className="mt-6 space-y-4">
                {detail.problems.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm leading-relaxed text-foreground/60"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8">
              <h3 className="text-xl font-medium text-foreground">Solutions Offered</h3>
              <ul className="mt-6 space-y-4">
                {detail.solutions.map((s, i) => (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm leading-relaxed text-foreground/70"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" />
                    {s}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Development Process */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            align="center"
            label="Development Process"
            title="How We Deliver"
            subtitle="A clear, transparent path from first conversation to long-term support."
            className="mb-4"
          />
          <StepFlow steps={developmentProcess} />
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Technology" title="Tools We Use" />
          <div className="mt-10 flex flex-wrap gap-3">
            {detail.tech.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="rounded-full border border-foreground/15 px-5 py-2.5 text-sm text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" label="FAQ" title="Common Questions" className="mb-14" />
          <FAQ items={detail.faqs} />
        </div>
      </section>

      {/* Related services */}
      <section className="bg-[#050505] px-4 pb-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-foreground/40">
            Explore More Services
          </p>
          <div className="flex flex-wrap gap-3">
            {services
              .filter((s) => s.slug !== service.slug)
              .slice(0, 5)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="rounded-full border border-foreground/15 px-4 py-2 text-sm text-foreground/60 transition-all hover:scale-105 hover:border-foreground/40 hover:text-foreground"
                >
                  {s.title}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to Get Started?"
        subtitle={`Let's talk about how ${service.title} can move your business forward.`}
      >
        <PillButton href="/contact" variant="primary">
          Start Your Project
        </PillButton>
      </CTABand>
    </>
  );
}

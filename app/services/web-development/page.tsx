"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const highlights = [
  {
    title: "Business-first planning",
    description: "Requirements are translated into practical roadmaps with clear scope, milestones, and delivery timelines.",
    icon: LayoutDashboard,
  },
  {
    title: "Engineering quality",
    description: "Maintainable architecture, review workflows, and automated testing built into the project lifecycle.",
    icon: Code2,
  },
  {
    title: "Performance & reliability",
    description: "Core Web Vitals optimization, caching strategy, and monitoring for stable production behavior.",
    icon: Gauge,
  },
  {
    title: "Security standards",
    description: "Secure coding practices, role-based access, and environment-level controls from day one.",
    icon: ShieldCheck,
  },
];

const deliverables = [
  "Marketing websites with CMS integration",
  "SaaS dashboards and customer portals",
  "API development and third-party integrations",
  "Migration and modernization of legacy apps",
  "Ongoing support, updates, and optimization",
];

const workflow = [
  {
    step: "01",
    title: "Discovery",
    description: "We align on business goals, user roles, existing systems, and release priorities.",
  },
  {
    step: "02",
    title: "Design & Architecture",
    description: "User flows, interface design, and technical architecture are validated before build.",
  },
  {
    step: "03",
    title: "Development",
    description: "Feature delivery in sprint cycles with frequent demos, QA, and transparent reporting.",
  },
  {
    step: "04",
    title: "Launch & Support",
    description: "Deployment, monitoring, handover documentation, and post-launch improvement roadmap.",
  },
];

const stack = ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "CI/CD"];

export default function WebDevelopmentServicePage() {
  return (
    <main className="pt-32 md:pt-36 pb-20 md:pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center"
        >
          <div>
            <p className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-blue-500/10 text-blue-500 text-xs sm:text-sm font-semibold tracking-wide mb-5">
              <Code2 size={16} /> Web Development
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Web platforms engineered for growth, performance, and long-term maintainability
            </h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mb-8">
              We build production-ready websites and web applications for teams that need reliable delivery and measurable outcomes.
              Our approach combines product thinking, strong engineering standards, and responsive support after launch.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="btn-primary rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold inline-flex items-center gap-2"
              >
                Discuss Your Project <ArrowRight size={18} />
              </Link>
              <Link
                href="/services"
                className="glass rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold border border-border inline-flex items-center gap-2"
              >
                View All Services
              </Link>
            </div>
          </div>

          <div className="glass border border-border rounded-2xl sm:rounded-3xl overflow-hidden">
            <Image
              src="/Features-Image2.png"
              alt="Team discussion on product roadmap and architecture"
              width={1200}
              height={900}
              className="w-full h-[240px] sm:h-[300px] lg:h-[360px] object-cover"
              priority
            />
          </div>
        </motion.section>

        <section className="mt-14 md:mt-18 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="glass border border-border rounded-2xl p-5 sm:p-6">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-sm sm:text-base text-muted leading-relaxed">{item.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">What we typically deliver</h2>
            <ul className="space-y-4">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 mt-1" />
                  <span className="text-sm sm:text-base text-muted leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Core technical capabilities</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Database size={20} className="text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Data & API Architecture</h3>
                  <p className="text-sm sm:text-base text-muted">Robust backend and API design for secure data exchange and system interoperability.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cloud size={20} className="text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Cloud Deployment</h3>
                  <p className="text-sm sm:text-base text-muted">Environment strategy, CI/CD pipelines, and scalable hosting aligned with cost and uptime targets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wrench size={20} className="text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Maintenance & Optimization</h3>
                  <p className="text-sm sm:text-base text-muted">Bug fixes, performance improvements, and incremental feature work after go-live.</p>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-16 md:mt-20 grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-8">
          <article className="glass border border-border rounded-2xl sm:rounded-3xl overflow-hidden">
            <Image
              src="/Features-Image3.png"
              alt="Developers reviewing code and implementation roadmap"
              width={1200}
              height={900}
              className="w-full h-[260px] sm:h-[320px] object-cover"
            />
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Technology stack</h2>
              <div className="flex flex-wrap gap-2.5">
                {stack.map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full text-sm border border-border bg-foreground/5">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">How we run projects</h2>
            <div className="space-y-5">
              {workflow.map((item) => (
                <div key={item.step} className="grid grid-cols-[52px_1fr] gap-3 sm:gap-4">
                  <div className="text-blue-500 font-bold text-lg sm:text-xl">{item.step}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm sm:text-base text-muted leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-16 md:mt-20">
          <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Need a reliable web development partner?</h2>
            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-3xl mx-auto mb-7">
              Share your requirements and we will return with a practical approach, delivery phases, and team recommendation.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="btn-primary rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 font-semibold inline-flex items-center gap-2"
              >
                Book Consultation <ArrowRight size={18} />
              </Link>
              <Link
                href="/support"
                className="glass rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 font-semibold border border-border inline-flex items-center gap-2"
              >
                Support & Maintenance
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
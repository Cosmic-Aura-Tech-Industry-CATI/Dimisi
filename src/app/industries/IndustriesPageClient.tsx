"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { industries } from "@/lib/site-data";

type IndustryDetail = { challenges: string[]; solutions: string[]; services: string[]; products: string[] };

const details: Record<string, IndustryDetail> = {
  Education: { challenges: ["Fragmented learning tools and low student engagement", "Manual administration and reporting overhead"], solutions: ["Unified LMS with interactive, mobile-first learning", "Automated grading, attendance, and analytics"], services: ["Web Development", "Mobile App Development", "UI/UX Design"], products: ["Axis Conference Web"] },
  Healthcare: { challenges: ["Sensitive patient data and strict compliance needs", "Disconnected records and slow patient workflows"], solutions: ["Secure, compliant systems with role-based access", "Telemedicine and unified patient record platforms"], services: ["Software Development", "Cloud Services", "IT Support & Maintenance"], products: ["Axis Conference Web"] },
  Retail: { challenges: ["Stockouts from disconnected inventory systems", "Inconsistent in-store and online experiences"], solutions: ["Unified POS, inventory, and omnichannel storefronts", "Real-time dashboards for stock and sales"], services: ["Web Development", "Cloud Services", "AI & Automation"], products: ["Sylon"] },
  "E-Commerce": { challenges: ["Low conversion and cart abandonment", "Scaling checkout and catalog under load"], solutions: ["Conversion-focused storefronts and fast checkout", "Scalable, cloud-native commerce infrastructure"], services: ["Web Development", "UI/UX Design", "Digital Marketing"], products: ["Sylon"] },
  Startups: { challenges: ["Limited runway and pressure to ship fast", "Uncertain product-market fit"], solutions: ["Lean MVPs and rapid, iterative prototyping", "Scalable foundations that grow with you"], services: ["Startup Mentorship", "Software Development", "UI/UX Design"], products: ["Kalesh", "CarryOn"] },
  SaaS: { challenges: ["Multi-tenant complexity and billing edge cases", "Support load that scales with users"], solutions: ["Robust multi-tenant architecture and billing", "AI-assisted support and analytics dashboards"], services: ["Software Development", "AI & Automation", "Cloud Services"], products: ["Axis Conference Web", "Sylon"] },
  Enterprise: { challenges: ["Legacy systems and complex integrations", "Change management across large teams"], solutions: ["Digital transformation with phased rollouts", "Secure integrations and scalable architecture"], services: ["IT Consulting", "Cloud Services", "IT Support & Maintenance"], products: ["Axis Conference Web"] },
  Finance: { challenges: ["High security and regulatory demands", "Slow, fragmented reporting and analytics"], solutions: ["Secure transaction infrastructure and audit trails", "Real-time dashboards and data pipelines"], services: ["Software Development", "Cloud Services", "AI & Automation"], products: ["Axis Conference Web"] },
};

function DetailBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-foreground/40">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (<li key={it} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/60"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />{it}</li>))}
      </ul>
    </div>
  );
}

function IndustryCard({
  industry,
  isOpen,
  detail,
  onToggle,
}: {
  industry: (typeof industries)[number];
  isOpen: boolean;
  detail: IndustryDetail | undefined;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-smoothed tilt — enhanced range for a more pronounced effect
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [20, -20]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-20, 20]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );

  // Cursor-tracked glare
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), transparent 60%)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-colors duration-300 ${isOpen ? "border-foreground/30 bg-foreground/[0.03] sm:col-span-2" : "border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02]"}`}
    >
      {/* glare that tracks the cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glareBackground }}
      />

      <motion.button
        layout="position"
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <industry.icon className="mb-4 h-6 w-6 text-foreground/60 transition-colors group-hover:text-foreground/80" />
          <h3 className="text-lg font-medium text-foreground">{industry.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/50">{industry.description}</p>
        </div>
        <Plus className={`mt-1 h-5 w-5 shrink-0 text-foreground/40 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && detail ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative overflow-hidden"
          >
            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-foreground/10 pt-6 sm:grid-cols-2">
              <DetailBlock label="Common Challenges" items={detail.challenges} />
              <DetailBlock label="Recommended Solutions" items={detail.solutions} />
              <DetailBlock label="Relevant Services" items={detail.services} />
              <DetailBlock label="Related Products" items={detail.products} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function IndustriesPageClient() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <PageHero label="Industries" title="Solutions Tailored to Your Industry" subtitle="We bring domain-aware technology to the sectors we serve — building systems that fit how your business actually works.">
        <PillButton href="/contact" variant="primary">Discuss Your Business Requirements</PillButton>
      </PageHero>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl text-left">
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              Sectors We Serve
            </span>

            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Domain Expertise, Applied
            </h2>

            <p className="mt-4 text-base leading-relaxed text-foreground/50 md:text-lg">
              Tap any industry to explore its challenges, our solutions, and the services and products that fit.
            </p>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            style={{ perspective: 1000 }}
          >
            {industries.map((industry, i) => {
              const isOpen = open === industry.name;
              const detail = details[industry.name];
              return (
                <Reveal key={industry.name} delay={(i % 4) * 0.06}>
                  <IndustryCard
                    industry={industry}
                    isOpen={isOpen}
                    detail={detail}
                    onToggle={() => setOpen(isOpen ? null : industry.name)}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CTABand title="Don't See Your Industry?" subtitle="We work across domains. Tell us about your business and let's explore what's possible.">
        <PillButton href="/contact" variant="primary">Discuss Your Requirements</PillButton>
      </CTABand>
    </>
  );
}
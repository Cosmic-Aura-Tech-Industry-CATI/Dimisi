"use client";

import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/lib/site-data";
import { Sparkles } from "lucide-react";

const upcoming = ["Analytics Suite", "Developer Tooling", "AI Assistant Platform"];

export default function ProductsPageClient() {
  return (
    <>
      <PageHero label="Our Products" title="Digital Products, Built In-House" subtitle="We don't just build for clients — we design and ship our own products, solving real problems for real people.">
        <PillButton href="/contact" variant="primary">Explore Our Product Ecosystem</PillButton>
      </PageHero>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Overview" title="A Growing Product Ecosystem" subtitle="Each product reflects our belief in product thinking, thoughtful design, and scalable engineering." />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (<Reveal key={product.slug} delay={i * 0.06}><ProductCard product={product} /></Reveal>))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Upcoming" title="What We're Building Next" subtitle="A glimpse at products currently in exploration and early development." />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {upcoming.map((name, i) => (
              <Reveal key={name} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-dashed border-foreground/15 p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02]">
                  <Sparkles className="mb-4 h-6 w-6 text-foreground/40" />
                  <h3 className="text-lg font-medium text-foreground">{name}</h3>
                  <p className="mt-2 text-sm text-foreground/40">Coming soon</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand title="Want to Partner or Learn More?" subtitle="Reach out to explore collaborations, integrations, or early access.">
        <PillButton href="/contact" variant="primary">Get in Touch</PillButton>
      </CTABand>
    </>
  );
}

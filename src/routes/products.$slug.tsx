import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { CTABand } from "@/components/ui/CTABand";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Product } from "@/lib/site-data";
import { products } from "@/lib/site-data";
import type { ProductDetail } from "@/lib/detail-data";
import { productDetails } from "@/lib/detail-data";
import { ArrowLeft, Check, Monitor } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    const detail = productDetails[params.slug];
    if (!product || !detail) throw notFound();
    // Return only serializable data; non-serializable icons are derived in the component.
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    const detail = productDetails[params.slug];
    if (!product || !detail) {
      return {
        meta: [
          { title: "Product Not Found — Dimisi Technologies" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${product.name} — Dimisi Technologies` },
        { name: "description", content: detail.intro },
        { property: "og:title", content: `${product.name} — Dimisi Technologies` },
        { property: "og:description", content: detail.intro },
      ],
    };
  },
  component: ProductDetailPage,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-light text-foreground">Product not found</h1>
      <p className="mt-3 text-sm text-foreground/50">This product doesn't exist or has moved.</p>
      <div className="mt-8">
        <PillButton to="/products" variant="secondary">
          Back to Products
        </PillButton>
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const product = products.find((p) => p.slug === slug) as Product;
  const detail = productDetails[slug] as ProductDetail;

  const Icon = product.icon;

  return (
    <>
      <PageHero label={product.category} title={product.name} subtitle={detail.intro}>
        <PillButton to="/contact" variant="primary">
          {detail.cta}
        </PillButton>
        <PillButton to="/products" variant="secondary" withArrow={false}>
          <ArrowLeft className="h-4 w-4" /> All Products
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
              <p className="mt-6 text-xs uppercase tracking-wider text-foreground/40">
                {product.status}
              </p>
              <h2 className="mt-2 font-light leading-[1.1] tracking-tight text-foreground [font-size:clamp(24px,3vw,34px)]">
                {product.tagline}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-foreground/60">{detail.overview}</p>
          </Reveal>
        </div>
      </section>

      {/* Problem + Solution */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-foreground/10 p-8">
              <h3 className="text-xl font-medium text-foreground">The Problem</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/60">{detail.problem}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8">
              <h3 className="text-xl font-medium text-foreground">Our Solution</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/70">{detail.solution}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Features" title="Key Features" />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {detail.features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <TiltCard className="h-full" max={6}>
                    <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]">
                      <FIcon className="mb-4 h-6 w-6 text-foreground/60" />
                      <h4 className="text-base font-medium text-foreground">{f.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/50">
                        {f.description}
                      </p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits + Audience */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <div className="h-full rounded-3xl border border-foreground/10 p-8">
              <h3 className="text-xl font-medium text-foreground">Benefits</h3>
              <ul className="mt-6 space-y-4">
                {detail.benefits.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm leading-relaxed text-foreground/70"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" />
                    {b}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8">
              <h3 className="text-xl font-medium text-foreground">Target Audience</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/60">{detail.audience}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Demo mockup */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" label="Preview" title="A Look Inside" className="mb-12" />
          <Reveal>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
              <div className="flex items-center gap-2 border-b border-foreground/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-foreground/15" />
                <span className="h-3 w-3 rounded-full bg-foreground/15" />
                <span className="h-3 w-3 rounded-full bg-foreground/15" />
              </div>
              <div className="flex aspect-[16/9] items-center justify-center">
                <div className="flex flex-col items-center text-foreground/30">
                  <Monitor className="h-10 w-10" />
                  <p className="mt-3 text-xs uppercase tracking-widest">Demo coming soon</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Roadmap timeline */}
      <section className="bg-[#050505] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Roadmap" title="What's Next" />
          <div className="relative mt-14 border-l border-foreground/15 pl-8">
            {detail.roadmap.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pb-10 last:pb-0"
              >
                <span className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full border border-foreground/30 bg-[#050505]">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
                </span>
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">{r.phase}</p>
                <h4 className="mt-2 text-lg font-medium text-foreground">{r.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-foreground/50">{r.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related products */}
      <section className="bg-[#050505] px-4 pb-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-foreground/40">Other Products</p>
          <div className="flex flex-wrap gap-3">
            {products
              .filter((p) => p.slug !== product.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-full border border-foreground/15 px-4 py-2 text-sm text-foreground/60 transition-all hover:scale-105 hover:border-foreground/40 hover:text-foreground"
                >
                  {p.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <CTABand title={`Interested in ${product.name}?`} subtitle="Get early access, a demo, or partner with us.">
        <PillButton to="/contact" variant="primary">
          {detail.cta}
        </PillButton>
      </CTABand>
    </>
  );
}

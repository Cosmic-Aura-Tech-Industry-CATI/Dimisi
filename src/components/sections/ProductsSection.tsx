// ProductsSection.tsx — Homepage section displaying in-house products (Kalesh, CarryOn, Sylon, Axis) in dynamic grid cards.
import { motion } from "motion/react";

import { products } from "@/lib/site-data";
import {
  OutlineButton,
  ParallaxSection,
  SectionHeading,
  TiltCard,
} from "./section-kit";

export function ProductsSection() {
  return (
    <ParallaxSection id="products" className="py-14 md:py-20">
      {(style) => (
        <motion.div
          style={style}
          className="mx-auto max-w-7xl px-4 md:px-6"
        >
          <SectionHeading
            label="Our Products"
            title="Products We Build"
            subtitle="Digital products crafted in-house — from social platforms to secure enterprise tooling."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <TiltCard
                  key={product.slug}
                  className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 transition-colors hover:border-foreground/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03]">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="rounded-full border border-foreground/15 px-3 py-1 text-[11px] uppercase tracking-widest text-foreground/50">
                      {product.status}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-light text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/60">{product.tagline}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/50">
                    {product.description}
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-widest text-foreground/40">
                    {product.category}
                  </p>
                </TiltCard>
              );
            })}
          </motion.div>

          <div className="mt-14 flex justify-center">
            <OutlineButton>Explore All Products</OutlineButton>
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}

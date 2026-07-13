"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/lib/site-data";

const kaleshProduct = products.find((product) => product.slug === "kalesh");

export default function ProductsPageClient() {
  if (!kaleshProduct) return null;

  return (
    <section className="bg-[#050505] px-4 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Our Product"
          title="Kalesh"
          subtitle="A social platform reimagining how communities connect, debate, and share ideas in real time."
        />

        <div className="mt-14 flex justify-center">
          <Reveal delay={0.08}>
            <div className="w-full max-w-2xl">
              <ProductCard product={kaleshProduct} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

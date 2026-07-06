import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillButton } from "@/components/ui/PillButton";
import { ProductCard } from "@/components/ui/ProductCard";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { products } from "@/lib/site-data";

export function ProductsSection() {
  return (
    <CinematicSection className="bg-[#050505] px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Our Products"
          title="Products We Build In-House"
          subtitle="Beyond client work, we design and ship our own digital products — solving real problems for real people."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.06} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14 flex justify-center">
          <PillButton to="/products" variant="secondary">
            Explore All Products
          </PillButton>
        </Reveal>
      </div>
    </CinematicSection>
  );
}

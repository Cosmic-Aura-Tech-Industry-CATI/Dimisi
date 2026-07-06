import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/Hero";
import { ProductsSection } from "@/components/ProductsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TechStackSection } from "@/components/TechStackSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { HighlightsSection } from "@/components/HighlightsSection";
import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import { ContactSection } from "@/components/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dimisi Technologies — Digital Products & Intelligent Solutions" },
      {
        name: "description",
        content:
          "Dimisi Technologies builds scalable websites, applications, AI-powered solutions, and digital products that drive innovation, growth, and operational efficiency.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <Hero />
      <ProductsSection />
      <ServicesSection />
      <TechStackSection />
      <WhyChooseSection />
      <HighlightsSection />
      <CaseStudiesSection />
      <ContactSection />
    </div>
  );
}

"use client";

import { Hero } from "@/components/sections/Hero";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { HighlightsSection } from "@/components/sections/HighlightsSection";
import { CaseStudiesSection } from "@/components/sections/CaseStudiesSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
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

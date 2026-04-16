import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Features from "@/components/Features";
import FeatureGrid from "@/components/FeatureGrid";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Brands />
      <Features />
      <FeatureGrid />
      <Testimonials />
      <CTA />
    </main>
  );
}

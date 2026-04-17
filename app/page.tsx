import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Features from "@/components/Features";
import FeatureGrid from "@/components/FeatureGrid";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/form";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Brands />
      <Features />
      <FeatureGrid />
      <Testimonials />
      <Contact />
    </main>
  );
}
